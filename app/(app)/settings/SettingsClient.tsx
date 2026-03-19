"use client";

import { useState, useTransition } from "react";
import { updateDisplayName, updateNotificationPrefs, sendTestEmail } from "@/app/actions/profile";
import type { NotifPrefs } from "@/app/actions/profile";
import { User, Bell, Mail, Send } from "lucide-react";

interface Props {
  fullName: string;
  email:    string;
  prefs:    NotifPrefs;
}

// ── Toggle ─────────────────────────────────────────────────────────────────

function Toggle({ checked, onChange, disabled }: { checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className="relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none disabled:opacity-40"
      style={{ backgroundColor: checked ? "var(--accent)" : "var(--surface-3)" }}
    >
      <span
        className="pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow transition-transform duration-200"
        style={{ transform: checked ? "translateX(16px)" : "translateX(0)" }}
      />
    </button>
  );
}

// ── Section card ────────────────────────────────────────────────────────────

function Section({ icon: Icon, title, children }: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="rounded-2xl p-6 space-y-5"
      style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)" }}
    >
      <div className="flex items-center gap-3">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
          style={{ backgroundColor: "var(--accent-subtle)" }}
        >
          <Icon className="h-4 w-4" style={{ color: "var(--accent)" }} />
        </div>
        <h2 className="text-base font-bold" style={{ color: "var(--text)" }}>{title}</h2>
      </div>
      {children}
    </div>
  );
}

// ── Notif row ───────────────────────────────────────────────────────────────

function NotifRow({ label, description, checked, onChange, disabled }: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3" style={{ borderTop: "1px solid var(--border)" }}>
      <div className="min-w-0">
        <p className="text-sm font-semibold" style={{ color: disabled ? "var(--text-3)" : "var(--text)" }}>{label}</p>
        <p className="text-xs mt-0.5" style={{ color: "var(--text-3)" }}>{description}</p>
      </div>
      <Toggle checked={checked} onChange={onChange} disabled={disabled} />
    </div>
  );
}

// ── Main ────────────────────────────────────────────────────────────────────

