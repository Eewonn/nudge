"use client";

import Link from "next/link";
import { useState, useTransition, useEffect } from "react";
import { Zap, Plus, Pencil, Archive, Mic, MicOff } from "lucide-react";
import { toggleHabitLog, archiveHabit } from "@/app/actions/habits";
import { toggleTask } from "@/app/actions/tasks";
import { useRouter } from "next/navigation";
import TaskForm from "@/components/TaskForm";
import HabitForm from "@/components/HabitForm";
import { useSpeechInput } from "@/hooks/useSpeechInput";
import { parseVoiceCapture, type ParsedTask } from "@/app/actions/capture";
import type { Task, Habit, HabitLog } from "@/types";
import type { DailyCompletion, DayRhythm } from "@/lib/stats";

// ── Weekly Rhythm bar chart ──────────────────────────────────────────────────

function WeeklyRhythm({ rhythm, today }: { rhythm: DayRhythm[]; today: string }) {
  const max = Math.max(...rhythm.map((d) => d.count), 1);
  const hasRhythmData = rhythm.some((d) => d.count > 0);
  const weekTotal = rhythm.reduce((sum, d) => sum + d.count, 0);

  return (
    <div
      className="rounded-xl p-6"
      style={{ backgroundColor: "var(--surface-2)", border: "1px solid var(--border)" }}
    >
      {!hasRhythmData ? (
        <div className="h-32 flex items-center justify-center">
          <p className="text-sm text-center" style={{ color: "var(--text-3)" }}>
            Complete tasks to build your rhythm
          </p>
        </div>
      ) : (
        <div className="flex items-end justify-between h-32 gap-2">
        {rhythm.map((day) => {
          const heightPct = (day.count / max) * 100;
          const isToday = day.date === today;
          const isFuture = day.date > today;
          const barBg = isFuture
            ? "var(--surface-3)"
            : isToday
            ? "var(--accent)"
            : "rgba(26, 64, 194, 0.2)";
          const opacity = isFuture ? 0.4 : 1;

          return (
            <div key={day.date} className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full flex items-end" style={{ height: "100px" }}>
                <div
                  className="w-full rounded-t-lg transition-all duration-500"
                  style={{
                    height: day.count === 0 && !isFuture ? "3px" : `${Math.max(heightPct, isFuture ? 10 : 5)}%`,
                    backgroundColor: barBg,
                    opacity,
                  }}
                />
              </div>
              <span
                className="text-[10px] font-bold uppercase"
                style={{ color: isToday ? "var(--accent)" : "var(--text-3)", opacity: isFuture ? 0.4 : 1 }}
              >
                {day.label}
              </span>
            </div>
          );
        })}
        </div>
      )}
      <div
        className="mt-6 pt-4 flex justify-between items-center"
        style={{ borderTop: "1px solid var(--border)" }}
      >
        <p className="text-xs" style={{ color: "var(--text-3)" }}>
          Weekly completion rhythm
          {weekTotal > 0 && (
            <span className="ml-2 font-semibold" style={{ color: "var(--text-2)" }}>
              · {weekTotal} task{weekTotal !== 1 ? "s" : ""} this week
            </span>
          )}
        </p>
        <Link
          href="/tasks"
          className="text-[10px] font-bold uppercase tracking-wider transition-colors"
          style={{ color: "var(--accent)" }}
        >
          View All
        </Link>
      </div>
    </div>
  );
}

// ── Task card (Stitch "plinth" style) ────────────────────────────────────────

function daysOverdue(due_at: string): number {
  const ms = Date.now() - new Date(due_at).getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

function TaskCard({ task, onComplete }: { task: Task; onComplete: () => void }) {
  const now = new Date();
  const isOverdue = task.due_at && new Date(task.due_at) < now;
  const overdueDays = isOverdue && task.due_at ? daysOverdue(task.due_at) : 0;
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
      {/* Left color strip */}
      <div className="self-stretch w-[4px] shrink-0" style={{ backgroundColor: stripColor }} />

      {/* Content */}
      <div className="flex-1 min-w-0 py-5 pr-5">
        <div className="flex items-center gap-2.5 mb-1.5">
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
        <h4 className="text-lg font-bold leading-snug" style={{ color: "var(--text)" }}>
          {task.title}
        </h4>
        <div className="flex items-center gap-4 mt-2">
          {dueLabel && (
            <span
              className="flex items-center gap-1.5 text-xs font-medium"
              style={{ color: isOverdue ? "var(--imp-high)" : "var(--text-3)" }}
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
              </svg>
              {isOverdue && (
                <span className="font-bold">
                  {overdueDays >= 1 ? `${overdueDays}d overdue · ` : "Overdue · "}
                </span>
              )}
              {dueLabel}
            </span>
          )}
        </div>
      </div>

      {/* Hover checkmark */}
      <button
        onClick={onComplete}
        className="w-9 h-9 rounded-full border-2 flex items-center justify-center mr-5 shrink-0 transition-all duration-200 hover:border-accent"
        style={{ borderColor: "var(--border-strong)" }}
        title="Mark complete"
      >
        <svg
          className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100"
          style={{ color: "var(--accent)" }}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </button>
    </div>
  );
}

