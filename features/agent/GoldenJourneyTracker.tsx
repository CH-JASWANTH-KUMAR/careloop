"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  Truck,
  CheckCircle2,
  ArrowRight,
  Package,
  Sparkles,
  AlertCircle,
  ExternalLink,
  RotateCcw,
  X,
  Clock,
  User,
  CreditCard,
  Share2,
} from "lucide-react";
import { GoldenJourneyData } from "@/types/agent";
import { LogisticsLifecycleStatus } from "@/types/providers";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { FailureStateCard } from "@/components/shared/FailureStateCard";
import Link from "next/link";

interface GoldenJourneyTrackerProps {
  data: GoldenJourneyData;
  onAuthorize: () => void;
  onReject?: () => void;
  onAskLater?: () => void;
  onResetScenario?: () => void;
  onAdvanceCourier: (awb: string, targetStatus?: LogisticsLifecycleStatus) => Promise<void>;
  isProcessing?: boolean;
}

const LOGISTICS_STEPS: LogisticsLifecycleStatus[] = [
  "ORDER_CREATED",
  "PICKUP_SCHEDULED",
  "IN_TRANSIT",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
];

const STEP_LABELS: Record<LogisticsLifecycleStatus, string> = {
  ORDER_CREATED: "Packaging",
  PICKUP_SCHEDULED: "Pickup Scheduled",
  IN_TRANSIT: "In Transit",
  OUT_FOR_DELIVERY: "Out for Delivery",
  DELIVERED: "Delivered",
  FAILED: "Failed",
  CANCELLED: "Cancelled",
  DELAYED: "Delayed",
};

