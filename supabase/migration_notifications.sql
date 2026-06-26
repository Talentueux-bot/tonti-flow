-- ============================================================================
-- TontiFlow — Migration : notifications enregistrées en base
-- À exécuter dans Supabase → SQL Editor → Run. Idempotent.
-- ============================================================================

create table if not exists public.notifications (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  type        text not null,                 -- payment | join | turn | verification | info
  title       text not null,
  detail      text,
  href        text,
  read        boolean not null default false,
  created_at  timestamptz not null default now()
);
create index if not exists idx_notif_user on public.notifications(user_id, created_at desc);

alter table public.notifications enable row level security;
drop policy if exists "notif_self" on public.notifications;
create policy "notif_self" on public.notifications
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Quand quelqu'un rejoint une tontine, notifier le propriétaire.
create or replace function public.join_group_by_code(p_code text, p_name text)
returns uuid
language plpgsql security definer set search_path = public as $$
declare g_id uuid; already int;
begin
  if auth.uid() is null then raise exception 'NOT_AUTHENTICATED'; end if;
  select id into g_id from public.groups where code = upper(p_code) limit 1;
  if g_id is null then raise exception 'GROUP_NOT_FOUND'; end if;

  select count(*) into already from public.group_members where group_id = g_id and user_id = auth.uid();
  if already = 0 then
    insert into public.group_members (group_id, user_id, name, position)
    values (g_id, auth.uid(), coalesce(nullif(p_name, ''), 'Membre'),
      (select coalesce(max(position), 0) + 1 from public.group_members where group_id = g_id));

    insert into public.notifications (user_id, type, title, detail, href)
    select g.owner_id, 'join', 'Nouveau membre 👥',
      coalesce(nullif(p_name, ''), 'Un membre') || ' a rejoint « ' || g.name || ' »',
      '/dashboard/groups/' || g_id
    from public.groups g
    where g.id = g_id and g.owner_id <> auth.uid();
  end if;
  return g_id;
end; $$;
