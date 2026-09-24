"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useCareLoop } from "@/providers/AppProvider";
import { useCoordinatorContext } from "@/hooks/useCoordinatorContext";
import { VoiceCareButton } from "@/components/voice/VoiceCareButton";
import { NotificationCenter } from "@/components/notifications/NotificationCenter";
import { EmergencyAccessModal } from "@/components/shared/EmergencyAccessModal";

export function Header() {
  const pathname = usePathname();
  const { members, family } = useCareLoop();
  const { greeting, activeUser } = useCoordinatorContext();
  const [isEmergencyOpen, setIsEmergencyOpen] = useState(false);

  // Close any open header modals automatically when route changes
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setIsEmergencyOpen(false);
  }

  const primaryCoord = members.find((m) => m.id === family?.primaryCoordinatorId);
  const isAvailable = family?.isCoordinatorAvailable ?? true;

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
    return "Overview";
  };

  const pageTitle = getPageTitle(pathname);

  return (
    <header className="h-16 px-4 md:px-6 bg-white/80 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-30 flex items-center justify-between transition-all">
      {/* Left: Dynamic Breadcrumb & Contextual Personalization */}
      <div className="flex items-center gap-3">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <span>The Rao Family</span>
            <span className="text-slate-300">/</span>
            <span className="text-slate-800 font-semibold">{pageTitle}</span>
          </div>

          <div className="flex items-center gap-2 mt-0.5">
            <h1 className="text-base font-bold text-slate-900 leading-tight">
              {pageTitle === "Home" ? `Care Overview · ${activeUser.name.split(" ")[0]}` : pageTitle}
            </h1>
            <span className="hidden lg:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200/70">
              Viewing as {activeUser.name} ({activeUser.relationship})
            </span>
          </div>
        </div>
      </div>

      {/* Right: Actions (Attention Badge, Continuity Status, Notifications, Voice Check, Emergency Access) */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Dynamic Attention Status Badge */}
        {greeting.attentionCount > 0 ? (
          <Link
            href="/care"
            className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold hover:bg-rose-100 transition-colors"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse" />
            <span>
              {greeting.attentionCount}{" "}
              {greeting.attentionCount === 1 ? "thing needs attention" : "things need attention"}
            </span>
          </Link>
        ) : (
          <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>All caught up</span>
          </span>
        )}

        {/* Care Coordinator Availability Status */}
        <Link
          href="/continuity"
          className={`hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all ${
            isAvailable
              ? "bg-emerald-50/70 border-emerald-200 text-emerald-800 hover:bg-emerald-100"
              : "bg-amber-100 border-amber-300 text-amber-900 hover:bg-amber-200"
          }`}
          title="Care Continuity Protocol: Coordinator availability status"
        >
          {isAvailable ? (
            <>
              <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>{primaryCoord?.name?.split(" ")[0] || "Coordinator"}: Available</span>
            </>
          ) : (
            <>
              <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
              <span className="font-bold">Handover Needed</span>
            </>
          )}
        </Link>

        {/* Notification Center */}
        <NotificationCenter />

        {/* Voice Coordination Check Trigger */}
        <VoiceCareButton variant="header" />

        {/* Emergency Info Modal Trigger */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsEmergencyOpen(true)}
          className="text-xs border-slate-200 text-slate-700 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 h-8"
        >
          <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
          <span className="hidden sm:inline">Emergency Access</span>
        </Button>
      </div>

      {/* Emergency Dossier Modal */}
      <EmergencyAccessModal
        isOpen={isEmergencyOpen}
        onClose={() => setIsEmergencyOpen(false)}
        defaultMemberId={activeUser.id}
      />
    </header>
  );
}
