"use client";

import { useCareLoop } from "@/providers/AppProvider";

export function useCareContinuity() {
  const {
    family,
    members,
    tasks,
    activeUser,
    toggleCoordinatorAvailability,
    takeOverCareCoordination,
  } = useCareLoop();

  const primaryCoordinator = members.find((m) => m.id === family?.primaryCoordinatorId);
  const isAvailable = family?.isCoordinatorAvailable ?? true;

  // Find tasks that need attention and are currently assigned to the primary coordinator
  const tasksNeedingAttention = tasks.filter(
    (t) =>
      t.status !== "COMPLETED" &&
      t.status !== "CANCELLED" &&
      t.ownerId === family?.primaryCoordinatorId
  );

  const canActiveUserTakeOver =
    activeUser.id !== family?.primaryCoordinatorId &&
    (activeUser.role === "CARE_COORDINATOR" ||
      activeUser.role === "MEMBER" ||
      activeUser.role === "OWNER");

  return {
    family,
    isAvailable,
    primaryCoordinator,
    tasksNeedingAttention,
    canActiveUserTakeOver,
    toggleCoordinatorAvailability,
    takeOverCareCoordination,
  };
}
