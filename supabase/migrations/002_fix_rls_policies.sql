-- Fix RLS policies to include explicit WITH CHECK for INSERT/UPDATE operations.
-- PostgreSQL's FOR ALL USING (...) should cover inserts, but Supabase requires
-- an explicit WITH CHECK clause for insert/upsert to pass RLS.

drop policy if exists "Users own their tasks" on tasks;
drop policy if exists "Users own their habits" on habits;
drop policy if exists "Users own their habit logs" on habit_logs;
drop policy if exists "Users own their daily reviews" on daily_reviews;
drop policy if exists "Users own their reminder logs" on reminder_logs;

create policy "Users own their tasks"
  on tasks for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users own their habits"
  on habits for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users own their habit logs"
  on habit_logs for all
  using (habit_id in (select id from habits where user_id = auth.uid()))
  with check (habit_id in (select id from habits where user_id = auth.uid()));

create policy "Users own their daily reviews"
  on daily_reviews for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users own their reminder logs"
  on reminder_logs for all
  using (task_id in (select id from tasks where user_id = auth.uid()))
  with check (task_id in (select id from tasks where user_id = auth.uid()));
