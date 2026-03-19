-- Tasks
create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  notes text,
  category text not null default 'personal', -- work | personal | academics | acm | thesis | other
  importance text not null default 'medium',  -- low | medium | high
  due_at timestamptz,
  is_completed boolean not null default false,
  completed_at timestamptz,
  recurrence_rule text, -- e.g. RRULE:FREQ=DAILY
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Habits
create table if not exists habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  target_frequency text not null default 'daily', -- daily | weekly
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Habit logs
create table if not exists habit_logs (
  id uuid primary key default gen_random_uuid(),
  habit_id uuid references habits(id) on delete cascade not null,
  date date not null,
  is_done boolean not null default false,
  unique(habit_id, date)
);

-- Daily reviews
create table if not exists daily_reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  review_date date not null,
  summary text,
  top_3_for_tomorrow text[], -- array of task titles / notes
  created_at timestamptz not null default now(),
  unique(user_id, review_date)
);

-- Reminder logs
create table if not exists reminder_logs (
  id uuid primary key default gen_random_uuid(),
  task_id uuid references tasks(id) on delete cascade not null,
  reminder_type text not null, -- daily_digest | 24h | 2h | overdue
  sent_at timestamptz not null default now(),
  status text not null default 'sent' -- sent | failed
);

-- Auto-update updated_at on tasks
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger tasks_updated_at
  before update on tasks
  for each row execute function update_updated_at();

-- Row-level security
alter table tasks enable row level security;
alter table habits enable row level security;
alter table habit_logs enable row level security;
alter table daily_reviews enable row level security;
alter table reminder_logs enable row level security;

create policy "Users own their tasks"
  on tasks for all using (auth.uid() = user_id);

create policy "Users own their habits"
  on habits for all using (auth.uid() = user_id);

create policy "Users own their habit logs"
  on habit_logs for all
  using (habit_id in (select id from habits where user_id = auth.uid()));

create policy "Users own their daily reviews"
  on daily_reviews for all using (auth.uid() = user_id);

create policy "Users own their reminder logs"
  on reminder_logs for all
  using (task_id in (select id from tasks where user_id = auth.uid()));
