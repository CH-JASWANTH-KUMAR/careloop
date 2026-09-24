"use client";

import { useMemo } from "react";
import { useCareLoop } from "@/providers/AppProvider";
import { FamilyMember, Medication, Appointment, Task } from "@/types";

export interface FamilyPulseItem {
  member: FamilyMember;
  status: "On track" | "Needs attention" | "Appointment soon" | "Care in progress" | "Active coordinator" | "Checked in";
  variant: "healthy" | "urgent" | "waiting" | "info" | "neutral";
  nextEvent: string;
  summary: string;
  isSelf: boolean;
}

export interface CareTimelineEvent {
  id: string;
  time: string;
  patientId: string;
  patientName: string;
  relationship: string;
  category: "MEDICATION" | "APPOINTMENT" | "DELIVERY" | "CHECKIN" | "TASK" | "VOICE";
  title: string;
  detail: string;
  status: "COMPLETED" | "IN_PROGRESS" | "UPCOMING";
  actionHref?: string;
  actionLabel?: string;
}

export interface ContextualShortcut {
  id: string;
  label: string;
  actionType: "REFILL_MODAL" | "LINK";
  href?: string;
  medId?: string;
  subtext?: string;
}

export interface PriorityItem {
  id: string;
  rank: number;
  title: string;
  description: string;
  patientName: string;
  patientId: string;
  category: "MEDICATION" | "APPOINTMENT" | "SYMPTOM" | "TASK" | "DELIVERY";
  actionLabel: string;
  actionType: "REFILL" | "APPOINTMENT_VIEW" | "TASK_VIEW" | "VOICE_CHECK" | "CALL_MEMBER" | "RECORDS_VIEW";
  actionHref?: string;
  secondaryActionLabel?: string;
  secondaryActionType?: "VOICE_CHECK" | "CALL_MEMBER" | "LINK";
  secondaryActionHref?: string;
  whyRecord: string;
}

export interface ExplainableRecord {
  id: string;
  sourceType: string;
  recordTitle: string;
  fact: string;
  lastVerified: string;
  patientName: string;
}

export interface CoordinatorContextType {
  activeUser: FamilyMember;
  isPrimaryCoordinator: boolean;
  isSecondaryCoordinator: boolean;
  isDependent: boolean;
  roleLabel: string;
  locationLabel: string;
  responsibilitiesText: string;
  coordinatingCount: number;
  
  // Dynamic Greetings & Briefing
  greeting: {
    salutation: string;
    headline: string;
    subtext: string;
    urgencyTone: "urgent" | "calm" | "waiting";
    attentionCount: number;
    coordinatingSummary: string;
  };

  // Structured Priorities
  priorityItems: PriorityItem[];

  // Grounded Explainability Records ("Why am I seeing this?")
  explainableRecords: ExplainableRecord[];

  // Filtered & contextual domain slices
  urgentIssues: {
    id: string;
    title: string;
    description: string;
    patientName: string;
    badgeLabel: string;
    actionLabel: string;
    actionType: "REFILL_MODAL" | "TASK_APPROVE" | "VIEW_APPOINTMENT";
    entityId: string;
  }[];

  todayCareItems: {
    id: string;
    time: string;
    title: string;
    description: string;
    patientName: string;
    status: "DUE_NOW" | "SCHEDULED" | "IN_TRANSIT" | "COMPLETED";
    actionLabel?: string;
    actionHref?: string;
    actionType?: "REFILL_MODAL" | "APPOINTMENT_MODAL" | "LINK";
    entityId?: string;
  }[];

  // Family Health Pulse
  familyPulse: FamilyPulseItem[];

  // Care Timeline
  careTimeline: CareTimelineEvent[];

  // AI Care Summary
  aiSummary: {
    text: string;
    statusBadge: string;
    hasUrgentAttention: boolean;
    lastUpdated: string;
  };

  // Contextual Action Chips
  contextualShortcuts: ContextualShortcut[];
}