export default function SettingsClient({ fullName, email, prefs: initialPrefs }: Props) {
  const [name, setName]         = useState(fullName);
  const [nameMsg, setNameMsg]   = useState<{ ok: boolean; text: string } | null>(null);
  const [prefs, setPrefs]       = useState<NotifPrefs>(initialPrefs);
  const [prefsMsg, setPrefsMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [testMsg, setTestMsg]   = useState<{ ok: boolean; text: string } | null>(null);
  const [namePending,  startNameTransition]  = useTransition();
  const [prefsPending, startPrefsTransition] = useTransition();
  const [testPending,  startTestTransition]  = useTransition();

  function handleSaveName(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setNameMsg(null);
    startNameTransition(async () => {
      try {
        await updateDisplayName(name);
        setNameMsg({ ok: true, text: "Name updated." });
      } catch (err) {
        setNameMsg({ ok: false, text: err instanceof Error ? err.message : "Failed to update." });
      }
    });
  }

  function setPref<K extends keyof NotifPrefs>(key: K, value: boolean) {
    const next = { ...prefs, [key]: value };
    setPrefs(next);
    setPrefsMsg(null);
    startPrefsTransition(async () => {
      try {
        await updateNotificationPrefs(next);
        setPrefsMsg({ ok: true, text: "Preferences saved." });
      } catch (err) {
        setPrefsMsg({ ok: false, text: err instanceof Error ? err.message : "Failed to save." });
      }
    });
  }

  function handleTestEmail() {
    setTestMsg(null);
    startTestTransition(async () => {
      const result = await sendTestEmail();
      setTestMsg(result.ok
        ? { ok: true, text: "Test email sent! Check your inbox." }
        : { ok: false, text: result.error ?? "Failed to send." }
      );
    });
  }

  return (
    <div className="p-8 max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-extrabold tracking-tight" style={{ color: "var(--text)" }}>
          Settings
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--text-3)" }}>
          Manage your profile and notification preferences.
        </p>
      </div>

      {/* ── Profile ──────────────────────────────────────────────────────── */}
      <Section icon={User} title="Profile">
        {/* Email (read-only) */}
        <div className="space-y-1.5">
          <label className="block text-[10px] font-bold uppercase tracking-widest" style={{ color: "var(--text-3)" }}>
            Email
          </label>
          <div
            className="flex items-center gap-2.5 rounded-xl px-4 py-2.5"
            style={{ backgroundColor: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text-3)" }}
          >
            <Mail className="h-3.5 w-3.5 shrink-0" />
            <span className="text-sm">{email}</span>
          </div>
        </div>

        {/* Display name */}
        <form onSubmit={handleSaveName} className="space-y-3">
          <label className="block text-[10px] font-bold uppercase tracking-widest" style={{ color: "var(--text-3)" }}>
            Display Name
          </label>
          <div className="flex gap-3">
            <input
              value={name}
              onChange={(e) => { setName(e.target.value); setNameMsg(null); }}
              placeholder="Your first name"
              className="flex-1 rounded-xl px-4 py-2.5 text-sm font-medium outline-none transition-all"
              style={{
                backgroundColor: "var(--surface-2)",
                color: "var(--text)",
                border: "1px solid var(--border)",
              }}
              onFocus={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--accent)"; }}
              onBlur={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border)"; }}
            />
            <button
              type="submit"
              disabled={namePending || !name.trim()}
              className="sovereign-gradient rounded-xl px-5 py-2.5 text-sm font-bold text-white transition-all active:scale-95 disabled:opacity-50"
              style={{ boxShadow: "0 4px 14px rgba(26,64,194,0.25)" }}
            >
              {namePending ? "Saving…" : "Save"}
            </button>
          </div>
          {nameMsg && (
            <p className="text-xs font-medium" style={{ color: nameMsg.ok ? "var(--success)" : "var(--danger)" }}>
              {nameMsg.text}
            </p>
          )}
        </form>
      </Section>

      {/* ── Notifications ─────────────────────────────────────────────────── */}
      <Section icon={Bell} title="Notifications">
        <p className="text-xs" style={{ color: "var(--text-3)" }}>
          Nudge emails you before tasks slip past their deadlines. The cron runs every 30 minutes on Vercel.
        </p>

        <NotifRow
          label="Email reminders"
          description="Master toggle — disabling this stops all reminder emails."
          checked={prefs.notif_email_enabled}
          onChange={(v) => setPref("notif_email_enabled", v)}
        />
        <NotifRow
          label="Daily digest"
          description="Sent each morning with overdue and today's tasks."
          checked={prefs.notif_daily_digest}
          onChange={(v) => setPref("notif_daily_digest", v)}
          disabled={!prefs.notif_email_enabled}
        />
        <NotifRow
          label="24-hour reminder"
          description="Sent when a task is due in approximately 24 hours."
          checked={prefs.notif_due_24h}
          onChange={(v) => setPref("notif_due_24h", v)}
          disabled={!prefs.notif_email_enabled}
        />
        <NotifRow
          label="2-hour reminder"
          description="Sent for high-priority tasks due in approximately 2 hours."
          checked={prefs.notif_due_2h}
          onChange={(v) => setPref("notif_due_2h", v)}
          disabled={!prefs.notif_email_enabled}
        />
        <NotifRow
          label="Overdue alert"
          description="Sent once when a task becomes overdue."
          checked={prefs.notif_overdue}
          onChange={(v) => setPref("notif_overdue", v)}
          disabled={!prefs.notif_email_enabled}
        />

        {prefsMsg && (
          <p className="text-xs font-medium" style={{ color: prefsMsg.ok ? "var(--success)" : "var(--danger)" }}>
            {prefsPending ? "Saving…" : prefsMsg.text}
          </p>
        )}

        {/* Test email */}
        <div
          className="mt-2 pt-5 flex items-center justify-between gap-4"
          style={{ borderTop: "1px solid var(--border)" }}
        >
          <div>
            <p className="text-sm font-semibold" style={{ color: "var(--text)" }}>Send a test email</p>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-3)" }}>
              Sends a sample daily digest to <span className="font-medium">{email}</span>.
            </p>
            {testMsg && (
              <p className="text-xs font-medium mt-1.5" style={{ color: testMsg.ok ? "var(--success)" : "var(--danger)" }}>
                {testMsg.text}
              </p>
            )}
          </div>
          <button
            onClick={handleTestEmail}
            disabled={testPending}
            className="flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-all shrink-0 disabled:opacity-50 active:scale-95"
            style={{ borderColor: "var(--border-strong)", color: "var(--text-2)", backgroundColor: "var(--surface-2)" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--accent)"; (e.currentTarget as HTMLElement).style.color = "var(--accent)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border-strong)"; (e.currentTarget as HTMLElement).style.color = "var(--text-2)"; }}
          >
            <Send className="h-3.5 w-3.5" />
            {testPending ? "Sending…" : "Send test"}
          </button>
        </div>
      </Section>
    </div>
  );
}
