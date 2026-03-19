"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { Zap, Plus, Pencil, Archive } from "lucide-react";
import { toggleHabitLog, archiveHabit } from "@/app/actions/habits";
import { useRouter } from "next/navigation";
import TaskForm from "@/components/TaskForm";
import HabitForm from "@/components/HabitForm";
import type { Task, Habit, HabitLog } from "@/types";
import type { DailyCompletion, DayRhythm } from "@/lib/stats";

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

// ── Main component ────────────────────────────────────────────────────────────

interface Props {
  greetingText: string;
  completion: DailyCompletion;
  streak: number;
  longestStreak: number;
  rhythm: DayRhythm[];
  urgentTasks: Task[];
  activeHabits: Habit[];
  allHabits: Habit[];
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
  rhythm,
  urgentTasks,
  activeHabits,
  allHabits,
  habitLogs,
  allHabitLogs,
  today,
  todayHabitsDone,
}: Props) {
  const [creating, setCreating] = useState(false);
  const [habitFormOpen, setHabitFormOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [, startTransition] = useTransition();
  const router = useRouter();
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

      {/* ── Quick Capture ───────────────────────────────────────── */}
      <button
        onClick={() => setCreating(true)}
        className="w-full flex items-center gap-4 rounded-xl px-6 py-4 text-left transition-all duration-200 group"
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
          What requires your attention?
        </span>
        <span
          className="sovereign-gradient rounded-lg px-3 py-1.5 text-xs font-bold text-white opacity-0 group-hover:opacity-100 transition-all duration-200"
        >
          Capture
        </span>
      </button>

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

      {creating && <TaskForm onClose={() => setCreating(false)} />}
      {habitFormOpen && (
        <HabitForm
          habit={editingHabit ?? undefined}
          onClose={() => { setHabitFormOpen(false); setEditingHabit(null); router.refresh(); }}
        />
      )}
    </div>
  );
}
