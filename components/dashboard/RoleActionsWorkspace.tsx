"use client";

import React from "react";
import Link from "next/link";
import {
  Pill,
  Calendar,
  FileText,
  Users,
  Heart,
  Volume2,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
import { useCoordinatorContext } from "@/hooks/useCoordinatorContext";
import { useCareLoop } from "@/providers/AppProvider";

interface RoleActionsWorkspaceProps {
  onOpenRefillModal: (medId: string) => void;
  onOpenCarePlanModal: (memberId: string) => void;
  onOpenVoiceModal: (targetMemberId?: string) => void;
}

export function RoleActionsWorkspace({
  onOpenRefillModal,
  onOpenCarePlanModal,
  onOpenVoiceModal,
}: RoleActionsWorkspaceProps) {
  const { activeUser } = useCoordinatorContext();
  const { medications, appointments } = useCareLoop();

  const mumMed = medications.find((m) => m.id === "med-thyronorm");
  const mumDays = mumMed ? mumMed.remainingDays : 3;
  const dadAppt = appointments.find((a) => a.patientId === "mem-ramesh");
  const anitaAppt = appointments.find((a) => a.patientId === "mem-anita");

  const getWorkspaceConfig = () => {
    if (activeUser.id === "mem-arjun") {
      return {
        title: "Arjun's Coordination Actions",
        subtitle: "Quick-access levers for primary family management",
        actions: [
          {
            id: "act-refill",
            title: "Refill Mum's Medication",
            description: "Review and sign off on Thyronorm 50 mcg 60-day pack with Apollo.",
            icon: <Pill className="w-5 h-5 text-emerald-600" />,
            badge: `${mumDays} days left`,
            badgeVariant: mumDays <= 5 ? "urgent" : "healthy",
            onClick: () => onOpenRefillModal("med-thyronorm"),
          },
          {
            id: "act-apt",
            title: "Prepare Dad's Appointment",
            description: `Collate recent vitals and question sheet for ${dadAppt?.doctor || "Dr. K.S. Rao (Cardiology)"}.`,
            icon: <Calendar className="w-5 h-5 text-teal-600" />,
            badge: dadAppt ? `${dadAppt.date} · ${dadAppt.time}` : "Sep 28 · 10:30 AM",
            badgeVariant: "info",
            href: "/appointments",
          },
          {
            id: "act-report",
            title: "Review Latest Lab Report",
            description: "Open Dr. Lal PathLabs thyroid panel verified by Dr. Meera Rao.",
            icon: <FileText className="w-5 h-5 text-indigo-600" />,
            badge: "TSH: 2.4",
            badgeVariant: "neutral",
            href: "/records",
          },
          {
            id: "act-family",
            title: "Check Family Care Status",
            description: "View comprehensive health dossiers and continuity availability.",
            icon: <Users className="w-5 h-5 text-blue-600" />,
            badge: "4 Members",
            badgeVariant: "neutral",
            href: "/family",
          },
        ],
      };
    }

    if (activeUser.id === "mem-anita") {
      return {
        title: "Anita's Personal Care Workspace",
        subtitle: "Daily routines, dosage confirmation & check-ins",
        actions: [
          {
            id: "act-med-log",
            title: "Complete Medication Check",
            description: "Log today's morning Thyronorm 50mcg dose and review remaining days.",
            icon: <Pill className="w-5 h-5 text-emerald-600" />,
            badge: "Daily Routine",
            badgeVariant: "info",
            href: "/medications",
          },
          {
            id: "act-care-plan",
            title: "View Today's Care Plan",
            description: "Check your morning schedule, upcoming deliveries, and evening BP check.",
            icon: <Heart className="w-5 h-5 text-rose-500" />,
            badge: "Daily Schedule",
            badgeVariant: "neutral",
            onClick: () => onOpenCarePlanModal("mem-anita"),
          },
          {
            id: "act-voice",
            title: "Voice Check-in with CareLoop",
            description: "Speak with CareLoop in Telugu or Indian English to confirm wellness.",
            icon: <Volume2 className="w-5 h-5 text-teal-600" />,
            badge: "Gnani.ai Speech",
            badgeVariant: "healthy",
            onClick: () => onOpenVoiceModal("mem-anita"),
          },
          {
            id: "act-apt-anita",
            title: "Check Upcoming Appointments",
            description: anitaAppt
              ? `Review consultation packet with ${anitaAppt.doctor} at ${anitaAppt.hospital}.`
              : "Review physician consultations and schedule routine health reviews.",
            icon: <Calendar className="w-5 h-5 text-indigo-600" />,
            badge: anitaAppt ? `${anitaAppt.date} · ${anitaAppt.time}` : "Apollo Jubilee Hills",
            badgeVariant: "neutral",
            href: "/appointments",
          },
        ],
      };
    }

    if (activeUser.id === "mem-ramesh") {
      return {
        title: "Ramesh's Cardiac Health Workspace",
        subtitle: "Cardiology follow-up, post-stent adherence & vital monitoring",
        actions: [
          {
            id: "act-cardio",
            title: "View Cardiology Appointment",
            description: `${dadAppt?.doctor || "Dr. K.S. Rao"} follow-up consultation scheduled at ${dadAppt?.hospital || "Apollo Hospitals"}.`,
            icon: <Calendar className="w-5 h-5 text-teal-600" />,
            badge: dadAppt ? `${dadAppt.date} · ${dadAppt.time}` : "Sep 28 · 10:30 AM",
            badgeVariant: "info",
            href: "/appointments",
          },
          {
            id: "act-health-check",
            title: "Review Care Plan & Vitals",
            description: "Check daily resting pulse, blood pressure, and recovery milestones.",
            icon: <Heart className="w-5 h-5 text-rose-500" />,
            badge: "72 bpm Sinus",
            badgeVariant: "healthy",
            onClick: () => onOpenCarePlanModal("mem-ramesh"),
          },
          {
            id: "act-ramesh-meds",
            title: "View Heart & Sugar Medications",
            description: "Adherence schedule for Glycomet-SR 500mg, Ecosprin 75mg, and Cardace 2.5mg.",
            icon: <Pill className="w-5 h-5 text-emerald-600" />,
            badge: "3 Active Meds",
            badgeVariant: "neutral",
            href: "/medications",
          },
          {
            id: "act-records-ramesh",
            title: "Review Stent Discharge Summary",
            description: "6-month post-PTCA procedural report and medication guidelines.",
            icon: <FileText className="w-5 h-5 text-blue-600" />,
            badge: "Verified EHR",
            badgeVariant: "neutral",
            href: "/records",
          },
        ],
      };
    }

    // Default / Meera Rao
    return {
      title: "Dr. Meera's Clinical Review Workspace",
      subtitle: "Remote physician oversight and family diagnostic records",
      actions: [
        {
          id: "act-ecg-review",
          title: "Review Ramesh's ECG & Discharge",
          description: "Verify post-PTCA cardiac progression and latest resting telemetry.",
          icon: <FileText className="w-5 h-5 text-indigo-600" />,
          badge: "Clinical Review",
          badgeVariant: "info",
          href: "/records",
        },
        {
          id: "act-thyroid-review",
          title: "Verify Anita's Thyroid Labs",
          description: "Inspect TSH and Free T4 trends under Dr. Sumathi Reddy's guidance.",
          icon: <Heart className="w-5 h-5 text-teal-600" />,
          badge: "Verified",
          badgeVariant: "healthy",
          href: "/records",
        },
        {
          id: "act-continuity-takeover",
          title: "Care Continuity Handoff",
          description: "View coordinator coverage and take over active duties if Arjun travels.",
          icon: <ShieldCheck className="w-5 h-5 text-amber-600" />,
          badge: "Backup Authority",
          badgeVariant: "neutral",
          href: "/continuity",
        },
        {
          id: "act-family-tasks",
          title: "Follow Up on Care Tasks",
          description: "Review pending authorizations and clinical communications.",
          icon: <Users className="w-5 h-5 text-blue-600" />,
          badge: "Coordinated",
          badgeVariant: "neutral",
          href: "/tasks",
        },
      ],
    };
  };

  const config = getWorkspaceConfig();

  const getBadgeClass = (variant: string) => {
    switch (variant) {
      case "urgent":
        return "bg-rose-50 text-rose-700 border-rose-200";
      case "healthy":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "info":
        return "bg-teal-50 text-teal-700 border-teal-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="space-y-3">
      <div>
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Role-Specific Workspace
        </h2>
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-slate-900 mt-0.5 font-display">
            {config.title}
          </p>
          <span className="text-xs text-slate-500 hidden sm:inline">
            {config.subtitle}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {config.actions.map((act) => {
          const content = (
            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:border-teal-300 hover:shadow-xs transition-all flex flex-col justify-between h-full group">
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    {act.icon}
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getBadgeClass(
                      act.badgeVariant
                    )}`}
                  >
                    {act.badge}
                  </span>
                </div>

                <h3 className="text-xs font-bold text-slate-900 group-hover:text-teal-800 transition-colors">
                  {act.title}
                </h3>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                  {act.description}
                </p>
              </div>

              <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-teal-700 group-hover:text-teal-900">
                <span>Open action</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          );

          if (act.href) {
            return (
              <Link key={act.id} href={act.href} className="block cursor-pointer">
                {content}
              </Link>
            );
          }

          return (
            <button
              key={act.id}
              type="button"
              onClick={act.onClick}
              className="text-left w-full cursor-pointer"
            >
              {content}
            </button>
          );
        })}
      </div>
    </div>
  );
}
