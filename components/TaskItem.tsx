"use client";

import { useRef, useState, useTransition } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { toggleTask, deleteTask, updateTask } from "@/app/actions/tasks";
import type { Task, TaskGroup, Importance } from "@/types";
import TaskForm from "./TaskForm";

const IMPORTANCE_CYCLE: Importance[] = ["high", "medium", "low"];

interface Props {
  task: Task;
  urgency: TaskGroup;
}

export default function TaskItem({ task, urgency }: Props) {
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft]     = useState(task.title);
  const [fullEdit, setFullEdit]         = useState(false);
  const [pending, startTransition]      = useTransition();
  const titleInputRef                   = useRef<HTMLInputElement>(null);

  const impColor =
    task.importance === "high"   ? "var(--imp-high)" :
    task.importance === "medium" ? "var(--imp-medium)" :
                                   "var(--imp-low)";

  const impLabel =
    task.importance === "high" ? "High" :
    task.importance === "medium" ? "Med" : "Low";

  const isOverdue = urgency === "overdue" && !task.is_completed;

  const dueLabel = task.due_at
    ? new Date(task.due_at).toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })
    : null;

  // ── Handlers ────────────────────────────────────────────────

  function handleToggle() {
    startTransition(() => toggleTask(task.id, !task.is_completed));
  }

  function handleDelete() {
    if (!confirm("Delete this task?")) return;
    startTransition(() => deleteTask(task.id));
  }

  function handleImportanceCycle(e: React.MouseEvent) {
    e.stopPropagation();
    if (task.is_completed) return;
    const idx  = IMPORTANCE_CYCLE.indexOf(task.importance);
    const next = IMPORTANCE_CYCLE[(idx + 1) % IMPORTANCE_CYCLE.length];
    startTransition(async () => { await updateTask(task.id, { importance: next }); });
  }

  function startTitleEdit(e: React.MouseEvent) {
    if (task.is_completed) return;
    e.preventDefault();
    setTitleDraft(task.title);
    setEditingTitle(true);
    setTimeout(() => titleInputRef.current?.focus(), 0);
  }

  function commitTitle() {
    const trimmed = titleDraft.trim();
    if (trimmed && trimmed !== task.title) {
      startTransition(async () => { await updateTask(task.id, { title: trimmed }); });
    }
    setEditingTitle(false);
  }

  function handleTitleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter")  { e.preventDefault(); commitTitle(); }
    if (e.key === "Escape") { setEditingTitle(false); setTitleDraft(task.title); }
  }

  function handleDueDateChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    startTransition(async () => { await updateTask(task.id, { due_at: val ? new Date(val).toISOString() : null }); });
  }

  // ── Render ──────────────────────────────────────────────────

  return (
    <>
      <div
        className="group relative flex items-center gap-0 rounded-xl overflow-hidden transition-all duration-300"
        style={{
          backgroundColor: task.is_completed ? "var(--surface-2)" : "var(--surface)",
          border: `1px solid ${isOverdue ? "rgba(163,0,14,0.2)" : "var(--border)"}`,
          boxShadow: task.is_completed ? "none" : "0 1px 4px rgba(15,23,48,0.04)",
          opacity: pending ? 0.6 : 1,
        }}
        onMouseEnter={(e) => {
          if (!task.is_completed) {
            (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 14px rgba(15,23,48,0.07)";
            (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)";
          }
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.boxShadow = task.is_completed ? "none" : "0 1px 4px rgba(15,23,48,0.04)";
          (e.currentTarget as HTMLElement).style.transform = "";
        }}
      >
        {/* Left importance strip */}
        <div
          className="self-stretch w-1 shrink-0"
          style={{ backgroundColor: task.is_completed ? "var(--border)" : impColor }}
        />

        {/* Circle toggle */}
        <button
          onClick={handleToggle}
          disabled={pending}
          className="ml-5 mr-4 shrink-0 flex items-center justify-center rounded-full border-2 transition-all duration-200"
          style={{
            width: "22px", height: "22px",
            borderColor: task.is_completed ? "var(--accent)" : "var(--border-strong)",
            backgroundColor: task.is_completed ? "var(--accent)" : "transparent",
          }}
          onMouseEnter={(e) => {
            if (!task.is_completed) {
              (e.currentTarget as HTMLElement).style.borderColor = "var(--accent)";
              (e.currentTarget as HTMLElement).style.backgroundColor = "var(--accent-subtle)";
            }
          }}
          onMouseLeave={(e) => {
            if (!task.is_completed) {
              (e.currentTarget as HTMLElement).style.borderColor = "var(--border-strong)";
              (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
            }
          }}
        >
          {task.is_completed && (
            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 12 12" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2 6l3 3 5-5" />
            </svg>
          )}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0 py-4 pr-4">
          {!task.is_completed && (
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              {/* Importance badge — click to cycle */}
              <button
                type="button"
                onClick={handleImportanceCycle}
                title="Click to change priority"
                className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-sm text-white transition-opacity hover:opacity-80 active:scale-95"
                style={{ backgroundColor: impColor }}
              >
                {impLabel}
              </button>
              {task.category && (
                <span className="text-xs font-semibold opacity-50" style={{ color: "var(--text-2)" }}>
                  {task.category}
                </span>
              )}
            </div>
          )}

          {/* Title — click to edit inline */}
          {editingTitle ? (
            <input
              ref={titleInputRef}
              value={titleDraft}
              onChange={(e) => setTitleDraft(e.target.value)}
              onBlur={commitTitle}
              onKeyDown={handleTitleKeyDown}
              className="w-full font-bold leading-snug bg-transparent outline-none rounded px-1 -mx-1"
              style={{
                fontSize: "1rem",
                color: "var(--text)",
                border: "1px solid var(--accent)",
                boxShadow: "0 0 0 3px rgba(26,64,194,0.12)",
              }}
            />
          ) : (
            <h4
              className={`font-bold leading-snug ${!task.is_completed ? "cursor-text hover:opacity-80" : ""}`}
              style={{
                color: task.is_completed ? "var(--text-3)" : "var(--text)",
                fontSize: task.is_completed ? "0.875rem" : "1rem",
                textDecoration: task.is_completed ? "line-through" : "none",
              }}
              onClick={startTitleEdit}
              title={task.is_completed ? undefined : "Click to edit"}
            >
              {task.title}
            </h4>
          )}

          {/* Due date — inline picker */}
          {!task.is_completed && (
            <div className="flex items-center gap-3 mt-1.5 flex-wrap">
              <label
                className="flex items-center gap-1.5 text-xs font-medium cursor-pointer group/date"
                title="Click to change due date"
              >
                <svg className="h-3 w-3 shrink-0" style={{ color: isOverdue ? "var(--imp-high)" : "var(--text-3)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
                </svg>
                <span
                  className="group-hover/date:underline"
                  style={{ color: isOverdue ? "var(--imp-high)" : "var(--text-3)" }}
                >
                  {isOverdue && <span className="font-bold">Overdue · </span>}
                  {dueLabel ?? "Set due date"}
                </span>
                <input
                  type="datetime-local"
                  value={task.due_at ? new Date(task.due_at).toISOString().slice(0, 16) : ""}
                  onChange={handleDueDateChange}
                  className="absolute opacity-0 w-0 h-0"
                  tabIndex={-1}
                />
              </label>
              {task.notes && (
                <span className="text-xs truncate max-w-[200px]" style={{ color: "var(--text-3)" }}>
                  {task.notes}
                </span>
              )}
            </div>
          )}

          {task.is_completed && task.completed_at && (
            <p className="text-xs mt-0.5" style={{ color: "var(--text-3)" }}>
              Completed {new Date(task.completed_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
            </p>
          )}
        </div>

        {/* Hover actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mr-4">
          <button
            onClick={() => setFullEdit(true)}
            className="rounded-lg p-1.5 transition-colors"
            style={{ color: "var(--text-3)" }}
            title="Full edit"
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "var(--surface-2)"; (e.currentTarget as HTMLElement).style.color = "var(--text)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "transparent"; (e.currentTarget as HTMLElement).style.color = "var(--text-3)"; }}
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={handleDelete}
            className="rounded-lg p-1.5 transition-colors"
            style={{ color: "var(--text-3)" }}
            title="Delete"
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "var(--danger-subtle)"; (e.currentTarget as HTMLElement).style.color = "var(--imp-high)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "transparent"; (e.currentTarget as HTMLElement).style.color = "var(--text-3)"; }}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {fullEdit && <TaskForm task={task} onClose={() => setFullEdit(false)} />}
    </>
  );
}
