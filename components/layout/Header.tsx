"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Bot,
} from "lucide-react";
import { useCareLoop } from "@/providers/AppProvider";
import { useCoordinatorContext } from "@/hooks/useCoordinatorContext";
import { NotificationCenter } from "@/components/notifications/NotificationCenter";
import { EmergencyAccessModal } from "@/components/shared/EmergencyAccessModal";
import { CareLoopAssistantModal } from "@/components/assistant/CareLoopAssistantModal";

export function Header() {
  const pathname = usePathname();
  const { members, family, tasks } = useCareLoop();
  const { greeting, activeUser } = useCoordinatorContext();
  const [isEmergencyOpen, setIsEmergencyOpen] = useState(false);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);

  // Close any open header modals automatically when route changes
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setIsEmergencyOpen(false);
    setIsAssistantOpen(false);
  }

  const primaryCoord = members.find((m) => m.id === family?.primaryCoordinatorId);
  const coordFirstName = primaryCoord?.name?.split(" ")[0] || "Arjun";
  const isAvailable = family?.isCoordinatorAvailable ?? true;

  // Determine critical safety status vs attention vs normal
  const hasSafetyAlert = tasks.some(
    (t) => t.status === "ESCALATED" || t.source === "VOICE_ESCALATION"
  );

  const getPageTitle = (path: string) => {
    if (path === "/") return "Home";
    if (path.startsWith("/family")) return "Family";
    if (path.startsWith("/care")) return "Care";
    if (path.startsWith("/activity")) return "Activity";
    if (path.startsWith("/settings")) return "Settings";
    if (path.startsWith("/continuity")) return "Care Continuity";
    if (path.startsWith("/appointments")) return "Appointments";
    if (path.startsWith("/records")) return "Health Records";
    if (path.startsWith("/medications")) return "Medications";
    if (path.startsWith("/tasks")) return "Tasks";
    if (path.startsWith("/agent")) return "Care Agent";
    return "Overview";
  };

  const pageTitle = getPageTitle(pathname);

  return (
    <header className="h-16 px-4 md:px-6 bg-white/90 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-30 flex items-center justify-between transition-all">
      {/* LEFT SIDE: [Family breadcrumb] / [Current screen] & [Current family/member context] */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="truncate">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <span>The Rao Family</span>
            <span className="text-slate-300">/</span>
            <span className="text-slate-800 font-semibold">{pageTitle}</span>
          </div>

          <div className="flex items-center gap-2 mt-0.5">
            <h1 className="text-sm sm:text-base font-bold text-slate-900 leading-tight truncate">
              {pageTitle === "Home" ? `Care Overview · ${activeUser.name.split(" ")[0]}` : pageTitle}
            </h1>
            <span className="hidden lg:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200/80 shrink-0">
              Viewing as {activeUser.name} ({activeUser.relationship})
            </span>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE TOOLBAR:
          1. [Attention / Safety Status]
          2. [Coordinator Availability]
          3. [Notifications]
          4. [Talk to CareLoop]
          5. [Emergency Access]
      */}
      <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
        {/* 1. Attention / Safety Status */}
        {hasSafetyAlert ? (
          <Link
            href="/tasks"
            className="h-9 px-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-2xs"
            title="Clinical Safety Escalation active"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0 animate-pulse" />
            <span className="hidden sm:inline">Safety alert</span>
          </Link>
        ) : greeting.attentionCount > 0 ? (
          <Link
            href="/care"
            className="h-9 px-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 hover:bg-amber-100 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-2xs"
            title="Unresolved care items require attention"
          >
            <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
            <span className="hidden sm:inline">
              {greeting.attentionCount}{" "}
              {greeting.attentionCount === 1 ? "thing needs attention" : "things need attention"}
            </span>
            <span className="sm:hidden">{greeting.attentionCount} attention</span>
          </Link>
        ) : (
          <Link
            href="/care"
            className="h-9 px-3 rounded-xl bg-emerald-50/70 border border-emerald-200/80 text-emerald-800 hover:bg-emerald-100/70 text-xs font-semibold hidden md:flex items-center gap-1.5 transition-all shadow-2xs"
            title="All care routines verified and up to date"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>All caught up</span>
          </Link>
        )}

        {/* 2. Coordinator Availability */}
        <Link
          href="/continuity"
          className={`h-9 px-3 rounded-xl border text-xs font-medium transition-all shadow-2xs hidden sm:flex items-center gap-1.5 ${
            isAvailable
              ? "bg-emerald-50/60 border-emerald-200 text-emerald-800 hover:bg-emerald-100"
              : "bg-amber-50 border-amber-300 text-amber-900 hover:bg-amber-100"
          }`}
          title="Care Continuity Protocol: Coordinator coverage status"
        >
          <span
            className={`w-2 h-2 rounded-full shrink-0 ${
              isAvailable ? "bg-emerald-500" : "bg-amber-500"
            }`}
          />
          <span className="font-semibold">
            {coordFirstName} · {isAvailable ? "Available" : "Away"}
          </span>
        </Link>

        {/* 3. Notifications with Attached Unread Badge */}
        <NotificationCenter />

        {/* 4. Talk to CareLoop Assistant Modal Trigger */}
        <button
          type="button"
          onClick={() => setIsAssistantOpen(true)}
          className="h-9 px-3 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-semibold text-xs transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-teal-500/20"
          title="Open CareLoop Family Coordination Assistant"
        >
          <Bot className="w-4 h-4 text-teal-200 shrink-0" />
          <span className="hidden sm:inline">Talk to CareLoop</span>
          <span className="sm:hidden">CareLoop</span>
        </button>

        {/* 5. Emergency Access Action */}
        <button
          type="button"
          onClick={() => setIsEmergencyOpen(true)}
          className="h-9 px-3 rounded-xl border border-rose-200 bg-rose-50/90 text-rose-700 hover:bg-rose-100 hover:border-rose-300 font-semibold text-xs transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-rose-500/20"
          title="Open Clinical Emergency Dossier & Contacts"
        >
          <ShieldAlert className="w-3.5 h-3.5 text-rose-600 shrink-0" />
          <span className="hidden sm:inline">Emergency Access</span>
          <span className="sm:hidden">Emergency</span>
        </button>
      </div>

      {/* CareLoop Family Coordination Assistant Modal */}
      <CareLoopAssistantModal
        isOpen={isAssistantOpen}
        onClose={() => setIsAssistantOpen(false)}
      />

      {/* Emergency Dossier & Escalation Modal */}
      <EmergencyAccessModal
        isOpen={isEmergencyOpen}
        onClose={() => setIsEmergencyOpen(false)}
        defaultMemberId={activeUser.id}
      />
    </header>
  );
}
