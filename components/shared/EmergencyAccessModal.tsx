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
  const { members, medications, records, activeUser, logActivity } = useCareLoop();
  const [selectedMemberId, setSelectedMemberId] = useState(defaultMemberId);
  const [copied, setCopied] = useState(false);

  const selectedMember =
    members.find((m) => m.id === selectedMemberId) || members[0];

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

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Emergency Medical Dossier"
      description="Read-only emergency clinical profile formatted for first responders, triage nurses, and family coordinators."
      maxWidth="lg"
    >
      <div className="space-y-4">
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
                <span className="text-[10px] text-slate-400 font-mono">
                  {member.bloodGroup}
                </span>
              </button>
            );
          })}
        </div>

        {/* Patient Hero Dossier Card */}
        <div className="p-4 rounded-2xl bg-rose-50/40 border border-rose-200/80 space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <FamilyAvatar member={selectedMember} size="lg" />
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  {selectedMember.name}
                  <span className="text-xs font-normal text-slate-500">
                    ({selectedMember.relationship}, {selectedMember.age} yrs)
                  </span>
                </h3>
                <p className="text-xs text-slate-600">{selectedMember.location}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="px-3 py-1 rounded-xl bg-rose-600 text-white font-mono font-bold text-xs shadow-xs">
                Blood: {selectedMember.bloodGroup}
              </div>
            </div>
          </div>

          {/* Quick Contact & Hospital Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-white p-3.5 rounded-xl border border-rose-100 shadow-2xs">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Preferred Emergency Hospital
              </span>
              <p className="font-semibold text-slate-800 flex items-center gap-1.5">
                <Hospital className="w-3.5 h-3.5 text-rose-600" />
                {selectedMember.emergencyContact.preferredHospital}
              </p>
              {selectedMember.primaryPhysician && (
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Attending: {selectedMember.primaryPhysician}
                </p>
              )}
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Primary Emergency Contact
              </span>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-slate-800">
                    {selectedMember.emergencyContact.name} (
                    {selectedMember.emergencyContact.relation})
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {selectedMember.emergencyContact.phone}
                  </p>
                </div>
                <a
                  href={`tel:${selectedMember.emergencyContact.phone}`}
                  className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs flex items-center gap-1 shadow-xs transition-colors"
                >
                  <Phone className="w-3 h-3" /> Call
                </a>
              </div>
            </div>
          </div>

          {/* Clinical Profile: Allergies, Conditions & Meds */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1 flex items-center gap-1">
                <ShieldAlert className="w-3 h-3 text-amber-600" /> Allergies & Warnings
              </span>
              <p className="font-semibold text-rose-700">
                {selectedMember.allergies.length > 0
                  ? selectedMember.allergies.join(", ")
                  : "No known adverse drug allergies"}
              </p>

              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mt-2.5 mb-1 flex items-center gap-1">
                <Heart className="w-3 h-3 text-rose-500" /> Chronic Conditions
              </span>
              <p className="text-slate-700">
                {selectedMember.conditions.join(", ") || "None documented"}
              </p>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1 flex items-center gap-1">
                <Pill className="w-3 h-3 text-teal-600" /> Active Medications
              </span>
              {memberMedications.length > 0 ? (
                <ul className="space-y-1 text-slate-800">
                  {memberMedications.map((m) => (
                    <li key={m.id} className="flex items-center justify-between text-xs">
                      <span className="font-medium">{m.name}</span>
                      <span className="text-[11px] text-slate-500 font-mono">
                        {m.dosage} · {m.frequency}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-slate-500 text-xs italic">No active medications logged</p>
              )}

              {memberRecords.length > 0 && (
                <div className="mt-2.5 pt-2 border-t border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                    Latest Clinical Record
                  </span>
                  <p className="text-[11px] text-slate-700 truncate">
                    {memberRecords[0].title} ({memberRecords[0].date})
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Deliberate Emergency Access Protocol & Audit Disclosure */}
        <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl text-[11px] text-slate-600 space-y-1">
          <div className="flex items-center justify-between text-slate-800 font-semibold">
            <span>Accessing as: {activeUser.name} ({activeUser.relationship})</span>
            <span className="font-mono text-[10px] text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">TEMPORARY READ-ONLY</span>
          </div>
          <p className="text-slate-500 leading-relaxed">
            Emergency medical access unlocks vital records, active prescriptions, and attending doctor contacts for triage purposes. Every export is recorded immutably in the family care audit journal.
          </p>
        </div>

        {/* Modal Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-2">
            <a
              href={`tel:${selectedMember.emergencyContact.phone}`}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs transition-colors"
            >
              <Phone className="w-3.5 h-3.5" /> Call Primary Attendant
            </a>

            <button
              type="button"
              onClick={handleShareProfile}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium text-xs border border-slate-200 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" /> Copied Dossier
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" /> Copy Emergency Dossier
                </>
              )}
            </button>
          </div>

          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}
