-- Fix reminder_logs schema:
-- 1. task_id must be nullable (daily-digest has no specific task)
-- 2. Add user_id so reminders can be filtered per-user without a task join

alter table reminder_logs
  alter column task_id drop not null;

alter table reminder_logs
  add column if not exists user_id uuid references auth.users(id) on delete cascade;

-- Rebuild RLS to handle both task-based and user-based rows
drop policy if exists "Users own their reminder logs" on reminder_logs;

create policy "Users own their reminder logs"
  on reminder_logs for all
  using (
    user_id = auth.uid()
    or task_id in (select id from tasks where user_id = auth.uid())
  )
  with check (
    user_id = auth.uid()
    or task_id in (select id from tasks where user_id = auth.uid())
  );