export function useCoordinatorContext(): CoordinatorContextType {
  const {
    activeUser,
    members,
    family,
    medications,
    appointments,
    tasks,
  } = useCareLoop();

  return useMemo(() => {
    const isPrimary = activeUser.id === family?.primaryCoordinatorId;
    const isSecondary = activeUser.role === "MEMBER" && activeUser.id === "mem-meera";
    const isDependent = activeUser.role === "DEPENDENT";
    const coordinatingCount = members.filter((m) => m.id !== activeUser.id).length;

    // 1. Responsibilities Text
    let responsibilitiesText = "";
    if (activeUser.id === "mem-arjun") {
      responsibilitiesText = "Primary family coordinator · Managing refills, cold-chain deliveries & doctor consultation prep for Anita & Ramesh.";
    } else if (activeUser.id === "mem-meera") {
      responsibilitiesText = "Secondary coordinator & physician · Overseeing diagnostic reviews, lab panel verifications & backup approval authority.";
    } else if (activeUser.id === "mem-anita") {
      responsibilitiesText = "Focusing on daily morning Thyronorm adherence, resting BP tracking & recovery under Dr. Sumathi Reddy's care plan.";
    } else if (activeUser.id === "mem-ramesh") {
      responsibilitiesText = "Post-PTCA cardiac recovery · Following cardiac medication regimen & preparing for upcoming cardiology consultation with Dr. K.S. Rao.";
    } else {
      responsibilitiesText = `Family member (${activeUser.relationship}) · Participating in family care coordination.`;
    }

    // 2. Urgent Shortages, Escalations & Approvals
    const lowStockMeds = medications.filter((m) => m.remainingDays <= 5 && m.status === "ACTIVE");
    const escalatedTasks = tasks.filter((t) => t.status === "ESCALATED" || t.source === "VOICE_ESCALATION");
    const approvalTasks = tasks.filter(
      (t) => t.status === "WAITING_FOR_APPROVAL" || (t.status === "NEEDS_ATTENTION" && t.requiresApproval)
    );
    const inFlightTasks = tasks.filter((t) => t.status === "IN_PROGRESS" || t.status === "WAITING");

    const totalAttentionCount = lowStockMeds.length + approvalTasks.length + escalatedTasks.length;

    // 3. Dynamic Greeting & Headline
    const firstName = activeUser.name.split(" ")[0];
    let headline = "";
    let subtext = "";
    let urgencyTone: "urgent" | "calm" | "waiting" = "calm";

    if (totalAttentionCount > 0) {
      urgencyTone = "urgent";
    }

    let coordinatingSummary = "";
    if (activeUser.id === "mem-arjun") {
      coordinatingSummary = `You're coordinating care for ${coordinatingCount} family members today.`;
      if (escalatedTasks.length > 0) {
        headline = "Attention needed: Anita reported dizziness during check-in.";
        subtext = "Automated routines paused. Human check-in and doctor follow-up advised.";
      } else if (lowStockMeds.length > 0) {
        headline = "You're coordinating Mum's Thyronorm refill and Dad's upcoming cardiology visit.";
        subtext = `Mum has ${lowStockMeds[0].remainingDays} days of medication remaining. Apollo Pharmacy refill is ready for review.`;
      } else {
        headline = "The family's care plans are in good shape today.";
        subtext = "Mum's medication is replenished and Dad's consultation prep is underway.";
      }
    } else if (activeUser.id === "mem-meera") {
      coordinatingSummary = "Remote caregiving & clinical oversight active from Chennai.";
      if (lowStockMeds.length > 0) {
        headline = "Here are the family care updates waiting for your clinical review.";
        subtext = "Arjun is coordinating Mum's refill. You have backup authorization and clinical oversight rights.";
      } else {
        headline = "All family healthcare tasks are currently up to date.";
        subtext = "Diagnostic records are organized and no pending approvals require attention.";
      }
    } else if (activeUser.id === "mem-anita") {
      coordinatingSummary = "Personal health schedule and daily routine for Jubilee Hills.";
      if (lowStockMeds.some((m) => m.patientId === "mem-anita")) {
        headline = "Your morning care schedule is active. A refill is being arranged for you.";
        subtext = "Arjun and CareLoop are coordinating your Thyronorm 50mcg delivery via Apollo Pharmacy.";
      } else {
        headline = "Your medications and daily health schedule are in good shape today.";
        subtext = "You have ample medication supply and your blood pressure logs are steady.";
      }
    } else if (activeUser.id === "mem-ramesh") {
      coordinatingSummary = "Personal cardiac recovery plan for Jubilee Hills.";
      headline = "Your post-stent cardiac recovery is progressing well.";
      subtext = "You have an upcoming consultation with Dr. K.S. Rao in 5 days. Your pre-visit summary is prepared.";
    } else {
      coordinatingSummary = "Family care coordination overview.";
      headline = `Here is the current care overview for the Rao family.`;
      subtext = "CareLoop is actively monitoring medications, appointments, and care tasks.";
    }

    // 4. Grounded Priority Items
    const priorityItems: PriorityItem[] = [];
    let rankCounter = 1;

    // Case A: Acute symptom report (Highest priority)
    if (escalatedTasks.length > 0) {
      priorityItems.push({
        id: "prio-symptom",
        rank: rankCounter++,
        title: "Mum reported dizziness during wellness check",
        description: "Anita reported lightheadedness upon standing during her morning check-in. Automated refill routine paused.",
        patientName: "Anita Rao",
        patientId: "mem-anita",
        category: "SYMPTOM",
        actionLabel: "Review Symptom Dossier",
        actionType: "TASK_VIEW",
        actionHref: "/tasks",
        secondaryActionLabel: "Call Anita (+91 98490 12345)",
        secondaryActionType: "CALL_MEMBER",
        whyRecord: "Gnani.ai Speech Engine logged acute postural lightheadedness at 08:15 AM today.",
      });
    }

    // Case B: Low-stock medication
    if (lowStockMeds.length > 0) {
      const med = lowStockMeds[0];
      const patient = members.find((m) => m.id === med.patientId);
      const isMum = med.patientId === "mem-anita";
      const relationLabel = isMum ? "Mum" : patient?.name?.split(" ")[0] || "Family";

      priorityItems.push({
        id: `prio-med-${med.id}`,
        rank: rankCounter++,
        title: `${relationLabel}'s ${med.name.split(" ")[0]} supply is running low`,
        description: `${med.remainingDays} days remaining (${med.currentStockUnits} tablets). Apollo Pharmacy 60-day refill ready to authorize.`,
        patientName: patient?.name || "Anita Rao",
        patientId: med.patientId,
        category: "MEDICATION",
        actionLabel: "Refill medication",
        actionType: "REFILL",
        secondaryActionLabel: isMum ? "Call Mum" : "Check Schedule",
        secondaryActionType: "VOICE_CHECK",
        whyRecord: `${med.name} inventory currently at ${med.currentStockUnits} units (${med.remainingDays} days remaining). Below 5-day safety threshold.`,
      });
    }

    // Case C: Upcoming Cardiology appointment
    const upcomingApts = appointments.filter((a) => a.status === "UPCOMING");
    if (upcomingApts.length > 0) {
      const apt = upcomingApts[0];
      const patient = members.find((m) => m.id === apt.patientId);
      const isDad = apt.patientId === "mem-ramesh";
      const relationLabel = isDad ? "Dad" : patient?.name?.split(" ")[0] || "Family";

      priorityItems.push({
        id: `prio-apt-${apt.id}`,
        rank: rankCounter++,
        title: `${relationLabel}'s cardiology appointment is tomorrow`,
        description: `With ${apt.doctor} (${apt.speciality}) at ${apt.hospital} · ${apt.time || "10:30 AM"}. Pre-consult questions ready.`,
        patientName: patient?.name || "Ramesh Rao",
        patientId: apt.patientId,
        category: "APPOINTMENT",
        actionLabel: "View appointment",
        actionType: "APPOINTMENT_VIEW",
        actionHref: "/appointments",
        secondaryActionLabel: "Prepare Visit Packet",
        secondaryActionType: "LINK",
        secondaryActionHref: "/appointments",
        whyRecord: `Confirmed cardiology follow-up on ${apt.date} at ${apt.hospital}. Post-PTCA 6-month stent review protocol.`,
      });
    }

    // 5. Explainable Records for "Why am I seeing this?"
    const explainableRecords: ExplainableRecord[] = [
      {
        id: "exp-med-1",
        sourceType: "Pharmacy Inventory Log",
        recordTitle: "Thyronorm 50 mcg (Anita Rao)",
        fact: "Stock level: 3 tablets remaining. 7-day deficit requires replenishment before Sep 27.",
        lastVerified: "Today · 07:30 AM",
        patientName: "Anita Rao",
      },
      {
        id: "exp-apt-1",
        sourceType: "Hospital Consultation EHR",
        recordTitle: "Dr. K.S. Rao — Cardiology Follow-up",
        fact: "Scheduled for Sep 28 · 10:30 AM at Apollo Hospitals Jubilee Hills. Stent recovery evaluation.",
        lastVerified: "Yesterday · Verified by Hospital Portal",
        patientName: "Ramesh Rao",
      },
      {
        id: "exp-safety-1",
        sourceType: "Clinical Safety Guardrail",
        recordTitle: "Anti-Diagnostic Protection Protocol",
        fact: "CareLoop generates coordination recommendations from family medical records and active tasks. CareLoop never diagnoses medical conditions.",
        lastVerified: "Active Guardrail",
        patientName: "Family-wide",
      },
    ];

    // 6. Urgent Issues list (for backward-compatibility)
    const urgentIssues: CoordinatorContextType["urgentIssues"] = [];
    lowStockMeds.forEach((med) => {
      const patient = members.find((m) => m.id === med.patientId);
      const isSelf = med.patientId === activeUser.id;
      urgentIssues.push({
        id: `issue-${med.id}`,
        title: isSelf
          ? `Your ${med.name} supply is running low`
          : `${patient?.relationship || "Family"}'s ${med.name.split(" ")[0]} needs a refill`,
        description: isSelf
          ? `You have ${med.remainingDays} days of supply left (${med.currentStockUnits} tablets). Refill is prepared.`
          : `${patient?.name || "Patient"} has only ${med.remainingDays} days left. 60-day pack (₹${med.costEstimate}) ready to order.`,
        patientName: patient?.name || "Family Member",
        badgeLabel: `${med.remainingDays} days left`,
        actionLabel: isSelf ? "Check Delivery" : "Review & Refill",
        actionType: "REFILL_MODAL",
        entityId: med.id,
      });
    });

    approvalTasks.forEach((task) => {
      const patient = members.find((m) => m.id === task.familyMemberId);
      urgentIssues.push({
        id: `issue-${task.id}`,
        title: task.title,
        description: task.description,
        patientName: patient?.name || "Family Member",
        badgeLabel: "Approval needed",
        actionLabel: "Review & Sign Off",
        actionType: "TASK_APPROVE",
        entityId: task.id,
      });
    });

    // 7. Today's Care Items
    const todayCareItems: CoordinatorContextType["todayCareItems"] = [
      {
        id: "today-anita-med",
        time: "07:30 AM",
        title: "Mum's Thyronorm 50 mcg",
        description: "Empty stomach with plain water. 30 mins before morning tea.",
        patientName: "Anita Rao",
        status: "SCHEDULED",
        actionLabel: "View Meds",
        actionHref: "/medications",
        actionType: "LINK",
      },
      {
        id: "today-ramesh-med",
        time: "08:30 AM",
        title: "Dad's Glycomet-SR & Ecosprin",
        description: "Post-breakfast doses with water for post-stent cardiac protection.",
        patientName: "Ramesh Rao",
        status: "SCHEDULED",
        actionLabel: "View Schedule",
        actionHref: "/medications",
        actionType: "LINK",
      },
    ];

    if (inFlightTasks.length > 0) {
      todayCareItems.push({
        id: "today-delivery",
        time: "02:00 PM",
        title: "Apollo Pharmacy Cold-Chain Delivery",
        description: "Doorstep courier dispatch to Jubilee Hills via Delhivery (4.2°C logged).",
        patientName: "Anita Rao",
        status: "IN_TRANSIT",
        actionLabel: "Track Order",
        actionHref: "/care",
        actionType: "LINK",
      });
    }

    upcomingApts.forEach((apt) => {
      const patient = members.find((m) => m.id === apt.patientId);
      const isDad = patient?.relationship === "Father" || apt.patientId === "mem-ramesh";
      const isMum = patient?.relationship === "Mother" || apt.patientId === "mem-anita";
      const relationLabel = isDad ? "Dad" : isMum ? "Mum" : patient?.name?.split(" ")[0] || "Family";

      todayCareItems.push({
        id: `today-apt-${apt.id}`,
        time: apt.time || "10:30 AM",
        title: `${relationLabel}'s ${apt.speciality} Consultation`,
        description: `With ${apt.doctor} at ${apt.hospital}. Prep questions & records ready.`,
        patientName: patient?.name || "Family Member",
        status: "SCHEDULED",
        actionLabel: "Prepare Visit",
        actionHref: "/appointments",
        actionType: "LINK",
      });
    });

    // 8. Family Health Pulse
    const familyPulse: FamilyPulseItem[] = members.map((member) => {
      const isSelf = member.id === activeUser.id;
      const memberMeds = medications.filter((m) => m.patientId === member.id && m.status === "ACTIVE");
      const hasShortage = memberMeds.some((m) => m.remainingDays <= 5);
      const memberApt = appointments.find(
        (a) => a.patientId === member.id && a.status === "UPCOMING"
      );

      let status: FamilyPulseItem["status"] = "On track";
      let variant: FamilyPulseItem["variant"] = "healthy";
      let nextEvent = "Care routine on schedule";
      let summary = member.healthStatusSummary || "Stable";

      if (member.id === "mem-anita") {
        if (hasShortage) {
          status = "Needs attention";
          variant = "urgent";
          nextEvent = "Thyronorm refill · 3 days left";
          summary = "Thyroid therapy active; refill coordination in flight.";
        } else {
          status = "On track";
          variant = "healthy";
          nextEvent = "Thyronorm 50mcg · Morning";
          summary = "Thyroid and BP regimens stable.";
        }
      } else if (member.id === "mem-ramesh") {
        if (memberApt) {
          status = "Appointment soon";
          variant = "info";
          nextEvent = `${memberApt.doctor} (${memberApt.speciality}) · ${memberApt.date}`;
          summary = "6-month post-PTCA stent recovery progressing well.";
        } else {
          status = "On track";
          variant = "healthy";
          nextEvent = "Routine cardiac check";
          summary = "Post-stent recovery stable.";
        }
      } else if (member.id === "mem-arjun") {
        status = "Active coordinator";
        variant = "neutral";
        nextEvent = isPrimary ? "Managing Hyderabad parents" : "Family Member";
        summary = isPrimary ? "Primary coordinator · Indiranagar, Bengaluru" : "Family Member";
      } else if (member.id === "mem-meera") {
        status = "Checked in";
        variant = "healthy";
        nextEvent = "Physician oversight · Chennai";
        summary = "Secondary coordinator · Reviewed reports today";
      }

      return {
        member,
        status,
        variant,
        nextEvent,
        summary,
        isSelf,
      };
    });

    // 9. Care Timeline
    const careTimeline: CareTimelineEvent[] = [
      {
        id: "tl-1",
        time: "07:30 AM",
        patientId: "mem-anita",
        patientName: "Anita Rao",
        relationship: "Mother",
        category: "MEDICATION",
        title: "Morning Dose: Thyronorm 50 mcg",
        detail: "Taken with plain water 30 minutes before breakfast.",
        status: "COMPLETED",
        actionHref: "/medications",
        actionLabel: "View Log",
      },
      {
        id: "tl-2",
        time: "08:15 AM",
        patientId: "mem-anita",
        patientName: "Anita Rao",
        relationship: "Mother",
        category: "VOICE",
        title: "Gnani.ai Voice Medication Check-in",
        detail: "Automated wellness check verified adherence and logged 3 tabs stock remaining.",
        status: "COMPLETED",
        actionHref: "/activity",
        actionLabel: "View Audio Call",
      },
      {
        id: "tl-3",
        time: "08:45 AM",
        patientId: "mem-ramesh",
        patientName: "Ramesh Rao",
        relationship: "Father",
        category: "MEDICATION",
        title: "Post-Breakfast Regimen: Glycomet-SR 500mg",
        detail: "Taken after meals. Blood sugar monitoring on schedule.",
        status: "COMPLETED",
        actionHref: "/medications",
        actionLabel: "View Log",
      },
      {
        id: "tl-4",
        time: "11:00 AM",
        patientId: "mem-anita",
        patientName: "Anita Rao",
        relationship: "Mother",
        category: "DELIVERY",
        title: "Apollo Pharmacy Cold-Chain Packaging",
        detail: "Thyronorm 50 mcg (60-tab bottle) packaged with temperature monitor (4.2°C).",
        status: "COMPLETED",
        actionHref: "/care",
        actionLabel: "Track Order",
      },
      {
        id: "tl-5",
        time: "02:00 PM",
        patientId: "mem-anita",
        patientName: "Anita Rao",
        relationship: "Mother",
        category: "DELIVERY",
        title: "Delhivery Courier Out for Delivery",
        detail: "Courier Suresh K. assigned for doorstep delivery in Jubilee Hills.",
        status: "IN_PROGRESS",
        actionHref: "/care",
        actionLabel: "Track Delhivery",
      },
      {
        id: "tl-6",
        time: "04:30 PM",
        patientId: "mem-ramesh",
        patientName: "Ramesh Rao",
        relationship: "Father",
        category: "APPOINTMENT",
        title: "Cardiology Consultation Pre-Visit Dossier",
        detail: "CareLoop assembled latest stent discharge summary and resting BP trend for Dr. K.S. Rao.",
        status: "UPCOMING",
        actionHref: "/appointments",
        actionLabel: "Open Packet",
      },
    ];

    // 10. AI Care Summary derived dynamically from actual state
    const primaryCoord = members.find((m) => m.id === family?.primaryCoordinatorId);
    const coordName = primaryCoord?.name?.split(" ")[0] || "Arjun";
    const isCoordAvailable = family?.isCoordinatorAvailable ?? true;
    const coordAvailabilityNote = isCoordAvailable
      ? `${coordName} is currently available if you need help.`
      : `${coordName} is currently away; Meera is your backup coordinator.`;

    const anitaThyronorm = medications.find((m) => m.id === "med-thyronorm");
    const thyronormDays = anitaThyronorm ? anitaThyronorm.remainingDays : 63;
    const anitaNextAppt = appointments.find((a) => a.patientId === "mem-anita" && a.status === "UPCOMING");
    const rameshNextAppt = appointments.find((a) => a.patientId === "mem-ramesh" && a.status === "UPCOMING");

    let aiSummaryText = "";
    if (activeUser.id === "mem-anita") {
      if (escalatedTasks.length > 0) {
        aiSummaryText =
          `Anita, automated routines are paused while ${coordName} reviews your reported dizziness. Please rest and stay seated while family coordination is in progress.`;
      } else if (thyronormDays <= 5) {
        aiSummaryText =
          `Good morning, Anita. Your morning routine is on track. Your Thyronorm supply has ${thyronormDays} days remaining, and a refill request is active with Apollo Pharmacy Jubilee Hills. Your next appointment with ${anitaNextAppt ? `${anitaNextAppt.doctor} is on ${anitaNextAppt.date}` : "Dr. Sumathi Reddy is on October 7"}. ${coordAvailabilityNote}`;
      } else {
        aiSummaryText =
          `Good morning, Anita. Your morning routine is on track. Your Thyronorm supply is sufficient for the next ${thyronormDays} days, your blood-pressure logs are stable, and your next appointment with ${anitaNextAppt ? `${anitaNextAppt.doctor} is on ${anitaNextAppt.date}` : "Dr. Sumathi Reddy is on October 7"}. ${coordAvailabilityNote}`;
      }
    } else if (activeUser.id === "mem-ramesh") {
      if (escalatedTasks.length > 0) {
        aiSummaryText =
          `Ramesh, your cardiac logs are steady, but Anita reported dizziness today. Automated workflows are paused for family evaluation. ${coordName} is coordinating.`;
      } else {
        aiSummaryText =
          `Good morning, Ramesh. Your post-PTCA cardiac recovery regimen is on schedule. Glycomet and Ecosprin logs are stable, and your next appointment with ${rameshNextAppt ? `${rameshNextAppt.doctor} is on ${rameshNextAppt.date}` : "Dr. K.S. Rao is on October 12"}. ${coordAvailabilityNote}`;
      }
    } else if (activeUser.id === "mem-meera") {
      if (escalatedTasks.length > 0) {
        aiSummaryText =
          `Dr. Meera, clinical attention is flagged: Mum reported dizziness during morning check-in. Automated workflows are held pending human assessment. ${coordName} is on standby.`;
      } else {
        aiSummaryText =
          `${coordName} is managing primary coordination from Bengaluru. Mum's Thyronorm has ${thyronormDays} days of supply tracked, and Dad's ${rameshNextAppt ? rameshNextAppt.speciality.toLowerCase() : "cardiology"} dossier is prepared for Dr. K.S. Rao review. ${coordAvailabilityNote}`;
      }
    } else {
      // Arjun (Primary Coordinator)
      if (escalatedTasks.length > 0) {
        aiSummaryText =
          "Attention needed: Anita reported dizziness during her morning check-in. Automated workflows have been paused. Please call Mum and arrange a medical follow-up.";
      } else if (lowStockMeds.length > 0) {
        aiSummaryText =
          `Your family is mostly on track today. Mum's Thyronorm refill is ready for sign-off (${thyronormDays} days remaining), and Dad's post-stent cardiology review is coming up with pre-visit vitals collated. Nothing else urgent is pending.`;
      } else {
        aiSummaryText =
          `All family healthcare workflows are in good order. Both parents have sufficient medication supply (${thyronormDays} days of Thyronorm for Mum), and doctor consultation dossiers are organized.`;
      }
    }

    const aiSummary = {
      text: aiSummaryText,
      statusBadge: totalAttentionCount > 0 ? "Active Coordination Needed" : "Family Care Stable",
      hasUrgentAttention: totalAttentionCount > 0,
      lastUpdated: "Just now · Automated Health Check",
    };

    // 11. Contextual Shortcuts per persona
    let contextualShortcuts: ContextualShortcut[] = [];
    if (activeUser.id === "mem-arjun") {
      contextualShortcuts = [
        {
          id: "cs-1",
          label: thyronormDays <= 5 ? `Refill Mum's Thyronorm (${thyronormDays} days left) →` : `Check Mum's Thyronorm stock (${thyronormDays} days) →`,
          actionType: "REFILL_MODAL",
          medId: "med-thyronorm",
        },
        {
          id: "cs-2",
          label: "Prepare Dad's cardiology notes →",
          actionType: "LINK",
          href: "/appointments",
        },
        {
          id: "cs-3",
          label: "Find Mum's latest thyroid report →",
          actionType: "LINK",
          href: "/records",
        },
        {
          id: "cs-4",
          label: "Check care continuity coverage →",
          actionType: "LINK",
          href: "/continuity",
        },
      ];
    } else if (activeUser.id === "mem-meera") {
      contextualShortcuts = [
        {
          id: "cs-m1",
          label: "Review Dad's post-stent cardiac panel →",
          actionType: "LINK",
          href: "/records",
        },
        {
          id: "cs-m2",
          label: "Check Mum's Thyronorm refill progress →",
          actionType: "REFILL_MODAL",
          medId: "med-thyronorm",
        },
        {
          id: "cs-m3",
          label: "Take over active coordination from Arjun →",
          actionType: "LINK",
          href: "/continuity",
        },
        {
          id: "cs-m4",
          label: "Ask CareLoop Agent for clinical summary →",
          actionType: "LINK",
          href: "/agent",
        },
      ];
    } else if (activeUser.id === "mem-anita") {
      contextualShortcuts = [
        {
          id: "cs-a1",
          label: "Check my medicine delivery status →",
          actionType: "REFILL_MODAL",
          medId: "med-thyronorm",
        },
        {
          id: "cs-a2",
          label: "View Dr. Sumathi Reddy's instructions →",
          actionType: "LINK",
          href: "/records",
        },
        {
          id: "cs-a3",
          label: "Call Arjun in Bengaluru (+91 93811 88069) →",
          actionType: "LINK",
          href: "/family",
        },
        {
          id: "cs-a4",
          label: "Start Voice Check-in (Telugu) →",
          actionType: "LINK",
          href: "#voice-check",
        },
      ];
    } else {
      // Ramesh
      contextualShortcuts = [
        {
          id: "cs-r1",
          label: "View Dr. K.S. Rao appointment packet →",
          actionType: "LINK",
          href: "/appointments",
        },
        {
          id: "cs-r2",
          label: "Check Glycomet & Atorvastatin stock →",
          actionType: "LINK",
          href: "/medications",
        },
        {
          id: "cs-r3",
          label: "Review post-stent discharge summary →",
          actionType: "LINK",
          href: "/records",
        },
        {
          id: "cs-r4",
          label: "Call Apollo Jubilee Hills →",
          actionType: "LINK",
          href: "/family",
        },
      ];
    }

    return {
      activeUser,
      isPrimaryCoordinator: isPrimary,
      isSecondaryCoordinator: isSecondary,
      isDependent,
      roleLabel: activeUser.role.replace(/_/g, " "),
      locationLabel: activeUser.location,
      responsibilitiesText,
      coordinatingCount,
      greeting: {
        salutation: `Good morning, ${firstName}.`,
        headline,
        subtext,
        urgencyTone,
        attentionCount: totalAttentionCount,
        coordinatingSummary,
      },
      priorityItems,
      explainableRecords,
      urgentIssues,
      todayCareItems,
      familyPulse,
      careTimeline,
      aiSummary,
      contextualShortcuts,
    };
  }, [
    activeUser,
    members,
    family,
    medications,
    appointments,
    tasks,
  ]);
}

// Standalone Helper functions matching prompt requirements
export function getCoordinatorGreeting(activeUser: FamilyMember, attentionCount: number) {
  const firstName = activeUser.name.split(" ")[0];
  return {
    salutation: `Good morning, ${firstName}.`,
    attentionText:
      attentionCount > 0
        ? `You have ${attentionCount} ${attentionCount === 1 ? "thing that needs" : "things that need"} your attention today.`
        : "You're all caught up. The family is in good shape today.",
  };
}

export function getRelevantTasks(tasks: Task[], activeUser: FamilyMember) {
  if (activeUser.id === "mem-arjun") {
    return tasks;
  }
  return tasks.filter(
    (t) => t.familyMemberId === activeUser.id || t.ownerId === activeUser.id
  );
}

export function getUpcomingEvents(appointments: Appointment[], medications: Medication[]) {
  const upcomingApts = appointments.filter((a) => a.status === "UPCOMING");
  const lowStock = medications.filter((m) => m.remainingDays <= 5 && m.status === "ACTIVE");
  return {
    appointments: upcomingApts,
    lowStockMeds: lowStock,
    totalCount: upcomingApts.length + lowStock.length,
  };
}
