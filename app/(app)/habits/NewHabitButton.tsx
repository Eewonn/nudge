"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import HabitForm from "@/components/HabitForm";

export default function NewHabitButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 rounded-xl bg-accent px-3.5 py-2 text-[13px] font-semibold text-white hover:bg-accent-hover transition-colors"
      >
        <Plus className="h-3.5 w-3.5" />
        New habit
      </button>
      {open && <HabitForm onClose={() => setOpen(false)} />}
    </>
  );
}
