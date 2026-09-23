"use client";

import React, { useState } from "react";
import {
  Lock,
  MapPin,
  ChevronRight,
  ShieldAlert,
  GitBranch,
  Pill,
  Calendar,
  FileText,
  ShieldCheck,
} from "lucide-react";
import { useCareLoop } from "@/providers/AppProvider";
import { FamilyMember } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Tabs } from "@/components/ui/Tabs";

export function FamilyScreen() {
  const { members, medications, appointments, records, tasks } = useCareLoop();
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);
  const [filterTab, setFilterTab] = useState<string>("all");

  const filteredMembers = members.filter((m) => {
    if (filterTab === "dependents") return m.role === "DEPENDENT";
    if (filterTab === "coordinators") return m.role === "CARE_COORDINATOR" || m.role === "MEMBER";
    return true;
  });

  const getMemberMeds = (memberId: string) => medications.filter((m) => m.patientId === memberId);
  const getMemberAppts = (memberId: string) => appointments.filter((a) => a.patientId === memberId);
  const getMemberRecords = (memberId: string) => records.filter((r) => r.patientId === memberId);
  const getMemberTasks = (memberId: string) => tasks.filter((t) => t.familyMemberId === memberId);

  // Group members into Family Hierarchy
  const parents = members.filter((m) => m.relationship === "Mother" || m.relationship === "Father");
  const coordinators = members.filter((m) => m.role === "CARE_COORDINATOR" || m.role === "OWNER");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
              Family Circle
            </span>
            <span className="text-xs text-slate-400 font-mono">Coordinated Unit Model</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            The Rao Family
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Coordinated care structure across Hyderabad, Bengaluru, and Chennai with explicit privacy boundaries.
          </p>
        </div>

        <Tabs
          tabs={[
            { id: "all", label: "Member Directory", count: members.length },
            { id: "tree", label: "Coordinated Hierarchy", count: 4 },
            { id: "dependents", label: "Parents & Dependents", count: parents.length },
            { id: "coordinators", label: "Care Coordinators", count: coordinators.length },
          ]}
          activeTab={filterTab}
          onChange={setFilterTab}
        />
      </div>

      {/* Security & Permissions Disclaimer */}
      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3 text-xs text-slate-600">
        <Lock className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="text-slate-800">Permissions Policy:</strong> Health records and payment authorizations are restricted to designated coordinators. Sensitive medical records are not broadcasted without explicit family role permission.
        </div>
      </div>

      {/* VIEW MODE 1: Coordinated Family Hierarchy Tree View */}
      {filterTab === "tree" ? (
        <div className="space-y-6">
          <div className="p-4 rounded-xl bg-gradient-to-r from-slate-900 to-teal-950 text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <GitBranch className="w-4 h-4 text-teal-400" />
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider">
                  The Rao Family Care Graph
                </h2>
                <p className="text-[11px] text-slate-300">
                  Visual relationship mapping connecting elderly parents with remote adult coordinators.
                </p>
              </div>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-teal-800/80 text-teal-200 border border-teal-700/60">
              Coordinated Care Unit
            </span>
          </div>

          <div className="space-y-6">
            {/* Branch 1: Parents / Dependents */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-amber-500" />
                  <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider">
                    Parents &amp; In-Home Dependents (Hyderabad Residence)
                  </h3>
                </div>
                <span className="text-xs text-slate-500">Living with Grandparents • Jubilee Hills</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {parents.map((p) => {
                  const meds = getMemberMeds(p.id);
                  const appts = getMemberAppts(p.id);
                  const recs = getMemberRecords(p.id);
                  const memberTasks = getMemberTasks(p.id);

                  return (
                    <div key={p.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-slate-900 text-sm">{p.name}</h4>
                            <span className="text-xs text-slate-500">({p.relationship}, {p.age}y)</span>
                          </div>
                          <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-slate-400" /> {p.location}
                          </p>
                        </div>
                        <Badge variant="warning">Dependent</Badge>
                      </div>

                      {/* Care Duties & Summary */}
                      <p className="text-[11px] text-slate-700 bg-white p-2.5 rounded-lg border border-slate-200/60 leading-relaxed">
                        <strong>Care Focus:</strong> {p.healthStatusSummary}
                      </p>

                      {/* Nested Entities */}
                      <div className="space-y-1.5 text-[11px]">
                        {/* Meds */}
                        <div className="bg-white p-2 rounded border border-slate-200/80 flex items-center justify-between">
                          <span className="text-slate-600 flex items-center gap-1.5 font-medium">
                            <Pill className="w-3.5 h-3.5 text-teal-600" /> Active Medicines
                          </span>
                          <span className="font-semibold text-slate-900">
                            {meds.map((m) => `${m.name} (${m.remainingDays}d left)`).join(", ")}
                          </span>
                        </div>

                        {/* Appointments */}
                        <div className="bg-white p-2 rounded border border-slate-200/80 flex items-center justify-between">
                          <span className="text-slate-600 flex items-center gap-1.5 font-medium">
                            <Calendar className="w-3.5 h-3.5 text-blue-600" /> Next Consultation
                          </span>
                          <span className="font-semibold text-slate-900">
                            {appts[0] ? `${appts[0].doctor} (${appts[0].date})` : "None scheduled"}
                          </span>
                        </div>

                        {/* Reports */}
                        <div className="bg-white p-2 rounded border border-slate-200/80 flex items-center justify-between">
                          <span className="text-slate-600 flex items-center gap-1.5 font-medium">
                            <FileText className="w-3.5 h-3.5 text-purple-600" /> Clinical Vault
                          </span>
                          <span className="font-semibold text-slate-900">
                            {recs.length} verified hospital documents
                          </span>
                        </div>
                      </div>

                      <div className="pt-2 flex items-center justify-between border-t border-slate-200/60">
                        <span className="text-[10px] text-slate-500 font-mono">
                          {memberTasks.length} active tasks
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedMember(p)}
                          className="h-7 text-xs px-2.5"
                        >
                          <span>Full Dossier</span>
                          <ChevronRight className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Branch 2: Adult Children / Coordinators */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider">
                    Care Coordinators &amp; Remote Adult Children
                  </h3>
                </div>
                <span className="text-xs text-slate-500">Autonomous Execution with Consent Gates</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {coordinators.map((c) => (
                  <div key={c.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-900 text-sm">{c.name}</h4>
                          <span className="text-xs text-slate-500">({c.relationship}, {c.age}y)</span>
                        </div>
                        <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-slate-400" /> {c.location}
                        </p>
                      </div>
                      <Badge variant={c.role === "OWNER" ? "success" : "info"}>
                        {c.role === "OWNER" ? "Primary Coordinator" : "Backup Coordinator"}
                      </Badge>
                    </div>

                    <div className="p-2.5 rounded-lg bg-white border border-slate-200/80 text-[11px] space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        Assigned Responsibilities
                      </span>
                      <p className="text-slate-700 leading-snug">
                        {c.role === "OWNER"
                          ? "Overall family care management, Pine Labs financial sign-offs, and hospital dossier prep."
                          : "Remote emergency escalation contact, voice follow-up reviews, and backup coordination."}
                      </p>
                    </div>

                    <div className="pt-2 flex items-center justify-between border-t border-slate-200/60">
                      <span className="text-[10px] text-emerald-800 font-semibold flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-emerald-600" /> 2FA Consent Enabled
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedMember(c)}
                        className="h-7 text-xs px-2.5"
                      >
                        <span>Role Permissions</span>
                        <ChevronRight className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* VIEW MODE 2: Standard Member Directory Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredMembers.map((member) => {
            const meds = getMemberMeds(member.id);
            const appts = getMemberAppts(member.id);
            const recs = getMemberRecords(member.id);
            const memberTasks = getMemberTasks(member.id);

            return (
              <div
                key={member.id}
                className="p-5 rounded-xl subtle-card flex flex-col justify-between hover:border-slate-300 transition-all space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-sm border ${member.avatarColor}`}
                      >
                        {member.name.split(" ").map((n) => n[0]).join("")}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-base font-bold text-slate-900">{member.name}</h2>
                          <span className="text-xs text-slate-400 font-mono">({member.relationship})</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-400" /> {member.location}
                          </span>
                          <span>•</span>
                          <span>Age {member.age}</span>
                        </div>
                      </div>
                    </div>

                    <Badge
                      variant={
                        member.role === "CARE_COORDINATOR"
                          ? "info"
                          : member.role === "DEPENDENT"
                          ? "warning"
                          : "neutral"
                      }
                    >
                      {member.role.replace(/_/g, " ")}
                    </Badge>
                  </div>

                  {/* Health Summary */}
                  <p className="text-xs text-slate-600 mt-3 p-2.5 bg-slate-50 rounded-lg leading-relaxed border border-slate-100">
                    {member.healthStatusSummary}
                  </p>

                  {/* Operational Counts */}
                  <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-100 text-center">
                    <div className="p-2 rounded bg-slate-50 border border-slate-100">
                      <span className="text-xs font-bold text-slate-900 block font-mono">
                        {meds.length}
                      </span>
                      <span className="text-[10px] text-slate-500 uppercase tracking-tight">
                        Medications
                      </span>
                    </div>
                    <div className="p-2 rounded bg-slate-50 border border-slate-100">
                      <span className="text-xs font-bold text-slate-900 block font-mono">
                        {appts.length}
                      </span>
                      <span className="text-[10px] text-slate-500 uppercase tracking-tight">
                        Appointments
                      </span>
                    </div>
                    <div className="p-2 rounded bg-slate-50 border border-slate-100">
                      <span className="text-xs font-bold text-slate-900 block font-mono">
                        {recs.length}
                      </span>
                      <span className="text-[10px] text-slate-500 uppercase tracking-tight">
                        Records
                      </span>
                    </div>
                  </div>

                  {/* Conditions & Blood Group */}
                  <div className="mt-3 flex flex-wrap items-center gap-1.5">
                    <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-red-50 text-red-700 border border-red-200">
                      Blood {member.bloodGroup}
                    </span>
                    {member.conditions.map((c, i) => (
                      <span
                        key={i}
                        className="text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Action Button */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-400">
                    {memberTasks.length} active coordination tasks
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedMember(member)}
                    className="text-xs gap-1 border-slate-200 hover:border-slate-400"
                  >
                    <span>Health Dossier</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Member Deep Detail Modal */}
      <Modal
        isOpen={!!selectedMember}
        onClose={() => setSelectedMember(null)}
        title={selectedMember ? `${selectedMember.name} — Full Health Dossier` : ""}
        description={selectedMember ? `Clinical profile, emergency guidelines, and role permissions.` : ""}
        maxWidth="lg"
      >
        {selectedMember && (
          <div className="space-y-4">
            {/* Primary Details Card */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {selectedMember.name} ({selectedMember.relationship})
                  </h3>
                  <p className="text-xs text-slate-500">
                    {selectedMember.location} • Age {selectedMember.age}
                  </p>
                </div>
                <Badge variant="info">{selectedMember.role.replace(/_/g, " ")}</Badge>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 font-semibold block uppercase text-[10px]">
                    Primary Physician
                  </span>
                  <span className="font-semibold text-slate-800">
                    {selectedMember.primaryPhysician || "Dr. K. S. Rao (Apollo)"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block uppercase text-[10px]">
                    Insurance ID
                  </span>
                  <span className="font-mono text-slate-800">
                    {selectedMember.insuranceId || "STAR-HLTH-994827"}
                  </span>
                </div>
              </div>
            </div>

            {/* Emergency & Allergies */}
            <div className="p-4 rounded-xl border border-red-200 bg-red-50/20 space-y-2 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-red-900">
                <ShieldAlert className="w-4 h-4 text-red-600" />
                <span>Emergency Contact & Critical Protocols</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-700 pt-1">
                <div>
                  <span className="text-[11px] text-slate-500 block">Attendant:</span>
                  <span className="font-semibold">
                    {selectedMember.emergencyContact.name} ({selectedMember.emergencyContact.phone})
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 block">Preferred Hospital:</span>
                  <span className="font-semibold">
                    {selectedMember.emergencyContact.preferredHospital}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 block">Known Allergies:</span>
                  <span className="font-bold text-red-600">
                    {selectedMember.allergies.join(", ") || "None recorded"}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 block">Blood Group:</span>
                  <span className="font-bold text-slate-900 font-mono">
                    {selectedMember.bloodGroup}
                  </span>
                </div>
              </div>
            </div>

            {/* Permissions Matrix */}
            <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2.5">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-slate-500" /> Granular Permissions Matrix
              </h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-100">
                  <span className="text-slate-600">View Medical Records</span>
                  <span className="font-semibold text-emerald-700">
                    {selectedMember.permissions.canViewRecords ? "Enabled" : "Restricted"}
                  </span>
                </div>
                <div className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-100">
                  <span className="text-slate-600">Approve Payments</span>
                  <span className="font-semibold text-emerald-700">
                    {selectedMember.permissions.canApprovePayments ? "Enabled" : "Restricted"}
                  </span>
                </div>
                <div className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-100">
                  <span className="text-slate-600">Manage Medications</span>
                  <span className="font-semibold text-slate-700">
                    {selectedMember.permissions.canManageMedications ? "Enabled" : "Restricted"}
                  </span>
                </div>
                <div className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-100">
                  <span className="text-slate-600">Schedule Appointments</span>
                  <span className="font-semibold text-slate-700">
                    {selectedMember.permissions.canCoordinateAppointments ? "Enabled" : "Restricted"}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="secondary" onClick={() => setSelectedMember(null)}>
                Close Dossier
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
