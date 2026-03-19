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

const IMPORTANCES: {
  value: Importance;
  label: string;
  description: string;
  color: string;
}[] = [
  { value: "high",   label: "High Priority",   description: "Must do — blocks everything else",  color: "var(--imp-high)" },
  { value: "medium", label: "Medium Priority", description: "Important, but not on fire",         color: "var(--imp-medium)" },
  { value: "low",    label: "Low Priority",    description: "Nice to do when I have time",        color: "var(--imp-low)" },
];

interface Props {
  task?: Task;
  onClose: () => void;
}

export default function TaskForm({ task, onClose }: Props) {
  const [title, setTitle]           = useState(task?.title ?? "");
  const [notes, setNotes]           = useState(task?.notes ?? "");
  const [category, setCategory]     = useState<Category>(task?.category ?? "personal");
  const [importance, setImportance] = useState<Importance>(task?.importance ?? "medium");
  const [dueAt, setDueAt]           = useState(
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

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) { setError("Title is required."); return; }
    setError(null);
    startTransition(async () => {
      try {
        const input: TaskInput = {
          title: title.trim(),
          notes: notes.trim() || undefined,
          category,
          importance,
          due_at: dueAt ? new Date(dueAt).toISOString() : null,
        };
        if (task) await updateTask(task.id, input);
        else await createTask(input);
        onClose();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong.");
      }
    });
  }

  const isEdit = !!task;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-6"
      style={{ backgroundColor: "rgba(15, 23, 48, 0.55)", backdropFilter: "blur(6px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden"
        style={{
          backgroundColor: "var(--bg)",
          boxShadow: "0 24px 64px rgba(15, 23, 48, 0.18)",
        }}
      >
        {/* Modal header */}
        <div
          className="flex items-center justify-between px-8 pt-7 pb-0"
        >
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "var(--text-3)" }}>
              {isEdit ? "Edit Task" : "New Task"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 transition-colors"
            style={{ color: "var(--text-3)" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "var(--surface-2)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "transparent"; }}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-8 pt-5 pb-8 space-y-7">
          {error && (
            <p
              className="text-sm rounded-xl px-4 py-3"
              style={{ color: "var(--danger)", backgroundColor: "var(--danger-subtle)", border: "1px solid var(--danger-border)" }}
            >
              {error}
            </p>
          )}

          {/* Title — underline input */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: "var(--text-3)" }}>
              Task
            </label>
            <input
              ref={titleRef}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What do you need to get done?"
              className="w-full text-2xl font-bold bg-transparent outline-none pb-3 transition-all"
              style={{
                color: "var(--text)",
                borderBottom: "2px solid var(--surface-3)",
              }}
              onFocus={(e) => { (e.currentTarget as HTMLElement).style.borderBottomColor = "var(--accent)"; }}
              onBlur={(e) => { (e.currentTarget as HTMLElement).style.borderBottomColor = "var(--surface-3)"; }}
            />
          </div>

          {/* Notes — compact optional */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: "var(--text-3)" }}>
              Notes <span className="normal-case font-normal tracking-normal opacity-60">— optional</span>
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Any context or detail…"
              className="w-full rounded-lg px-4 py-2.5 text-sm leading-relaxed resize-none outline-none transition-all"
              style={{
                backgroundColor: "var(--surface-2)",
                color: "var(--text)",
                border: "1px solid var(--border)",
              }}
              onFocus={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--accent)"; }}
              onBlur={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border)"; }}
            />
          </div>

          {/* Date + Category row */}
          <div className="grid grid-cols-2 gap-6">
            {/* Date */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: "var(--text-3)" }}>
                Due Date
              </label>
              <div
                className="flex items-center gap-2.5 rounded-lg px-4 py-2.5 transition-colors"
                style={{ backgroundColor: "var(--surface-2)", border: "1px solid var(--border)" }}
              >
                <svg className="h-4 w-4 shrink-0" style={{ color: "var(--accent)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
                </svg>
                <input
                  type="datetime-local"
                  value={dueAt}
                  onChange={(e) => setDueAt(e.target.value)}
                  className="flex-1 bg-transparent outline-none text-sm font-medium"
                  style={{ color: dueAt ? "var(--text)" : "var(--text-3)" }}
                />
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: "var(--text-3)" }}>
                Category
              </label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setCategory(c.value)}
                    className="px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-200"
                    style={
                      category === c.value
                        ? { backgroundColor: "var(--accent)", color: "#fff", boxShadow: "0 2px 8px rgba(26,64,194,0.2)" }
                        : { backgroundColor: "var(--surface-2)", color: "var(--text)" }
                    }
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Importance plinths */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: "var(--text-3)" }}>
              Priority
            </label>
            <div className="space-y-2">
              {IMPORTANCES.map((imp) => {
                const selected = importance === imp.value;
                return (
                  <button
                    key={imp.value}
                    type="button"
                    onClick={() => setImportance(imp.value)}
                    className="relative w-full flex items-center justify-between px-5 py-3.5 rounded-lg overflow-hidden transition-all duration-200 hover:translate-x-0.5"
                    style={{
                      backgroundColor: selected
                        ? imp.value === "high"   ? "rgba(163,0,14,0.06)"
                        : imp.value === "medium" ? "rgba(88,96,125,0.08)"
                        : "rgba(196,197,214,0.15)"
                        : "var(--surface-2)",
                      border: `1px solid ${selected ? imp.color : "var(--border)"}`,
                    }}
                  >
                    {/* Left strip */}
                    <div
                      className="absolute left-0 top-0 bottom-0 w-1 rounded-l-lg"
                      style={{ backgroundColor: imp.color }}
                    />
                    <div className="ml-3 text-left">
                      <span className="font-bold text-sm block" style={{ color: "var(--text)" }}>
                        {imp.label}
                      </span>
                      <span className="text-xs" style={{ color: "var(--text-3)" }}>
                        {imp.description}
                      </span>
                    </div>
                    {/* Radio dot */}
                    <div
                      className="w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-200"
                      style={{
                        borderColor: selected ? imp.color : "var(--border-strong)",
                        backgroundColor: selected ? imp.color : "transparent",
                      }}
                    >
                      {selected && (
                        <svg className="w-2 h-2 text-white" fill="none" viewBox="0 0 12 12" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2 6l3 3 5-5" />
                        </svg>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border px-5 py-2.5 text-sm font-medium transition-colors"
              style={{ borderColor: "var(--border-strong)", color: "var(--text-2)" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "var(--surface-2)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "transparent"; }}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={pending}
              className="sovereign-gradient flex items-center gap-2.5 rounded-xl px-7 py-3 font-extrabold text-base text-white transition-all duration-300 active:scale-95 disabled:opacity-50"
              style={{ boxShadow: "0px 8px 20px rgba(26,64,194,0.3)" }}
              onMouseEnter={(e) => {
                if (!pending) (e.currentTarget as HTMLElement).style.boxShadow = "0px 12px 28px rgba(26,64,194,0.4)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.boxShadow = "0px 8px 20px rgba(26,64,194,0.3)";
              }}
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 3l14 9-14 9V3z" />
              </svg>
              {pending ? "Saving…" : isEdit ? "Save Changes" : "Add Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
