"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase-server";

export interface NotifPrefs {
  notif_email_enabled: boolean;
  notif_daily_digest:  boolean;
  notif_due_24h:       boolean;
  notif_due_2h:        boolean;
  notif_overdue:       boolean;
}

export async function updateDisplayName(fullName: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({
    data: { full_name: fullName.trim() },
  });
  if (error) throw new Error(error.message);
  revalidatePath("/dashboard");
  revalidatePath("/review");
  revalidatePath("/settings");
}

export async function updateNotificationPrefs(prefs: NotifPrefs): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ data: prefs });
  if (error) throw new Error(error.message);
  revalidatePath("/settings");
}

export async function sendTestEmail(): Promise<{ ok: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const { data: tasks } = await supabase
      .from("tasks")
      .select("*")
      .eq("is_completed", false);

    const { groupTasks } = await import("@/lib/priority");
    const { dailyDigest } = await import("@/lib/email-templates");
    const { sendEmail } = await import("@/lib/email");

    const grouped = groupTasks(tasks ?? []);
    const digestTasks = [...grouped.overdue, ...grouped.today];
    const { subject, html } = dailyDigest(digestTasks);
    await sendEmail(`[Test] ${subject}`, html);

    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}
