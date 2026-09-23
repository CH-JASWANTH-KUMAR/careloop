export type FamilyRole = "OWNER" | "CARE_COORDINATOR" | "MEMBER" | "DEPENDENT";

export type PermissionCategory =
  | "VIEW_RECORDS"
  | "UPLOAD_RECORDS"
  | "MANAGE_MEDICATIONS"
  | "MANAGE_APPOINTMENTS"
  | "APPROVE_PAYMENTS"
  | "AUTHORIZE_AGENT_ACTIONS"
  | "EMERGENCY_ACCESS";

export interface EmergencyContact {
  name: string;
  phone: string;
  relation: string;
  preferredHospital: string;
}

export interface MemberPermissions {
  canViewRecords: boolean;
  canApprovePayments: boolean;
  canManageMedications: boolean;
  canCoordinateAppointments: boolean;
  // Granular categories
  categories: PermissionCategory[];
}

export interface FamilyMember {
  id: string;
  name: string;
  relationship: "Mother" | "Father" | "Son" | "Daughter" | "Spouse" | "Grandparent" | "Other";
  age: number;
  location: string;
  role: FamilyRole;
  healthStatusSummary: string;
  emergencyContact: EmergencyContact;
  bloodGroup: string;
  allergies: string[];
  conditions: string[];
  avatarColor: string;
  permissions: MemberPermissions;
  insuranceId?: string;
  primaryPhysician?: string;
  preferredLanguage?: "en-IN" | "te-IN" | "hi-IN" | "ta-IN";
}

export interface Family {
  id: string;
  name: string;
  primaryCity: string;
  memberIds: string[];
  primaryCoordinatorId: string;
  isCoordinatorAvailable: boolean;
  monthlySpendingLimit: number;
  createdAt: string;
}

export type TaskPriority = "URGENT" | "HIGH" | "NORMAL" | "LOW";

export type TaskStatus =
  | "NEEDS_ATTENTION"
  | "IN_PROGRESS"
  | "WAITING_FOR_APPROVAL"
  | "WAITING_FOR_EXTERNAL"
  | "COMPLETED"
  | "FAILED"
  | "ESCALATED"
  | "CANCELLED";

export type TaskSource =
  | "USER"
  | "CARE_AGENT"
  | "DOCTOR_FOLLOWUP"
  | "PRESCRIPTION_EXTRACT"
  | "REFILL_TRIGGER"
  | "VOICE_ESCALATION"
  | "CARE_CONTINUITY";

export interface TaskActivityEntry {
  id: string;
  timestamp: string;
  actorName: string;
  actorType: "USER" | "CARE_AGENT" | "PROVIDER";
  action: string;
  note?: string;
}

export interface ExternalRailRef {
  type: "PINE_LABS" | "DELHIVERY" | "GNANI";
  referenceId: string;
  status: string;
  lastUpdated: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  familyMemberId: string; // patient
  ownerId: string; // assigned coordinator/member
  createdBy?: string;
  priority: TaskPriority;
  dueDate: string;
  status: TaskStatus;
  source: TaskSource;
  requiresApproval?: boolean;
  requiredApprovalFromId?: string;
  approvalStatus?: "PENDING" | "APPROVED" | "REJECTED";
  activityHistory: TaskActivityEntry[];
  externalRailRef?: ExternalRailRef;
  tags?: string[];
  snoozedUntil?: string;
  snoozeReason?: string;
  escalationReason?: string;
  relatedRecordId?: string;
  relatedAppointmentId?: string;
  relatedMedicationId?: string;
}

export type DocumentType =
  | "PRESCRIPTION"
  | "LAB_REPORT"
  | "DISCHARGE_SUMMARY"
  | "VACCINATION"
  | "DIAGNOSIS"
  | "MEDICAL_BILL"
  | "OTHER";

export type DocumentPipelineStatus =
  | "UPLOADED"
  | "PROCESSING"
  | "INFORMATION_EXTRACTED"
  | "NEEDS_VERIFICATION"
  | "VERIFIED";

