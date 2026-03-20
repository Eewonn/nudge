"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase-server";
import type { DailyReview } from "@/types";

export async function getReviewByDate(date: string): Promise<DailyReview | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("daily_reviews")
    .select("*")
    .eq("review_date", date)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data as DailyReview | null;
}

export async function getTodayReview(): Promise<DailyReview | null> {
  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);
  const { data, error } = await supabase
    .from("daily_reviews")
    .select("*")
    .eq("review_date", today)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data as DailyReview | null;
}

export async function getRecentReviews(limit?: number): Promise<DailyReview[]> {
  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);
  let query = supabase
    .from("daily_reviews")
    .select("*")
    .lt("review_date", today)
    .order("review_date", { ascending: false });
  if (limit) query = query.limit(limit);
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data as DailyReview[];
}

export async function upsertReview(
  review_date: string,
  summary: string,
  top_3_for_tomorrow: string[]
): Promise<DailyReview> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("daily_reviews")
    .upsert(
      { user_id: user.id, review_date, summary, top_3_for_tomorrow },
      { onConflict: "user_id,review_date" }
    )
    .select()
    .single();
  if (error) throw new Error(error.message);
  revalidatePath("/review");
  return data as DailyReview;
}
