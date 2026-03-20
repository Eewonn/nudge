"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Plus, Settings } from "lucide-react";
import { NAV_ITEMS } from "@/lib/nav-items";

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 flex items-center md:hidden"
      style={{
        backgroundColor: "var(--sb-bg)",
        borderTop: "1px solid var(--sb-border)",
        paddingBottom: "env(safe-area-inset-bottom)",
        height: "64px",
      }}
    >
      {/* First two nav items */}
      {NAV_ITEMS.slice(0, 2).map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(href + "/");
        return (
          <Link
            key={href}
            href={href}
            className="flex-1 flex flex-col items-center justify-center gap-1 py-2 transition-colors"
            style={{ color: active ? "var(--sb-accent)" : "var(--sb-fg)" }}
          >
            <Icon style={{ width: active ? "22px" : "20px", height: active ? "22px" : "20px" }} />
            <span className="text-[9px] font-bold uppercase tracking-wider">{label}</span>
          </Link>
        );
      })}

      {/* Center capture FAB */}
      <Link
        href="/capture"
        className="flex-none sovereign-gradient w-12 h-12 rounded-full flex items-center justify-center mx-3 transition-transform active:scale-95"
        style={{ boxShadow: "0 4px 16px rgba(26,64,194,0.35)" }}
        aria-label="Capture"
      >
        <Plus className="h-5 w-5 text-white" />
      </Link>

      {/* Last two nav items */}
      {NAV_ITEMS.slice(2, 4).map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(href + "/");
        return (
          <Link
            key={href}
            href={href}
            className="flex-1 flex flex-col items-center justify-center gap-1 py-2 transition-colors"
            style={{ color: active ? "var(--sb-accent)" : "var(--sb-fg)" }}
          >
            <Icon style={{ width: active ? "22px" : "20px", height: active ? "22px" : "20px" }} />
            <span className="text-[9px] font-bold uppercase tracking-wider">{label}</span>
          </Link>
        );
      })}

      {/* Settings */}
      <Link
        href="/settings"
        className="flex-1 flex flex-col items-center justify-center gap-1 py-2 transition-colors"
        style={{ color: pathname === "/settings" ? "var(--sb-accent)" : "var(--sb-fg)" }}
      >
        <Settings style={{ width: "20px", height: "20px" }} />
        <span className="text-[9px] font-bold uppercase tracking-wider">Settings</span>
      </Link>
    </nav>
  );
}
