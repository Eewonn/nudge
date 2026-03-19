import { type Task, type GroupedTasks, type TaskGroup } from "@/types";

const IMPORTANCE_SCORE: Record<string, number> = { high: 3, medium: 2, low: 1 };

function importanceScore(t: Task) {
  return IMPORTANCE_SCORE[t.importance] ?? 2;
}

/** Returns ms until due (negative = overdue) */
function msUntilDue(t: Task, now: Date): number {
  return t.due_at ? new Date(t.due_at).getTime() - now.getTime() : Infinity;
}

/** Sort comparator: most urgent first */
function urgencySort(a: Task, b: Task, now: Date): number {
  const msA = msUntilDue(a, now);
  const msB = msUntilDue(b, now);
  // Both undated — sort by importance desc
  if (!isFinite(msA) && !isFinite(msB)) {
    return importanceScore(b) - importanceScore(a);
  }
  // Undated goes after dated
  if (!isFinite(msA)) return 1;
  if (!isFinite(msB)) return -1;
  // Both dated: closer due date first; break ties by importance
  if (msA !== msB) return msA - msB;
  return importanceScore(b) - importanceScore(a);
}

export function groupTasks(tasks: Task[], now = new Date()): GroupedTasks {
  const active = tasks.filter((t) => !t.is_completed);

  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  const startOfTomorrow = new Date(startOfToday);
  startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);

  const overdue: Task[] = [];
  const today: Task[] = [];
  const upcoming: Task[] = [];
  const someday: Task[] = [];

  for (const task of active) {
    if (!task.due_at) {
      someday.push(task);
    } else {
      const due = new Date(task.due_at);
      if (due < startOfToday) {
        overdue.push(task);
      } else if (due < startOfTomorrow) {
        today.push(task);
      } else {
        upcoming.push(task);
      }
    }
  }

  overdue.sort((a, b) => urgencySort(a, b, now));
  today.sort((a, b) => urgencySort(a, b, now));
  upcoming.sort((a, b) => urgencySort(a, b, now));
  someday.sort((a, b) => importanceScore(b) - importanceScore(a));

  return { overdue, today, upcoming, someday };
}

export function getTaskUrgency(task: Task, now = new Date()): TaskGroup | null {
  if (task.is_completed) return null;
  if (!task.due_at) return "someday";
  const due = new Date(task.due_at);
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  const startOfTomorrow = new Date(startOfToday);
  startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);
  if (due < startOfToday) return "overdue";
  if (due < startOfTomorrow) return "today";
  return "upcoming";
}

/** True if task is due within the next N hours */
export function isDueSoon(task: Task, hours = 24, now = new Date()): boolean {
  if (!task.due_at) return false;
  const ms = new Date(task.due_at).getTime() - now.getTime();
  return ms > 0 && ms <= hours * 60 * 60 * 1000;
}
