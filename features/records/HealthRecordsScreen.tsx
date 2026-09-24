"use client";

import React, { useState } from "react";
import {
  FileText,
  Upload,
  Search,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  Building,
  User,
  Eye,
  Check,
  Edit3,
} from "lucide-react";
import { useCareLoop } from "@/providers/AppProvider";
import { HealthRecord, DocumentType, DocumentPipelineStatus, ExtractedMetadata } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { formatDate } from "@/lib/utils";
import { MedicalTimelineView } from "./MedicalTimelineView";
import { EmptyState } from "@/components/ui/EmptyState";

const PIPELINE_STEPS: { status: DocumentPipelineStatus; label: string }[] = [
  { status: "UPLOADED", label: "Uploaded" },
  { status: "PROCESSING", label: "Processing OCR" },
  { status: "INFORMATION_EXTRACTED", label: "Info Extracted" },
  { status: "NEEDS_VERIFICATION", label: "Needs Verification" },
  { status: "VERIFIED", label: "Verified" },
];

export function HealthRecordsScreen() {
  const { records, members, addRecord, updateRecordExtraction, activeUser } = useCareLoop();
  const [activeTab, setActiveTab] = useState<"VAULT" | "TIMELINE">("VAULT");
  const [selectedRecord, setSelectedRecord] = useState<HealthRecord | null>(null);
  const [filterType, setFilterType] = useState<string>("ALL");
  const [customPatientFilter, setCustomPatientFilter] = useState<{ userId: string; filter: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const filterPatient =
    customPatientFilter?.userId === activeUser?.id
      ? customPatientFilter.filter
      : activeUser?.role === "DEPENDENT"
      ? activeUser.id
      : "ALL";

  // Edit / Verification Form state inside Modal
  const [isEditingExtraction, setIsEditingExtraction] = useState(false);
  const [editDiagnosis, setEditDiagnosis] = useState("");
  const [editFollowUpDate, setEditFollowUpDate] = useState("");
  const [editDoctorNotes, setEditDoctorNotes] = useState("");
  const [editMedicines, setEditMedicines] = useState<
    { name: string; dosage: string; frequency: string }[]
  >([]);

  // Upload Form state
  const [newTitle, setNewTitle] = useState("");
  const [newPatientId, setNewPatientId] = useState("mem-ramesh");
  const [newType, setNewType] = useState<DocumentType>("LAB_REPORT");
  const [newDoctor, setNewDoctor] = useState("Dr. K. S. Rao");
  const [newHospital, setNewHospital] = useState("Apollo Hospitals Jubilee Hills");
  const [newTags, setNewTags] = useState("Cardiology, Routine");
  const [isSimulatingUpload, setIsSimulatingUpload] = useState(false);

  const filteredRecords = records.filter((rec) => {
    if (filterType !== "ALL" && rec.documentType !== filterType) return false;
    if (filterPatient !== "ALL" && rec.patientId !== filterPatient) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = rec.title.toLowerCase().includes(q);
      const matchDoctor = rec.doctor.toLowerCase().includes(q);
      const matchHospital = rec.hospital.toLowerCase().includes(q);
      const matchTag = rec.tags.some((t) => t.toLowerCase().includes(q));
      if (!matchTitle && !matchDoctor && !matchHospital && !matchTag) return false;
    }
    return true;
  });

  const handleOpenRecord = (rec: HealthRecord) => {
    setSelectedRecord(rec);
    setIsEditingExtraction(false);
    setEditDiagnosis(rec.extractedMetadata?.diagnosisSummary || "");
    setEditFollowUpDate(rec.extractedMetadata?.followUpDate || "");
    setEditDoctorNotes(rec.extractedMetadata?.doctorNotes || "");
    setEditMedicines(rec.extractedMetadata?.medicines || []);
  };

  const handleSaveAndVerify = () => {
    if (!selectedRecord) return;
    const updatedMetadata: Partial<ExtractedMetadata> = {
      diagnosisSummary: editDiagnosis,
      followUpDate: editFollowUpDate,
      doctorNotes: editDoctorNotes,
      medicines: editMedicines,
      reviewStatus: "VERIFIED_BY_HUMAN",
    };

    updateRecordExtraction(selectedRecord.id, updatedMetadata);
    setSelectedRecord({
      ...selectedRecord,
      pipelineStatus: "VERIFIED",
      extractedMetadata: {
        ...selectedRecord.extractedMetadata!,
        ...updatedMetadata,
      },
    });
    setIsEditingExtraction(false);
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setIsSimulatingUpload(true);
    setTimeout(() => {
      addRecord({
        title: newTitle,
        patientId: newPatientId,
        documentType: newType,
        date: new Date().toISOString().split("T")[0],
        doctor: newDoctor,
        hospital: newHospital,
        tags: newTags.split(",").map((t) => t.trim()).filter(Boolean),
        fileSize: "1.2 MB (PDF)",
        uploadSource: "MANUAL_UPLOAD",
        pipelineStatus: "NEEDS_VERIFICATION",
        extractedMetadata: {
          reviewStatus: "REVIEW_PENDING",
          confidenceScore: 0.94,
          inferredNotes:
            "Extracted via CareLoop Optical Document Parser. Please inspect and confirm accuracy.",
          diagnosisSummary: "Preliminary outpatient clinical notes and laboratory metrics.",
          keyMetrics: [
            { label: "Detected Biomarker", value: "Within Reference", status: "NORMAL" },
          ],
          medicines:
            newType === "PRESCRIPTION"
              ? [{ name: "Thyronorm", dosage: "50 mcg", frequency: "1 tab morning" }]
              : undefined,
          followUpDate: "2026-10-15",
        },
      });

      setIsSimulatingUpload(false);
      setIsUploadModalOpen(false);
      setNewTitle("");
    }, 700);
  };

  const getPipelineBadgeColor = (status: DocumentPipelineStatus = "NEEDS_VERIFICATION") => {
    switch (status) {
      case "VERIFIED":
        return "bg-emerald-50 text-emerald-800 border-emerald-300";
      case "NEEDS_VERIFICATION":
        return "bg-amber-50 text-amber-800 border-amber-300";
      case "PROCESSING":
      case "INFORMATION_EXTRACTED":
        return "bg-sky-50 text-sky-800 border-sky-300";
      default:
        return "bg-slate-100 text-slate-700 border-slate-300";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
              Health Record Intelligence
            </span>
            <span className="text-xs text-slate-400 font-mono">
              OCR &amp; Human-in-the-Loop Verification
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 font-display">Health Records</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Prescriptions, diagnostics, and summaries with transparent OCR extraction pipelines and
            verified timelines.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
            <button
              onClick={() => setActiveTab("VAULT")}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                activeTab === "VAULT"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Document Vault
            </button>
            <button
              onClick={() => setActiveTab("TIMELINE")}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                activeTab === "TIMELINE"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Medical Timeline
            </button>
          </div>

          <Button
            variant="primary"
            onClick={() => setIsUploadModalOpen(true)}
            className="gap-2 bg-slate-900 shrink-0"
          >
            <Upload className="w-4 h-4 text-teal-400" />
            <span>Upload Record</span>
          </Button>
        </div>
      </div>

      {/* Safety Notice */}
      <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="font-semibold text-amber-950">Clinical Verification Boundary:</strong>{" "}
          AI-extracted laboratory metrics and dosages must NEVER automatically become clinical
          truth. Every parsed document displays &ldquo;AI extracted — needs verification&rdquo; until
          inspected and signed off by an authorized family coordinator.
        </div>
      </div>

      {/* Main Content: Vault vs Timeline */}
      {activeTab === "TIMELINE" ? (
        <MedicalTimelineView
          onSelectRecord={(recId) => {
            const found = records.find((r) => r.id === recId);
            if (found) handleOpenRecord(found);
          }}
        />
      ) : (
        <div className="space-y-4">
          {/* Filters and Search Bar */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 p-3 bg-white rounded-xl border border-slate-200">
            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search by test, doctor, hospital..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-9 pl-9 pr-3 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-900 bg-slate-50/50"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              {/* Patient Selector */}
              <select
                value={filterPatient}
                onChange={(e) => setCustomPatientFilter({ userId: activeUser?.id || "", filter: e.target.value })}
                className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none"
                aria-label="Filter records by patient"
              >
                <option value="ALL">All Patients</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.relationship})
                  </option>
                ))}
              </select>

              {/* Document Type Selector */}
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none"
                aria-label="Filter records by document type"
              >
                <option value="ALL">All Document Types</option>
                <option value="PRESCRIPTION">Prescriptions</option>
                <option value="LAB_REPORT">Lab Reports</option>
                <option value="DISCHARGE_SUMMARY">Discharge Summaries</option>
                <option value="VACCINATION">Vaccinations</option>
                <option value="DIAGNOSIS">Diagnosis Reports</option>
                <option value="MEDICAL_BILL">Medical Bills</option>
                <option value="OTHER">Other Documents</option>
              </select>
            </div>
          </div>

          {/* Records Table / List */}
          <div className="space-y-3">
            {filteredRecords.map((record) => {
              const patient = members.find((m) => m.id === record.patientId);
              const pipelineStatus = record.pipelineStatus || "NEEDS_VERIFICATION";
              const isVerified = pipelineStatus === "VERIFIED";

              return (
                <div
                  key={record.id}
                  className="p-4 rounded-xl subtle-card hover:border-slate-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5 text-slate-600" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <Badge variant="neutral">{record.documentType.replace(/_/g, " ")}</Badge>
                        <span className="text-xs font-mono text-slate-400">
                          {formatDate(record.date)}
                        </span>
                        {/* Pipeline Badge */}
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded-full border font-semibold ${getPipelineBadgeColor(
                            pipelineStatus
                          )}`}
                        >
                          {pipelineStatus === "VERIFIED"
                            ? "✓ Verified by Human"
                            : "AI extracted — needs verification"}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-slate-900">{record.title}</h3>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
                        <span className="flex items-center gap-1 font-medium text-slate-700">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          {patient?.name} ({patient?.relationship})
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Building className="w-3.5 h-3.5 text-slate-400" />
                          {record.hospital}
                        </span>
                        <span>•</span>
                        <span>Dr. {record.doctor}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenRecord(record)}
                      className="text-xs gap-1.5 border-slate-300"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>{isVerified ? "Inspect Record" : "Review & Verify"}</span>
                    </Button>
                  </div>
                </div>
              );
            })}

            {filteredRecords.length === 0 && (
              <EmptyState
                illustrationSrc="/images/illustrations/lab-report-empty.png"
                illustrationAlt="No Clinical Documents"
                title="No health records found in this view"
                description="Upload hospital discharge summaries, lab reports, or doctor prescriptions to keep the family clinical folder complete."
                variant="calm"
              />
            )}
          </div>
        </div>
      )}

      {/* Record Inspection & AI Extraction Review Modal */}
      <Modal
        isOpen={!!selectedRecord}
        onClose={() => {
          setSelectedRecord(null);
          setIsEditingExtraction(false);
        }}
        title={selectedRecord?.title || "Record Details"}
        description={
          selectedRecord
            ? `${selectedRecord.documentType.replace(/_/g, " ")} • ${selectedRecord.hospital}`
            : ""
        }
        maxWidth="lg"
      >
        {selectedRecord && (
          <div className="space-y-4">
            {/* Pipeline Stage Bar */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600">
                <span className="uppercase tracking-wider">Document Processing Pipeline:</span>
                <span className="font-mono text-slate-900">
                  {selectedRecord.pipelineStatus || "NEEDS_VERIFICATION"}
                </span>
              </div>
              <div className="grid grid-cols-5 gap-1">
                {PIPELINE_STEPS.map((step, idx) => {
                  const currentIdx = PIPELINE_STEPS.findIndex(
                    (s) => s.status === (selectedRecord.pipelineStatus || "NEEDS_VERIFICATION")
                  );
                  const isDone = idx <= currentIdx;
                  return (
                    <div
                      key={step.status}
                      className={`text-center py-1 rounded text-[10px] font-mono font-bold transition-all ${
                        isDone
                          ? "bg-emerald-600 text-white shadow-2xs"
                          : "bg-slate-200 text-slate-500"
                      }`}
                    >
                      {step.label}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Metadata Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              <div>
                <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                  Patient
                </span>
                <span className="font-bold text-slate-900">
                  {members.find((m) => m.id === selectedRecord.patientId)?.name}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                  Consulting Doctor
                </span>
                <span className="font-medium text-slate-800">{selectedRecord.doctor}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                  Date of Record
                </span>
                <span className="font-mono text-slate-800">{formatDate(selectedRecord.date)}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                  File Size / Source
                </span>
                <span className="text-slate-600">
                  {selectedRecord.fileSize} ({selectedRecord.uploadSource.replace(/_/g, " ")})
                </span>
              </div>
              <div className="sm:col-span-2">
                <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                  Tags
                </span>
                <div className="flex flex-wrap gap-1 mt-0.5">
                  {selectedRecord.tags.map((t, i) => (
                    <span
                      key={i}
                      className="px-1.5 py-0.2 bg-white border border-slate-200 rounded text-[10px] text-slate-600"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* AI/OCR Extracted Section */}
            {selectedRecord.extractedMetadata && (
              <div className="p-4 rounded-xl border border-teal-200 bg-teal-50/20 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileCheck className="w-4 h-4 text-teal-700" />
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      CareLoop Optical Extraction &amp; Clinical Parameters
                    </h4>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-teal-100 text-teal-800 font-semibold">
                    Confidence: {(selectedRecord.extractedMetadata.confidenceScore * 100).toFixed(0)}%
                  </span>
                </div>

                {/* Prominent Verification Notice */}
                <div
                  className={`p-3 rounded-lg border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                    selectedRecord.extractedMetadata.reviewStatus === "VERIFIED_BY_HUMAN"
                      ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                      : "bg-amber-50 border-amber-200 text-amber-900"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {selectedRecord.extractedMetadata.reviewStatus === "VERIFIED_BY_HUMAN" ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                    )}
                    <span className="font-semibold">
                      {selectedRecord.extractedMetadata.reviewStatus === "VERIFIED_BY_HUMAN"
                        ? "✓ Verified by Family Care Coordinator — Clinical Truth Confirmed."
                        : "AI extracted — needs verification. Review and edit before verifying."}
                    </span>
                  </div>

                  {!isEditingExtraction &&
                    selectedRecord.extractedMetadata.reviewStatus !== "VERIFIED_BY_HUMAN" && (
                      <Button
                        size="sm"
                        onClick={() => setIsEditingExtraction(true)}
                        className="text-xs h-7 bg-amber-600 hover:bg-amber-700 text-white shrink-0 gap-1"
                      >
                        <Edit3 className="w-3 h-3" />
                        Edit &amp; Verify
                      </Button>
                    )}
                </div>

                {/* Edit Form or Read-only Display */}
                {isEditingExtraction ? (
                  <div className="space-y-3 bg-white p-3.5 rounded-xl border border-slate-200 text-xs">
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">
                        Diagnosis / Clinical Impression
                      </label>
                      <textarea
                        value={editDiagnosis}
                        onChange={(e) => setEditDiagnosis(e.target.value)}
                        className="w-full p-2 border border-slate-300 rounded-lg text-xs"
                        rows={2}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="font-semibold text-slate-700 block mb-1">
                          Recommended Follow-up Date
                        </label>
                        <input
                          type="date"
                          value={editFollowUpDate}
                          onChange={(e) => setEditFollowUpDate(e.target.value)}
                          className="w-full p-1.5 border border-slate-300 rounded-lg text-xs"
                        />
                      </div>
                      <div>
                        <label className="font-semibold text-slate-700 block mb-1">
                          Physician Notes / Instructions
                        </label>
                        <input
                          type="text"
                          value={editDoctorNotes}
                          onChange={(e) => setEditDoctorNotes(e.target.value)}
                          className="w-full p-1.5 border border-slate-300 rounded-lg text-xs"
                          placeholder="e.g., Fasting required for repeat thyroid test"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsEditingExtraction(false)}
                        className="text-xs"
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleSaveAndVerify}
                        className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white gap-1"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Save &amp; Mark Verified
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedRecord.extractedMetadata.diagnosisSummary && (
                      <div className="text-xs">
                        <span className="font-semibold text-slate-800 block mb-0.5">
                          Extracted Summary / Diagnosis:
                        </span>
                        <p className="text-slate-600 leading-relaxed bg-white p-2.5 rounded-lg border border-teal-100">
                          {selectedRecord.extractedMetadata.diagnosisSummary}
                        </p>
                      </div>
                    )}

                    {/* Prescribed Medications */}
                    {selectedRecord.extractedMetadata.medicines &&
                      selectedRecord.extractedMetadata.medicines.length > 0 && (
                        <div className="space-y-1">
                          <span className="font-semibold text-slate-800 text-xs block">
                            Extracted Prescriptions:
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {selectedRecord.extractedMetadata.medicines.map((m, i) => (
                              <div
                                key={i}
                                className="p-2 rounded-lg bg-white border border-teal-100 text-xs flex justify-between items-center"
                              >
                                <span className="font-bold text-slate-900">{m.name}</span>
                                <span className="text-slate-600 font-mono text-[11px]">
                                  {m.dosage} • {m.frequency}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                    {/* Lab Parameters */}
                    {selectedRecord.extractedMetadata.keyMetrics && (
                      <div className="space-y-1.5 pt-1">
                        <span className="text-[11px] font-semibold text-slate-700 uppercase tracking-tight block">
                          Parsed Lab Parameters:
                        </span>
                        <div className="space-y-1 bg-white rounded-lg border border-teal-100 p-2 text-xs">
                          {selectedRecord.extractedMetadata.keyMetrics.map((m, idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between py-1 border-b border-slate-100 last:border-0"
                            >
                              <span className="text-slate-600">{m.label}</span>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-900 font-mono">
                                  {m.value} {m.unit}
                                </span>
                                <span
                                  className={`text-[10px] font-semibold px-1.5 py-0.2 rounded ${
                                    m.status === "NORMAL"
                                      ? "bg-emerald-100 text-emerald-800"
                                      : m.status === "BORDERLINE"
                                      ? "bg-amber-100 text-amber-800"
                                      : "bg-red-100 text-red-800"
                                  }`}
                                >
                                  {m.status}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-end pt-2">
              <Button
                variant="secondary"
                onClick={() => {
                  setSelectedRecord(null);
                  setIsEditingExtraction(false);
                }}
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Upload Document Modal */}
      <Modal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        title="Upload Clinical Document"
        description="Prescriptions, diagnostic reports, discharge summaries, or medical bills."
        maxWidth="md"
      >
        <form onSubmit={handleUploadSubmit} className="space-y-4">
          <Input
            label="Document Title"
            placeholder="e.g. Apollo HbA1c Lab Report, Cardiology Rx"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            required
          />

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Family Member
              </label>
              <select
                value={newPatientId}
                onChange={(e) => setNewPatientId(e.target.value)}
                className="w-full h-9 px-2.5 rounded-lg border border-slate-300 bg-white text-slate-800 focus:outline-none"
              >
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.relationship})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Document Type
              </label>
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value as DocumentType)}
                className="w-full h-9 px-2.5 rounded-lg border border-slate-300 bg-white text-slate-800 focus:outline-none"
              >
                <option value="PRESCRIPTION">Prescription</option>
                <option value="LAB_REPORT">Lab Report</option>
                <option value="DISCHARGE_SUMMARY">Discharge Summary</option>
                <option value="VACCINATION">Vaccination Record</option>
                <option value="DIAGNOSIS">Diagnosis Report</option>
                <option value="MEDICAL_BILL">Medical Bill</option>
                <option value="OTHER">Other Document</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Doctor Name"
              value={newDoctor}
              onChange={(e) => setNewDoctor(e.target.value)}
            />
            <Input
              label="Hospital / Clinic"
              value={newHospital}
              onChange={(e) => setNewHospital(e.target.value)}
            />
          </div>

          <Input
            label="Tags (comma separated)"
            value={newTags}
            onChange={(e) => setNewTags(e.target.value)}
          />

          <div className="p-4 rounded-xl border-2 border-dashed border-slate-300 text-center text-xs text-slate-500 bg-slate-50">
            <Upload className="w-5 h-5 mx-auto text-slate-400 mb-1" />
            <span>Select file to upload (PDF, JPEG, PNG up to 25MB)</span>
            <p className="text-[10px] text-slate-400 mt-0.5">
              CareLoop Optical Document Pipeline: UPLOADED → PROCESSING → INFORMATION_EXTRACTED →
              NEEDS_VERIFICATION → VERIFIED
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsUploadModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isSimulatingUpload}
              className="bg-slate-900"
            >
              Upload &amp; Extract
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
