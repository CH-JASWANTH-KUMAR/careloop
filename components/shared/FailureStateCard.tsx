"use client";

import React from "react";
import {
  AlertTriangle,
  HelpCircle,
  Wrench,
  UserCheck,
  RotateCcw,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

export interface FailureStateDetails {
  type:
    | "PAYMENT_FAILED"
    | "SPENDING_LIMIT_EXCEEDED"
    | "AUTHORIZATION_REJECTED"
    | "AUTHORIZATION_DEFERRED"
    | "MISSING_PRESCRIPTION"
    | "EXPIRED_PRESCRIPTION"
    | "MISSING_ADDRESS"
    | "DELIVERY_FAILED"
    | "PROVIDER_UNAVAILABLE"
    | "CLINICAL_CONCERN_DETECTED";
  whatHappened: string;
  why: string;
  whatCareLoopCanDo: string;
  whatHumanNeedsToDo: string;
  primaryActionLabel?: string;
  primaryActionHref?: string;
  onPrimaryAction?: () => void;
  onRetry?: () => void;
}

interface FailureStateCardProps {
  details: FailureStateDetails;
  className?: string;
}

export function FailureStateCard({ details, className = "" }: FailureStateCardProps) {
  const isWarning =
    details.type === "AUTHORIZATION_DEFERRED" ||
    details.type === "MISSING_PRESCRIPTION" ||
    details.type === "MISSING_ADDRESS";

  return (
    <div
      className={`rounded-xl border ${
        isWarning ? "border-amber-300 bg-amber-50/50" : "border-red-200 bg-red-50/40"
      } p-4 space-y-3.5 text-xs ${className}`}
    >
      {/* Header Badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle
            className={`w-4 h-4 ${isWarning ? "text-amber-700" : "text-red-600"} shrink-0`}
          />
          <span
            className={`font-bold uppercase tracking-wider text-[11px] ${
              isWarning ? "text-amber-950" : "text-red-950"
            }`}
          >
            {details.type.replace(/_/g, " ")}
          </span>
        </div>
        <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-600">
          Action Required
        </span>
      </div>

      {/* 4-Part Explainability Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {/* 1. WHAT HAPPENED */}
        <div className="bg-white p-3 rounded-lg border border-slate-200/80 space-y-1">
          <span className="font-bold text-[10px] uppercase tracking-wider text-slate-400 block flex items-center gap-1">
            <HelpCircle className="w-3 h-3 text-slate-400" /> What Happened
          </span>
          <p className="text-slate-900 font-semibold leading-snug">{details.whatHappened}</p>
        </div>

        {/* 2. WHY */}
        <div className="bg-white p-3 rounded-lg border border-slate-200/80 space-y-1">
          <span className="font-bold text-[10px] uppercase tracking-wider text-slate-400 block flex items-center gap-1">
            <AlertTriangle className="w-3 h-3 text-slate-400" /> Why This Occurred
          </span>
          <p className="text-slate-700 leading-snug">{details.why}</p>
        </div>

        {/* 3. WHAT CARELOOP CAN DO */}
        <div className="bg-white p-3 rounded-lg border border-slate-200/80 space-y-1">
          <span className="font-bold text-[10px] uppercase tracking-wider text-teal-700 block flex items-center gap-1">
            <Wrench className="w-3 h-3 text-teal-600" /> What CareLoop Can Do
          </span>
          <p className="text-slate-700 leading-snug">{details.whatCareLoopCanDo}</p>
        </div>

        {/* 4. WHAT THE HUMAN NEEDS TO DO */}
        <div className="bg-white p-3 rounded-lg border border-slate-200/80 space-y-1">
          <span className="font-bold text-[10px] uppercase tracking-wider text-indigo-700 block flex items-center gap-1">
            <UserCheck className="w-3 h-3 text-indigo-600" /> What You Need To Do
          </span>
          <p className="text-slate-900 font-semibold leading-snug">{details.whatHumanNeedsToDo}</p>
        </div>
      </div>

      {/* Action Footer */}
      {(details.primaryActionLabel || details.onRetry) && (
        <div className="pt-2 flex flex-wrap items-center justify-end gap-2 border-t border-slate-200/60">
          {details.onRetry && (
            <Button
              variant="outline"
              size="sm"
              onClick={details.onRetry}
              className="text-xs h-8 gap-1 border-slate-300"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retry Action</span>
            </Button>
          )}

          {details.primaryActionHref && (
            <Link href={details.primaryActionHref}>
              <Button
                variant="primary"
                size="sm"
                className="bg-slate-900 hover:bg-slate-800 text-white text-xs h-8 gap-1.5 shadow-sm"
              >
                <span>{details.primaryActionLabel || "Resolve Issue"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          )}

          {details.onPrimaryAction && !details.primaryActionHref && (
            <Button
              variant="primary"
              size="sm"
              onClick={details.onPrimaryAction}
              className="bg-slate-900 hover:bg-slate-800 text-white text-xs h-8 gap-1.5 shadow-sm"
            >
              <span>{details.primaryActionLabel || "Resolve Issue"}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
