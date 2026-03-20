"use client";

import { useRef, useState, useTransition } from "react";
import { Plus, Pencil, Trash2, Archive, X, Search, Repeat } from "lucide-react";
import { toggleTask, deleteTask, stopRecurrence, updateTask } from "@/app/actions/tasks";
import type { Task, GroupedTasks, TaskGroup, Importance } from "@/types";
import { getTaskUrgency } from "@/lib/priority";
import TaskForm from "./TaskForm";
import ConfirmDialog from "./ConfirmDialog";

// ── Column config ─────────────────────────────────────────────────────────────

const COLUMNS: {
  key: TaskGroup;
  label: string;
  accent: string;
  emptyText: string;
}[] = [
  { key: "overdue",  label: "Overdue",  accent: "var(--imp-high)", emptyText: "Nothing overdue" },
  { key: "today",    label: "Today",    accent: "var(--warning)",  emptyText: "Nothing due today" },
  { key: "upcoming", label: "Upcoming", accent: "var(--accent)",   emptyText: "Nothing coming up" },
  { key: "someday",  label: "Someday",  accent: "var(--text-3)",   emptyText: "No undated tasks" },
];

// ── Kanban card ───────────────────────────────────────────────────────────────

const IMPORTANCE_CYCLE: Importance[] = ["high", "medium", "low"];

