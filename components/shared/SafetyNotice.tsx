import React from "react";
import { ShieldCheck } from "lucide-react";

interface SafetyNoticeProps {
  text?: string;
  className?: string;
}

export function SafetyNotice({
  text = "CareLoop coordinates administrative schedules, payments, and delivery rails. All clinical decisions, dosages, and medical interpretations remain strictly with licensed doctors.",
  className = "",
}: SafetyNoticeProps) {
  return (
    <div
      className={`p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-start gap-2.5 ${className}`}
    >
      <ShieldCheck className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
      <span className="leading-relaxed">
        <strong className="text-slate-800 font-semibold">Clinical Boundary: </strong>
        {text}
      </span>
    </div>
  );
}
