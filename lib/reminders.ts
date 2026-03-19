import type { Task } from "@/types";

export type ReminderType = "daily-digest" | "due-24h" | "due-2h" | "overdue-once";

export interface PendingReminder {
  task: Task | null; // null for digest (not task-specific)
  type: ReminderType;
}

interface SentLog {
  task_id: string | null;
  reminder_type: ReminderType;
  sent_at: string;
}

const HOUR = 60 * 60 * 1000;
const DAY  = 24 * HOUR;

// Window around a target time in which we consider the reminder "due"
// (handles cases where the cron runs slightly late)
const WINDOW_24H = 45 * 60 * 1000; // ±45 min
const WINDOW_2H  = 20 * 60 * 1000; // ±20 min

function sentToday(logs: SentLog[], type: ReminderType, now: Date): boolean {
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);
  return logs.some(
    (l) => l.reminder_type === type && new Date(l.sent_at) >= startOfDay
  );
}

function sentForTask(logs: SentLog[], taskId: string, type: ReminderType): boolean {
  return logs.some((l) => l.task_id === taskId && l.reminder_type === type);
}

/**
 * Pure function — returns the list of reminders that should be sent right now.
 *
 * @param tasks       All active (not completed) tasks for the user
 * @param logs        Recent reminder_logs rows (last 48h is sufficient)
 * @param digestTasks Tasks for the daily digest (overdue + today)
 * @param now         Current time (injectable for testing)
 */
export function getPendingReminders(
  tasks: Task[],
  logs: SentLog[],
  digestTasks: Task[],
  now = new Date()
): PendingReminder[] {
  const pending: PendingReminder[] = [];

  // ── Daily digest ────────────────────────────────────────────────────────
  // Send once per day. The cron is scheduled for 8am; we fire it whenever
  // it arrives (the user can re-schedule the cron as needed).
  if (!sentToday(logs, "daily-digest", now)) {
    pending.push({ task: null, type: "daily-digest" });
  }

  for (const task of tasks) {
    if (!task.due_at) continue;
    const due = new Date(task.due_at).getTime();
    const msUntilDue = due - now.getTime();

    // ── Due in ~24h ────────────────────────────────────────────────────────
    // Window: task is between 23h15m and 24h45m away
    const in24h = msUntilDue > DAY - WINDOW_24H && msUntilDue <= DAY + WINDOW_24H;
    if (in24h && !sentForTask(logs, task.id, "due-24h")) {
      pending.push({ task, type: "due-24h" });
    }

    // ── Due in ~2h (high importance only) ─────────────────────────────────
    // Window: task is between 1h40m and 2h20m away
    const in2h = msUntilDue > 2 * HOUR - WINDOW_2H && msUntilDue <= 2 * HOUR + WINDOW_2H;
    if (in2h && task.importance === "high" && !sentForTask(logs, task.id, "due-2h")) {
      pending.push({ task, type: "due-2h" });
    }

    // ── Overdue — once ─────────────────────────────────────────────────────
    const isOverdue = msUntilDue < 0;
    if (isOverdue && !sentForTask(logs, task.id, "overdue-once")) {
      pending.push({ task, type: "overdue-once" });
    }
  }

  return pending;
}