export interface MetricItem {
  label: string;
  value: string;
  unit?: string;
  status: "NORMAL" | "BORDERLINE" | "ELEVATED" | "CRITICAL";
  referenceRange?: string;
}

export interface ExtractedMetadata {
  keyMetrics?: MetricItem[];
  diagnosisSummary?: string;
  prescribedMedicines?: string[];
  dosageInstructions?: string;
  medicines?: { name: string; dosage: string; frequency: string; duration?: string }[];
  doctorNotes?: string;
  doctorName?: string;
  hospitalName?: string;
  documentDate?: string;
  followUpDate?: string;
  reviewStatus: "REVIEW_PENDING" | "VERIFIED_BY_HUMAN";
  inferredNotes: string;
  confidenceScore: number;
}

export interface HealthRecord {
  id: string;
  title: string;
  documentType: DocumentType;
  patientId: string;
  date: string;
  doctor: string;
  hospital: string;
  tags: string[];
  fileSize: string;
  uploadSource: "MANUAL_UPLOAD" | "WHATSAPP_SYNC" | "HOSPITAL_PORTAL";
  pipelineStatus: DocumentPipelineStatus;
  extractedMetadata?: ExtractedMetadata;
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  patientId: string;
  prescribingDoctor: string;
  startDate: string;
  endDate?: string;
  refillIntervalDays: number;
  nextRefillDate: string;
  status: "ACTIVE" | "PAUSED" | "COMPLETED";
  remainingDays: number;
  currentStockUnits: number;
  instructions: string;
  pharmacyName: string;
  costEstimate: number;
  prescriptionStatus: "VERIFIED" | "PENDING_REVIEW";
  responsibleCoordinatorId?: string;
  lastRefillDate?: string;
}

export type AppointmentStatus =
  | "UPCOMING"
  | "COMPLETED"
  | "CANCELLED"
  | "FOLLOWUP_REQUIRED";

export interface Appointment {
  id: string;
  patientId: string;
  doctor: string;
  speciality: string;
  hospital: string;
  date: string;
  time: string;
  location: string;
  status: AppointmentStatus;
  purpose?: string;
  notes: string;
  relatedRecordIds: string[];
  preparationNotes: string[];
  suggestedQuestions?: string[];
  followUpDueDate?: string;
}

export interface ActivityEvent {
  id: string;
  timestamp: string;
  actor: {
    id: string;
    name: string;
    type: "USER" | "CARE_AGENT" | "PROVIDER_GNANI" | "PROVIDER_PINELABS" | "PROVIDER_DELHIVERY";
  };
  actionType:
    | "TASK_CREATED"
    | "TASK_STATUS_CHANGED"
    | "TASK_SNOOZED"
    | "TASK_ESCALATED"
    | "APPROVAL_REQUESTED"
    | "APPROVAL_GRANTED"
    | "APPROVAL_REJECTED"
    | "MEDICATION_REFILL_INITIATED"
    | "PAYMENT_AUTHORIZED"
    | "PAYMENT_CAPTURED"
    | "PAYMENT_DECLINED"
    | "SHIPMENT_CREATED"
    | "SHIPMENT_UPDATED"
    | "SHIPMENT_DELIVERED"
    | "INVENTORY_AUTO_UPDATED"
    | "VOICE_CALL_COMPLETED"
    | "VOICE_ESCALATION_TRIGGERED"
    | "DOCUMENT_UPLOADED"
    | "DOCUMENT_VERIFIED"
    | "CARE_CONTINUITY_HANDOVER";
  entityType:
    | "TASK"
    | "RECORD"
    | "MEDICATION"
    | "APPOINTMENT"
    | "AUTHORIZATION"
    | "SHIPMENT"
    | "FAMILY";
  entityId: string;
  description: string;
  whyExplanation: string; // "Why did CareLoop do this?"
  metadata?: Record<string, unknown>;
}
