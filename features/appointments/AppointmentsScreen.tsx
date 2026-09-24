"use client";

import React, { useState } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  FileText,
  CheckCircle2,
  ClipboardList,
  Pill,
} from "lucide-react";
import { useCareLoop } from "@/providers/AppProvider";
import { Appointment } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Tabs } from "@/components/ui/Tabs";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDate } from "@/lib/utils";

export function AppointmentsScreen() {
  const { appointments, members, records, medications, completeAppointment } = useCareLoop();
  const [filterTab, setFilterTab] = useState<string>("UPCOMING");
  const [selectedApptForPrep, setSelectedApptForPrep] = useState<Appointment | null>(null);
  const [completionNotice, setCompletionNotice] = useState<string | null>(null);

  const filteredAppts = appointments.filter((a) => {
    if (filterTab === "UPCOMING") return a.status === "UPCOMING";
    if (filterTab === "COMPLETED") return a.status === "COMPLETED";
    if (filterTab === "FOLLOWUP_REQUIRED") return a.status === "FOLLOWUP_REQUIRED";
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
              Clinical Consultations
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Pre-Appointment Dossiers
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 font-display">
            Appointments
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Hospital consultations and &quot;Before This Appointment&quot; pre-visit collation packs.
          </p>
        </div>

        <Tabs
          tabs={[
            { id: "UPCOMING", label: "Upcoming", count: appointments.filter((a) => a.status === "UPCOMING").length },
            { id: "ALL", label: "All Consultations", count: appointments.length },
          ]}
          activeTab={filterTab}
          onChange={setFilterTab}
        />
      </div>

      {/* Completion Toast Notification */}
      {completionNotice && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{completionNotice}</span>
          </div>
          <button onClick={() => setCompletionNotice(null)} className="text-emerald-700 hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Safety Notice */}
      <div className="p-3.5 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-700 flex items-start gap-2.5">
        <ClipboardList className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="text-slate-900 font-semibold">Pre-Appointment Coordination:</strong> CareLoop organizes previous hospital summaries, lab tests, and doctor notes into a cohesive folder. It never formulates diagnostic impressions.
        </div>
      </div>

      {/* Appointment Cards */}
      {filteredAppts.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No consultations scheduled in this view"
          description="We'll surface the next doctor appointment or hospital follow-up here as soon as it is scheduled."
          variant="calm"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredAppts.map((appt) => {
            const patient = members.find((m) => m.id === appt.patientId);
            const relatedRecs = records.filter((r) => appt.relatedRecordIds.includes(r.id));

          return (
            <div
              key={appt.id}
              className="p-5 rounded-xl subtle-card flex flex-col justify-between hover:border-slate-300 transition-all space-y-4"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold text-slate-600">
                        {patient?.name} ({patient?.relationship})
                      </span>
                      <span>•</span>
                      <Badge variant={appt.status === "COMPLETED" ? "neutral" : "info"}>{appt.status}</Badge>
                    </div>

                    <h2 className="text-base font-bold text-slate-900">{appt.doctor}</h2>
                    <p className="text-xs text-slate-600 mt-0.5 font-medium">
                      {appt.speciality}
                    </p>
                  </div>

                  <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-100 text-sky-700 flex items-center justify-center shrink-0">
                    <Calendar className="w-5 h-5" />
                  </div>
                </div>

                {/* Logistics Strip */}
                <div className="p-3 bg-slate-50 rounded-lg text-xs space-y-2 mt-3 border border-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 font-semibold text-slate-900">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {formatDate(appt.date)}
                    </span>
                    <span className="flex items-center gap-1.5 font-mono text-slate-700">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {appt.time}
                    </span>
                  </div>
                  <div className="flex items-start gap-1.5 text-slate-600 pt-1 border-t border-slate-200/50">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span>
                      {appt.hospital} • {appt.location}
                    </span>
                  </div>
                </div>

                {/* Consultation Objective */}
                <div className="mt-3 text-xs">
                  <span className="font-semibold text-slate-700 block mb-0.5">
                    Visit Objective:
                  </span>
                  <p className="text-slate-600 leading-relaxed">{appt.notes}</p>
                </div>

                {/* Linked Records Summary */}
                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>Linked Records ({relatedRecs.length} available)</span>
                  <span className="font-mono text-[11px] text-teal-700 font-semibold">
                    Dossier ready
                  </span>
                </div>
              </div>

              {/* Action Button Strip */}
              <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs text-slate-400">
                  Virtual dial-in for Arjun enabled
                </span>
                <div className="flex items-center gap-2">
                  {appt.status === "UPCOMING" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        completeAppointment(appt.id);
                        setCompletionNotice(`Consultation with ${appt.doctor} completed. Post-visit follow-up task generated.`);
                        setTimeout(() => setCompletionNotice(null), 6000);
                      }}
                      className="text-xs border-emerald-300 text-emerald-800 hover:bg-emerald-50 gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Complete Consultation</span>
                    </Button>
                  )}
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setSelectedApptForPrep(appt)}
                    className="bg-slate-900 text-xs gap-1.5"
                  >
                    <ClipboardList className="w-3.5 h-3.5 text-teal-400" />
                    <span>Before This Appointment</span>
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      )}

      {/* "Before This Appointment" Pre-visit Packet Modal */}
      <Modal
        isOpen={!!selectedApptForPrep}
        onClose={() => setSelectedApptForPrep(null)}
        title="Pre-Appointment Preparation Packet"
        description={selectedApptForPrep ? `${selectedApptForPrep.doctor} • ${selectedApptForPrep.hospital}` : ""}
        maxWidth="lg"
      >
        {selectedApptForPrep && (
          <div className="space-y-4 text-xs">
            {/* Vitals & Objectives */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-sm">
                  {members.find((m) => m.id === selectedApptForPrep.patientId)?.name} — Clinical Check
                </h3>
                <span className="font-mono text-xs font-semibold text-slate-700">
                  {formatDate(selectedApptForPrep.date)} at {selectedApptForPrep.time}
                </span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                {selectedApptForPrep.notes}
              </p>
            </div>

            {/* Preparation Checklist */}
            <div className="p-4 rounded-xl border border-teal-200 bg-teal-50/20 space-y-2.5">
              <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-teal-700" /> Pre-Visit Coordination Checklist
              </h4>
              <ul className="space-y-2 text-slate-700 pl-1">
                {selectedApptForPrep.preparationNotes.map((note, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-600 shrink-0 mt-1.5" />
                    <span>{note}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Suggested Questions for Doctor */}
            {selectedApptForPrep.suggestedQuestions &&
              selectedApptForPrep.suggestedQuestions.length > 0 && (
                <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/30 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                      Suggested Questions for Doctor
                    </h4>
                    <span className="text-[10px] font-mono text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                      Discussion Prompts
                    </span>
                  </div>
                  <ul className="space-y-1.5 text-slate-700 pl-1">
                    {selectedApptForPrep.suggestedQuestions.map((q, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs">
                        <span className="text-amber-600 font-bold">•</span>
                        <span>{q}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="text-[11px] text-amber-900 italic pt-1 border-t border-amber-200/50">
                    <strong>Clinical Notice:</strong> Questions are suggested for patient discussion during consultation. Clinical decisions belong solely to the licensed physician and patient.
                  </p>
                </div>
              )}

            {/* Active Medication Regimen Context */}
            {selectedApptForPrep &&
              medications.filter(
                (m) => m.patientId === selectedApptForPrep.patientId && m.status === "ACTIVE"
              ).length > 0 && (
                <div className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/20 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                      <Pill className="w-4 h-4 text-indigo-700" /> Current Medication Regimen Context
                    </h4>
                    <span className="text-[10px] font-mono text-indigo-800 bg-indigo-100 px-2 py-0.5 rounded">
                      Doctor Reference Pack
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    {medications
                      .filter(
                        (m) => m.patientId === selectedApptForPrep.patientId && m.status === "ACTIVE"
                      )
                      .map((m) => (
                        <div
                          key={m.id}
                          className="p-2.5 rounded-lg border border-slate-200 bg-white space-y-0.5"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900">{m.name}</span>
                            <span className="text-[10px] font-mono text-slate-500">{m.dosage}</span>
                          </div>
                          <div className="text-[11px] text-slate-600">
                            {m.frequency} • {m.currentStockUnits} tabs left ({m.remainingDays} days)
                          </div>
                          <div className="text-[10px] text-slate-400">
                            Prescribed by: {m.prescribingDoctor}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

            {/* Linked Records Attached to Dossier */}
            <div className="space-y-2">
              <span className="font-bold text-slate-900 text-xs uppercase tracking-wider block">
                Attached Medical Documents for Doctor&apos;s Review:
              </span>
              <div className="space-y-1.5">
                {records
                  .filter((r) => selectedApptForPrep.relatedRecordIds.includes(r.id))
                  .map((rec) => (
                    <div
                      key={rec.id}
                      className="p-3 rounded-lg border border-slate-200 bg-white flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-slate-500" />
                        <div>
                          <span className="font-semibold text-slate-800 block">
                            {rec.title}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {formatDate(rec.date)} • {rec.hospital}
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {rec.fileSize}
                      </span>
                    </div>
                  ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-200">
              <span className="text-[11px] text-slate-500">
                Coordinator: Arjun Rao (Dial-in Active)
              </span>
              <div className="flex items-center gap-2">
                {selectedApptForPrep.status === "UPCOMING" && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      completeAppointment(selectedApptForPrep.id);
                      setSelectedApptForPrep(null);
                      setCompletionNotice(
                        `Consultation with ${selectedApptForPrep.doctor} completed. Post-visit follow-up task generated.`
                      );
                      setTimeout(() => setCompletionNotice(null), 6000);
                    }}
                    className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Complete &amp; Generate Follow-Up</span>
                  </Button>
                )}
                <Button variant="secondary" size="sm" onClick={() => setSelectedApptForPrep(null)}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
