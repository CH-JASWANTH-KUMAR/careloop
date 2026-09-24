"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Activity } from "lucide-react";
import { useCoordinatorContext, FamilyPulseItem } from "@/hooks/useCoordinatorContext";

export function FamilyHealthPulse() {
  const { familyPulse } = useCoordinatorContext();

  const getStatusBadge = (status: FamilyPulseItem["status"], variant: FamilyPulseItem["variant"]) => {
    switch (variant) {
      case "urgent":
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse" />
            <span>{status}</span>
          </span>
        );
      case "waiting":
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
            <span>{status}</span>
          </span>
        );
      case "info":
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
            <span>{status}</span>
          </span>
        );
      case "healthy":
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
            <span>{status}</span>
          </span>
        );
      case "neutral":
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 text-[10px] font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
            <span>{status}</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-3.5">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-teal-600 shrink-0" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Family Health Pulse
            </h2>
          </div>
          <p className="text-sm font-semibold text-slate-900 mt-0.5 font-display">
            Live overview across all generations
          </p>
        </div>

        <Link
          href="/family"
          className="text-xs font-semibold text-teal-700 hover:text-teal-900 inline-flex items-center gap-1 group"
        >
          <span>All member dossiers</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {familyPulse.map((item) => (
          <Link
            key={item.member.id}
            href={`/family`}
            className={`p-4 rounded-xl border transition-all hover:border-slate-300 hover:shadow-sm block ${
              item.isSelf
                ? "bg-gradient-to-b from-teal-50/50 to-white border-teal-200/80 ring-1 ring-teal-500/20"
                : "bg-white border-slate-200/80 shadow-2xs"
            }`}
          >
            <div className="flex items-start justify-between gap-2 mb-2.5">
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-slate-900 text-sm">
                    {item.member.name}
                  </span>
                  {item.isSelf && (
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-teal-100 text-teal-800 font-semibold">
                      You
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 font-medium">
                  {item.member.relationship} · {item.member.location.split(",")[0]}
                </p>
              </div>

              {getStatusBadge(item.status, item.variant)}
            </div>

            <div className="space-y-1.5 text-xs pt-2 border-t border-slate-100">
              <div className="text-slate-800 font-semibold flex items-center gap-1.5 truncate">
                <span className="text-slate-400 font-normal">Next:</span>
                <span className="truncate">{item.nextEvent}</span>
              </div>
              <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                {item.summary}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
