"use client";

import React, { useState } from "react";
import { PhoneCall } from "lucide-react";
import { VoiceCareModal } from "./VoiceCareModal";

interface VoiceCareButtonProps {
  variant?: "header" | "card" | "banner";
  className?: string;
}

export function VoiceCareButton({
  variant = "header",
  className = "",
}: VoiceCareButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (variant === "card") {
    return (
      <>
        <div
          onClick={() => setIsModalOpen(true)}
          className={`p-4 rounded-xl bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-200/80 hover:border-teal-300 transition-all hover:shadow-xs cursor-pointer group flex items-center justify-between gap-4 ${className}`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
              <PhoneCall className="w-5 h-5 text-teal-100" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-900">
                  Talk to CareLoop (Voice Check)
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-teal-200/70 text-teal-900 font-semibold">
                  Gnani.ai
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                Outbound call in Telugu or English for medications &amp; routine check-in.
              </p>
            </div>
          </div>

          <button className="px-3.5 py-1.5 rounded-lg bg-teal-700 group-hover:bg-teal-800 text-white text-xs font-bold shrink-0 transition-colors shadow-2xs">
            Start Call
          </button>
        </div>

        <VoiceCareModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      </>
    );
  }

  // Default: Header button
  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-100/80 border border-teal-200/80 text-teal-900 text-xs font-semibold transition-all cursor-pointer shadow-2xs ${className}`}
        title="Start Gnani.ai native voice check-in"
      >
        <PhoneCall className="w-3.5 h-3.5 text-teal-600" />
        <span className="hidden sm:inline">Talk to CareLoop</span>
        <span className="sm:hidden">Voice</span>
      </button>

      <VoiceCareModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
}
