"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  Shield,
  Heart,
  PhoneCall,
  Languages,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Plus,
  Trash2,
  Sparkles,
  Info,
} from "lucide-react";
import { useCareLoop } from "@/providers/AppProvider";
import { FamilyMember, FamilyRole, PermissionCategory } from "@/types";
import { ALL_PERMISSION_CATEGORIES } from "@/lib/permissions";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

interface MemberDraft {
  id: string;
  name: string;
  relationship: "Mother" | "Father" | "Son" | "Daughter" | "Spouse" | "Grandparent" | "Other";
  age: number;
  location: string;
  role: FamilyRole;
  bloodGroup: string;
  allergies: string;
  conditions: string;
  primaryPhysician: string;
  preferredLanguage: "en-IN" | "te-IN" | "hi-IN" | "ta-IN";
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelation: string;
  emergencyPreferredHospital: string;
  permissions: PermissionCategory[];
}

const DEFAULT_MEMBERS: MemberDraft[] = [
  {
    id: "mem-owner",
    name: "Arjun Rao",
    relationship: "Son",
    age: 34,
    location: "Bengaluru",
    role: "OWNER",
    bloodGroup: "O+",
    allergies: "None",
    conditions: "Healthy",
    primaryPhysician: "Dr. Arvind Swaminathan",
    preferredLanguage: "en-IN",
    emergencyContactName: "Meera Rao",
    emergencyContactPhone: "+91 98450 11223",
    emergencyContactRelation: "Sister",
    emergencyPreferredHospital: "Manipal Hospital, Bengaluru",
    permissions: [
      "VIEW_RECORDS",
      "UPLOAD_RECORDS",
      "MANAGE_MEDICATIONS",
      "MANAGE_APPOINTMENTS",
      "APPROVE_PAYMENTS",
      "AUTHORIZE_AGENT_ACTIONS",
      "EMERGENCY_ACCESS",
    ],
  },
  {
    id: "mem-parent-1",
    name: "Anita Rao",
    relationship: "Mother",
    age: 63,
    location: "Hyderabad",
    role: "CARE_COORDINATOR",
    bloodGroup: "B+",
    allergies: "Sulfa antibiotics",
    conditions: "Hypothyroidism, Mild Hypertension",
    primaryPhysician: "Dr. K. S. Sharma",
    preferredLanguage: "te-IN",
    emergencyContactName: "Ramesh Rao",
    emergencyContactPhone: "+91 98490 22334",
    emergencyContactRelation: "Spouse",
    emergencyPreferredHospital: "Apollo Hospitals, Jubilee Hills",
    permissions: [
      "VIEW_RECORDS",
      "UPLOAD_RECORDS",
      "MANAGE_MEDICATIONS",
      "MANAGE_APPOINTMENTS",
      "EMERGENCY_ACCESS",
    ],
  },
  {
    id: "mem-parent-2",
    name: "Ramesh Rao",
    relationship: "Father",
    age: 68,
    location: "Hyderabad",
    role: "DEPENDENT",
    bloodGroup: "A+",
    allergies: "Penicillin",
    conditions: "Type 2 Diabetes, Dyslipidemia",
    primaryPhysician: "Dr. Arvind Swaminathan",
    preferredLanguage: "te-IN",
    emergencyContactName: "Anita Rao",
    emergencyContactPhone: "+91 98490 12345",
    emergencyContactRelation: "Spouse",
    emergencyPreferredHospital: "Apollo Hospitals, Jubilee Hills",
    permissions: ["VIEW_RECORDS", "EMERGENCY_ACCESS"],
  },
];

const STEPS = [
  { id: 1, label: "Family Identity", desc: "Name & spending limit", icon: Users },
  { id: 2, label: "Members", desc: "Add family circle", icon: Heart },
  { id: 3, label: "Care Roles", desc: "Assign coordinators", icon: Shield },
  { id: 4, label: "Permissions", desc: "Explicit category matrix", icon: Shield },
  { id: 5, label: "Emergency Contacts", desc: "Hospital & phone rails", icon: PhoneCall },
  { id: 6, label: "Communication", desc: "Language for Gnani", icon: Languages },
  { id: 7, label: "Review & Activate", desc: "Confirm care loop", icon: CheckCircle2 },
];

