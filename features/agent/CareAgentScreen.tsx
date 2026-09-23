"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Bot,
  Send,
  ShieldCheck,
  CheckCircle2,
  Clock,
  CreditCard,
  Terminal,
  User,
  AlertTriangle,
  RotateCcw,
} from "lucide-react";
import { useCareAgent } from "@/hooks/useCareAgent";
import { useCareLoop } from "@/providers/AppProvider";
import { AgentActionPlan, AgentActionState } from "@/types/agent";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { AuthorizationModal } from "@/components/shared/AuthorizationModal";
import { FailureStateCard } from "@/components/shared/FailureStateCard";
import { GoldenJourneyTracker } from "./GoldenJourneyTracker";
import { getProviderStatusInfo } from "@/services/providerConfig";

const ALL_AGENT_STATES: AgentActionState[] = [
  "REQUESTED",
  "UNDERSTANDING",
  "CONTEXT_LOOKUP",
  "PLANNING",
  "WAITING_FOR_INFORMATION",
  "NEEDS_AUTHORIZATION",
  "READY_TO_EXECUTE",
  "EXECUTING",
  "WAITING_ON_EXTERNAL_SYSTEM",
  "COMPLETED",
];

export function CareAgentScreen() {
  const {
    messages,
    isProcessing,
    sendMessage,
    executeAuthorizedAction,
    rejectAuthorizedAction,
    deferAuthorizedAction,
    advanceGoldenJourneyCourier,
    resetDemoScenario,
  } = useCareAgent();
  const { activeUser } = useCareLoop();
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const providerInfo = getProviderStatusInfo();

  const [authorizingPlan, setAuthorizingPlan] = useState<{
    msgId: string;
    plan: AgentActionPlan;
  } | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isProcessing]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isProcessing) return;
    sendMessage(inputText.trim());
    setInputText("");
  };

  const handlePromptClick = (prompt: string) => {
    if (isProcessing) return;
    sendMessage(prompt);
  };

  const handleConfirmAuthorization = () => {
    if (!authorizingPlan) return;
    executeAuthorizedAction(authorizingPlan.msgId, authorizingPlan.plan);
    setAuthorizingPlan(null);
  };

  const handleRejectAuthorization = () => {
    if (!authorizingPlan) return;
    rejectAuthorizedAction(authorizingPlan.msgId, authorizingPlan.plan);
    setAuthorizingPlan(null);
  };

  const handleAskLaterAuthorization = () => {
    if (!authorizingPlan) return;
    deferAuthorizedAction(authorizingPlan.msgId, authorizingPlan.plan);
    setAuthorizingPlan(null);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8.5rem)] max-w-5xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 shrink-0">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-teal-100 text-teal-800 border border-teal-200">
              Care Agent Centerpiece
            </span>
            <span className="text-xs text-slate-400 font-mono">
              12-State Action Engine &amp; Human Authorization Gate
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            CareLoop AI Agent
          </h1>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <Button
            variant="outline"
            size="sm"
            onClick={resetDemoScenario}
            title="Reset to 3 tablets and restart conversation"
            className="text-[11px] h-7 px-2.5 gap-1 border-slate-300 text-slate-700"
          >
            <RotateCcw className="w-3 h-3 text-teal-700" />
            <span>Reset Demo State</span>
          </Button>

          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200 font-mono text-[11px]">
            <span
              className={`w-2 h-2 rounded-full ${
                providerInfo.isSandbox ? "bg-amber-500" : "bg-emerald-500 animate-pulse"
              }`}
            />
            {providerInfo.badgeLabel}
          </span>
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Human-in-the-Loop Active
          </span>
        </div>
      </div>

      {/* Safety Notice */}
      <div className="p-3 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-600 flex items-center gap-2.5 shrink-0">
        <ShieldCheck className="w-4 h-4 text-teal-700 shrink-0" />
        <span>
          CareLoop translates natural language requests into verifiable logistics, pharmacy orders,
          and appointments. It will{" "}
          <strong className="text-slate-900 font-semibold">never</strong> silently charge payments
          or make medical diagnoses.
        </span>
      </div>

      {/* Chat Messages Stream */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 ${msg.sender === "USER" ? "justify-end" : "justify-start"}`}
          >
            {msg.sender === "AGENT" && (
              <div className="w-8 h-8 rounded-lg bg-teal-900 text-white flex items-center justify-center shrink-0 shadow-xs mt-1">
                <Bot className="w-4 h-4 text-teal-400" />
              </div>
            )}

            <div
              className={`max-w-3xl rounded-2xl p-4 text-xs leading-relaxed space-y-3 ${
                msg.sender === "USER"
                  ? "bg-slate-900 text-white rounded-tr-none"
                  : "bg-white border border-slate-200 text-slate-800 subtle-card rounded-tl-none"
              }`}
            >
              <div className="flex items-center justify-between text-[11px] opacity-70 mb-1">
                <span className="font-semibold">
                  {msg.sender === "USER" ? activeUser.name : "CareLoop Agent"}
                </span>
                <span className="font-mono">{msg.timestamp}</span>
              </div>

              {/* Text content with markdown formatting */}
              <div className="whitespace-pre-line text-xs font-normal">{msg.text}</div>

              {/* Interactive Golden User Journey Operational Loop */}
              {msg.isGoldenJourney && msg.goldenJourneyData && (
                <GoldenJourneyTracker
                  data={msg.goldenJourneyData}
                  onAuthorize={() =>
                    setAuthorizingPlan({ msgId: msg.id, plan: msg.actionPlan! })
                  }
                  onReject={() => {
                    if (msg.actionPlan) rejectAuthorizedAction(msg.id, msg.actionPlan);
                  }}
                  onAskLater={() => {
                    if (msg.actionPlan) deferAuthorizedAction(msg.id, msg.actionPlan);
                  }}
                  onResetScenario={resetDemoScenario}
                  onAdvanceCourier={(awb, target) =>
                    advanceGoldenJourneyCourier(msg.id, awb, target)
                  }
                  isProcessing={isProcessing}
                />
              )}

              {/* Standardized 4-Part Failure State Component */}
              {msg.failureDetails && (
                <FailureStateCard details={msg.failureDetails} />
              )}

              {/* Suggested Quick Prompts */}
              {msg.suggestedActions && (
                <div className="pt-2 space-y-1.5 border-t border-slate-100">
                  <span className="text-[10px] uppercase font-semibold text-slate-400 block tracking-wider">
                    Suggested Coordinated Inquiries:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {msg.suggestedActions.map((s) => (
                      <button
                        key={s.actionId}
                        onClick={() => handlePromptClick(s.prompt)}
                        disabled={isProcessing}
                        className="text-left px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-teal-50 hover:text-teal-900 border border-slate-200 hover:border-teal-300 text-slate-700 transition-all font-medium text-xs cursor-pointer"
                      >
                        &quot;{s.label}&quot; →
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Plan State Machine Visualizer */}
              {msg.actionPlan && (
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3.5 mt-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Terminal className="w-3.5 h-3.5 text-slate-600" />
                      <span className="text-[11px] font-bold text-slate-900 uppercase tracking-wider">
                        Agent State Machine: {msg.actionPlan.state.replace(/_/g, " ")}
                      </span>
                    </div>
                    <Badge
                      variant={
                        msg.actionPlan.state === "COMPLETED"
                          ? "success"
                          : msg.actionPlan.state === "NEEDS_AUTHORIZATION"
                          ? "warning"
                          : msg.actionPlan.state === "ESCALATED"
                          ? "urgent"
                          : msg.actionPlan.state === "FAILED"
                          ? "urgent"
                          : "info"
                      }
                    >
                      {msg.actionPlan.state}
                    </Badge>
                  </div>

                  {/* 12-State Flow Ribbon */}
                  <div className="flex items-center gap-1 overflow-x-auto py-1 border-y border-slate-200/60 text-[9px] font-mono">
                    {ALL_AGENT_STATES.map((st, i) => {
                      const currentIdx = ALL_AGENT_STATES.indexOf(msg.actionPlan!.state);
                      const isCurrent = msg.actionPlan!.state === st;
                      const isPast = currentIdx > i;
                      return (
                        <div
                          key={st}
                          className={`px-1.5 py-0.5 rounded whitespace-nowrap ${
                            isCurrent
                              ? "bg-slate-900 text-white font-bold"
                              : isPast
                              ? "bg-emerald-100 text-emerald-800"
                              : "text-slate-400"
                          }`}
                        >
                          {isPast ? "✓" : isCurrent ? "→" : "○"} {st.toLowerCase().replace(/_/g, " ")}
                        </div>
                      );
                    })}
                  </div>

                  {/* Step Execution Sequence */}
                  <div className="space-y-2 pt-1 text-[11px]">
                    {msg.actionPlan.steps.map((step) => (
                      <div key={step.id} className="flex items-start gap-2.5">
                        <div className="mt-0.5 shrink-0">
                          {step.state === "COMPLETED" ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          ) : step.state === "WAITING_APPROVAL" ? (
                            <Clock className="w-4 h-4 text-amber-600 animate-pulse" />
                          ) : step.state === "ESCALATED" || step.state === "FAILED" ? (
                            <AlertTriangle className="w-4 h-4 text-red-600" />
                          ) : (
                            <div className="w-4 h-4 rounded-full border border-slate-300" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-slate-800 font-medium">{step.description}</p>
                          {step.output && (
                            <p className="text-[10px] font-mono text-slate-600 bg-white p-1.5 rounded border border-slate-200 mt-1">
                              {step.output}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Explicit Authorization Callout (Only if not already displayed in Golden Journey Tracker) */}
                  {!msg.isGoldenJourney &&
                    msg.actionPlan.requiresAuthorization &&
                    msg.actionPlan.authorizationPayload && (
                      <div className="p-3.5 rounded-xl border border-amber-300 bg-amber-50 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-amber-950 flex items-center gap-1.5">
                            <CreditCard className="w-4 h-4 text-amber-700" /> Human Authorization
                            Required
                          </span>
                          <span className="font-mono text-xs text-amber-900 font-bold bg-amber-100 px-2 py-0.5 rounded">
                            ₹{msg.actionPlan.authorizationPayload.amount}
                          </span>
                        </div>
                        <p className="text-slate-700 text-xs">
                          {msg.actionPlan.authorizationPayload.purpose} via Pine Labs gateway
                          (Spending Limit: ₹{msg.actionPlan.authorizationPayload.spendingLimit}).
                        </p>
                        <div className="pt-1 flex items-center justify-end gap-2">
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() =>
                              setAuthorizingPlan({ msgId: msg.id, plan: msg.actionPlan! })
                            }
                            className="bg-slate-900 text-white text-xs h-8 gap-1.5 shadow-xs"
                          >
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Review &amp; Authorize</span>
                          </Button>
                        </div>
                      </div>
                    )}

                  {/* Result Summary */}
                  {msg.actionPlan.resultSummary && (
                    <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 font-medium text-xs">
                      {msg.actionPlan.resultSummary}
                    </div>
                  )}
                </div>
              )}
            </div>

            {msg.sender === "USER" && (
              <div className="w-8 h-8 rounded-lg bg-slate-800 text-white flex items-center justify-center shrink-0 shadow-xs mt-1">
                <User className="w-4 h-4 text-slate-300" />
              </div>
            )}
          </div>
        ))}

        {isProcessing && (
          <div className="flex items-center gap-2 p-3 text-xs text-slate-500 animate-pulse">
            <Bot className="w-4 h-4 text-teal-600" />
            <span>CareLoop is reasoning across family records and fulfillment rails...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <form
        onSubmit={handleSubmit}
        className="p-2 bg-white rounded-xl border border-slate-200 shadow-xs flex items-center gap-2 shrink-0"
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="e.g. 'Make sure Mom has enough thyroid medicine for the next 10 days'..."
          disabled={isProcessing}
          className="flex-1 text-xs px-3 py-2 bg-transparent text-slate-900 focus:outline-none placeholder:text-slate-400"
        />
        <Button
          type="submit"
          disabled={!inputText.trim() || isProcessing}
          size="sm"
          className="bg-slate-900 text-white h-8 px-3 text-xs gap-1"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Send</span>
        </Button>
      </form>

      {/* Comprehensive Reusable Human Authorization Modal */}
      {authorizingPlan && authorizingPlan.plan.authorizationPayload && (
        <AuthorizationModal
          isOpen={!!authorizingPlan}
          onClose={() => setAuthorizingPlan(null)}
          title="Review &amp; Authorize Medication Refill"
          data={
            authorizingPlan.plan.authorizationPayload.structuredDetails || {
              whatWillHappen: authorizingPlan.plan.authorizationPayload.purpose,
              why: "Current stock is below safety refill threshold.",
              whoItAffects: "Anita Rao (Mother)",
              cost: authorizingPlan.plan.authorizationPayload.amount,
              dataBeingShared: "Prescription #RX-ANITA and delivery address shared with pharmacy.",
              whatHappensNext: "Pine Labs 2FA payment capture and Delhivery courier pickup.",
            }
          }
          approverName={activeUser.name}
          onApprove={handleConfirmAuthorization}
          onReject={handleRejectAuthorization}
          onAskLater={handleAskLaterAuthorization}
        />
      )}
    </div>
  );
}
