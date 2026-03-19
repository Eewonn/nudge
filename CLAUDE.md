# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Nudge** is a desktop-first single-user personal task management and habit tracking web app. The core value proposition: show the right tasks at the right time, and send email nudges before things become overdue. See `Plan.md` for the full product spec.

## Workflow

Before starting any non-trivial task (adding features, refactoring, multi-step changes):
1. Create a Task (using the TaskCreate tool) with a checklist of every step you plan to take
2. Present it to the user and wait for approval before proceeding
3. The user may comment, remove steps, or redirect — adjust the plan accordingly
4. Only begin implementation after the user confirms

## Stack

Follows the standard personal project stack (see `~/CLAUDE.md`):
- Next.js App Router + TypeScript
- Tailwind CSS v4
- Supabase (PostgreSQL + Auth)
- **Email**: Resend (free tier) for reminder delivery
- **Scheduling**: `node-cron` for reminder scheduling, or Vercel cron jobs

## Common Commands

```bash
npm run dev    # Start dev server
npm run build  # Production build
npm run lint   # Lint
```

## Architecture

### Key directories (planned)
- `app/` — Routes: dashboard, tasks, habits, review, api
- `lib/` — Supabase clients, priority engine, reminder scheduler, email templates
- `components/` — Shared UI components

### Priority Engine (`lib/priority.ts`)
The core business logic for task sorting — keep this pure/testable:
- Overdue tasks → pinned near top
- High importance + near due date → top priority
- No-due-date tasks → appear below dated tasks unless high importance

### Reminder Logic (`lib/reminders.ts`)
Rule-based triggers (not user-configurable in MVP):
- Daily digest: 8:00 AM every day
- 24h before deadline
- 2h before deadline (high importance only)
- Once-after-overdue notification

### Data Model

```
tasks        — id, title, notes, category, importance, due_at, is_completed, completed_at, recurrence_rule
habits       — id, name, target_frequency, is_active
habit_logs   — id, habit_id, date, is_done
daily_reviews — id, review_date, summary, top_3_for_tomorrow
reminder_logs — id, task_id, reminder_type, sent_at, status
```

### Auth
Single-user app — use simple Supabase Auth with email/password. No multi-user flows needed.

## Build Phases

1. **Foundation** — DB schema, auth, app scaffolding
2. **Task Core** — CRUD, priority sorting, urgent/overdue UI states
3. **Reminder System** — Scheduler, email delivery via Resend, reminder logs
4. **Consistency Layer** — Habit tracker, daily review screen, metrics dashboard
5. **Stabilize** — QA, UX polish

Build in vertical slices: tasks → reminders → review → metrics.
