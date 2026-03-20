"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase-server";
import type { Event, Category, EventType, Importance } from "@/types";

export interface EventInput {
  title: string;
  notes?: string;
  type: EventType;
  start_at: string;
  end_at?: string | null;
  location?: string | null;
  url?: string | null;
  is_all_day?: boolean;
  recurrence_rule?: string | null;
  category?: Category;
  importance?: Importance;
}

export async function getEvents(from?: string, to?: string): Promise<Event[]> {
  const supabase = await createClient();
  let query = supabase.from("events").select("*").order("start_at", { ascending: true });
  if (from) query = query.gte("start_at", from);
  if (to) query = query.lte("start_at", to);
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data as Event[];
}

export async function createEvent(input: EventInput): Promise<Event> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("events")
    .insert({ ...input, user_id: user.id })
    .select()
    .single();
  if (error) throw new Error(error.message);
  revalidatePath("/calendar");
  revalidatePath("/dashboard");
  return data as Event;
}

export async function updateEvent(id: string, input: Partial<EventInput>): Promise<Event> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("events")
    .update(input)
    .eq("id", id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  revalidatePath("/calendar");
  revalidatePath("/dashboard");
  return data as Event;
}

export async function deleteEvent(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("events").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/calendar");
  revalidatePath("/dashboard");
}
