# CareLoop Phase 2 — Implementation & Architecture Guide

## Product Vision Realized
CareLoop transforms fragmented medical information into an operational, reliable **family care loop**. It eliminates the single point of failure in family healthcare—the invisible "health coordinator"—by allowing an AI agent to safely organize, verify, track, and plan healthcare workflows while keeping humans in absolute control of sensitive medical decisions.

**Core Product Promise**: *"Your family's health should not depend on one person remembering everything."*

---

## 1. System Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                        User & Family Members                           │
│     (Desktop Linear/Apple Health UI + Mobile Bottom Navigation)       │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│               CareLoop Command Center & Application Layer              │
│  • Overview (Triage: Needs Attention, In Progress, Upcoming)           │
│  • Family & Explicit Permissions Matrix (/family & /onboarding)       │
│  • Care Continuity & Handover Engine (/continuity)                     │
│  • Health Record Intelligence & Verified Timeline (/records)          │
│  • Operational Task Engine & Context Drawer (/tasks)                   │
│  • Medication Inventory & Refill Orchestration (/medications)          │
│  • Consultation Dossier & Doctor Prep Packets (/appointments)          │
│  • Natural Language Care Agent & Consent Modal (/agent)                │
│  • Immutable Activity & Explainability Trail (/activity)               │
└───────────────────┬───────────────────────────────┬────────────────────┘
                    │                               │
                    ▼                               ▼
┌──────────────────────────────────────┐  ┌──────────────────────────────┐
│        Agent State Machine           │  │   Clinical Safety Boundary   │
│  12 Discrete Operational States      │  │ • Prohibits dosage changes   │
│  (REQUESTED → UNDERSTANDING →        │  │ • Halts on acute symptoms    │
│   CONTEXT_LOOKUP → PLANNING →        │  │ • Distinguishes automation   │
│   WAITING_FOR_INFORMATION →          │  │   from human clinical truth  │
│   NEEDS_AUTHORIZATION →              │  └──────────────────────────────┘
│   READY_TO_EXECUTE → EXECUTING →     │
│   WAITING_ON_EXTERNAL_SYSTEM →       │
│   COMPLETED / FAILED / ESCALATED)    │
└───────────────────┬──────────────────┘
                    │
                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        Three-Rail Providers                            │
│ ┌──────────────────────┐┌──────────────────────┐┌────────────────────┐ │
│ │   Gnani Voice Rail   ││   Pine Labs Payment  ││ Delhivery Logistics│ │
│ │ • Multilingual check ││ • 2FA Authorization  ││ • Cold chain ship  │ │
│ │ • Telugu / English   ││ • Spending caps      ││ • AWB tracking     │ │
│ │ • Symptom escalation ││ • Formal receipts    ││ • Auto task sync   │ │
│ └──────────────────────┘└──────────────────────┘└────────────────────┘ │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. New Features Implemented in Phase 2

### Feature 1: Real Family Onboarding (`/onboarding`)
- **7-step guided wizard**:
  1. Family Group Identity & autonomous spending cap
  2. Member Demographics, Blood Groups & Chronic Conditions
  3. Care Responsibilities (Owner, Care Coordinator, Member, Dependent)
  4. Explicit Granular Permissions Matrix (`VIEW_RECORDS`, `UPLOAD_RECORDS`, `MANAGE_MEDICATIONS`, `MANAGE_APPOINTMENTS`, `APPROVE_PAYMENTS`, `AUTHORIZE_AGENT_ACTIONS`, `EMERGENCY_ACCESS`)
  5. Emergency Contacts & Preferred Hospitals
  6. Preferred Communication Language for Gnani Voice Check-ins (`te-IN`, `en-IN`, `hi-IN`, `ta-IN`)
  7. Review & Activation
- Preserves **The Rao Family** as 1-click preloaded demo state while supporting real custom setup.

### Feature 2: Health Record Intelligence & Medical Timeline (`/records`)
- **Realistic OCR Pipeline**: `UPLOADED` → `PROCESSING` → `INFORMATION_EXTRACTED` → `NEEDS_VERIFICATION` → `VERIFIED`.
- Explicit notice: *"AI extracted — needs verification"*.
- Inline editor to verify/modify extracted dosages, lab metrics, and follow-up dates before converting to clinical truth.
- **Medical Timeline View (`MedicalTimelineView.tsx`)**: Chronological progression of verified lab biomarker readings (e.g. TSH: 2.1 mIU/L, HbA1c: 7.1%), prescriptions, and discharge notes.

