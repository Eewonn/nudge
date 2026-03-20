import { getEvents } from "@/app/actions/events";
import { getTasks } from "@/app/actions/tasks";
import CalendarClient from "@/components/calendar/CalendarClient";

export const dynamic = "force-dynamic";

export default async function CalendarPage() {
  // Load ±3 months to support navigation without re-fetching
  const now  = new Date();
  const from = new Date(now.getFullYear(), now.getMonth() - 3, 1).toISOString();
  const to   = new Date(now.getFullYear(), now.getMonth() + 4, 0).toISOString();

  const [events, tasks] = await Promise.all([
    getEvents(from, to),
    getTasks(),
  ]);

  // Only calendar-visible tasks: has due_at and not completed
  const calendarTasks = tasks.filter(t => t.due_at && !t.is_completed);

  return <CalendarClient events={events} tasks={calendarTasks} />;
}
