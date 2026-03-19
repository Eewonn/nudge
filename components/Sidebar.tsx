"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  CheckSquare,
  BookOpen,
  Settings,
  LogOut,
} from "lucide-react";
import { createClient } from "@/lib/supabase";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/tasks",     label: "Tasks",     icon: CheckSquare },
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
      <div className="mb-8 flex items-center gap-2">
        <Image
          src="/nudge-logo.png"
          alt="Nudge"
          width={40}
          height={40}
          unoptimized
          className="shrink-0 rounded-lg"
        />
        <div>
          <h1
            className="text-lg font-extrabold tracking-tight leading-tight"
            style={{ color: "var(--sb-accent)" }}
          >
            Nudge
          </h1>
          <p
            className="text-[9px] uppercase tracking-widest font-bold"
            style={{ color: "var(--sb-fg)", opacity: 0.55 }}
          >
            stay on track
          </p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200"
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
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="space-y-1 pt-6" style={{ borderTop: "1px solid var(--sb-border)" }}>
        <Link
          href="/settings"
          className="flex w-full items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200"
          style={{
            color: pathname === "/settings" ? "var(--sb-fg-active)" : "var(--sb-fg)",
            fontWeight: pathname === "/settings" ? 700 : 500,
          }}
          onMouseEnter={(e) => {
            if (pathname !== "/settings") (e.currentTarget as HTMLElement).style.backgroundColor = "var(--sb-hover-bg)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
          }}
        >
          <Settings
            className="h-4 w-4 shrink-0"
            style={{ color: pathname === "/settings" ? "var(--sb-accent)" : "var(--sb-fg)" }}
          />
          <span>Settings</span>
        </Link>

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
