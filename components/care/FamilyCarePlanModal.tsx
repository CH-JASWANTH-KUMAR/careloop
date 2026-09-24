"use client";

import React, { useState } from "react";
import {
  CheckCircle2,
  Clock,
  UserCheck,
  Calendar,
} from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useCareLoop } from "@/providers/AppProvider";
import { FamilyAvatar } from "@/components/ui/FamilyAvatar";

interface FamilyCarePlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMemberId?: string;
}

export function FamilyCarePlanModal({
  isOpen,
  onClose,
  defaultMemberId = "mem-anita",
}: FamilyCarePlanModalProps) {
  const { members, appointments } = useCareLoop();
  const [selectedMemberId, setSelectedMemberId] = useState(defaultMemberId);

  const selectedMember =
    members.find((m) => m.id === selectedMemberId) || members[0];

  const memberApts = appointments.filter(
    (a) => a.patientId === selectedMember?.id && a.status === "UPCOMING"
  );

  // Responsibilities mapping
  const getResponsibilities = (memberId: string) => {
    if (memberId === "mem-anita") {
      return [
        {
          area: "Medication Refills & Logistics",
          owner: "Arjun Rao",
          relation: "Son (Primary Coordinator)",
          status: "Thyronorm 50mcg refill in transit via Delhivery",
        },
        {
          area: "Clinical Record Oversight",
          owner: "Dr. Meera Rao",
          relation: "Daughter (Physician)",
          status: "Latest TSH & Free T4 blood panel reviewed",
        },
        {
          area: "Daily Wellness Check-in",
          owner: "Arjun Rao / Gnani Voice",
          relation: "Automated Daily",
          status: "Morning dose confirmation logged at 07:30 AM",
        },
      ];
    }
    if (memberId === "mem-ramesh") {
      return [
        {
          area: "Cardiology Consultation & Prep",
          owner: "Arjun Rao & Meera Rao",
          relation: "Joint Coordination",
          status: "Dr. K.S. Rao consultation scheduled Sep 28 · 10:30 AM",
        },
        {
          area: "Post-PTCA Cardiac Regimen",
          owner: "Arjun Rao",
          relation: "Son (Primary Coordinator)",
          status: "Glycomet-SR & Ecosprin adherence monitored",
        },
        {
          area: "ECG & Diagnostic Review",
          owner: "Dr. Meera Rao",
          relation: "Daughter (Physician)",
          status: "Post-stent recovery report verification pending",
        },
      ];
    }
    if (memberId === "mem-arjun") {
      return [
        {
          area: "Primary Coordination Desk",
          owner: "Arjun Rao",
          relation: "Self",
          status: "Managing refills, deliveries & appointments for parents",
        },
        {
          area: "Backup Coverage",
          owner: "Dr. Meera Rao",
          relation: "Sister",
          status: "Active clinical escalation backup",
        },
      ];
    }
    return [
      {
        area: "Clinical Oversight",
        owner: "Dr. Meera Rao",
        relation: "Self",
        status: "Diagnostic review & medical guidance for family",
      },
    ];
  };

  const getTodaySchedule = (memberId: string) => {
    if (memberId === "mem-anita") {
      return [
        {
          time: "07:30 AM",
          title: "Morning Dose: Thyronorm 50 mcg",
          done: true,
          type: "MED",
          detail: "Taken with water 30 mins before morning breakfast.",
        },
        {
          time: "08:15 AM",
          title: "Gnani.ai Routine Voice Wellness Check",
          done: true,
          type: "VOICE",
          detail: "Confirmed stock check & morning dose with Anita.",
        },
        {
          time: "02:00 PM",
          title: "Apollo Pharmacy Cold-Chain Delivery",
          done: false,
          type: "DELIVERY",
          detail: "Courier delivery to Jubilee Hills home address.",
        },
        {
          time: "08:30 PM",
          title: "Evening Blood Pressure Log",
          done: false,
          type: "HEALTH",
          detail: "Log systolic/diastolic reading via Omron monitor.",
        },
      ];
    }
    if (memberId === "mem-ramesh") {
      return [
        {
          time: "08:30 AM",
          title: "Breakfast Cardiac Regimen (Glycomet-SR & Ecosprin)",
          done: true,
          type: "MED",
          detail: "Taken post-breakfast for cardiac & glucose management.",
        },
        {
          time: "11:00 AM",
          title: "Resting Heart Rate Check",
          done: true,
          type: "HEALTH",
          detail: "72 bpm recorded, sinus rhythm stable post-stent.",
        },
        {
          time: "04:30 PM",
          title: "Cardiology Visit Record Compilation",
          done: false,
          type: "TASK",
          detail: "Bundle latest ECG & stent discharge summary for Dr. Rao.",
        },
      ];
    }
    return [
      {
        time: "09:00 AM",
        title: "Family Care Overview",
        done: true,
        type: "TASK",
        detail: "Reviewed parent status & delivery updates.",
      },
      {
        time: "05:00 PM",
        title: "Evening Care Sync with Meera",
        done: false,
        type: "TASK",
        detail: "Review upcoming doctor visit questions.",
      },
    ];
  };

  const todaySchedule = getTodaySchedule(selectedMember?.id || "");
  const responsibilities = getResponsibilities(selectedMember?.id || "");

  if (!selectedMember) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Care Plan — ${selectedMember.name}`}
      description="Shared family coordination plan: daily routines, upcoming milestones, and family responsibility assignments."
      maxWidth="lg"
    >
      <div className="space-y-5">
        {/* Family Member Selector Tabs */}
        <div className="flex items-center gap-2 p-1.5 bg-slate-100/80 rounded-xl overflow-x-auto">
          {members.map((member) => {
            const isSelected = member.id === selectedMemberId;
            return (
              <button
                key={member.id}
                type="button"
                onClick={() => setSelectedMemberId(member.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 ${
                  isSelected
                    ? "bg-white text-slate-900 shadow-xs font-semibold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <FamilyAvatar member={member} size="xs" />
                <span>{member.name.split(" ")[0]}</span>
                <span className="text-[10px] text-slate-400">
                  ({member.relationship})
                </span>
              </button>
            );
          })}
        </div>

        {/* 1. TODAY'S CARE ROUTINE */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-emerald-600" /> Today&apos;s Care Schedule
            </h4>
            <span className="text-[11px] text-slate-500">
              {todaySchedule.filter((s) => s.done).length} of {todaySchedule.length} completed
            </span>
          </div>

          <div className="space-y-2">
            {todaySchedule.map((item, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-xl border flex items-start gap-3 transition-colors ${
                  item.done
                    ? "bg-emerald-50/20 border-emerald-200/60"
                    : "bg-white border-slate-200/80"
                }`}
              >
                <div className="mt-0.5">
                  {item.done ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p
                      className={`text-xs font-semibold ${
                        item.done ? "text-slate-900 line-through text-slate-500" : "text-slate-900"
                      }`}
                    >
                      {item.title}
                    </p>
                    <span className="text-[10px] font-mono text-slate-500 shrink-0">
                      {item.time}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                    {item.detail}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 2. UPCOMING CARE MILESTONES */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-teal-600" /> Upcoming Milestones
          </h4>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
            {memberApts.length > 0 ? (
              memberApts.map((a) => (
                <div
                  key={a.id}
                  className="flex items-center justify-between text-xs py-1 border-b border-slate-200/60 last:border-b-0"
                >
                  <span className="font-medium text-slate-900">
                    {a.speciality} Consultation with {a.doctor}
                  </span>
                  <span className="text-[11px] font-mono text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                    {a.date} · {a.time}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-600">
                Regular clinical review and monitoring on schedule under Dr. Sumathi Reddy.
              </p>
            )}
          </div>
        </div>

        {/* 3. COORDINATION RESPONSIBILITIES */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <UserCheck className="w-3.5 h-3.5 text-indigo-600" /> Family Responsibilities
          </h4>

          <div className="divide-y divide-slate-100 rounded-xl bg-white border border-slate-200/80 overflow-hidden shadow-2xs">
            {responsibilities.map((r, idx) => (
              <div key={idx} className="p-3 flex items-start justify-between gap-3 text-xs">
                <div>
                  <p className="font-semibold text-slate-900">{r.area}</p>
                  <p className="text-slate-600 text-[11px] mt-0.5 leading-relaxed">
                    {r.status}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span className="inline-block px-2 py-0.5 rounded bg-indigo-50 border border-indigo-200 text-indigo-800 text-[10px] font-bold">
                    {r.owner}
                  </span>
                  <p className="text-[10px] text-slate-400 mt-0.5">{r.relation}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between pt-2">
          <p className="text-[11px] text-slate-500 italic">
            Care plans coordinate family tasks and routine adherence. Always follow your physician&apos;s formal medical advice.
          </p>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Done
          </Button>
        </div>
      </div>
    </Modal>
  );
}
