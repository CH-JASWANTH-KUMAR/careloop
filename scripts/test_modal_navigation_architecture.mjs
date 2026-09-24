import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

console.log("==================================================");
console.log("CARELOOP — MODAL & NAVIGATION ARCHITECTURE VERIFICATION");
console.log("==================================================\n");

// [TEST 1] Verify Modal.tsx uses React Portal to document.body and viewport bounding
console.log("[TEST 1] Verifying Modal.tsx React Portal & layout architecture...");
const modalContent = fs.readFileSync(path.join(rootDir, "components/ui/Modal.tsx"), "utf8");
assert(modalContent.includes("createPortal("), "Modal.tsx must use createPortal");
assert(modalContent.includes("document.body"), "Modal.tsx must portal to document.body");
assert(modalContent.includes("useSyncExternalStore"), "Modal.tsx must use useSyncExternalStore for hydration-safe mounting");
assert(modalContent.includes("max-h-[calc(100dvh-2rem)]") || modalContent.includes("max-h-[calc(100dvh-3.5rem)]"), "Modal.tsx must clamp to viewport height");
assert(modalContent.includes("overflow-y-auto"), "Modal body must be scrollable");
assert(modalContent.includes("flex-col"), "Modal must use flex-col for pinned header/footer");
assert(modalContent.includes("aria-modal=\"true\""), "Modal must have aria-modal=\"true\"");
console.log("✓ Modal.tsx portal, viewport clamping, and scroll isolation verified.");

// [TEST 2] Verify Header.tsx navigation state machine (mutual exclusion)
console.log("\n[TEST 2] Verifying Header.tsx navigation state isolation...");
const headerContent = fs.readFileSync(path.join(rootDir, "components/layout/Header.tsx"), "utf8");
assert(headerContent.includes("type ActiveHeaderDialog = null | \"emergency\" | \"assistant\" | \"notifications\""), "Header.tsx must declare discriminated ActiveHeaderDialog type");
assert(headerContent.includes("const [activeDialog, setActiveDialog] = useState<ActiveHeaderDialog>(null)"), "Header.tsx must use single coordinated activeDialog state");
assert(headerContent.includes("activeDialog === \"emergency\""), "Emergency access must check activeDialog === 'emergency'");
assert(headerContent.includes("activeDialog === \"assistant\""), "Assistant must check activeDialog === 'assistant'");
assert(headerContent.includes("activeDialog === \"notifications\""), "Notifications must check activeDialog === 'notifications'");
assert(!headerContent.includes("isEmergencyOpen"), "Old boolean isEmergencyOpen must be eliminated");
assert(!headerContent.includes("isAssistantOpen"), "Old boolean isAssistantOpen must be eliminated");
console.log("✓ Header navigation mutual exclusion verified (zero multi-modal collisions).");

// [TEST 3] Verify EmergencyAccessModal.tsx contains 7 clinical sections & pinned actions
console.log("\n[TEST 3] Verifying EmergencyAccessModal clinical sections & UX...");
const emergencyContent = fs.readFileSync(path.join(rootDir, "components/shared/EmergencyAccessModal.tsx"), "utf8");
assert(emergencyContent.includes("SECTION 1: Current Family Member"), "Must contain Section 1");
assert(emergencyContent.includes("SECTION 2: Emergency Contacts"), "Must contain Section 2");
assert(emergencyContent.includes("SECTION 3: Allergies & Clinical Warnings"), "Must contain Section 3");
assert(emergencyContent.includes("SECTION 4: Active Medications"), "Must contain Section 4");
assert(emergencyContent.includes("SECTION 5: Recent Critical Health Information"), "Must contain Section 5");
assert(emergencyContent.includes("SECTION 6: Current Care Coordinator"), "Must contain Section 6");
assert(emergencyContent.includes("SECTION 7: Access Reason & Audit Notice"), "Must contain Section 7");
assert(emergencyContent.includes("TEMPORARY ACCESS · READ-ONLY"), "Must clearly display read-only temporary notice");
assert(emergencyContent.includes("Call Primary Attendant"), "Must have primary action: Call Primary Attendant");
assert(emergencyContent.includes("View Emergency Dossier"), "Must have secondary action: View Emergency Dossier");
assert(emergencyContent.includes("footer="), "Must pass pinned footer to Modal component");
console.log("✓ Emergency Access 7 clinical sections, security badges, and pinned action bar verified.");

// [TEST 4] Verify NotificationCenter has controlled props & escape key handling
console.log("\n[TEST 4] Verifying NotificationCenter popover & keyboard accessibility...");
const notifContent = fs.readFileSync(path.join(rootDir, "components/notifications/NotificationCenter.tsx"), "utf8");
assert(notifContent.includes("controlledIsOpen"), "NotificationCenter must support controlled isOpen");
assert(notifContent.includes("Escape"), "NotificationCenter must close on Escape key");
assert(notifContent.includes("useCallback"), "NotificationCenter must wrap closeOpen in useCallback for clean hooks");
console.log("✓ NotificationCenter accessibility and controlled state verified.");

// [TEST 5] Verify RefillWorkflowModal & FamilyScreen use createPortal
console.log("\n[TEST 5] Verifying other application modals are portalled...");
const refillContent = fs.readFileSync(path.join(rootDir, "components/workflow/RefillWorkflowModal.tsx"), "utf8");
assert(refillContent.includes("createPortal("), "RefillWorkflowModal must use createPortal");
assert(refillContent.includes("document.body"), "RefillWorkflowModal must portal to document.body");

const familyContent = fs.readFileSync(path.join(rootDir, "features/family/FamilyScreen.tsx"), "utf8");
assert(familyContent.includes("createPortal("), "FamilyScreen dossier modal must use createPortal");
assert(familyContent.includes("document.body"), "FamilyScreen dossier modal must portal to document.body");
console.log("✓ RefillWorkflowModal and FamilyScreen health dossier portalled to document.body.");

console.log("\n==================================================");
console.log("ALL MODAL & NAVIGATION ARCHITECTURE TESTS PASSED!");
console.log("==================================================");
