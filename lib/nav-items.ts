import { LayoutDashboard, CheckSquare, BookOpen, RefreshCw } from "lucide-react";

export const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/tasks",     label: "Tasks",     icon: CheckSquare },
  { href: "/habits",    label: "Habits",    icon: RefreshCw },
  { href: "/review",    label: "Review",    icon: BookOpen },
] as const;
