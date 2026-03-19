"use client";

import { useState, useTransition } from "react";
import { Check } from "lucide-react";
import { upsertReview } from "@/app/actions/review";
import type { DailyReview, Task } from "@/types";

interface Props {
  today: string; // YYYY-MM-DD
  existing: DailyReview | null;
  candidateTasks: Task[]; // today + upcoming tasks to pick top-3 from
  onSaved: (review: DailyReview) => void;
}

export default function ReviewForm({ today, existing, candidateTasks, onSaved }: Props) {
  const [summary, setSummary] = useState(existing?.summary ?? "");
  const [top3, setTop3] = useState<string[]>(existing?.top_3_for_tomorrow ?? []);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function toggleTask(title: string) {
    setTop3((prev) =>
      prev.includes(title)
        ? prev.filter((t) => t !== title)
        : prev.length < 3
        ? [...prev, title]
        : prev
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      try {
        const review = await upsertReview(today, summary.trim(), top3);
        onSaved(review);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong.");
      }
    });
  }

  const saved = !!existing;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <p className="text-sm text-danger bg-danger-subtle border border-[var(--danger-border)] rounded-xl px-3.5 py-2.5">
          {error}
        </p>
      )}

      {/* Summary */}
      <div>
        <label className="block text-xs font-medium text-text-2 uppercase tracking-wider mb-1.5">
          How did today go?
        </label>
        <textarea
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          rows={4}
          placeholder="Reflect on today — what got done, what got in the way, how you're feeling…"
          className="w-full rounded-xl border border-border bg-surface-2 px-3.5 py-2.5 text-sm text-text outline-none placeholder:text-text-3 focus:border-accent focus:ring-2 focus:ring-[var(--accent)]/15 transition-all resize-none"
        />
      </div>

      {/* Top 3 for tomorrow */}
      <div>
        <div className="flex items-baseline justify-between mb-2">
          <label className="block text-xs font-medium text-text-2 uppercase tracking-wider">
            Top 3 for tomorrow
          </label>
          <span className="text-[11px] text-text-3">{top3.length} / 3 selected</span>
        </div>

        {candidateTasks.length === 0 ? (
          <p className="text-xs text-text-3 italic">No upcoming tasks to pick from.</p>
        ) : (
          <div className="space-y-1.5">
            {candidateTasks.map((task) => {
              const selected = top3.includes(task.title);
              const disabled = !selected && top3.length >= 3;
              return (
                <button
                  key={task.id}
                  type="button"
                  disabled={disabled}
                  onClick={() => toggleTask(task.title)}
                  className="w-full flex items-center gap-3 rounded-xl border px-3.5 py-2.5 text-left transition-all"
                  style={
                    selected
                      ? { borderColor: "var(--accent)", backgroundColor: "var(--accent-subtle)" }
                      : disabled
                      ? { borderColor: "var(--border)", opacity: 0.4 }
                      : { borderColor: "var(--border)", backgroundColor: "var(--surface-2)" }
                  }
                >
                  <div
                    className="h-4 w-4 rounded-md border shrink-0 flex items-center justify-center transition-all"
                    style={
                      selected
                        ? { borderColor: "var(--accent)", backgroundColor: "var(--accent)" }
                        : { borderColor: "var(--border-strong)" }
                    }
                  >
                    {selected && <Check className="h-2.5 w-2.5 text-white" />}
                  </div>
                  <span className="text-sm text-text truncate">{task.title}</span>
                  {task.due_at && (
                    <span className="ml-auto text-[11px] text-text-3 shrink-0">
                      {new Date(task.due_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Manual entries if task not in list */}
        {top3.filter((t) => !candidateTasks.some((c) => c.title === t)).map((title, i) => (
          <div key={i} className="flex items-center gap-3 rounded-xl border border-accent bg-accent-subtle px-3.5 py-2.5 mt-1.5">
            <div className="h-4 w-4 rounded-md border border-accent bg-accent shrink-0 flex items-center justify-center">
              <Check className="h-2.5 w-2.5 text-white" />
            </div>
            <span className="text-sm text-text truncate flex-1">{title}</span>
            <button
              type="button"
              onClick={() => setTop3((p) => p.filter((t) => t !== title))}
              className="text-[11px] text-text-3 hover:text-danger transition-colors"
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-white hover:bg-accent-hover disabled:opacity-50 transition-colors"
      >
        {pending ? "Saving…" : saved ? "Update review" : "Save review"}
      </button>
    </form>
  );
}
