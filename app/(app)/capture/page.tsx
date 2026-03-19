"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createTask } from "@/app/actions/tasks";
import type { Category, Importance } from "@/types";

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
  {
    value: "high",
    label: "High Importance",
    description: "High impact, non-negotiable",
    color: "var(--imp-high)",
  },
  {
    value: "medium",
    label: "Medium Importance",
    description: "Strategic progression, high value",
    color: "var(--imp-medium)",
  },
  {
    value: "low",
    label: "Low Importance",
    description: "Routine operations, low friction",
    color: "var(--imp-low)",
  },
];

export default function CapturePage() {
  const router = useRouter();
  const [title, setTitle]           = useState("");
  const [category, setCategory]     = useState<Category>("personal");
  const [importance, setImportance] = useState<Importance>("medium");
  const [dueAt, setDueAt]           = useState("");
  const [error, setError]           = useState<string | null>(null);
  const [pending, startTransition]  = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) { setError("Title is required."); return; }
    setError(null);
    startTransition(async () => {
      try {
        await createTask({
          title: title.trim(),
          category,
          importance,
          due_at: dueAt ? new Date(dueAt).toISOString() : null,
        });
        router.push("/dashboard");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong.");
      }
    });
  }

  return (
    <div className="min-h-full" style={{ backgroundColor: "var(--bg)" }}>
      <div className="max-w-4xl mx-auto px-8 py-12 md:py-20">

        {/* Header */}
        <div className="mb-12">
          <h1
            className="text-4xl md:text-5xl font-extrabold tracking-tight mb-2 font-headline"
            style={{ color: "var(--text)" }}
          >
            Ewonn, define your next objective.
          </h1>
          <p className="text-lg font-medium" style={{ color: "var(--text-3)" }}>
            Precision in planning is the foundation of execution.
          </p>
        </div>

        {error && (
          <p
            className="mb-8 text-sm rounded-xl px-4 py-3"
            style={{
              color: "var(--danger)",
              backgroundColor: "var(--danger-subtle)",
              border: "1px solid var(--danger-border)",
            }}
          >
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-12 gap-8">

            {/* ── Title input — full width ─────────────────────── */}
            <div
              className="col-span-12 rounded-xl p-8 transition-all duration-300"
              style={{
                backgroundColor: "var(--surface)",
                boxShadow: "0px 12px 32px rgba(15,23,48,0.04)",
              }}
            >
              <label
                className="block text-[10px] font-bold uppercase tracking-widest mb-4"
                style={{ color: "var(--text-3)" }}
              >
                Objective Title
              </label>
              <input
                autoFocus
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What requires your attention?"
                className="w-full text-3xl md:text-4xl font-bold font-headline bg-transparent outline-none pb-4 transition-all"
                style={{
                  color: "var(--text)",
                  borderBottom: "2px solid var(--surface-3)",
                }}
                onFocus={(e) => { (e.currentTarget as HTMLElement).style.borderBottomColor = "var(--accent)"; }}
                onBlur={(e) => { (e.currentTarget as HTMLElement).style.borderBottomColor = "var(--surface-3)"; }}
              />
            </div>

            {/* ── Date + Category ──────────────────────────────── */}
            <div
              className="col-span-12 md:col-span-5 rounded-xl p-8 flex flex-col gap-8"
              style={{ backgroundColor: "var(--surface-2)", border: "1px solid var(--border)" }}
            >
              {/* Date */}
              <div>
                <label
                  className="block text-[10px] font-bold uppercase tracking-widest mb-4"
                  style={{ color: "var(--text-3)" }}
                >
                  Strategic Timeline
                </label>
                <div
                  className="flex items-center gap-3 rounded-lg p-4 cursor-pointer transition-colors"
                  style={{ backgroundColor: "var(--surface)" }}
                >
                  <svg className="h-5 w-5 shrink-0" style={{ color: "var(--accent)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
                  </svg>
                  <input
                    type="datetime-local"
                    value={dueAt}
                    onChange={(e) => setDueAt(e.target.value)}
                    className="flex-1 bg-transparent outline-none text-sm font-semibold"
                    style={{ color: dueAt ? "var(--text)" : "var(--text-3)" }}
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <label
                  className="block text-[10px] font-bold uppercase tracking-widest mb-4"
                  style={{ color: "var(--text-3)" }}
                >
                  Primary Category
                </label>
                <div className="flex flex-wrap gap-2.5">
                  {CATEGORIES.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setCategory(c.value)}
                      className="px-4 py-2 rounded-full font-bold text-sm transition-all duration-200"
                      style={
                        category === c.value
                          ? {
                              backgroundColor: "var(--accent)",
                              color: "#fff",
                              boxShadow: "0 4px 12px rgba(26,64,194,0.2)",
                            }
                          : {
                              backgroundColor: "var(--surface)",
                              color: "var(--text)",
                            }
                      }
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Importance plinths ───────────────────────────── */}
            <div
              className="col-span-12 md:col-span-7 rounded-xl p-8"
              style={{ backgroundColor: "var(--surface-2)", border: "1px solid var(--border)" }}
            >
              <label
                className="block text-[10px] font-bold uppercase tracking-widest mb-6"
                style={{ color: "var(--text-3)" }}
              >
                Hierarchy of Importance
              </label>
              <div className="space-y-3">
                {IMPORTANCES.map((imp) => {
                  const selected = importance === imp.value;
                  return (
                    <button
                      key={imp.value}
                      type="button"
                      onClick={() => setImportance(imp.value)}
                      className="relative w-full flex items-center justify-between p-5 rounded-lg overflow-hidden transition-all duration-200 hover:translate-x-0.5 cursor-pointer"
                      style={{
                        backgroundColor: selected
                          ? imp.value === "high"
                            ? "rgba(163, 0, 14, 0.06)"
                            : imp.value === "medium"
                            ? "rgba(88, 96, 125, 0.08)"
                            : "rgba(196, 197, 214, 0.15)"
                          : "var(--surface)",
                        border: `1px solid ${selected ? imp.color : "var(--border)"}`,
                      }}
                    >
                      {/* Left color strip */}
                      <div
                        className="absolute left-0 top-0 bottom-0 w-1 rounded-l-lg"
                        style={{ backgroundColor: imp.color }}
                      />
                      <div className="ml-3 text-left">
                        <span className="font-bold block" style={{ color: "var(--text)" }}>
                          {imp.label}
                        </span>
                        <span className="text-xs" style={{ color: "var(--text-3)" }}>
                          {imp.description}
                        </span>
                      </div>
                      {/* Selection indicator */}
                      <div
                        className="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors duration-200"
                        style={{
                          borderColor: selected ? imp.color : "var(--border-strong)",
                          backgroundColor: selected ? imp.color : "transparent",
                        }}
                      >
                        {selected && (
                          <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 12 12" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2 6l3 3 5-5" />
                          </svg>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ── Actions ─────────────────────────────────────── */}
            <div className="col-span-12 flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => router.back()}
                className="rounded-xl border px-6 py-3 text-sm font-medium transition-colors"
                style={{
                  borderColor: "var(--border-strong)",
                  color: "var(--text-2)",
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "var(--surface-2)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = ""; }}
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={pending}
                className="sovereign-gradient flex items-center gap-3 rounded-xl px-10 py-5 font-extrabold text-lg text-white font-headline transition-all duration-300 active:scale-95 disabled:opacity-50"
                style={{ boxShadow: "0px 12px 24px rgba(26,64,194,0.3)" }}
                onMouseEnter={(e) => {
                  if (!pending) (e.currentTarget as HTMLElement).style.boxShadow = "0px 16px 32px rgba(26,64,194,0.4)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.boxShadow = "0px 12px 24px rgba(26,64,194,0.3)";
                }}
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 3l14 9-14 9V3z" />
                </svg>
                {pending ? "Committing…" : "Commit to Ledger"}
              </button>
            </div>

          </div>
        </form>
      </div>
    </div>
  );
}
