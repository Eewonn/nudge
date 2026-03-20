-- Events table
create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  notes text,
  type text not null default 'event',    -- meeting | event | block | reminder
  start_at timestamptz not null,
  end_at timestamptz,
  location text,
  url text,
  is_all_day boolean not null default false,
  recurrence_rule text,
  category text not null default 'personal',
  importance text not null default 'medium',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger events_updated_at
  before update on events
  for each row execute function update_updated_at();

alter table events enable row level security;

create policy "Users own their events"
  on events for all using (auth.uid() = user_id);

-- Migrate reminder_logs: task_id → entity_id + entity_type
-- entity_type distinguishes 'task' vs 'event'; NULL means digest (not entity-specific)
alter table reminder_logs
  add column if not exists entity_id uuid,
  add column if not exists entity_type text;

update reminder_logs
  set entity_id = task_id, entity_type = 'task'
  where task_id is not null;

-- Drop the RLS policy that depends on task_id before dropping the column
drop policy if exists "Users own their reminder logs" on reminder_logs;

alter table reminder_logs drop column if exists task_id;

create policy "Users own their reminder logs"
  on reminder_logs for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