// ── Habit 7-day grid ─────────────────────────────────────────────────────────

function HabitGrid({
  habit,
  todayDone,
  weekDots,
  onToggle,
  todayIdx,
}: {
  habit: Habit;
  todayDone: boolean;
  weekDots: boolean[];
  onToggle: () => void;
  todayIdx: number;
}) {
  const doneCount = weekDots.filter(Boolean).length;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold" style={{ color: "var(--text)" }}>{habit.name}</span>
        <span className="text-[10px] font-bold" style={{ color: "var(--accent)" }}>
          {doneCount}/7
        </span>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {weekDots.map((done, i) => {
          const isToday = i === todayIdx;
          return isToday ? (
            <button
              key={i}
              onClick={onToggle}
              title="Toggle today"
              className="aspect-square rounded-sm flex items-center justify-center transition-all duration-200 hover:opacity-80"
              style={{
                backgroundColor: done ? "var(--accent)" : "var(--surface-3)",
                outline: isToday ? "2px solid var(--accent)" : "none",
                outlineOffset: "2px",
              }}
            >
              {done && (
                <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 12 12" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2 6l3 3 5-5" />
                </svg>
              )}
            </button>
          ) : (
            <div
              key={i}
              className="aspect-square rounded-sm flex items-center justify-center"
              style={{ backgroundColor: done ? "var(--accent)" : "var(--border-strong)" + "40" }}
            >
              {done && (
                <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 12 12" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2 6l3 3 5-5" />
                </svg>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

interface Props {
  greetingText: string;
  completion: DailyCompletion;
  streak: number;
  longestStreak: number;
  rhythm: DayRhythm[];
  urgentTasks: Task[];
  somedayCount: number;
  activeHabits: Habit[];
  allHabits: Habit[];
  habitLogs: HabitLog[];
  allHabitLogs: HabitLog[];
  today: string;
  todayHabitsDone: number;
}

function getCurrentWeekDates(): string[] {
  const now = new Date();
  const day = now.getDay(); // 0=Sun … 6=Sat
  const daysSinceMonday = day === 0 ? 6 : day - 1;
  const monday = new Date(now);
  monday.setDate(now.getDate() - daysSinceMonday);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d.toISOString().slice(0, 10);
  });
}

export default function DashboardClient({
  greetingText,
  completion,
  streak,
  longestStreak,
  rhythm,
  urgentTasks,
  somedayCount,
  activeHabits,
  allHabits,
  habitLogs,
  allHabitLogs,
  today,
  todayHabitsDone,
}: Props) {
  const [creating, setCreating] = useState(false);
  const [captureDefaults, setCaptureDefaults] = useState<ParsedTask | undefined>();
  const [parsing, setParsing] = useState(false);
  const [habitFormOpen, setHabitFormOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [, startTransition] = useTransition();
  const router = useRouter();
  const speech = useSpeechInput();

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || (e.target as HTMLElement).isContentEditable) return;
      if (e.key === "n" || e.key === "N") {
        e.preventDefault();
        setCreating(true);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function handleMicCapture() {
    if (speech.listening) { speech.stop(); return; }
    speech.start(async (text) => {
      setParsing(true);
      try {
        const parsed = await parseVoiceCapture(text);
        setCaptureDefaults(parsed);
      } catch {
        setCaptureDefaults({ title: text, due_at: null, importance: "medium", category: "personal", notes: null });
      } finally {
        setParsing(false);
        setCreating(true);
      }
    });
  }
  const todayDoneSet = new Set(habitLogs.map((l) => l.habit_id));
  const last7 = getCurrentWeekDates();
  const todayIdx = last7.indexOf(today);

  const now = new Date();
  const dateLabel = now.toLocaleDateString(undefined, {
    weekday: "long", month: "long", day: "numeric",
  });
  const timeLabel = now.toLocaleTimeString(undefined, {
    hour: "numeric", minute: "2-digit",
  });

  return (
    <div className="p-8 space-y-10">
      {/* ── Header ──────────────────────────────────────────────── */}
      <header>
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] mb-2" style={{ color: "var(--text-3)" }}>
          {dateLabel} · {timeLabel}
        </p>
        <h1 className="text-5xl font-extrabold tracking-tight font-headline" style={{ color: "var(--text)" }}>
          {greetingText}
        </h1>
      </header>

      {/* ── Quick Capture ───────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setCreating(true)}
          className="flex-1 flex items-center gap-4 rounded-xl px-6 py-4 text-left transition-all duration-200 group"
          style={{
            backgroundColor: "var(--surface)",
            border: "1px solid var(--border)",
            boxShadow: "0 1px 4px rgba(15,23,48,0.04)",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.borderColor = "var(--accent)";
            (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 16px rgba(26,64,194,0.08)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
            (e.currentTarget as HTMLElement).style.boxShadow = "0 1px 4px rgba(15,23,48,0.04)";
          }}
        >
          <div
            className="sovereign-gradient flex h-8 w-8 items-center justify-center rounded-lg shrink-0"
            style={{ boxShadow: "0 2px 8px rgba(26,64,194,0.25)" }}
          >
            <Zap className="h-4 w-4 text-white" />
          </div>
          <span className="flex-1 text-sm font-medium" style={{ color: "var(--text-3)" }}>
            {parsing ? "Parsing your task…" : speech.listening ? "Listening… speak your task" : "What do you need to get done?"}
          </span>
          <span
            className="sovereign-gradient rounded-lg px-3 py-1.5 text-xs font-bold text-white opacity-0 group-hover:opacity-100 transition-all duration-200"
          >
            N
          </span>
        </button>

        {speech.supported && (
          <button
            onClick={handleMicCapture}
            disabled={parsing}
            title={parsing ? "Parsing…" : speech.listening ? "Stop listening" : "Speak a task"}
            className="h-[56px] w-[56px] rounded-xl flex items-center justify-center shrink-0 transition-all duration-200 disabled:opacity-60"
            style={{
              backgroundColor: speech.listening ? "var(--imp-high)" : parsing ? "var(--accent-subtle)" : "var(--surface)",
              border: `1px solid ${speech.listening ? "var(--imp-high)" : parsing ? "var(--accent)" : "var(--border)"}`,
              boxShadow: speech.listening ? "0 0 0 4px rgba(163,0,14,0.15)" : "0 1px 4px rgba(15,23,48,0.04)",
            }}
          >
            {parsing ? (
              <svg className="h-5 w-5 animate-spin" style={{ color: "var(--accent)" }} fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : speech.listening ? (
              <MicOff className="h-5 w-5 text-white" />
            ) : (
              <Mic className="h-5 w-5" style={{ color: "var(--text-3)" }} />
            )}
          </button>
        )}
      </div>

      {/* ── Top bento: Completion + Streak ──────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Completion bar — 2/3 */}
        <div
          className="col-span-1 md:col-span-2 rounded-xl p-8 flex flex-col justify-between"
          style={{
            backgroundColor: "var(--surface-2)",
            border: "1px solid var(--border)",
          }}
        >
          <div className="flex justify-between items-start">
            <h3 className="font-semibold text-lg" style={{ color: "var(--text-2)" }}>
              Daily Completion
            </h3>
            <span className="text-2xl font-bold tabular-nums" style={{ color: "var(--accent)" }}>
              {completion.pct}%
            </span>
          </div>
          <div>
            <div
              className="w-full h-3 rounded-full overflow-hidden mt-4"
              style={{ backgroundColor: "var(--surface-4)" }}
            >
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${completion.pct}%`,
                  backgroundColor: "var(--accent)",
                  boxShadow: "0 0 12px rgba(26, 64, 194, 0.3)",
                }}
              />
            </div>
            <p className="text-sm mt-4 italic" style={{ color: "var(--text-3)" }}>
              {completion.done} of {completion.total} tasks complete today.
            </p>
          </div>
        </div>

        {/* Streak — 1/3 */}
        <div
          className="sovereign-gradient rounded-xl p-8 text-white flex flex-col justify-center items-center text-center"
          style={{ boxShadow: "0 8px 24px rgba(26, 64, 194, 0.25)" }}
        >
          <p className="text-[11px] font-bold uppercase tracking-widest mb-2 opacity-80">
            Current Streak
          </p>
          <div className="text-6xl font-extrabold mb-2 font-headline">{streak}</div>
          <p className="text-sm opacity-90">
            {streak === 1 ? "Day of peak productivity" : "Days of peak productivity"}
          </p>
          {longestStreak > streak && (
            <p className="text-[11px] opacity-50 mt-3">Best: {longestStreak}d</p>
          )}
        </div>
      </div>

      {/* ── Main grid: 8-col left + 4-col right ─────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left column */}
        <div className="col-span-1 lg:col-span-8 space-y-12">
          {/* Urgent + Important */}
          <section>
            <div className="flex items-center gap-4 mb-6">
              <h2 className="text-xl font-bold font-headline" style={{ color: "var(--text)" }}>
                Urgent + Important
              </h2>
              <div className="h-px flex-1" style={{ backgroundColor: "var(--border)" }} />
              <Link
                href="/tasks"
                className="text-[11px] font-bold uppercase tracking-wider transition-colors"
                style={{ color: "var(--accent)" }}
              >
                All Tasks
              </Link>
            </div>

            {urgentTasks.length === 0 ? (
              <div
                className="rounded-xl border-2 border-dashed p-10 text-center"
                style={{ borderColor: "var(--border)" }}
              >
                <p className="text-sm" style={{ color: "var(--text-3)" }}>
                  All clear — nothing urgent right now.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {urgentTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onComplete={() => startTransition(async () => { await toggleTask(task.id, true); router.refresh(); })}
                  />
                ))}
              </div>
            )}
            {somedayCount > 0 && (
              <Link
                href="/tasks"
                className="mt-4 flex items-center gap-2 text-xs font-medium transition-colors"
                style={{ color: "var(--text-3)" }}
              >
                <span
                  className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                  style={{ backgroundColor: "var(--surface-2)", color: "var(--text-3)" }}
                >
                  {somedayCount}
                </span>
                undated task{somedayCount !== 1 ? "s" : ""} in your backlog →
              </Link>
            )}
          </section>

          {/* Weekly Rhythm */}
          <section>
            <div className="flex items-center gap-4 mb-6">
              <h2 className="text-xl font-bold font-headline" style={{ color: "var(--text)" }}>
                Weekly Rhythm
              </h2>
              <div className="h-px flex-1" style={{ backgroundColor: "var(--border)" }} />
            </div>
            <WeeklyRhythm rhythm={rhythm} today={today} />
          </section>
        </div>

        {/* Right column */}
        <div className="col-span-1 lg:col-span-4 space-y-8">
          {/* Habit Tracker */}
          <section
            className="rounded-xl p-6"
            style={{
              backgroundColor: "var(--surface)",
              border: "1px solid var(--border)",
              boxShadow: "0 1px 4px rgba(15,23,48,0.04)",
            }}
          >
            {/* Section header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest mb-0.5" style={{ color: "var(--text-3)" }}>
                  Habit Tracker
                </p>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold font-headline" style={{ color: "var(--text)" }}>
                    Daily Habits
                  </h2>
                  {activeHabits.length > 0 && (
                    <span
                      className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                      style={{
                        backgroundColor: todayHabitsDone === activeHabits.length ? "var(--success-subtle)" : "var(--surface-2)",
                        color: todayHabitsDone === activeHabits.length ? "var(--success)" : "var(--text-3)",
                      }}
                    >
                      {todayHabitsDone}/{activeHabits.length}
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => { setEditingHabit(null); setHabitFormOpen(true); }}
                className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all duration-200"
                style={{
                  backgroundColor: "var(--surface-2)",
                  color: "var(--text-2)",
                  border: "1px solid var(--border)",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.backgroundColor = "var(--accent-subtle)";
                  (e.currentTarget as HTMLElement).style.color = "var(--accent)";
                  (e.currentTarget as HTMLElement).style.borderColor = "var(--accent)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.backgroundColor = "var(--surface-2)";
                  (e.currentTarget as HTMLElement).style.color = "var(--text-2)";
                  (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
                }}
              >
                <Plus className="h-3 w-3" />
                Add Habit
              </button>
            </div>

            {/* Habit list */}
            {activeHabits.length === 0 ? (
              <div
                className="rounded-xl border-2 border-dashed p-8 text-center"
                style={{ borderColor: "var(--border)" }}
              >
                <p className="text-sm mb-3" style={{ color: "var(--text-3)" }}>
                  No habits tracked yet.
                </p>
                <button
                  onClick={() => { setEditingHabit(null); setHabitFormOpen(true); }}
                  className="text-xs font-bold transition-colors"
                  style={{ color: "var(--accent)" }}
                >
                  + Add your first habit
                </button>
              </div>
            ) : (
              <div className="space-y-5">
                {activeHabits.map((habit) => {
                  const weekDots = last7.map((date) =>
                    allHabitLogs.some((l) => l.habit_id === habit.id && l.date === date)
                  );
                  const doneCount = weekDots.filter(Boolean).length;
                  const todayDone = todayDoneSet.has(habit.id);
                  return (
                    <div
                      key={habit.id}
                      className="group/habit rounded-lg p-3 transition-all duration-200"
                      style={{ backgroundColor: "var(--surface-2)" }}
                    >
                      {/* Habit header */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-sm font-bold truncate" style={{ color: "var(--text)" }}>
                            {habit.name}
                          </span>
                          <span className="text-[10px] font-bold shrink-0" style={{ color: "var(--accent)" }}>
                            {doneCount}/7
                          </span>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover/habit:opacity-100 transition-opacity shrink-0 ml-2">
                          <button
                            onClick={() => { setEditingHabit(habit); setHabitFormOpen(true); }}
                            className="rounded p-1 transition-colors"
                            style={{ color: "var(--text-3)" }}
                            title="Edit"
                            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--text)"; (e.currentTarget as HTMLElement).style.backgroundColor = "var(--surface-3)"; }}
                            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--text-3)"; (e.currentTarget as HTMLElement).style.backgroundColor = "transparent"; }}
                          >
                            <Pencil className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() => startTransition(async () => { await archiveHabit(habit.id, false); router.refresh(); })}
                            className="rounded p-1 transition-colors"
                            style={{ color: "var(--text-3)" }}
                            title="Archive"
                            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--warning)"; (e.currentTarget as HTMLElement).style.backgroundColor = "var(--warning-subtle)"; }}
                            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--text-3)"; (e.currentTarget as HTMLElement).style.backgroundColor = "transparent"; }}
                          >
                            <Archive className="h-3 w-3" />
                          </button>
                        </div>
                      </div>

                      {/* 7-day grid */}
                      <div className="grid grid-cols-7 gap-1">
                        {weekDots.map((done, i) => {
                          const isToday = i === todayIdx;
                          return isToday ? (
                            <button
                              key={i}
                              onClick={() => startTransition(() => toggleHabitLog(habit.id, today, !todayDone))}
                              title="Toggle today"
                              className="aspect-square rounded-sm flex items-center justify-center transition-all duration-200 hover:opacity-80"
                              style={{
                                backgroundColor: done ? "var(--accent)" : "var(--surface-3)",
                                outline: "2px solid var(--accent)",
                                outlineOffset: "2px",
                              }}
                            >
                              {done && (
                                <svg className="w-2 h-2 text-white" fill="none" viewBox="0 0 12 12" stroke="currentColor" strokeWidth={2.5}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M2 6l3 3 5-5" />
                                </svg>
                              )}
                            </button>
                          ) : (
                            <div
                              key={i}
                              className="aspect-square rounded-sm flex items-center justify-center"
                              style={{ backgroundColor: done ? "var(--accent)" : "rgba(196,197,214,0.25)" }}
                            >
                              {done && (
                                <svg className="w-2 h-2 text-white" fill="none" viewBox="0 0 12 12" stroke="currentColor" strokeWidth={2.5}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M2 6l3 3 5-5" />
                                </svg>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Archived habits count */}
            {allHabits.filter((h) => !h.is_active).length > 0 && (
              <p className="mt-4 text-[10px]" style={{ color: "var(--text-3)" }}>
                {allHabits.filter((h) => !h.is_active).length} archived habit{allHabits.filter((h) => !h.is_active).length !== 1 ? "s" : ""}
              </p>
            )}
          </section>

          {/* Review CTA */}
          <Link
            href="/review"
            className="block rounded-xl p-6 transition-all duration-300 group"
            style={{
              backgroundColor: "var(--accent-subtle)",
              border: "1px solid var(--border)",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = ""; }}
          >
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-60 mb-2" style={{ color: "var(--accent)" }}>
              Daily Review
            </p>
            <p className="text-base font-bold leading-snug font-headline" style={{ color: "var(--accent)" }}>
              Stay consistent, ship often.
            </p>
            <p className="text-xs mt-3 font-medium" style={{ color: "var(--text-3)" }}>
              → Log your day
            </p>
          </Link>
        </div>
      </div>

      {creating && (
        <TaskForm
          defaults={captureDefaults}
          onClose={() => { setCreating(false); setCaptureDefaults(undefined); }}
        />
      )}
      {habitFormOpen && (
        <HabitForm
          habit={editingHabit ?? undefined}
          onClose={() => { setHabitFormOpen(false); setEditingHabit(null); router.refresh(); }}
        />
      )}
    </div>
  );
}
