"use client";

import React, { useState } from "react";
import {
  CheckSquare,
  Plus,
  CheckCircle2,
  Share2,
  History,
  Truck,
  Clock,
  AlertTriangle,
  Info,
} from "lucide-react";
import { useCareLoop } from "@/providers/AppProvider";
import { Task, TaskPriority, TaskStatus } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Tabs } from "@/components/ui/Tabs";
import { formatDate, formatDateTime } from "@/lib/utils";
import { TaskContextDrawer } from "./TaskContextDrawer";

export function TaskEngineScreen() {
  const {
    tasks,
    members,
    activeUser,
    updateTaskStatus,
    snoozeTask,
    escalateTask,
    delegateTask,
    approveTask,
    addTask,
  } = useCareLoop();

  const [activeTab, setActiveTab] = useState<string>("ALL");
  const [customMemberScope, setCustomMemberScope] = useState<{ userId: string; filter: string } | null>(null);
  const [selectedTaskForContext, setSelectedTaskForContext] = useState<Task | null>(null);
  const [selectedTaskForHistory, setSelectedTaskForHistory] = useState<Task | null>(null);

  const memberScope =
    customMemberScope?.userId === activeUser?.id
      ? customMemberScope.filter
      : activeUser?.role === "DEPENDENT"
      ? activeUser.id
      : "ALL";

  // Delegation state
  const [delegatingTaskId, setDelegatingTaskId] = useState<string | null>(null);
  const [delegateToMemberId, setDelegateToMemberId] = useState<string>("mem-meera");
  const [delegateNote, setDelegateNote] = useState<string>("");

  // Snooze state
  const [snoozingTaskId, setSnoozingTaskId] = useState<string | null>(null);
  const [snoozeDays, setSnoozeDays] = useState<number>(3);
  const [snoozeReason, setSnoozeReason] = useState<string>("Waiting for pharmacy shipment");

  // Escalate state
  const [escalatingTaskId, setEscalatingTaskId] = useState<string | null>(null);
  const [escalateReason, setEscalateReason] = useState<string>(
    "Patient reported symptom concern or pharmacy is out of stock"
  );

  // Create Task state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newMemberId, setNewMemberId] = useState("mem-anita");
  const [newOwnerId, setNewOwnerId] = useState(activeUser.id);
  const [newPriority, setNewPriority] = useState<TaskPriority>("NORMAL");
  const [newDueDate, setNewDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    return d.toISOString().split("T")[0];
  });
  const [newRequiresApproval, setNewRequiresApproval] = useState(false);
  const [newApproverId, setNewApproverId] = useState("mem-anita");

  const filteredTasks = tasks.filter((t) => {
    if (memberScope !== "ALL" && t.familyMemberId !== memberScope && t.ownerId !== memberScope) return false;
    if (activeTab === "NEEDS_ATTENTION") return t.status === "NEEDS_ATTENTION";
    if (activeTab === "WAITING_APPROVAL") return t.status === "WAITING_FOR_APPROVAL";
    if (activeTab === "IN_PROGRESS")
      return t.status === "IN_PROGRESS" || t.status === "WAITING_FOR_EXTERNAL";
    if (activeTab === "ESCALATED") return t.status === "ESCALATED";
    if (activeTab === "COMPLETED") return t.status === "COMPLETED";
    return true;
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    addTask({
      title: newTitle,
      description: newDescription,
      familyMemberId: newMemberId,
      ownerId: newOwnerId,
      priority: newPriority,
      dueDate: newDueDate,
      status: newRequiresApproval ? "WAITING_FOR_APPROVAL" : "NEEDS_ATTENTION",
      source: "USER",
      requiresApproval: newRequiresApproval,
      requiredApprovalFromId: newRequiresApproval ? newApproverId : undefined,
      approvalStatus: newRequiresApproval ? "PENDING" : undefined,
      tags: ["Coordination"],
    });

    setIsCreateModalOpen(false);
    setNewTitle("");
    setNewDescription("");
  };

  const handleDelegateSubmit = () => {
    if (!delegatingTaskId) return;
    delegateTask(delegatingTaskId, delegateToMemberId, delegateNote);
    setDelegatingTaskId(null);
    setDelegateNote("");
  };

  const handleSnoozeSubmit = () => {
    if (!snoozingTaskId) return;
    snoozeTask(snoozingTaskId, snoozeDays, snoozeReason);
    setSnoozingTaskId(null);
  };

  const handleEscalateSubmit = () => {
    if (!escalatingTaskId) return;
    escalateTask(escalatingTaskId, escalateReason);
    setEscalatingTaskId(null);
  };

  const getPriorityBadgeVariant = (priority: TaskPriority) => {
    switch (priority) {
      case "URGENT":
        return "urgent";
      case "HIGH":
        return "warning";
      case "NORMAL":
        return "neutral";
      case "LOW":
        return "outline";
    }
  };

  const getStatusBadgeVariant = (status: TaskStatus) => {
    switch (status) {
      case "NEEDS_ATTENTION":
      case "ESCALATED":
        return "urgent";
      case "WAITING_FOR_APPROVAL":
        return "warning";
      case "IN_PROGRESS":
      case "WAITING_FOR_EXTERNAL":
        return "info";
      case "COMPLETED":
        return "success";
      case "CANCELLED":
      case "FAILED":
        return "outline";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
              Care Task Engine
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Operational Handover &amp; Escalations
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Family Tasks</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Operational tasks with explicit family ownership, linked records, snooze controls, and
            escalation rails.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => setIsCreateModalOpen(true)}
          className="gap-2 bg-slate-900"
        >
          <Plus className="w-4 h-4 text-teal-400" />
          <span>Create Task</span>
        </Button>
      </div>

      {/* Perspective Scope and Status Filters */}
      <div className="space-y-3">
        <Tabs
          tabs={[
            { id: "ALL", label: "All Family Tasks", count: tasks.length },
            { id: "mem-anita", label: "Anita (Mother)", count: tasks.filter(t => t.familyMemberId === "mem-anita" || t.ownerId === "mem-anita").length },
            { id: "mem-ramesh", label: "Ramesh (Father)", count: tasks.filter(t => t.familyMemberId === "mem-ramesh" || t.ownerId === "mem-ramesh").length },
            { id: "mem-arjun", label: "Arjun (Coordinator)", count: tasks.filter(t => t.familyMemberId === "mem-arjun" || t.ownerId === "mem-arjun").length },
          ]}
          activeTab={memberScope}
          onChange={(val) => setCustomMemberScope({ userId: activeUser?.id || "", filter: val })}
        />

        <Tabs
          tabs={[
            { id: "ALL", label: "All", count: tasks.filter(t => memberScope === "ALL" || t.familyMemberId === memberScope || t.ownerId === memberScope).length },
            {
              id: "NEEDS_ATTENTION",
              label: "Needs Attention",
              count: tasks.filter((t) => (memberScope === "ALL" || t.familyMemberId === memberScope || t.ownerId === memberScope) && t.status === "NEEDS_ATTENTION").length,
            },
            {
              id: "WAITING_APPROVAL",
              label: "Waiting Approval",
              count: tasks.filter((t) => (memberScope === "ALL" || t.familyMemberId === memberScope || t.ownerId === memberScope) && t.status === "WAITING_FOR_APPROVAL").length,
            },
            {
              id: "IN_PROGRESS",
              label: "In Progress",
              count: tasks.filter(
                (t) => (memberScope === "ALL" || t.familyMemberId === memberScope || t.ownerId === memberScope) && (t.status === "IN_PROGRESS" || t.status === "WAITING_FOR_EXTERNAL")
              ).length,
            },
            {
              id: "ESCALATED",
              label: "Escalated",
              count: tasks.filter((t) => (memberScope === "ALL" || t.familyMemberId === memberScope || t.ownerId === memberScope) && t.status === "ESCALATED").length,
            },
            {
              id: "COMPLETED",
              label: "Completed",
              count: tasks.filter((t) => (memberScope === "ALL" || t.familyMemberId === memberScope || t.ownerId === memberScope) && t.status === "COMPLETED").length,
            },
          ]}
          activeTab={activeTab}
          onChange={setActiveTab}
        />
      </div>

      {/* Tasks List */}
      <div className="space-y-3">
        {filteredTasks.map((task) => {
          const patient = members.find((m) => m.id === task.familyMemberId);
          const owner = members.find((m) => m.id === task.ownerId);
          const approver = members.find((m) => m.id === task.requiredApprovalFromId);

          return (
            <div
              key={task.id}
              className={`p-5 rounded-xl subtle-card transition-all space-y-3 ${
                task.status === "ESCALATED"
                  ? "border-red-300 bg-red-50/20"
                  : "hover:border-slate-300"
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={getPriorityBadgeVariant(task.priority)}>
                      {task.priority}
                    </Badge>
                    <Badge variant={getStatusBadgeVariant(task.status)}>
                      {task.status.replace(/_/g, " ")}
                    </Badge>
                    <span className="text-xs font-mono text-slate-400">
                      Due: {formatDate(task.dueDate)}
                    </span>
                    {task.source === "VOICE_ESCALATION" && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-100 text-red-800 font-bold border border-red-200">
                        Voice Symptom Escalation
                      </span>
                    )}
                    {task.source === "REFILL_TRIGGER" && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200">
                        Auto Refill Trigger
                      </span>
                    )}
                    {task.snoozedUntil && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-amber-600" />
                        Snoozed to {formatDate(task.snoozedUntil)}
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-slate-900">{task.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">
                    {task.description}
                  </p>

                  {task.escalationReason && (
                    <div className="text-xs text-red-800 font-medium bg-red-50 p-2 rounded-lg border border-red-200 flex items-center gap-2">
                      <AlertTriangle className="w-3.5 h-3.5 text-red-600 shrink-0" />
                      <span>
                        <strong>Escalated:</strong> {task.escalationReason}
                      </span>
                    </div>
                  )}
                </div>

                {/* Status Quick Actions */}
                <div className="flex flex-wrap items-center gap-2 self-end md:self-start shrink-0">
                  {/* View Context Drawer */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedTaskForContext(task)}
                    className="text-xs gap-1 text-slate-700 hover:bg-slate-100"
                    title="View linked records, medicines, and delivery rails"
                  >
                    <Info className="w-3.5 h-3.5 text-teal-600" />
                    Context
                  </Button>

                  {task.status === "WAITING_FOR_APPROVAL" && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => approveTask(task.id)}
                      className="bg-emerald-700 hover:bg-emerald-800 text-xs gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                    </Button>
                  )}

                  {task.status !== "COMPLETED" && task.status !== "WAITING_FOR_APPROVAL" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateTaskStatus(task.id, "COMPLETED")}
                      className="text-xs gap-1 hover:text-emerald-700 hover:border-emerald-300"
                    >
                      <CheckSquare className="w-3.5 h-3.5" /> Complete
                    </Button>
                  )}

                  {/* Snooze action */}
                  {task.status !== "COMPLETED" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSnoozingTaskId(task.id)}
                      className="text-xs gap-1 text-slate-600"
                    >
                      <Clock className="w-3.5 h-3.5" /> Snooze
                    </Button>
                  )}

                  {/* Reassign / Delegate */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setDelegatingTaskId(task.id);
                      setDelegateToMemberId(
                        task.ownerId === "mem-arjun" ? "mem-meera" : "mem-arjun"
                      );
                    }}
                    className="text-xs gap-1 text-slate-600 hover:text-slate-900"
                  >
                    <Share2 className="w-3.5 h-3.5" /> Delegate
                  </Button>

                  {/* Escalate */}
                  {task.status !== "ESCALATED" && task.status !== "COMPLETED" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEscalatingTaskId(task.id)}
                      className="text-xs gap-1 text-red-600 border-red-200 hover:bg-red-50"
                    >
                      <AlertTriangle className="w-3.5 h-3.5" /> Escalate
                    </Button>
                  )}
                </div>
              </div>

              {/* Task Metadata Strip */}
              <div className="pt-2.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex flex-wrap items-center gap-4 text-slate-500">
                  <span>
                    Patient: <strong className="text-slate-800 font-semibold">{patient?.name}</strong>
                  </span>
                  <span>•</span>
                  <span>
                    Assigned: <strong className="text-slate-800 font-semibold">{owner?.name}</strong>
                  </span>
                  {approver && (
                    <>
                      <span>•</span>
                      <span className="text-amber-800 font-medium">
                        Approval Required: <strong>{approver.name}</strong>
                      </span>
                    </>
                  )}
                  {task.externalRailRef && (
                    <>
                      <span>•</span>
                      <span className="flex items-center gap-1 font-mono text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                        <Truck className="w-3 h-3" /> {task.externalRailRef.referenceId} (
                        {task.externalRailRef.status})
                      </span>
                    </>
                  )}
                </div>

                <button
                  onClick={() => setSelectedTaskForHistory(task)}
                  className="text-slate-400 hover:text-slate-700 flex items-center gap-1 text-[11px] font-medium"
                >
                  <History className="w-3 h-3" />
                  <span>Audit Trail ({task.activityHistory.length})</span>
                </button>
              </div>
            </div>
          );
        })}

        {filteredTasks.length === 0 && (
          <div className="p-8 rounded-xl border border-dashed border-slate-200 text-center text-xs text-slate-400">
            No tasks found in this tab.
          </div>
        )}
      </div>

      {/* Task Context Drawer */}
      <TaskContextDrawer
        task={selectedTaskForContext}
        onClose={() => setSelectedTaskForContext(null)}
        onSnooze={(id) => {
          setSelectedTaskForContext(null);
          setSnoozingTaskId(id);
        }}
        onEscalate={(id) => {
          setSelectedTaskForContext(null);
          setEscalatingTaskId(id);
        }}
      />

      {/* Task Audit History Modal */}
      <Modal
        isOpen={!!selectedTaskForHistory}
        onClose={() => setSelectedTaskForHistory(null)}
        title="Task Audit Trail &amp; State Transitions"
        description={selectedTaskForHistory?.title || ""}
        maxWidth="md"
      >
        {selectedTaskForHistory && (
          <div className="space-y-3">
            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {selectedTaskForHistory.activityHistory.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg border border-slate-200 bg-slate-50 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span className="font-semibold text-slate-700">
                      {item.actorName} ({item.actorType})
                    </span>
                    <span className="font-mono">{formatDateTime(item.timestamp)}</span>
                  </div>
                  <p className="text-slate-800 font-medium">{item.action}</p>
                  {item.note && (
                    <p className="text-slate-500 italic bg-white p-1.5 rounded border border-slate-100">
                      &quot;{item.note}&quot;
                    </p>
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="secondary" onClick={() => setSelectedTaskForHistory(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Snooze Modal */}
      <Modal
        isOpen={!!snoozingTaskId}
        onClose={() => setSnoozingTaskId(null)}
        title="Snooze Task"
        description="Temporarily defer this task while waiting for external dependencies."
        maxWidth="sm"
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Snooze Duration (Days)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[1, 3, 7].map((days) => (
                <button
                  key={days}
                  type="button"
                  onClick={() => setSnoozeDays(days)}
                  className={`py-2 rounded-lg border font-semibold ${
                    snoozeDays === days
                      ? "bg-slate-900 text-white border-slate-900"
                      : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  {days} {days === 1 ? "Day" : "Days"}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Reason for Snoozing (Audit Log)
            </label>
            <input
              type="text"
              value={snoozeReason}
              onChange={(e) => setSnoozeReason(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
              placeholder="e.g. Waiting for Delhivery courier arrival"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setSnoozingTaskId(null)}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSnoozeSubmit}
              className="bg-slate-900 hover:bg-slate-800 text-white"
            >
              Confirm Snooze
            </Button>
          </div>
        </div>
      </Modal>

      {/* Escalate Modal */}
      <Modal
        isOpen={!!escalatingTaskId}
        onClose={() => setEscalatingTaskId(null)}
        title="Escalate Task to Human Caregiver"
        description="Trigger emergency or clinical handover when automation cannot safely proceed."
        maxWidth="sm"
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Escalation Reason / Context
            </label>
            <textarea
              value={escalateReason}
              onChange={(e) => setEscalateReason(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-red-300 text-xs focus:ring-1 focus:ring-red-500"
              rows={3}
              placeholder="Detail why human intervention is required..."
            />
          </div>

          <p className="text-[11px] text-slate-500">
            CareLoop will halt automated execution, change task status to <strong>ESCALATED</strong>,
            and surface an alert to the family coordinator.
          </p>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setEscalatingTaskId(null)}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleEscalateSubmit}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Confirm Escalation
            </Button>
          </div>
        </div>
      </Modal>

      {/* Task Delegation Modal */}
      <Modal
        isOpen={!!delegatingTaskId}
        onClose={() => setDelegatingTaskId(null)}
        title="Reassign Task Ownership"
        description="Transfer operational responsibility to another family member."
        maxWidth="sm"
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Assign to Member</label>
            <select
              value={delegateToMemberId}
              onChange={(e) => setDelegateToMemberId(e.target.value)}
              className="w-full h-9 px-2.5 rounded-lg border border-slate-300 bg-white text-slate-800 focus:outline-none"
            >
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.relationship} • {m.role})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Note (Optional)</label>
            <input
              type="text"
              value={delegateNote}
              onChange={(e) => setDelegateNote(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
              placeholder="e.g. Please pick this up while I am at work."
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setDelegatingTaskId(null)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleDelegateSubmit} className="bg-slate-900 text-white">
              Confirm Reassignment
            </Button>
          </div>
        </div>
      </Modal>

      {/* Create Task Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create Operational Task"
        description="Add a structured healthcare coordination task for the family circle."
        maxWidth="md"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <Input
            label="Task Title"
            placeholder="e.g. Pickup Thyronorm 50mcg, Schedule Cardiology Review"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            required
          />

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Description</label>
            <textarea
              className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-900"
              rows={2}
              placeholder="Add specifics, pharmacy details, or context..."
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Family Member (Patient)
              </label>
              <select
                value={newMemberId}
                onChange={(e) => setNewMemberId(e.target.value)}
                className="w-full h-9 px-2.5 rounded-lg border border-slate-300 bg-white text-slate-800 focus:outline-none"
              >
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.relationship})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Assigned Owner
              </label>
              <select
                value={newOwnerId}
                onChange={(e) => setNewOwnerId(e.target.value)}
                className="w-full h-9 px-2.5 rounded-lg border border-slate-300 bg-white text-slate-800 focus:outline-none"
              >
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.relationship})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Priority</label>
              <select
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value as TaskPriority)}
                className="w-full h-9 px-2.5 rounded-lg border border-slate-300 bg-white text-slate-800 focus:outline-none"
              >
                <option value="LOW">Low</option>
                <option value="NORMAL">Normal</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Due Date</label>
              <input
                type="date"
                value={newDueDate}
                onChange={(e) => setNewDueDate(e.target.value)}
                className="w-full h-9 px-2.5 rounded-lg border border-slate-300 bg-white text-slate-800 focus:outline-none"
              />
            </div>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="requiresApproval"
                checked={newRequiresApproval}
                onChange={(e) => setNewRequiresApproval(e.target.checked)}
                className="w-4 h-4 rounded text-slate-900 accent-slate-900 cursor-pointer"
              />
              <label
                htmlFor="requiresApproval"
                className="font-medium text-slate-800 cursor-pointer"
              >
                Require formal human authorization before execution
              </label>
            </div>

            {newRequiresApproval && (
              <div className="pt-2">
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                  Designated Approver
                </label>
                <select
                  value={newApproverId}
                  onChange={(e) => setNewApproverId(e.target.value)}
                  className="w-full h-8 px-2 rounded border border-slate-300 bg-white text-slate-800 text-xs focus:outline-none"
                >
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.relationship} • {m.role})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsCreateModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" className="bg-slate-900">
              Create Task
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
