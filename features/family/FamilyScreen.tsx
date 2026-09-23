"use client";

import React, { useState } from "react";
import {
  MapPin,
  Pill,
  Calendar,
  FileText,
  ShieldCheck,
  X,
  Phone,
  Clock,
  Lock,
  ArrowRight,
} from "lucide-react";
import { useCareLoop } from "@/providers/AppProvider";
import { FamilyMember } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { RefillWorkflowModal } from "@/components/workflow/RefillWorkflowModal";

export function FamilyScreen() {
  const { members, medications, appointments, records, tasks, activity } = useCareLoop();
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);
  const [dossierTab, setDossierTab] = useState<
    "overview" | "medications" | "appointments" | "records" | "activity" | "permissions"
  >("overview");
  const [refillModalOpen, setRefillModalOpen] = useState(false);
  const [refillMedId, setRefillMedId] = useState("med-thyronorm");

  const getMemberMeds = (memberId: string) => medications.filter((m) => m.patientId === memberId);
  const getMemberAppts = (memberId: string) => appointments.filter((a) => a.patientId === memberId);
  const getMemberRecords = (memberId: string) => records.filter((r) => r.patientId === memberId);
  const getMemberTasks = (memberId: string) => tasks.filter((t) => t.familyMemberId === memberId);
  const getMemberActivity = (memberId: string) =>
    activity.filter((a) => a.entityId === memberId || a.description.includes(selectedMember?.name.split(" ")[0] || ""));

  // Escape key listener for Health Dossier
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && selectedMember) {
        setSelectedMember(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedMember]);

  // Lock body scroll while dossier modal is open
  React.useEffect(() => {
    if (selectedMember) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [selectedMember]);

  const handleOpenDossier = (member: FamilyMember) => {
    setSelectedMember(member);
    setDossierTab("overview");
  };

  const handleTriggerRefillFromDossier = (medId: string) => {
    setRefillMedId(medId);
    setRefillModalOpen(true);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
          The Rao Family
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Who you are responsible for, their care leads, and active health dossiers.
        </p>
      </div>

      {/* Member Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {members.map((member) => {
          const memberMeds = getMemberMeds(member.id);
          const memberAppts = getMemberAppts(member.id);
          const memberTasks = getMemberTasks(member.id);
          const urgentMeds = memberMeds.filter((m) => m.remainingDays <= 5);

          return (
            <div
              key={member.id}
              className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                {/* Member Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-white text-base shadow-xs ${
                        member.role === "OWNER"
                          ? "bg-slate-900"
                          : member.role === "CARE_COORDINATOR"
                          ? "bg-teal-700"
                          : "bg-emerald-600"
                      }`}
                    >
                      {member.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="font-bold text-base text-slate-900">{member.name}</h2>
                        <span className="text-xs text-slate-500">
                          {member.relationship} · {member.age}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{member.location}</span>
                      </div>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold uppercase ${
                      member.role === "OWNER" || member.role === "CARE_COORDINATOR"
                        ? "bg-teal-50 text-teal-800 border border-teal-200"
                        : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {member.role.replace(/_/g, " ")}
                  </span>
                </div>

                {/* What they need / Status Summary */}
                <div className="space-y-1.5 pt-1">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Current Needs &amp; Responsibilities
                  </div>
                  <div className="text-xs text-slate-700 space-y-1">
                    {member.role === "DEPENDENT" || member.relationship === "Mother" || member.relationship === "Father" ? (
                      <>
                        <div className="flex items-center gap-2">
                          <Pill className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>
                            {urgentMeds.length > 0 ? (
                              <strong className="text-red-700">
                                {urgentMeds[0].name} refill needed ({urgentMeds[0].remainingDays} days left)
                              </strong>
                            ) : (
                              `${memberMeds.length} active medications on track`
                            )}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          <span>
                            {memberAppts.length > 0
                              ? `Upcoming: ${memberAppts[0].doctor} (${memberAppts[0].speciality})`
                              : "No immediate appointments"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span>{memberTasks.length} active care coordination tasks</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center gap-2">
                          <ShieldCheck className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                          <span>
                            {member.role === "OWNER"
                              ? "Primary family coordinator • Authorization & budget authority"
                              : "Care coordinator • Medical proxy for prescription management"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Lock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          <span>{member.permissions.categories.length} permissions verified</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">
                  {member.role === "DEPENDENT" ? "Care Lead: Arjun Rao" : "Remote Coordination Lead"}
                </span>
                <Button
                  size="sm"
                  onClick={() => handleOpenDossier(member)}
                  className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-3 h-8 gap-1"
                >
                  <span>Open Health Dossier</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* HEALTH DOSSIER MODAL */}
      {selectedMember && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setSelectedMember(null);
            }
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs"
        >
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Dossier Header */}
            <div className="px-6 py-5 border-b border-slate-200 bg-slate-50/70 flex items-start justify-between shrink-0">
              <div className="flex items-center gap-4">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-white text-lg ${
                    selectedMember.role === "OWNER"
                      ? "bg-slate-900"
                      : selectedMember.role === "CARE_COORDINATOR"
                      ? "bg-teal-700"
                      : "bg-emerald-600"
                  }`}
                >
                  {selectedMember.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-lg text-slate-900">{selectedMember.name}</h3>
                    <Badge variant="neutral" className="text-[10px]">
                      {selectedMember.relationship} · {selectedMember.age}y
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {selectedMember.location} • Care coordinator: <strong>Arjun Rao (Son, Bengaluru)</strong>
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedMember(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Dossier Tabs */}
            <div className="px-6 border-b border-slate-200 flex items-center gap-1 bg-white overflow-x-auto shrink-0">
              {(
                [
                  { id: "overview", label: "Overview" },
                  { id: "medications", label: `Medications (${getMemberMeds(selectedMember.id).length})` },
                  { id: "appointments", label: `Appointments (${getMemberAppts(selectedMember.id).length})` },
                  { id: "records", label: `Records (${getMemberRecords(selectedMember.id).length})` },
                  { id: "activity", label: "Care Activity" },
                  { id: "permissions", label: "Permissions" },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setDossierTab(tab.id)}
                  className={`py-3 px-3.5 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors ${
                    dossierTab === tab.id
                      ? "border-slate-900 text-slate-900"
                      : "border-transparent text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Dossier Tab Content */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              {/* TAB 1: OVERVIEW */}
              {dossierTab === "overview" && (
                <div className="space-y-5">
                  {/* Current Concerns */}
                  <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/40 space-y-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-900">
                      Active Clinical Concerns
                    </span>
                    <div className="text-xs text-slate-800 space-y-1">
                      {getMemberMeds(selectedMember.id).filter((m) => m.remainingDays <= 5).length > 0 ? (
                        <div className="flex items-center justify-between">
                          <p>
                            <strong>Thyroid Medicine Refill:</strong> Stock reaches only 3 days. Below family safety threshold.
                          </p>
                          <Button
                            size="sm"
                            onClick={() => handleTriggerRefillFromDossier("med-thyronorm")}
                            className="bg-slate-900 text-white text-xs h-7 px-2.5"
                          >
                            Refill Now
                          </Button>
                        </div>
                      ) : (
                        <p>No acute concerns. Routine chronic condition tracking active.</p>
                      )}
                    </div>
                  </div>

                  {/* Summary Attributes */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                    <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/50">
                      <span className="text-slate-400 block text-[11px]">Blood Group</span>
                      <strong className="text-slate-900">{selectedMember.bloodGroup}</strong>
                    </div>
                    <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/50">
                      <span className="text-slate-400 block text-[11px]">Primary Physician</span>
                      <strong className="text-slate-900">{selectedMember.primaryPhysician || "Dr. Sumathi Reddy"}</strong>
                    </div>
                    <div className="p-3 rounded-xl border border-slate-200 bg-slate-50/50">
                      <span className="text-slate-400 block text-[11px]">Preferred Language</span>
                      <strong className="text-slate-900 font-mono">
                        {selectedMember.preferredLanguage === "te-IN" ? "Telugu (te-IN)" : "English (en-IN)"}
                      </strong>
                    </div>
                  </div>

                  {/* Emergency Contact */}
                  <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Emergency Contact
                    </span>
                    <div className="flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-slate-900">{selectedMember.emergencyContact.name}</div>
                        <div className="text-slate-500 text-[11px]">
                          {selectedMember.emergencyContact.relation} • {selectedMember.emergencyContact.preferredHospital}
                        </div>
                      </div>
                      <a
                        href={`tel:${selectedMember.emergencyContact.phone}`}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        <Phone className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{selectedMember.emergencyContact.phone}</span>
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: MEDICATIONS */}
              {dossierTab === "medications" && (
                <div className="space-y-3">
                  {getMemberMeds(selectedMember.id).map((med) => (
                    <div
                      key={med.id}
                      className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs flex items-center justify-between text-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-900">{med.name}</span>
                          <span className="text-slate-500 font-medium">({med.dosage})</span>
                          <Badge variant={med.remainingDays <= 5 ? "urgent" : "neutral"} className="text-[10px]">
                            {med.currentStockUnits} tabs left ({med.remainingDays} days)
                          </Badge>
                        </div>
                        <p className="text-slate-500 text-[11px]">
                          {med.instructions} • Prescribed by {med.prescribingDoctor}
                        </p>
                      </div>

                      <Button
                        size="sm"
                        onClick={() => handleTriggerRefillFromDossier(med.id)}
                        className="bg-slate-900 text-white text-xs h-8 px-3"
                      >
                        Refill
                      </Button>
                    </div>
                  ))}
                  {getMemberMeds(selectedMember.id).length === 0 && (
                    <div className="p-6 text-center text-xs text-slate-400">No active medications recorded.</div>
                  )}
                </div>
              )}

              {/* TAB 3: APPOINTMENTS */}
              {dossierTab === "appointments" && (
                <div className="space-y-3">
                  {getMemberAppts(selectedMember.id).map((apt) => (
                    <div
                      key={apt.id}
                      className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-1 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-slate-900">{apt.doctor}</span>
                        <span className="font-mono text-[10px] uppercase px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-semibold">
                          {apt.status}
                        </span>
                      </div>
                      <div className="text-slate-600">
                        {apt.speciality} • {apt.hospital}
                      </div>
                      <div className="text-slate-400 text-[11px] pt-1">
                        Date: {apt.date} at {apt.time}
                      </div>
                    </div>
                  ))}
                  {getMemberAppts(selectedMember.id).length === 0 && (
                    <div className="p-6 text-center text-xs text-slate-400">No appointments scheduled.</div>
                  )}
                </div>
              )}

              {/* TAB 4: RECORDS */}
              {dossierTab === "records" && (
                <div className="space-y-3">
                  {getMemberRecords(selectedMember.id).map((rec) => (
                    <div
                      key={rec.id}
                      className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs flex items-center justify-between text-xs"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-purple-600" />
                          <span className="font-bold text-slate-900">{rec.title}</span>
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {rec.hospital} • {rec.documentType.replace(/_/g, " ")} • Date: {rec.date}
                        </div>
                      </div>
                      <span className="font-mono text-[10px] uppercase px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-bold">
                        {rec.pipelineStatus}
                      </span>
                    </div>
                  ))}
                  {getMemberRecords(selectedMember.id).length === 0 && (
                    <div className="p-6 text-center text-xs text-slate-400">No medical records uploaded.</div>
                  )}
                </div>
              )}

              {/* TAB 5: ACTIVITY */}
              {dossierTab === "activity" && (
                <div className="space-y-2.5">
                  {getMemberActivity(selectedMember.id).slice(0, 6).map((ev) => (
                    <div
                      key={ev.id}
                      className="p-3 rounded-xl border border-slate-100 bg-slate-50/60 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-900">{ev.description}</span>
                        <span className="text-[10px] font-mono text-slate-400">
                          {new Date(ev.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                      {ev.whyExplanation && (
                        <p className="text-[11px] text-slate-500 italic">Why: &ldquo;{ev.whyExplanation}&rdquo;</p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* TAB 6: PERMISSIONS */}
              {dossierTab === "permissions" && (
                <div className="space-y-3 text-xs">
                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                    <span className="font-bold uppercase tracking-wider text-slate-500 block text-[11px]">
                      Access &amp; Role Delegation
                    </span>
                    <p className="text-slate-600 leading-relaxed">
                      {selectedMember.name} has the role of <strong>{selectedMember.role.replace(/_/g, " ")}</strong>.
                      Medical records are encrypted at rest and accessible only by designated family proxies.
                    </p>
                  </div>
                  <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
                    <span className="font-bold text-slate-800 block">Authorized Categories:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedMember.permissions.categories.map((cat) => (
                        <span key={cat} className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-mono text-[10px]">
                          {cat.replace(/_/g, " ")}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Refill Workflow Modal */}
      <RefillWorkflowModal
        isOpen={refillModalOpen}
        onClose={() => setRefillModalOpen(false)}
        medicationId={refillMedId}
      />
    </div>
  );
}
