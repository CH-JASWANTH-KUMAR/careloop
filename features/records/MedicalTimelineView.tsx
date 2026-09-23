"use client";

import React, { useState } from "react";
import {
  FileText,
  Pill,
  Activity,
  Building,
  User,
  ArrowRight,
} from "lucide-react";
import { useCareLoop } from "@/providers/AppProvider";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

interface MedicalTimelineViewProps {
  onSelectRecord?: (recordId: string) => void;
}

export function MedicalTimelineView({ onSelectRecord }: MedicalTimelineViewProps) {
  const { records, members } = useCareLoop();
  const [selectedPatientId, setSelectedPatientId] = useState<string>("ALL");

  const filteredRecords = records
    .filter((r) => (selectedPatientId === "ALL" ? true : r.patientId === selectedPatientId))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const getRecordIcon = (docType: string) => {
    switch (docType) {
      case "PRESCRIPTION":
        return <Pill className="w-4 h-4 text-emerald-600" />;
      case "LAB_REPORT":
        return <Activity className="w-4 h-4 text-purple-600" />;
      case "DISCHARGE_SUMMARY":
        return <Building className="w-4 h-4 text-blue-600" />;
      default:
        return <FileText className="w-4 h-4 text-slate-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Patient Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-white rounded-xl border border-slate-200">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Verified Medical Timeline</h3>
          <p className="text-xs text-slate-500">
            Chronological clinical progression across verified prescriptions, diagnostics, and doctor summaries.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-slate-600">Patient:</label>
          <select
            value={selectedPatientId}
            onChange={(e) => setSelectedPatientId(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 font-semibold text-slate-800 focus:outline-none"
          >
            <option value="ALL">All Family Members</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} ({m.relationship})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Timeline Stream */}
      <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-3 sm:before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
        {filteredRecords.map((record) => {
          const patient = members.find((m) => m.id === record.patientId);
          const isVerified =
            record.extractedMetadata?.reviewStatus === "VERIFIED_BY_HUMAN" ||
            record.pipelineStatus === "VERIFIED";

          return (
            <div key={record.id} className="relative group">
              {/* Timeline Bullet Marker */}
              <div
                className={`absolute -left-6 sm:-left-8 top-1.5 w-7 h-7 rounded-full flex items-center justify-center border-2 bg-white transition-all ${
                  isVerified
                    ? "border-emerald-500 text-emerald-600 shadow-xs"
                    : "border-amber-400 text-amber-500 shadow-xs animate-pulse"
                }`}
              >
                {getRecordIcon(record.documentType)}
              </div>

              {/* Timeline Card */}
              <div className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 transition-all shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
                      {formatDate(record.date)}
                    </span>
                    <Badge variant="neutral">{record.documentType.replace(/_/g, " ")}</Badge>
                    <span className="text-xs text-slate-600 font-semibold flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      {patient?.name} ({patient?.relationship})
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                        isVerified
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold"
                          : "bg-amber-50 text-amber-800 border-amber-200 font-semibold"
                      }`}
                    >
                      {isVerified ? "✓ Verified Clinical Event" : "AI extracted — needs verification"}
                    </span>
                  </div>
                </div>

                {/* Main Content */}
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h4 className="text-base font-bold text-slate-900">{record.title}</h4>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-0.5">
                        <span>Dr. {record.doctor}</span>
                        <span>•</span>
                        <span>{record.hospital}</span>
                      </div>
                    </div>

                    {onSelectRecord && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onSelectRecord(record.id)}
                        className="text-xs gap-1 shrink-0"
                      >
                        Inspect
                        <ArrowRight className="w-3 h-3" />
                      </Button>
                    )}
                  </div>

                  {record.extractedMetadata?.diagnosisSummary && (
                    <p className="text-xs text-slate-600 bg-slate-50/70 p-2.5 rounded-lg border border-slate-100">
                      <strong>Summary:</strong> {record.extractedMetadata.diagnosisSummary}
                    </p>
                  )}
                </div>

                {/* Key Metrics / Lab Biomarkers */}
                {record.extractedMetadata?.keyMetrics && record.extractedMetadata.keyMetrics.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-mono font-semibold uppercase text-slate-400 tracking-wider">
                      Extracted Clinical Metrics
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {record.extractedMetadata.keyMetrics.map((km, i) => (
                        <div
                          key={i}
                          className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs"
                        >
                          <div className="text-[11px] text-slate-500">{km.label}</div>
                          <div className="font-bold text-slate-900 mt-0.5 flex items-center justify-between">
                            <span>{km.value}</span>
                            <span
                              className={`text-[9px] font-mono px-1 rounded ${
                                km.status === "NORMAL"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : km.status === "BORDERLINE" || km.status === "ELEVATED"
                                  ? "bg-amber-100 text-amber-800"
                                  : "bg-red-100 text-red-800 font-bold"
                              }`}
                            >
                              {km.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Medicines List if Prescription */}
                {record.extractedMetadata?.medicines && record.extractedMetadata.medicines.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-mono font-semibold uppercase text-slate-400 tracking-wider">
                      Prescribed Medications
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {record.extractedMetadata.medicines.map((med, i) => (
                        <div
                          key={i}
                          className="p-2.5 rounded-lg bg-emerald-50/50 border border-emerald-200/60 text-xs flex items-center justify-between"
                        >
                          <div>
                            <span className="font-bold text-slate-900">{med.name}</span>
                            <span className="text-slate-500 ml-1.5">{med.dosage}</span>
                          </div>
                          <span className="font-mono text-[11px] text-emerald-800">
                            {med.frequency}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {filteredRecords.length === 0 && (
          <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-500">
            No medical timeline events recorded for this selection.
          </div>
        )}
      </div>
    </div>
  );
}
