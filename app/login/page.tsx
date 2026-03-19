"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  }

  return (
    <>
      <style>{`
        @keyframes ring-pulse {
          0%   { transform: scale(0.75); opacity: 0.7; }
          100% { transform: scale(1.5);  opacity: 0; }
        }
        @keyframes logo-float {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-6px); }
        }
        @keyframes fade-up {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .ring {
          position: absolute;
          border-radius: 9999px;
          border: 1px solid rgba(59, 91, 219, 0.25);
          animation: ring-pulse 3.2s ease-out infinite;
        }
        .logo-float { animation: logo-float 4s ease-in-out infinite; }
        .fade-up-1 { animation: fade-up 0.6s ease both 0.1s; }
        .fade-up-2 { animation: fade-up 0.6s ease both 0.25s; }
        .fade-up-3 { animation: fade-up 0.6s ease both 0.4s; }
        .fade-up-4 { animation: fade-up 0.6s ease both 0.55s; }
        .fade-up-5 { animation: fade-up 0.6s ease both 0.7s; }
      `}</style>

      <div className="min-h-screen flex" style={{ backgroundColor: "var(--bg)" }}>

        {/* ── Left brand panel ──────────────────────────────────── */}
        <div
          className="hidden lg:flex w-[440px] xl:w-[500px] shrink-0 flex-col justify-between px-12 py-14 relative overflow-hidden"
          style={{ background: "linear-gradient(155deg, #07102a 0%, #0a1535 55%, #0d1a42 100%)" }}
        >
          {/* Background glow */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: "radial-gradient(ellipse 90% 55% at 50% 40%, rgba(59,91,219,0.15) 0%, transparent 70%)" }}
          />

          {/* Grain texture overlay */}
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.03]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
              backgroundSize: "128px 128px",
            }}
          />

          {/* Top wordmark */}
          <div className="relative z-10 fade-up-1">
            <div className="flex items-center gap-2.5">
              <Image src="/nudge-logo.png" alt="Nudge" width={32} height={32} className="rounded-lg" />
              <span
                className="text-sm font-extrabold tracking-widest uppercase"
                style={{ color: "rgba(200,210,255,0.7)", letterSpacing: "0.2em" }}
              >
                nudge
              </span>
            </div>
          </div>

          {/* Center: animated logo */}
          <div className="relative z-10 flex flex-col items-center text-center">
            {/* Rings */}
            <div className="relative flex items-center justify-center" style={{ width: "260px", height: "260px" }}>
              <div className="ring" style={{ width: "260px", height: "260px", animationDelay: "0s" }} />
              <div className="ring" style={{ width: "200px", height: "200px", animationDelay: "0.8s" }} />
              <div className="ring" style={{ width: "140px", height: "140px", animationDelay: "1.6s" }} />

              {/* Logo */}
              <div
                className="logo-float relative z-10"
                style={{ filter: "drop-shadow(0 6px 32px rgba(100,140,255,0.4))" }}
              >
                <Image src="/nudge-logo.png" alt="Nudge" width={120} height={120} className="rounded-2xl" />
              </div>
            </div>

            {/* Tagline */}
            <div className="mt-6 fade-up-2">
              <h1
                className="text-4xl font-extrabold tracking-tight font-headline mb-2"
                style={{ color: "#ffffff" }}
              >
                nudge
              </h1>
              <p
                className="text-[11px] font-bold uppercase tracking-[0.22em]"
                style={{ color: "rgba(140,162,220,0.65)" }}
              >
                stay on track
              </p>
            </div>
          </div>

          {/* Bottom feature list */}
          <div className="relative z-10 space-y-2.5 fade-up-3">
            {[
              { label: "Priority Tasks",  desc: "What matters most, always first"     },
              { label: "Habit Tracking",  desc: "Build streaks that actually stick"   },
              { label: "Email Nudges",    desc: "Reminders before you're overdue"     },
            ].map((f) => (
              <div
                key={f.label}
                className="flex items-center gap-3 rounded-xl px-4 py-3"
                style={{
                  backgroundColor: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <div
                  className="w-1.5 h-1.5 rounded-full shrink-0"
                  style={{ backgroundColor: "#6c8de8" }}
                />
                <div className="min-w-0">
                  <span className="text-xs font-bold" style={{ color: "rgba(220,228,255,0.9)" }}>
                    {f.label}
                  </span>
                  <span className="text-xs ml-2" style={{ color: "rgba(120,142,200,0.6)" }}>
                    {f.desc}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Vertical accent line */}
        <div
          className="hidden lg:block w-px shrink-0 self-stretch"
          style={{ background: "linear-gradient(to bottom, transparent 0%, rgba(59,91,219,0.35) 25%, rgba(59,91,219,0.35) 75%, transparent 100%)" }}
        />

        {/* ── Right form panel ──────────────────────────────────── */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 relative">
          {/* Subtle top glow */}
          <div
            className="absolute inset-x-0 top-0 h-40 pointer-events-none"
            style={{ background: "linear-gradient(to bottom, rgba(59,91,219,0.04), transparent)" }}
          />

          {/* Mobile logo */}
          <div className="lg:hidden flex flex-col items-center mb-10 fade-up-1">
            <Image src="/nudge-logo.png" alt="Nudge" width={64} height={64} className="rounded-2xl mb-3" />
            <p className="text-xl font-extrabold tracking-tight" style={{ color: "var(--text)" }}>
              nudge
            </p>
          </div>

          <div className="w-full max-w-[360px] relative">
            {/* Heading */}
            <div className="mb-8 fade-up-4">
              <h2
                className="text-2xl font-extrabold tracking-tight mb-1.5 font-headline"
                style={{ color: "var(--text)" }}
              >
                Welcome back
              </h2>
              <p className="text-sm" style={{ color: "var(--text-3)" }}>
                Sign in to your personal workspace
              </p>
            </div>

            {/* Error */}
            {error && (
              <div
                className="mb-5 flex items-start gap-2.5 rounded-xl px-3.5 py-3"
                style={{
                  backgroundColor: "var(--danger-subtle)",
                  border: "1px solid var(--danger-border)",
                }}
              >
                <svg
                  className="h-4 w-4 mt-0.5 shrink-0"
                  style={{ color: "var(--danger)" }}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z" />
                </svg>
                <p className="text-sm" style={{ color: "var(--danger)" }}>{error}</p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5 fade-up-5">
              <div className="space-y-1.5">
                <label
                  className="block text-[10px] font-bold uppercase tracking-widest"
                  style={{ color: "var(--text-3)" }}
                >
                  Email
                </label>
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl px-4 py-3 text-sm font-medium outline-none transition-all duration-200"
                  style={{
                    backgroundColor: "var(--surface)",
                    border: "1.5px solid var(--border-strong)",
                    color: "var(--text)",
                  }}
                  onFocus={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = "var(--accent)";
                    (e.currentTarget as HTMLElement).style.boxShadow = "0 0 0 3px rgba(26,64,194,0.1)";
                  }}
                  onBlur={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = "var(--border-strong)";
                    (e.currentTarget as HTMLElement).style.boxShadow = "none";
                  }}
                  placeholder="you@example.com"
                />
              </div>

              <div className="space-y-1.5">
                <label
                  className="block text-[10px] font-bold uppercase tracking-widest"
                  style={{ color: "var(--text-3)" }}
                >
                  Password
                </label>
                <input
                  type="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl px-4 py-3 text-sm font-medium outline-none transition-all duration-200"
                  style={{
                    backgroundColor: "var(--surface)",
                    border: "1.5px solid var(--border-strong)",
                    color: "var(--text)",
                  }}
                  onFocus={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = "var(--accent)";
                    (e.currentTarget as HTMLElement).style.boxShadow = "0 0 0 3px rgba(26,64,194,0.1)";
                  }}
                  onBlur={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = "var(--border-strong)";
                    (e.currentTarget as HTMLElement).style.boxShadow = "none";
                  }}
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="sovereign-gradient w-full rounded-xl px-4 py-3.5 text-sm font-bold text-white transition-all duration-200 active:scale-[0.98] disabled:opacity-50 mt-2"
                style={{ boxShadow: "0 4px 20px rgba(26,64,194,0.32)" }}
                onMouseEnter={(e) => {
                  if (!loading) (e.currentTarget as HTMLElement).style.boxShadow = "0 6px 28px rgba(26,64,194,0.45)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 20px rgba(26,64,194,0.32)";
                }}
              >
                {loading ? "Signing in…" : "Sign in to Nudge"}
              </button>
            </form>
          </div>
        </div>

      </div>
    </>
  );
}