function KanbanCard({ task, urgency, onEdit }: { task: Task; urgency: TaskGroup; onEdit: (t: Task) => void }) {
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft]     = useState(task.title);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [pending, startTransition]      = useTransition();
  const titleInputRef                   = useRef<HTMLInputElement>(null);

  const impColor =
    task.importance === "high"   ? "var(--imp-high)"   :
    task.importance === "medium" ? "var(--imp-medium)" : "var(--imp-low)";

  const badgeLabel =
    task.importance === "high"   ? "High"   :
    task.importance === "medium" ? "Med" : "Low";

  const isOverdue = urgency === "overdue" && !task.is_completed;

  const dueLabel = task.due_at
    ? new Date(task.due_at).toLocaleString(undefined, {
        month: "short", day: "numeric",
        hour: "numeric", minute: "2-digit",
      })
    : null;

  function handleToggle() {
    startTransition(() => toggleTask(task.id, !task.is_completed));
  }

  function handleDelete() {
    setConfirmDelete(true);
  }

  function confirmDeletion() {
    setConfirmDelete(false);
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

  return (
    <>
      <div
        className="group relative rounded-xl overflow-hidden"
        style={{
          backgroundColor: task.is_completed ? "var(--surface-2)" : "var(--surface)",
          border: `1px solid ${isOverdue ? "rgba(163,0,14,0.25)" : "var(--border)"}`,
          boxShadow: task.is_completed ? "none" : "0 1px 3px rgba(15,23,48,0.05), 0 1px 2px rgba(15,23,48,0.03)",
          opacity: pending ? 0.55 : 1,
          transition: "box-shadow 0.15s ease, transform 0.15s ease, opacity 0.15s ease",
        }}
        onMouseEnter={(e) => {
          if (!task.is_completed) {
            (e.currentTarget as HTMLElement).style.boxShadow = "0 6px 20px rgba(15,23,48,0.08), 0 2px 6px rgba(15,23,48,0.05)";
            (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)";
          }
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.boxShadow = task.is_completed ? "none" : "0 1px 3px rgba(15,23,48,0.05)";
          (e.currentTarget as HTMLElement).style.transform = "";
        }}
      >
        {/* Left importance strip */}
        <div
          className="absolute inset-y-0 left-0 w-[3px]"
          style={{ backgroundColor: task.is_completed ? "var(--border)" : impColor }}
        />

        <div className="pl-4 pr-3 pt-3 pb-3">
          {/* Priority + category + hover actions */}
          {!task.is_completed && (
            <div className="flex items-center gap-1.5 mb-2">
              {/* Importance badge — click to cycle */}
              <button
                type="button"
                onClick={handleImportanceCycle}
                title="Click to change priority"
                className="flex items-center gap-1 text-[10px] font-bold tracking-wide shrink-0 transition-opacity hover:opacity-70 active:scale-95"
                style={{ color: impColor }}
              >
                <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: impColor }} />
                {badgeLabel}
              </button>

              {/* Category chip */}
              {task.category && (
                <span
                  className="text-[10px] font-semibold rounded-full px-2 py-0.5 ml-1 shrink-0"
                  style={{ backgroundColor: "var(--surface-3)", color: "var(--text-3)" }}
                >
                  {task.category}
                </span>
              )}

              {/* Spacer + hover actions */}
              <div className="flex-1" />
              <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                <button
                  onClick={() => onEdit(task)}
                  className="rounded-md p-1 transition-colors duration-100"
                  style={{ color: "var(--text-3)" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "var(--surface-2)"; (e.currentTarget as HTMLElement).style.color = "var(--text-2)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "transparent"; (e.currentTarget as HTMLElement).style.color = "var(--text-3)"; }}
                >
                  <Pencil className="h-[11px] w-[11px]" />
                </button>
                {task.recurrence_rule && (
                  <button
                    onClick={() => startTransition(() => stopRecurrence(task.id))}
                    disabled={pending}
                    title="Stop repeating"
                    className="rounded-md p-1 transition-colors duration-100"
                    style={{ color: "var(--text-3)" }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "var(--warning-subtle)"; (e.currentTarget as HTMLElement).style.color = "var(--warning)"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "transparent"; (e.currentTarget as HTMLElement).style.color = "var(--text-3)"; }}
                  >
                    <Repeat className="h-[11px] w-[11px]" />
                  </button>
                )}
                <button
                  onClick={handleDelete}
                  className="rounded-md p-1 transition-colors duration-100"
                  style={{ color: "var(--text-3)" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "var(--danger-subtle)"; (e.currentTarget as HTMLElement).style.color = "var(--imp-high)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "transparent"; (e.currentTarget as HTMLElement).style.color = "var(--text-3)"; }}
                >
                  <Trash2 className="h-[11px] w-[11px]" />
                </button>
              </div>
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
              className="w-full text-[13px] font-semibold leading-snug bg-transparent outline-none rounded px-1 -mx-1"
              style={{
                color: "var(--text)",
                border: "1px solid var(--accent)",
                boxShadow: "0 0 0 3px rgba(26,64,194,0.12)",
              }}
            />
          ) : (
            <p
              className={`text-[13px] font-semibold leading-snug ${!task.is_completed ? "cursor-text hover:opacity-75" : ""}`}
              style={{
                color: task.is_completed ? "var(--text-3)" : "var(--text)",
                textDecoration: task.is_completed ? "line-through" : "none",
              }}
              onClick={startTitleEdit}
              title={task.is_completed ? undefined : "Click to edit"}
            >
              {task.title}
            </p>
          )}

          {/* Due row */}
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            {task.is_completed && task.category && (
              <span
                className="text-[10px] font-semibold rounded-full px-2 py-0.5"
                style={{ backgroundColor: "var(--surface-3)", color: "var(--text-3)" }}
              >
                {task.category}
              </span>
            )}
            {!task.is_completed && (
              <label
                className="flex items-center gap-1 text-[11px] font-medium cursor-pointer group/date"
                title="Click to change due date"
              >
                <svg className="h-2.5 w-2.5 shrink-0" style={{ color: isOverdue ? "var(--imp-high)" : "var(--text-3)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
                </svg>
                <span className="group-hover/date:underline" style={{ color: isOverdue ? "var(--imp-high)" : "var(--text-3)" }}>
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
            )}
            {task.is_completed && task.completed_at && (
              <span className="text-[10px]" style={{ color: "var(--text-3)" }}>
                Done {new Date(task.completed_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
              </span>
            )}
          </div>

          {/* Footer action */}
          <div className="flex items-center justify-between mt-3 pt-2.5" style={{ borderTop: "1px solid var(--border)" }}>
            {task.is_completed ? (
              <>
                <button
                  onClick={handleToggle}
                  disabled={pending}
                  className="text-[10px] font-semibold uppercase tracking-wide transition-colors duration-100"
                  style={{ color: "var(--text-3)" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--text-2)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--text-3)"; }}
                >
                  Undo
                </button>
                <button
                  onClick={handleDelete}
                  className="rounded-md p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                  style={{ color: "var(--text-3)" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--imp-high)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--text-3)"; }}
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </>
            ) : (
              <button
                onClick={handleToggle}
                disabled={pending}
                className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide transition-colors duration-100"
                style={{ color: "var(--accent)" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--accent-hover)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--accent)"; }}
              >
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Mark done
              </button>
            )}
          </div>
        </div>
      </div>

      {confirmDelete && (
        <ConfirmDialog
          title="Delete task"
          message={`"${task.title}" will be permanently deleted.`}
          confirmLabel="Delete"
          onConfirm={confirmDeletion}
          onCancel={() => setConfirmDelete(false)}
        />
      )}
    </>
  );
}

// ── Column ────────────────────────────────────────────────────────────────────

function KanbanColumn({
  label,
  accent,
  tasks,
  emptyText,
  index,
  onAdd,
  onEdit,
}: {
  label: string;
  accent: string;
  tasks: Task[];
  emptyText: string;
  urgency: TaskGroup;
  index: number;
  onAdd: () => void;
  onEdit: (t: Task) => void;
}) {
  return (
    <div
      className="flex flex-col rounded-xl overflow-hidden shrink-0"
      style={{
        minWidth: "240px",
        flex: "1 1 0",
        backgroundColor: "var(--surface-2)",
        border: "1px solid var(--border)",
        borderTop: `3px solid ${accent}`,
        animation: "kanban-in 0.35s ease both",
        animationDelay: `${index * 60}ms`,
      }}
    >
      {/* Column header */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2.5">
          <span
            className="text-[11px] font-bold uppercase tracking-[0.14em]"
            style={{ color: accent }}
          >
            {label}
          </span>
          <span
            className="text-[10px] font-bold tabular-nums w-5 h-5 rounded-full flex items-center justify-center"
            style={{ backgroundColor: "var(--surface-3)", color: "var(--text-3)" }}
          >
            {tasks.length}
          </span>
        </div>
        <button
          onClick={onAdd}
          className="w-6 h-6 rounded-md flex items-center justify-center transition-colors duration-150"
          style={{ color: "var(--text-3)" }}
          title="Add task"
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.backgroundColor = "var(--surface-3)";
            (e.currentTarget as HTMLElement).style.color = accent;
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
            (e.currentTarget as HTMLElement).style.color = "var(--text-3)";
          }}
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Divider */}
      <div className="mx-3 h-px" style={{ backgroundColor: "var(--border)" }} />

      {/* Cards */}
      <div
        className="flex-1 p-2.5 space-y-2 overflow-y-auto"
        style={{ minHeight: "100px", maxHeight: "calc(100vh - 230px)" }}
      >
        {tasks.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-[11px]" style={{ color: "var(--text-3)" }}>
              {emptyText}
            </p>
          </div>
        ) : (
          tasks.map((task) => (
            <KanbanCard
              key={task.id}
              task={task}
              urgency={getTaskUrgency(task) ?? "someday"}
              onEdit={onEdit}
            />
          ))
        )}
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

interface Props {
  grouped: GroupedTasks;
  completedTasks: Task[];
}

// ── Archive drawer ────────────────────────────────────────────────────────────

function ArchiveDrawer({ tasks, onClose }: { tasks: Task[]; onClose: () => void }) {
  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        style={{ backgroundColor: "rgba(15,23,48,0.35)", backdropFilter: "blur(2px)" }}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className="fixed right-0 top-0 bottom-0 z-50 flex flex-col"
        style={{
          width: "360px",
          backgroundColor: "var(--bg)",
          borderLeft: "1px solid var(--border)",
          boxShadow: "-8px 0 32px rgba(15,23,48,0.1)",
          animation: "kanban-in 0.25s ease both",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-5"
          style={{ borderBottom: "1px solid var(--border)" }}
        >
          <div>
            <h2 className="text-base font-bold" style={{ color: "var(--text)" }}>Archive</h2>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-3)" }}>
              {tasks.length} completed task{tasks.length !== 1 ? "s" : ""}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 transition-colors"
            style={{ color: "var(--text-3)" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "var(--surface-2)"; (e.currentTarget as HTMLElement).style.color = "var(--text)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "transparent"; (e.currentTarget as HTMLElement).style.color = "var(--text-3)"; }}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Task list */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2">
          {tasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-2 py-16">
              <Archive className="h-8 w-8" style={{ color: "var(--border-strong)" }} />
              <p className="text-sm" style={{ color: "var(--text-3)" }}>Nothing completed yet</p>
            </div>
          ) : (
            tasks.map((task) => <ArchiveCard key={task.id} task={task} />)
          )}
        </div>
      </div>
    </>
  );
}

function ArchiveCard({ task }: { task: Task }) {
  const [pending, startTransition] = useTransition();

  const impColor =
    task.importance === "high"   ? "var(--imp-high)"   :
    task.importance === "medium" ? "var(--imp-medium)" : "var(--imp-low)";

  return (
    <div
      className="relative rounded-xl overflow-hidden"
      style={{
        backgroundColor: "var(--surface-2)",
        border: "1px solid var(--border)",
        opacity: pending ? 0.5 : 1,
      }}
    >
      <div className="absolute inset-y-0 left-0 w-[3px]" style={{ backgroundColor: "var(--border)" }} />
      <div className="pl-4 pr-4 py-3">
        <div className="flex items-start justify-between gap-2">
          <p
            className="text-[13px] font-semibold leading-snug"
            style={{ color: "var(--text-3)", textDecoration: "line-through" }}
          >
            {task.title}
          </p>
          <button
            onClick={() => startTransition(() => toggleTask(task.id, false))}
            className="text-[10px] font-bold uppercase tracking-wide shrink-0 mt-0.5 transition-colors"
            style={{ color: "var(--text-3)" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--accent)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--text-3)"; }}
          >
            Restore
          </button>
        </div>
        <div className="flex items-center gap-2 mt-1.5">
          {task.category && (
            <span
              className="text-[10px] font-semibold rounded-full px-2 py-0.5"
              style={{ backgroundColor: "var(--surface-3)", color: "var(--text-3)" }}
            >
              {task.category}
            </span>
          )}
          <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: impColor, opacity: 0.5 }} />
          {task.completed_at && (
            <span className="text-[10px]" style={{ color: "var(--text-3)" }}>
              {new Date(task.completed_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function TaskList({ grouped, completedTasks }: Props) {
  const [creating, setCreating]         = useState(false);
  const [editingTask, setEditingTask]   = useState<Task | null>(null);
  const [archiveOpen, setArchiveOpen]   = useState(false);
  const [search, setSearch]             = useState("");

  // Global "n" shortcut handled by AppShortcuts in layout.

  const q = search.toLowerCase().trim();
  const filteredGrouped = q
    ? {
        overdue:  grouped.overdue.filter( (t) => t.title.toLowerCase().includes(q) || t.category?.toLowerCase().includes(q)),
        today:    grouped.today.filter(   (t) => t.title.toLowerCase().includes(q) || t.category?.toLowerCase().includes(q)),
        upcoming: grouped.upcoming.filter((t) => t.title.toLowerCase().includes(q) || t.category?.toLowerCase().includes(q)),
        someday:  grouped.someday.filter( (t) => t.title.toLowerCase().includes(q) || t.category?.toLowerCase().includes(q)),
      }
    : grouped;

  const totalActive   = Object.values(grouped).reduce((n, arr) => n + arr.length, 0);
  const overdueCount  = grouped.overdue.length;
  const todayCount    = grouped.today.length;
  const upcomingCount = grouped.upcoming.length;
  const somedayCount  = grouped.someday.length;

  return (
    <div className="flex flex-col gap-6 h-full">
      {/* Header */}
      <div
        className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"
        style={{ animation: "kanban-in 0.3s ease both" }}
      >
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight" style={{ color: "var(--text)" }}>
            Tasks
          </h1>
          <div className="flex items-center gap-3 mt-2 flex-wrap">
            {overdueCount > 0 && (
              <span className="text-xs font-semibold" style={{ color: "var(--imp-high)" }}>
                {overdueCount} overdue
              </span>
            )}
            {todayCount > 0 && (
              <span className="text-xs font-semibold" style={{ color: "var(--warning)" }}>
                {todayCount} today
              </span>
            )}
            {upcomingCount > 0 && (
              <span className="text-xs font-semibold" style={{ color: "var(--accent)" }}>
                {upcomingCount} upcoming
              </span>
            )}
            {somedayCount > 0 && (
              <span className="text-xs font-semibold" style={{ color: "var(--text-3)" }}>
                {somedayCount} someday
              </span>
            )}
            {totalActive === 0 && (
              <span className="text-xs" style={{ color: "var(--text-3)" }}>No active tasks</span>
            )}
            {completedTasks.length > 0 && (
              <>
                <span style={{ color: "var(--border-strong)" }}>·</span>
                <span className="text-xs" style={{ color: "var(--text-3)" }}>
                  {completedTasks.length} completed
                </span>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Search */}
          <div className="relative flex items-center flex-1 min-w-[160px]">
            <Search
              className="absolute left-3 h-3.5 w-3.5 pointer-events-none"
              style={{ color: "var(--text-3)" }}
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tasks…"
              className="w-full rounded-xl pl-8 pr-3 py-2 text-sm outline-none transition-all"
              style={{
                backgroundColor: "var(--surface)",
                border: "1px solid var(--border)",
                color: "var(--text)",
              }}
              onFocus={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--accent)"; }}
              onBlur={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border)"; }}
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-2.5 rounded p-0.5 transition-colors"
                style={{ color: "var(--text-3)" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--text)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--text-3)"; }}
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>

          {/* Archive button */}
          <button
            onClick={() => setArchiveOpen(true)}
            className="relative flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-150"
            style={{
              backgroundColor: "var(--surface)",
              border: "1px solid var(--border)",
              color: "var(--text-2)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = "var(--border-strong)";
              (e.currentTarget as HTMLElement).style.color = "var(--text)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
              (e.currentTarget as HTMLElement).style.color = "var(--text-2)";
            }}
          >
            <Archive className="h-4 w-4" />
            {completedTasks.length > 0 && (
              <span
                className="text-[10px] font-bold tabular-nums px-1.5 py-0.5 rounded-full"
                style={{ backgroundColor: "var(--surface-3)", color: "var(--text-3)" }}
              >
                {completedTasks.length}
              </span>
            )}
          </button>

          {/* New Task button */}
          <button
            onClick={() => setCreating(true)}
            className="sovereign-gradient flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white active:scale-95"
            style={{
              boxShadow: "0 4px 14px rgba(26,64,194,0.3)",
              transition: "box-shadow 0.15s ease, transform 0.1s ease",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 20px rgba(26,64,194,0.4)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 14px rgba(26,64,194,0.3)"; }}
          >
            <Plus className="h-4 w-4" />
            New Task
          </button>
        </div>
      </div>

      {/* Board */}
      <div className="flex gap-3.5 overflow-x-auto pb-4 flex-1">
        {COLUMNS.map(({ key, label, accent, emptyText }, i) => (
          <KanbanColumn
            key={key}
            label={label}
            accent={accent}
            tasks={filteredGrouped[key]}
            emptyText={q ? "No matches" : emptyText}
            urgency={key}
            index={i}
            onAdd={() => setCreating(true)}
            onEdit={setEditingTask}
          />
        ))}
      </div>

      {creating    && <TaskForm onClose={() => setCreating(false)} />}
      {editingTask && <TaskForm task={editingTask} onClose={() => setEditingTask(null)} />}
      {archiveOpen && <ArchiveDrawer tasks={completedTasks} onClose={() => setArchiveOpen(false)} />}
    </div>
  );
}
