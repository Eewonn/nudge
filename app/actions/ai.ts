"use server";

import Groq from "groq-sdk";
import { createClient } from "@/lib/supabase-server";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY, timeout: 20000 });

export async function generateWeeklyReview(): Promise<string> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const weekAgoStr = new Date(Date.now() - 7 * 86400000).toISOString();
  const todayStr   = new Date().toISOString();

  const [completedRes, overdueRes, habitsRes, logsRes] = await Promise.all([
    supabase
      .from("tasks")
      .select("title, category, importance")
      .eq("is_completed", true)
      .gte("completed_at", weekAgoStr)
      .order("completed_at", { ascending: false }),
    supabase
      .from("tasks")
      .select("title, importance")
      .eq("is_completed", false)
      .lt("due_at", todayStr)
      .not("due_at", "is", null)
      .order("due_at", { ascending: true })
      .limit(8),
    supabase
      .from("habits")
      .select("id, name")
      .eq("is_active", true),
    supabase
      .from("habit_logs")
      .select("habit_id, date")
      .gte("date", weekAgoStr.slice(0, 10)),
  ]);

  const completed = completedRes.data ?? [];
  const overdue   = overdueRes.data ?? [];
  const habits    = habitsRes.data ?? [];
  const logs      = logsRes.data ?? [];

  const completedLines = completed.length > 0
    ? completed.map((t) => `- ${t.title}${t.category ? ` [${t.category}]` : ""}`).join("\n")
    : "(none)";

  const overdueLines = overdue.length > 0
    ? overdue.map((t) => `- ${t.title} (${t.importance})`).join("\n")
    : "(none)";

  const habitLines = habits.length > 0
    ? habits.map((h) => {
        const doneCount = logs.filter((l) => l.habit_id === h.id).length;
        return `- ${h.name}: ${doneCount}/7 days`;
      }).join("\n")
    : "(none)";

  const prompt = `You are helping a user write their daily review entry for a personal productivity app called Nudge.

Based on the following data from the past 7 days, write an honest, grounded 2–3 paragraph review. Acknowledge what was accomplished, call out what slipped, and give one or two specific suggestions for next week. Be direct and encouraging — not generic. Do NOT use bullet points. Write in plain prose.

COMPLETED TASKS:
${completedLines}

OVERDUE TASKS:
${overdueLines}

HABIT PERFORMANCE:
${habitLines}

Write the review now:`;

  const res = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "user", content: prompt }],
    max_tokens: 350,
    temperature: 0.65,
  });

  return res.choices[0]?.message?.content?.trim() ?? "";
}
