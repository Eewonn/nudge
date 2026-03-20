# Nudge — Product Plan

## Vision

Nudge is a **personal hub** for staying on track and not missing what matters. Not just a task manager — it covers tasks, events, meetings, and schedules. The core value: show the right things at the right time, and send smart nudges before anything important slips.

---

## Build Phases

### Phase 1 — Foundation ✅
- [x] Next.js App Router + TypeScript scaffold
- [x] Supabase auth (email/password, single-user)
- [x] DB schema: `tasks`, `habits`, `habit_logs`, `daily_reviews`, `reminder_logs`
- [x] Route layout: `/(app)` group with auth guard
- [x] Login page

### Phase 2 — Task Core ✅
- [x] Task CRUD (create, read, update, delete, complete)
- [x] Priority engine (`lib/priority.ts`) — overdue → high importance → due date → no date
- [x] Tasks list page with grouped/sorted view
- [x] Task form (capture page)
- [x] Category, importance, due date fields
- [x] Recurrence rules on tasks
- [x] Task search
- [x] Someday badge (tasks with no due date)
- [x] Weekly trend view
- [x] Stop recurrence action

### Phase 3 — Reminder System ✅
- [x] `lib/reminders.ts` — `getPendingReminders()` with 4 rule types
  - Daily digest (8:00 AM)
  - 24h before deadline
  - 2h before deadline (high importance only)
  - Once-after-overdue notification
- [x] `lib/email.ts` + `lib/email-templates.ts` — Resend-based email delivery
- [x] `app/api/cron/reminders/route.ts` — cron handler
- [x] `vercel.json` — daily 8am UTC cron schedule
- [x] Reminder logs tracked in DB

### Phase 4 — Consistency Layer ✅
- [x] Habits: full CRUD, archive/unarchive
- [x] Habit 7-day grid (weekly view)
- [x] Habit streak counter
- [x] Daily review: reflection form + top-3 task picker
- [x] Past reviews timeline (journal view)
- [x] Dashboard habits widget

### Phase 5 — UI Redesign ✅
- [x] Sovereign design system — `#1a40c2` primary, Manrope + Inter fonts
- [x] Light/dark sidebar (`#e5e8f0` / `#1f222a`)
- [x] Dashboard: Morning Briefing header, bento layout, urgent task cards with color strips, weekly rhythm chart
- [x] Capture page: hero layout, importance plinths, gradient CTA
- [x] Review page: 5-col layout, circular progress footer, stats bento
- [x] Voice capture (Groq/Llama)
- [x] Settings page

---

### Phase 6 — UX Polish (current)

#### 6a — Smarter Dashboard ✅
- [x] "Focus Now" section: top 5 items ranked by urgency (overdue → due in 2h → high importance today)
- [x] "Today's Schedule" compact strip: time-ordered list of all today's tasks
- [x] Overdue heat indicators: 1d = amber, 2d+ = red pulsing border (`.overdue-critical` CSS animation)
- [x] `computeAttentionSummary()` in `lib/stats.ts` — contextual label in header + completion bento

#### 6b — Better Task Editing ✅
- [x] Inline title editing: click title → input, blur/Enter saves, Esc cancels
- [x] Inline importance cycling: click the importance badge to cycle high → medium → low
- [x] Inline due date: due date label wraps a hidden `datetime-local` input, changes save immediately
- [x] `updateTask` server action handles partial field updates

#### 6c — Mobile Responsiveness ✅
- [x] `lib/nav-items.ts`: shared nav constant
- [x] `components/BottomNav.tsx`: fixed bottom bar, 4 nav icons + center capture FAB
- [x] Sidebar hidden on mobile (`hidden md:flex`)
- [x] Layout: `pb-16 md:pb-0` on main content area
- [x] Dashboard, tasks, capture pages: responsive padding (`p-4 md:p-8`)
- [x] TaskList header: stacks on mobile with flex-wrap

#### 6d — Keyboard Shortcuts ✅
- [x] `hooks/useKeyboardShortcuts.ts`: chord support (`g d`), ignores inputs
- [x] `components/ShortcutsOverlay.tsx`: `?` key shows cheatsheet modal
- [x] `components/AppShortcuts.tsx`: global shortcuts wired at layout level
- [x] `g d` / `g t` / `g h` / `g r` — navigation chords
- [x] `n` — open quick capture globally
- [x] `Esc` — close any modal/overlay
- [x] `?` hint in sidebar footer

---

### Phase 7 — Events & Calendar (current)

> Expanding Nudge from task management to a full personal hub: tasks, events, meetings, and schedules all in one place.

#### 7a — Events Data Model ✅
- [x] Add `events` table: `id`, `title`, `notes`, `type` (meeting | event | block | reminder), `start_at`, `end_at`, `location`, `url`, `is_all_day`, `recurrence_rule`, `category`, `importance`, `user_id`
- [x] Migration script (`004_events.sql`)
- [x] Server actions for events CRUD (`app/actions/events.ts`)
- [x] Extend reminder engine to fire on events (not just tasks) — `event-24h`, `event-2h` types
- [x] Extend email templates for event reminders (`eventReminder24h`, `eventReminder2h`)
- [x] `reminder_logs` migrated: `task_id` → `entity_id` + `entity_type`

#### 7b — Calendar View ✅
- [x] Week view: time-grid showing events + tasks with due times
- [x] Month view: dot indicators per day, click to switch to day view
- [x] Day view: hourly blocks with event blocks and task chips
- [x] Tasks with `due_at` appear as anchored chips on the calendar
- [x] Events appear as time-range blocks with type colors
- [x] Create event/task directly from calendar by clicking a time slot (QuickCreateModal)
- [x] All-day events strip in week/day views
- [x] Current-time "now" indicator line
- [x] Overlap detection for concurrent events (column layout)
- [x] Calendar added to sidebar + mobile bottom nav

#### 7c — Event Capture & Editing
- [ ] Event capture form (title, type, start/end time, location, recurrence)
- [ ] Inline editing on calendar
- [ ] Recurrence support (daily, weekly, monthly, custom RRULE)
- [ ] All-day events

#### 7d — Apple Calendar Integration
- [ ] ICS feed endpoint (`/api/calendar/feed.ics`) — subscribe from Apple Calendar
- [ ] Event import from ICS file upload
- [ ] Sync state tracking (`calendar_sync_log` table)

---

### Phase 8 — Intelligence Layer (future)

- [ ] AI-powered daily briefing summary
- [ ] Smart scheduling suggestions ("you have 2h free Thursday, want to block time for X?")
- [ ] Pattern detection ("you consistently miss Monday deadlines")
- [ ] Natural language event/task creation via voice or text
- [ ] Weekly review auto-generation from completed tasks + habits

---

## Data Model

```
tasks           — id, title, notes, category, importance, due_at, is_completed,
                  completed_at, recurrence_rule, user_id

events          — id, title, notes, type, start_at, end_at, location, url,
                  is_all_day, recurrence_rule, category, importance, user_id

habits          — id, name, target_frequency, is_active, user_id

habit_logs      — id, habit_id, date, is_done

daily_reviews   — id, review_date, summary, top_3_for_tomorrow, user_id

reminder_logs   — id, entity_id, entity_type (task|event), reminder_type,
                  sent_at, status
```

## Tech Stack

- **Framework**: Next.js App Router + TypeScript
- **Styling**: Tailwind CSS v4
- **Database**: Supabase (PostgreSQL) — staying relational; JSONB for flexible metadata if needed
- **Auth**: Supabase Auth (single-user, email/password)
- **Email**: Resend
- **Scheduling**: Vercel cron jobs
- **Package manager**: npm
