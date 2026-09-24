"use client";

import React, { useState } from "react";
import {
  Phone,
  ShieldAlert,
  Hospital,
  Pill,
  Heart,
  Check,
  Copy,
  UserCheck,
  FileText,
  AlertTriangle,
  Ambulance,
} from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useCareLoop } from "@/providers/AppProvider";
import { FamilyAvatar } from "@/components/ui/FamilyAvatar";

interface EmergencyAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMemberId?: string;
}

export function EmergencyAccessModal({
  isOpen,
  onClose,
  defaultMemberId = "mem-anita",
}: EmergencyAccessModalProps) {
  const { members, medications, records, activeUser, family, logActivity } = useCareLoop();
  const [selectedMemberId, setSelectedMemberId] = useState(defaultMemberId);
  const [copied, setCopied] = useState(false);

  const selectedMember =
    members.find((m) => m.id === selectedMemberId) || members[0];

  const primaryCoord = members.find((m) => m.id === family?.primaryCoordinatorId);
  const isCoordAvailable = family?.isCoordinatorAvailable ?? true;

  const memberMedications = medications.filter(
    (m) => m.patientId === selectedMember?.id && m.status === "ACTIVE"
  );

  const memberRecords = records
    .filter((r) => r.patientId === selectedMember?.id)
    .slice(0, 2);

  const handleShareProfile = () => {
    if (!selectedMember) return;
    const text = `CARELOOP EMERGENCY MEDICAL PROFILE\nPatient: ${selectedMember.name} (${selectedMember.relationship}, Age: ${selectedMember.age})\nBlood Group: ${selectedMember.bloodGroup}\nHospital: ${selectedMember.emergencyContact.preferredHospital}\nEmergency Contact: ${selectedMember.emergencyContact.name} (${selectedMember.emergencyContact.phone} - ${selectedMember.emergencyContact.relation})\nAllergies: ${selectedMember.allergies.join(", ") || "None documented"}\nConditions: ${selectedMember.conditions.join(", ")}\nActive Meds: ${memberMedications.map((m) => `${m.name} ${m.dosage}`).join(", ")}`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }

    logActivity({
      actor: { id: activeUser.id, name: activeUser.name, type: "USER" },
      actionType: "EMERGENCY_ACCESS_GRANTED",
      entityType: "MEMBER",
      entityId: selectedMember.id,
      description: `${activeUser.name} accessed emergency medical profile for ${selectedMember.name} (${selectedMember.bloodGroup}).`,
      whyExplanation:
        "Emergency clinical dossier accessed for urgent triage / first responders. Action recorded with full provenance timestamp.",
    });
  };

  if (!selectedMember) return null;

  const modalFooter = (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <a
          href={`tel:${selectedMember.emergencyContact.phone}`}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer"
        >
          <Phone className="w-3.5 h-3.5" /> Call Primary Attendant
        </a>

        <button
          type="button"
          onClick={handleShareProfile}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs border border-slate-200 transition-colors cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-600" /> Copied Dossier
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-slate-600" /> View Emergency Dossier
            </>
          )}
        </button>
      </div>

      <Button variant="outline" size="sm" onClick={onClose} className="text-xs font-semibold">
        Close
      </Button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Emergency Access"
      description="Access critical family health information when normal coordination isn't available."
      headerBadge={
        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-100 text-rose-800 border border-rose-200 uppercase tracking-wide">
          TEMPORARY ACCESS · READ-ONLY
        </span>
      }
      footer={modalFooter}
      maxWidth="xl"
    >
      <div className="space-y-4">
        {/* SECTION 1: Current Family Member Selector & Summary */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-500">
            <span>1. Current Family Member</span>
            <span className="font-mono text-slate-400">Select to view triage profile</span>
          </div>

          <div className="flex items-center gap-2 p-1.5 bg-slate-100/80 rounded-xl overflow-x-auto">
            {members.map((member) => {
              const isSelected = member.id === selectedMemberId;
              return (
                <button
                  key={member.id}
                  type="button"
                  onClick={() => setSelectedMemberId(member.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 cursor-pointer ${
                    isSelected
                      ? "bg-white text-slate-900 shadow-xs font-semibold"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <FamilyAvatar member={member} size="xs" />
                  <span>{member.name.split(" ")[0]}</span>
                  <span className="text-[10px] text-slate-400 font-mono font-bold">
                    {member.bloodGroup}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <FamilyAvatar member={selectedMember} size="md" />
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  {selectedMember.name}
                  <span className="text-xs font-normal text-slate-500 ml-1.5">
                    ({selectedMember.relationship}, {selectedMember.age} yrs)
                  </span>
                </h3>
                <p className="text-xs text-slate-500">{selectedMember.location}</p>
              </div>
            </div>

            <div className="shrink-0 px-3 py-1 rounded-xl bg-rose-600 text-white font-mono font-bold text-xs shadow-xs">
              Blood: {selectedMember.bloodGroup}
            </div>
          </div>
        </div>

        {/* SECTION 2: Emergency Contacts & Dispatch Numbers */}
        <div className="space-y-1.5">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            2. Emergency Contacts &amp; First Responders
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
            <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Primary Family Attendant
              </span>
              <p className="font-semibold text-slate-900">
                {selectedMember.emergencyContact.name} ({selectedMember.emergencyContact.relation})
              </p>
              <div className="flex items-center justify-between pt-1">
                <span className="font-mono text-slate-600">
                  {selectedMember.emergencyContact.phone}
                </span>
                <a
                  href={`tel:${selectedMember.emergencyContact.phone}`}
                  className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold text-[11px] hover:bg-emerald-100 transition-colors flex items-center gap-1"
                >
                  <Phone className="w-3 h-3 text-emerald-600" /> Dial
                </a>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Preferred Emergency Hospital
              </span>
              <p className="font-semibold text-slate-900 flex items-center gap-1.5 truncate">
                <Hospital className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                <span className="truncate">{selectedMember.emergencyContact.preferredHospital}</span>
              </p>
              <div className="flex items-center justify-between pt-1 text-[11px]">
                <span className="text-slate-500">Ambulance Emergency</span>
                <a
                  href="tel:108"
                  className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200 font-semibold hover:bg-rose-100 transition-colors flex items-center gap-1"
                >
                  <Ambulance className="w-3 h-3 text-rose-600" /> 108
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 3: Allergies & Clinical Warnings */}
        <div className="space-y-1.5">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            <span>3. Allergies &amp; Critical Warnings</span>
          </div>
          <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200 text-xs text-amber-950 space-y-1.5">
            <div className="flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-900">Drug Allergies: </span>
                <span className="font-semibold text-rose-800">
                  {selectedMember.allergies.length > 0
                    ? selectedMember.allergies.join(", ")
                    : "No known adverse drug allergies documented"}
                </span>
              </div>
            </div>
            <div className="flex items-start gap-2 pl-6 text-[11px] text-slate-700">
              <span className="font-semibold text-slate-900">Chronic Conditions: </span>
              <span>{selectedMember.conditions.join(", ") || "None documented"}</span>
            </div>
          </div>
        </div>

        {/* SECTION 4: Active Medications */}
        <div className="space-y-1.5">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
            <Pill className="w-3.5 h-3.5 text-teal-600" />
            <span>4. Active Medications</span>
          </div>
          <div className="p-3 rounded-xl bg-white border border-slate-200 text-xs">
            {memberMedications.length > 0 ? (
              <ul className="divide-y divide-slate-100 space-y-1">
                {memberMedications.map((m) => (
                  <li key={m.id} className="pt-1 first:pt-0 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-900">{m.name}</span>
                      <span className="text-slate-500 ml-1.5 text-[11px]">{m.dosage}</span>
                    </div>
                    <span className="text-[11px] font-mono text-slate-600 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200">
                      {m.frequency} · {m.instructions}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-slate-500 text-xs italic">No active medications registered.</p>
            )}
          </div>
        </div>

        {/* SECTION 5: Recent Critical Health Information */}
        <div className="space-y-1.5">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
            <Heart className="w-3.5 h-3.5 text-rose-500" />
            <span>5. Recent Critical Health Information</span>
          </div>
          <div className="p-3 rounded-xl bg-white border border-slate-200 text-xs space-y-1">
            {memberRecords.length > 0 ? (
              memberRecords.map((r) => (
                <div key={r.id} className="flex items-center justify-between text-xs py-0.5">
                  <div className="flex items-center gap-1.5 truncate pr-2">
                    <FileText className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                    <span className="font-semibold text-slate-800 truncate">{r.title}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono shrink-0">{r.date}</span>
                </div>
              ))
            ) : (
              <p className="text-slate-500 text-xs italic">Resting vitals stable; no acute hospital events logged.</p>
            )}
          </div>
        </div>

        {/* SECTION 6: Current Care Coordinator */}
        <div className="space-y-1.5">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
            <UserCheck className="w-3.5 h-3.5 text-teal-600" />
            <span>6. Current Care Coordinator</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="font-semibold text-slate-900">
                {primaryCoord?.name || "Arjun Rao"} ({primaryCoord?.relationship || "Son"}, {primaryCoord?.location || "Bengaluru"})
              </p>
              <p className="text-[11px] text-slate-500">
                Backup Authority: Dr. Meera Rao (Daughter / Physician, Boston)
              </p>
            </div>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                isCoordAvailable
                  ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                  : "bg-amber-50 text-amber-900 border-amber-200"
              }`}
            >
              {isCoordAvailable ? "Active · Available" : "Away · Handover Ready"}
            </span>
          </div>
        </div>

        {/* SECTION 7: Access Reason & Audit Notice */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 space-y-1.5">
          <div className="flex items-center justify-between text-slate-900 font-bold">
            <span>7. Access Protocol &amp; Immutable Audit Notice</span>
            <span className="font-mono text-[10px] text-slate-500">
              User: {activeUser.name.split(" ")[0]}
            </span>
          </div>
          <ul className="list-disc pl-4 space-y-0.5 text-slate-600 leading-relaxed">
            <li>
              <strong>Temporary &amp; Read-Only:</strong> Emergency access is granted in read-only mode to prevent unintended alteration of health records.
            </li>
            <li>
              <strong>Immutable Audit Logging:</strong> Access timestamp and requesting profile are logged permanently to the family care journal.
            </li>
            <li>
              <strong>Not an Emergency Service:</strong> CareLoop provides administrative coordination and records access. For life-threatening emergencies, dial 108 or 112 immediately.
            </li>
          </ul>
        </div>
      </div>
    </Modal>
  );
}
