import type { Task, Event } from "@/types";

export type ReminderType =
  | "daily-digest"
  | "due-24h"
  | "due-2h"
  | "overdue-once"
  | "event-24h"
  | "event-2h";

export interface PendingReminder {
  task: Task | null;   // set for task-based reminders
  event: Event | null; // set for event-based reminders
  type: ReminderType;
}

interface SentLog {
  entity_id: string | null;
  entity_type: string | null;
  reminder_type: ReminderType;
  sent_at: string;
}

const HOUR = 60 * 60 * 1000;
const DAY  = 24 * HOUR;

// Window around a target time in which we consider the reminder "due"
const WINDOW_24H = 45 * 60 * 1000; // ±45 min
const WINDOW_2H  = 20 * 60 * 1000; // ±20 min

function sentToday(logs: SentLog[], type: ReminderType, now: Date): boolean {
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);
  return logs.some(
    (l) => l.reminder_type === type && new Date(l.sent_at) >= startOfDay
  );
}

function sentForEntity(
  logs: SentLog[],
  entityId: string,
  entityType: "task" | "event",
  type: ReminderType
): boolean {
  return logs.some(
    (l) => l.entity_id === entityId && l.entity_type === entityType && l.reminder_type === type
  );
}

/**
 * Pure function — returns the list of reminders that should be sent right now.
 *
 * @param tasks       All active (not completed) tasks for the user
 * @param events      All upcoming events (not yet started) for the user
 * @param logs        Recent reminder_logs rows (last 48h is sufficient)
 * @param digestTasks Tasks for the daily digest (overdue + today)
 * @param now         Current time (injectable for testing)
 */
export function getPendingReminders(
  tasks: Task[],
  events: Event[],
  logs: SentLog[],
  digestTasks: Task[],
  now = new Date()
): PendingReminder[] {
  const pending: PendingReminder[] = [];

  // ── Daily digest ────────────────────────────────────────────────────────
  if (!sentToday(logs, "daily-digest", now)) {
    pending.push({ task: null, event: null, type: "daily-digest" });
  }

  // ── Task reminders ──────────────────────────────────────────────────────
  for (const task of tasks) {
    if (!task.due_at) continue;
    const due = new Date(task.due_at).getTime();
    const msUntilDue = due - now.getTime();

    const in24h = msUntilDue > DAY - WINDOW_24H && msUntilDue <= DAY + WINDOW_24H;
    if (in24h && !sentForEntity(logs, task.id, "task", "due-24h")) {
      pending.push({ task, event: null, type: "due-24h" });
    }

    const in2h = msUntilDue > 2 * HOUR - WINDOW_2H && msUntilDue <= 2 * HOUR + WINDOW_2H;
    if (in2h && task.importance === "high" && !sentForEntity(logs, task.id, "task", "due-2h")) {
      pending.push({ task, event: null, type: "due-2h" });
    }

    const isOverdue = msUntilDue < 0;
    if (isOverdue && !sentForEntity(logs, task.id, "task", "overdue-once")) {
      pending.push({ task, event: null, type: "overdue-once" });
    }
  }

  // ── Event reminders ─────────────────────────────────────────────────────
  for (const event of events) {
    const start = new Date(event.start_at).getTime();
    const msUntilStart = start - now.getTime();

    // Only fire reminders for future events
    if (msUntilStart <= 0) continue;

    const in24h = msUntilStart > DAY - WINDOW_24H && msUntilStart <= DAY + WINDOW_24H;
    if (in24h && !sentForEntity(logs, event.id, "event", "event-24h")) {
      pending.push({ task: null, event, type: "event-24h" });
    }

    const in2h = msUntilStart > 2 * HOUR - WINDOW_2H && msUntilStart <= 2 * HOUR + WINDOW_2H;
    if (in2h && event.importance === "high" && !sentForEntity(logs, event.id, "event", "event-2h")) {
      pending.push({ task: null, event, type: "event-2h" });
    }
  }

  return pending;
}