export function OnboardingWizard() {
  const router = useRouter();
  const { createFamilyOnboarding, resetToSeedData } = useCareLoop();

  const [currentStep, setCurrentStep] = useState(1);
  const [familyName, setFamilyName] = useState("The Rao Family");
  const [primaryCity, setPrimaryCity] = useState("Hyderabad & Bengaluru");
  const [monthlyLimit, setMonthlyLimit] = useState(15000);
  const [members, setMembers] = useState<MemberDraft[]>(DEFAULT_MEMBERS);
  const [primaryCoordinatorId, setPrimaryCoordinatorId] = useState("mem-owner");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addMember = () => {
    const newId = `mem-${Date.now()}`;
    const newMember: MemberDraft = {
      id: newId,
      name: "",
      relationship: "Other",
      age: 40,
      location: primaryCity.split("&")[0].trim() || "Hyderabad",
      role: "MEMBER",
      bloodGroup: "B+",
      allergies: "None",
      conditions: "",
      primaryPhysician: "",
      preferredLanguage: "en-IN",
      emergencyContactName: "",
      emergencyContactPhone: "",
      emergencyContactRelation: "",
      emergencyPreferredHospital: "",
      permissions: ["VIEW_RECORDS", "EMERGENCY_ACCESS"],
    };
    setMembers([...members, newMember]);
  };

  const removeMember = (id: string) => {
    if (members.length <= 1) return;
    setMembers(members.filter((m) => m.id !== id));
    if (primaryCoordinatorId === id) {
      setPrimaryCoordinatorId(members.find((m) => m.id !== id)?.id || "");
    }
  };

  const updateMember = (id: string, updates: Partial<MemberDraft>) => {
    setMembers(members.map((m) => (m.id === id ? { ...m, ...updates } : m)));
  };

  const togglePermission = (memberId: string, category: PermissionCategory) => {
    setMembers(
      members.map((m) => {
        if (m.id !== memberId) return m;
        const exists = m.permissions.includes(category);
        const next = exists
          ? m.permissions.filter((p) => p !== category)
          : [...m.permissions, category];
        return { ...m, permissions: next };
      })
    );
  };

  const handleFinish = async () => {
    setIsSubmitting(true);

    const formattedMembers: FamilyMember[] = members.map((draft, idx) => ({
      id: draft.id,
      name: draft.name.trim() || `Family Member ${idx + 1}`,
      relationship: draft.relationship,
      age: Number(draft.age) || 30,
      location: draft.location || "Hyderabad",
      role: draft.role,
      healthStatusSummary: draft.conditions || "Active health coordination",
      emergencyContact: {
        name: draft.emergencyContactName || "Family Emergency Contact",
        phone: draft.emergencyContactPhone || "+91 99999 00000",
        relation: draft.emergencyContactRelation || "Family",
        preferredHospital: draft.emergencyPreferredHospital || "City Hospital",
      },
      bloodGroup: draft.bloodGroup || "O+",
      allergies: draft.allergies ? draft.allergies.split(",").map((s) => s.trim()) : [],
      conditions: draft.conditions ? draft.conditions.split(",").map((s) => s.trim()) : [],
      avatarColor:
        draft.role === "OWNER"
          ? "bg-slate-900 text-white"
          : draft.role === "CARE_COORDINATOR"
          ? "bg-emerald-700 text-white"
          : "bg-blue-600 text-white",
      permissions: {
        canViewRecords: draft.permissions.includes("VIEW_RECORDS"),
        canApprovePayments: draft.permissions.includes("APPROVE_PAYMENTS"),
        canManageMedications: draft.permissions.includes("MANAGE_MEDICATIONS"),
        canCoordinateAppointments: draft.permissions.includes("MANAGE_APPOINTMENTS"),
        categories: draft.permissions,
      },
      primaryPhysician: draft.primaryPhysician || "Dr. Primary Physician",
      preferredLanguage: draft.preferredLanguage,
    }));

    const familyData = {
      name: familyName,
      primaryCity,
      memberIds: formattedMembers.map((m) => m.id),
      primaryCoordinatorId,
      isCoordinatorAvailable: true,
      monthlySpendingLimit: monthlyLimit,
    };

    createFamilyOnboarding(familyData, formattedMembers);
    setIsSubmitting(false);
    router.push("/");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200 mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              Real Family Onboarding
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
              Set Up Your Family Care Loop
            </h1>
            <p className="text-sm text-slate-600 mt-1 max-w-2xl">
              Distribute healthcare responsibility across your family circle with explicit
              permissions, emergency protocols, and external rails.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              resetToSeedData();
              router.push("/");
            }}
            className="text-xs text-slate-600 hover:text-slate-900 shrink-0"
          >
            Load Rao Family Demo
          </Button>
        </div>

        {/* Step Indicator */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2 mt-8 pt-6 border-t border-slate-100">
          {STEPS.map((s) => {
            const Icon = s.icon;
            const isActive = currentStep === s.id;
            const isCompleted = currentStep > s.id;
            return (
              <button
                key={s.id}
                onClick={() => setCurrentStep(s.id)}
                className={`flex flex-col items-start p-2.5 rounded-xl text-left transition-all ${
                  isActive
                    ? "bg-slate-900 text-white shadow-sm"
                    : isCompleted
                    ? "bg-emerald-50 text-emerald-900 border border-emerald-200"
                    : "bg-slate-50 text-slate-500 hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center gap-1.5 w-full">
                  <span className="text-[10px] font-mono font-bold opacity-70">0{s.id}</span>
                  <Icon className="w-3.5 h-3.5 ml-auto" />
                </div>
                <div className="text-xs font-semibold mt-1 truncate w-full">{s.label}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Step Contents */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm">
        {/* Step 1: Family Identity */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Step 1: Family Identity & Budget</h2>
              <p className="text-sm text-slate-500 mt-0.5">
                Define the collective family unit name and autonomous spending guardrails.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Family Group Name
                </label>
                <input
                  type="text"
                  value={familyName}
                  onChange={(e) => setFamilyName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                  placeholder="e.g., The Rao Family"
                />
                <p className="text-xs text-slate-400">Used in activity logs and notifications.</p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Primary Cities / Hubs
                </label>
                <input
                  type="text"
                  value={primaryCity}
                  onChange={(e) => setPrimaryCity(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                  placeholder="e.g., Hyderabad & Bengaluru"
                />
                <p className="text-xs text-slate-400">Helps Delhivery logistics routing.</p>
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Monthly Autonomous Spending Limit (₹ INR)
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="5000"
                    max="50000"
                    step="1000"
                    value={monthlyLimit}
                    onChange={(e) => setMonthlyLimit(Number(e.target.value))}
                    className="flex-1 accent-slate-900"
                  />
                  <span className="font-mono font-bold text-base text-slate-900 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                    ₹{monthlyLimit.toLocaleString("en-IN")}
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  CareLoop requires secondary human authorization for any single transaction or
                  accumulated spend exceeding this monthly cap.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Add Family Members */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Step 2: Add Family Members</h2>
                <p className="text-sm text-slate-500 mt-0.5">
                  Input demographics, locations, and existing health profiles.
                </p>
              </div>
              <Button onClick={addMember} size="sm" variant="outline" className="text-xs gap-1.5">
                <Plus className="w-3.5 h-3.5" />
                Add Member
              </Button>
            </div>

            <div className="space-y-4">
              {members.map((m, idx) => (
                <div
                  key={m.id}
                  className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-slate-500">
                      MEMBER {idx + 1}
                    </span>
                    {members.length > 1 && (
                      <button
                        onClick={() => removeMember(m.id)}
                        className="text-red-500 hover:text-red-700 text-xs flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <label className="text-xs font-medium text-slate-700">Full Name</label>
                      <input
                        type="text"
                        value={m.name}
                        onChange={(e) => updateMember(m.id, { name: e.target.value })}
                        className="mt-1 w-full px-3 py-1.5 rounded-lg border border-slate-300 text-sm bg-white"
                        placeholder="e.g., Anita Rao"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-medium text-slate-700">Relationship</label>
                      <select
                        value={m.relationship}
                        onChange={(e) =>
                          updateMember(m.id, {
                            relationship: e.target.value as MemberDraft["relationship"],
                          })
                        }
                        className="mt-1 w-full px-3 py-1.5 rounded-lg border border-slate-300 text-sm bg-white"
                      >
                        <option value="Mother">Mother</option>
                        <option value="Father">Father</option>
                        <option value="Son">Son</option>
                        <option value="Daughter">Daughter</option>
                        <option value="Spouse">Spouse</option>
                        <option value="Grandparent">Grandparent</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-medium text-slate-700">Age</label>
                      <input
                        type="number"
                        value={m.age}
                        onChange={(e) => updateMember(m.id, { age: Number(e.target.value) })}
                        className="mt-1 w-full px-3 py-1.5 rounded-lg border border-slate-300 text-sm bg-white"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-medium text-slate-700">City / Location</label>
                      <input
                        type="text"
                        value={m.location}
                        onChange={(e) => updateMember(m.id, { location: e.target.value })}
                        className="mt-1 w-full px-3 py-1.5 rounded-lg border border-slate-300 text-sm bg-white"
                        placeholder="Hyderabad"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-medium text-slate-700">Blood Group</label>
                      <select
                        value={m.bloodGroup}
                        onChange={(e) => updateMember(m.id, { bloodGroup: e.target.value })}
                        className="mt-1 w-full px-3 py-1.5 rounded-lg border border-slate-300 text-sm bg-white"
                      >
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="text-xs font-medium text-slate-700">
                        Known Chronic Conditions
                      </label>
                      <input
                        type="text"
                        value={m.conditions}
                        onChange={(e) => updateMember(m.id, { conditions: e.target.value })}
                        className="mt-1 w-full px-3 py-1.5 rounded-lg border border-slate-300 text-sm bg-white"
                        placeholder="e.g., Hypothyroidism, Hypertension"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-medium text-slate-700">Drug Allergies</label>
                      <input
                        type="text"
                        value={m.allergies}
                        onChange={(e) => updateMember(m.id, { allergies: e.target.value })}
                        className="mt-1 w-full px-3 py-1.5 rounded-lg border border-slate-300 text-sm bg-white"
                        placeholder="e.g., Sulfa, Penicillin"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Care Responsibilities & Roles */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Step 3: Define Care Roles</h2>
              <p className="text-sm text-slate-500 mt-0.5">
                Every member has an explicit role. Designate the Primary Care Coordinator who
                handles day-to-day operations.
              </p>
            </div>

            <div className="space-y-4">
              {members.map((m) => (
                <div
                  key={m.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-slate-200 gap-4"
                >
                  <div>
                    <div className="font-semibold text-slate-900 text-sm">
                      {m.name || "Unnamed"} ({m.relationship})
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      Location: {m.location} • Age: {m.age}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2">
                      <label className="text-xs font-medium text-slate-600">Role:</label>
                      <select
                        value={m.role}
                        onChange={(e) =>
                          updateMember(m.id, { role: e.target.value as FamilyRole })
                        }
                        className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-medium bg-white"
                      >
                        <option value="OWNER">Owner (Account Admin)</option>
                        <option value="CARE_COORDINATOR">Care Coordinator</option>
                        <option value="MEMBER">Member (Adult)</option>
                        <option value="DEPENDENT">Dependent (Parent/Child)</option>
                      </select>
                    </div>

                    <button
                      type="button"
                      onClick={() => setPrimaryCoordinatorId(m.id)}
                      className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors ${
                        primaryCoordinatorId === m.id
                          ? "bg-emerald-600 text-white border-emerald-600"
                          : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      {primaryCoordinatorId === m.id
                        ? "✓ Primary Coordinator"
                        : "Set as Primary Coordinator"}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex gap-3">
              <Info className="w-4 h-4 shrink-0 text-amber-700 mt-0.5" />
              <div>
                <strong>Care Continuity Protection:</strong> The primary coordinator is the default
                assignee for refill triggers and appointment logistics. If they become unavailable,
                CareLoop prompts other authorized family members to take over.
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Permissions Matrix */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Step 4: Granular Permissions Matrix
              </h2>
              <p className="text-sm text-slate-500 mt-0.5">
                CareLoop enforces strict privilege separation. Never give all members every
                permission.
              </p>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-700">
                  <tr>
                    <th className="p-3 font-semibold">Permission Category</th>
                    {members.map((m) => (
                      <th key={m.id} className="p-3 font-semibold text-center whitespace-nowrap">
                        {m.name || "Member"}
                        <div className="text-[10px] text-slate-400 font-normal">({m.role})</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {ALL_PERMISSION_CATEGORIES.map((cat) => (
                    <tr key={cat.category} className="hover:bg-slate-50/50">
                      <td className="p-3">
                        <div className="font-semibold text-slate-800">{cat.label}</div>
                        <div className="text-[11px] text-slate-500">{cat.description}</div>
                      </td>
                      {members.map((m) => {
                        const hasPerm = m.permissions.includes(cat.category);
                        const isOwner = m.role === "OWNER";
                        return (
                          <td key={m.id} className="p-3 text-center">
                            <input
                              type="checkbox"
                              checked={hasPerm || isOwner}
                              disabled={isOwner}
                              onChange={() => togglePermission(m.id, cat.category)}
                              className="w-4 h-4 rounded text-slate-900 focus:ring-slate-900 accent-slate-900 cursor-pointer disabled:opacity-50"
                            />
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Step 5: Emergency Contacts & Hospital Rails */}
        {currentStep === 5 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Step 5: Emergency Contacts & Preferred Hospitals
              </h2>
              <p className="text-sm text-slate-500 mt-0.5">
                When acute symptoms or urgent escalations trigger, CareLoop surfaces these verified
                contacts immediately.
              </p>
            </div>

            <div className="space-y-4">
              {members.map((m) => (
                <div
                  key={m.id}
                  className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3"
                >
                  <div className="font-semibold text-slate-900 text-sm">
                    {m.name || "Unnamed"} ({m.relationship})
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <label className="text-xs font-medium text-slate-700">Contact Name</label>
                      <input
                        type="text"
                        value={m.emergencyContactName}
                        onChange={(e) =>
                          updateMember(m.id, { emergencyContactName: e.target.value })
                        }
                        className="mt-1 w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-white"
                        placeholder="e.g., Ramesh Rao"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-700">Contact Phone</label>
                      <input
                        type="text"
                        value={m.emergencyContactPhone}
                        onChange={(e) =>
                          updateMember(m.id, { emergencyContactPhone: e.target.value })
                        }
                        className="mt-1 w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-white"
                        placeholder="+91 98490 00000"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-700">Relation</label>
                      <input
                        type="text"
                        value={m.emergencyContactRelation}
                        onChange={(e) =>
                          updateMember(m.id, { emergencyContactRelation: e.target.value })
                        }
                        className="mt-1 w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-white"
                        placeholder="Spouse / Son"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-700">
                        Preferred Emergency Hospital
                      </label>
                      <input
                        type="text"
                        value={m.emergencyPreferredHospital}
                        onChange={(e) =>
                          updateMember(m.id, { emergencyPreferredHospital: e.target.value })
                        }
                        className="mt-1 w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-white"
                        placeholder="Apollo / Manipal"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 6: Communication & Language Preferences */}
        {currentStep === 6 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Step 6: Preferred Communication Language
              </h2>
              <p className="text-sm text-slate-500 mt-0.5">
                Gnani Voice agent speaks in the elder&apos;s mother tongue for medicine adherence
                check-ins.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {members.map((m) => (
                <div key={m.id} className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
                  <div className="font-semibold text-slate-900 text-sm">
                    {m.name || "Member"} ({m.relationship})
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-600">
                      Gnani Voice Dialect:
                    </label>
                    <select
                      value={m.preferredLanguage}
                      onChange={(e) =>
                        updateMember(m.id, {
                          preferredLanguage: e.target.value as MemberDraft["preferredLanguage"],
                        })
                      }
                      className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-medium bg-white"
                    >
                      <option value="te-IN">Telugu (తెలుగు)</option>
                      <option value="en-IN">Indian English</option>
                      <option value="hi-IN">Hindi (हिंदी)</option>
                      <option value="ta-IN">Tamil (தமிழ்)</option>
                    </select>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Voice calls to {m.name || "this member"} will default to this language rail.
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 7: Review & Finalize */}
        {currentStep === 7 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Step 7: Review & Finalize Care Loop</h2>
              <p className="text-sm text-slate-500 mt-0.5">
                Verify the configured family group and active coordinator before activating.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-xs font-medium text-slate-500">Family Entity</div>
                <div className="font-bold text-slate-900 text-base mt-1">{familyName}</div>
                <div className="text-xs text-slate-600 mt-1">{primaryCity}</div>
                <div className="text-xs font-mono font-semibold text-slate-700 mt-2">
                  Cap: ₹{monthlyLimit.toLocaleString("en-IN")}/mo
                </div>
              </div>

              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                <div className="text-xs font-medium text-emerald-700">Primary Coordinator</div>
                <div className="font-bold text-emerald-950 text-base mt-1">
                  {members.find((m) => m.id === primaryCoordinatorId)?.name || "Arjun Rao"}
                </div>
                <div className="text-xs text-emerald-700 mt-1">
                  {members.find((m) => m.id === primaryCoordinatorId)?.relationship} • Available
                </div>
                <Badge variant="success" className="mt-2 text-[10px]">
                  ACTIVE COORDINATOR
                </Badge>
              </div>

              <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
                <div className="text-xs font-medium text-blue-700">Configured Members</div>
                <div className="font-bold text-blue-950 text-base mt-1">
                  {members.length} Family Members
                </div>
                <div className="text-xs text-blue-700 mt-1">
                  {members.filter((m) => m.role === "DEPENDENT").length} Dependents,{" "}
                  {members.filter((m) => m.role !== "DEPENDENT").length} Coordinators
                </div>
                <div className="text-xs text-blue-800 mt-2 font-medium">
                  3 External Rails Active (Simulated)
                </div>
              </div>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="p-3 bg-slate-50 font-semibold text-xs text-slate-700 border-b border-slate-200">
                Summary of Member Permissions
              </div>
              <div className="p-4 divide-y divide-slate-100 space-y-3">
                {members.map((m) => (
                  <div
                    key={m.id}
                    className="pt-3 first:pt-0 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <div>
                      <span className="font-semibold text-slate-900 text-sm">{m.name}</span>{" "}
                      <span className="text-xs text-slate-500">
                        ({m.relationship} • {m.role})
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {m.permissions.map((p) => (
                        <span
                          key={p}
                          className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 font-mono"
                        >
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Footer Navigation */}
        <div className="flex items-center justify-between pt-6 border-t border-slate-100 mt-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
            disabled={currentStep === 1}
            className="gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>

          <div className="text-xs font-mono text-slate-400">
            Step {currentStep} of {STEPS.length}
          </div>

          {currentStep < STEPS.length ? (
            <Button
              size="sm"
              onClick={() => setCurrentStep((prev) => Math.min(STEPS.length, prev + 1))}
              className="gap-1.5"
            >
              Next Step
              <ArrowRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={handleFinish}
              disabled={isSubmitting}
              className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <CheckCircle2 className="w-4 h-4" />
              {isSubmitting ? "Activating..." : "Activate Care Loop"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
