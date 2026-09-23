export interface VoiceCallRequest {
  targetPhone: string;
  recipientName: string;
  language: "en-IN" | "te-IN" | "hi-IN" | "ta-IN";
  contextPurpose: "MEDICATION_CHECK" | "APPOINTMENT_REMINDER" | "FOLLOWUP_CONFIRMATION";
  patientId: string;
  promptNotes: string;
  simulateSymptomConcern?: boolean; // Demo test flag for symptom escalation
}

export interface VoiceCallResponse {
  callId: string;
  status:
    | "INITIATED"
    | "RINGING"
    | "IN_PROGRESS"
    | "COMPLETED"
    | "NO_ANSWER"
    | "ESCALATED_TO_HUMAN";
  durationSeconds?: number;
  transcript?: { speaker: "AGENT" | "PATIENT"; text: string; timestamp: string }[];
  extractedOutcome?: {
    confirmedStock: boolean;
    needsRefill: boolean;
    reportedSideEffects?: string;
    escalationTriggered?: boolean;
    symptomMentioned?: string;
  };
}

export interface VoiceProvider {
  name: string;
  providerStatus: "SANDBOX_SIMULATED" | "LIVE_CONFIGURED";
  initiateCall(request: VoiceCallRequest): Promise<VoiceCallResponse>;
  getCallStatus(callId: string): Promise<VoiceCallResponse>;
  escalateToHuman(
    callId: string,
    reason: string
  ): Promise<{ success: boolean; supportTicketId: string; urgentNotificationSent: boolean }>;
}

export type PaymentLifecycleStatus =
  | "PAYMENT_REQUESTED"
  | "AUTHORIZATION_REQUIRED"
  | "AUTHORIZATION_REQUESTED"
  | "AUTHORIZED"
  | "APPROVED"
  | "PAYMENT_PROCESSING"
  | "PAID"
  | "PAYMENT_COMPLETED"
  | "RECEIPT_AVAILABLE"
  | "DECLINED"
  | "EXPIRED"
  | "FAILED"
  | "EXCEEDED_LIMIT";

export interface PaymentReceipt {
  receiptId: string;
  transactionId: string;
  merchantName: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  paidAt: string;
  authorizedBy: string;
  patientName: string;
  itemDescription: string;
  isSandboxSimulated?: boolean;
  sandboxNotice?: string;
}

export interface PaymentAuthRequest {
  approverId: string;
  approverName: string;
  amount: number;
  spendingLimit: number;
  purpose: string;
  merchantName: string;
  metadata?: Record<string, unknown>;
}

export interface PaymentAuthResponse {
  authorizationId: string;
  status: PaymentLifecycleStatus;
  amount: number;
  spendingLimit: number;
  approverId: string;
  merchantName: string;
  timestamp: string;
  approvalToken?: string;
  receipt?: PaymentReceipt;
  auditTrail: { step: string; timestamp: string }[];
  isSandboxSimulated?: boolean;
  errorMessage?: string;
}

export interface PaymentProvider {
  name: string;
  providerStatus: "SANDBOX_SIMULATED" | "LIVE_CONFIGURED";
  createAuthorization(request: PaymentAuthRequest): Promise<PaymentAuthResponse>;
  capturePayment(
    authorizationId: string,
    securityPinOrOtp?: string
  ): Promise<{ success: boolean; transactionId: string; timestamp: string; receipt: PaymentReceipt }>;
  getPaymentStatus(authorizationId: string): Promise<PaymentAuthResponse>;
}

export interface AddressValidationRequest {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
}

export interface AddressValidationResponse {
  isValid: boolean;
  serviceable: boolean;
  normalizedAddress: string;
  estimatedTransitDays: number;
}

export interface ShipmentCreationRequest {
  recipientName: string;
  recipientPhone: string;
  deliveryAddress: AddressValidationRequest;
  originHub: string;
  items: { name: string; quantity: number; prescriptionRequired: boolean }[];
  isExpressColdChain?: boolean;
  responsibleMemberName?: string;
}

export type LogisticsLifecycleStatus =
  | "ORDER_CREATED"
  | "PICKUP_SCHEDULED"
  | "IN_TRANSIT"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "FAILED"
  | "CANCELLED"
  | "DELAYED";

export interface TrackingStep {
  status: LogisticsLifecycleStatus;
  location: string;
  timestamp: string;
  description: string;
}

export interface ShipmentResponse {
  shipmentId: string;
  awbNumber: string;
  status: LogisticsLifecycleStatus;
  originHub: string;
  destinationAddress?: string;
  recipientName?: string;
  responsibleMemberName?: string;
  estimatedDeliveryDate: string;
  trackingHistory: TrackingStep[];
  isSandboxSimulated?: boolean;
  sandboxNotice?: string;
}

export interface LogisticsProvider {
  name: string;
  providerStatus: "SANDBOX_SIMULATED" | "LIVE_CONFIGURED";
  validateAddress(address: AddressValidationRequest): Promise<AddressValidationResponse>;
  createShipment(request: ShipmentCreationRequest): Promise<ShipmentResponse>;
  trackShipment(awbNumber: string): Promise<ShipmentResponse>;
  advanceShipmentStatus?(awbNumber: string, targetStatus?: LogisticsLifecycleStatus): Promise<ShipmentResponse>;
}

