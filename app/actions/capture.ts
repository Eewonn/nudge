"use server";

import Groq from "groq-sdk";
import type { Category, Importance } from "@/types";

export interface ParsedTask {
  title:      string;
  due_at:     string | null;
  importance: Importance;
  category:   Category;
  notes:      string | null;
}

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY, timeout: 8000 });

const CATEGORIES: Category[] = ["work", "personal", "academics", "acm", "thesis", "other"];
const IMPORTANCES: Importance[] = ["low", "medium", "high"];

export async function parseVoiceCapture(transcript: string): Promise<ParsedTask> {
  const now = new Date();
  const todayStr = now.toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });
  const isoNow = now.toISOString();

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "system",
        content: `You extract structured task data from spoken voice input.
Today is ${todayStr} (${isoNow}).

Return ONLY valid JSON with these fields:
- title: string (the task title — keep it close to what was said; only remove filler words like "um", "uh", "like", trailing phrases like "it's a high priority task" or "within today" that belong in other fields; do NOT rephrase or rewrite)
- due_at: ISO 8601 string or null (resolve relative dates like "tomorrow", "Friday", "in 2 hours" to absolute UTC times; use null if no deadline mentioned)
- importance: "low" | "medium" | "high" (infer from urgency words; default "medium")
- category: "work" | "personal" | "academics" | "acm" | "thesis" | "other" (infer from context; default "personal")
- notes: string or null (any extra detail that doesn't fit in the title)

No explanation, no markdown, just the JSON object.`,
      },
      { role: "user", content: transcript },
    ],
    temperature: 0,
    response_format: { type: "json_object" },
  });

  const raw = completion.choices[0]?.message?.content?.trim() ?? "";

  const parsed = JSON.parse(raw) as ParsedTask;

  // Validate / sanitise
  if (!parsed.title || typeof parsed.title !== "string") throw new Error("No title");
  if (!IMPORTANCES.includes(parsed.importance)) parsed.importance = "medium";
  if (!CATEGORIES.includes(parsed.category))   parsed.category   = "personal";
  if (parsed.due_at && isNaN(Date.parse(parsed.due_at))) parsed.due_at = null;

  return parsed;
}
