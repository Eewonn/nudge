export type Importance = "low" | "medium" | "high";

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

export interface GroupedTasks {
  overdue: Task[];
  today: Task[];
  upcoming: Task[];
  someday: Task[];
}
