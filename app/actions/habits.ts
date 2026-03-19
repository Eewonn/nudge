"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase-server";
import type { Habit, HabitLog } from "@/types";

export interface HabitInput {
  name: string;
  target_frequency: number;
}

export async function getHabits(): Promise<Habit[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("habits")
    .select("*")
    .order("created_at", { ascending: true });
  if (error) throw new Error(error.message);
  return data as Habit[];
}

export async function getHabitLogs(days = 7): Promise<HabitLog[]> {
  const supabase = await createClient();
  const since = new Date();
  since.setDate(since.getDate() - (days - 1));
  const { data, error } = await supabase
    .from("habit_logs")
    .select("*")
    .gte("date", since.toISOString().slice(0, 10));
  if (error) throw new Error(error.message);
  return data as HabitLog[];
}

export async function createHabit(input: HabitInput): Promise<Habit> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("habits")
    .insert({ ...input, user_id: user.id })
    .select()
    .single();
  if (error) throw new Error(error.message);
  revalidatePath("/habits");
  revalidatePath("/dashboard");
  return data as Habit;
}

export async function updateHabit(id: string, input: Partial<HabitInput>): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("habits").update(input).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/habits");
  revalidatePath("/dashboard");
}

export async function archiveHabit(id: string, is_active: boolean): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("habits").update({ is_active }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/habits");
  revalidatePath("/dashboard");
}

export async function toggleHabitLog(
  habitId: string,
  date: string, // YYYY-MM-DD
  done: boolean
): Promise<void> {
  const supabase = await createClient();
  if (done) {
    await supabase.from("habit_logs").upsert({ habit_id: habitId, date }, { onConflict: "habit_id,date" });
  } else {
    await supabase.from("habit_logs").delete().eq("habit_id", habitId).eq("date", date);
  }
  revalidatePath("/habits");
  revalidatePath("/dashboard");
}