### Feature 3 & 4: Natural Language Care Agent & 12-State Machine (`/agent`)
- Natural-language queries parsed into structured action plans:
  - *"Make sure Mom has enough thyroid medicine for the next 10 days."*
  - *"Find Dad's latest blood report."*
  - *"Prepare everything needed for Dad's appointment."*
  - *"Remind Mom about her appointment tomorrow."*
  - *"Check whether Grandma's medicine needs to be reordered."*
- **12-State Execution Ribbon**: Visual progress indicators for every state transition with step-by-step audit logs.

### Feature 5: Human Authorization Gate (`AuthorizationModal.tsx`)
- Reusable modal separating **Safe Automation** from **Human Decisions**.
- Displays:
  - **WHAT WILL HAPPEN**: Clear, plain-language description of actions.
  - **WHY**: Clinical or inventory rationale.
  - **WHO IT AFFECTS**: Patient name and location.
  - **COST**: Exact rupee amount authorized under spending cap.
  - **DATA BEING SHARED**: Specific documents or address disclosed to vendors.
  - **WHAT HAPPENS NEXT**: Payment capture and dispatch timeline.
- Action Buttons: `Sign & Approve`, `Reject`, `Edit Parameters`, `Ask me later`.

### Feature 6: Operational Care Task Engine & Context Drawer (`/tasks`)
- Tasks include: `familyMemberId`, `ownerId`, `priority`, `dueDate`, `status`, `source`, `requiresApproval`, `relatedRecordId`, `relatedMedicationId`, `relatedAppointmentId`, `externalRailRef`.
- Operations: **Assign/Reassign**, **Complete**, **Snooze** (1 day, 3 days, 7 days, custom date with reason), **Escalate** (reason logged in audit trail).
- **Task Context Drawer (`TaskContextDrawer.tsx`)**: Deep inspects linked medication inventory, attached health records, scheduled appointments, and live courier tracking.

### Feature 7: Medication Coordination System (`/medications`)
- Every medicine displays: Patient, Medicine, Dosage, Frequency, Remaining Quantity, Days Remaining, Verified Prescription status, Refill Threshold, Next Refill Date, and Responsible Coordinator.
- Strict clinical boundary: Dosage adjustments through AI are strictly prohibited.

### Feature 8: Consultation Preparation Packet (`/appointments`)
- "Before This Appointment" pre-visit packet compiling:
  - Linked diagnostic lab reports and discharge summaries
  - Current active medications and daily regimens
  - Suggested discussion questions for the physician (with clear disclaimer that clinical authority belongs solely to the doctor and patient).

### Feature 9: Gnani Multilingual Voice Rail
- Outbound voice check simulation in Telugu and Indian English.
- **Symptom Concern Intercept**: If an elder reports concerning symptoms (*"I am feeling dizzy and lightheaded"*), the agent **halts automated tasks**, avoids diagnosing, and triggers an urgent human caregiver escalation:
  > *"Potential health concern mentioned. No medical conclusion was made. Human attention required."*

### Feature 10 & 11: Pine Labs & Delhivery Fulfillment
- **Pine Labs**: Generates payment authorization, enforces monthly spending limits, captures payment with 2FA, and issues formal receipts.
- **Delhivery**: Generates AWB tracking references, tracks status (`PICKUP_SCHEDULED` → `IN_TRANSIT` → `DELIVERED`), and updates medication inventory automatically upon delivery.

### Feature 12: Care Continuity Protocol (`/continuity`)
- Solves the single-point-of-failure problem.
- When primary coordinator is marked unavailable (traveling, sick, or unreachable):
  - Displays persistent global alert banner.
  - Displays pending tasks at risk of stalling.
  - Allows another authorized family member (e.g. Meera or Anita) to take over coordination with 1 click, reassigning active tasks and logging the handover reason.

### Feature 13: Activity Provenance & Explainability (`/activity`)
- Every event records: **WHO**, **WHAT**, **WHY**, **WHEN**, **RESULT**.
- Prominently features: *"Why did CareLoop do this?"* explaining the deterministic or clinical basis for each automated action.

### Feature 14: Clinical Safety Boundary (`lib/safetyBoundary.ts`)
- Evaluates inputs for acute red flags (chest pain, shortness of breath, sudden weakness, dosage modifications).
- Prohibits AI agents from prescribing, interpreting critical symptoms, or modifying medications.

---

## 3. Data Model Summary

