import { FamilyMember, PermissionCategory } from "@/types";

export const ALL_PERMISSION_CATEGORIES: {
  category: PermissionCategory;
  label: string;
  description: string;
}[] = [
  {
    category: "VIEW_RECORDS",
    label: "View Medical Records",
    description: "Read sensitive hospital summaries, lab profiles, and clinical notes.",
  },
  {
    category: "UPLOAD_RECORDS",
    label: "Upload Records",
    description: "Upload and submit physical prescriptions and diagnostic sheets for OCR.",
  },
  {
    category: "MANAGE_MEDICATIONS",
    label: "Coordinate Medications",
    description: "Inspect inventory, receive refill warnings, and trigger courier reorders.",
  },
  {
    category: "MANAGE_APPOINTMENTS",
    label: "Manage Appointments",
    description: "Schedule consultations and prepare pre-visit dossiers for doctors.",
  },
  {
    category: "APPROVE_PAYMENTS",
    label: "Approve Payments",
    description: "Authorize Pine Labs transactions up to the family threshold limit.",
  },
  {
    category: "AUTHORIZE_AGENT_ACTIONS",
    label: "Authorize Agent Workflows",
    description: "Review and sign off on CareLoop automated coordination plans.",
  },
  {
    category: "EMERGENCY_ACCESS",
    label: "Emergency Medical Access",
    description: "Access acute emergency protocols, blood groups, and hospital contacts.",
  },
];

export function hasPermission(
  member: FamilyMember | null | undefined,
  category: PermissionCategory
): boolean {
  if (!member) return false;

  // Owners have full authority
  if (member.role === "OWNER") return true;

  // Check granular categories
  if (member.permissions.categories && member.permissions.categories.includes(category)) {
    return true;
  }

  // Fallback to legacy booleans
  switch (category) {
    case "VIEW_RECORDS":
      return member.permissions.canViewRecords;
    case "APPROVE_PAYMENTS":
      return member.permissions.canApprovePayments;
    case "MANAGE_MEDICATIONS":
      return member.permissions.canManageMedications;
    case "MANAGE_APPOINTMENTS":
      return member.permissions.canCoordinateAppointments;
    case "EMERGENCY_ACCESS":
      return true; // Emergency access defaults to family members
    default:
      return false;
  }
}
