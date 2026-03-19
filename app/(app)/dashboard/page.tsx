import { createClient } from "@/lib/supabase-server";
import { getTasks } from "@/app/actions/tasks";
import { getHabits, getHabitLogs } from "@/app/actions/habits";
import { groupTasks } from "@/lib/priority";
import {
  computeStreak,
  computeLongestStreak,
  computeDailyCompletion,
  computeWeeklyRhythm,
  firstNameFromEmail,
} from "@/lib/stats";
import DashboardClient from "./DashboardClient";

export const dynamic = "force-dynamic";

function greeting(name: string) {
  const h = new Date().getHours();
  const time = h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
  return `${time}, ${name}.`;
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [tasks, habits, logs] = await Promise.all([
    getTasks(),
    getHabits(),
    getHabitLogs(60), // 60 days for streak calculation
  ]);

  const grouped = groupTasks(tasks);
  const today   = new Date().toISOString().slice(0, 10);

  const streak        = computeStreak(tasks, logs);
  const longestStreak = computeLongestStreak(tasks, logs);
  const completion    = computeDailyCompletion(tasks);
  const rhythm        = computeWeeklyRhythm(tasks);

  const activeHabits  = habits.filter((h) => h.is_active);
  const todayHabitsDone = activeHabits.filter((h) =>
    logs.some((l) => l.habit_id === h.id && l.date === today)
  ).length;

  const meta = user?.user_metadata;
  const firstName = meta?.full_name?.split(" ")[0]
    || meta?.name?.split(" ")[0]
    || firstNameFromEmail(user?.email ?? "there");
  const greetingText = greeting(firstName);

  // Urgent = overdue + high/medium importance today
  const urgentTasks = [
    ...grouped.overdue,
    ...grouped.today.filter((t) => t.importance !== "low"),
  ].slice(0, 6);

  return (
    <DashboardClient
      greetingText={greetingText}
      completion={completion}
      streak={streak}
      longestStreak={longestStreak}
      rhythm={rhythm}
      urgentTasks={urgentTasks}
      activeHabits={activeHabits}
      allHabits={habits}
      habitLogs={logs.filter((l) => l.date === today)}
      allHabitLogs={logs}
      today={today}
      todayHabitsDone={todayHabitsDone}
    />
  );
}
