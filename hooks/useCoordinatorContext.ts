"use client";

import { useMemo } from "react";
import { useCareLoop } from "@/providers/AppProvider";
import { FamilyMember } from "@/types";

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
  category: "MEDICATION" | "APPOINTMENT" | "DELIVERY" | "CHECKIN" | "TASK";
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

export interface CoordinatorContextType {
  activeUser: FamilyMember;
  isPrimaryCoordinator: boolean;
  isSecondaryCoordinator: boolean;
  isDependent: boolean;
  roleLabel: string;
  locationLabel: string;
  responsibilitiesText: string;
  
  // Dynamic Greetings
  greeting: {
    salutation: string;
    headline: string;
    subtext: string;
    urgencyTone: "urgent" | "calm" | "waiting";
    attentionCount: number;
  };

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

    // 2. Urgent Shortages & Approvals
    const lowStockMeds = medications.filter((m) => m.remainingDays <= 5 && m.status === "ACTIVE");
    const approvalTasks = tasks.filter(
      (t) => t.status === "WAITING_FOR_APPROVAL" || (t.status === "NEEDS_ATTENTION" && t.requiresApproval)
    );
    const inFlightTasks = tasks.filter((t) => t.status === "IN_PROGRESS" || t.status === "WAITING");

    const totalAttentionCount = lowStockMeds.length + approvalTasks.length;

    // 3. Dynamic Greeting & Headline
    const firstName = activeUser.name.split(" ")[0];
    let headline = "";
    let subtext = "";
    let urgencyTone: "urgent" | "calm" | "waiting" = "calm";

    if (totalAttentionCount > 0) {
      urgencyTone = "urgent";
    }

    if (activeUser.id === "mem-arjun") {
      if (lowStockMeds.length > 0) {
        headline = "You're currently coordinating Mum's Thyronorm refill and Dad's upcoming cardiology visit.";
        subtext = `Mum has ${lowStockMeds[0].remainingDays} days of medication remaining. Apollo Pharmacy refill is ready for review.`;
      } else {
        headline = "The family's care plans are on track today.";
        subtext = "Mum's medication is replenished and Dad's consultation prep is underway.";
      }
    } else if (activeUser.id === "mem-meera") {
      if (lowStockMeds.length > 0) {
        headline = "Here are the family care updates waiting for your review.";
        subtext = "Arjun is coordinating Mum's refill. You have backup authorization and clinical oversight rights.";
      } else {
        headline = "All family healthcare tasks are currently up to date.";
        subtext = "Diagnostic records are organized and no pending approvals require attention.";
      }
    } else if (activeUser.id === "mem-anita") {
      if (lowStockMeds.some((m) => m.patientId === "mem-anita")) {
        headline = "Your morning care schedule is active. A refill is being arranged for you.";
        subtext = "Arjun and CareLoop are coordinating your Thyronorm 50mcg delivery via Apollo Pharmacy.";
      } else {
        headline = "Your medications and daily health schedule are in good shape today.";
        subtext = "You have ample medication supply and your blood pressure logs are steady.";
      }
    } else if (activeUser.id === "mem-ramesh") {
      headline = "Your post-stent cardiac recovery is progressing well.";
      subtext = "You have an upcoming consultation with Dr. K.S. Rao in 5 days. Your pre-visit summary is prepared.";
    } else {
      headline = `Here is the current care overview for the Rao family.`;
      subtext = "CareLoop is actively monitoring medications, appointments, and care tasks.";
    }

    // 4. Urgent Issues list
    const urgentIssues: CoordinatorContextType["urgentIssues"] = [];
    
    // Add low-stock medication issues
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

    // Add approval tasks
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

    // 5. Today's Care Items
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

    // Add upcoming appointments dynamically to todayCareItems
    const upcomingApts = appointments.filter((a) => a.status === "UPCOMING");
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

    // 6. Family Health Pulse
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

    // 7. Care Timeline
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
        id: "tl-3",
        time: "11:00 AM",
        patientId: "mem-anita",
        patientName: "Anita Rao",
        relationship: "Mother",
        category: "DELIVERY",
        title: "Pharmacy Refill Order · Apollo Jubilee Hills",
        detail: "60-tablet pack packaged with cold-chain insulation.",
        status: inFlightTasks.length > 0 ? "IN_PROGRESS" : "UPCOMING",
        actionHref: "/care",
        actionLabel: "View Delivery",
      },
      {
        id: "tl-4",
        time: "03:30 PM",
        patientId: "mem-anita",
        patientName: "Anita Rao",
        relationship: "Mother",
        category: "CHECKIN",
        title: "Gnani Native Voice Check-in (Telugu)",
        detail: "Automated wellness check for medication confirmation.",
        status: "UPCOMING",
      },
      {
        id: "tl-5",
        time: "Tomorrow",
        patientId: "mem-ramesh",
        patientName: "Ramesh Rao",
        relationship: "Father",
        category: "APPOINTMENT",
        title: "Cardiology Review: Dr. K.S. Rao",
        detail: "Apollo Jubilee Hills · 10:30 AM · Pre-visit packet ready.",
        status: "UPCOMING",
        actionHref: "/appointments",
        actionLabel: "Open Packet",
      },
    ];

    // 8. AI Care Summary
    let aiSummaryText = "";
    if (activeUser.id === "mem-arjun") {
      if (lowStockMeds.length > 0) {
        aiSummaryText =
          "Your family is mostly on track today. Mum's Thyronorm refill is ready for sign-off (3 days remaining), and Dad's post-stent cardiology review is coming up in 5 days with pre-visit vitals collated.";
      } else {
        aiSummaryText =
          "All family healthcare workflows are in good order. Both parents have sufficient medication supply, and doctor consultation dossiers are organized.";
      }
    } else if (activeUser.id === "mem-meera") {
      aiSummaryText =
        "Arjun is handling active coordination from Bengaluru. Mum's thyroid medication refill is being processed with Apollo Pharmacy, and Dad's cardiology history is ready for your clinical review.";
    } else if (activeUser.id === "mem-anita") {
      aiSummaryText =
        "Your morning routine is going well. Arjun and CareLoop have arranged your Thyronorm 50mcg refill with Apollo Pharmacy, and Delhivery cold-chain express will deliver to Jubilee Hills.";
    } else {
      aiSummaryText =
        "Your cardiac recovery regimen is stable. Glycomet and Ecosprin are on track, and your appointment packet for Dr. K.S. Rao has been prepared by Arjun.";
    }

    const aiSummary = {
      text: aiSummaryText,
      statusBadge: totalAttentionCount > 0 ? "Active Coordination Needed" : "Family Care Stable",
      hasUrgentAttention: totalAttentionCount > 0,
      lastUpdated: "Just now · Automated Health Check",
    };

    // 9. Contextual Shortcuts per persona
    let contextualShortcuts: ContextualShortcut[] = [];

    if (activeUser.id === "mem-arjun") {
      contextualShortcuts = [
        {
          id: "cs-1",
          label: "Refill Mum's Thyronorm (3 days left) →",
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
          label: "Who is handling care while I travel? →",
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
          label: "Contact Arjun in Bengaluru (+91 93811 88069) →",
          actionType: "LINK",
          href: "/family",
        },
        {
          id: "cs-a4",
          label: "Voice check-in (Telugu) →",
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
      greeting: {
        salutation: `Good morning, ${firstName}.`,
        headline,
        subtext,
        urgencyTone,
        attentionCount: totalAttentionCount,
      },
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
