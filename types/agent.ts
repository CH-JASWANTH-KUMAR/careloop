export type AgentActionState =
  | "REQUESTED"
  | "UNDERSTANDING"
  | "CONTEXT_LOOKUP"
  | "PLANNING"
  | "WAITING_FOR_INFORMATION"
  | "NEEDS_AUTHORIZATION"
  | "READY_TO_EXECUTE"
  | "EXECUTING"
  | "WAITING_ON_EXTERNAL_SYSTEM"
  | "COMPLETED"
  | "FAILED"
  | "ESCALATED";

export interface AgentActionStep {
  id: string;
  timestamp: string;
  description: string;
  state: "PENDING" | "RUNNING" | "COMPLETED" | "WAITING_APPROVAL" | "FAILED" | "ESCALATED";
  toolName?: string;
  toolArgs?: Record<string, unknown>;
  output?: string;
  requiresHumanReview?: boolean;
}

export interface StructuredAuthorizationData {
  whatWillHappen: string;
  why: string;
  whoItAffects: string;
  cost?: number;
  dataBeingShared: string;
  whatHappensNext: string;
}

export interface AuthorizationPayload {
  authorizationId: string;
  purpose: string;
  targetEntity: string;
  requestedBy: string;
  approverId: string;
  approverName: string;
  amount?: number;
  spendingLimit?: number;
  paymentRail?: "PINE_LABS" | "DIRECT_UPI" | "HOSPITAL_DESK";
  structuredDetails?: StructuredAuthorizationData;
  metadata?: Record<string, unknown>;
}

export interface AgentActionPlan {
  id: string;
  userPrompt: string;
  state: AgentActionState;
  steps: AgentActionStep[];
  requiresAuthorization: boolean;
  authorizationPayload?: AuthorizationPayload;
  resultSummary?: string;
  createdAt: string;
  completedAt?: string;
  escalationReason?: string;
  contextFindings?: {
    patientName: string;
    identifiedTask?: string;
    urgencyLevel: "CRITICAL" | "HIGH" | "ROUTINE";
    missingInformation?: string[];
  };
}

export interface GoldenJourneyData {
  patientName: string;
  patientLocation: string;
  requesterName: string;
  medicationName: string;
  dosage: string;
  currentStockUnits: number;
  requestedDays: number;
  deficitDays: number;
  estimatedCost: number;
  pharmacyName: string;
  isAuthorized: boolean;
  authorizationId?: string;
  paymentReceipt?: import("@/types/providers").PaymentReceipt;
  shipment?: import("@/types/providers").ShipmentResponse;
  inventoryUpdated?: boolean;
  newStockUnits?: number;
  newRemainingDays?: number;
}

export interface ChatMessage {
  id: string;
  sender: "USER" | "AGENT" | "SYSTEM";
  timestamp: string;
  text: string;
  actionPlan?: AgentActionPlan;
  suggestedActions?: { label: string; actionId: string; prompt: string }[];
  isEscalationAlert?: boolean;
  isGoldenJourney?: boolean;
  goldenJourneyData?: GoldenJourneyData;
  failureDetails?: import("@/components/shared/FailureStateCard").FailureStateDetails;
}