export function GoldenJourneyTracker({
  data,
  onAuthorize,
  onReject,
  onAskLater,
  onResetScenario,
  onAdvanceCourier,
  isProcessing = false,
}: GoldenJourneyTrackerProps) {
  const [advancing, setAdvancing] = useState(false);
  const [userDecision, setUserDecision] = useState<"APPROVED" | "REJECTED" | "DEFERRED" | null>(
    data.isAuthorized ? "APPROVED" : null
  );

  const currentStep = data.shipment?.status || "ORDER_CREATED";
  const currentStepIdx = LOGISTICS_STEPS.indexOf(currentStep);
  const isDelivered = currentStep === "DELIVERED";

  const handleAdvance = async (target?: LogisticsLifecycleStatus) => {
    if (!data.shipment?.awbNumber || advancing) return;
    setAdvancing(true);
    try {
      await onAdvanceCourier(data.shipment.awbNumber, target);
    } finally {
      setAdvancing(false);
    }
  };

  const handleRejectClick = () => {
    setUserDecision("REJECTED");
    if (onReject) onReject();
  };

  const handleAskLaterClick = () => {
    setUserDecision("DEFERRED");
    if (onAskLater) onAskLater();
  };

  return (
    <div className="mt-3 rounded-xl border border-teal-200 bg-white shadow-sm overflow-hidden text-xs">
      {/* Header Banner with Demo Replay Button */}
      <div className="bg-gradient-to-r from-teal-900 to-slate-900 text-white px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-teal-400" />
          <span className="font-semibold tracking-wide text-xs">
            CareLoop Operational Loop: Golden User Journey
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-teal-800/80 text-teal-200 border border-teal-700/60">
            [SANDBOX / SIMULATED]
          </span>
          {onResetScenario && (
            <button
              onClick={onResetScenario}
              title="Reset stock to 3 tablets and replay journey"
              className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 cursor-pointer transition-colors"
            >
              <RotateCcw className="w-3 h-3 text-teal-400" />
              <span>Reset Journey</span>
            </button>
          )}
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Core Journey Story Narrative */}
        <div className="rounded-xl border border-teal-200 bg-teal-50/50 p-3.5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-teal-950 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-teal-700" /> Executive Care Story
            </span>
            <span className="text-[10px] font-mono text-teal-800 bg-teal-100/80 px-2 py-0.5 rounded font-semibold">
              Context Analysis
            </span>
          </div>
          <div className="p-3 bg-white rounded-lg border border-teal-100 text-xs text-slate-800 space-y-1.5 font-medium leading-relaxed">
            <p>• <strong>Mom has 3 tablets left.</strong> At her current dosage, that is 3 days.</p>
            <p>• <strong>Your family requested 10 days.</strong> CareLoop identified a <strong className="text-red-700">7-day shortage</strong>.</p>
            <p className="text-teal-900 font-bold">• <strong>Recommended action:</strong> Order 60 tablets (2-month sealed pack) from Apollo Pharmacy.</p>
          </div>
        </div>

        {/* Step 1: Context Lookup Findings & Full Transparency Spec */}
        <div className="rounded-lg border border-slate-200 bg-slate-50/80 p-3 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-800 flex items-center gap-1.5 text-xs">
              <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-800 font-bold flex items-center justify-center text-[10px]">
                1
              </span>
              Prescription Context &amp; Shortage Calculation
            </span>
            <Badge variant="success">Verified Rx on File</Badge>
          </div>

          {/* 8-Part Explicit Transparency Matrix */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-[11px]">
            <div className="bg-white p-2.5 rounded-lg border border-slate-200 space-y-0.5">
              <span className="text-slate-400 text-[10px] font-bold uppercase flex items-center gap-1">
                <User className="w-3 h-3 text-slate-400" /> Who
              </span>
              <strong className="text-slate-900 block">{data.patientName}</strong>
              <span className="text-[10px] text-slate-500">68y • {data.patientLocation}</span>
            </div>

            <div className="bg-white p-2.5 rounded-lg border border-slate-200 space-y-0.5">
              <span className="text-slate-400 text-[10px] font-bold uppercase flex items-center gap-1">
                <Package className="w-3 h-3 text-slate-400" /> What
              </span>
              <strong className="text-slate-900 block">{data.medicationName}</strong>
              <span className="text-[10px] text-slate-500">{data.dosage} • 1 tab daily morning</span>
            </div>

            <div className="bg-white p-2.5 rounded-lg border border-slate-200 space-y-0.5">
              <span className="text-slate-400 text-[10px] font-bold uppercase flex items-center gap-1">
                <AlertCircle className="w-3 h-3 text-amber-500" /> Why
              </span>
              <span className="text-red-700 font-bold block">{data.currentStockUnits} tablets (3 days)</span>
              <span className="text-[10px] text-slate-500">Breaches 5-day safety buffer</span>
            </div>

            <div className="bg-white p-2.5 rounded-lg border border-slate-200 space-y-0.5">
              <span className="text-slate-400 text-[10px] font-bold uppercase flex items-center gap-1">
                <CreditCard className="w-3 h-3 text-emerald-600" /> Cost &amp; Rails
              </span>
              <strong className="text-emerald-700 font-bold block">₹{data.estimatedCost} INR</strong>
              <span className="text-[10px] text-slate-500">Pine Labs + Delhivery</span>
            </div>
          </div>

          <div className="p-2 rounded bg-slate-100 border border-slate-200 text-[11px] text-slate-600 flex items-center gap-2">
            <Share2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>
              <strong>Data shared:</strong> Verified prescription #RX-ANITA and doorstep delivery address shared securely with {data.pharmacyName}.
            </span>
          </div>
        </div>

        {/* Step 2: Human Authorization Gate — Explicit [Approve], [Reject], [Ask me later] */}
        {!data.isAuthorized && userDecision !== "REJECTED" && userDecision !== "DEFERRED" && (
          <div className="rounded-lg border-2 border-amber-300 bg-amber-50/70 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-amber-950 flex items-center gap-1.5 text-xs">
                <span className="w-5 h-5 rounded-full bg-amber-200 text-amber-900 font-bold flex items-center justify-center text-[10px]">
                  2
                </span>
                Human Authorization Gate Required
              </span>
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-amber-200 text-amber-900">
                ₹{data.estimatedCost}
              </span>
            </div>

            <div className="space-y-1 text-slate-700 text-[11px] leading-relaxed">
              <p>• <strong>What will happen:</strong> Pre-authorized payment capture via Pine Labs and Delhivery cold-chain pharmacy dispatch.</p>
              <p>• <strong>Why:</strong> Protect Anita Rao from treatment interruption; current stock breaches 5-day safety threshold.</p>
              <p>• <strong>Who it affects:</strong> Anita Rao (Mother, Jubilee Hills, Hyderabad).</p>
              <p>• <strong>Data shared:</strong> Verified Rx #RX-ANITA and address shared securely with {data.pharmacyName}.</p>
            </div>

            {/* Tri-Option Decision Row */}
            <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-amber-200/80">
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleAskLaterClick}
                  className="text-xs text-amber-900 hover:bg-amber-100"
                >
                  <Clock className="w-3.5 h-3.5 text-amber-700" />
                  <span>Ask me later</span>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleRejectClick}
                  className="text-xs text-red-600 hover:bg-red-50 hover:border-red-300"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Reject</span>
                </Button>
              </div>

              <Button
                variant="primary"
                size="sm"
                onClick={onAuthorize}
                disabled={isProcessing}
                className="bg-slate-900 hover:bg-slate-800 text-white gap-1.5 px-3 py-1.5 shadow-sm"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Review &amp; Authorize Refill (₹{data.estimatedCost})</span>
              </Button>
            </div>
          </div>
        )}

        {/* Rejection State Card */}
        {userDecision === "REJECTED" && (
          <FailureStateCard
            details={{
              type: "AUTHORIZATION_REJECTED",
              whatHappened: "Refill authorization was declined by family coordinator.",
              why: "Coordinator opted not to authorize the ₹485 payment charge or pharmacy dispatch at this time.",
              whatCareLoopCanDo: "Automation has been safely paused. Anita Rao's current stock remains at 3 days.",
              whatHumanNeedsToDo: "Please arrange an alternative pharmacy pickup or re-authorize before her 3 tablets exhaust.",
              primaryActionLabel: "Re-evaluate Refill",
              onPrimaryAction: () => setUserDecision(null),
            }}
          />
        )}

        {/* Deferred State Card */}
        {userDecision === "DEFERRED" && (
          <FailureStateCard
            details={{
              type: "AUTHORIZATION_DEFERRED",
              whatHappened: "Authorization deferred by coordinator ('Ask me later').",
              why: "Decision postponed. No payment has been charged and no courier dispatched.",
              whatCareLoopCanDo: "CareLoop will send a follow-up reminder at 04:00 PM today before pharmacy ordering cut-off.",
              whatHumanNeedsToDo: "Review when ready. Stock will exhaust in 72 hours.",
              primaryActionLabel: "Authorize Now",
              onPrimaryAction: onAuthorize,
            }}
          />
        )}

        {/* Authorized Confirmation Banner */}
        {data.isAuthorized && (
          <div className="rounded-lg border border-emerald-300 bg-emerald-50/50 p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <div>
                <strong className="text-emerald-950 block text-xs">Human Authorization Granted</strong>
                <span className="text-[10px] text-emerald-800">
                  Approved by {data.requesterName} via 2FA Consent Gateway (Auth ID: {data.authorizationId || "SANDBOX-AUTH-VERIFIED"})
                </span>
              </div>
            </div>
            <Badge variant="success">AUTHORIZED</Badge>
          </div>
        )}

        {/* Step 3: Pine Labs Payment Execution */}
        {data.paymentReceipt && (
          <div className="rounded-lg border border-slate-200 bg-white p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-800 flex items-center gap-1.5 text-xs">
                <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-800 font-bold flex items-center justify-center text-[10px]">
                  3
                </span>
                Pine Labs Payment Rail Execution
              </span>
              <span className="text-[10px] font-mono text-slate-500">
                Txn ID: {data.paymentReceipt.transactionId}
              </span>
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
              <div>
                <span className="text-slate-400 text-[10px] block">Receipt ID</span>
                <strong className="font-mono text-slate-900">{data.paymentReceipt.receiptId}</strong>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">Amount Paid</span>
                <strong className="text-emerald-700 font-bold">₹{data.paymentReceipt.amount}</strong>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">Merchant</span>
                <span className="text-slate-800 font-medium truncate block">{data.paymentReceipt.merchantName}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">Security Auth</span>
                <span className="text-emerald-800 font-mono text-[10px]">2FA PIN VERIFIED</span>
              </div>
            </div>

            <p className="text-[10px] font-mono text-slate-400">
              {data.paymentReceipt.sandboxNotice || "[SANDBOX / SIMULATED] Payment executed via Pine Labs sandbox test rail."}
            </p>
          </div>
        )}

        {/* Step 4: Delhivery Logistics Tracking & Auto-Inventory Sync */}
        {data.shipment && (
          <div className="rounded-lg border border-slate-200 bg-white p-3 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-800 flex items-center gap-1.5 text-xs">
                <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-800 font-bold flex items-center justify-center text-[10px]">
                  4
                </span>
                Delhivery Express Healthcare Logistics
              </span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] text-slate-600 font-semibold bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                  AWB: {data.shipment.awbNumber}
                </span>
                <Badge variant={isDelivered ? "success" : "info"}>
                  {currentStep}
                </Badge>
              </div>
            </div>

            {/* Step Progress Ribbon */}
            <div className="space-y-1">
              <div className="grid grid-cols-5 gap-1 pt-1">
                {LOGISTICS_STEPS.map((step, idx) => {
                  const isDone = currentStepIdx >= idx;
                  const isCurrent = currentStepIdx === idx;
                  return (
                    <div key={step} className="flex flex-col items-center text-center">
                      <div
                        className={`w-full h-1.5 rounded-full mb-1 transition-all ${
                          isDone
                            ? isCurrent
                              ? "bg-teal-600"
                              : "bg-emerald-500"
                            : "bg-slate-200"
                        }`}
                      />
                      <span
                        className={`text-[9px] font-medium leading-tight ${
                          isCurrent
                            ? "text-teal-900 font-bold"
                            : isDone
                            ? "text-emerald-800"
                            : "text-slate-400"
                        }`}
                      >
                        {STEP_LABELS[step]}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Latest Status Description */}
            <div className="p-2.5 rounded bg-slate-50 border border-slate-200/80 text-[11px] flex items-start justify-between gap-3">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 text-slate-800 font-medium">
                  <Truck className="w-3.5 h-3.5 text-teal-700 shrink-0" />
                  <span>
                    Destination: {data.shipment.destinationAddress || `Jubilee Hills, Hyderabad`}
                  </span>
                </div>
                <p className="text-slate-600 text-[10px]">
                  {data.shipment.trackingHistory[data.shipment.trackingHistory.length - 1]?.description ||
                    "Prescription packaged and handed over to Delhivery courier."}
                </p>
              </div>

              {/* Interactive Sandbox Advancement Controls */}
              {!isDelivered && (
                <div className="flex items-center gap-1.5 shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={advancing}
                    onClick={() => handleAdvance()}
                    className="h-7 px-2 text-[10px] gap-1"
                  >
                    <span>Advance Checkpoint</span>
                    <ArrowRight className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    disabled={advancing}
                    onClick={() => handleAdvance("DELIVERED")}
                    className="h-7 px-2.5 text-[10px] bg-emerald-700 hover:bg-emerald-800 text-white gap-1"
                  >
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Deliver Now</span>
                  </Button>
                </div>
              )}
            </div>

            {/* Auto-Inventory Synchronization Callout */}
            {isDelivered && (
              <div className="p-3.5 rounded-xl border-2 border-emerald-300 bg-emerald-50 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-emerald-700" />
                    <strong className="text-emerald-950 text-xs">
                      Closed-Loop Fulfillment Complete: Inventory Auto-Updated
                    </strong>
                  </div>
                  <span className="font-mono text-xs font-bold text-emerald-900 bg-emerald-200 px-2 py-0.5 rounded">
                    +60 Tablets Added
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] pt-1">
                  <div className="bg-white p-2 rounded border border-emerald-200">
                    <span className="text-slate-500 text-[10px] block">Updated Stock:</span>
                    <strong className="text-emerald-950 font-bold">
                      {data.newStockUnits || 63} Tablets (63 Days)
                    </strong>
                  </div>
                  <div className="bg-white p-2 rounded border border-emerald-200">
                    <span className="text-slate-500 text-[10px] block">Care Task:</span>
                    <strong className="text-emerald-950 font-bold">COMPLETED</strong> (Zero disruption)
                  </div>
                  <div className="bg-white p-2 rounded border border-emerald-200">
                    <span className="text-slate-500 text-[10px] block">Next Scheduled Action:</span>
                    <span className="text-slate-700 font-medium">Daily 06:30 AM dose reminder</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 text-[10px] text-emerald-800 border-t border-emerald-200/60">
                  <span>Logged in Family Audit Trail with immutable provenance.</span>
                  <Link
                    href="/activity"
                    className="inline-flex items-center gap-1 font-semibold text-emerald-900 hover:underline"
                  >
                    <span>View in Activity Log</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
