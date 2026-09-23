"use client";

import React, { useState } from "react";
import {
  CreditCard,
  Truck,
  PhoneCall,
  RotateCcw,
  CheckCircle2,
  Download,
  AlertTriangle,
  Users,
  ShieldCheck,
  Bell,
} from "lucide-react";
import { useCareLoop } from "@/providers/AppProvider";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { getProviderStatusInfo } from "@/services/providerConfig";

// ─── Section wrapper ────────────────────────────────────────────────────────
function SettingsSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-4">
      <div className="pb-3 border-b border-slate-200">
        <h2 className="text-sm font-bold text-slate-900">{title}</h2>
        {description && (
          <p className="text-xs text-slate-500 mt-0.5">{description}</p>
        )}
      </div>
      {children}
    </div>
  );
}

// ─── Provider row ───────────────────────────────────────────────────────────
function ProviderRow({
  icon,
  name,
  description,
  status,
  isSandbox,
  children,
}: {
  icon: React.ReactNode;
  name: string;
  description: string;
  status: string;
  isSandbox: boolean;
  children?: React.ReactNode;
}) {
  return (
    <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 shrink-0">
            {icon}
          </div>
          <div>
            <div className="text-sm font-bold text-slate-900">{name}</div>
            <p className="text-xs text-slate-500 mt-0.5">{description}</p>
          </div>
        </div>
        <div className="shrink-0 flex flex-col items-end gap-1">
          <span
            className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
              isSandbox
                ? "bg-amber-50 border-amber-200 text-amber-800"
                : "bg-emerald-50 border-emerald-200 text-emerald-800"
            }`}
          >
            {isSandbox ? "SANDBOX / SIMULATED" : "LIVE"}
          </span>
          <span className="text-[10px] text-slate-400 font-mono">{status}</span>
        </div>
      </div>
      {children && <div className="pt-2 border-t border-slate-100">{children}</div>}
    </div>
  );
}

export function SettingsScreen() {
  const { resetToSeedData, activity, family, members, activeUser, updateFamilySpendingLimit } =
    useCareLoop();
  const providerInfo = getProviderStatusInfo();

  const [spendingCap, setSpendingCap] = useState(
    family?.monthlySpendingLimit ? family.monthlySpendingLimit.toString() : "1500"
  );
  const [voiceLang, setVoiceLang] = useState("te-IN");
  const [saveNotice, setSaveNotice] = useState<string | null>(null);

  const handleSave = () => {
    const numLimit = parseInt(spendingCap, 10);
    if (!isNaN(numLimit) && numLimit > 0) {
      updateFamilySpendingLimit(numLimit);
      setSaveNotice(`Monthly spending limit updated to ₹${numLimit}.`);
    } else {
      setSaveNotice("Settings saved.");
    }
    setTimeout(() => setSaveNotice(null), 4000);
  };

  const handleExportData = () => {
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(activity, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute(
      "download",
      `careloop-audit-export-${Date.now()}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-10 max-w-3xl pb-12">
      {/* Page heading */}
      <div className="pb-3 border-b border-slate-200">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
          Settings
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          How CareLoop is configured for your family.
        </p>
      </div>

      {/* Save confirmation */}
      {saveNotice && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{saveNotice}</span>
          </div>
          <button
            onClick={() => setSaveNotice(null)}
            className="font-semibold text-emerald-700 hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* ── 1. ACCOUNT & FAMILY ─────────────────────────────────────────────── */}
      <SettingsSection
        title="Account & Family"
        description="Your family profile and active coordination roles."
      >
        <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900">
                {family?.name || "The Rao Family"}
              </div>
              <p className="text-xs text-slate-500">
                {members.length} members · Primary coordination city:{" "}
                {family?.primaryCity || "Hyderabad"}
              </p>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-0.5">
              <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                Active Coordinator
              </div>
              <div className="font-bold text-slate-900">{activeUser.name}</div>
              <div className="text-slate-500">
                {activeUser.role.replace(/_/g, " ")} · {activeUser.location}
              </div>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-0.5">
              <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                Family Members
              </div>
              {members.map((m) => (
                <div key={m.id} className="text-slate-700">
                  {m.name}{" "}
                  <span className="text-slate-400">({m.relationship})</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </SettingsSection>

      {/* ── 2. CARE PREFERENCES ─────────────────────────────────────────────── */}
      <SettingsSection
        title="Care Preferences"
        description="Authorization thresholds and monthly spending limits."
      >
        <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Monthly Coordination Spending Limit (₹)"
              value={spendingCap}
              onChange={(e) => setSpendingCap(e.target.value)}
              hint="Any charge above this limit requires coordinator sign-off before execution."
            />
            <div className="flex flex-col gap-1 justify-center p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs">
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                Authorization Behaviour
              </span>
              <span className="text-slate-700 font-medium">
                All payments above ₹0 require explicit family approval.
              </span>
              <span className="text-slate-500 mt-1">
                No financial action executes without human sign-off.
              </span>
            </div>
          </div>
          <div className="flex justify-end">
            <Button
              variant="primary"
              onClick={handleSave}
              className="bg-slate-900 hover:bg-slate-800 text-white text-xs"
            >
              Save Preferences
            </Button>
          </div>
        </div>
      </SettingsSection>

      {/* ── 3. COMMUNICATION ────────────────────────────────────────────────── */}
      <SettingsSection
        title="Communication"
        description="Voice check language and notification preferences."
      >
        <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Voice Check Language
              </label>
              <select
                value={voiceLang}
                onChange={(e) => setVoiceLang(e.target.value)}
                className="w-full h-9 px-3 text-xs rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
              >
                <option value="te-IN">Telugu (te-IN) — Hyderabad default</option>
                <option value="en-IN">Indian English (en-IN)</option>
                <option value="hi-IN">Hindi (hi-IN)</option>
              </select>
              <p className="text-[11px] text-slate-400 mt-1">
                Outbound wellness calls are placed in the selected language via Gnani.ai.
              </p>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-1.5">
              <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                Notification Behaviour
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <Bell className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>Low-stock alerts when medication drops to 5 days or below</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700">
                <Bell className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>Authorization requests routed to active coordinator</span>
              </div>
            </div>
          </div>
        </div>
      </SettingsSection>

      {/* ── 4. PROVIDER CONNECTIONS ─────────────────────────────────────────── */}
      <SettingsSection
        title="Provider Connections"
        description="External service integrations used for payments, logistics, and voice."
      >
        {/* Mode banner */}
        <div
          className={`px-4 py-2.5 rounded-lg border text-xs font-medium flex items-center justify-between ${
            providerInfo.isSandbox
              ? "bg-amber-50 border-amber-200 text-amber-900"
              : "bg-emerald-50 border-emerald-200 text-emerald-900"
          }`}
        >
          <span>
            {providerInfo.isSandbox
              ? "All providers are running in SANDBOX / SIMULATED mode. No real transactions, deliveries, or calls are placed."
              : "Live provider rails are connected. Real transactions and actions will occur."}
          </span>
          <span className="font-mono font-bold shrink-0 ml-3">
            {providerInfo.mode.toUpperCase()}
          </span>
        </div>

        <ProviderRow
          icon={<CreditCard className="w-5 h-5" />}
          name="Pine Labs — Healthcare Payment Gateway"
          description="Pre-authorized 2FA consent payments with family spending cap enforcement."
          status={providerInfo.providers.pineLabs.status}
          isSandbox={providerInfo.isSandbox}
        >
          <div className="grid grid-cols-2 gap-3 text-[11px]">
            <div className="space-y-0.5">
              <div className="text-slate-400">Merchant ID</div>
              <div className="font-mono font-bold text-slate-900">
                {providerInfo.providers.pineLabs.merchantId}
              </div>
            </div>
            <div className="space-y-0.5">
              <div className="text-slate-400">Currency</div>
              <div className="font-semibold text-slate-900">INR (₹) · 2FA Consent</div>
            </div>
          </div>
        </ProviderRow>

        <ProviderRow
          icon={<Truck className="w-5 h-5" />}
          name="Delhivery — Healthcare Express Logistics"
          description="Cold-chain pharmaceutical delivery with automatic inventory sync on confirmed delivery."
          status={providerInfo.providers.delhivery.status}
          isSandbox={providerInfo.isSandbox}
        >
          <div className="grid grid-cols-2 gap-3 text-[11px]">
            <div className="space-y-0.5">
              <div className="text-slate-400">Origin Hub</div>
              <div className="font-semibold text-slate-900">
                Apollo Begumpet Cold-Chain Hub
              </div>
            </div>
            <div className="space-y-0.5">
              <div className="text-slate-400">Service Type</div>
              <div className="font-semibold text-slate-900">
                Temperature-Controlled Express
              </div>
            </div>
          </div>
        </ProviderRow>

        <ProviderRow
          icon={<PhoneCall className="w-5 h-5" />}
          name="Gnani.ai — Conversational Voice"
          description="Outbound wellness check calls in Telugu, Hindi, and Indian English."
          status={providerInfo.providers.gnani.status}
          isSandbox={providerInfo.isSandbox}
        >
          <div className="text-[11px] text-slate-600 space-y-1">
            <div>
              Supported languages:{" "}
              <span className="text-slate-900 font-medium">
                {providerInfo.providers.gnani.supportedLanguages.join(" · ")}
              </span>
            </div>
          </div>
        </ProviderRow>
      </SettingsSection>

      {/* ── 5. SAFETY ───────────────────────────────────────────────────────── */}
      <SettingsSection
        title="Safety"
        description="Clinical escalation rules and human approval requirements."
      >
        <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 shrink-0 mt-0.5">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="space-y-2 text-xs">
              <div className="font-bold text-slate-900 text-sm">
                Safety boundaries are always active.
              </div>
              <ul className="space-y-1.5 text-slate-600">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    If a voice call detects any symptom (dizziness, chest pain, breathlessness),
                    automation halts immediately and an urgent escalation task is dispatched
                    to the family coordinator.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    No payment, delivery order, or consequential action executes without
                    explicit family member authorization.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    CareLoop does not diagnose, prescribe, or interpret medical results.
                    All clinical decisions remain with the treating physician.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    Emergency contact and preferred hospital are surfaced immediately for any
                    dependent upon coordinator request.
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Data & Demo Reset */}
        <div className="p-4 rounded-xl border border-red-200 bg-red-50/30 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-bold text-red-900">Data & Demo Reset</div>
              <p className="text-xs text-slate-500 mt-0.5">
                Export the full audit trail or reset to the original Rao Family seed state.
              </p>
            </div>
            <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportData}
              className="text-xs gap-1.5 border-slate-300"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Audit Trail (JSON)</span>
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                if (
                  confirm(
                    "Reset all changes back to the Rao Family seed state?"
                  )
                ) {
                  resetToSeedData();
                  setSaveNotice("Reset to initial seed state.");
                }
              }}
              className="text-xs gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Demo Seed State</span>
            </Button>
          </div>
        </div>
      </SettingsSection>
    </div>
  );
}
