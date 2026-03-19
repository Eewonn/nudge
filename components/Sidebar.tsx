"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Crosshair,
  CheckSquare,
  Repeat2,
  BookOpen,
  Settings,
  LogOut,
  Zap,
} from "lucide-react";
import { createClient } from "@/lib/supabase";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/capture",   label: "Capture",   icon: Crosshair },
  { href: "/tasks",     label: "Tasks",     icon: CheckSquare },
  { href: "/habits",    label: "Habits",    icon: Repeat2 },
  { href: "/review",    label: "Review",    icon: BookOpen },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <aside
      style={{ backgroundColor: "var(--sb-bg)", borderRight: "1px solid var(--sb-border)" }}
      className="w-64 h-screen sticky top-0 flex flex-col py-8 px-6 shrink-0"
    >
      {/* Logo */}
      <div className="mb-8">
        <h1
          className="text-xl font-extrabold tracking-tight font-headline"
          style={{ color: "var(--sb-accent)" }}
        >
          Nudge
        </h1>
        <p
          className="text-[10px] uppercase tracking-widest font-bold mt-0.5"
          style={{ color: "var(--sb-fg)", opacity: 0.6 }}
        >
          personal reminder
        </p>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 active:translate-x-0.5"
              style={{
                color: active ? "var(--sb-fg-active)" : "var(--sb-fg)",
                fontWeight: active ? 700 : 500,
                fontSize: active ? "1.0625rem" : "0.9375rem",
                backgroundColor: "transparent",
              }}
              onMouseEnter={(e) => {
                if (!active) (e.currentTarget as HTMLElement).style.backgroundColor = "var(--sb-hover-bg)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
              }}
            >
              <Icon
                className="shrink-0"
                style={{
                  width: active ? "20px" : "18px",
                  height: active ? "20px" : "18px",
                  color: active ? "var(--sb-accent)" : "var(--sb-fg)",
                }}
              />
              <span className="font-headline">{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="space-y-3 pt-6" style={{ borderTop: "1px solid var(--sb-border)" }}>
        {/* Quick Capture */}
        <Link
          href="/capture"
          className="sovereign-gradient flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold text-white shadow-lg transition-all duration-200 active:scale-95"
          style={{ boxShadow: "0 4px 14px rgba(26, 64, 194, 0.25)" }}
        >
          <Zap className="h-4 w-4" />
          Quick Capture
        </Link>

        {/* Settings */}
        <button
          className="flex w-full items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200"
          style={{ color: "var(--sb-fg)" }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "var(--sb-hover-bg)"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "transparent"; }}
        >
          <Settings className="h-4 w-4 shrink-0" />
          <span>Settings</span>
        </button>

        {/* Sign out */}
        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200"
          style={{ color: "var(--sb-fg)" }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "var(--sb-hover-bg)"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "transparent"; }}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          <span>Sign out</span>
        </button>
      </div>
    </aside>
  );
}
