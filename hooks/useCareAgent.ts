"use client";

import { useState, useCallback } from "react";
import { ChatMessage, AgentActionPlan } from "@/types/agent";
import { LogisticsLifecycleStatus } from "@/types/providers";
import { useCareLoop } from "@/providers/AppProvider";
import { evaluateClinicalSafety } from "@/lib/safetyBoundary";

export function useCareAgent() {
  const {
    family,
    medications,
    tasks,
    records,
    activeUser,
    refillMedication,
    advanceShipmentStep,
    resetGoldenJourneyScenario,
    rejectMedicationAuthorization,
    logActivity,
    addTask,
  } = useCareLoop();

  const getInitialMessages = useCallback((): ChatMessage[] => [
    {
      id: "msg-welcome",
      sender: "AGENT",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      text: `Hello ${activeUser.name}. I am CareLoop Agent, coordinating healthcare for The Rao Family across Hyderabad, Bengaluru, and Chennai.\n\nI handle inventory tracking, hospital dossiers, and delivery logistics while keeping you in full control of authorizations. What would you like me to look into today?`,
      suggestedActions: [
        {
          label: "Make sure Mom has enough thyroid medicine for the next 10 days",
          actionId: "refill-mom",
          prompt: "Make sure Mom has enough thyroid medicine for the next 10 days.",
        },
        {
          label: "Simulate spending limit failure (Ceiling Exceeded)",
          actionId: "sim-limit",
          prompt: "Simulate spending limit failure for Thyronorm refill.",
        },
        {
          label: "Simulate acute symptom alert (Clinical Intercept)",
          actionId: "sim-symptom",
          prompt: "Mom is feeling dizzy and lightheaded after morning medicine.",
        },
        {
          label: "Find Dad's latest cardiology summary",
          actionId: "find-dad-report",
          prompt: "Find Dad's latest blood report and cardiology summary.",
        },
        {
          label: "Check medicine with missing information",
          actionId: "missing-info",
          prompt: "Check whether Grandma's medicine needs to be reordered.",
        },
      ],
    },
  ], [activeUser.name]);

  const [messages, setMessages] = useState<ChatMessage[]>(getInitialMessages);
  const [isProcessing, setIsProcessing] = useState(false);

  const sendMessage = useCallback(
    async (userInput: string) => {
      const userMsgId = `msg-${Date.now()}`;
      const nowStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

      const newMsg: ChatMessage = {
        id: userMsgId,
        sender: "USER",
        timestamp: nowStr,
        text: userInput,
      };

      setMessages((prev) => [...prev, newMsg]);
      setIsProcessing(true);

      const normalized = userInput.toLowerCase();

      // 1. Safety Boundary Intercept
      const safetyCheck = evaluateClinicalSafety(userInput);
      if (!safetyCheck.isSafeToAutomate) {
        setTimeout(() => {
          const planId = `plan-safety-${Date.now()}`;
          const escalationPlan: AgentActionPlan = {
            id: planId,
            userPrompt: userInput,
            state: "ESCALATED",
            createdAt: new Date().toISOString(),
            completedAt: new Date().toISOString(),
            requiresAuthorization: false,
            escalationReason: safetyCheck.reason,
            steps: [
              {
                id: "s1",
                timestamp: nowStr,
                description: "Evaluated input against clinical safety rules.",
                state: "COMPLETED",
                toolName: "safety_boundary_evaluator",
                output: "Triggered clinical safety intercept: AI never diagnoses symptoms.",
              },
              {
                id: "s2",
                timestamp: nowStr,
                description: safetyCheck.reason || "Automated actions halted.",
                state: "ESCALATED",
              },
            ],
            resultSummary: safetyCheck.recommendedAction,
          };

          if (safetyCheck.isEmergencyAlert) {
            addTask({
              title: "Urgent: Physical symptom reported by family member",
              description: `Agent intercepted concerning report: "${userInput}". Human medical evaluation requested immediately.`,
              familyMemberId: "mem-anita",
              ownerId: activeUser.id,
              priority: "URGENT",
              dueDate: new Date().toISOString().split("T")[0],
              status: "ESCALATED",
              source: "VOICE_ESCALATION",
              tags: ["Urgent Medical", "Escalation"],
            });
          }

          setMessages((prev) => [
            ...prev,
            {
              id: `msg-${Date.now()}`,
              sender: "AGENT",
              timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              text: `⚠️ **Clinical Boundary Intercept**\n\n${safetyCheck.reason}\n\n*${safetyCheck.recommendedAction}*`,
              actionPlan: escalationPlan,
              isEscalationAlert: true,
              failureDetails: {
                type: "CLINICAL_CONCERN_DETECTED",
                whatHappened: "Clinical safety intercept triggered by reported physical symptoms.",
                why: "CareLoop strictly avoids medical diagnosis, dosage alteration, and clinical conclusions.",
                whatCareLoopCanDo: "Automation has been safely halted. Urgent care task dispatched to primary coordinator.",
                whatHumanNeedsToDo: "Contact family member directly or consult their treating physician immediately.",
                primaryActionLabel: "View Urgent Care Task",
                primaryActionHref: "/tasks",
              },
            },
          ]);
          setIsProcessing(false);
        }, 500);
        return;
      }

      // 2. Spending Limit Failure Simulation Scenario
      if (normalized.includes("simulate spending limit") || normalized.includes("limit failure")) {
        setTimeout(() => {
          const failPlan: AgentActionPlan = {
            id: `plan-fail-${Date.now()}`,
            userPrompt: userInput,
            state: "FAILED",
            createdAt: new Date().toISOString(),
            completedAt: new Date().toISOString(),
            requiresAuthorization: false,
            contextFindings: {
              patientName: "Anita Rao",
              identifiedTask: "Refill Thyronorm 50 mcg (₹485)",
              urgencyLevel: "HIGH",
            },
            steps: [
              {
                id: "s1",
                timestamp: nowStr,
                description: "Context Lookup: Anita Rao Thyronorm stock verified (3 tabs remaining).",
                state: "COMPLETED",
              },
              {
                id: "s2",
                timestamp: nowStr,
                description: `Financial Guardrail Checked: ₹485 exceeds monthly threshold limit (Simulated: ₹200).`,
                state: "FAILED",
                output: "Status: EXCEEDED_LIMIT.",
              },
            ],
            resultSummary: "Refill blocked by family spending limit guardrail.",
          };

          setMessages((prev) => [
            ...prev,
            {
              id: `msg-${Date.now()}`,
              sender: "AGENT",
              timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              text: `❌ **Financial Guardrail Enforced**\n\nThe requested refill for **Thyronorm 50 mcg** costs **₹485**, which exceeds your family's configured monthly spending limit.\n\nTo proceed, please adjust your threshold in Settings or request coordinator override.`,
              actionPlan: failPlan,
              failureDetails: {
                type: "SPENDING_LIMIT_EXCEEDED",
                whatHappened: "Refill cost of ₹485 exceeds monthly family coordination threshold.",
                why: "A safety spending ceiling is configured to prevent unreviewed recurring healthcare expenses.",
                whatCareLoopCanDo: "Placed refill order on hold. Preserved prescription and delivery address draft.",
                whatHumanNeedsToDo: "Increase your family monthly spending limit in Settings or approve an emergency override.",
                primaryActionLabel: "Adjust Spending Limit in Settings",
                primaryActionHref: "/settings",
              },
            },
          ]);
          setIsProcessing(false);
        }, 600);
        return;
      }

      // 3. Missing Information Scenario
      if (
        normalized.includes("grandma") &&
        (normalized.includes("medicine") || normalized.includes("reorder") || normalized.includes("check"))
      ) {
        setTimeout(() => {
          const planId = `plan-missing-${Date.now()}`;
          const missingPlan: AgentActionPlan = {
            id: planId,
            userPrompt: userInput,
            state: "WAITING_FOR_INFORMATION",
            createdAt: new Date().toISOString(),
            requiresAuthorization: false,
            contextFindings: {
              patientName: "Grandmother (Sarojini Rao)",
              urgencyLevel: "ROUTINE",
              missingInformation: [
                "Specific medication name not specified in prompt",
                "Dosage frequency or prescribing physician unknown",
              ],
            },
            steps: [
              {
                id: "s1",
                timestamp: nowStr,
                description: "Scanned family health records for Sarojini Rao.",
                state: "COMPLETED",
                toolName: "query_records",
                output: "Multiple potential records found: Shelcal-500 vs Joint Ace Plus.",
              },
              {
                id: "s2",
                timestamp: nowStr,
                description: "Awaiting clarification on exact medication and dosage requirement.",
                state: "WAITING_APPROVAL",
                output: "State paused in WAITING_FOR_INFORMATION.",
              },
            ],
            resultSummary: "Please specify which medication you would like me to check for Grandma.",
          };

          setMessages((prev) => [
            ...prev,
            {
              id: `msg-${Date.now()}`,
              sender: "AGENT",
              timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              text: `I looked into records for **Grandmother (Sarojini Rao)**, but I need additional details to proceed safely.\n\n• **Missing Information**: Which specific medicine would you like me to inspect?\n\nPlease select one of the following verified active prescriptions:`,
              actionPlan: missingPlan,
              suggestedActions: [
                {
                  label: "Check Shelcal 500 (Calcium + Vit D3)",
                  actionId: "shelcal-check",
                  prompt: "Check whether Grandma's Shelcal 500 needs to be reordered.",
                },
                {
                  label: "Check Joint Ace Plus (Glucosamine)",
                  actionId: "jointace-check",
                  prompt: "Check whether Grandma's Joint Ace Plus needs to be reordered.",
                },
              ],
            },
          ]);
          setIsProcessing(false);
        }, 600);
        return;
      }

      // 4. Golden User Journey: "Make sure Mom has enough thyroid medicine for the next 10 days"
      const isRefillMomThyroid =
        normalized.includes("thyroid") ||
        normalized.includes("thyronorm") ||
        (normalized.includes("mom") && (normalized.includes("medicine") || normalized.includes("refill") || normalized.includes("10 days")));

      if (isRefillMomThyroid) {
        const momMeds = medications.filter((m) => m.patientId === "mem-anita" && m.status === "ACTIVE");
        const urgentMed = momMeds.find((m) => m.name.toLowerCase().includes("thyronorm")) || momMeds[0];

        // Guardrail: Check spending limit
        if (urgentMed.costEstimate > family.monthlySpendingLimit) {
          setTimeout(() => {
            const failPlan: AgentActionPlan = {
              id: `plan-fail-${Date.now()}`,
              userPrompt: userInput,
              state: "FAILED",
              createdAt: new Date().toISOString(),
              completedAt: new Date().toISOString(),
              requiresAuthorization: false,
              contextFindings: {
                patientName: "Anita Rao",
                identifiedTask: "Refill Thyronorm 50 mcg",
                urgencyLevel: "HIGH",
              },
              steps: [
                {
                  id: "s1",
                  timestamp: nowStr,
                  description: "Context Lookup: Anita Rao Thyronorm stock verified (3 tabs remaining).",
                  state: "COMPLETED",
                },
                {
                  id: "s2",
                  timestamp: nowStr,
                  description: `Checked financial limits: Refill ₹${urgentMed.costEstimate} exceeds family monthly ceiling of ₹${family.monthlySpendingLimit}.`,
                  state: "FAILED",
                  output: `Limit exceeded: ₹${urgentMed.costEstimate} > ₹${family.monthlySpendingLimit}.`,
                },
              ],
              resultSummary: `Authorization declined: Amount ₹${urgentMed.costEstimate} exceeds current family spending limit of ₹${family.monthlySpendingLimit}. Please increase your limit in Settings.`,
            };

            setMessages((prev) => [
              ...prev,
              {
                id: `msg-${Date.now()}`,
                sender: "AGENT",
                timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                text: `❌ **Financial Guardrail Enforced**\n\nThe requested refill for **${urgentMed.name}** costs **₹${urgentMed.costEstimate}**, which exceeds your family's configured monthly spending limit of **₹${family.monthlySpendingLimit}**.\n\nTo proceed, please visit the **Settings** page and adjust your spending threshold or request primary coordinator override.`,
                actionPlan: failPlan,
                failureDetails: {
                  type: "SPENDING_LIMIT_EXCEEDED",
                  whatHappened: `Refill cost ₹${urgentMed.costEstimate} exceeds configured family monthly ceiling of ₹${family.monthlySpendingLimit}.`,
                  why: "Automated payment blocked by financial safety threshold.",
                  whatCareLoopCanDo: "Order placed on hold. No charges made to card.",
                  whatHumanNeedsToDo: "Update monthly limit in Settings or request primary coordinator approval.",
                  primaryActionLabel: "Adjust Spending Limit",
                  primaryActionHref: "/settings",
                },
              },
            ]);
            setIsProcessing(false);
          }, 600);
          return;
        }

        const planId = `plan-golden-${Date.now()}`;
        const initialPlan: AgentActionPlan = {
          id: planId,
          userPrompt: userInput,
          state: "NEEDS_AUTHORIZATION",
          createdAt: new Date().toISOString(),
          requiresAuthorization: true,
          contextFindings: {
            patientName: "Anita Rao",
            identifiedTask: "Refill Thyronorm 50 mcg (60-day pack)",
            urgencyLevel: "HIGH",
          },
          authorizationPayload: {
            authorizationId: `PL-AUTH-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
            purpose: `Refill ${urgentMed.name} (60-day pack)`,
            targetEntity: urgentMed.id,
            requestedBy: "CareLoop Natural Language Planner",
            approverId: activeUser.id,
            approverName: activeUser.name,
            amount: urgentMed.costEstimate,
            spendingLimit: family.monthlySpendingLimit,
            paymentRail: "PINE_LABS",
            structuredDetails: {
              whatWillHappen: `Purchase a 60-day supply of ${urgentMed.name} (${urgentMed.dosage}) from ${urgentMed.pharmacyName} and schedule express Delhivery cold-chain delivery to Jubilee Hills.`,
              why: `Anita Rao has only ${urgentMed.remainingDays} days (${urgentMed.currentStockUnits} tablets) of Levothyroxine remaining, breaching the 5-day safety threshold.`,
              whoItAffects: "Anita Rao (Mother, Hyderabad)",
              cost: urgentMed.costEstimate,
              dataBeingShared: `Patient address, phone number, and verified prescription #RX-ANITA sent securely to ${urgentMed.pharmacyName}.`,
              whatHappensNext: "Pine Labs captures ₹485. Delhivery generates AWB tracking and delivers by tomorrow 4:00 PM.",
            },
          },
          steps: [
            {
              id: "s1",
              timestamp: nowStr,
              description: "Context Lookup: Identified Anita Rao (Mother, living with grandparents in Hyderabad).",
              state: "COMPLETED",
              toolName: "identify_family_member",
              output: "Patient matched: Anita Rao (68y, Hyderabad). Coordinator: Arjun / Meera Rao.",
            },
            {
              id: "s2",
              timestamp: nowStr,
              description: "Prescription Lookup: Located verified Thyronorm 50 mcg Rx (#RX-ANITA, Dr. Sumathi Reddy).",
              state: "COMPLETED",
              toolName: "get_medication_record",
              output: "Verified prescription on file. Active dosage: 1 tab daily empty stomach.",
            },
            {
              id: "s3",
              timestamp: nowStr,
              description: `Inventory Evaluation: Stock is ${urgentMed.currentStockUnits} tablets (3 days) vs 10 days requested → 7-day deficit.`,
              state: "COMPLETED",
              toolName: "calculate_refill_requirement",
              output: "Threshold breached (< 5 days). 60-day standard refill bottle recommended.",
            },
            {
              id: "s4",
              timestamp: nowStr,
              description: `Pharmacy Verification: Stock available at ${urgentMed.pharmacyName} for ₹${urgentMed.costEstimate}.`,
              state: "COMPLETED",
              toolName: "check_pharmacy_inventory",
              output: "Cold chain stock confirmed. Ready for dispatch.",
            },
            {
              id: "s5",
              timestamp: nowStr,
              description: `Human Authorization Gate: Generated Pine Labs 2FA consent request for ₹${urgentMed.costEstimate}.`,
              state: "WAITING_APPROVAL",
              toolName: "request_authorization",
              requiresHumanReview: true,
            },
            {
              id: "s6",
              timestamp: nowStr,
              description: "Payment Execution & Dispatch: Capture charge via Pine Labs and assign Delhivery courier.",
              state: "PENDING",
            },
            {
              id: "s7",
              timestamp: nowStr,
              description: "Doorstep Delivery & Inventory Sync: Verify delivery and automatically update stock to 63 tablets.",
              state: "PENDING",
            },
          ],
        };

        const goldenData = {
          patientName: "Anita Rao",
          patientLocation: "Plot 42, Road No 12, Jubilee Hills, Hyderabad",
          requesterName: activeUser.name,
          medicationName: urgentMed.name,
          dosage: urgentMed.dosage,
          currentStockUnits: urgentMed.currentStockUnits,
          requestedDays: 10,
          deficitDays: Math.max(0, 10 - urgentMed.remainingDays),
          estimatedCost: urgentMed.costEstimate,
          pharmacyName: urgentMed.pharmacyName,
          isAuthorized: false,
        };

        setTimeout(() => {
          setMessages((prev) => [
            ...prev,
            {
              id: `msg-${Date.now()}`,
              sender: "AGENT",
              timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              text: `I understood your request for **Anita Rao**.\n\n• **Medication**: ${urgentMed.name} (${urgentMed.dosage})\n• **Current Inventory**: ${urgentMed.currentStockUnits} tablets (${urgentMed.remainingDays} days remaining)\n• **Requested Coverage**: 10 days → **7-day deficit detected**\n• **Prescription Status**: Verified on file (#RX-ANITA, Dr. Sumathi Reddy)\n• **Action Plan**: Formulated 60-day refill via Apollo Pharmacy for ₹${urgentMed.costEstimate}.\n\n*CareLoop requires your explicit authorization before charging the card and scheduling delivery.*`,
              actionPlan: initialPlan,
              isGoldenJourney: true,
              goldenJourneyData: goldenData,
            },
          ]);
          setIsProcessing(false);
        }, 800);
        return;
      }

      // 5. Scenario: Dad's report & cardiology summary
      if (
        normalized.includes("blood report") ||
        normalized.includes("cardiology summary") ||
        (normalized.includes("dad") && normalized.includes("report"))
      ) {
        const dadRecords = records.filter((r) => r.patientId === "mem-ramesh");
        const latestLab = dadRecords.find((r) => r.documentType === "LAB_REPORT");
        const discharge = dadRecords.find((r) => r.documentType === "DISCHARGE_SUMMARY");

        const plan: AgentActionPlan = {
          id: `plan-${Date.now()}`,
          userPrompt: userInput,
          state: "COMPLETED",
          createdAt: new Date().toISOString(),
          completedAt: new Date().toISOString(),
          requiresAuthorization: false,
          contextFindings: {
            patientName: "Ramesh Rao",
            identifiedTask: "Locate and summarize latest cardiology & diabetes panel",
            urgencyLevel: "ROUTINE",
          },
          steps: [
            {
              id: "s1",
              timestamp: nowStr,
              description: "Queried Ramesh Rao's encrypted document vault.",
              state: "COMPLETED",
              toolName: "query_records",
              output: `Retrieved ${dadRecords.length} clinical files.`,
            },
            {
              id: "s2",
              timestamp: nowStr,
              description: "Extracted verified parameters from Apollo Diagnostics Lipid Profile.",
              state: "COMPLETED",
              toolName: "ocr_extract",
              output: "HbA1c: 7.1% (Fair control), Total Cholesterol: 182 mg/dL, Triglycerides: 158 mg/dL.",
            },
            {
              id: "s3",
              timestamp: nowStr,
              description: "Cross-referenced post-angioplasty discharge notes (LAD stent, Dr. K.S. Rao).",
              state: "COMPLETED",
              toolName: "cross_reference",
            },
          ],
          resultSummary: `Found 2 relevant records: "${latestLab?.title}" (${latestLab?.date}) and "${discharge?.title}". All key values have been verified by clinician.`,
        };

        setTimeout(() => {
          setMessages((prev) => [
            ...prev,
            {
              id: `msg-${Date.now()}`,
              sender: "AGENT",
              timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              text: `Here are **Ramesh Rao's** latest verified clinical findings:\n\n• **${latestLab?.title}** (${latestLab?.date}):\n  - **HbA1c**: 7.1% (Fair glycemic control)\n  - **Total Cholesterol**: 182 mg/dL (Normal)\n  - **Triglycerides**: 158 mg/dL (Borderline)\n\n• **${discharge?.title}**:\n  - Successful drug-eluting stent (DES) to LAD; preserved LVEF 55%.\n\n*These records have been linked to his upcoming appointment with Dr. K.S. Rao on Monday.*`,
              actionPlan: plan,
            },
          ]);
          setIsProcessing(false);
        }, 700);
        return;
      }

      // 6. Default Scenario: Remind Mom / General Query
      const pendingTasks = tasks.filter((t) => t.status !== "COMPLETED" && t.status !== "CANCELLED");

      const plan: AgentActionPlan = {
        id: `plan-${Date.now()}`,
        userPrompt: userInput,
        state: "COMPLETED",
        createdAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
        requiresAuthorization: false,
        steps: [
          {
            id: "s1",
            timestamp: nowStr,
            description: "Scanned family graph and scheduled automated reminder notification.",
            state: "COMPLETED",
            toolName: "schedule_reminder",
            output: "Voice reminder queued for Anita Rao.",
          },
        ],
        resultSummary: "Reminder confirmed across family notification channels.",
      };

      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: `msg-${Date.now()}`,
            sender: "AGENT",
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            text: `Understood. I have logged an automated voice and SMS reminder for Anita Rao. She will receive a notification in Telugu tomorrow morning at 09:00 AM.\n\nActive family tasks pending: **${pendingTasks.length} items**.`,
            actionPlan: plan,
          },
        ]);
        setIsProcessing(false);
      }, 650);
    },
    [medications, activeUser, family, records, tasks, addTask]
  );

  const executeAuthorizedAction = useCallback(
    async (messageId: string, plan: AgentActionPlan) => {
      setIsProcessing(true);

      const medId = plan.authorizationPayload?.targetEntity || "med-thyronorm";
      const result = await refillMedication(medId);

      const updatedPlan: AgentActionPlan = {
        ...plan,
        state: "WAITING_ON_EXTERNAL_SYSTEM",
        requiresAuthorization: false,
        steps: plan.steps.map((s) => {
          if (s.toolName === "request_authorization") {
            return {
              ...s,
              state: "COMPLETED",
              output: `Approved by ${activeUser.name} via Pine Labs. Receipt #${result?.receipt?.receiptId || "REC-PL-9021"}.`,
            };
          }
          if (s.id === "s6") {
            return {
              ...s,
              state: "COMPLETED",
              description: `Payment captured (Pine Labs). Delhivery Healthcare courier assigned (AWB: ${result?.shipment.awbNumber}).`,
              output: `Cold chain pickup scheduled from Apollo Central Hub. In transit to Jubilee Hills.`,
            };
          }
          if (s.id === "s7") {
            return {
              ...s,
              state: "PENDING",
              description: `Awaiting delivery to update stock (+60 tablets).`,
            };
          }
          return s;
        }),
        resultSummary: `Order placed and payment captured (Receipt: ${result?.receipt?.receiptId}). Delhivery shipment AWB: ${result?.shipment.awbNumber}.`,
      };

      setMessages((prev) =>
        prev.map((m) => {
          if (m.id === messageId) {
            return {
              ...m,
              actionPlan: updatedPlan,
              goldenJourneyData: m.goldenJourneyData
                ? {
                    ...m.goldenJourneyData,
                    isAuthorized: true,
                    authorizationId: result?.auth.authorizationId,
                    paymentReceipt: result?.receipt,
                    shipment: result?.shipment,
                  }
                : undefined,
            };
          }
          return m;
        })
      );

      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: `msg-${Date.now()}`,
            sender: "AGENT",
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            text: `✅ **Payment Authorized & Courier Dispatched**\n\n• **Payment Rail**: Pine Labs captured ₹${plan.authorizationPayload?.amount} (Receipt: **${result?.receipt.receiptId}**).\n• **Logistics Rail**: Delhivery Cold-Chain AWB **${result?.shipment.awbNumber}** created.\n• **Status**: Pickup scheduled from Apollo Begumpet Central Hub.\n• **Next Step**: When Delhivery completes delivery at Jubilee Hills, CareLoop will automatically update Anita Rao's medication inventory (+60 tablets).`,
          },
        ]);
        setIsProcessing(false);
      }, 500);

      logActivity({
        actor: { id: "care-agent", name: "CareLoop Agent", type: "CARE_AGENT" },
        actionType: "MEDICATION_REFILL_INITIATED",
        entityType: "MEDICATION",
        entityId: medId,
        description: `Refill executed on behalf of ${activeUser.name} with verified authorization.`,
        whyExplanation: "Human authorization granted for Levothyroxine supply maintenance.",
      });
    },
    [activeUser, refillMedication, logActivity]
  );

  const rejectAuthorizedAction = useCallback(
    (messageId: string, plan: AgentActionPlan, reason = "Coordinator declined refill payment.") => {
      const medId = plan.authorizationPayload?.targetEntity || "med-thyronorm";
      rejectMedicationAuthorization(medId, reason);

      const failedPlan: AgentActionPlan = {
        ...plan,
        state: "FAILED",
        completedAt: new Date().toISOString(),
        steps: plan.steps.map((s) => {
          if (s.toolName === "request_authorization" || s.state === "WAITING_APPROVAL") {
            return {
              ...s,
              state: "FAILED",
              output: `Declined by ${activeUser.name}.`,
            };
          }
          return s;
        }),
        resultSummary: "Refill authorization declined by human coordinator.",
      };

      setMessages((prev) =>
        prev.map((m) => {
          if (m.id === messageId) {
            return {
              ...m,
              actionPlan: failedPlan,
              failureDetails: {
                type: "AUTHORIZATION_REJECTED",
                whatHappened: "Refill authorization was declined by family coordinator.",
                why: "Coordinator opted not to authorize the ₹485 payment charge or pharmacy dispatch at this time.",
                whatCareLoopCanDo: "Automation has been safely paused. Anita Rao's current stock remains at 3 days.",
                whatHumanNeedsToDo: "Please arrange an alternative pharmacy pickup or re-authorize before her 3 tablets exhaust.",
                primaryActionLabel: "Re-evaluate Refill",
                onPrimaryAction: () => sendMessage("Make sure Mom has enough thyroid medicine for the next 10 days."),
              },
            };
          }
          return m;
        })
      );
    },
    [activeUser.name, rejectMedicationAuthorization, sendMessage]
  );

  const deferAuthorizedAction = useCallback(
    (messageId: string, plan: AgentActionPlan) => {
      setMessages((prev) =>
        prev.map((m) => {
          if (m.id === messageId) {
            return {
              ...m,
              actionPlan: {
                ...plan,
                state: "WAITING_FOR_INFORMATION",
              },
              failureDetails: {
                type: "AUTHORIZATION_DEFERRED",
                whatHappened: "Authorization deferred by coordinator ('Ask me later').",
                why: "Decision postponed. No payment has been charged and no courier dispatched.",
                whatCareLoopCanDo: "CareLoop will send a follow-up reminder at 04:00 PM today before pharmacy ordering cut-off.",
                whatHumanNeedsToDo: "Review when ready. Stock will exhaust in 72 hours.",
                primaryActionLabel: "Review & Authorize Now",
                onPrimaryAction: () => executeAuthorizedAction(messageId, plan),
              },
            };
          }
          return m;
        })
      );
    },
    [executeAuthorizedAction]
  );

  const advanceGoldenJourneyCourier = useCallback(
    async (messageId: string, awbNumber: string, targetStatus?: LogisticsLifecycleStatus) => {
      const updatedShipment = await advanceShipmentStep(awbNumber, targetStatus);
      const isDelivered = updatedShipment.status === "DELIVERED";

      setMessages((prev) =>
        prev.map((m) => {
          if (m.id === messageId && m.goldenJourneyData) {
            const updatedPlan: AgentActionPlan | undefined = m.actionPlan
              ? {
                  ...m.actionPlan,
                  state: isDelivered ? "COMPLETED" : "WAITING_ON_EXTERNAL_SYSTEM",
                  completedAt: isDelivered ? new Date().toISOString() : undefined,
                  steps: m.actionPlan.steps.map((st) => {
                    if (st.id === "s7" && isDelivered) {
                      return {
                        ...st,
                        state: "COMPLETED",
                        description: "Doorstep delivery confirmed. Inventory automatically updated (+60 tablets).",
                        output: "Current stock: 63 tablets (63 days). Task marked COMPLETED.",
                      };
                    }
                    return st;
                  }),
                  resultSummary: isDelivered
                    ? `Delivery completed. Thyronorm stock automatically replenished to 63 tablets. Zero treatment disruption.`
                    : m.actionPlan.resultSummary,
                }
              : undefined;

            return {
              ...m,
              actionPlan: updatedPlan,
              goldenJourneyData: {
                ...m.goldenJourneyData,
                shipment: updatedShipment,
                inventoryUpdated: isDelivered,
                newStockUnits: isDelivered ? 63 : m.goldenJourneyData.newStockUnits,
                newRemainingDays: isDelivered ? 63 : m.goldenJourneyData.newRemainingDays,
              },
            };
          }
          return m;
        })
      );

      if (isDelivered) {
        setTimeout(() => {
          setMessages((prev) => [
            ...prev,
            {
              id: `msg-${Date.now()}`,
              sender: "AGENT",
              timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              text: `🎉 **Doorstep Delivery Verified & Inventory Auto-Updated**\n\nDelhivery has delivered the 60-day Thyronorm pack to Anita Rao at Jubilee Hills.\n\n• **Updated Inventory**: **63 tablets (63 days remaining)**\n• **Care Task**: Automatically marked **COMPLETED**\n• **Activity Provenance**: Logged in family audit trail\n• **Next Action**: Scheduled routine 06:30 AM dosage reminder`,
            },
          ]);
        }, 300);
      }
    },
    [advanceShipmentStep]
  );

  const resetDemoScenario = useCallback(() => {
    resetGoldenJourneyScenario();
    setMessages(getInitialMessages());
  }, [resetGoldenJourneyScenario, getInitialMessages]);

  return {
    messages,
    isProcessing,
    sendMessage,
    executeAuthorizedAction,
    rejectAuthorizedAction,
    deferAuthorizedAction,
    advanceGoldenJourneyCourier,
    resetDemoScenario,
  };
}
