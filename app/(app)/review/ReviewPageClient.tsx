"use client";

import { useState } from "react";
import { upsertReview } from "@/app/actions/review";
import type { DailyReview, Task } from "@/types";
import type { DailyCompletion, Grade } from "@/lib/stats";

const GRADE_LABEL: Record<Grade, string> = {
  "A+": "Excellent",
  "A":  "Strong",
  "B+": "Good",
  "B":  "Solid",
  "C":  "Fair",
  "D":  "Needs work",
};

function formatDate(ds: string) {
  return new Date(ds + "T12:00:00").toLocaleDateString(undefined, {
    weekday: "long", month: "long", day: "numeric",
  });
}

interface Props {
  today: string;
  firstName: string;
  existing: DailyReview | null;
  recentReviews: DailyReview[];
  candidateTasks: Task[];
  unfinishedTasks: Task[];
  completion: DailyCompletion;
  streak: number;
  grade: Grade;
}

// ── Task card (same plinth style as dashboard) ─────────────────────────────

function TaskCard({ task }: { task: Task }) {
  const isOverdue = task.due_at && new Date(task.due_at) < new Date();
  const stripColor =
    task.importance === "high"   ? "var(--imp-high)" :
    task.importance === "medium" ? "var(--imp-medium)" : "var(--imp-low)";
  const badgeLabel =
    task.importance === "high" ? "High Priority" :
    task.importance === "medium" ? "Medium Priority" : "Low Priority";

  const dueLabel = task.due_at
    ? new Date(task.due_at).toLocaleString(undefined, {
        month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
      })
    : null;

  return (
    <div
      className="group relative flex items-center gap-5 rounded-xl overflow-hidden transition-all duration-300"
      style={{
        backgroundColor: "var(--surface)",
        border: "1px solid var(--border)",
        boxShadow: "0 1px 4px rgba(15,23,48,0.04)",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = "0 6px 20px rgba(15,23,48,0.07)";
        (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.boxShadow = "0 1px 4px rgba(15,23,48,0.04)";
        (e.currentTarget as HTMLElement).style.transform = "";
      }}
    >
      <div className="self-stretch w-[4px] shrink-0" style={{ backgroundColor: stripColor }} />
      <div className="flex-1 min-w-0 py-4 pr-5">
        <div className="flex items-center gap-2.5 mb-1">
          <span
            className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-sm text-white"
            style={{ backgroundColor: stripColor }}
          >
            {badgeLabel}
          </span>
          {task.category && (
            <span className="text-xs font-semibold opacity-50" style={{ color: "var(--text-2)" }}>
              {task.category}
            </span>
          )}
        </div>
        <h4 className="text-base font-bold" style={{ color: "var(--text)" }}>
          {task.title}
        </h4>
        {dueLabel && (
          <span
            className="text-xs font-medium mt-1 block"
            style={{ color: isOverdue ? "var(--imp-high)" : "var(--text-3)" }}
          >
            {isOverdue && "Overdue · "}{dueLabel}
          </span>
        )}
      </div>
      <div
        className="w-8 h-8 rounded-full border-2 flex items-center justify-center mr-4 shrink-0 opacity-0 group-hover:opacity-100 transition-all"
        style={{ borderColor: "var(--border-strong)" }}
      >
        <svg className="h-3.5 w-3.5" style={{ color: "var(--accent)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>
    </div>
  );
}

export default function ReviewPageClient({
  today,
  firstName,
  existing,
  recentReviews,
  candidateTasks,
  unfinishedTasks,
  completion,
  streak,
  grade,
}: Props) {
  const [saved, setSaved] = useState<DailyReview | null>(existing);
  const [summary, setSummary] = useState(existing?.summary ?? "");
  const [top3, setTop3] = useState<string[]>(existing?.top_3_for_tomorrow ?? []);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  function toggleTask(title: string) {
    setTop3((prev) =>
      prev.includes(title)
        ? prev.filter((t) => t !== title)
        : prev.length < 3 ? [...prev, title] : prev
    );
  }

  async function handleSeal(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      const review = await upsertReview(today, summary.trim(), top3);
      setSaved(review);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="space-y-2">
        <p className="text-xs font-bold tracking-[0.2em] uppercase" style={{ color: "var(--text-3)" }}>
          Daily Review · {formatDate(today)}
        </p>
        <h1 className="font-headline text-5xl font-extrabold tracking-tight" style={{ color: "var(--text)" }}>
          {completion.pct === 100 ? `Nice work, ${firstName}.` : `Hey, ${firstName}.`}
        </h1>
        <p className="text-lg" style={{ color: "var(--text-2)" }}>
          {completion.done === 0
            ? "No tasks completed yet today."
            : <>You&apos;ve completed <span className="font-bold" style={{ color: "var(--accent)" }}>{completion.done} of {completion.total} tasks</span> today.</>
          }
        </p>
      </div>

      {/* ── Stats bento ─────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-6">
        {/* Completion Rate */}
        <div
          className="rounded-xl p-8 flex flex-col justify-between relative overflow-hidden group"
          style={{ backgroundColor: "var(--surface-2)", border: "1px solid var(--border)" }}
        >
          <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "var(--text-3)" }}>
              Completion Rate
            </p>
            <h3 className="text-6xl font-extrabold font-headline" style={{ color: "var(--accent)" }}>
              {completion.pct}%
            </h3>
          </div>
          <div className="flex items-center gap-1 text-sm font-bold mt-6" style={{ color: "var(--accent)" }}>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            <span>{completion.done} / {completion.total} tasks</span>
          </div>
        </div>

        {/* Grade */}
        <div
          className="sovereign-gradient rounded-xl p-8 flex flex-col justify-between relative overflow-hidden text-white"
          style={{ boxShadow: "0 8px 24px rgba(26,64,194,0.25)" }}
        >
          <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-4 opacity-80">
              Today&apos;s Score
            </p>
            <h3 className="text-6xl font-extrabold font-headline">{grade}</h3>
          </div>
          <p className="text-sm opacity-80">{GRADE_LABEL[grade]} today.</p>
        </div>

        {/* Streak */}
        <div
          className="rounded-xl p-8 flex flex-col justify-between"
          style={{ backgroundColor: "var(--surface-2)", border: "1px solid var(--border)" }}
        >
          <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "var(--text-3)" }}>
              Habit Streak
            </p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-6xl font-extrabold font-headline" style={{ color: "var(--text)" }}>
                {streak}
              </h3>
              <span className="text-xl font-bold" style={{ color: "var(--text-3)" }}>
                {streak === 1 ? "Day" : "Days"}
              </span>
            </div>
          </div>
          {/* Mini streak squares */}
          <div className="flex gap-1.5 mt-6 flex-wrap">
            {Array.from({ length: Math.min(streak, 10) }, (_, i) => (
              <div
                key={i}
                className="w-6 h-6 rounded-sm"
                style={{ backgroundColor: i < streak ? "var(--accent)" : "var(--surface-3)" }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ── Main content row ────────────────────────────────────── */}
      <form onSubmit={handleSeal}>
        {error && (
          <p
            className="mb-6 text-sm rounded-xl px-4 py-3"
            style={{ color: "var(--danger)", backgroundColor: "var(--danger-subtle)", border: "1px solid var(--danger-border)" }}
          >
            {error}
          </p>
        )}

        <div className="grid grid-cols-5 gap-8">
          {/* Unfinished Blueprints — 3/5 */}
          <div className="col-span-3 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-headline text-2xl font-bold" style={{ color: "var(--text)" }}>
                Unfinished Tasks
              </h2>
              {unfinishedTasks.length > 0 && (
                <span
                  className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter"
                  style={{ backgroundColor: "var(--surface-4)", color: "var(--text-2)" }}
                >
                  {unfinishedTasks.length} Remaining
                </span>
              )}
            </div>

            {unfinishedTasks.length === 0 ? (
              <div
                className="rounded-xl border-2 border-dashed p-10 text-center"
                style={{ borderColor: "var(--border)" }}
              >
                <p className="text-sm" style={{ color: "var(--text-3)" }}>
                  No unfinished tasks. Excellent work.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {unfinishedTasks.slice(0, 8).map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </div>
            )}
          </div>

          {/* Reflection — 2/5 */}
          <div className="col-span-2 space-y-6">
            <div className="flex items-center gap-2">
              <svg className="h-5 w-5" style={{ color: "var(--accent)" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <h2 className="font-headline text-2xl font-bold" style={{ color: "var(--text)" }}>
                Reflection
              </h2>
            </div>

            <div
              className="rounded-xl p-6 space-y-5"
              style={{ backgroundColor: "var(--surface-2)", border: "1px solid var(--border)" }}
            >
              {/* Summary */}
              <div>
                <label
                  className="text-[10px] font-black uppercase tracking-widest mb-2 block"
                  style={{ color: "var(--text-3)" }}
                >
                  How did today go?
                </label>
                <textarea
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  rows={5}
                  placeholder="What went well? What do you want to carry into tomorrow?"
                  className="w-full rounded-lg p-4 text-sm leading-relaxed resize-none outline-none transition-all"
                  style={{
                    backgroundColor: "var(--surface)",
                    color: "var(--text)",
                    border: "1px solid var(--border)",
                  }}
                  onFocus={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--accent)"; }}
                  onBlur={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border)"; }}
                />
              </div>

              {/* Top 3 for tomorrow */}
              {candidateTasks.length > 0 && (
                <div className="space-y-3">
                  <label
                    className="text-[10px] font-black uppercase tracking-widest block"
                    style={{ color: "var(--text-3)" }}
                  >
                    Top 3 for Tomorrow
                    <span className="ml-2 normal-case font-medium tracking-normal">
                      ({top3.length} / 3)
                    </span>
                  </label>
                  <div className="space-y-2">
                    {candidateTasks.slice(0, 6).map((task) => {
                      const selected = top3.includes(task.title);
                      const disabled = !selected && top3.length >= 3;
                      return (
                        <button
                          key={task.id}
                          type="button"
                          disabled={disabled}
                          onClick={() => toggleTask(task.title)}
                          className="w-full flex items-center gap-3 rounded-lg p-3 text-left transition-all duration-200"
                          style={
                            selected
                              ? { backgroundColor: "var(--accent-subtle)", border: "1px solid var(--accent)" }
                              : disabled
                              ? { backgroundColor: "var(--surface)", border: "1px solid var(--border)", opacity: 0.4 }
                              : { backgroundColor: "var(--surface)", border: "1px solid var(--border)" }
                          }
                        >
                          <div
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ backgroundColor: selected ? "var(--accent)" : "var(--text-3)" }}
                          />
                          <span className="text-sm font-semibold truncate" style={{ color: "var(--text)" }}>
                            {task.title}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Seal button */}
              <button
                type="submit"
                disabled={pending}
                className="w-full sovereign-gradient text-white rounded-xl py-4 font-bold text-lg flex items-center justify-center gap-2.5 transition-all duration-200 active:scale-[0.98] disabled:opacity-50"
                style={{ boxShadow: "0 8px 20px rgba(26,64,194,0.25)", marginTop: "8px" }}
              >
                <span>{pending ? "Saving…" : saved ? "Update Review" : "Save Review"}</span>
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </button>

              {saved && (
                <p className="text-center text-xs" style={{ color: "var(--text-3)" }}>
                  ✓ Saved
                </p>
              )}
            </div>
          </div>
        </div>
      </form>

      {/* ── Past reviews ───────────────────────────────────────── */}
      {recentReviews.length > 0 && (
        <section className="space-y-4 pt-4">
          <h2 className="text-[11px] font-bold uppercase tracking-widest" style={{ color: "var(--text-3)" }}>
            Previous Logs
          </h2>
          {recentReviews.map((review) => (
            <div
              key={review.id}
              className="rounded-xl p-6 space-y-3"
              style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)" }}
            >
              <p className="text-xs font-medium" style={{ color: "var(--text-3)" }}>
                {formatDate(review.review_date)}
              </p>
              {review.summary && (
                <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: "var(--text-2)" }}>
                  {review.summary}
                </p>
              )}
              {review.top_3_for_tomorrow.length > 0 && (
                <ol className="space-y-1.5">
                  {review.top_3_for_tomorrow.map((title, i) => (
                    <li key={i} className="flex items-center gap-2.5 text-sm" style={{ color: "var(--text)" }}>
                      <span
                        className="h-4 w-4 rounded-full text-[10px] font-bold flex items-center justify-center shrink-0"
                        style={{ backgroundColor: "var(--accent-subtle)", color: "var(--accent)" }}
                      >
                        {i + 1}
                      </span>
                      {title}
                    </li>
                  ))}
                </ol>
              )}
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
