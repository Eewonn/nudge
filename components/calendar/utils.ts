import type { Event, Task } from "@/types";

export const HOUR_HEIGHT = 64; // px per hour in time grid
export const GRID_START  = 0;  // 12 AM
export const GRID_END    = 24; // 12 AM (next day)

export const EVENT_TYPE_COLORS: Record<string, string> = {
  meeting:  "var(--accent)",
  event:    "#7c3aed",
  block:    "#d97706",
  reminder: "#059669",
};

export const EVENT_TYPE_BG: Record<string, string> = {
  meeting:  "rgba(26,64,194,0.15)",
  event:    "rgba(124,58,237,0.15)",
  block:    "rgba(217,119,6,0.15)",
  reminder: "rgba(5,150,105,0.15)",
};

// ── Date helpers ─────────────────────────────────────────────────────────────

export function startOfWeek(date: Date): Date {
  const d = new Date(date);
  d.setDate(d.getDate() - d.getDay()); // Sunday
  d.setHours(0, 0, 0, 0);
  return d;
}

export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function isToday(d: Date): boolean {
  return isSameDay(d, new Date());
}

export function addDays(date: Date, n: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

export function addWeeks(date: Date, n: number): Date {
  return addDays(date, n * 7);
}

export function addMonths(date: Date, n: number): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + n);
  return d;
}

export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

// ── Time grid helpers ─────────────────────────────────────────────────────────

/** Minutes from GRID_START for a given date */
export function minutesFromStart(date: Date): number {
  return (date.getHours() - GRID_START) * 60 + date.getMinutes();
}

/** Pixel offset from top of grid */
export function topPx(date: Date): number {
  return (minutesFromStart(date) / 60) * HOUR_HEIGHT;
}

/** Pixel height for an event block */
export function heightPx(start: Date, end: Date | null): number {
  if (!end) return HOUR_HEIGHT;
  const mins = (end.getTime() - start.getTime()) / 60000;
  return Math.max(28, (mins / 60) * HOUR_HEIGHT);
}

// ── Event / task filtering ────────────────────────────────────────────────────

export function eventsForDay(events: Event[], day: Date): Event[] {
  const s = new Date(day); s.setHours(0, 0, 0, 0);
  const e = new Date(day); e.setHours(23, 59, 59, 999);
  return events.filter(ev => {
    const start = new Date(ev.start_at);
    return start >= s && start <= e;
  });
}

export function tasksForDay(tasks: Task[], day: Date): Task[] {
  return tasks.filter(t => t.due_at && isSameDay(new Date(t.due_at), day));
}

// ── Event layout (overlap columns) ──────────────────────────────────────────

export interface LayoutEvent extends Event {
  col: number;
  numCols: number;
}

export function layoutDayEvents(events: Event[]): LayoutEvent[] {
  const sorted = [...events].sort(
    (a, b) => new Date(a.start_at).getTime() - new Date(b.start_at).getTime()
  );

  // columnEndTimes[i] = end time of last event placed in column i
  const columnEndTimes: number[] = [];

  const result: LayoutEvent[] = sorted.map(ev => {
    const start = new Date(ev.start_at).getTime();
    const end   = ev.end_at
      ? new Date(ev.end_at).getTime()
      : start + 60 * 60 * 1000;

    let col = columnEndTimes.findIndex(endTime => endTime <= start);
    if (col === -1) {
      col = columnEndTimes.length;
      columnEndTimes.push(end);
    } else {
      columnEndTimes[col] = end;
    }

    return { ...ev, col, numCols: 0 };
  });

  const totalCols = columnEndTimes.length;
  return result.map(ev => ({ ...ev, numCols: totalCols }));
}

// ── Calendar header label ─────────────────────────────────────────────────────

export function weekRangeLabel(weekStart: Date): string {
  const end = addDays(weekStart, 6);
  const startMonth = weekStart.toLocaleDateString("en-US", { month: "long" });
  if (weekStart.getMonth() === end.getMonth()) {
    return `${startMonth} ${weekStart.getDate()}–${end.getDate()}, ${weekStart.getFullYear()}`;
  }
  const endFmt = end.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return `${weekStart.toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${endFmt}, ${end.getFullYear()}`;
}
