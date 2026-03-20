import type { Task, HabitLog, Habit } from "@/types";

// ── Helpers ─────────────────────────────────────────────────────────────────

const TZ = "Asia/Manila"; // UTC+8 — single-user app

function toDateStr(d: Date) {
  return d.toLocaleDateString("en-CA", { timeZone: TZ }); // YYYY-MM-DD in Manila time
}

/** Set of YYYY-MM-DD strings where the user did something */
function activeDateSet(tasks: Task[], habitLogs: HabitLog[]): Set<string> {
  const dates = new Set<string>();
  for (const t of tasks) {
    if (t.is_completed && t.completed_at) dates.add(t.completed_at.slice(0, 10));
  }
  for (const l of habitLogs) dates.add(l.date);
  return dates;
}

// ── Streak ───────────────────────────────────────────────────────────────────

/**
 * Consecutive days of activity ending today (or yesterday if today not yet active).
 * A day is "active" if the user completed at least 1 task OR logged at least 1 habit.
 */
export function computeStreak(tasks: Task[], habitLogs: HabitLog[], now = new Date()): number {
  const active = activeDateSet(tasks, habitLogs);
  const today = toDateStr(now);
  // If nothing done today yet, streak can still be alive from yesterday
  const startOffset = active.has(today) ? 0 : 1;
  let streak = 0;
  for (let i = startOffset; i < 365; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    if (active.has(toDateStr(d))) streak++;
    else break;
  }
  return streak;
}

/** Longest streak ever in the provided history */
export function computeLongestStreak(tasks: Task[], habitLogs: HabitLog[]): number {
  const active = activeDateSet(tasks, habitLogs);
  if (active.size === 0) return 0;

  const sorted = Array.from(active).sort();
  let best = 1, current = 1;
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1]);
    const curr = new Date(sorted[i]);
    prev.setDate(prev.getDate() + 1);
    if (toDateStr(prev) === sorted[i]) {
      current++;
      best = Math.max(best, current);
    } else {
      current = 1;
    }
  }
  return best;
}

// ── Daily completion ──────────────────────────────────────────────────────────

export interface DailyCompletion {
  done: number;
  total: number;
  pct: number; // 0–100
}

/**
 * Tasks completed today vs. tasks that were due today or earlier (active + completed today).
 */
export function computeDailyCompletion(tasks: Task[], now = new Date()): DailyCompletion {
  const todayStr = toDateStr(now);
  // Manila midnight as UTC timestamp
  const startOfToday    = new Date(`${todayStr}T00:00:00+08:00`);
  const startOfTomorrow = new Date(`${todayStr}T00:00:00+08:00`);
  startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);

  const completedToday = tasks.filter(
    (t) => t.is_completed && t.completed_at &&
      new Date(t.completed_at).toLocaleDateString("en-CA", { timeZone: TZ }) === todayStr
  ).length;

  const pendingDueToday = tasks.filter((t) => {
    if (t.is_completed) return false;
    if (!t.due_at) return false;
    const due = new Date(t.due_at);
    return due >= startOfToday && due < startOfTomorrow;
  }).length;

  const total = completedToday + pendingDueToday;
  return {
    done: completedToday,
    total,
    pct: total === 0 ? 0 : Math.round((completedToday / total) * 100),
  };
}

// ── Weekly rhythm ─────────────────────────────────────────────────────────────

export interface DayRhythm {
  date: string;   // YYYY-MM-DD
  label: string;  // "M", "T", etc.
  count: number;  // tasks completed
}

const DAY_INITIALS = ["S", "M", "T", "W", "T", "F", "S"];

export function computeWeeklyRhythm(tasks: Task[], days = 7, now = new Date()): DayRhythm[] {
  return Array.from({ length: days }, (_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - (days - 1 - i));
    const ds = toDateStr(d);
    const count = tasks.filter(
      (t) => t.is_completed && t.completed_at &&
        new Date(t.completed_at).toLocaleDateString("en-CA", { timeZone: TZ }) === ds
    ).length;
    return { date: ds, label: DAY_INITIALS[d.getDay()], count };
  });
}

// ── Performance score ─────────────────────────────────────────────────────────

export type Grade = "A+" | "A" | "B+" | "B" | "C" | "D";

export function computePerformanceScore(streak: number, completionPct: number): Grade {
  const score = completionPct * 0.6 + Math.min(streak * 5, 40) * 1.0;
  if (score >= 90) return "A+";
  if (score >= 78) return "A";
  if (score >= 66) return "B+";
  if (score >= 54) return "B";
  if (score >= 40) return "C";
  return "D";
}

// ── Attention summary ─────────────────────────────────────────────────────────

