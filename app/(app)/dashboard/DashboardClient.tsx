"use client";

import Link from "next/link";
import { useTransition } from "react";
import { toggleHabitLog } from "@/app/actions/habits";
import type { Task, Habit, HabitLog } from "@/types";
import type { DailyCompletion, DayRhythm, Grade } from "@/lib/stats";

// ── Weekly Rhythm bar chart ──────────────────────────────────────────────────

function WeeklyRhythm({ rhythm }: { rhythm: DayRhythm[] }) {
  const max = Math.max(...rhythm.map((d) => d.count), 1);
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div
      className="rounded-xl p-6"
      style={{ backgroundColor: "var(--surface-2)", border: "1px solid var(--border)" }}
    >
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
      <div
        className="mt-6 pt-4 flex justify-between items-center"
        style={{ borderTop: "1px solid var(--border)" }}
      >
        <p className="text-xs" style={{ color: "var(--text-3)" }}>
          Weekly completion rhythm
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

function TaskCard({ task }: { task: Task }) {
  const isOverdue = task.due_at && new Date(task.due_at) < new Date();
  const stripColor =
    task.importance === "high"   ? "var(--imp-high)" :
    task.importance === "medium" ? "var(--imp-medium)" : "var(--imp-low)";
  const badgeLabel =
    task.importance === "high" ? "High Priority" :
    task.importance === "medium" ? "Medium" : "Low";

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
              {isOverdue && <span className="font-bold">Overdue · </span>}
              {dueLabel}
            </span>
          )}
        </div>
      </div>

      {/* Hover checkmark */}
      <div
        className="w-9 h-9 rounded-full border-2 flex items-center justify-center mr-5 shrink-0 transition-all duration-200"
        style={{ borderColor: "var(--border-strong)" }}
      >
        <svg
          className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100"
          style={{ color: "var(--accent)" }}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>
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

// ── Grade label ───────────────────────────────────────────────────────────────

const GRADE_LABEL: Record<Grade, string> = {
  "A+": "Excellent",
  "A":  "Strong",
  "B+": "Good",
  "B":  "Solid",
  "C":  "Fair",
  "D":  "Needs work",
};

// ── Main component ────────────────────────────────────────────────────────────

interface Props {
  greetingText: string;
  completion: DailyCompletion;
  streak: number;
  longestStreak: number;
  grade: Grade;
  rhythm: DayRhythm[];
  urgentTasks: Task[];
  activeHabits: Habit[];
  habitLogs: HabitLog[];
  allHabitLogs: HabitLog[];
  today: string;
  todayHabitsDone: number;
}

function getLast7Dates(): string[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().slice(0, 10);
  });
}

export default function DashboardClient({
  greetingText,
  completion,
  streak,
  longestStreak,
  grade,
  rhythm,
  urgentTasks,
  activeHabits,
  habitLogs,
  allHabitLogs,
  today,
  todayHabitsDone,
}: Props) {
  const [, startTransition] = useTransition();
  const todayDoneSet = new Set(habitLogs.map((l) => l.habit_id));
  const last7 = getLast7Dates();
  const todayIdx = 6; // today is always the last in the 7-day window

  const dateLabel = new Date().toLocaleDateString(undefined, {
    weekday: "long", month: "long", day: "numeric",
  });

  return (
    <div className="p-8 space-y-10">
      {/* ── Header ──────────────────────────────────────────────── */}
      <header>
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] mb-2" style={{ color: "var(--text-3)" }}>
          Morning Briefing · {dateLabel}
        </p>
        <h1 className="text-5xl font-extrabold tracking-tight font-headline" style={{ color: "var(--text)" }}>
          {greetingText}
        </h1>
      </header>

      {/* ── Top bento: Completion + Streak ──────────────────────── */}
      <div className="grid grid-cols-3 gap-6">
        {/* Completion bar — 2/3 */}
        <div
          className="col-span-2 rounded-xl p-8 flex flex-col justify-between"
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
      <div className="grid grid-cols-12 gap-10">
        {/* Left column */}
        <div className="col-span-8 space-y-12">
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
                  <TaskCard key={task.id} task={task} />
                ))}
              </div>
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
            <WeeklyRhythm rhythm={rhythm} />
          </section>
        </div>

        {/* Right column */}
        <div className="col-span-4 space-y-8">
          {/* Daily Habits */}
          {activeHabits.length > 0 && (
            <section
              className="rounded-xl p-8"
              style={{
                backgroundColor: "var(--surface-4)",
                border: "1px solid var(--border)",
              }}
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold font-headline" style={{ color: "var(--text)" }}>
                  Daily Habits
                </h2>
                <span className="text-[10px] font-bold uppercase opacity-60" style={{ color: "var(--text-2)" }}>
                  Last 7 Days
                </span>
              </div>
              <div className="space-y-6">
                {activeHabits.map((habit) => {
                  const weekDots = last7.map((date) =>
                    allHabitLogs.some((l) => l.habit_id === habit.id && l.date === date)
                  );
                  return (
                    <HabitGrid
                      key={habit.id}
                      habit={habit}
                      todayDone={todayDoneSet.has(habit.id)}
                      weekDots={weekDots}
                      todayIdx={todayIdx}
                      onToggle={() => {
                        startTransition(() =>
                          toggleHabitLog(habit.id, today, !todayDoneSet.has(habit.id))
                        );
                      }}
                    />
                  );
                })}
              </div>
              <Link
                href="/habits"
                className="mt-6 block text-[10px] font-bold uppercase tracking-wider transition-colors"
                style={{ color: "var(--accent)" }}
              >
                Manage Habits →
              </Link>
            </section>
          )}

          {/* Performance */}
          <section
            className="rounded-xl p-8"
            style={{
              backgroundColor: "var(--surface)",
              border: "1px solid var(--border)",
              boxShadow: "0 1px 4px rgba(15,23,48,0.04)",
            }}
          >
            <h3
              className="text-xs font-bold uppercase tracking-widest mb-8"
              style={{ color: "var(--text-2)" }}
            >
              Performance
            </h3>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs" style={{ color: "var(--text-3)" }}>Today&apos;s Score</span>
                  <div className="text-2xl font-black font-headline" style={{ color: "var(--accent)" }}>
                    {grade}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs" style={{ color: "var(--text-3)" }}>Rating</span>
                  <div className="text-lg font-bold" style={{ color: "var(--text)" }}>
                    {GRADE_LABEL[grade]}
                  </div>
                </div>
              </div>

              <div
                className="flex items-center justify-between pt-5"
                style={{ borderTop: "1px solid var(--border)" }}
              >
                <div>
                  <span className="text-xs" style={{ color: "var(--text-3)" }}>Habits Today</span>
                  <div className="text-2xl font-black font-headline" style={{ color: "var(--text)" }}>
                    {todayHabitsDone}/{activeHabits.length}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs" style={{ color: "var(--text-3)" }}>Completion</span>
                  <div className="text-2xl font-black font-headline" style={{ color: "var(--text)" }}>
                    {completion.pct}%
                  </div>
                </div>
              </div>
            </div>
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
              Architectural Ethos
            </p>
            <p className="text-base font-bold leading-snug font-headline" style={{ color: "var(--accent)" }}>
              Order is the Soul of Progress.
            </p>
            <p className="text-xs mt-3 font-medium" style={{ color: "var(--text-3)" }}>
              → Seal today&apos;s log
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}
