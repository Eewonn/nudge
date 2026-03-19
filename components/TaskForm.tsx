"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { X } from "lucide-react";
import { createTask, updateTask, type TaskInput } from "@/app/actions/tasks";
import type { Task, Category, Importance } from "@/types";

const CATEGORIES: { value: Category; label: string }[] = [
  { value: "work",      label: "Work" },
  { value: "personal",  label: "Personal" },
  { value: "academics", label: "Academics" },
  { value: "acm",       label: "ACM" },
  { value: "thesis",    label: "Thesis" },
  { value: "other",     label: "Other" },
];

const IMPORTANCES: { value: Importance; label: string; color: string }[] = [
  { value: "high",   label: "High",   color: "var(--imp-high)" },
  { value: "medium", label: "Medium", color: "var(--imp-medium)" },
  { value: "low",    label: "Low",    color: "var(--imp-low)" },
];

const FIELD_CLASS =
  "w-full rounded-xl border border-border bg-surface-2 px-3.5 py-2.5 text-sm text-text outline-none placeholder:text-text-3 focus:border-accent focus:ring-2 focus:ring-[var(--accent)]/15 transition-all";

const LABEL_CLASS = "block text-xs font-medium text-text-2 uppercase tracking-wider mb-1.5";

interface Props {
  task?: Task;
  onClose: () => void;
}

export default function TaskForm({ task, onClose }: Props) {
  const [title, setTitle]       = useState(task?.title ?? "");
  const [notes, setNotes]       = useState(task?.notes ?? "");
  const [category, setCategory] = useState<Category>(task?.category ?? "personal");
  const [importance, setImportance] = useState<Importance>(task?.importance ?? "medium");
  const [dueAt, setDueAt]       = useState(
    task?.due_at ? new Date(task.due_at).toISOString().slice(0, 16) : ""
  );
  const [error, setError]           = useState<string | null>(null);
  const [pending, startTransition]  = useTransition();
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => { titleRef.current?.focus(); }, []);
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  function buildInput(): TaskInput {
    return {
      title: title.trim(),
      notes: notes.trim() || undefined,
      category,
      importance,
      due_at: dueAt ? new Date(dueAt).toISOString() : null,
    };
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) { setError("Title is required."); return; }
    setError(null);
    startTransition(async () => {
      try {
        if (task) await updateTask(task.id, buildInput());
        else await createTask(buildInput());
        onClose();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong.");
      }
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-lg rounded-2xl bg-surface border border-border shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-sm font-semibold text-text">
            {task ? "Edit task" : "New task"}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-text-3 hover:bg-surface-2 hover:text-text transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <p className="text-sm text-danger bg-danger-subtle border border-[var(--danger-border)] rounded-xl px-3.5 py-2.5">
              {error}
            </p>
          )}

          <div>
            <label className={LABEL_CLASS}>Title</label>
            <input
              ref={titleRef}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What needs to be done?"
              className={FIELD_CLASS}
            />
          </div>

          <div>
            <label className={LABEL_CLASS}>
              Notes <span className="text-text-3 normal-case tracking-normal font-normal">— optional</span>
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Any extra context…"
              className={`${FIELD_CLASS} resize-none`}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={LABEL_CLASS}>Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Category)}
                className={FIELD_CLASS}
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className={LABEL_CLASS}>Importance</label>
              <div className="flex gap-2">
                {IMPORTANCES.map((imp) => (
                  <button
                    key={imp.value}
                    type="button"
                    onClick={() => setImportance(imp.value)}
                    className="flex-1 rounded-xl border py-2 text-xs font-medium transition-all"
                    style={
                      importance === imp.value
                        ? { borderColor: imp.color, backgroundColor: imp.color + "18", color: imp.color }
                        : { borderColor: "var(--border)", color: "var(--text-3)" }
                    }
                  >
                    {imp.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className={LABEL_CLASS}>
              Due date <span className="text-text-3 normal-case tracking-normal font-normal">— optional</span>
            </label>
            <input
              type="datetime-local"
              value={dueAt}
              onChange={(e) => setDueAt(e.target.value)}
              className={FIELD_CLASS}
            />
          </div>

          <div className="flex justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-text-2 hover:bg-surface-2 hover:text-text transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={pending}
              className="rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-white hover:bg-accent-hover disabled:opacity-50 transition-colors"
            >
              {pending ? "Saving…" : task ? "Save changes" : "Create task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
