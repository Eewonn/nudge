import { createClient } from "@/lib/supabase-server";
import { getTasks } from "@/app/actions/tasks";
import { getHabits, getHabitLogs } from "@/app/actions/habits";
import { groupTasks } from "@/lib/priority";
import {
  computeStreak,
  computeLongestStreak,
  computeDailyCompletion,
  computeWeeklyRhythm,
  computeAttentionSummary,
  computePatternInsights,
  firstNameFromEmail,
  type PatternInsight,
} from "@/lib/stats";
import DashboardClient from "./DashboardClient";

export const dynamic = "force-dynamic";

const TZ = "Asia/Manila";

function greeting(name: string) {
  const h = parseInt(new Intl.DateTimeFormat("en-US", { hour: "numeric", hour12: false, timeZone: TZ }).format(new Date()));
  const time = h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
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
  const today   = new Date().toLocaleDateString("en-CA", { timeZone: TZ });

  const streak        = computeStreak(tasks, logs);
  const longestStreak = computeLongestStreak(tasks, logs);
  const completion    = computeDailyCompletion(tasks);
  const rhythm        = computeWeeklyRhythm(tasks);
  const attention     = computeAttentionSummary(tasks);

  const activeHabits  = habits.filter((h) => h.is_active);
  const todayHabitsDone = activeHabits.filter((h) =>
    logs.some((l) => l.habit_id === h.id && l.date === today)
  ).length;

  const meta = user?.user_metadata;
  const firstName = meta?.full_name?.split(" ")[0]
    || meta?.name?.split(" ")[0]
    || firstNameFromEmail(user?.email ?? "there");
  const greetingText = greeting(firstName);

  const somedayCount = grouped.someday.length;
  const patternInsights = computePatternInsights(tasks, logs, habits);

  // Focus items: overdue first, then due within 2h, then high/medium importance today
  const now = new Date();
  const twoHoursLater = new Date(now.getTime() + 2 * 60 * 60 * 1000);
  const focusItems = [
    ...grouped.overdue,
    ...grouped.today.filter((t) => t.due_at && new Date(t.due_at) <= twoHoursLater),
    ...grouped.today.filter((t) => !t.due_at || new Date(t.due_at) > twoHoursLater).filter((t) => t.importance !== "low"),
  ].filter((t, i, arr) => arr.findIndex((x) => x.id === t.id) === i).slice(0, 5);

  // Today's schedule: all today tasks sorted by time
  const todaySchedule = [...grouped.today].sort((a, b) => {
    if (!a.due_at && !b.due_at) return 0;
    if (!a.due_at) return 1;
    if (!b.due_at) return -1;
    return new Date(a.due_at).getTime() - new Date(b.due_at).getTime();
  });

  return (
    <DashboardClient
      greetingText={greetingText}
      completion={completion}
      streak={streak}
      longestStreak={longestStreak}
      rhythm={rhythm}
      focusItems={focusItems}
      todaySchedule={todaySchedule}
      attentionLabel={attention.label}
      overdueCount={attention.overdueCount}
      somedayCount={somedayCount}
      activeHabits={activeHabits}
      allHabits={habits}
      habitLogs={logs.filter((l) => l.date === today)}
      allHabitLogs={logs}
      today={today}
      todayHabitsDone={todayHabitsDone}
      patternInsights={patternInsights}
    />
  );
}
