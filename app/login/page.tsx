"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState<string | null>(null);
  const [loading,  setLoading]  = useState(false);

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
        @keyframes fade-up {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes ring-pulse {
          0%   { transform: scale(0.78); opacity: 0.6; }
          100% { transform: scale(1.55); opacity: 0; }
        }
        @keyframes logo-float {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-7px); }
        }
        .u1 { animation: fade-up 0.55s cubic-bezier(.16,1,.3,1) both .05s; }
        .u2 { animation: fade-up 0.55s cubic-bezier(.16,1,.3,1) both .15s; }
        .u3 { animation: fade-up 0.55s cubic-bezier(.16,1,.3,1) both .25s; }
        .u4 { animation: fade-up 0.55s cubic-bezier(.16,1,.3,1) both .35s; }
        .u5 { animation: fade-up 0.55s cubic-bezier(.16,1,.3,1) both .45s; }
        .u6 { animation: fade-up 0.55s cubic-bezier(.16,1,.3,1) both .55s; }
        .logo-float { animation: logo-float 4s ease-in-out infinite; }
        .ring {
          position: absolute;
          border-radius: 9999px;
          border: 1px solid rgba(255,255,255,0.22);
          animation: ring-pulse 3.4s ease-out infinite;
        }
        .login-input {
          width: 100%;
          background: #ffffff;
          border: 1.5px solid #c4c5d6;
          border-radius: 12px;
          padding: 0.8125rem 1rem;
          font-family: var(--font-plus-jakarta), sans-serif;
          font-size: 0.875rem;
          font-weight: 500;
          color: #181c21;
          outline: none;
          transition: border-color 0.18s, box-shadow 0.18s;
          box-sizing: border-box;
        }
        .login-input::placeholder { color: #b0b2c4; }
        .login-input:focus {
          border-color: #1a40c2;
          box-shadow: 0 0 0 3px rgba(26,64,194,0.1);
        }
        .login-btn {
          width: 100%;
          background: linear-gradient(135deg, #1a40c2 0%, #3b5bdb 100%);
          color: #fff;
          font-family: var(--font-plus-jakarta), sans-serif;
          font-size: 0.9rem;
          font-weight: 700;
          padding: 0.9375rem 1rem;
          border-radius: 12px;
          border: none;
          cursor: pointer;
          transition: transform 0.18s, box-shadow 0.18s, opacity 0.18s;
          box-shadow: 0 4px 20px rgba(26,64,194,0.3);
        }
        .login-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 8px 28px rgba(26,64,194,0.42);
        }
        .login-btn:active:not(:disabled) { transform: scale(0.985); }
        .login-btn:disabled { opacity: 0.5; cursor: not-allowed; }
      `}</style>

      <div style={{ minHeight: "100vh", display: "flex", backgroundColor: "#f8f9ff" }}>

        {/* ── Left brand panel ─────────────────────────────────────── */}
        <div
          className="hidden lg:flex"
          style={{
            width: "440px",
            flexShrink: 0,
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "3rem",
            background: "linear-gradient(155deg, #0d1d6a 0%, #1a40c2 55%, #2d55d4 100%)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Radial highlight */}
          <div style={{
            position: "absolute", inset: 0, pointerEvents: "none",
            background: "radial-gradient(ellipse 85% 60% at 50% 44%, rgba(255,255,255,0.04) 0%, transparent 70%)",
          }} />

          {/* Wordmark */}
          <div className="u1" style={{ position: "relative", zIndex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
              <Image src="/nudge-logo.png" alt="Nudge" width={28} height={28} style={{ borderRadius: "7px" }} />
              <span style={{
                fontFamily: "var(--font-plus-jakarta), sans-serif",
                fontSize: "0.72rem", fontWeight: 700,
                letterSpacing: "0.22em", textTransform: "uppercase",
                color: "rgba(255,255,255,0.55)",
              }}>
                nudge
              </span>
            </div>
          </div>

          {/* Center: floating logo + name */}
          <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
            <div style={{ position: "relative", width: "220px", height: "220px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div className="ring" style={{ width: "220px", height: "220px", animationDelay: "0s" }} />
              <div className="ring" style={{ width: "166px", height: "166px", animationDelay: "0.85s" }} />
              <div className="ring" style={{ width: "112px", height: "112px", animationDelay: "1.7s" }} />
            </div>

            <div className="u2" style={{ marginTop: "1.75rem" }}>
              <h1 style={{
                fontFamily: "var(--font-plus-jakarta), sans-serif",
                fontSize: "3rem", fontWeight: 800,
                color: "#ffffff", letterSpacing: "-0.035em",
                lineHeight: 1, marginBottom: "0.5rem",
              }}>
                nudge
              </h1>
              <p style={{
                fontFamily: "var(--font-plus-jakarta), sans-serif",
                fontSize: "0.7rem", fontWeight: 500,
                color: "rgba(255,255,255,0.45)",
                letterSpacing: "0.18em", textTransform: "uppercase",
              }}>
                stay on track
              </p>
            </div>
          </div>

          {/* Feature list */}
          <div className="u3" style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {[
              { label: "Priority Tasks",  desc: "What matters most, always first" },
              { label: "Habit Tracking",  desc: "Build streaks that actually stick" },
              { label: "Smart Reminders", desc: "Nudged before you're overdue" },
            ].map((f) => (
              <div key={f.label} style={{
                display: "flex", alignItems: "center", gap: "0.75rem",
                padding: "0.7rem 1rem", borderRadius: "12px",
                background: "rgba(255,255,255,0.07)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}>
                <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: "rgba(255,255,255,0.65)", flexShrink: 0 }} />
                <div style={{ minWidth: 0 }}>
                  <span style={{ fontFamily: "var(--font-plus-jakarta), sans-serif", fontSize: "0.8rem", fontWeight: 700, color: "rgba(255,255,255,0.88)" }}>
                    {f.label}
                  </span>
                  <span style={{ fontFamily: "var(--font-plus-jakarta), sans-serif", fontSize: "0.75rem", fontWeight: 400, color: "rgba(255,255,255,0.4)", marginLeft: "0.5rem" }}>
                    {f.desc}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Vertical divider */}
        <div
          className="hidden lg:block"
          style={{
            width: "1px", flexShrink: 0, alignSelf: "stretch",
            background: "linear-gradient(to bottom, transparent, rgba(26,64,194,0.18) 20%, rgba(26,64,194,0.18) 80%, transparent)",
          }}
        />

        {/* ── Right form panel ─────────────────────────────────────── */}
        <div style={{
          flex: 1, display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          padding: "3rem 2rem",
          backgroundColor: "#f8f9ff",
          position: "relative",
        }}>
          {/* Subtle top glow */}
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0, height: "160px",
            background: "linear-gradient(to bottom, rgba(26,64,194,0.04), transparent)",
            pointerEvents: "none",
          }} />

          {/* Mobile logo */}
          <div className="lg:hidden u1" style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "2.5rem" }}>
            <Image src="/nudge-logo.png" alt="Nudge" width={56} height={56} style={{ borderRadius: "14px", marginBottom: "0.75rem" }} />
            <p style={{ fontFamily: "var(--font-plus-jakarta), sans-serif", fontWeight: 800, fontSize: "1.2rem", color: "#181c21" }}>nudge</p>
          </div>

          <div style={{ width: "100%", maxWidth: "360px", position: "relative" }}>

            {/* Heading */}
            <div className="u4" style={{ marginBottom: "2rem" }}>
              <h2 style={{
                fontFamily: "var(--font-plus-jakarta), sans-serif",
                fontSize: "1.875rem", fontWeight: 800,
                color: "#181c21", letterSpacing: "-0.03em",
                marginBottom: "0.375rem",
              }}>
                Welcome back
              </h2>
              <p style={{ fontFamily: "var(--font-plus-jakarta), sans-serif", fontSize: "0.875rem", color: "#747686" }}>
                Sign in to your personal workspace
              </p>
            </div>

            {/* Error banner */}
            {error && (
              <div style={{
                marginBottom: "1.25rem",
                display: "flex", alignItems: "flex-start", gap: "0.625rem",
                padding: "0.875rem 1rem", borderRadius: "12px",
                background: "#ffdad6", border: "1px solid #f87171",
              }}>
                <svg width="14" height="14" style={{ color: "#ba1a1a", flexShrink: 0, marginTop: "1px" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z" />
                </svg>
                <p style={{ fontFamily: "var(--font-plus-jakarta), sans-serif", fontSize: "0.8rem", color: "#ba1a1a" }}>{error}</p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>

              <div className="u4">
                <label style={{
                  display: "block",
                  fontFamily: "var(--font-plus-jakarta), sans-serif",
                  fontSize: "0.65rem", fontWeight: 700,
                  letterSpacing: "0.12em", textTransform: "uppercase",
                  color: "#747686", marginBottom: "0.5rem",
                }}>
                  Email
                </label>
                <input
                  type="email" required autoComplete="email"
                  value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="login-input"
                />
              </div>

              <div className="u5">
                <label style={{
                  display: "block",
                  fontFamily: "var(--font-plus-jakarta), sans-serif",
                  fontSize: "0.65rem", fontWeight: 700,
                  letterSpacing: "0.12em", textTransform: "uppercase",
                  color: "#747686", marginBottom: "0.5rem",
                }}>
                  Password
                </label>
                <input
                  type="password" required autoComplete="current-password"
                  value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="login-input"
                />
              </div>

              <div className="u6" style={{ paddingTop: "0.25rem" }}>
                <button type="submit" disabled={loading} className="login-btn">
                  {loading ? "Signing in…" : "Sign in to Nudge"}
                </button>
              </div>
            </form>

          </div>
        </div>

      </div>
    </>
  );
}
