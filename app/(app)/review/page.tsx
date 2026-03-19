import { createClient } from "@/lib/supabase-server";
import { getTodayReview, getRecentReviews } from "@/app/actions/review";
import { getTasks } from "@/app/actions/tasks";
import { getHabitLogs } from "@/app/actions/habits";
import { groupTasks } from "@/lib/priority";
import {
  computeStreak,
  computeDailyCompletion,
  computePerformanceScore,
  firstNameFromEmail,
} from "@/lib/stats";
import ReviewPageClient from "./ReviewPageClient";

export const dynamic = "force-dynamic";

export default async function ReviewPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const today = new Date().toISOString().slice(0, 10);

  const [existing, recentReviews, tasks, logs] = await Promise.all([
    getTodayReview(),
    getRecentReviews(7),
    getTasks(),
    getHabitLogs(60),
  ]);

  const grouped    = groupTasks(tasks);
  const completion = computeDailyCompletion(tasks);
  const streak     = computeStreak(tasks, logs);
  const grade      = computePerformanceScore(streak, completion.pct);
  const firstName  = firstNameFromEmail(user?.email ?? "there");

  // Candidate tasks for top-3 picker
  const candidateTasks = [...grouped.today, ...grouped.upcoming];

  // Unfinished = overdue + today's active tasks
  const unfinishedTasks = [...grouped.overdue, ...grouped.today];

  return (
    <ReviewPageClient
      today={today}
      firstName={firstName}
      existing={existing}
      recentReviews={recentReviews}
      candidateTasks={candidateTasks}
      unfinishedTasks={unfinishedTasks}
      completion={completion}
      streak={streak}
      grade={grade}
    />
  );
}
