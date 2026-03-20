"use client";

import { useRef, useEffect } from "react";
import type { Event, Task } from "@/types";
import {
  eventsForDay, tasksForDay,
  topPx, heightPx, layoutDayEvents,
  EVENT_TYPE_COLORS, EVENT_TYPE_BG,
  formatTime, isToday,
  HOUR_HEIGHT, GRID_START, GRID_END,
} from "./utils";

const HOURS = Array.from({ length: GRID_END - GRID_START }, (_, i) => GRID_START + i);
const LEFT_GUTTER = 52;

interface Props {
  currentDate: Date;
  events: Event[];
  tasks: Task[];
  onSlotClick: (date: string, hour: number) => void;
}

export default function DayView({ currentDate, events, tasks, onSlotClick }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const dateStr   = currentDate.toLocaleDateString("en-CA");
  const today     = isToday(currentDate);

  useEffect(() => {
    if (scrollRef.current) {
      const scrollToHour = Math.max(0, new Date().getHours() - 2);
      scrollRef.current.scrollTop = scrollToHour * HOUR_HEIGHT;
    }
  }, []);

  const dayEvents = eventsForDay(events, currentDate).filter(e => !e.is_all_day);
  const allDay    = eventsForDay(events, currentDate).filter(e => e.is_all_day);
  const dayTasks  = tasksForDay(tasks, currentDate);
  const laid      = layoutDayEvents(dayEvents);

  return (
    <div className="flex flex-col">
      {/* All-day strip */}
      {allDay.length > 0 && (
        <div
          className="px-4 py-1.5 flex flex-wrap gap-1.5 shrink-0"
          style={{ borderBottom: "1px solid var(--border)" }}
        >
          {allDay.map(ev => {
            const color = EVENT_TYPE_COLORS[ev.type] ?? "var(--accent)";
            return (
              <span
                key={ev.id}
                className="text-xs font-semibold px-2 py-0.5 rounded-full"
                style={{ backgroundColor: color + "22", color }}
              >
                {ev.title}
              </span>
            );
          })}
        </div>
      )}

      {/* Time grid — scrollable container */}
      <div ref={scrollRef} className="overflow-auto" style={{ height: "calc(100vh - 160px)" }}>
        <div
          className="relative flex"
          style={{ height: `${HOURS.length * HOUR_HEIGHT}px` }}
        >
          {/* Hour labels */}
          <div className="shrink-0 relative" style={{ width: `${LEFT_GUTTER}px` }}>
            {HOURS.map(h => (
              <div
                key={h}
                className="absolute right-2 text-[10px] font-semibold"
                style={{ top: `${(h - GRID_START) * HOUR_HEIGHT - 7}px`, color: "var(--text-3)" }}
              >
                {h === 12 ? "12pm" : h < 12 ? `${h}am` : `${h - 12}pm`}
              </div>
            ))}
          </div>

          {/* Day column */}
          <div
            className="flex-1 relative"
            style={{
              borderLeft: "1px solid var(--border)",
              backgroundColor: today ? "var(--accent-subtle)" : undefined,
            }}
          >
            {/* Hour rows */}
            {HOURS.map(h => (
              <div
                key={h}
                className="absolute w-full cursor-pointer transition-colors"
                style={{
                  top: `${(h - GRID_START) * HOUR_HEIGHT}px`,
                  height: `${HOUR_HEIGHT}px`,
                  borderTop: "1px solid var(--border)",
                }}
                onClick={() => onSlotClick(dateStr, h)}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = "var(--surface-2)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = ""; }}
              >
                <span
                  className="absolute left-2 bottom-1 text-[9px] font-medium"
                  style={{ color: "var(--text-3)", opacity: 0.5 }}
                >
                  :30
                </span>
              </div>
            ))}

            {/* Events */}
            {laid.map(ev => {
              const start  = new Date(ev.start_at);
              const end    = ev.end_at ? new Date(ev.end_at) : null;
              const top    = topPx(start);
              const height = heightPx(start, end);
              const colW   = 100 / ev.numCols;
              const color  = EVENT_TYPE_COLORS[ev.type] ?? "var(--accent)";
              const bg     = EVENT_TYPE_BG[ev.type] ?? "rgba(26,64,194,0.15)";

              if (top + height < 0 || top > HOURS.length * HOUR_HEIGHT) return null;

              return (
                <div
                  key={ev.id}
                  className="absolute rounded-lg px-2 py-1.5 overflow-hidden cursor-pointer hover:brightness-95"
                  style={{
                    top: `${top}px`,
                    height: `${height}px`,
                    left: `${ev.col * colW + 0.5}%`,
                    width: `${colW - 1}%`,
                    backgroundColor: bg,
                    borderLeft: `3px solid ${color}`,
                    zIndex: 1,
                  }}
                >
                  <div className="text-xs font-bold leading-tight" style={{ color }}>
                    {ev.title}
                  </div>
                  {height > 40 && (
                    <div className="text-[10px] font-medium mt-0.5" style={{ color, opacity: 0.8 }}>
                      {formatTime(ev.start_at)}
                      {ev.end_at && ` – ${formatTime(ev.end_at)}`}
                    </div>
                  )}
                  {height > 60 && ev.location && (
                    <div className="text-[10px] mt-0.5 truncate" style={{ color: "var(--text-2)" }}>
                      {ev.location}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Tasks */}
            {dayTasks.map(task => {
              const due = new Date(task.due_at!);
              const top = topPx(due);
              if (top < 0 || top > HOURS.length * HOUR_HEIGHT) return null;
              const impColor =
                task.importance === "high"   ? "var(--danger)" :
                task.importance === "medium" ? "var(--warning)" :
                                               "var(--text-3)";
              return (
                <div
                  key={task.id}
                  className="absolute flex items-center gap-1.5 px-2 rounded overflow-hidden"
                  style={{
                    top: `${top}px`,
                    height: "22px",
                    left: "2px",
                    right: "2px",
                    backgroundColor: "var(--surface)",
                    border: `1px solid ${impColor}`,
                    zIndex: 2,
                  }}
                  title={`${task.title} · due ${formatTime(task.due_at!)}`}
                >
                  <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: impColor }} />
                  <span className="text-xs font-semibold truncate" style={{ color: "var(--text-2)" }}>
                    {task.title}
                  </span>
                  <span className="ml-auto text-[9px] shrink-0" style={{ color: "var(--text-3)" }}>
                    {formatTime(task.due_at!)}
                  </span>
                </div>
              );
            })}

            {/* Now line */}
            {today && <NowLine />}
          </div>
        </div>
      </div>
    </div>
  );
}

function NowLine() {
  const now     = new Date();
  const top     = topPx(now);
  const visible = top >= 0 && top <= (GRID_END - GRID_START) * HOUR_HEIGHT;
  if (!visible) return null;

  return (
    <div className="absolute left-0 right-0 pointer-events-none z-10" style={{ top: `${top}px` }}>
      <div className="absolute w-full" style={{ height: "2px", backgroundColor: "var(--danger)", opacity: 0.8 }} />
      <div
        className="absolute w-2 h-2 rounded-full"
        style={{ backgroundColor: "var(--danger)", top: "-3px", left: "-4px" }}
      />
    </div>
  );
}
