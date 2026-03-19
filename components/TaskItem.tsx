"use client";

import { useState, useTransition } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { clsx } from "clsx";
import { toggleTask, deleteTask } from "@/app/actions/tasks";
import type { Task, TaskGroup } from "@/types";
import TaskForm from "./TaskForm";

const BADGE: Record<TaskGroup, { label: string; style: React.CSSProperties }> = {
  overdue: {
    label: "Overdue",
    style: { background: "var(--danger-subtle)", color: "var(--danger)" },
  },
  today: {
    label: "Today",
    style: { background: "var(--warning-subtle)", color: "var(--warning)" },
  },
  upcoming: {
    label: "Upcoming",
    style: { background: "var(--surface-2)", color: "var(--text-2)" },
  },
  someday: {
    label: "Someday",
    style: { background: "var(--surface-2)", color: "var(--text-3)" },
  },
};

const CATEGORY_LABEL: Record<string, string> = {
  work: "Work", personal: "Personal", academics: "Academics",
  acm: "ACM", thesis: "Thesis", other: "Other",
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

  const badge = BADGE[urgency];
  const dueLabel = task.due_at
    ? new Date(task.due_at).toLocaleString(undefined, {
        month: "short", day: "numeric",
        hour: "numeric", minute: "2-digit",
      })
    : null;

  const impColor =
    task.importance === "high"   ? "var(--imp-high)" :
    task.importance === "medium" ? "var(--imp-medium)" :
                                   "var(--imp-low)";

  return (
    <>
      <div
        className={clsx(
          "group relative flex items-start gap-3 rounded-xl border px-4 py-3.5 transition-colors",
          task.is_completed
            ? "border-border bg-surface opacity-50"
            : urgency === "overdue"
            ? "border-[var(--danger-border)] bg-danger-subtle/30"
            : "border-border bg-surface hover:border-border-strong",
          pending && "opacity-40 pointer-events-none"
        )}
      >
        {/* Importance strip */}
        {!task.is_completed && (
          <div
            className="absolute left-0 inset-y-2 w-[3px] rounded-full"
            style={{ backgroundColor: impColor, opacity: task.importance === "low" ? 0.4 : 1 }}
          />
        )}

        {/* Checkbox */}
        <input
          type="checkbox"
          checked={task.is_completed}
          onChange={handleToggle}
          className="mt-0.5 h-4 w-4 shrink-0 rounded border-border cursor-pointer"
        />

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={clsx(
                "text-sm font-medium leading-snug",
                task.is_completed ? "line-through text-text-3" : "text-text"
              )}
            >
              {task.title}
            </span>

            {showUrgencyBadge && (
              <span
                className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium"
                style={badge.style}
              >
                {badge.label}
              </span>
            )}
          </div>

          <div className="mt-1 flex items-center gap-1.5 text-[11.5px] text-text-3 flex-wrap">
            <span>{CATEGORY_LABEL[task.category]}</span>
            {dueLabel && (
              <>
                <span>·</span>
                <span
                  className={clsx(urgency === "overdue" && !task.is_completed && "font-medium")}
                  style={urgency === "overdue" && !task.is_completed ? { color: "var(--danger)" } : {}}
                >
                  {dueLabel}
                </span>
              </>
            )}
            {task.notes && (
              <>
                <span>·</span>
                <span className="truncate max-w-[180px]">{task.notes}</span>
              </>
            )}
          </div>
        </div>

        {/* Hover actions */}
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <button
            onClick={() => setEditing(true)}
            className="rounded-lg p-1.5 text-text-3 hover:bg-surface-2 hover:text-text transition-colors"
            title="Edit"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={handleDelete}
            className="rounded-lg p-1.5 text-text-3 hover:bg-danger-subtle hover:text-danger transition-colors"
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
