import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import SettingsClient from "./SettingsClient";
import type { NotifPrefs } from "@/app/actions/profile";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const meta = user.user_metadata ?? {};
  const fullName: string = meta.full_name ?? meta.name ?? "";
  const email: string = user.email ?? "";

  const prefs: NotifPrefs = {
    notif_email_enabled: meta.notif_email_enabled  ?? true,
    notif_daily_digest:  meta.notif_daily_digest   ?? true,
    notif_due_24h:       meta.notif_due_24h         ?? true,
    notif_due_2h:        meta.notif_due_2h           ?? true,
    notif_overdue:       meta.notif_overdue          ?? true,
  };

  const feedToken = process.env.CALENDAR_FEED_TOKEN ?? "";

  return <SettingsClient fullName={fullName} email={email} prefs={prefs} feedToken={feedToken} />;
}
