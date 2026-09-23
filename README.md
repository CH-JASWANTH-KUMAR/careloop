# CareLoop — AI-Powered Family Health Coordination

> **Submission for The Ken — Great Rewiring Case-Build Competition, Round 2**  
> Built by **CH Jaswanth Kumar**

---

## The Problem We're Solving

Healthcare information in India is increasingly digital. But **the responsibility for making healthcare actually happen** still falls on one or two family members — usually someone managing elderly parents from another city.

Every day, families deal with:

- A mother in Hyderabad running out of thyroid medication while her son is in Bengaluru
- A father's post-cardiac surgery follow-up slipping through the cracks because no one remembered to prepare the appointment packet
- Prescription refills that require calling the pharmacy, arranging payment, and coordinating courier delivery — all manually
- No single place where the full family picture of health can be seen and acted upon

**CareLoop is the coordination layer that sits between scattered family health needs and the actions required to address them.**

---

## What CareLoop Does

CareLoop is a **production-oriented AI-powered family health coordination platform** that:

1. **Monitors** medication stock, upcoming appointments, pending reports, and care task status across all family members
2. **Plans** automated care actions — refill orders, appointment preparation packets, voice wellness checks — with full explainability
3. **Routes consequential actions through human authorization gates** before any payment, logistics dispatch, or sensitive operation executes
4. **Executes** through real provider rails (Pine Labs payments, Delhivery cold-chain logistics, Gnani.ai voice) with sandbox simulation for competition demonstration
5. **Closes the loop** — auto-updates medication inventory post-delivery, creates post-visit follow-up tasks, and logs a complete provenance trail
6. **Handles failures gracefully** — payment failures, delivery exceptions, prescription gaps, and clinical safety escalations all have defined recovery paths

> CareLoop does **not** diagnose. It does **not** prescribe. Any symptom reported by a family member immediately halts automation and escalates to a human caregiver.

---

## The Golden Scenario (Live Demo Journey)

**Priya, a daughter in Bengaluru, opens CareLoop and sees:**
> *"Mum's thyroid medicine has 3 tablets left — 3 days of supply."*

**What happens next:**

```
1. CareLoop identifies the shortage
   └─ Anita Rao (Mother, Jubilee Hills) · Thyronorm 50mcg · 3 tablets left

2. Context Lookup
   └─ Verified prescription on file (Dr. Sumathi Reddy)
   └─ Apollo Pharmacy Jubilee Hills · Cold-chain eligible
   └─ Estimated cost: ₹485

3. Action Plan (Explainability-First)
   └─ WHAT: Order 60-tablet refill via Apollo Pharmacy
   └─ WHY: Stock below 5-day family safety threshold
   └─ WHO: Anita Rao (patient) · Arjun Rao (coordinator, approver)
   └─ COST: ₹485 INR · Protected via Pine Labs 2FA consent
   └─ DATA SHARED: Prescription + delivery address (Jubilee Hills)
   └─ WHAT HAPPENS NEXT: Delhivery cold-chain dispatch, 4-hour delivery SLA

4. ▶ Human Authorization Gate — Arjun reviews and signs off

5. Pine Labs Payment Rail
   └─ Pre-authorized payment captured
   └─ Receipt: SANDBOX-REC-PL-4821

6. Delhivery Healthcare Express Logistics
   └─ ORDER_CREATED → PICKUP_SCHEDULED → IN_TRANSIT (4.2°C cold chain)
   └─ OUT_FOR_DELIVERY → DELIVERED to Anita Rao at Jubilee Hills
   └─ AWB: SANDBOX-AWB-DL-882190

7. Closed-Loop Inventory Update
   └─ Stock: 3 tabs → 63 tabs · Next refill: 63 days

8. Next Action Scheduled
   └─ Gnani voice wellness check queued for tomorrow 9AM in Telugu
```

