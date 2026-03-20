import Sidebar from "@/components/Sidebar";
import BottomNav from "@/components/BottomNav";
import AppShortcuts from "@/components/AppShortcuts";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-full">
      <Sidebar />
      <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
        {children}
      </main>
      <BottomNav />
      <AppShortcuts />
    </div>
  );
}
