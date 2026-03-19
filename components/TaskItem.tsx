"use client";

import { useState, useTransition } from "react";
import { Pencil, Trash2, AlertCircle } from "lucide-react";
import { clsx } from "clsx";
import { toggleTask, deleteTask } from "@/app/actions/tasks";
import type { Task, TaskGroup } from "@/types";
import TaskForm from "./TaskForm";

const GROUP_BADGE: Record<TaskGroup, { label: string; className: string }> = {
  overdue:  { label: "Overdue",  className: "bg-red-100 text-red-700" },
  today:    { label: "Today",    className: "bg-amber-100 text-amber-700" },
  upcoming: { label: "Upcoming", className: "bg-blue-100 text-blue-700" },
  someday:  { label: "Someday",  className: "bg-gray-100 text-gray-600" },
};

const IMPORTANCE_DOT: Record<string, string> = {
  high:   "bg-red-500",
  medium: "bg-amber-400",
  low:    "bg-gray-300",
};

const CATEGORY_LABEL: Record<string, string> = {
  work:      "Work",
  personal:  "Personal",
  academics: "Academics",
  acm:       "ACM",
  thesis:    "Thesis",
  other:     "Other",
};

interface Props {
  task: Task;
  urgency: TaskGroup;
  showUrgencyBadge?: boolean;
}

export default function TaskItem({ task, urgency, showUrgencyBadge = false }: Props) {
  const [editing, setEditing] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleToggle() {
    startTransition(() => toggleTask(task.id, !task.is_completed));
  }

  function handleDelete() {
    if (!confirm("Delete this task?")) return;
    startTransition(() => deleteTask(task.id));
  }

  const badge = GROUP_BADGE[urgency];
  const dueLabel = task.due_at
    ? new Date(task.due_at).toLocaleString(undefined, {
        month: "short", day: "numeric",
        hour: "numeric", minute: "2-digit",
      })
    : null;

  return (
    <>
      <div
        className={clsx(
          "group flex items-start gap-3 rounded-lg border px-4 py-3 transition-colors",
          task.is_completed
            ? "border-gray-100 bg-gray-50 opacity-60"
            : urgency === "overdue"
            ? "border-red-200 bg-red-50/40 hover:bg-red-50"
            : "border-gray-200 bg-white hover:bg-gray-50",
          pending && "opacity-50 pointer-events-none"
        )}
      >
        {/* Checkbox */}
        <input
          type="checkbox"
          checked={task.is_completed}
          onChange={handleToggle}
          className="mt-0.5 h-4 w-4 shrink-0 rounded border-gray-300 text-indigo-600 accent-indigo-600 cursor-pointer"
        />

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Importance dot */}
            <span className={clsx("h-2 w-2 rounded-full shrink-0", IMPORTANCE_DOT[task.importance])} />

            {/* Title */}
            <span className={clsx("text-sm font-medium text-gray-900 truncate", task.is_completed && "line-through text-gray-400")}>
              {task.title}
            </span>

            {/* Urgency badge */}
            {showUrgencyBadge && (
              <span className={clsx("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium", badge.className)}>
                {urgency === "overdue" && <AlertCircle className="h-3 w-3" />}
                {badge.label}
              </span>
            )}
          </div>

          {/* Meta row */}
          <div className="mt-1 flex items-center gap-2 text-xs text-gray-400">
            <span>{CATEGORY_LABEL[task.category]}</span>
            {dueLabel && (
              <>
                <span>·</span>
                <span className={clsx(urgency === "overdue" && "text-red-500 font-medium")}>{dueLabel}</span>
              </>
            )}
            {task.notes && (
              <>
                <span>·</span>
                <span className="truncate max-w-[200px]">{task.notes}</span>
              </>
            )}
          </div>
        </div>

        {/* Actions (visible on hover) */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <button
            onClick={() => setEditing(true)}
            className="rounded p-1 text-gray-400 hover:bg-gray-200 hover:text-gray-700 transition-colors"
            title="Edit"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={handleDelete}
            className="rounded p-1 text-gray-400 hover:bg-red-100 hover:text-red-600 transition-colors"
            title="Delete"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {editing && <TaskForm task={task} onClose={() => setEditing(false)} />}
    </>
  );
}
