# Nudge

A desktop-first personal task management and habit tracking web app. Shows the right tasks at the right time and sends email nudges before things become overdue.

## Stack

- **Framework**: Next.js (App Router) + TypeScript
- **Styling**: Tailwind CSS v4
- **Backend/Auth**: Supabase (PostgreSQL + Auth)
- **Email**: Resend
- **Icons**: lucide-react

## Routes

| Route | Description |
|---|---|
| `/dashboard` | Action hub — priority task list, habit tracker, stats |
| `/tasks` | Full task CRUD with kanban board and archive drawer |
| `/habits` | Habit management and logging |
| `/review` | Daily journal — reflection textarea, unfinished tasks, top-3 picker |
| `/capture` | Quick task capture |

## Key modules

| File | Role |
|---|---|
| `lib/priority.ts` | Priority engine — sorts tasks by urgency, importance, and due date |
| `lib/stats.ts` | Computes daily completion %, grade (A+→D), and habit streak |
| `lib/reminders.ts` | Rule-based reminder scheduler (24h, 2h, overdue triggers) |
| `lib/email.ts` | Resend integration for outbound email |
| `lib/email-templates.ts` | HTML email templates |
| `app/actions/` | Server actions for tasks, habits, and daily reviews |

## Data model

```
tasks          — id, title, notes, category, importance, due_at, is_completed, completed_at, recurrence_rule
habits         — id, name, target_frequency, is_active
habit_logs     — id, habit_id, date, is_done
daily_reviews  — id, review_date, summary, top_3_for_tomorrow
reminder_logs  — id, task_id, reminder_type, sent_at, status
```

## Development

```bash
npm run dev    # Start dev server on http://localhost:3000
npm run build  # Production build
npm run lint   # Lint
```

Requires `.env.local` with:
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
RESEND_API_KEY=
```

## Build status

| Phase | Status |
|---|---|
| 1 — Foundation (DB, auth, scaffold) | Done |
| 2 — Task core (CRUD, priority engine, UI) | Done |
| 3 — Reminder system (scheduler, email via Resend) | Done |
| 4 — Consistency layer (habits, daily review, stats) | Done |
| 5 — UI polish (Sovereign theme, Review redesign) | Done |
| 6 — Stabilize | Not started |
