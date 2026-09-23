# CareLoop — AI-Powered Family Healthcare Coordination Operating System

> **Submission for The Ken — Great Rewiring Case-Build Competition, Round 2**  
> Built by **CH Jaswanth Kumar**  
> GitHub Repository: [https://github.com/CH-JASWANTH-KUMAR/careloop](https://github.com/CH-JASWANTH-KUMAR/careloop)

[![Next.js](https://img.shields.io/badge/Next.js-16.3.6_(Turbopack)-black?style=flat&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.8-blue?style=flat&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0_(Strict)-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
[![Tests](https://img.shields.io/badge/Tests-31%2F31_Passed_(100%25)-brightgreen?style=flat&logo=checkmarx)](scripts/)
[![Build](https://img.shields.io/badge/Build-15%2F15_Routes_Prerendered-success?style=flat)](app/)
[![Safety](https://img.shields.io/badge/Clinical_Safety-Anti--Diagnostic_Boundary_Enforced-red?style=flat)]()
[![Human-in-the-Loop](https://img.shields.io/badge/Human--in--the--Loop-100%25_Consequential_Actions_Gated-purple?style=flat)]()

---

## Table of Contents

1. [Executive Summary & The Core Problem](#1-executive-summary--the-core-problem)
2. [The Core Insight: The Great Rewiring Thesis](#2-the-core-insight-the-great-rewiring-thesis)
3. [What CareLoop Does: The Closed-Loop Flow](#3-what-careloop-does-the-closed-loop-flow)
4. [The Golden User Journey (Live Walkthrough)](#4-the-golden-user-journey-live-walkthrough)
5. [System Architecture & State Machine](#5-system-architecture--state-machine)
6. [The Three Real-World Provider Rails](#6-the-three-real-world-provider-rails)
7. [Product Feature Tour (Pillar by Pillar)](#7-product-feature-tour-pillar-by-pillar)
   - [7.1 Home — Daily Triage Command Center](#71-home--daily-triage-command-center)
   - [7.2 Family — Multigenerational Health Dossiers](#72-family--multigenerational-health-dossiers)
   - [7.3 Care — Real-Time Coordination Board & Refill Modal](#73-care--real-time-coordination-board--refill-modal)
   - [7.4 Activity — 7-Tuple Provenance Audit Trail](#74-activity--7-tuple-provenance-audit-trail)
   - [7.5 Care Continuity — Single Point of Failure & Handover](#75-care-continuity--single-point-of-failure--handover)
   - [7.6 Appointments — Consultation Dossiers & Post-Visit Loop](#76-appointments--consultation-dossiers--post-visit-loop)
   - [7.7 Care Agent — Natural Language Assistant & Journey Tracker](#77-care-agent--natural-language-assistant--journey-tracker)
   - [7.8 Health Records & OCR Verification Vault](#78-health-records--ocr-verification-vault)
   - [7.9 Medications Cabinet & Daily Burn Intelligence](#79-medications-cabinet--daily-burn-intelligence)
   - [7.10 Settings, Spending Caps & Provider Governance](#710-settings-spending-caps--provider-governance)
8. [Safety, Ethics & Explainability Framework](#8-safety-ethics--explainability-framework)
   - [Anti-Diagnostic Clinical Safeguard](#anti-diagnostic-clinical-safeguard)
   - [6-Field Human Authorization Gate](#6-field-human-authorization-gate)
   - [4-Part Failure Explainability Architecture](#4-part-failure-explainability-architecture)
   - [Spending Limit Ceiling Guardrails](#spending-limit-ceiling-guardrails)
9. [Tech Stack & Engineering Design](#9-tech-stack--engineering-design)
10. [Test Suite & Verification (31/31 Passing)](#10-test-suite--verification-3131-passing)
11. [Quick Start & Local Setup Guide](#11-quick-start--local-setup-guide)
12. [Judge & Evaluator 5-Minute Interactive Demo Guide](#12-judge--evaluator-5-minute-interactive-demo-guide)
13. [Comparison: Typical Hackathon Mock vs Production-Caliber CareLoop](#13-comparison-typical-hackathon-mock-vs-production-caliber-careloop)
14. [Repository File Map](#14-repository-file-map)
15. [Production Roadmap & Limitations](#15-production-roadmap--limitations)

---

## 1. Executive Summary & The Core Problem

Healthcare information in India is becoming digital at blistering speed. Prescriptions arrive as WhatsApp PDFs, lab results are emailed, e-pharmacy apps deliver within hours, and hospital portals store discharge summaries. 

Yet, **the actual responsibility of making healthcare happen still falls on one or two family members** — usually an adult son or daughter managing elderly parents across different cities (e.g., an adult child working in Bengaluru or Chennai managing parents in Hyderabad).

### The Four Systemic Breakdowns in Family Healthcare:

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                     THE 4 SYSTEMIC CARE BREAKDOWNS                           │
├────────────────────────────────┬─────────────────────────────────────────────┤
│ 1. The Invisible Memory Tax    │ "Did Mum take her Thyronorm?" "How many     │
│                                │ tablets are left in the strip?" Refills are  │
│                                │ remembered only when the bottle is empty.   │
├────────────────────────────────┼─────────────────────────────────────────────┤
│ 2. The Single Point of Failure │ One person holds all medical context in     │
│                                │ their head. If that coordinator travels,     │
│                                │ falls sick, or gets busy, care halts.       │
├────────────────────────────────┼─────────────────────────────────────────────┤
│ 3. Fragmented Execution Rails  │ Ordering a refill requires 4 separate apps:  │
│                                │ finding the prescription, WhatsApping the   │
│                                │ pharmacy, paying via UPI, and chasing courier│
├────────────────────────────────┼─────────────────────────────────────────────┤
│ 4. Dropped Post-Visit Loops    │ Doctors provide verbal follow-up orders     │
│                                │ (e.g., repeat lipid profile in 30 days), yet│
│                                │ without coordination, these slip away.      │
└────────────────────────────────┴─────────────────────────────────────────────┘
```

**CareLoop is the operational coordination layer that sits between fragmented family health needs and the real-world actions required to resolve them.**

---

## 2. The Core Insight: The Great Rewiring Thesis

> **"Healthcare coordination is an information synchronization, verification, and execution problem — NOT a medical diagnostic problem."**

Traditional digital health products attempt to replace doctors with AI diagnostic chatbots. Families do not need AI to diagnose chest pain or change medication doses. 

Families need an **unbreakable operational loop** that ensures:
1. Shortages are detected **before** medicines run out.
2. Verified prescriptions and addresses are assembled automatically.
3. Every rupee spent and parcel dispatched receives **explicit, informed human authorization**.
4. Real provider rails (payments, cold-chain logistics, native-language voice calls) execute reliably.
5. Doorstep deliveries automatically update medicine inventories and close the loop.
6. Clinical safety boundaries halt automation immediately if acute symptoms arise.

---

## 3. What CareLoop Does: The Closed-Loop Flow

Every consequential action in CareLoop follows an unbroken, observable, and auditable 9-stage lifecycle:

```mermaid
flowchart LR
    A[1. DETECTION\nStock < 5-Day Safety Threshold] --> B[2. UNDERSTANDING\nRx Lookup & Dose Calculation]
    B --> C[3. PREPARATION\nAssemble Pack, Cost & Courier]
    C --> D[4. HUMAN AUTHORIZATION\n6-Field Explainability Gate]
    D --> E[5. PAYMENT EXECUTION\nPine Labs 2FA Capture]
    E --> F[6. LOGISTICS RAIL\nDelhivery Cold-Chain AWB]
    F --> G[7. DOORSTEP DELIVERY\nConsignee Handover Confirmed]
    G --> H[8. CLOSED-LOOP UPDATE\nInventory +60 Tablets]
    H --> I[9. AUDIT TRAIL\n7-Tuple Provenance Logged]
```

### CareLoop’s Golden Rules:
- **No Silent Actions**: No rupee is charged and no courier is booked without human review.
- **Anti-Diagnostic Boundary**: CareLoop never interprets symptoms or alters regimens.
- **Explainability-First**: Every failure or prompt explains *What, Why, What CareLoop Can Do, and What the Human Needs to Do*.
- **Closed-Loop Verification**: A task is only marked `COMPLETED` when real physical delivery or consultation is verified.

---

## 4. The Golden User Journey (Live Walkthrough)

### Scenario Setup: The Rao Family
- **Anita Rao (Mother, 68 yrs)**: Lives in Jubilee Hills, Hyderabad; diagnosed with hypothyroidism; daily dose: 1 tablet of **Thyronorm 50 mcg** every morning before breakfast.
- **Arjun Rao (Son, 38 yrs)**: Lives in Bengaluru; primary family care coordinator.
- **Meera Rao (Daughter, 34 yrs)**: Lives in Chennai; backup coordinator and practicing physician.

---

### Step-by-Step Execution of the Golden Refill Journey:

| Step | State | Action & System Behavior | Explanatory Provenance |
| :--- | :--- | :--- | :--- |
| **1. Detection** | `DETECTED` | Inventory monitor calculates Anita's Thyronorm at **3 tablets left (3 days supply)**. Breaches family **5-day safety threshold**. | Deficit: 7 days short of requested 10-day buffer. Refill urgently required. |
| **2. Context Lookup** | `PREPARED` | System queries encrypted health records vault. Validates active prescription `#RX-ANITA` from Dr. Sumathi Reddy. Links Apollo Pharmacy Jubilee Hills. | Estimated cost: ₹485 (60-tablet pack). Cold-chain packaging selected. |
| **3. Authorization Gate** | `AWAITING_AUTH` | Action halted. System presents `AuthorizationModal` to Arjun Rao with 6 explainability fields: *Who, What, Why, Cost, Data Shared, Next*. | Guardrail: Arjun must explicitly sign off before Pine Labs rail can charge. |
| **4. Human Sign-Off** | `AUTHORIZED` | Arjun clicks **"Approve & Execute via Pine Labs"**. | Sign-off logged with Arjun's credentials and timestamp. |
| **5. Payment Capture** | `IN_PROGRESS` | `PaymentProvider` executes pre-authorized 2FA capture against Pine Labs Plural sandbox. | Generates official transaction receipt `#SANDBOX-REC-PL-4821` (₹485). |
| **6. Logistics Dispatch** | `WAITING` | `LogisticsProvider` books Delhivery Healthcare Express shipment from Apollo Begumpet Hub to Jubilee Hills. | Generates AWB `#SANDBOX-AWB-DL-882190`. Live cold-chain telemetry active (4.2°C). |
| **7. Checkpoint Transit** | `WAITING` | Courier advances: `ORDER_CREATED` $\rightarrow$ `PICKUP_SCHEDULED` $\rightarrow$ `IN_TRANSIT` $\rightarrow$ `OUT_FOR_DELIVERY` $\rightarrow$ `DELIVERED`. | Doorstep handover confirmed with Anita Rao at Plot 42, Road No 12, Jubilee Hills. |
| **8. Closed-Loop Sync** | `COMPLETED` | Delivery trigger fires: Anita's Thyronorm stock increments from **3 to 63 tablets (63 days)**. Task marked `COMPLETED`. | Next refill scheduled for ~60 days out. Gnani Telugu voice wellness check queued for 9:00 AM tomorrow. |

---

## 5. System Architecture & State Machine

CareLoop is built on a resilient, reactive, client-first architecture with strict SSR hydration safety and zero-drift state machines.

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT BROWSER                                  │
│                                                                              │
│  ┌───────────────┐ ┌───────────────┐ ┌───────────────┐ ┌──────────────────┐  │
│  │   HOME (/)    │ │ FAMILY (/fam) │ │  CARE (/care) │ │ ACTIVITY (/act)  │  │
│  │ Daily Triage  │ │ Health Dossier│ │ Workflows &   │ │ 7-Tuple Audit    │  │
│  │ Feed & Urgents│ │ & Emergencies │ │ Kanban Board  │ │ Provenance Trail │  │
│  └───────┬───────┘ └───────┬───────┘ └───────┬───────┘ └────────┬─────────┘  │
│          │                 │                 │                  │            │
│          └─────────────────┴────────┬────────┴──────────────────┘            │
│                                     ▼                                        │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │                      UNIFIED REACTIVE STORE LAYER                      │  │
│  │  • useCareLoopStore (Central business logic & state transitions)       │  │
│  │  • useSyncExternalStore pattern (Zero SSR hydration flicker)           │  │
│  │  • localStorage persistence engine ('careloop_*_v2')                   │  │
│  │  • Deterministic seed hydration (The Rao Family)                       │  │
│  └──────────────────────────────────┬─────────────────────────────────────┘  │
│                                     ▼                                        │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │                     CANONICAL TASK STATE MACHINE                       │  │
│  │                                                                        │  │
│  │   [DETECTED] ──> [PREPARED] ──> [AWAITING_AUTH] ──> [AUTHORIZED]       │  │
│  │                                        │                 │             │  │
│  │                                        ▼ (Declined)      ▼             │  │
│  │                                   [REJECTED]       [IN_PROGRESS]       │  │
│  │                                   [DEFERRED]             │             │  │
│  │                                                          ▼             │  │
│  │                                                      [WAITING]         │  │
│  │                                                          │             │  │
│  │                                                          ▼             │  │
│  │                     [ESCALATED] <── (Failure) ───>  [COMPLETED]        │  │
│  └──────────────────────────────────┬─────────────────────────────────────┘  │
│                                     │                                        │
│                                     ▼                                        │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │                  PROVIDER ADAPTER ABSTRACTION RAILS                    │  │
│  │                                                                        │  │
│  │   ┌─────────────────────┐┌────────────────────┐┌─────────────────────┐  │  │
│  │   │      GNANI.AI       ││  PINE LABS PLURAL  ││ DELHIVERY LOGISTICS │  │  │
│  │   │  Conversational     ││  Pre-Auth 2FA Pay  ││ Cold-Chain Express  │  │  │
│  │   │  Telugu/Hindi Voice ││  Spending Limits   ││ Live AWB Tracking   │  │  │
│  │   └─────────────────────┘└────────────────────┘└─────────────────────┘  │  │
│  │   [SANDBOX SIMULATION MODE] ◄──────────────► [LIVE REST API READY]     │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────────────┘
```

### The Canonical State Transition Model:
1. `DETECTED`: Action flagged by stock calculation, appointment date, or agent intent.
2. `PREPARED`: Clinical & logistical parameters assembled into an executable draft.
3. `AWAITING_AUTHORIZATION`: Gated until an authorized coordinator signs off.
4. `AUTHORIZED`: Explicit human approval granted.
5. `IN_PROGRESS`: Payment captured and pharmacy order confirmed.
6. `WAITING`: Real-world asynchronous wait (courier dispatch or doctor confirmation).
7. `COMPLETED`: Verified delivery or appointment completion; state closed.
8. `REJECTED` / `DEFERRED`: Coordinator declined or asked for a delayed reminder.
9. `FAILED`: Provider error (payment decline, gate locked); triggers 4-part recovery.
10. `ESCALATED`: Clinical symptom detected; automation halted; human notified.

---

## 6. The Three Real-World Provider Rails

CareLoop integrates three essential provider rails, fully abstracted behind TypeScript interfaces. Each provider operates in **Sandbox / Simulated Mode** with explicit UI badges, and supports **instant hot-swapping to Live APIs** via environment variables.

### 1. Gnani.ai — Conversational Voice Rail
- **Purpose**: Outbound automated wellness check-ins for elderly family members who do not use smartphone apps.
- **Languages**: Telugu (`te-IN`), Indian English (`en-IN`), Hindi (`hi-IN`).
- **Clinical Safety Enforcement**: If the dependent reports symptoms (e.g., *"I feel dizzy after taking the medicine"*), the conversational engine immediately halts and dispatches an urgent `ESCALATED` task to the family coordinator.
- **Location in Code**: [`services/voice/VoiceProvider.ts`](file:///home/chjaswanthkumar/projects/kencase_hack/services/voice/VoiceProvider.ts)

### 2. Pine Labs Plural — Healthcare Payment Gateway
- **Purpose**: Secure, consent-backed payments for pharmacy orders and consultation fees.
- **Safety Guardrails**: Hard monthly family spending caps (default: ₹5,000/month). Charges exceeding this threshold are blocked with `SPENDING_LIMIT_EXCEEDED` and require policy elevation.
- **Deterministic Receipts**: Issues formal financial receipts (e.g., `SANDBOX-REC-PL-4821`).
- **Location in Code**: [`services/payment/PaymentProvider.ts`](file:///home/chjaswanthkumar/projects/kencase_hack/services/payment/PaymentProvider.ts)

### 3. Delhivery Healthcare Express — Cold-Chain Logistics
- **Purpose**: Temperature-sensitive pharmaceutical delivery from verified pharmacy hubs to the patient's doorstep.
- **Live Checkpoints**: `ORDER_CREATED` $\rightarrow$ `PICKUP_SCHEDULED` $\rightarrow$ `IN_TRANSIT` (4.2°C logged) $\rightarrow$ `OUT_FOR_DELIVERY` $\rightarrow$ `DELIVERED`.
- **Closed-Loop Trigger**: Doorstep delivery confirmation automatically fires an inventory replenishment event in the application store.
- **Location in Code**: [`services/logistics/LogisticsProvider.ts`](file:///home/chjaswanthkumar/projects/kencase_hack/services/logistics/LogisticsProvider.ts)

---

## 7. Product Feature Tour (Pillar by Pillar)

CareLoop’s information architecture is structured into **4 Primary Navigation Pillars** supported by specialized operational modules:

### 7.1 Home — Daily Triage Command Center (`/`)
Designed for an adult coordinator with 30 seconds to spare:
- **Triage Header**: Personalized greeting showing active coordinator status and immediate family posture.
- **Common Action Shortcuts**: Instant one-click triggers:
  - *"Make sure Mum has enough medicine for next 10 days"*
  - *"Prepare Dad's cardiology appointment"*
  - *"Find the latest thyroid lab report"*
  - *"Who is handling Mum's care while I'm travelling?"*
- **Needs Your Attention (Red Banner)**: Urgent action cards showing low-stock alerts, pending authorizations, or clinical escalations.
- **CareLoop Is Handling (Green Cards)**: Transparent overview of active workflows currently in transit or awaiting courier checkpoints.
- **Upcoming Care Events (Blue/Grey Cards)**: Chronological horizon of appointments, scheduled lab tests, and routine doses.

---

### 7.2 Family — Multigenerational Health Dossiers (`/family`)
A centralized directory for the entire family tree with granular role assignments:
- **Family Hierarchy View**: Connects parents in Hyderabad (Anita & Ramesh), adult children in Bengaluru (Arjun) and Chennai (Meera), and grandchildren.
- **Interactive 6-Tab Health Dossier**:
  1. *Overview*: Vitals summary, active conditions, primary physician, emergency contacts.
  2. *Medications*: Real-time stock, dosage, prescribing doctor, and one-click refill trigger.
  3. *Appointments*: Upcoming doctor visits, past consultations, pre-visit packets.
  4. *Health Records*: Prescriptions, lab panels, and discharge summaries with OCR verification tags.
  5. *Activity Trail*: Filtered provenance history specific to this family member.
  6. *Permissions & Access*: Assigned care coordinator, secondary coordinator, and financial authorization limits.
- **Emergency Medical Access (Header)**: One-tap red button opening an instant critical medical card (Blood Group, Allergies, Hospital, Insurance Policy Number, Emergency Contacts).

---

### 7.3 Care — Real-Time Coordination Board & Refill Modal (`/care`)
The operational engine of family healthcare:
- **4-Column Reactive Kanban**:
  - `Needs Approval` (Tasks awaiting human authorization)
  - `In Progress` (Orders processing via payment rails)
  - `Waiting` (Shipments in transit or external dependencies)
  - `Completed` (Finished actions with verified closed-loop updates)
- **Interactive Refill Workflow Modal**:
  - Step 1: Medication & Shortage Review.
  - Step 2: Prescription & Pharmacy Verification.
  - Step 3: Human Authorization Sign-Off.
  - Step 4: Pine Labs 2FA Payment Execution.
  - Step 5: Delhivery Live Cold-Chain Tracking & Checkpoint Simulation.
  - Step 6: Closed-Loop Inventory Confirmation.
- **Interactive Failure Simulation Controls**:
  - Dedicated buttons in the modal to test payment declines or courier delivery exceptions, rendering the standard 4-part `FailureStateCard`.

---

### 7.4 Activity — 7-Tuple Provenance Audit Trail (`/activity`)
Complete transparency into every automated decision, payment, and delivery:
- **7-Tuple Explainability Card**:
  - **WHO**: Actor attribution (CareLoop AI, Arjun Rao, Pine Labs, Delhivery).
  - **WHAT**: Specific action performed.
  - **WHEN**: Timestamp and formatted date.
  - **WHY**: Plain-language operational rationale (e.g., *"Stock fell below 5-day safety threshold"*).
  - **SOURCE**: Ingress channel (`CARE_AGENT`, `PINE_LABS_WEBHOOK`, `DELHIVERY_TRACKING`, `GNANI_VOICE`).
  - **AUTHORIZATION**: Signing authority and threshold check.
  - **RESULT**: Concrete system outcome (e.g., *"Stock updated from 3 to 63 tablets"*).
- **Audit Export**: One-click download of the complete family provenance log as structured JSON.

---

### 7.5 Care Continuity — Single Point of Failure & Handover (`/continuity`)
Prevents healthcare from collapsing when the primary coordinator travels or falls sick:
- **Care Continuity Radar**: Categorizes all family health events into 4 operational buckets:
  1. *Today* (Doses due today, today's visits).
  2. *This Week* (Refills needed within 7 days, upcoming appointments).
  3. *Waiting* (Active shipments, pending authorizations).
  4. *Escalated* (Critical shortages, coordinator unavailability).
- **Bidirectional Coordinator Handover**:
  - Arjun Rao marks himself "Unavailable" $\rightarrow$ System triggers handover protocol to Meera Rao.
  - All pending approvals and alerts route to Meera.
  - A persistent **Care Continuity Banner** displays across every screen in the application.
  - When Arjun returns, a single-click **"Resume Arjun as Coordinator"** action restores primary status with full audit logging.

---

### 7.6 Appointments — Consultation Dossiers & Post-Visit Loop (`/appointments`)
Eliminates dropped balls before and after doctor visits:
- **"Before This Appointment" Pre-Visit Dossier**:
  - Collates relevant vitals and previous medical notes.
  - Displays linked lab reports (e.g., lipid panels, thyroid panels).
  - **Active Medication Regimen Context**: Shows all current prescriptions, daily dosages, and remaining days of stock so the doctor has complete context.
  - Prepares suggested questions for the physician.
  - Includes a prominent clinical notice: questions are for preparation only, not medical advice.
- **Closed Post-Visit Loop ("Complete Consultation")**:
  - Clicking "Complete Consultation" marks the visit finished.
  - **Automatically creates a post-visit follow-up task** (e.g., *"Post-Visit Review: Dr. K.S. Rao (Ramesh Rao)"*) in `PREPARED` state so doctors' follow-up instructions are tracked.

---

### 7.7 Care Agent — Natural Language Assistant & Journey Tracker (`/agent`)
A conversational assistant governed by strict state machine guardrails:
- **Natural Language Parsing**: Understands family references like *"Mom"*, *"Grandpa"*, and complex intents like *"Make sure Mom has enough thyroid medicine for the next 10 days"*.
- **Integrated Golden Journey Tracker**:
  - Executive story card with plain-language summary.
  - 8-part transparency matrix.
  - Direct decision gates (`Approve`, `Reject`, `Ask Me Later`).
  - One-click **"Reset Journey"** button to restart the live demo instantly.
- **Clinical Safety Intercept**:
  - Prompt: *"Mom is feeling dizzy and faint when standing."*
  - CareLoop halts execution, displays an anti-diagnostic clinical notice, and dispatches an urgent escalation task.

---

### 7.8 Health Records & OCR Verification Vault (`/records`)
- Organizes family health documents by patient, type (Prescription, Lab Report, Discharge Summary), and date.
- Documents tagged as **"AI extracted — needs verification"** feature an inline editor allowing family members to verify medication names and dosages before locking the record as `VERIFIED`.

---

### 7.9 Medications Cabinet & Daily Burn Intelligence (`/medications`)
- Tracks active inventory across all family members.
- Computes daily burn rates, safety thresholds, and refill urgency.
- Provides one-click reorder triggers linked to verified pharmacy catalog items.

---

### 7.10 Settings, Spending Caps & Provider Governance (`/settings`)
Cleanly organized into 5 structured sections:
1. **Account & Family**: Active coordinator status, family profile details.
2. **Care Preferences**: Notification thresholds, safety day buffers.
3. **Communication**: Outbound voice language selection (Telugu, Hindi, English).
4. **Provider Connections**: Sandbox simulation status and live API credential slots for Gnani.ai, Pine Labs, and Delhivery.
5. **Safety & Data Governance**: Monthly coordination spending limits (e.g., ₹5,000 cap) and demo seed state reset.

---

## 8. Safety, Ethics & Explainability Framework

CareLoop is built from the ground up to prevent AI hallucinations, unauthorized spending, and dangerous clinical overreach.

### Anti-Diagnostic Clinical Safeguard
CareLoop enforces a hard computational boundary between **health coordination** and **medical diagnosis**:
- **Permitted**: Refill tracking, appointment logistics, document organization, native-language check-in calls.
- **Strictly Prohibited**: Recommending dosage changes, interpreting lab values, triaging physical symptoms, or providing medical advice.
- **Behavior**: Any reported symptom immediately halts automation, displays an anti-diagnostic explainability notice, and dispatches an urgent `ESCALATED` task to the human coordinator.

---

### 6-Field Human Authorization Gate
Before any financial debit occurs or courier order is dispatched, CareLoop presents a mandatory authorization modal containing 6 explicit fields:

```
┌────────────────────────────────────────────────────────────────────────┐
│                   HUMAN AUTHORIZATION GATE (6 FIELDS)                  │
├───────────────────┬────────────────────────────────────────────────────┤
│ 1. WHAT           │ Order 60 tablets of Thyronorm 50 mcg               │
├───────────────────┼────────────────────────────────────────────────────┤
│ 2. WHY            │ Current stock (3 tablets) is below safety buffer   │
├───────────────────┼────────────────────────────────────────────────────┤
│ 3. WHO            │ Patient: Anita Rao · Approver: Arjun Rao           │
├───────────────────┼────────────────────────────────────────────────────┤
│ 4. COST           │ ₹485 INR (Captured via Pine Labs 2FA Consent)      │
├───────────────────┼────────────────────────────────────────────────────┤
│ 5. DATA SHARED    │ Prescription #RX-ANITA + Jubilee Hills Address     │
├───────────────────┼────────────────────────────────────────────────────┤
│ 6. WHAT'S NEXT    │ Delhivery cold-chain dispatch (4-hr delivery SLA)  │
└───────────────────┴────────────────────────────────────────────────────┘
```

---

### 4-Part Failure Explainability Architecture
CareLoop rejects generic "Something went wrong" banners. All 9 error and exception states render a standardized 4-part explainability card ([`FailureStateCard.tsx`](file:///home/chjaswanthkumar/projects/kencase_hack/components/shared/FailureStateCard.tsx)):

1. **WHAT HAPPENED**: Specific technical or operational event (e.g., *"Payment Gateway Timeout via Pine Labs"*).
2. **WHY THIS OCCURRED**: Clear explanation (e.g., *"Bank server did not respond within the 30-second window"*).
3. **WHAT CARELOOP CAN DO**: Automated system recovery (e.g., *"Payment reservation held; retry with secondary UPI rail ready"*).
4. **WHAT THE HUMAN NEEDS TO DO**: Clear, non-technical instructions for the coordinator.

---

### Spending Limit Ceiling Guardrails
Families can set a monthly spending limit (default: ₹5,000). Any automated transaction that would cause cumulative spend to exceed this ceiling is blocked with `SPENDING_LIMIT_EXCEEDED`, requiring coordinator policy override in Settings.

---

## 9. Tech Stack & Engineering Design

| Layer | Technology | Architecture Decision & Rationale |
| :--- | :--- | :--- |
| **Framework** | **Next.js 16.3.6 (App Router + Turbopack)** | Instant route transitions, modern React 19 server/client boundaries, static route optimization. |
| **Language** | **TypeScript 5 (Strict Mode)** | Full end-to-end type safety across state machines, provider contracts, and UI components. |
| **Styling** | **Tailwind CSS v4 + Geist Font** | Modern, accessible healthcare interface with curated, high-contrast HSL color palettes and zero bloat. |
| **State Store** | **Custom Reactive Hook Store (`useCareLoopStore`)** | Centralized single-source-of-truth pattern with deterministic event dispatching. |
| **Hydration Safety** | **`useSyncExternalStore`** | Eliminates SSR hydration flicker and mismatch errors when reading from local storage. |
| **Persistence** | **`localStorage` (`careloop_*_v2`)** | Client-side persistence with automatic fallback to seed data snapshot for seamless demo evaluation. |
| **Animation** | **Framer Motion** | Micro-interactions for modal transitions, checkpoint progressions, and radar pulses. |
| **Icons** | **Lucide React** | Consistent, lightweight iconography across all medical and logistical domains. |
| **Data Fetching** | **TanStack React Query** | Cached state synchronization and query isolation. |

---

## 10. Test Suite & Verification (31/31 Passing)

CareLoop includes **three automated, deterministic test suites** written in native Node.js requiring zero external test runner overhead.

```bash
# Run all test suites in sequence
node scripts/test_golden_journey.mjs && node scripts/test_phase4_scenarios.mjs && node scripts/test_phase6_e2e.mjs
```

### Complete Test Results Summary:

| Test Suite | File | Tests | Status | Scope Verified |
| :--- | :--- | :---: | :---: | :--- |
| **Golden Journey (Phase 3)** | `scripts/test_golden_journey.mjs` | 9 / 9 | **PASS (100%)** | 16-step end-to-end Thyronorm refill, Pine Labs receipt capture, Delhivery cold-chain checkpoints, and inventory sync. |
| **Production Scenarios (Phase 4)** | `scripts/test_phase4_scenarios.mjs` | 10 / 10 | **PASS (100%)** | Authorization rejections, spending limits, missing prescriptions, missing addresses, payment failures, and delivery exceptions. |
| **Full Product E2E (Phase 6)** | `scripts/test_phase6_e2e.mjs` | 12 / 12 | **PASS (100%)** | Canonical task state machine, bidirectional coordinator handover, appointment pre-visit dossier, post-visit follow-up generation, and 7-tuple provenance trail. |
| **TOTAL** | — | **31 / 31** | **PASS (100%)** | **Zero failures across all operational paths.** |

### Build & Type Verification:
```bash
npx tsc --noEmit    # Exit Code 0: 0 TypeScript errors
npm run lint        # Exit Code 0: 0 ESLint errors, 0 warnings
npm run build       # Exit Code 0: 15/15 static pages successfully prerendered
```

---

## 11. Quick Start & Local Setup Guide

Follow these steps to run CareLoop locally in under 2 minutes:

### Prerequisites:
- **Node.js**: v18.18+ or v20+ (Node 22 recommended)
- **npm**: v9+ or v10+

### Installation & Launch:
```bash
# 1. Clone the repository
git clone https://github.com/CH-JASWANTH-KUMAR/careloop.git
cd careloop

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env
# Default CARELOOP_PROVIDER_MODE=sandbox works out-of-the-box

# 4. Start development server with Turbopack
npm run dev
```

Open your browser and navigate to: **[http://localhost:3000](http://localhost:3000)**

> [!TIP]
> **Demo Seed State**: CareLoop initializes with the complete fictional **Rao Family** dataset (Anita, Ramesh, Arjun, Meera, Kavita, Vikram) with active medications, appointments, and pending refill tasks.  
> To reset the demo state at any time: navigate to **Settings** $\rightarrow$ scroll to **Safety & Governance** $\rightarrow$ click **"Reset Demo State"**.

---

## 12. Judge & Evaluator 5-Minute Interactive Demo Guide

If you are evaluating this project for the hackathon, follow this 5-minute script to experience every key feature:

### 1. Experience the Golden Refill Journey (2 minutes):
1. Open the application at [http://localhost:3000](http://localhost:3000).
2. Notice the **Needs Your Attention** section highlighting Anita Rao's Thyronorm shortage (3 tablets left).
3. Click **"Review & Refill (₹485)"**.
4. The **Refill Workflow Modal** opens:
   - Review prescription details (`#RX-ANITA-2026`) and pharmacy pricing.
   - Click **"Approve Refill & Dispatch"** (Human Authorization Gate).
   - Watch Pine Labs execute payment and generate receipt `#SANDBOX-REC-PL-4821`.
   - Watch Delhivery issue AWB `#SANDBOX-AWB-DL-882190`.
   - Click **"Advance Checkpoint"** or **"Deliver Now"** to simulate delivery to Jubilee Hills.
5. Notice that Anita's stock immediately updates from **3 to 63 tablets** and the urgent alert clears!

### 2. Test Failure Handling & Explainability (1 minute):
1. Navigate to **Care** (`/care`).
2. Open any refill task or click the test buttons inside the Refill Modal:
   - Click **"Simulate Payment Failure"** $\rightarrow$ Observe the 4-part `FailureStateCard`.
   - Click **"Simulate Delivery Exception"** $\rightarrow$ Observe cold-chain hub return protocol.

### 3. Test Care Continuity & Coordinator Handover (1 minute):
1. Navigate to **Continuity** (`/continuity`).
2. Under "Primary Coordinator Status", toggle Arjun Rao to **"Mark Unavailable"**.
3. Notice:
   - System reassigns pending coordination to Meera Rao.
   - A global **Care Continuity Banner** appears at the top of every screen.
4. Click **"Resume Arjun as Coordinator"** $\rightarrow$ Status restores smoothly with full activity provenance.

### 4. Test Pre-Visit Dossier & Post-Consultation Loop (1 minute):
1. Navigate to **Appointments** (`/appointments`).
2. Click **"Before This Appointment"** on Dr. K.S. Rao's consultation:
   - Notice the patient vitals, questions for the doctor, and **active medication regimen context**.
3. Click **"Complete Consultation"**:
   - The consultation is marked `COMPLETED`.
   - CareLoop automatically creates a new **"Post-Visit Review"** task so follow-ups are never dropped!

### 5. Test Clinical Safety Boundary (30 seconds):
1. Navigate to **Care Agent** (`/agent`).
2. Type or prompt: *"Mom is feeling dizzy and lightheaded after her morning dose."*
3. Watch CareLoop halt automation, display the anti-diagnostic clinical notice, and dispatch an urgent escalation task.

---

## 13. Comparison: Typical Hackathon Mock vs Production-Caliber CareLoop

| Dimension | Typical Hackathon Prototype | CareLoop (Case-Build Round 2) |
| :--- | :--- | :--- |
| **State Management** | Hardcoded JSON rendered statically | Reactive store (`useCareLoopStore`) with `useSyncExternalStore` & `localStorage` persistence. |
| **Task Lifecycle** | Button clicks show temporary toasts | Canonical 10-state machine (`DETECTED` $\rightarrow$ `PREPARED` $\rightarrow$ `AWAITING_AUTH` $\rightarrow$ `COMPLETED`). |
| **External Providers** | Static PNG logos | Complete provider abstraction adapters (Gnani, Pine Labs, Delhivery) with hot-swappable live REST endpoints. |
| **Failure UX** | Crashes or shows "Error 500" | Standardized 4-part `FailureStateCard` across 9 distinct failure modes. |
| **Clinical Safety** | Unrestricted AI gives dangerous medical advice | Strict anti-diagnostic boundary: acute symptoms halt automation and escalate to humans. |
| **Single Point of Failure** | Assumes coordinator is always available | Formal Care Continuity Radar and bidirectional handover protocol (Arjun $\leftrightarrow$ Meera). |
| **Auditability** | No logs | Full 7-tuple provenance trail (WHO, WHAT, WHEN, WHY, SOURCE, AUTH, RESULT), JSON exportable. |
| **Test Coverage** | None | 3 automated test suites, **31 / 31 passing (100% green)**. |

---

## 14. Repository File Map

```
careloop/
├── app/                                 # Next.js 16 App Router Routes
│   ├── layout.tsx                       # Root layout with Sidebar & Header
│   ├── page.tsx                         # / -> Overview Dashboard
│   ├── activity/page.tsx                # /activity -> Provenance Audit Trail
│   ├── agent/page.tsx                   # /agent -> Conversational Care Agent
│   ├── appointments/page.tsx            # /appointments -> Doctor Consultations & Dossiers
│   ├── care/page.tsx                    # /care -> Care Coordination Kanban Board
│   ├── continuity/page.tsx              # /continuity -> Care Continuity & Handover
│   ├── family/page.tsx                  # /family -> Member Directory & Health Dossiers
│   ├── medications/page.tsx             # /medications -> Medication Cabinet & Refills
│   ├── onboarding/page.tsx              # /onboarding -> New Family Setup Wizard
│   ├── records/page.tsx                 # /records -> Health Records Vault & OCR Verification
│   ├── settings/page.tsx                # /settings -> Governance & Spending Limits
│   └── tasks/page.tsx                   # /tasks -> Task Engine & Context Drawer
├── components/                          # Reusable UI Primitives & Workflows
│   ├── layout/                          # Header, Sidebar, MobileNav
│   ├── shared/                          # AuthorizationModal, FailureStateCard, CareContinuityBanner, SafetyNotice
│   ├── ui/                              # Button, Badge, Modal, Input primitives
│   └── workflow/                        # RefillWorkflowModal (End-to-End Fulfillment Loop)
├── features/                            # Domain Feature Screens
│   ├── activity/ActivityScreen.tsx      # 7-Tuple Provenance Journal & Filter Views
│   ├── agent/CareAgentScreen.tsx        # Care Agent Chat & Decision Engine
│   ├── agent/GoldenJourneyTracker.tsx   # Interactive Golden Journey Visualizer
│   ├── appointments/AppointmentsScreen.tsx # Pre-Visit Packet & Post-Consultation Loop
│   ├── care/CareScreen.tsx              # Kanban Workflow Board & Simulation Triggers
│   ├── continuity/CareContinuityScreen.tsx # Care Continuity Radar & Handover Engine
│   ├── family/FamilyScreen.tsx          # Family Hierarchy & 6-Tab Health Dossier
│   ├── medications/MedicationsScreen.tsx # Medication Inventory & Burn Calculations
│   ├── onboarding/OnboardingWizard.tsx  # Multi-Step Family Onboarding Wizard
│   ├── overview/OverviewDashboard.tsx   # Triage-First Daily Command Center
│   ├── records/HealthRecordsScreen.tsx  # Records Vault & OCR Verification Pipeline
│   ├── records/MedicalTimelineView.tsx  # Interactive Medical Event Timeline
│   ├── settings/SettingsScreen.tsx      # 5-Section Configuration & Data Reset
│   └── tasks/TaskEngineScreen.tsx       # Canonical Task Engine & Context Drawer
├── db/                                  # Seed Data
│   └── seedData.ts                      # The Rao Family Comprehensive Dataset
├── hooks/                               # State Management
│   ├── useCareLoopStore.ts              # Central Reactive Store & State Machine
│   ├── useCareAgent.ts                  # Conversational Planner & Clinical Intercept
│   └── useCareContinuity.ts             # Coordinator Status & Handover Hook
├── services/                            # Provider Adapter Rails
│   ├── voice/VoiceProvider.ts           # Gnani.ai Outbound Voice Rail
│   ├── voice/voiceTools.ts              # Voice Telephony Utilities
│   ├── payment/PaymentProvider.ts       # Pine Labs Plural Healthcare Payment Gateway
│   ├── logistics/LogisticsProvider.ts   # Delhivery Healthcare Express Cold-Chain Rail
│   └── providerConfig.ts                # Provider Mode Controller (Sandbox <-> Live)
├── types/                               # TypeScript Definitions
│   └── index.ts                         # Complete Data Models, Enums, & State Interfaces
├── scripts/                             # Deterministic Test Suites
│   ├── test_golden_journey.mjs          # Phase 3 E2E Test Suite (9 tests)
│   ├── test_phase4_scenarios.mjs        # Phase 4 Production Edge Cases (10 tests)
│   └── test_phase6_e2e.mjs              # Phase 6 Full Product Verification (12 tests)
├── .env.example                         # Environment Variables Template
├── package.json                         # Dependencies & Scripts
├── tsconfig.json                        # Strict TypeScript Configuration
└── README.md                            # Complete Production Documentation
```

---

## 15. Production Roadmap & Limitations

### Prototype Scope & Honesty:
- **Client-Side Persistence**: Current state persists in `localStorage` with SSR-safe synchronization. A production deployment requires a distributed PostgreSQL database (e.g., Supabase / AWS RDS) with row-level security (RLS).
- **Simulated Provider Rails**: Provider integrations have complete API contracts, payload models, and realistic sandbox behaviors. Live mode is ready for credentials, but no live financial charges or telephony calls are made during the hackathon evaluation.
- **Single Family Seed**: The application ships with the comprehensive **Rao Family** dataset. Multi-tenant family onboarding is structurally supported via `OnboardingWizard` but optimized for single-family demonstration.

### Future Roadmap:
1. **ABHA (Ayushman Bharat Health Account) Integration**: Direct integration with the ABDM health information exchange for automated prescription retrieval.
2. **Real-Time WhatsApp Coordination Bot**: Delivering pre-authorization prompt cards directly into family WhatsApp groups.
3. **Telehealth Integration**: Direct API link into Practo/Apollo 24|7 for one-click OPD slot booking.

---

## The Core Philosophy

> *"Your family's health should not depend on one person remembering everything."*

CareLoop rewires family healthcare by turning scattered WhatsApp prescriptions, frantic phone calls, and manual courier chasing into a quiet, reliable, human-authorized coordination engine.

---

**Built with pride for The Ken — Great Rewiring Case-Build Competition (Round 2)**  
*Author: CH Jaswanth Kumar*  
*Repository: [https://github.com/CH-JASWANTH-KUMAR/careloop](https://github.com/CH-JASWANTH-KUMAR/careloop)*