export interface AttentionSummary {
  overdueCount: number;
  dueSoonCount: number;   // due within 2 hours
  dueLaterCount: number;  // due today but not within 2 hours
  label: string;
}

export function computeAttentionSummary(tasks: Task[], now = new Date()): AttentionSummary {
  const active = tasks.filter((t) => !t.is_completed);
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  const startOfTomorrow = new Date(startOfToday);
  startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);
  const twoHoursLater = new Date(now.getTime() + 2 * 60 * 60 * 1000);

  const overdueCount = active.filter(
    (t) => t.due_at && new Date(t.due_at) < startOfToday
  ).length;

  const dueSoonCount = active.filter((t) => {
    if (!t.due_at) return false;
    const due = new Date(t.due_at);
    return due >= now && due <= twoHoursLater;
  }).length;

  const dueLaterCount = active.filter((t) => {
    if (!t.due_at) return false;
    const due = new Date(t.due_at);
    return due > twoHoursLater && due < startOfTomorrow;
  }).length;

  const parts: string[] = [];
  if (overdueCount > 0) parts.push(`${overdueCount} overdue`);
  if (dueSoonCount > 0) parts.push(`${dueSoonCount} due in 2h`);
  if (dueLaterCount > 0) parts.push(`${dueLaterCount} due later today`);

  return {
    overdueCount,
    dueSoonCount,
    dueLaterCount,
    label: parts.length === 0 ? "All clear" : parts.join(" · "),
  };
}

// ── Pattern insights ──────────────────────────────────────────────────────────

export interface PatternInsight {
  label: string;
  value: string;
  sublabel: string;
}

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function computePatternInsights(
  tasks: Task[],
  habitLogs: HabitLog[],
  habits: Habit[],
  now = new Date(),
): PatternInsight[] {
  const insights: PatternInsight[] = [];

  const completed = tasks.filter((t) => t.is_completed && t.completed_at);

  // ── Best day of week (last 30 days) ───────────────────────────────────────
  const cutoff30 = new Date(now.getTime() - 30 * 86400000);
  const dayBuckets = new Array<number>(7).fill(0);
  completed.forEach((t) => {
    if (new Date(t.completed_at!) >= cutoff30) {
      dayBuckets[new Date(t.completed_at!).getDay()]++;
    }
  });
  const maxDayCount = Math.max(...dayBuckets);
  if (maxDayCount > 0) {
    const bestDay = dayBuckets.indexOf(maxDayCount);
    insights.push({
      label: "Most productive day",
      value: DAY_NAMES[bestDay],
      sublabel: `${maxDayCount} tasks in the last 30d`,
    });
  }

  // ── Weekly trend (this week vs last week) ─────────────────────────────────
  const thisWeekCutoff = new Date(now.getTime() - 7 * 86400000);
  const lastWeekCutoff = new Date(now.getTime() - 14 * 86400000);
  const thisWeekCount = completed.filter((t) => new Date(t.completed_at!) >= thisWeekCutoff).length;
  const lastWeekCount = completed.filter((t) => {
    const d = new Date(t.completed_at!);
    return d >= lastWeekCutoff && d < thisWeekCutoff;
  }).length;
  const trend = thisWeekCount - lastWeekCount;
  if (thisWeekCount > 0 || lastWeekCount > 0) {
    insights.push({
      label: "Weekly trend",
      value: trend > 0 ? `+${trend} tasks` : trend === 0 ? "Same pace" : `${trend} tasks`,
      sublabel: `${thisWeekCount} this week vs ${lastWeekCount} last`,
    });
  }

  // ── Strongest habit this week ─────────────────────────────────────────────
  const weekAgoStr = new Date(now.getTime() - 7 * 86400000).toISOString().slice(0, 10);
  const activeHabits = habits.filter((h) => h.is_active);
  if (activeHabits.length > 0) {
    let bestHabit: Habit | null = null;
    let bestCount = 0;
    for (const h of activeHabits) {
      const count = habitLogs.filter((l) => l.habit_id === h.id && l.date >= weekAgoStr).length;
      if (count > bestCount) { bestCount = count; bestHabit = h; }
    }
    if (bestHabit && bestCount > 0) {
      insights.push({
        label: "Strongest habit",
        value: bestHabit.name,
        sublabel: `${bestCount}/7 days this week`,
      });
    }
  }

  return insights;
}

// ── User first name ───────────────────────────────────────────────────────────

export function firstNameFromEmail(email: string): string {
  const local = email.split("@")[0];
  const part = local.split(/[._-]/)[0].replace(/\d+$/, "");
  if (!part) return "there";
  return part.charAt(0).toUpperCase() + part.slice(1);
}