**All of this is logged with a 7-tuple provenance trail: WHO · WHAT · WHEN · WHY · SOURCE · AUTHORIZATION · RESULT**

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         CareLoop Application                            │
│                                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌────────────┐  │
│  │     HOME     │  │    FAMILY    │  │     CARE     │  │  ACTIVITY  │  │
│  │ What needs   │  │ Who I'm      │  │ Active care  │  │ What has   │  │
│  │ attention    │  │ responsible  │  │ workflows    │  │ happened   │  │
│  │ right now    │  │ for          │  │ & approvals  │  │            │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  └────────────┘  │
│                                                                         │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                    State Layer (Zustand-pattern)                 │   │
│  │  useCareLoopStore · localStorage persistence · seed hydration   │   │
│  │  Task State Machine: DETECTED → PREPARED → AWAITING_AUTH →      │   │
│  │  AUTHORIZED → IN_PROGRESS → WAITING → COMPLETED                 │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                     Provider Rail Adapters                       │   │
│  │                                                                  │   │
│  │  ┌──────────────────┐  ┌─────────────────┐  ┌────────────────┐  │   │
│  │  │   Gnani.ai       │  │  Pine Labs      │  │  Delhivery     │  │   │
│  │  │  Voice Rail      │  │  Plural Pay     │  │  Healthcare    │  │   │
│  │  │  Telugu/English  │  │  2FA Consent    │  │  Express       │  │   │
│  │  │  Outbound Calls  │  │  Gateway        │  │  Cold-Chain    │  │   │
│  │  └──────────────────┘  └─────────────────┘  └────────────────┘  │   │
│  │           [SANDBOX / SIMULATED — live keys hot-swappable]        │   │
│  └──────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
```

### Key Architectural Decisions

| Decision | Rationale |
|---|---|
| **Task State Machine** | Every care action has a canonical lifecycle. Nothing skips states. Every transition is logged. |
| **Human-in-the-Loop Authorization** | No payment, delivery, or consequential action executes without explicit family member sign-off. |
| **Provider Adapter Pattern** | Gnani, Pine Labs, and Delhivery are fully abstracted. Swap `CARELOOP_PROVIDER_MODE=live` + real API keys to go live. |
| **SSR-safe localStorage persistence** | `useSyncExternalStore` with seed snapshot ensures zero hydration mismatches across all consumers. |
| **Clinical Safety Boundary** | Voice check symptom detection halts all automation and dispatches an urgent escalation task. CareLoop never diagnoses. |
| **7-Tuple Provenance** | Every activity event records WHO, WHAT, WHEN, WHY, SOURCE, AUTHORIZATION, RESULT — full audit trail. |
| **Care Continuity Protocol** | If the primary coordinator is unavailable, a handover protocol activates and another family member can take over. |

---

## Features

### 🏠 Home — Attention-First Dashboard
- Dynamic "Needs Your Attention" section (low-stock medications, pending approvals)
- "CareLoop Is Handling" section showing active workflows
- Upcoming care events timeline
- Recently completed actions with provenance

### 👨‍👩‍👧 Family — Health Dossier per Member
- Full health dossier with 6 tabs: Overview, Medications, Appointments, Records, Activity, Permissions
- Emergency contact info, blood group, allergies, insurance IDs
- Per-member care coordinator and permission model
- One-click refill trigger from within the dossier

### 🩺 Care — Live Workflow Board
- 4-column kanban: Needs Approval · In Progress · Waiting · Completed
- Refill Workflow Modal: full end-to-end journey from prescription lookup → payment → logistics tracking → inventory update
- Care Continuity toggle (coordinator available/unavailable)
- Reassurance card confirming nothing is waiting silently

### 📋 Activity — Provenance Audit Trail
- Complete chronological event log with actor attribution
- Filter by Refill, Authorization, or Provider events
- Color-coded actor badges: CareLoop AI · Pine Labs [SANDBOX] · Delhivery [SANDBOX] · Gnani Voice [SANDBOX]
- 7-tuple explainability fields on every event

### ⚙️ Settings
- Provider connection status with `[SANDBOX / SIMULATED]` labels
- Monthly coordination spending limit configuration
- Voice language preference (Telugu, Hindi, English)
- Export full audit trail as JSON
- Demo seed state reset

### 🔐 Authorization Modal
- 5-field explainability before any action: What · Why · Who · Cost · Data Shared · What Happens Next
- Reject / Ask Later / Edit / Approve flow

### 📞 Gnani Voice Check (Header)
- Simulates outbound Telugu voice call to Anita Rao
- Normal path: confirms medication stock
- Symptom path: detects dizziness/concern → halts automation → creates ESCALATED task → logs VOICE_ESCALATION_TRIGGERED

### 🚨 Emergency Access (Header)
- One-tap access to emergency dossier for all dependents
- Blood group, preferred hospital, allergies, emergency contacts, insurance IDs

### 🔄 Care Continuity & Coordinator Handover
- Bidirectional handover: Arjun → Meera → Arjun
- Full activity provenance trail for handover events
- Banner activates across all pages when coordinator unavailable

---

## Provider Rails

All three provider integrations are built with clean abstractions. Drop in real API credentials to activate live mode.

### 1. Gnani.ai — Conversational Voice Rail
- **Purpose:** Outbound wellness check calls to elderly dependents in their native language
- **Languages:** Telugu (`te-IN`), Indian English (`en-IN`), Hindi (`hi-IN`)
- **Clinical Safety:** Any reported symptom triggers immediate escalation. No medical interpretation.
- **Sandbox:** Realistic transcript simulation with configurable outcomes (stock confirmed / symptom detected)

```env
GNANI_API_KEY=your_key
GNANI_ACCESS_TOKEN=your_token
GNANI_OUTBOUND_ENDPOINT=https://api.gnani.ai/v1/voice/outbound
GNANI_CALLER_ID=+918047190000
```

### 2. Pine Labs Plural — Healthcare Payment Gateway
- **Purpose:** Pre-authorized 2FA consent-backed payment capture for pharmacy orders
- **Guardrails:** Monthly spending limit enforced. Any charge exceeding threshold requires coordinator override.
- **Sandbox:** Generates realistic receipt IDs (`SANDBOX-REC-PL-4821`) with full payment lifecycle

```env
PINELABS_MERCHANT_ID=your_merchant_id
PINELABS_MERCHANT_KEY=your_merchant_key
PINELABS_API_ENDPOINT=https://api.pluralonline.com/api/v1
PINELABS_WEBHOOK_SECRET=your_webhook_secret
```

### 3. Delhivery Healthcare Express — Cold-Chain Logistics
- **Purpose:** Prescription-linked cold-chain pharmaceutical courier with live AWB tracking
- **Integration:** Auto-inventory sync triggers when delivery status reaches `DELIVERED`
- **Sandbox:** Full 5-checkpoint lifecycle simulation with realistic AWB numbers and cold-chain telemetry

```env
DELHIVERY_API_TOKEN=your_token
DELHIVERY_CLIENT_ID=CARELOOP_HYD_CLIENT
DELHIVERY_PICKUP_HUB=Apollo_Begumpet_ColdChain_01
DELHIVERY_TRACKING_ENDPOINT=https://track.delhivery.com/api/v1/packages/json/
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) · TypeScript |
| Styling | Tailwind CSS · Geist Font |
| State | Custom hook store (`useCareLoopStore`) · `useSyncExternalStore` for hydration safety |
| Data Fetching | TanStack React Query |
| Validation | Zod |
| Icons | Lucide React |
| Animation | Framer Motion |
| Persistence | `localStorage` with SSR-safe seed snapshot pattern |

