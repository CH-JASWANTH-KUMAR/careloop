/**
 * CareLoop Clinical & Safety Boundary Engine
 *
 * Core rule: CareLoop automates administrative coordination.
 * It NEVER makes medical decisions, prescribes, or modifies clinical dosages.
 */

export interface SafetyCheckResult {
  isSafeToAutomate: boolean;
  requiresHumanIntervention: boolean;
  isEmergencyAlert: boolean;
  reason?: string;
  recommendedAction?: string;
}

// Symptom keywords that indicate acute clinical distress
const ACUTE_SYMPTOM_PATTERNS = [
  /\b(dizzy|dizziness|faint|fainted|blackout|syncope)\b/i,
  /\b(chest pain|chest tightness|angina|palpitations|heart flutter)\b/i,
  /\b(breathless|shortness of breath|difficulty breathing|wheezing)\b/i,
  /\b(severe headache|stroke|numbness|slurred speech|paralysis)\b/i,
  /\b(vomiting blood|uncontrolled bleeding|severe fall|collapsed)\b/i,
];

// Clinical modification keywords that must never be executed by AI
const MEDICAL_DECISION_PATTERNS = [
  /\b(change dose|increase dose|decrease dose|double dose|stop taking|taper)\b/i,
  /\b(prescribe|substitute medicine|alternative drug|recommend antibiotic)\b/i,
  /\b(diagnose|clinical impression|cure|treat disease)\b/i,
];

export function evaluateClinicalSafety(text: string): SafetyCheckResult {
  // Check for medical decision tampering attempts
  for (const pattern of MEDICAL_DECISION_PATTERNS) {
    if (pattern.test(text)) {
      return {
        isSafeToAutomate: false,
        requiresHumanIntervention: true,
        isEmergencyAlert: false,
        reason:
          "CareLoop cannot modify drug dosages or provide medical prescriptions. Only your licensed physician can change therapy.",
        recommendedAction:
          "Schedule a consultation with your treating doctor to review medication modifications.",
      };
    }
  }

  // Check for acute physical symptoms reported
  for (const pattern of ACUTE_SYMPTOM_PATTERNS) {
    if (pattern.test(text)) {
      return {
        isSafeToAutomate: false,
        requiresHumanIntervention: true,
        isEmergencyAlert: true,
        reason:
          "Patient reported potential acute symptom. CareLoop does not diagnose or assess medical severity. Immediate human evaluation required.",
        recommendedAction:
          "Halting automated workflow. Creating priority escalation alert for designated family care coordinator.",
      };
    }
  }

  return {
    isSafeToAutomate: true,
    requiresHumanIntervention: false,
    isEmergencyAlert: false,
  };
}
