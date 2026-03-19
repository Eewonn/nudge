"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  CheckSquare,
  Repeat2,
  BookOpen,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Monitor,
} from "lucide-react";
import { clsx } from "clsx";
import { createClient } from "@/lib/supabase";
import { useTheme, type Theme } from "@/components/ThemeProvider";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/tasks",     label: "Tasks",     icon: CheckSquare },
  { href: "/habits",    label: "Habits",    icon: Repeat2 },
  { href: "/review",    label: "Review",    icon: BookOpen },
];

const THEME_CYCLE: Theme[] = ["light", "dark", "system"];
const THEME_ICON = { light: Sun, dark: Moon, system: Monitor };
const THEME_LABEL = { light: "Light", dark: "Dark", system: "System" };

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  function cycleTheme() {
    const next = THEME_CYCLE[(THEME_CYCLE.indexOf(theme) + 1) % THEME_CYCLE.length];
    setTheme(next);
  }

  const ThemeIcon = THEME_ICON[theme];

  return (
    <aside
      className={clsx(
        "relative flex flex-col border-r border-sidebar-border bg-sidebar transition-all duration-200 ease-in-out shrink-0",
        collapsed ? "w-[60px]" : "w-[220px]"
      )}
    >
      {/* Logo */}
      <div
        className={clsx(
          "flex h-14 items-center border-b border-sidebar-border px-4",
          collapsed && "justify-center px-0"
        )}
      >
        {collapsed ? (
          <div className="w-7 h-7 rounded-md bg-accent flex items-center justify-center">
            <span className="text-white font-semibold text-xs">N</span>
          </div>
        ) : (
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-accent flex items-center justify-center shrink-0">
              <span className="text-white font-semibold text-xs">N</span>
            </div>
            <span className="text-[15px] font-semibold tracking-tight text-text">nudge</span>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 space-y-0.5 px-2">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              title={collapsed ? label : undefined}
              style={active ? { backgroundColor: "var(--nav-active)", color: "var(--accent)" } : {}}
              className={clsx(
                "flex items-center gap-3 rounded-lg px-2.5 py-2 text-[13.5px] font-medium transition-colors",
                active ? "text-accent" : "text-text-2 hover:text-text",
                collapsed && "justify-center gap-0"
              )}
              onMouseEnter={(e) => {
                if (!active) (e.currentTarget as HTMLElement).style.backgroundColor = "var(--nav-hover)";
              }}
              onMouseLeave={(e) => {
                if (!active) (e.currentTarget as HTMLElement).style.backgroundColor = "";
              }}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span>{label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Bottom actions */}
      <div className="border-t border-sidebar-border p-2 space-y-0.5">
        {/* Theme toggle */}
        <button
          onClick={cycleTheme}
          title={collapsed ? `Theme: ${THEME_LABEL[theme]}` : undefined}
          className={clsx(
            "flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-[13.5px] font-medium text-text-3 hover:text-text transition-colors",
            collapsed && "justify-center gap-0"
          )}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.backgroundColor = "var(--nav-hover)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.backgroundColor = "";
          }}
        >
          <ThemeIcon className="h-4 w-4 shrink-0" />
          {!collapsed && (
            <span className="flex-1 text-left">{THEME_LABEL[theme]}</span>
          )}
        </button>

        {/* Sign out */}
        <button
          onClick={handleSignOut}
          title={collapsed ? "Sign out" : undefined}
          className={clsx(
            "flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-[13.5px] font-medium text-text-3 hover:text-text transition-colors",
            collapsed && "justify-center gap-0"
          )}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.backgroundColor = "var(--nav-hover)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.backgroundColor = "";
          }}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && <span>Sign out</span>}
        </button>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed((c) => !c)}
        className="absolute -right-3 top-[3.5rem] flex h-6 w-6 items-center justify-center rounded-full border border-border bg-surface text-text-3 shadow-sm hover:text-text hover:border-border-strong transition-colors z-10"
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed
          ? <ChevronRight className="h-3 w-3" />
          : <ChevronLeft className="h-3 w-3" />}
      </button>
    </aside>
  );
}
