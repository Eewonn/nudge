export type Importance = "low" | "medium" | "high";

export type EventType = "meeting" | "event" | "block" | "reminder";

export type Category =
  | "work"
  | "personal"
  | "academics"
  | "acm"
  | "thesis"
  | "other";

export interface Task {
  id: string;
  user_id: string;
  title: string;
  notes: string | null;
  category: Category;
  importance: Importance;
  due_at: string | null; // ISO string
  is_completed: boolean;
  completed_at: string | null;
  recurrence_rule: string | null;
  created_at: string;
  updated_at: string;
}

export type TaskGroup = "overdue" | "today" | "upcoming" | "someday";

export interface Habit {
  id: string;
  user_id: string;
  name: string;
  target_frequency: number; // 1–7 days per week
  is_active: boolean;
  created_at: string;
}

export interface HabitLog {
  id: string;
  habit_id: string;
  date: string; // ISO date string YYYY-MM-DD
}

export interface DailyReview {
  id: string;
  user_id: string;
  review_date: string; // YYYY-MM-DD
  summary: string;
  top_3_for_tomorrow: string[];
  created_at: string;
  updated_at: string;
}

export interface Event {
  id: string;
  user_id: string;
  title: string;
  notes: string | null;
  type: EventType;
  start_at: string; // ISO string
  end_at: string | null;
  location: string | null;
  url: string | null;
  is_all_day: boolean;
  recurrence_rule: string | null;
  category: Category;
  importance: Importance;
  created_at: string;
  updated_at: string;
}

export interface GroupedTasks {
  overdue: Task[];
  today: Task[];
  upcoming: Task[];
  someday: Task[];
}