| Entity | Key Fields | Purpose |
|---|---|---|
| `Family` | `id`, `name`, `primaryCity`, `memberIds`, `primaryCoordinatorId`, `isCoordinatorAvailable`, `monthlySpendingLimit` | Multi-member family container |
| `FamilyMember` | `id`, `name`, `relationship`, `age`, `role`, `bloodGroup`, `allergies`, `conditions`, `permissions` | Explicit RBAC and medical profile |
| `MemberPermissions` | `canViewRecords`, `canApprovePayments`, `canManageMedications`, `canCoordinateAppointments`, `categories` | Category-level privilege separation |
| `HealthRecord` | `id`, `title`, `documentType`, `date`, `doctor`, `hospital`, `pipelineStatus`, `extractedMetadata` | Clinical files with OCR pipeline |
| `Medication` | `id`, `name`, `dosage`, `frequency`, `currentStockUnits`, `remainingDays`, `prescriptionStatus`, `costEstimate` | Adherence & refill tracking |
| `Appointment` | `id`, `doctor`, `speciality`, `hospital`, `date`, `time`, `relatedRecordIds`, `suggestedQuestions` | Pre-visit preparation packs |
| `Task` | `id`, `title`, `familyMemberId`, `ownerId`, `priority`, `dueDate`, `status`, `snoozedUntil`, `escalationReason`, `relatedRecordId` | Operational coordination |
| `ActivityEvent` | `id`, `timestamp`, `actor`, `actionType`, `entityType`, `entityId`, `description`, `whyExplanation`, `metadata` | Immutable audit trail |

---

## 4. Test Scenarios & Acceptance Criteria

### Scenario A: End-to-End Refill Coordination
1. Navigate to `/medications` or `/` (Overview).
2. Anita's Thyronorm displays `3 tablets left (Refill Due in 3 days)`.
3. Click **Coordinate Refill** or open `/agent` and ask: *"Make sure Mom has enough thyroid medicine for the next 10 days."*
4. Agent inspects verified prescription, confirms Apollo Pharmacy inventory, and generates ₹485 authorization request.
5. Review & Authorize modal opens showing **WHAT**, **WHY**, **WHO**, **COST**, **DATA SHARED**, and **WHAT HAPPENS NEXT**.
6. Click **Sign & Approve**.
7. Pine Labs captures payment, Delhivery creates cold-chain shipment, activity log records each step with *"Why did CareLoop do this?"*, and medication stock updates.

### Scenario B: Primary Caregiver Unavailable (Care Continuity)
1. In Header or `/continuity`, click **Mark Coordinator Unavailable**.
2. Global `CareContinuityBanner` appears across the application.
3. Switch persona to Meera Rao or another authorized adult member.
4. Open `/continuity`, view the 4 active tasks needing coverage.
5. Click **Assign as Primary Coordinator**.
6. Coordination transfers, tasks are reassigned to Meera, and the audit log records the handover event.

### Scenario C: Voice Symptom Escalation
1. In Header, click **Voice Check (Gnani)**.
2. In the modal, select **Test Symptom Concern Escalation**.
3. Voice dialogue plays in Telugu/English where Anita reports dizziness and lightheadedness.
4. Agent immediately halts automation and displays:
   > *"Potential health concern mentioned. No medical conclusion was made. Human attention required."*
5. An urgent task is dispatched to Arjun Rao and logged with `VOICE_ESCALATION_TRIGGERED`.

---

## 5. Connecting Real External Sandboxes

Currently, provider adapters run in `SANDBOX_SIMULATED` mode with zero external network dependencies. To wire live sandboxes:

### 1. Gnani.ai Voice Rail
- Set environment variables:
  ```env
  GNANI_API_KEY=your_gnani_token
  GNANI_AGENT_ID=careloop_telephonic_agent_v1
  GNANI_WEBHOOK_URL=https://your-domain.com/api/webhooks/gnani
  ```
- Implement `initiateCall` in `services/voice/VoiceProvider.ts` using `@gnani/voice-sdk` or standard HTTPS REST API to dispatch outbound SIP calls.

### 2. Pine Labs Plural Gateway
- Set environment variables:
  ```env
  PINE_LABS_MERCHANT_ID=your_merchant_id
  PINE_LABS_API_KEY=your_api_key
  PINE_LABS_API_SECRET=your_api_secret
  PINE_LABS_ENV=SANDBOX
  ```
- Call Pine Labs Plural Create Order API (`/api/v1/orders`) and verify HMAC-SHA256 signature in webhook notifications.

### 3. Delhivery Healthcare Express
- Set environment variables:
  ```env
  DELHIVERY_CLIENT_ID=your_delhivery_client
  DELHIVERY_API_TOKEN=your_token
  DELHIVERY_WAREHOUSE_PIN=500033
  ```
- Invoke Delhivery B2C Surface API (`/api/cmu/create.json`) with cold-chain commodity classification.

---

## 6. Verification Status
- `npm run lint`: **0 errors, 0 warnings**
- `npx tsc --noEmit`: **0 errors**
- `npm run build`: **Turbopack static generation successful across all 11 routes**
- HTTP Status Check: **All routes return HTTP 200 OK**
