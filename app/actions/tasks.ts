"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase-server";
import type { Task, Category, Importance } from "@/types";

export interface TaskInput {
  title: string;
  notes?: string;
  category: Category;
  importance: Importance;
  due_at?: string | null;
  recurrence_rule?: string | null;
}

export async function getTasks(): Promise<Task[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return data as Task[];
}

export async function createTask(input: TaskInput): Promise<Task> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("tasks")
    .insert({ ...input, user_id: user.id })
    .select()
    .single();
  if (error) throw new Error(error.message);
  revalidatePath("/tasks");
  revalidatePath("/dashboard");
  return data as Task;
}

export async function updateTask(id: string, input: Partial<TaskInput>): Promise<Task> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tasks")
    .update(input)
    .eq("id", id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  revalidatePath("/tasks");
  revalidatePath("/dashboard");
  return data as Task;
}

export async function deleteTask(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("tasks").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/tasks");
  revalidatePath("/dashboard");
}

export async function stopRecurrence(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("tasks")
    .update({ recurrence_rule: null })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/tasks");
  revalidatePath("/dashboard");
}

export async function toggleTask(id: string, isCompleted: boolean): Promise<void> {
  const supabase = await createClient();

  // Fetch the task first so we can check recurrence_rule
  const { data: task, error: fetchError } = await supabase
    .from("tasks")
    .select("*")
    .eq("id", id)
    .single();
  if (fetchError) throw new Error(fetchError.message);

  const { error } = await supabase
    .from("tasks")
    .update({
      is_completed: isCompleted,
      completed_at: isCompleted ? new Date().toISOString() : null,
    })
    .eq("id", id);
  if (error) throw new Error(error.message);

  // Regenerate recurring task when completing
  if (isCompleted && task.recurrence_rule) {
    const base = task.due_at ? new Date(task.due_at) : new Date();
    const next = new Date(base);
    if (task.recurrence_rule === "daily") {
      next.setDate(next.getDate() + 1);
    } else if (task.recurrence_rule === "weekly") {
      next.setDate(next.getDate() + 7);
    } else if (task.recurrence_rule === "monthly") {
      next.setMonth(next.getMonth() + 1);
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("tasks").insert({
        user_id: user.id,
        title: task.title,
        notes: task.notes,
        category: task.category,
        importance: task.importance,
        recurrence_rule: task.recurrence_rule,
        due_at: next.toISOString(),
        is_completed: false,
      });
    }
  }

  revalidatePath("/tasks");
  revalidatePath("/dashboard");
}
