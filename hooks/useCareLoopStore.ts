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
      const newEvent: ActivityEvent = {
        ...event,
        id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        timestamp: new Date().toISOString(),
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

  const updateTaskStatus = useCallback(
    (taskId: string, newStatus: TaskStatus, note?: string) => {
      setTasks((prev) => {
        const next = prev.map((t) => {
          if (t.id === taskId) {
            const historyEntry = {
              id: `act-${Date.now()}`,
              timestamp: new Date().toISOString(),
              actorName: activeUser.name,
              actorType: "USER" as const,
              action: `Changed status to ${newStatus.replace(/_/g, " ")}`,
              note,
            };
            return {
              ...t,
              status: newStatus,
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
        description: `${activeUser.name} updated task status to ${newStatus.replace(/_/g, " ")}.`,
        whyExplanation: note || `User manual status update to ${newStatus.replace(/_/g, " ")}.`,
      });
    },
    [activeUser, family, members, medications, records, appointments, activity, activeUserId, logActivity, saveState]
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

      // 4. Update task state: set to WAITING_FOR_EXTERNAL until delivery completes
      setTasks((prev) => {
        let matched = false;
        const next = prev.map((t) => {
          if (
            (t.relatedMedicationId === med.id || t.tags?.includes("Refill")) &&
            t.familyMemberId === patient.id &&
            t.status !== "COMPLETED"
          ) {
            matched = true;
            return {
              ...t,
              status: "WAITING_FOR_EXTERNAL" as TaskStatus,
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
            status: "WAITING_FOR_EXTERNAL",
            source: "REFILL_TRIGGER",
            relatedMedicationId: med.id,
            externalRailRef: {
              type: "DELHIVERY",
              referenceId: shipment.awbNumber,
              status: shipment.status,
              lastUpdated: new Date().toISOString(),
            },
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
      });

      logActivity({
        actor: { id: "prov-delhivery", name: "Delhivery Logistics", type: "PROVIDER_DELHIVERY" },
        actionType: "SHIPMENT_CREATED",
        entityType: "SHIPMENT",
        entityId: shipment.awbNumber,
        description: `Shipment created: ${shipment.awbNumber}. Cold-chain transit to ${patient.name} (${patient.location}).`,
        whyExplanation: `Automated logistics dispatch scheduled to deliver within 24h before patient's current stock depletes.`,
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
            return {
              ...t,
              status: (isDelivered ? "COMPLETED" : "IN_PROGRESS") as TaskStatus,
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
        });

        logActivity({
          actor: { id: "care-agent", name: "CareLoop Agent", type: "CARE_AGENT" },
          actionType: "INVENTORY_AUTO_UPDATED",
          entityType: "MEDICATION",
          entityId: targetMedId,
          description: `Automatic stock replenishment: Thyronorm 50 mcg increased by 60 tablets (now 63 days remaining).`,
          whyExplanation: "Closed-loop fulfillment completed. Inventory automatically synced upon verified physical doorstep delivery.",
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
        });
      }

      return updatedShipment;
    },
    [family, members, medications, records, appointments, activity, activeUserId, logActivity, saveState]
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

  return {
    mounted,
    family,
    members,
    medications,
    tasks,
    records,
    appointments,
    activity,
    activeUser,
    activeUserId,
    switchActiveUser,
    toggleCoordinatorAvailability,
    takeOverCareCoordination,
    updateTaskStatus,
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