---

## Task State Machine

Every care coordination action moves through a canonical state machine:

```
DETECTED → PREPARED → AWAITING_AUTHORIZATION → AUTHORIZED → IN_PROGRESS
                                                                    │
                                    ┌───────────────────────────────┘
                                    ▼
                               WAITING (external: payment / delivery)
                                    │
                               COMPLETED
                                    
Failure branches:
AWAITING_AUTHORIZATION → REJECTED (human declined)
AWAITING_AUTHORIZATION → DEFERRED (ask me later)
IN_PROGRESS → FAILED (payment / delivery / prescription failure)
Any state → ESCALATED (clinical safety boundary triggered)
```

Every state transition is logged with timestamp, actor, and reason. No silent failures.

---

## Safety Boundaries

CareLoop enforces hard safety rules that cannot be overridden by any automation:

| Rule | Behaviour |
|---|---|
| **Anti-Diagnostic Boundary** | If Gnani voice call or Care Agent detects any symptom, automation halts immediately. An `ESCALATED` task is dispatched to the family coordinator. |
| **Human Authorization Gate** | Zero financial transactions or logistics dispatches execute without explicit family sign-off. |
| **Spending Limit Guardrail** | Coordinator-configured monthly cap. Any charge above triggers `EXCEEDED_LIMIT` rejection. |
| **Prescription Verification** | Pharmacy orders refused if prescription status is not `VERIFIED`. |
| **Missing Address Protection** | Logistics dispatch rejected if no verified delivery address exists. |

---

## Local Setup

```bash
# 1. Clone the repository
git clone https://github.com/CH-JASWANTH-KUMAR/careloop.git
cd careloop

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env
# Edit .env — default CARELOOP_PROVIDER_MODE=sandbox works out of the box

# 4. Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

The application starts with the **Rao Family seed data** — a fully realistic fictional family scenario including medications, appointments, health records, and pending tasks ready for demonstration.

> **To reset the demo state at any time:** Settings → Reset Demo Seed State

---

## Running Tests

```bash
# End-to-end Golden Journey (Thyronorm refill lifecycle)
node scripts/test_golden_journey.mjs

