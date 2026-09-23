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
  Server,
} from "lucide-react";
import { useCareLoop } from "@/providers/AppProvider";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { getProviderStatusInfo } from "@/services/providerConfig";

export function SettingsScreen() {
  const { resetToSeedData, activity, family, updateFamilySpendingLimit } = useCareLoop();
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
      setSaveNotice(`Settings saved: Monthly coordination spending limit updated to ₹${numLimit}.`);
    } else {
      setSaveNotice("Settings updated successfully.");
    }
    setTimeout(() => setSaveNotice(null), 4000);
  };

  const handleExportData = () => {
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(activity, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `careloop-audit-export-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6 max-w-4xl pb-12">
      {/* Header */}
      <div className="pb-3 border-b border-slate-200">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
          Settings &amp; Configuration
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          How CareLoop is configured for your family: monthly spending limits, voice check preferences, and delivery settings.
        </p>
      </div>

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

      {/* Global Provider Mode Indicator */}
      <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Server className="w-5 h-5 text-teal-700" />
          <div>
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Active Provider Operating Mode: {providerInfo.mode.toUpperCase()}
            </h2>
            <p className="text-[11px] text-slate-500">
              {providerInfo.badgeDescription} Controlled via <code>CARELOOP_PROVIDER_MODE</code>.
            </p>
          </div>
        </div>
        <Badge variant={providerInfo.isSandbox ? "warning" : "success"}>
          {providerInfo.badgeLabel}
        </Badge>
      </div>

      {/* Rail 1: Pine Labs Payment Gateways */}
      <div className="p-5 rounded-xl subtle-card space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center shrink-0">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Pine Labs Plural / Healthcare Payment Rail
              </h2>
              <p className="text-xs text-slate-500">
                Pre-authorized financial consent engine with automated spending cap guardrails.
              </p>
            </div>
          </div>
          <Badge variant="warning">{providerInfo.providers.pineLabs.status}</Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
          <Input
            label="Monthly Coordination Spending Limit (INR)"
            value={spendingCap}
            onChange={(e) => setSpendingCap(e.target.value)}
            hint="Charges above this ceiling trigger EXCEEDED_LIMIT rejection and require coordinator override."
          />

          <div className="flex flex-col gap-1 text-[11px] justify-center p-3 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-slate-500">Configured Merchant:</span>
            <strong className="text-slate-900 font-mono">{providerInfo.providers.pineLabs.merchantId}</strong>
            <span className="text-slate-500 mt-1">Currency &amp; 2FA:</span>
            <span className="text-slate-700 font-medium">INR (₹) • Pre-authorized PIN / OTP Consent</span>
          </div>
        </div>
      </div>

      {/* Rail 2: Gnani.ai Conversational Voice */}
      <div className="p-5 rounded-xl subtle-card space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-sky-50 border border-sky-200 text-sky-700 flex items-center justify-center shrink-0">
              <PhoneCall className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Gnani.ai Telephony &amp; Outbound Voice Rail
              </h2>
              <p className="text-xs text-slate-500">
                Conversational outbound calls for routine medication checks in regional dialects.
              </p>
            </div>
          </div>
          <Badge variant="info">{providerInfo.providers.gnani.status}</Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Primary Outbound Dialect
            </label>
            <select
              value={voiceLang}
              onChange={(e) => setVoiceLang(e.target.value)}
              className="w-full h-9 px-3 text-xs rounded-lg border border-slate-300 bg-white text-slate-900"
            >
              <option value="te-IN">Telugu (te-IN) — Hyderabad Default</option>
              <option value="en-IN">Indian English (en-IN)</option>
              <option value="hi-IN">Hindi (hi-IN)</option>
            </select>
          </div>

          <div className="flex flex-col gap-1 text-[11px] justify-center p-3 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-slate-500">Clinical Safety Intercept:</span>
            <strong className="text-emerald-800">Active (Symptom reports halt automation &amp; escalate to human)</strong>
            <span className="text-slate-500 mt-1">Supported Languages:</span>
            <span className="text-slate-700">{providerInfo.providers.gnani.supportedLanguages.join(", ")}</span>
          </div>
        </div>
      </div>

      {/* Rail 3: Delhivery Healthcare Express */}
      <div className="p-5 rounded-xl subtle-card space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Delhivery Healthcare Express Logistics Rail
              </h2>
              <p className="text-xs text-slate-500">
                Cold-chain pharmaceutical delivery tracking, manifest generation, and auto-inventory synchronization.
              </p>
            </div>
          </div>
          <Badge variant="neutral">{providerInfo.providers.delhivery.status}</Badge>
        </div>

        <div className="text-xs space-y-2 pt-1 text-slate-600">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-slate-400 text-[10px] block">Configured Origin Hub</span>
              <strong className="text-slate-900">Apollo Begumpet Central Hub (500016)</strong>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-slate-400 text-[10px] block">Destination Residence</span>
              <strong className="text-slate-900">Jubilee Hills, Hyderabad (500033)</strong>
            </div>
          </div>
          <p className="text-[11px] text-slate-500 pt-1">
            • <strong>Auto-Inventory Trigger:</strong> When Delhivery status reaches <code>DELIVERED</code>, medication stock automatically updates (+60 tabs) and marks linked task completed.
          </p>
        </div>
      </div>

      {/* Save Settings Bar */}
      <div className="flex items-center justify-between pt-2">
        <Button variant="primary" onClick={handleSave} className="bg-slate-900 hover:bg-slate-800 text-white shadow-sm">
          Save Configuration Changes
        </Button>
      </div>

      {/* Data Management & Demo Reset */}
      <div className="p-5 rounded-xl border border-red-200 bg-red-50/20 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-red-950">Data &amp; Audit Tools</h2>
            <p className="text-xs text-slate-500">
              Download complete event provenance logs or reset to pristine Rao Family seed data.
            </p>
          </div>
          <AlertTriangle className="w-4 h-4 text-red-600" />
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-2">
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
              if (confirm("Reset all modifications back to The Rao Family competition seed state?")) {
                resetToSeedData();
                setSaveNotice("Reset to initial fictional seed data.");
              }
            }}
            className="text-xs gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo Seed State</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
