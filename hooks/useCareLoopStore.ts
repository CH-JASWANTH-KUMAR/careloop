"use client";

import { useState, useCallback, useSyncExternalStore } from "react";
import {
  FamilyMember,
  Family,
  Task,
  HealthRecord,
  Medication,
  Appointment,
  ActivityEvent,
  TaskStatus,
  TaskTransition,
  TaskActivityEntry,
  ExtractedMetadata,
} from "@/types";
import {
  initialFamily,
  initialFamilyMembers,
  initialMedications,
  initialTasks,
  initialHealthRecords,
  initialAppointments,
  initialActivityEvents,
} from "@/db/seedData";
import { pineLabsPaymentProvider } from "@/services/payment/PaymentProvider";
import { delhiveryLogisticsProvider } from "@/services/logistics/LogisticsProvider";

const STORAGE_KEYS = {
  FAMILY: "careloop_family_v2",
  MEMBERS: "careloop_members_v2",
  MEDICATIONS: "careloop_medications_v2",
  TASKS: "careloop_tasks_v2",
  RECORDS: "careloop_records_v2",
  APPOINTMENTS: "careloop_appointments_v2",
  ACTIVITY: "careloop_activity_v2",
  ACTIVE_USER: "careloop_active_user_v2",
};

export function useCareLoopStore() {
  const [family, setFamily] = useState<Family>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(STORAGE_KEYS.FAMILY);
        if (stored) return JSON.parse(stored);
      } catch {}
    }
    return initialFamily;
  });

  const [members, setMembers] = useState<FamilyMember[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(STORAGE_KEYS.MEMBERS);
        if (stored) return JSON.parse(stored);
      } catch {}
    }
    return initialFamilyMembers;
  });

  const [medications, setMedications] = useState<Medication[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(STORAGE_KEYS.MEDICATIONS);
        if (stored) return JSON.parse(stored);
      } catch {}
    }
    return initialMedications;
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(STORAGE_KEYS.TASKS);
        if (stored) return JSON.parse(stored);
      } catch {}
    }
    return initialTasks;
  });

  const [records, setRecords] = useState<HealthRecord[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(STORAGE_KEYS.RECORDS);
        if (stored) return JSON.parse(stored);
      } catch {}
    }
    return initialHealthRecords;
  });

  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(STORAGE_KEYS.APPOINTMENTS);
        if (stored) return JSON.parse(stored);
      } catch {}
    }
    return initialAppointments;
  });

  const [activity, setActivity] = useState<ActivityEvent[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(STORAGE_KEYS.ACTIVITY);
        if (stored) return JSON.parse(stored);
      } catch {}
    }
    return initialActivityEvents;
  });

  const [activeUserId, setActiveUserId] = useState<string>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(STORAGE_KEYS.ACTIVE_USER);
        if (stored) return stored;
      } catch {}
    }
    return "mem-arjun";
  });

  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  // Save changes to localStorage
  const saveState = useCallback(
    (
      newFamily = family,
      newMembers = members,
      newMeds = medications,
      newTasks = tasks,
      newRecs = records,
      newAppts = appointments,
      newAct = activity,
      newUser = activeUserId
    ) => {
      try {
        localStorage.setItem(STORAGE_KEYS.FAMILY, JSON.stringify(newFamily));
        localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(newMembers));
        localStorage.setItem(STORAGE_KEYS.MEDICATIONS, JSON.stringify(newMeds));
        localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(newTasks));
        localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(newRecs));
        localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(newAppts));
        localStorage.setItem(STORAGE_KEYS.ACTIVITY, JSON.stringify(newAct));
        localStorage.setItem(STORAGE_KEYS.ACTIVE_USER, newUser);
      } catch {
        // Handle potential quota errors in private browsing
      }
    },
    [family, members, medications, tasks, records, appointments, activity, activeUserId]
  );

  const activeUser = members.find((m) => m.id === activeUserId) || members[2];

  const switchActiveUser = useCallback((userId: string) => {
    setActiveUserId(userId);
    try {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_USER, userId);
    } catch {}
  }, []);

  const logActivity = useCallback(
    (event: Omit<ActivityEvent, "id" | "timestamp">) => {
      const defaultSource =
        event.source ||
        (event.actor.type === "CARE_AGENT"
          ? "CARE_AGENT"
          : event.actor.type === "PROVIDER_PINELABS"
          ? "PINE_LABS_WEBHOOK"
          : event.actor.type === "PROVIDER_DELHIVERY"
          ? "DELHIVERY_TRACKING"
          : event.actor.type === "PROVIDER_GNANI"
          ? "GNANI_VOICE"
          : "USER_PORTAL");

      const newEvent: ActivityEvent = {
        ...event,
        id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        timestamp: new Date().toISOString(),
        source: defaultSource,
        authorizationInfo: event.authorizationInfo || "Verified by authorized user",
        resultSummary: event.resultSummary || event.description,
      };
      setActivity((prev) => {
        const next = [newEvent, ...prev];
        try {
          localStorage.setItem(STORAGE_KEYS.ACTIVITY, JSON.stringify(next));
        } catch {}
        return next;
      });
      return newEvent;
    },
    []
  );

  // Toggle Primary Coordinator Availability (Single Point of Failure mitigation)
  const toggleCoordinatorAvailability = useCallback(
    (explicitState?: boolean) => {
      setFamily((prev) => {
        const newState = explicitState !== undefined ? explicitState : !prev.isCoordinatorAvailable;
        const next = { ...prev, isCoordinatorAvailable: newState };
        saveState(next, members, medications, tasks, records, appointments, activity, activeUserId);
        return next;
      });

      const primary = members.find((m) => m.id === family.primaryCoordinatorId);
      logActivity({
        actor: { id: activeUser.id, name: activeUser.name, type: "USER" },
        actionType: "TASK_STATUS_CHANGED",
        entityType: "FAMILY",
        entityId: family.id,
        description: `Primary Care Coordinator status changed: ${primary?.name} is now marked ${
          family.isCoordinatorAvailable ? "UNAVAILABLE" : "AVAILABLE"
        }.`,
        whyExplanation:
          "CareLoop monitors coordinator availability so critical medication and appointment workflows are never forgotten if the primary manager is unavailable.",
      });
    },
    [family, members, medications, tasks, records, appointments, activity, activeUserId, activeUser, logActivity, saveState]
  );

  // Take over Care Coordination handover
  const takeOverCareCoordination = useCallback(
    (newCoordinatorId: string, handoverReason = "Primary coordinator unavailable") => {
      const newCoord = members.find((m) => m.id === newCoordinatorId);
      const prevCoord = members.find((m) => m.id === family.primaryCoordinatorId);
      if (!newCoord) return;

      // 1. Update family entity
      const nextFamily: Family = {
        ...family,
        primaryCoordinatorId: newCoordinatorId,
        isCoordinatorAvailable: true,
      };
      setFamily(nextFamily);

      // 2. Update member roles
      const nextMembers = members.map((m) => {
        if (m.id === newCoordinatorId) {
          return {
            ...m,
            role: "CARE_COORDINATOR" as const,
            permissions: {
              ...m.permissions,
              canApprovePayments: true,
              canManageMedications: true,
              canCoordinateAppointments: true,
            },
          };
        }
        return m;
      });
      setMembers(nextMembers);

      // 3. Reassign active tasks previously owned by prevCoord
      const nextTasks = tasks.map((t) => {
        if (t.ownerId === family.primaryCoordinatorId && t.status !== "COMPLETED") {
          return {
            ...t,
            ownerId: newCoordinatorId,
            activityHistory: [
              {
                id: `act-${Date.now()}`,
                timestamp: new Date().toISOString(),
                actorName: newCoord.name,
                actorType: "USER" as const,
                action: `Care responsibility handed over from ${prevCoord?.name || "prior coordinator"} to ${newCoord.name}.`,
                note: handoverReason,
              },
              ...t.activityHistory,
            ],
          };
        }
        return t;
      });
      setTasks(nextTasks);

      // 4. Switch active user to new coordinator
      setActiveUserId(newCoordinatorId);

      // 5. Save and Log Activity
      saveState(nextFamily, nextMembers, medications, nextTasks, records, appointments, activity, newCoordinatorId);

      logActivity({
        actor: { id: newCoord.id, name: newCoord.name, type: "USER" },
        actionType: "CARE_CONTINUITY_HANDOVER",
        entityType: "FAMILY",
        entityId: family.id,
        description: `Care Continuity Handover: ${newCoord.name} took over primary health management for ${family.name}.`,
        whyExplanation: `Handover executed to maintain continuous care coverage while ${prevCoord?.name || "Arjun"} is unavailable. Pending tasks transferred immediately.`,
      });
    },
    [family, members, medications, tasks, records, appointments, activity, logActivity, saveState]
  );

  const resumeCareCoordination = useCallback(
    (originalCoordinatorId = "mem-arjun") => {
      takeOverCareCoordination(
        originalCoordinatorId,
        "Primary care coordinator resumed active family healthcare management."
      );
    },
    [takeOverCareCoordination]
  );

  const transitionTaskState = useCallback(
    (
      taskId: string,
      newState: TaskStatus,
      reason: string,
      resultingAction?: string,
      customActor?: { id: string; name: string; type: "USER" | "CARE_AGENT" | "PROVIDER" }
    ) => {
      const actor = customActor || { id: activeUser.id, name: activeUser.name, type: "USER" as const };
      let updatedTask: Task | undefined;

      setTasks((prev) => {
        const next = prev.map((t) => {
          if (t.id === taskId) {
            const transition: TaskTransition = {
              id: `tr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
              timestamp: new Date().toISOString(),
              actor,
              patientId: t.familyMemberId,
              previousState: t.status,
              newState,
              reason,
              resultingAction,
            };
            const historyEntry: TaskActivityEntry = {
              id: `act-${Date.now()}`,
              timestamp: new Date().toISOString(),
              actorName: actor.name,
              actorType: actor.type,
              action: `Transitioned from ${t.status.replace(/_/g, " ")} to ${newState.replace(/_/g, " ")}`,
              note: reason,
            };
            updatedTask = {
              ...t,
              status: newState,
              transitions: [transition, ...(t.transitions || [])],
              activityHistory: [historyEntry, ...t.activityHistory],
            };
            return updatedTask;
          }
          return t;
        });
        saveState(family, members, medications, next, records, appointments, activity, activeUserId);
        return next;
      });

      logActivity({
        actor: {
          id: actor.id,
          name: actor.name,
          type:
            actor.type === "CARE_AGENT"
              ? "CARE_AGENT"
              : actor.type === "PROVIDER"
              ? "PROVIDER_DELHIVERY"
              : "USER",
        },
        actionType: "TASK_STATUS_CHANGED",
        entityType: "TASK",
        entityId: taskId,
        description: `${actor.name} transitioned task status to ${newState.replace(/_/g, " ")}.`,
        whyExplanation: reason,
        source:
          actor.type === "CARE_AGENT"
            ? "CARE_AGENT"
            : actor.type === "PROVIDER"
            ? "DELHIVERY_TRACKING"
            : "USER_PORTAL",
        authorizationInfo:
          newState === "AUTHORIZED" || newState === "COMPLETED"
            ? `Authorized by ${activeUser.name}`
            : undefined,
        resultSummary: resultingAction || `Task state updated to ${newState}`,
      });

      return updatedTask;
    },
    [activeUser, family, members, medications, records, appointments, activity, activeUserId, logActivity, saveState]
  );

  const updateTaskStatus = useCallback(
    (taskId: string, newStatus: TaskStatus, note?: string) => {
      transitionTaskState(
        taskId,
        newStatus,
        note || `User manual status update to ${newStatus.replace(/_/g, " ")}.`,
        `Task status updated to ${newStatus}`
      );
    },
    [transitionTaskState]
  );

  // Snooze Task
  const snoozeTask = useCallback(
    (taskId: string, days: number, reason: string) => {
      const now = new Date();
      const newDue = new Date(now.getTime() + days * 24 * 3600 * 1000).toISOString().split("T")[0];

      setTasks((prev) => {
        const next = prev.map((t) => {
          if (t.id === taskId) {
            return {
              ...t,
              dueDate: newDue,
              snoozedUntil: newDue,
              snoozeReason: reason,
              activityHistory: [
                {
                  id: `act-${Date.now()}`,
                  timestamp: new Date().toISOString(),
                  actorName: activeUser.name,
                  actorType: "USER" as const,
                  action: `Task snoozed by ${days} day(s) until ${newDue}.`,
                  note: reason,
                },
                ...t.activityHistory,
              ],
            };
          }
          return t;
        });
        saveState(family, members, medications, next, records, appointments, activity, activeUserId);
        return next;
      });

      logActivity({
        actor: { id: activeUser.id, name: activeUser.name, type: "USER" },
        actionType: "TASK_SNOOZED",
        entityType: "TASK",
        entityId: taskId,
        description: `${activeUser.name} snoozed task for ${days} days until ${newDue}.`,
        whyExplanation: `Snooze reason: ${reason}`,
      });
    },
    [activeUser, family, members, medications, records, appointments, activity, activeUserId, logActivity, saveState]
  );

  // Escalate Task
  const escalateTask = useCallback(
    (taskId: string, reason: string) => {
      setTasks((prev) => {
        const next = prev.map((t) => {
          if (t.id === taskId) {
            return {
              ...t,
              status: "ESCALATED" as TaskStatus,
              priority: "URGENT" as const,
              escalationReason: reason,
              activityHistory: [
                {
                  id: `act-${Date.now()}`,
                  timestamp: new Date().toISOString(),
                  actorName: activeUser.name,
                  actorType: "USER" as const,
                  action: `Escalated task to urgent priority.`,
                  note: reason,
                },
                ...t.activityHistory,
              ],
            };
          }
          return t;
        });
        saveState(family, members, medications, next, records, appointments, activity, activeUserId);
        return next;
      });

      logActivity({
        actor: { id: activeUser.id, name: activeUser.name, type: "USER" },
        actionType: "TASK_ESCALATED",
        entityType: "TASK",
        entityId: taskId,
        description: `${activeUser.name} escalated task due to: ${reason}`,
        whyExplanation: reason,
      });
    },
    [activeUser, family, members, medications, records, appointments, activity, activeUserId, logActivity, saveState]
  );

  const delegateTask = useCallback(
    (taskId: string, newOwnerId: string, note?: string) => {
      const targetMember = members.find((m) => m.id === newOwnerId);
      setTasks((prev) => {
        const next = prev.map((t) => {
          if (t.id === taskId) {
            const historyEntry = {
              id: `act-${Date.now()}`,
              timestamp: new Date().toISOString(),
              actorName: activeUser.name,
              actorType: "USER" as const,
              action: `Delegated task to ${targetMember?.name || newOwnerId}`,
              note,
            };
            return {
              ...t,
              ownerId: newOwnerId,
              activityHistory: [historyEntry, ...t.activityHistory],
            };
          }
          return t;
        });
        saveState(family, members, medications, next, records, appointments, activity, activeUserId);
        return next;
      });

      logActivity({
        actor: { id: activeUser.id, name: activeUser.name, type: "USER" },
        actionType: "TASK_STATUS_CHANGED",
        entityType: "TASK",
        entityId: taskId,
        description: `${activeUser.name} delegated task to ${targetMember?.name || newOwnerId}.`,
        whyExplanation: note || `Delegated coordination responsibility.`,
      });
    },
    [activeUser, family, members, medications, records, appointments, activity, activeUserId, logActivity, saveState]
  );

  const approveTask = useCallback(
    async (taskId: string) => {
      const task = tasks.find((t) => t.id === taskId);
      if (!task) return;

      setTasks((prev) => {
        const next = prev.map((t) => {
          if (t.id === taskId) {
            return {
              ...t,
              status: "COMPLETED" as TaskStatus,
              approvalStatus: "APPROVED" as const,
              activityHistory: [
                {
                  id: `act-${Date.now()}`,
                  timestamp: new Date().toISOString(),
                  actorName: activeUser.name,
                  actorType: "USER" as const,
                  action: `Explicit approval granted by ${activeUser.name}`,
                },
                ...t.activityHistory,
              ],
            };
          }
          return t;
        });
        saveState(family, members, medications, next, records, appointments, activity, activeUserId);
        return next;
      });

      logActivity({
        actor: { id: activeUser.id, name: activeUser.name, type: "USER" },
        actionType: "APPROVAL_GRANTED",
        entityType: "TASK",
        entityId: taskId,
        description: `${activeUser.name} granted formal approval for: ${task.title}.`,
        whyExplanation: `Human approval signed off by authorized family member.`,
      });
    },
    [tasks, activeUser, family, members, medications, records, appointments, activity, activeUserId, logActivity, saveState]
  );

  const addTask = useCallback(
    (newTask: Omit<Task, "id" | "activityHistory">) => {
      const createdTask: Task = {
        ...newTask,
        id: `task-${Date.now()}`,
        activityHistory: [
          {
            id: `act-${Date.now()}`,
            timestamp: new Date().toISOString(),
            actorName: activeUser.name,
            actorType: "USER",
            action: "Task created manually",
          },
        ],
      };

      setTasks((prev) => {
        const next = [createdTask, ...prev];
        saveState(family, members, medications, next, records, appointments, activity, activeUserId);
        return next;
      });

      logActivity({
        actor: { id: activeUser.id, name: activeUser.name, type: "USER" },
        actionType: "TASK_CREATED",
        entityType: "TASK",
        entityId: createdTask.id,
        description: `${activeUser.name} created task: "${createdTask.title}".`,
        whyExplanation: createdTask.description,
      });

      return createdTask;
    },
    [activeUser, family, members, medications, records, appointments, activity, activeUserId, logActivity, saveState]
  );

  const refillMedication = useCallback(
    async (medicationId: string, quantityDays = 60) => {
      const med = medications.find((m) => m.id === medicationId);
      const patient = members.find((m) => m.id === med?.patientId);
      if (!med || !patient) return null;

      // Guardrail: check family spending limit
      if (med.costEstimate > family.monthlySpendingLimit) {
        logActivity({
          actor: { id: "prov-pinelabs", name: "Pine Labs Gateway", type: "PROVIDER_PINELABS" },
          actionType: "PAYMENT_DECLINED",
          entityType: "AUTHORIZATION",
          entityId: `AUTH-DECLINED-${Date.now()}`,
          description: `Payment declined: ₹${med.costEstimate} for ${med.name} exceeds monthly limit of ₹${family.monthlySpendingLimit}.`,
          whyExplanation: "Spending guardrail enforced. Requires primary coordinator to increase threshold or approve override.",
        });
        throw new Error(
          `Refill cost of ₹${med.costEstimate} exceeds family monthly spending limit of ₹${family.monthlySpendingLimit}. Please adjust the spending limit in Settings or request coordinator override.`
        );
      }

      // 1. Create payment authorization via Pine Labs Provider
      const auth = await pineLabsPaymentProvider.createAuthorization({
        approverId: activeUser.id,
        approverName: activeUser.name,
        amount: med.costEstimate,
        spendingLimit: family.monthlySpendingLimit,
        purpose: `Refill for ${med.name} (${quantityDays} days supply)`,
        merchantName: med.pharmacyName,
      });

      // 2. Capture Payment with receipt
      const captureResult = await pineLabsPaymentProvider.capturePayment(auth.authorizationId);

      // 3. Create Delhivery Healthcare Express Shipment (Cold Chain)
      const shipment = await delhiveryLogisticsProvider.createShipment({
        recipientName: patient.name,
        recipientPhone: patient.emergencyContact.phone,
        deliveryAddress: {
          line1: patient.location,
          city: "Hyderabad",
          state: "Telangana",
          pincode: "500033",
        },
        originHub: "Apollo Begumpet Central Hub",
        items: [{ name: med.name, quantity: 1, prescriptionRequired: true }],
        responsibleMemberName: activeUser.name,
      });

      // 4. Update task state: set to WAITING until delivery completes
      setTasks((prev) => {
        let matched = false;
        const next = prev.map((t) => {
          if (
            (t.relatedMedicationId === med.id || t.tags?.includes("Refill")) &&
            t.familyMemberId === patient.id &&
            t.status !== "COMPLETED"
          ) {
            matched = true;
            const refillTransition: TaskTransition = {
              id: `tr-${Date.now()}`,
              timestamp: new Date().toISOString(),
              actor: { id: activeUser.id, name: activeUser.name, type: "USER" },
              patientId: patient.id,
              previousState: t.status,
              newState: "WAITING",
              reason: "Refill authorized by coordinator. Pine Labs payment captured and Delhivery cold-chain transit dispatched.",
              resultingAction: `Dispatched via Delhivery (AWB: ${shipment.awbNumber})`,
            };
            return {
              ...t,
              status: "WAITING" as TaskStatus,
              transitions: [refillTransition, ...(t.transitions || [])],
              externalRailRef: {
                type: "DELHIVERY" as const,
                referenceId: shipment.awbNumber,
                status: shipment.status,
                lastUpdated: new Date().toISOString(),
              },
              activityHistory: [
                {
                  id: `act-${Date.now()}`,
                  timestamp: new Date().toISOString(),
                  actorName: "CareLoop Agent",
                  actorType: "CARE_AGENT" as const,
                  action: `Payment captured via Pine Labs (Receipt ${captureResult.receipt.receiptId}). Delhivery courier assigned (AWB ${shipment.awbNumber}).`,
                },
                ...t.activityHistory,
              ],
            };
          }
          return t;
        });

        if (!matched) {
          const newTask: Task = {
            id: `task-${Date.now()}`,
            title: `Refill Delivery: ${med.name} (${quantityDays} days)`,
            description: `Awaiting doorstep delivery from Apollo Pharmacy via Delhivery Healthcare Cold Chain (AWB: ${shipment.awbNumber}).`,
            familyMemberId: patient.id,
            ownerId: activeUser.id,
            priority: "HIGH",
            dueDate: new Date(Date.now() + 24 * 3600 * 1000).toISOString().split("T")[0],
            status: "WAITING",
            source: "REFILL_TRIGGER",
            relatedMedicationId: med.id,
            externalRailRef: {
              type: "DELHIVERY",
              referenceId: shipment.awbNumber,
              status: shipment.status,
              lastUpdated: new Date().toISOString(),
            },
            transitions: [
              {
                id: `tr-${Date.now()}`,
                timestamp: new Date().toISOString(),
                actor: { id: activeUser.id, name: activeUser.name, type: "USER" },
                patientId: patient.id,
                previousState: "AWAITING_AUTHORIZATION",
                newState: "WAITING",
                reason: "Refill authorized by coordinator. Pine Labs payment captured and Delhivery cold-chain transit dispatched.",
                resultingAction: `Dispatched via Delhivery (AWB: ${shipment.awbNumber})`,
              },
            ],
            activityHistory: [
              {
                id: `act-${Date.now()}`,
                timestamp: new Date().toISOString(),
                actorName: "CareLoop Agent",
                actorType: "CARE_AGENT",
                action: `Payment captured via Pine Labs (Receipt ${captureResult.receipt.receiptId}). Delhivery courier assigned (AWB ${shipment.awbNumber}).`,
              },
            ],
          };
          next.unshift(newTask);
        }

        saveState(family, members, medications, next, records, appointments, activity, activeUserId);
        return next;
      });

      // 5. Log Activities with Why explanations
      logActivity({
        actor: { id: "prov-pinelabs", name: "Pine Labs Gateway", type: "PROVIDER_PINELABS" },
        actionType: "PAYMENT_CAPTURED",
        entityType: "AUTHORIZATION",
        entityId: auth.authorizationId,
        description: `₹${med.costEstimate} captured for ${med.name} refill at ${med.pharmacyName}. Receipt #${captureResult.receipt.receiptId}.`,
        whyExplanation: `Authorized by ${activeUser.name} within family limit of ₹${family.monthlySpendingLimit} to prevent medication disruption.`,
        source: "PINE_LABS_WEBHOOK",
        authorizationInfo: `Authorized by ${activeUser.name} (Monthly spending limit: ₹${family.monthlySpendingLimit})`,
        resultSummary: `Payment captured. Receipt #${captureResult.receipt.receiptId}.`,
      });

      logActivity({
        actor: { id: "prov-delhivery", name: "Delhivery Logistics", type: "PROVIDER_DELHIVERY" },
        actionType: "SHIPMENT_CREATED",
        entityType: "SHIPMENT",
        entityId: shipment.awbNumber,
        description: `Shipment created: ${shipment.awbNumber}. Cold-chain transit to ${patient.name} (${patient.location}).`,
        whyExplanation: `Automated logistics dispatch scheduled to deliver within 24h before patient's current stock depletes.`,
        source: "DELHIVERY_TRACKING",
        authorizationInfo: `Signed off with pharmacy dispatch instructions`,
        resultSummary: `AWB ${shipment.awbNumber} generated. Apollo Central Hub pickup scheduled.`,
      });

      return { auth, shipment, receipt: captureResult.receipt };
    },
    [medications, members, activeUser, family, records, appointments, activity, activeUserId, logActivity, saveState]
  );

  const advanceShipmentStep = useCallback(
    async (awbNumber: string, targetStatus?: import("@/types/providers").LogisticsLifecycleStatus) => {
      const updatedShipment = await (delhiveryLogisticsProvider.advanceShipmentStatus
        ? delhiveryLogisticsProvider.advanceShipmentStatus(awbNumber, targetStatus)
        : delhiveryLogisticsProvider.trackShipment(awbNumber));

      const isDelivered = updatedShipment.status === "DELIVERED";
      const now = new Date();

      // 1. Update task matching awbNumber
      let linkedMedId: string | undefined;

      setTasks((prev) => {
        const next = prev.map((t) => {
          if (t.externalRailRef?.referenceId === awbNumber) {
            linkedMedId = t.relatedMedicationId;
            const courierTransition: TaskTransition = {
              id: `tr-${Date.now()}`,
              timestamp: now.toISOString(),
              actor: { id: "prov-delhivery", name: "Delhivery Logistics", type: "PROVIDER" },
              patientId: t.familyMemberId,
              previousState: t.status,
              newState: (isDelivered ? "COMPLETED" : "IN_PROGRESS") as TaskStatus,
              reason: `Courier status updated: ${updatedShipment.status}.`,
              resultingAction: isDelivered
                ? "Physical doorstep delivery verified. Inventory auto-replenished."
                : "Package in transit with cold-chain monitoring.",
            };

            return {
              ...t,
              status: (isDelivered ? "COMPLETED" : "IN_PROGRESS") as TaskStatus,
              transitions: [courierTransition, ...(t.transitions || [])],
              externalRailRef: {
                ...t.externalRailRef,
                status: updatedShipment.status,
                lastUpdated: now.toISOString(),
              },
              activityHistory: [
                {
                  id: `act-${Date.now()}`,
                  timestamp: now.toISOString(),
                  actorName: "Delhivery Logistics",
                  actorType: "PROVIDER" as const,
                  action: `Status updated to ${updatedShipment.status}: ${
                    updatedShipment.trackingHistory[updatedShipment.trackingHistory.length - 1]?.description || ""
                  }`,
                },
                ...t.activityHistory,
              ],
            };
          }
          return t;
        });
        saveState(family, members, medications, next, records, appointments, activity, activeUserId);
        return next;
      });

      // 2. If DELIVERED, automatically replenish inventory!
      if (isDelivered) {
        const targetMedId = linkedMedId || "med-thyronorm";
        const quantityToAdd = 60; // Standard 60-day bottle
        let targetPatientName = "Anita Rao";

        setMedications((prev) => {
          const next = prev.map((m) => {
            if (m.id === targetMedId) {
              const newStock = m.currentStockUnits + quantityToAdd;
              const newRemainingDays = m.remainingDays + quantityToAdd;
              const nextRefill = new Date(now.getTime() + newRemainingDays * 24 * 60 * 60 * 1000)
                .toISOString()
                .split("T")[0];

              const pt = members.find((mb) => mb.id === m.patientId);
              if (pt) targetPatientName = pt.name;

              return {
                ...m,
                currentStockUnits: newStock,
                remainingDays: newRemainingDays,
                lastRefillDate: now.toISOString().split("T")[0],
                nextRefillDate: nextRefill,
              };
            }
            return m;
          });
          saveState(family, members, next, undefined, records, appointments, activity, activeUserId);
          return next;
        });

        // 3. Log Activity for Delivery & Auto-Inventory Update
        logActivity({
          actor: { id: "prov-delhivery", name: "Delhivery Logistics", type: "PROVIDER_DELHIVERY" },
          actionType: "SHIPMENT_DELIVERED",
          entityType: "SHIPMENT",
          entityId: awbNumber,
          description: `Doorstep delivery completed for ${targetPatientName} (AWB: ${awbNumber}). Package handed over with cold-chain seal intact.`,
          whyExplanation: "Doorstep delivery completed. Physical handover confirmed.",
          source: "DELHIVERY_TRACKING",
          authorizationInfo: "Verified by recipient OTP & doorstep signature",
          resultSummary: `Delivered to ${targetPatientName} at Jubilee Hills (AWB: ${awbNumber})`,
        });

        logActivity({
          actor: { id: "care-agent", name: "CareLoop Agent", type: "CARE_AGENT" },
          actionType: "INVENTORY_AUTO_UPDATED",
          entityType: "MEDICATION",
          entityId: targetMedId,
          description: `Automatic stock replenishment: Thyronorm 50 mcg increased by 60 tablets (now 63 days remaining).`,
          whyExplanation: "Closed-loop fulfillment completed. Inventory automatically synced upon verified physical doorstep delivery.",
          source: "CARE_AGENT",
          authorizationInfo: `Authorized by ${activeUser.name} (Refill Plan #RX-ANITA)`,
          resultSummary: "Stock replenished to 63 tablets (63 days). Next refill date set.",
        });
      } else {
        const latestStep = updatedShipment.trackingHistory[updatedShipment.trackingHistory.length - 1];
        logActivity({
          actor: { id: "prov-delhivery", name: "Delhivery Logistics", type: "PROVIDER_DELHIVERY" },
          actionType: "SHIPMENT_UPDATED",
          entityType: "SHIPMENT",
          entityId: awbNumber,
          description: `AWB ${awbNumber} status: ${updatedShipment.status} at ${latestStep?.location || "Transit Hub"}.`,
          whyExplanation: latestStep?.description || "Live tracking update from courier network.",
          source: "DELHIVERY_TRACKING",
          authorizationInfo: "Logistics checkpoint scan",
          resultSummary: `Courier status: ${updatedShipment.status}`,
        });
      }

      return updatedShipment;
    },
    [family, members, medications, records, appointments, activity, activeUserId, activeUser.name, logActivity, saveState]
  );

  const completeDelivery = useCallback(
    async (awbNumber: string) => {
      return advanceShipmentStep(awbNumber, "DELIVERED");
    },
    [advanceShipmentStep]
  );

  const updateFamilySpendingLimit = useCallback(
    (newLimit: number) => {
      setFamily((prev) => {
        const next = { ...prev, monthlySpendingLimit: newLimit };
        saveState(next, members, medications, tasks, records, appointments, activity, activeUserId);
        return next;
      });

      logActivity({
        actor: { id: activeUser.id, name: activeUser.name, type: "USER" },
        actionType: "CARE_CONTINUITY_HANDOVER",
        entityType: "FAMILY",
        entityId: family.id,
        description: `${activeUser.name} updated monthly healthcare spending threshold to ₹${newLimit}.`,
        whyExplanation: "Financial guardrail modified to calibrate automated care authorization thresholds.",
      });
    },
    [activeUser, family.id, members, medications, tasks, records, appointments, activity, activeUserId, logActivity, saveState]
  );

  const addRecord = useCallback(
    (record: Omit<HealthRecord, "id">) => {
      const newRec: HealthRecord = {
        ...record,
        id: `rec-${Date.now()}`,
      };

      setRecords((prev) => {
        const next = [newRec, ...prev];
        saveState(family, members, medications, tasks, next, appointments, activity, activeUserId);
        return next;
      });

      const patient = members.find((m) => m.id === record.patientId);

      logActivity({
        actor: { id: activeUser.id, name: activeUser.name, type: "USER" },
        actionType: "DOCUMENT_UPLOADED",
        entityType: "RECORD",
        entityId: newRec.id,
        description: `Uploaded ${newRec.title} for ${patient?.name || "patient"}.`,
        whyExplanation: "Document uploaded to secure vault for OCR clinical parameter extraction.",
      });

      return newRec;
    },
    [activeUser, family, members, medications, tasks, appointments, activity, activeUserId, logActivity, saveState]
  );

  // Edit / verify record extraction
  const updateRecordExtraction = useCallback(
    (recordId: string, updatedFields: Partial<ExtractedMetadata>) => {
      setRecords((prev) => {
        const next = prev.map((r) => {
          if (r.id === recordId) {
            return {
              ...r,
              pipelineStatus: "VERIFIED" as const,
              extractedMetadata: {
                ...r.extractedMetadata!,
                ...updatedFields,
                reviewStatus: "VERIFIED_BY_HUMAN" as const,
              },
            };
          }
          return r;
        });
        saveState(family, members, medications, tasks, next, appointments, activity, activeUserId);
        return next;
      });

      logActivity({
        actor: { id: activeUser.id, name: activeUser.name, type: "USER" },
        actionType: "DOCUMENT_VERIFIED",
        entityType: "RECORD",
        entityId: recordId,
        description: `${activeUser.name} edited and confirmed OCR clinical parameters.`,
        whyExplanation: "Human verification converts inferred OCR data into verified medical timeline entries.",
      });
    },
    [activeUser, family, members, medications, tasks, appointments, activity, activeUserId, logActivity, saveState]
  );

  const verifyRecordMetadata = useCallback(
    (recordId: string) => {
      updateRecordExtraction(recordId, {});
    },
    [updateRecordExtraction]
  );

  const completeAppointment = useCallback(
    (appointmentId: string, consultationSummary?: string) => {
      const appt = appointments.find((a) => a.id === appointmentId);
      if (!appt) return null;

      const patient = members.find((m) => m.id === appt.patientId);

      // 1. Update appointment status to COMPLETED
      setAppointments((prev) => {
        const next = prev.map((a) => (a.id === appointmentId ? { ...a, status: "COMPLETED" as const } : a));
        saveState(family, members, medications, tasks, records, next, activity, activeUserId);
        return next;
      });

      // 2. Automatically generate post-visit follow-up task
      const followUpTitle = `Post-Visit Review: ${appt.doctor} (${patient?.name || "Patient"})`;
      const followUpDesc =
        consultationSummary ||
        `Review consultation notes with ${appt.doctor} (${appt.speciality}) and verify updated prescriptions or follow-up tests.`;

      const followUpTask: Task = {
        id: `task-followup-${Date.now()}`,
        title: followUpTitle,
        description: followUpDesc,
        familyMemberId: appt.patientId,
        ownerId: family.primaryCoordinatorId,
        priority: "NORMAL",
        dueDate: new Date(Date.now() + 48 * 3600 * 1000).toISOString().split("T")[0],
        status: "PREPARED",
        source: "DOCTOR_FOLLOWUP",
        relatedAppointmentId: appt.id,
        activityHistory: [
          {
            id: `act-${Date.now()}`,
            timestamp: new Date().toISOString(),
            actorName: "CareLoop Agent",
            actorType: "CARE_AGENT",
            action: "Generated post-consultation follow-up workflow",
          },
        ],
        transitions: [
          {
            id: `tr-${Date.now()}`,
            timestamp: new Date().toISOString(),
            actor: { id: "care-agent", name: "CareLoop Agent", type: "CARE_AGENT" },
            patientId: appt.patientId,
            previousState: "DETECTED",
            newState: "PREPARED",
            reason: `Automated post-visit follow-up protocol initiated following completion of consultation with ${appt.doctor}.`,
            resultingAction: "Follow-up task created for coordinator review",
          },
        ],
        tags: ["Follow-up", "Appointment"],
      };

      setTasks((prev) => {
        const next = [followUpTask, ...prev];
        saveState(family, members, medications, next, records, appointments, activity, activeUserId);
        return next;
      });

      // 3. Log activity event with 7-tuple provenance
      logActivity({
        actor: { id: activeUser.id, name: activeUser.name, type: "USER" },
        actionType: "APPOINTMENT_COMPLETED",
        entityType: "APPOINTMENT",
        entityId: appointmentId,
        description: `Consultation with ${appt.doctor} marked attended and completed.`,
        whyExplanation: `Completed clinical consultation for ${patient?.name || "patient"}. Post-visit follow-up packet generated.`,
        source: "USER_PORTAL",
        authorizationInfo: `Confirmed by ${activeUser.name}`,
        resultSummary: `Appointment marked COMPLETED. Created follow-up task: "${followUpTitle}".`,
      });

      return followUpTask;
    },
    [appointments, members, family, medications, tasks, records, activity, activeUserId, activeUser, logActivity, saveState]
  );

  // Family Onboarding flow creation
  const createFamilyOnboarding = useCallback(
    (familyData: Omit<Family, "id" | "createdAt">, membersData: FamilyMember[]) => {
      const newFam: Family = {
        ...familyData,
        id: `fam-${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
      setFamily(newFam);
      setMembers(membersData);
      setActiveUserId(newFam.primaryCoordinatorId);

      saveState(newFam, membersData, medications, tasks, records, appointments, activity, newFam.primaryCoordinatorId);

      logActivity({
        actor: { id: newFam.primaryCoordinatorId, name: "Family Creator", type: "USER" },
        actionType: "CARE_CONTINUITY_HANDOVER",
        entityType: "FAMILY",
        entityId: newFam.id,
        description: `Created new family group: ${newFam.name} with ${membersData.length} members.`,
        whyExplanation: "Configured family roles, explicit permissions matrix, and emergency contacts.",
      });
    },
    [medications, tasks, records, appointments, activity, logActivity, saveState]
  );

  const resetGoldenJourneyScenario = useCallback(() => {
    const now = new Date();
    const threeDaysLater = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

    setMedications((prev) => {
      const next = prev.map((m) => {
        if (m.id === "med-thyronorm") {
          return {
            ...m,
            currentStockUnits: 3,
            remainingDays: 3,
            nextRefillDate: threeDaysLater,
          };
        }
        return m;
      });
      saveState(family, members, next, undefined, records, appointments, activity, activeUserId);
      return next;
    });

    setTasks((prev) => {
      const next = prev.map((t) => {
        if (t.relatedMedicationId === "med-thyronorm") {
          return {
            ...t,
            status: "NEEDS_ATTENTION" as TaskStatus,
            externalRailRef: undefined,
          };
        }
        return t;
      });
      saveState(family, members, undefined, next, records, appointments, activity, activeUserId);
      return next;
    });

    logActivity({
      actor: { id: "care-agent", name: "CareLoop Demo Engine", type: "CARE_AGENT" },
      actionType: "TASK_STATUS_CHANGED",
      entityType: "MEDICATION",
      entityId: "med-thyronorm",
      description: "Golden Journey Scenario reset: Anita Rao's Thyronorm stock restored to 3 tablets (3 days).",
      whyExplanation: "Demo scenario state reinitialized to allow repeatable evaluation.",
    });
  }, [family, members, records, appointments, activity, activeUserId, logActivity, saveState]);

  const rejectMedicationAuthorization = useCallback(
    (medicationId: string, reason = "Coordinator rejected automated fulfillment.") => {
      const med = medications.find((m) => m.id === medicationId);
      logActivity({
        actor: { id: activeUser.id, name: activeUser.name, type: "USER" },
        actionType: "APPROVAL_REJECTED",
        entityType: "AUTHORIZATION",
        entityId: `AUTH-REJECT-${Date.now()}`,
        description: `${activeUser.name} rejected refill authorization for ${med?.name || "Thyronorm 50 mcg"}.`,
        whyExplanation: reason,
      });
    },
    [activeUser, medications, logActivity]
  );

  const resetToSeedData = useCallback(() => {
    setFamily(initialFamily);
    setMembers(initialFamilyMembers);
    setMedications(initialMedications);
    setTasks(initialTasks);
    setRecords(initialHealthRecords);
    setAppointments(initialAppointments);
    setActivity(initialActivityEvents);
    setActiveUserId("mem-arjun");

    try {
      localStorage.clear();
    } catch {}
  }, []);

  // ─── Hydration-safe data layer ──────────────────────────────────────────────
  // The useState lazy initialisers above read localStorage on the first
  // synchronous client render, which can differ from what the server computed
  // (which always uses seed data because `window` is undefined in Node).
  // To guarantee the server HTML === first client paint for every consumer
  // (FamilyScreen, OverviewDashboard, CareScreen, Header …) we expose the
  // seed defaults while `mounted` is false.  After React commits to the DOM,
  // `useSyncExternalStore` flips `mounted` to true and all slices switch to
  // the real localStorage-backed state in a single synchronous re-render.
  // This is the single authoritative fix — no per-screen suppressions needed.
  const stableFamily       = mounted ? family       : initialFamily;
  const stableMembers      = mounted ? members      : initialFamilyMembers;
  const stableMedications  = mounted ? medications  : initialMedications;
  const stableTasks        = mounted ? tasks        : initialTasks;
  const stableRecords      = mounted ? records      : initialHealthRecords;
  const stableAppointments = mounted ? appointments : initialAppointments;
  const stableActivity     = mounted ? activity     : initialActivityEvents;
  const stableActiveUser   = mounted
    ? (members.find((m) => m.id === activeUserId) || members[2])
    : initialFamilyMembers[2];
  const stableActiveUserId = mounted ? activeUserId : initialFamilyMembers[2].id;

  return {
    mounted,
    family:       stableFamily,
    members:      stableMembers,
    medications:  stableMedications,
    tasks:        stableTasks,
    records:      stableRecords,
    appointments: stableAppointments,
    activity:     stableActivity,
    activeUser:   stableActiveUser,
    activeUserId: stableActiveUserId,
    switchActiveUser,
    toggleCoordinatorAvailability,
    takeOverCareCoordination,
    resumeCareCoordination,
    updateTaskStatus,
    transitionTaskState,
    completeAppointment,
    snoozeTask,
    escalateTask,
    delegateTask,
    approveTask,
    addTask,
    refillMedication,
    advanceShipmentStep,
    completeDelivery,
    updateFamilySpendingLimit,
    resetGoldenJourneyScenario,
    rejectMedicationAuthorization,
    addRecord,
    updateRecordExtraction,
    verifyRecordMetadata,
    createFamilyOnboarding,
    resetToSeedData,
    logActivity,
  };
}

