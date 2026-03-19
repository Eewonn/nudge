# Nudge - Product Plan

## 1) Product Summary

**Nudge** is a desktop-first personal web app that helps you stop forgetting important tasks and build consistency.

It is designed for one user (you), with support for:
- Work tasks
- Personal tasks
- Deadline-driven tasks
- Habit tracking (lightweight, tied to consistency)

Core value: show the right tasks at the right time, and nudge action before things become overdue.

---

## 2) Problem Statement

Current pain points:
- Tasks are forgotten
- Inconsistency in execution
- Deadlines can sneak up

Goal:
- Never miss critical tasks
- Build a reliable daily routine
- Maintain visibility on what matters most now

---

## 3) Success Criteria (30-Day Outcome)

Nudge is successful if after 30 days:
- Overdue tasks are reduced significantly
- Daily completion rate improves
- You trust the app as your single source of task truth
- You follow a consistent daily review habit

Primary measurable metrics:
- Completion rate (%)
- Streak count (days with planned tasks completed)
- Overdue task count

---

## 4) Product Principles

- **Personal-first**: built for your workflow, not generic teams
- **Clarity over complexity**: task lists first, projects/subtasks later
- **Urgency-aware nudges**: prioritize by due date + importance
- **Daily rhythm**: summary + review to build consistency
- **Editable by you**: easy to evolve since you own the code

---

## 5) Core User Flow (MVP)

1. Capture task quickly (title, due date, importance, category)
2. See prioritized list (urgent + important first)
3. Receive email reminders:
   - Immediate urgency nudges (near deadline / overdue risk)
   - Fixed daily summary of upcoming tasks
4. Complete tasks and mark habits done
5. End-of-day daily review screen
6. Track metrics (completion rate, streaks, overdue)

---

## 6) MVP Scope (Version 1)

### Must-have features
- Authentication (simple single-user login or protected access)
- Task management:
  - Create, edit, delete, complete
  - Fields: title, notes (optional), due date/time, importance, category (work/personal), recurrence (optional)
- Priority engine:
  - Sort by due date + importance
  - Flag urgent (due soon) and overdue
- Email reminders:
  - Daily digest (fixed time)
  - Urgency nudges (rule-based)
- Daily review page:
  - Today completed
  - Carry-over tasks
  - Plan tomorrow top priorities
- Habit tracker (simple):
  - Daily habits with done/not done
  - Streak count
- Dashboard metrics:
  - Completion rate
  - Streaks
  - Overdue count

### Out of scope for MVP (for now)
- Multi-user collaboration
- Calendar sync
- Quick capture widgets/extensions
- Advanced projects/subtasks
- Native mobile app (mobile web support only)

---

## 7) Nudge Logic (Initial Rules)

### Priority score suggestion (simple and explainable)
- High importance + near due date -> top priority
- Overdue tasks always pinned near top
- No due date tasks appear below dated tasks unless marked high importance

### Reminder rules suggestion
- Daily digest email: once every morning (e.g., 8:00 AM)
- Urgency email triggers:
  - 24 hours before deadline
  - 2 hours before deadline (for high importance)
  - Overdue notification once after due time

### Daily review prompts
- What got done today?
- What was missed and why?
- What are tomorrow's tasks?

---

## 8) Nice-to-Have Ideas (Post-MVP)

Ideas for your item #19 (features to defer):
- Quick capture input (global command palette style)
- Calendar integration (Google/Outlook)
- Subtasks and lightweight projects
- Weekly review screen
- Smart suggestions (auto-priority adjustments based on history)
- Focus mode (show only top 3 tasks)
- Snooze reasons analytics (why tasks slip)
- Email template customization
- Habit insights (best streak windows, missed-day patterns)

---

## 9) Suggested Free Tech Stack (Optional, Claude Code can change)

These are **suggestions only** and can be changed by Claude Code during implementation.

### JavaScript/TypeScript full-stack, easy deployment
- Frontend: Next.js + React + Tailwind CSS
- Backend: Next.js API routes (or server actions)
- Database: PostgreSQL (Supabase free tier)
- Auth: NextAuth/Auth.js or simple password gate for single-user mode
- Email: Resend (free tier)
- Scheduling: `node-cron` (self-host) or platform cron jobs
- Hosting: Vercel free tier

---

## 10) High-Level Build Phases

### Phase 1 - Foundation
- Initialize app and repo
- Set up DB schema for tasks, habits, reminders, daily reviews
- Implement single-user auth/protection

### Phase 2 - Task Core
- CRUD tasks
- Priority sorting and urgent/overdue states
- Basic desktop-first UI + mobile responsive layout

### Phase 3 - Reminder System
- Daily digest scheduler
- Urgency reminder scheduler
- Email templates and delivery logs

### Phase 4 - Consistency Layer
- Habit tracker
- Daily review screen
- Metrics dashboard (completion, streaks, overdue)

### Phase 5 - Stabilize
- QA and bug fixes
- Improve UX for speed and clarity
- Prepare backlog for post-MVP enhancements

---

## 11) Initial Data Model (Draft)

- `users` (single record expected)
- `tasks`
  - id, title, notes, category, importance, due_at, is_completed, completed_at, recurrence_rule, created_at, updated_at
- `habits`
  - id, name, target_frequency, is_active, created_at
- `habit_logs`
  - id, habit_id, date, is_done
- `daily_reviews`
  - id, review_date, summary, top_3_for_tomorrow
- `reminder_logs`
  - id, task_id, reminder_type, sent_at, status

---

## 12) Risks and Mitigations

- Risk: Too many features too early
  - Mitigation: lock MVP scope and ship in phases
- Risk: Reminder fatigue
  - Mitigation: keep reminders rule-based and adjustable
- Risk: Inconsistent usage
  - Mitigation: strong daily digest + daily review loop

---

## 13) Definition of MVP Done

MVP is done when:
- You can add/manage tasks and habits reliably
- Priority list is useful daily
- Email reminders are sent and trusted
- Daily review becomes part of routine
- Metrics dashboard reflects real progress

---

## 14) Next Action for Claude Code

When implementation starts, Claude Code should:
1. Propose final architecture based on this plan
2. Create technical spec (`spec.md`) from chosen stack
3. Build MVP in vertical slices (tasks -> reminders -> review -> metrics)
4. Keep stack choices practical and free-tier friendly

---

## 15) Notes from Your Inputs

- Single-user app (personal)
- Main categories: work, personal, deadlines and/or roles (academics, acm organization, thesis, etc)
- Habit tracker included
- Main pain: forgetting tasks and inconsistency
- Prioritization: due date + importance
- Reminder preference: urgency-based + fixed daily summary email
- Desktop-first with mobile web support
- Online web app, no calendar sync for MVP
- You want this to evolve over time based on your needs
