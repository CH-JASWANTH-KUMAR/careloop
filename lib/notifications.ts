import {
  Medication,
  Task,
  Appointment,
  ActivityEvent,
  CareNotification,
} from "@/types";

/**
 * Deterministically derives the active care notifications from the store slices.
 * Notice: All timestamps use deterministic string representations to ensure
 * zero hydration divergence between server render and client initial paint.
 */
export function deriveCareNotifications(
  medications: Medication[],
  tasks: Task[],
  appointments: Appointment[],
  activity: ActivityEvent[]
): CareNotification[] {
  const list: CareNotification[] = [];

  // 1. Safety Alerts & Acute Escalations
  const escalatedTasks = tasks.filter(
    (t) => t.status === "ESCALATED" || t.source === "VOICE_ESCALATION"
  );
  if (escalatedTasks.length > 0) {
    escalatedTasks.forEach((t) => {
      list.push({
        id: `notif-safety-${t.id}`,
        category: "SAFETY",
        title: "Wellness check requires attention",
        description:
          t.title ||
          "Anita reported dizziness during morning check-in. Automated workflows paused.",
        timestamp: "Today",
        href: "/tasks",
        isUrgent: true,
      });
    });
  }

  // 2. Medication Notifications
  const thyronormMed = medications.find((m) => m.id === "med-thyronorm");
  const hasActiveDelivery = tasks.some(
    (t) =>
      (t.status === "IN_PROGRESS" || t.status === "WAITING") &&
      t.source === "REFILL_TRIGGER"
  );
  if (hasActiveDelivery || (thyronormMed && thyronormMed.remainingDays > 10)) {
    list.push({
      id: "notif-med-refill-confirmed",
      category: "MEDICATION",
      title: "Thyronorm refill confirmed",
      description:
        "Apollo Pharmacy Jubilee Hills dispatch verified. Delhivery tracking live.",
      timestamp: "2 min ago",
      href: "/care",
    });
  } else {
    const lowStockMeds = medications.filter(
      (m) => m.remainingDays <= 5 && m.status === "ACTIVE"
    );
    lowStockMeds.forEach((m) => {
      list.push({
        id: `notif-med-${m.id}`,
        category: "MEDICATION",
        title: `${m.name} supply running low`,
        description: `Only ${m.remainingDays} days of medication remaining. Refill coordination needed.`,
        timestamp: "10 min ago",
        href: "/medications",
        isUrgent: true,
      });
    });
  }

  // 3. Appointment Notifications
  const primaryAppt = appointments.find((a) => a.status === "UPCOMING");
  if (primaryAppt) {
    list.push({
      id: `notif-appt-${primaryAppt.id}`,
      category: "APPOINTMENT",
      title: `${primaryAppt.doctor} appointment confirmed`,
      description: `Scheduled for ${primaryAppt.date} at ${primaryAppt.time} (${primaryAppt.hospital}). Pre-visit records assembled.`,
      timestamp: "1 hr ago",
      href: "/appointments",
    });
  }

  // 4. Care Actions & Completed Check-ins
  const recentCheckin = activity.find(
    (ev) =>
      ev.actionType.includes("VOICE") ||
      ev.actionType.includes("VERIFIED") ||
      ev.actor.id === "mem-arjun"
  );
  list.push({
    id: "notif-care-checkin",
    category: "CARE",
    title: "Arjun completed your medication check-in",
    description:
      recentCheckin?.description ||
      "Morning routine logged and verified with resting vitals.",
    timestamp: "3 hrs ago",
    href: "/activity",
  });

  // 5. Additional Pending Approvals
  const approvalTasks = tasks.filter(
    (t) =>
      t.status === "WAITING_FOR_APPROVAL" ||
      (t.status === "NEEDS_ATTENTION" && t.requiresApproval)
  );
  approvalTasks.forEach((t) => {
    list.push({
      id: `notif-approval-${t.id}`,
      category: "CARE",
      title: "Care action awaiting sign-off",
      description: t.title,
      timestamp: "4 hrs ago",
      href: "/care",
      isUrgent: true,
    });
  });

  return list;
}
