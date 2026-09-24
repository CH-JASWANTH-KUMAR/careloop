"use client";

import React, { useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";

const emptySubscribe = () => () => {};
import {
  ShieldCheck,
  CheckCircle2,
  RotateCcw,
  ArrowRight,
  CreditCard,
  Truck,
  PhoneCall,
  X,
} from "lucide-react";
import { useCareLoop } from "@/providers/AppProvider";
import { LogisticsLifecycleStatus } from "@/types/providers";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { FailureStateCard } from "@/components/shared/FailureStateCard";

interface RefillWorkflowModalProps {
  isOpen: boolean;
  onClose: () => void;
  medicationId?: string;
}

const CHECKPOINTS: { status: LogisticsLifecycleStatus; label: string; time: string; note: string }[] = [
  {
    status: "ORDER_CREATED",
    label: "Order Created",
    time: "09:41 AM",
    note: "Prescription validated. Parcel packaged at Apollo Pharmacy Jubilee Hills.",
  },
  {
    status: "PICKUP_SCHEDULED",
    label: "Courier Assigned",
    time: "09:43 AM",
    note: "Delhivery courier assigned for pharmacy hub pickup.",
  },
  {
    status: "IN_TRANSIT",
    label: "In Transit",
    time: "10:15 AM",
    note: "Sorted at Hyderabad Central Logistics Hub (Cold-chain temp: 4.2°C).",
  },
  {
    status: "OUT_FOR_DELIVERY",
    label: "Out for Delivery",
    time: "02:30 PM",
    note: "Rider Suresh K. dispatched for doorstep delivery in Jubilee Hills.",
  },
  {
    status: "DELIVERED",
    label: "Delivered",
    time: "03:45 PM",
    note: "Delivered to Anita Rao at Jubilee Hills. Doorstep handover confirmed.",
  },
];

export function RefillWorkflowModal({
  isOpen,
  onClose,
  medicationId = "med-thyronorm",
}: RefillWorkflowModalProps) {
  const {
    medications,
    members,
    tasks,
    activeUser,
    refillMedication,
    advanceShipmentStep,
    completeDelivery,
    resetGoldenJourneyScenario,
    rejectMedicationAuthorization,
    transitionTaskState,
  } = useCareLoop();

  const med = medications.find((m) => m.id === medicationId) || medications[0];
  const patient = members.find((m) => m.id === med?.patientId) || members[0];
  const activeTask = tasks.find(
    (t) => t.relatedMedicationId === med?.id || (t.tags?.includes("Refill") && t.familyMemberId === patient?.id)
  );

  // Workflow state: REVIEW | AUTHORIZING | EXECUTING | TRACKING | COMPLETED | REJECTED | DEFERRED | PAYMENT_FAILED | DELIVERY_FAILED
  const [workflowState, setWorkflowState] = useState<
    | "REVIEW"
    | "AUTHORIZING"
    | "EXECUTING"
    | "TRACKING"
    | "COMPLETED"
    | "REJECTED"
    | "DEFERRED"
    | "PAYMENT_FAILED"
    | "DELIVERY_FAILED"
  >(() => {
    if (med?.currentStockUnits > 10) return "COMPLETED";
    if (activeTask?.status === "WAITING" || activeTask?.status === "WAITING_FOR_EXTERNAL") return "TRACKING";
    return "REVIEW";
  });

  const [currentStepIdx, setCurrentStepIdx] = useState(() => (activeTask?.status === "WAITING" ? 1 : 0));
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeReceiptId, setActiveReceiptId] = useState("SANDBOX-REC-PL-4821");
  const [activeAwbNumber, setActiveAwbNumber] = useState(
    () => activeTask?.externalRailRef?.referenceId || "SANDBOX-AWB-DL-882190"
  );

  // Escape key listener
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Lock background body scroll
  React.useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);

  if (!isOpen || !mounted || !med) return null;

  const handleApprove = async () => {
    setIsProcessing(true);
    setWorkflowState("EXECUTING");

    if (activeTask) {
      transitionTaskState(
        activeTask.id,
        "AUTHORIZED",
        `Human approval granted by ${activeUser.name} for ₹${med.costEstimate} refill.`,
        "Invoking Pine Labs payment rail"
      );
    }

    try {
      const res = await refillMedication(med.id);
      if (res) {
        if (res.auth.receipt?.receiptId) {
          setActiveReceiptId(res.auth.receipt.receiptId);
        }
        if (res.shipment.awbNumber) {
          setActiveAwbNumber(res.shipment.awbNumber);
        }
      }
      setTimeout(() => {
        setIsProcessing(false);
        setWorkflowState("TRACKING");
        setCurrentStepIdx(1); // Courier assigned
      }, 700);
    } catch {
      setIsProcessing(false);
      setWorkflowState("PAYMENT_FAILED");
    }
  };

  const handleAdvanceStep = async () => {
    setIsProcessing(true);
    const nextIdx = currentStepIdx + 1;
    if (nextIdx >= CHECKPOINTS.length - 1) {
      // Final delivery
      await completeDelivery(activeAwbNumber);
      setCurrentStepIdx(CHECKPOINTS.length - 1);
      setWorkflowState("COMPLETED");
      setIsProcessing(false);
    } else {
      const targetCheckpoint = CHECKPOINTS[nextIdx];
      await advanceShipmentStep(activeAwbNumber, targetCheckpoint.status);
      setCurrentStepIdx(nextIdx);
      setIsProcessing(false);
    }
  };

  const handleDeliverNow = async () => {
    setIsProcessing(true);
    await completeDelivery(activeAwbNumber);
    setCurrentStepIdx(CHECKPOINTS.length - 1);
    setWorkflowState("COMPLETED");
    setIsProcessing(false);
  };

  const handleReject = () => {
    if (activeTask) {
      transitionTaskState(
        activeTask.id,
        "REJECTED",
        "Coordinator verified stock was already purchased offline.",
        "Refill order canceled"
      );
    }
    rejectMedicationAuthorization("Coordinator noted that stock was already purchased offline");
    setWorkflowState("REJECTED");
  };

  const handleAskLater = () => {
    if (activeTask) {
      transitionTaskState(
        activeTask.id,
        "DEFERRED",
        "Coordinator deferred approval ('Ask me later'). Follow-up reminder queued.",
        "Reminder scheduled in 12 hours"
      );
    }
    setWorkflowState("DEFERRED");
  };

  const handleSimulatePaymentFailure = () => {
    if (activeTask) {
      transitionTaskState(
        activeTask.id,
        "FAILED",
        "Pine Labs gateway reported authorization timeout / card declined.",
        "Transaction rolled back"
      );
    }
    setWorkflowState("PAYMENT_FAILED");
  };

  const handleSimulateDeliveryFailure = () => {
    if (activeTask) {
      transitionTaskState(
        activeTask.id,
        "FAILED",
        "Delhivery courier reported security gate access denied or recipient unavailable.",
        "Shipment returned to hub"
      );
    }
    setWorkflowState("DELIVERY_FAILED");
  };

  const handleReset = () => {
    resetGoldenJourneyScenario();
    setWorkflowState("REVIEW");
    setCurrentStepIdx(0);
  };

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-950/65 backdrop-blur-xs overflow-hidden"
    >
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-2xl max-h-[calc(100dvh-2rem)] sm:max-h-[calc(100dvh-3.5rem)] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center font-bold text-xs">
              Rx
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-sm">
                  Medication Refill Workflow
                </h3>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 uppercase">
                  [SANDBOX / SIMULATED]
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {patient.name} • {med.name}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              title="Reset stock to 3 tablets and replay journey"
              className="flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-white transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5 text-teal-600" />
              <span>Reset Journey</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* STEP 1 & 2: CONTEXT / DETECTION */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Context &amp; Detection
              </span>
              <Badge variant={med.currentStockUnits <= 3 ? "urgent" : "neutral"} className="text-[10px]">
                {med.currentStockUnits} Tablets Remaining
              </Badge>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">
              <strong className="text-slate-900">{patient.name}</strong> has{" "}
              <strong>{med.currentStockUnits} tablets left</strong>. At her dosage of 1 tablet per day,
              that is <strong>{med.currentStockUnits} days of medication</strong>. The family safety
              threshold is 5 days. CareLoop identified the shortage and prepared a 60-day refill.
            </p>
          </div>

          {/* STEP 3 & 4: REVIEW & AUTHORIZATION */}
          {(workflowState === "REVIEW" || workflowState === "AUTHORIZING") && (
            <div className="space-y-4">
              <div className="rounded-xl border border-slate-200 p-4 bg-white space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Refill Plan Details
                </h4>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Medication</span>
                    <strong className="text-slate-900">{med.name} ({med.dosage})</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Order Quantity</span>
                    <strong className="text-slate-900">60 tablets (2-month bottle)</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Pharmacy</span>
                    <strong className="text-slate-900">{med.pharmacyName}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Prescription Ref</span>
                    <strong className="text-slate-900 font-mono">#RX-ANITA-2026 (Verified)</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Delivery Rail</span>
                    <strong className="text-slate-900">Delhivery Express Cold-Chain</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Total Cost</span>
                    <strong className="text-emerald-700 font-bold text-sm">₹{med.costEstimate}</strong>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500">
                  <strong>Data Shared:</strong> Prescription details and Jubilee Hills delivery address
                  with Apollo Pharmacy and Delhivery. No payment card details are transmitted unencrypted.
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200 space-y-3">
                <div className="flex items-start gap-2.5">
                  <ShieldCheck className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-xs text-amber-950">
                      Human Authorization Required
                    </div>
                    <p className="text-[11px] text-amber-800 mt-0.5">
                      You are authorizing a ₹{med.costEstimate} medication purchase for {patient.name} via
                      Pine Labs pre-authorized payment rail.
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <Button
                    variant="primary"
                    size="md"
                    onClick={handleApprove}
                    disabled={isProcessing}
                    className="bg-slate-900 hover:bg-slate-800 text-xs font-semibold px-4"
                  >
                    {isProcessing ? "Authorizing..." : `Approve ₹${med.costEstimate}`}
                  </Button>
                  <Button
                    variant="outline"
                    size="md"
                    onClick={handleReject}
                    disabled={isProcessing}
                    className="text-xs text-slate-700 hover:text-red-700"
                  >
                    Reject
                  </Button>
                  <Button
                    variant="ghost"
                    size="md"
                    onClick={handleAskLater}
                    disabled={isProcessing}
                    className="text-xs text-slate-500"
                  >
                    Ask me later
                  </Button>
                  <Button
                    variant="ghost"
                    size="md"
                    onClick={handleSimulatePaymentFailure}
                    disabled={isProcessing}
                    className="text-xs text-amber-800 hover:bg-amber-100/50"
                  >
                    Simulate Payment Decline
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: EXECUTING STATE */}
          {workflowState === "EXECUTING" && (
            <div className="p-8 text-center space-y-3">
              <div className="w-10 h-10 border-3 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto" />
              <h4 className="font-bold text-slate-900 text-sm">
                Executing Authorized Rails...
              </h4>
              <p className="text-xs text-slate-500">
                Capturing Pine Labs payment and creating Delhivery shipment...
              </p>
            </div>
          )}

          {/* STEP 6: TRACKING STATE */}
          {workflowState === "TRACKING" && (
            <div className="space-y-4">
              {/* Provider Receipts Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center gap-2 text-slate-700 font-semibold mb-1">
                    <CreditCard className="w-4 h-4 text-emerald-600" />
                    <span>Pine Labs Payment</span>
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono">
                    Receipt: {activeReceiptId}
                  </div>
                  <div className="text-[11px] text-emerald-700 font-bold mt-0.5">
                    ₹{med.costEstimate} Captured
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center gap-2 text-slate-700 font-semibold mb-1">
                    <Truck className="w-4 h-4 text-sky-600" />
                    <span>Delhivery Cold-Chain</span>
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono">
                    AWB: {activeAwbNumber}
                  </div>
                  <div className="text-[11px] text-sky-700 font-bold mt-0.5">
                    {CHECKPOINTS[currentStepIdx].label}
                  </div>
                </div>
              </div>

              {/* Courier Timeline Stepper */}
              {/* Delivery Tracking Banner */}
              <div className="flex items-center gap-3.5 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <Image
                  src="/images/illustrations/delivery-tracking.png"
                  alt="Delhivery Cold-Chain Logistics"
                  width={48}
                  height={48}
                  className="w-12 h-12 object-contain shrink-0"
                />
                <div className="text-xs">
                  <div className="font-bold text-slate-900">Delhivery Express Cold-Chain</div>
                  <div className="text-slate-500 text-[11px] leading-relaxed">
                    Active temperature telemetry (4.2°C logged) with doorstep handover protocol in Jubilee Hills.
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 p-4 bg-white space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Delivery Progression Timeline
                  </h4>
                  <span className="text-[10px] font-mono text-slate-400">
                    Step {currentStepIdx + 1} of {CHECKPOINTS.length}
                  </span>
                </div>

                <div className="space-y-3 pt-1">
                  {CHECKPOINTS.map((step, idx) => {
                    const isPassed = idx <= currentStepIdx;
                    const isCurrent = idx === currentStepIdx;
                    return (
                      <div key={step.status} className="flex items-start gap-3">
                        <div className="flex flex-col items-center">
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                              isPassed
                                ? "bg-emerald-600 text-white"
                                : "bg-slate-100 text-slate-400"
                            }`}
                          >
                            {isPassed ? "✓" : idx + 1}
                          </div>
                          {idx < CHECKPOINTS.length - 1 && (
                            <div
                              className={`w-0.5 h-6 ${
                                isPassed ? "bg-emerald-400" : "bg-slate-200"
                              }`}
                            />
                          )}
                        </div>

                        <div className="pb-1 text-xs">
                          <div className="flex items-center gap-2">
                            <span
                              className={`font-semibold ${
                                isCurrent ? "text-slate-900" : "text-slate-600"
                              }`}
                            >
                              {step.label}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {step.time}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">{step.note}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Simulation Advancement Controls */}
              <div className="flex items-center justify-between pt-2">
                <div className="text-xs text-slate-500">
                  Simulate courier movement:
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAdvanceStep}
                    disabled={isProcessing}
                    className="text-xs gap-1.5"
                  >
                    <span>Advance Step</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSimulateDeliveryFailure}
                    disabled={isProcessing}
                    className="text-xs text-amber-800 hover:bg-amber-100/50"
                  >
                    Simulate Delivery Exception
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleDeliverNow}
                    disabled={isProcessing}
                    className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs gap-1.5"
                  >
                    <span>Deliver to Doorstep</span>
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 7: COMPLETED STATE */}
          {workflowState === "COMPLETED" && (
            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-base text-emerald-950">
                      Anita&apos;s Medicine Has Been Delivered
                    </h4>
                    <p className="text-xs text-emerald-800 mt-0.5">
                      Handover confirmed at Plot 42, Jubilee Hills. Cold-chain seal intact.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 p-3.5 rounded-xl bg-white/80 border border-emerald-200 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Previous Stock</span>
                    <strong className="text-slate-900 font-mono">3 tablets (3 days)</strong>
                  </div>
                  <div>
                    <span className="text-emerald-700 block text-[11px] font-bold">New Inventory</span>
                    <strong className="text-emerald-800 font-bold font-mono text-sm">
                      {med.currentStockUnits} tablets ({med.remainingDays} days)
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Next Refill Date</span>
                    <strong className="text-slate-900 font-mono">~60 days</strong>
                  </div>
                </div>
              </div>

              {/* Scheduled Next Step */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <PhoneCall className="w-4 h-4 text-indigo-600 shrink-0" />
                  <div>
                    <div className="font-semibold text-slate-900">
                      Next Voice Reminder Scheduled
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Tomorrow at 09:00 AM in Telugu (te-IN) via Gnani.ai
                    </div>
                  </div>
                </div>
                <Badge variant="neutral" className="text-[10px]">
                  SCHEDULED
                </Badge>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  variant="outline"
                  size="md"
                  onClick={handleReset}
                  className="text-xs gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-teal-600" />
                  <span>Replay Journey</span>
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  onClick={onClose}
                  className="bg-slate-900 text-white text-xs px-5"
                >
                  Done
                </Button>
              </div>
            </div>
          )}

          {/* REJECTED STATE */}
          {workflowState === "REJECTED" && (
            <FailureStateCard
              details={{
                type: "AUTHORIZATION_REJECTED",
                whatHappened: `Refill authorization for ${med.name} was rejected by ${activeUser.name}.`,
                why: "Coordinator verified that medication was already purchased offline or order was duplicate.",
                whatCareLoopCanDo: "Payment authorization canceled. Delivery booking dropped without charge.",
                whatHumanNeedsToDo: "Check Anita's medicine cabinet to confirm physical tablet count.",
                onRetry: () => setWorkflowState("REVIEW"),
              }}
            />
          )}

          {/* DEFERRED STATE */}
          {workflowState === "DEFERRED" && (
            <FailureStateCard
              details={{
                type: "AUTHORIZATION_DEFERRED",
                whatHappened: `Refill authorization for ${med.name} was deferred for later.`,
                why: "Action deferred by coordinator. CareLoop will remind you in 12 hours.",
                whatCareLoopCanDo: "Saved refill draft with pre-calculated shortage details.",
                whatHumanNeedsToDo: "Approve before stock runs out in 3 days to avoid treatment discontinuation.",
                onRetry: () => setWorkflowState("REVIEW"),
              }}
            />
          )}

          {/* PAYMENT FAILED STATE */}
          {workflowState === "PAYMENT_FAILED" && (
            <FailureStateCard
              details={{
                type: "PAYMENT_FAILED",
                whatHappened: `Pine Labs pre-authorized payment gateway declined ₹${med.costEstimate} for ${med.name}.`,
                why: "Payment authorization failed: Bank gateway timeout or terminal declined the transaction.",
                whatCareLoopCanDo: "Payment transaction rolled back safely. No duplicate charges occurred.",
                whatHumanNeedsToDo: "Verify card balance or switch to secondary UPI payment rail in Settings.",
                onRetry: () => setWorkflowState("REVIEW"),
              }}
            />
          )}

          {/* DELIVERY FAILED STATE */}
          {workflowState === "DELIVERY_FAILED" && (
            <FailureStateCard
              details={{
                type: "DELIVERY_FAILED",
                whatHappened: `Delhivery Healthcare express courier reported a delivery exception in Jubilee Hills.`,
                why: "Delivery exception: Security gate access denied or recipient unavailable.",
                whatCareLoopCanDo: "Cold-chain package returned safely to Apollo Begumpet Central Hub (4.2°C temperature maintained).",
                whatHumanNeedsToDo: "Confirm gate security pass or schedule evening re-dispatch window.",
                onRetry: () => {
                  setCurrentStepIdx(2);
                  setWorkflowState("TRACKING");
                },
              }}
            />
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