# Production Hardening Scenarios (10 failure + edge case scenarios)
node scripts/test_phase4_scenarios.mjs

# Full Product E2E (state machine, provenance, handover, clinical safety)
node scripts/test_phase6_e2e.mjs
```

**Current test status: 31/31 passing (100%)**

| Suite | Tests | Status |
|---|---|---|
| Golden Journey (Phase 3) | 9/9 | ✅ |
| Production Scenarios (Phase 4) | 10/10 | ✅ |
| End-to-End Product (Phase 6) | 12/12 | ✅ |

---

## Build Validation

```bash
npx tsc --noEmit    # 0 type errors
npm run lint        # 0 lint errors
npm run build       # 15/15 static routes compiled
```

---

## What Makes This Different from a Dashboard Demo

Most competition submissions are dashboards with cards, charts, and buttons that do nothing. CareLoop is built differently:

| Typical Demo | CareLoop |
|---|---|
| Hardcoded data displayed on cards | Live Zustand state with localStorage persistence and seed hydration |
| Buttons that show toasts | Every button transitions real task state through a canonical state machine |
| "Integrated" means a logo shown | Provider adapters with full API contracts, sandbox simulation, and live hot-swap capability |
| No failure handling | 6 distinct failure modes with 4-part explainability cards and defined recovery flows |
| No audit trail | 7-tuple provenance on every action, exportable as JSON |
| SSR hydration errors everywhere | `useSyncExternalStore` pattern ensures zero hydration mismatches |
| One happy path | Clinical safety escalation, coordinator handover, payment rejection, delivery failure — all tested |

---

## Limitations & Honest Scope

This is a competition prototype. The following are explicitly **not** production-ready:

- **No backend / database** — all state is client-side localStorage. A production system would require a server-side database, authentication, and a real webhook handler for provider callbacks.
- **No real API calls** — provider rails are sandbox-simulated. Live credentials hot-swap the behaviour but no real calls are made in this demo.
- **Single family** — the Rao Family is the only seed dataset. Multi-family onboarding is stubbed via the `OnboardingWizard` but not deeply wired.
- **No SMS / push notifications** — CareLoop queues voice reminders but doesn't dial real phones.

---

## Repository Structure

```
careloop/
├── app/                    # Next.js App Router pages
├── components/
│   ├── layout/             # Sidebar, Header, MobileNav
│   ├── shared/             # AuthorizationModal, FailureStateCard, CareContinuityBanner
│   ├── ui/                 # Button, Badge, Input, Modal primitives
│   └── workflow/           # RefillWorkflowModal (end-to-end journey)
├── db/
│   └── seedData.ts         # Rao Family initial state
├── features/
│   ├── overview/           # Home dashboard
│   ├── family/             # Family screen + health dossier modal
│   ├── care/               # Care coordination board
│   ├── activity/           # Provenance audit trail
│   ├── agent/              # Care Agent chat interface
│   ├── continuity/         # Coordinator handover protocol
│   └── settings/           # Configuration screen
├── hooks/
│   ├── useCareLoopStore.ts # Central state store (all business logic)
│   ├── useCareAgent.ts     # AI agent state machine + planning
│   └── useCareContinuity.ts
├── services/
│   ├── voice/              # Gnani.ai voice provider adapter
│   ├── payment/            # Pine Labs payment provider adapter
│   ├── logistics/          # Delhivery logistics provider adapter
│   └── providerConfig.ts   # Provider mode controller (sandbox ↔ live)
├── types/                  # Full TypeScript type definitions
├── scripts/                # E2E test suites (Node.js, no test framework needed)
└── PHASE_[2-6]_IMPLEMENTATION.md  # Implementation documentation per phase
```

---

## The Core Insight

> **Healthcare coordination is an information and execution problem, not a medical one.**

The gap between "knowing that Mum needs her medicine" and "Mum has her medicine" is filled with manual steps, phone calls, payment friction, and logistics coordination. CareLoop automates that gap — with human oversight for every consequential decision, complete explainability at every step, and strict clinical safety boundaries that keep AI where it belongs: in coordination, not in diagnosis.

---

*Built for The Ken Great Rewiring Case-Build Competition — September 2026*  
*CH Jaswanth Kumar · [GitHub](https://github.com/CH-JASWANTH-KUMAR/careloop)*
