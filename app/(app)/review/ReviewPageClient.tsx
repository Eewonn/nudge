"use client";

import { useState, useTransition } from "react";
import { ChevronLeft, ChevronRight, Mic, MicOff, Sparkles } from "lucide-react";
import { upsertReview, getReviewByDate } from "@/app/actions/review";
import { useSpeechInput } from "@/hooks/useSpeechInput";
import { generateWeeklyReview } from "@/app/actions/ai";
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

// ── Compact unfinished task row ─────────────────────────────────────────────

function CompactTaskRow({ task }: { task: Task }) {
  const isOverdue = task.due_at && new Date(task.due_at) < new Date();
  const stripColor =
    task.importance === "high"   ? "var(--imp-high)" :
    task.importance === "medium" ? "var(--imp-medium)" : "var(--imp-low)";

  const dueLabel = task.due_at
    ? new Date(task.due_at).toLocaleString(undefined, {
        month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
      })
    : null;

  return (
    <div
      className="flex items-center gap-3 rounded-lg overflow-hidden py-2.5 pr-3"
      style={{
        backgroundColor: "var(--surface)",
        border: "1px solid var(--border)",
      }}
    >
      <div className="self-stretch w-[3px] shrink-0" style={{ backgroundColor: stripColor }} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate" style={{ color: "var(--text)" }}>
          {task.title}
        </p>
        {dueLabel && (
          <p
            className="text-xs mt-0.5"
            style={{ color: isOverdue ? "var(--imp-high)" : "var(--text-3)" }}
          >
            {isOverdue && "Overdue · "}{dueLabel}
          </p>
        )}
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
  const [saved, setSaved]       = useState<DailyReview | null>(existing);
  const [summary, setSummary]   = useState(existing?.summary ?? "");
  const [top3, setTop3]         = useState<string[]>(existing?.top_3_for_tomorrow ?? []);
  const [error, setError]       = useState<string | null>(null);
  const [pending, setPending]   = useState(false);

  // Date navigation
  const [viewDate, setViewDate]           = useState(today);
  const [viewEntry, setViewEntry]         = useState<DailyReview | null>(null);
  const [navPending, startNavTransition]  = useTransition();
  const isToday = viewDate === today;

  // Speech-to-text
  const speech = useSpeechInput();

  // Auto-generate
  const [autoGenPending, startAutoGen] = useTransition();
  const [autoGenError, setAutoGenError] = useState<string | null>(null);

  function handleAutoGenerate() {
    setAutoGenError(null);
    startAutoGen(async () => {
      try {
        const text = await generateWeeklyReview();
        if (text) setSummary(text);
      } catch {
        setAutoGenError("Generation failed. Try again.");
      }
    });
  }

  function handleMic() {
    if (speech.listening) { speech.stop(); return; }
    speech.start((text) => {
      setSummary((prev) => prev ? prev + " " + text : text);
    });
  }

  function shiftDay(delta: number) {
    const d = new Date(viewDate + "T12:00:00");
    d.setDate(d.getDate() + delta);
    const next = d.toISOString().slice(0, 10);
    if (next > today) return; // can't go into future
    setViewDate(next);
    if (next === today) {
      setViewEntry(null);
    } else {
      startNavTransition(async () => {
        const entry = await getReviewByDate(next);
        setViewEntry(entry);
      });
    }
  }

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
    <div className="p-8 max-w-7xl mx-auto space-y-10">

      {/* ── Header ──────────────────────────────────────────────────── */}
      <div className="space-y-3">
        <div className="flex items-center gap-4">
          <h1 className="font-headline text-5xl font-extrabold tracking-tight flex-1" style={{ color: "var(--text)" }}>
            {formatDate(viewDate)}
          </h1>
          {/* Date navigator */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => shiftDay(-1)}
              disabled={navPending}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors disabled:opacity-40"
              style={{ color: "var(--text-3)" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "var(--surface-2)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "transparent"; }}
              title="Previous day"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            {!isToday && (
              <button
                onClick={() => shiftDay(1)}
                disabled={navPending}
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors disabled:opacity-40"
                style={{ color: "var(--text-3)" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "var(--surface-2)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "transparent"; }}
                title="Next day"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            )}
            {!isToday && (
              <button
                onClick={() => { setViewDate(today); setViewEntry(null); }}
                className="ml-1 text-xs font-semibold px-2.5 py-1 rounded-lg transition-colors"
                style={{ color: "var(--accent)", backgroundColor: "var(--accent-subtle)" }}
              >
                Today
              </button>
            )}
          </div>
        </div>
        <p className="text-xl font-medium" style={{ color: "var(--text-2)" }}>
          {isToday
            ? (completion.pct === 100 ? `Nice work today, ${firstName}.` : `Hey, ${firstName}.`)
            : "Past journal entry"}
        </p>
        {/* Inline stat pills — only for today */}
        {isToday && (
          <div className="flex items-center gap-2 flex-wrap pt-1">
            <span className="px-3 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: "var(--surface-2)", color: "var(--text-2)", border: "1px solid var(--border)" }}>
              {completion.done} of {completion.total} tasks done
            </span>
            {streak > 0 && (
              <span className="px-3 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: "var(--surface-2)", color: "var(--text-2)", border: "1px solid var(--border)" }}>
                Streak {streak}d
              </span>
            )}
            <span className="px-3 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: "var(--surface-2)", color: "var(--text-2)", border: "1px solid var(--border)" }}>
              Grade {grade} · {GRADE_LABEL[grade]}
            </span>
          </div>
        )}
      </div>

      {/* ── Past day read-only view ──────────────────────────────────── */}
      {!isToday && (
        <div
          className="rounded-2xl p-8 space-y-6"
          style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", opacity: navPending ? 0.5 : 1 }}
        >
          {viewEntry ? (
            <>
              {viewEntry.summary && (
                <div className="space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: "var(--text-3)" }}>Log</p>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: "var(--text-2)" }}>{viewEntry.summary}</p>
                </div>
              )}
              {viewEntry.top_3_for_tomorrow.length > 0 && (
                <div className="space-y-2">
                  <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: "var(--text-3)" }}>Top 3 planned</p>
                  <ol className="space-y-1.5">
                    {viewEntry.top_3_for_tomorrow.map((t, i) => (
                      <li key={i} className="flex items-center gap-2.5 text-sm" style={{ color: "var(--text)" }}>
                        <span className="h-5 w-5 rounded-full text-[10px] font-bold flex items-center justify-center shrink-0" style={{ backgroundColor: "var(--accent-subtle)", color: "var(--accent)" }}>{i + 1}</span>
                        {t}
                      </li>
                    ))}
                  </ol>
                </div>
              )}
              {!viewEntry.summary && viewEntry.top_3_for_tomorrow.length === 0 && (
                <p className="text-sm italic text-center py-4" style={{ color: "var(--text-3)" }}>Nothing logged for this day.</p>
              )}
            </>
          ) : (
            <p className="text-sm italic text-center py-4" style={{ color: "var(--text-3)" }}>No journal entry for this day.</p>
          )}
        </div>
      )}

      {/* ── Main 2-col form (today only) ─────────────────────────────── */}
      {isToday && <form onSubmit={handleSeal}>
        {error && (
          <p
            className="mb-6 text-sm rounded-xl px-4 py-3"
            style={{ color: "var(--danger)", backgroundColor: "var(--danger-subtle)", border: "1px solid var(--danger-border)" }}
          >
            {error}
          </p>
        )}

        <div className="grid grid-cols-5 gap-10">

          {/* ── Left: Journal column (3/5) ─────────────────────────── */}
          <div className="col-span-3 space-y-8">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: "var(--text-3)" }}>
                  Today&apos;s Log
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleAutoGenerate}
                    disabled={autoGenPending}
                    title="Auto-generate review from this week's activity"
                    className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all disabled:opacity-50"
                    style={{
                      backgroundColor: "var(--accent-subtle)",
                      color: "var(--accent)",
                      border: "1px solid var(--accent)",
                    }}
                  >
                    <Sparkles className="h-3 w-3" />
                    {autoGenPending ? "Generating…" : "Auto-fill"}
                  </button>
                  {speech.supported && (
                    <button
                      type="button"
                      onClick={handleMic}
                      title={speech.listening ? "Stop dictation" : "Dictate your log"}
                      className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all"
                      style={{
                        backgroundColor: speech.listening ? "var(--imp-high)" : "var(--surface-2)",
                        color: speech.listening ? "#fff" : "var(--text-3)",
                        border: `1px solid ${speech.listening ? "var(--imp-high)" : "var(--border)"}`,
                      }}
                    >
                      {speech.listening ? <MicOff className="h-3 w-3" /> : <Mic className="h-3 w-3" />}
                      {speech.listening ? "Stop" : "Dictate"}
                    </button>
                  )}
                </div>
              </div>
              {autoGenError && (
                <p className="text-xs font-medium" style={{ color: "var(--danger)" }}>{autoGenError}</p>
              )}
              <textarea
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                rows={9}
                placeholder={speech.listening ? "Listening… speak your log entry" : "How did today go? What are you carrying into tomorrow?"}
                className="w-full rounded-xl p-5 text-base leading-relaxed resize-none outline-none transition-all"
                style={{
                  backgroundColor: "var(--surface)",
                  color: "var(--text)",
                  border: `1px solid ${speech.listening ? "var(--imp-high)" : "var(--border)"}`,
                  fontFamily: "inherit",
                }}
                onFocus={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--accent)"; }}
                onBlur={(e) => { if (!speech.listening) (e.currentTarget as HTMLElement).style.borderColor = "var(--border)"; }}
              />
            </div>

            {/* Past reviews — journal timeline */}
            {recentReviews.length > 0 && (
              <div className="space-y-0">
                <p className="text-[10px] font-black uppercase tracking-widest mb-5" style={{ color: "var(--text-3)" }}>
                  Previous Logs
                </p>
                <div className="relative">
                  {/* vertical timeline line */}
                  <div
                    className="absolute left-[7px] top-2 bottom-2 w-[2px]"
                    style={{ backgroundColor: "var(--border)" }}
                  />
                  <div className="space-y-6 pl-7">
                    {recentReviews.map((review) => (
                      <div key={review.id} className="relative">
                        {/* dot */}
                        <div
                          className="absolute -left-7 top-1.5 w-3.5 h-3.5 rounded-full border-2"
                          style={{
                            backgroundColor: "var(--surface)",
                            borderColor: "var(--border-strong)",
                          }}
                        />
                        <p className="text-xs font-bold mb-2" style={{ color: "var(--text-3)" }}>
                          {formatDate(review.review_date)}
                        </p>
                        {review.summary && (
                          <p className="text-sm leading-relaxed whitespace-pre-wrap mb-3" style={{ color: "var(--text-2)" }}>
                            {review.summary}
                          </p>
                        )}
                        {review.top_3_for_tomorrow.length > 0 && (
                          <ol className="space-y-1">
                            {review.top_3_for_tomorrow.map((title, i) => (
                              <li key={i} className="flex items-center gap-2 text-sm" style={{ color: "var(--text)" }}>
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
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ── Right: Accountability column (2/5) ─────────────────── */}
          <div className="col-span-2 space-y-7">

            {/* Carrying over */}
            <div className="space-y-3">
              <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: "var(--text-3)" }}>
                Carrying Over
                {unfinishedTasks.length > 0 && (
                  <span className="ml-2 normal-case font-medium tracking-normal">
                    ({unfinishedTasks.length})
                  </span>
                )}
              </p>
              {unfinishedTasks.length === 0 ? (
                <p className="text-sm italic" style={{ color: "var(--text-3)" }}>
                  Nothing left — excellent work.
                </p>
              ) : (
                <div className="space-y-2">
                  {unfinishedTasks.slice(0, 8).map((task) => (
                    <CompactTaskRow key={task.id} task={task} />
                  ))}
                </div>
              )}
            </div>

            {/* Top 3 for tomorrow */}
            {candidateTasks.length > 0 && (
              <div className="space-y-3">
                <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: "var(--text-3)" }}>
                  Top 3 for Tomorrow
                  <span className="ml-2 normal-case font-medium tracking-normal">
                    ({top3.length} / 3)
                  </span>
                </p>
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

            {/* Save button */}
            <div className="space-y-2 pt-1">
              <button
                type="submit"
                disabled={pending}
                className="w-full sovereign-gradient text-white rounded-xl py-4 font-bold text-base flex items-center justify-center gap-2.5 transition-all duration-200 active:scale-[0.98] disabled:opacity-50"
                style={{ boxShadow: "0 8px 20px rgba(26,64,194,0.25)" }}
              >
                <span>{pending ? "Saving…" : saved ? "Update Review" : "Save Review"}</span>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
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
      </form>}

    </div>
  );
}
