export interface AgentToolCall {
  name: string;
  arguments: Record<string, unknown>;
}

export interface AgentToolResult {
  tool: string;
  success: boolean;
  data?: unknown;
  error?: string;
  auditExplanation: string;
}

export const AGENT_AVAILABLE_TOOLS = [
  {
    name: "get_family_member",
    description: "Fetch comprehensive demographic, condition, and emergency contact details for a family member.",
    parameters: ["memberId"],
  },
  {
    name: "get_medication",
    description: "Inspect prescribed medications, active inventory, dosages, and refill dates for a family member.",
    parameters: ["patientId"],
  },
  {
    name: "get_appointment",
    description: "Query scheduled consultations, hospital venues, and prep checklists.",
    parameters: ["patientId"],
  },
  {
    name: "get_task",
    description: "Fetch task details, current status, owner, and delegation state.",
    parameters: ["taskId"],
  },
  {
    name: "create_task",
    description: "Create a coordination task with explicit owner, priority, and required approvals.",
    parameters: ["title", "description", "familyMemberId", "ownerId", "priority", "dueDate", "requiredApprovalFromId"],
  },
  {
    name: "request_authorization",
    description: "Gate sensitive actions (payments, diagnostic bookings) behind explicit human consent with spending limits.",
    parameters: ["purpose", "amount", "spendingLimit", "approverId", "targetEntity"],
  },
  {
    name: "update_task",
    description: "Transition a task state or record an activity entry.",
    parameters: ["taskId", "status", "note"],
  },
  {
    name: "log_activity",
    description: "Record an immutable audit trail entry documenting why an action was taken.",
    parameters: ["actionType", "entityType", "entityId", "description", "rationale"],
  },
] as const;
