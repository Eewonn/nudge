"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import type { Category, Importance } from "@/types";

export interface ParsedTask {
  title:      string;
  due_at:     string | null;
  importance: Importance;
  category:   Category;
  notes:      string | null;
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const CATEGORIES: Category[] = ["work", "personal", "academics", "acm", "thesis", "other"];
const IMPORTANCES: Importance[] = ["low", "medium", "high"];

export async function parseVoiceCapture(transcript: string): Promise<ParsedTask> {
  const now = new Date();
  const todayStr = now.toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });
  const isoNow = now.toISOString();

  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    systemInstruction: `You extract structured task data from spoken voice input.
Today is ${todayStr} (${isoNow}).

Return ONLY valid JSON with these fields:
- title: string (concise task title, cleaned up from speech)
- due_at: ISO 8601 string or null (resolve relative dates like "tomorrow", "Friday", "in 2 hours" to absolute UTC times; use null if no deadline mentioned)
- importance: "low" | "medium" | "high" (infer from urgency words; default "medium")
- category: "work" | "personal" | "academics" | "acm" | "thesis" | "other" (infer from context; default "personal")
- notes: string or null (any extra detail that doesn't fit in the title)

No explanation, no markdown, just the JSON object.`,
  });

  const result = await model.generateContent(transcript);
  const raw = result.response.text().trim();

  // Strip markdown code fences if present
  const json = raw.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "").trim();
  const parsed = JSON.parse(json) as ParsedTask;

  // Validate / sanitise
  if (!parsed.title || typeof parsed.title !== "string") throw new Error("No title");
  if (!IMPORTANCES.includes(parsed.importance)) parsed.importance = "medium";
  if (!CATEGORIES.includes(parsed.category))   parsed.category   = "personal";
  if (parsed.due_at && isNaN(Date.parse(parsed.due_at))) parsed.due_at = null;

  return parsed;
}
