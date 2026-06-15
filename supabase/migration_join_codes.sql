-- ============================================================================
-- TontiFlow — Migration : code unique par tontine + rejoindre par code/lien
-- À exécuter dans Supabase → SQL Editor → Run (après schema.sql). Idempotent.
-- ============================================================================

-- ── Générateur de code unique à 8 caractères (sans I/O/0/1 ambigus) ──────────
create or replace function public.gen_group_code() returns text
language plpgsql as $$
declare
  chars text := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  result text;
  i int;
begin
  loop
    result := '';
    for i in 1..8 loop
      result := result || substr(chars, floor(random() * length(chars))::int + 1, 1);
    end loop;
    exit when not exists (select 1 from public.groups where code = result);
  end loop;
  return result;
end;
$$;

-- ── Colonne code (ajout + remplissage des tontines existantes + contrainte) ──
alter table public.groups add column if not exists code text;
update public.groups set code = public.gen_group_code() where code is null;
alter table public.groups alter column code set default public.gen_group_code();
alter table public.groups alter column code set not null;

do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'groups_code_key') then
    alter table public.groups add constraint groups_code_key unique (code);
  end if;
end $$;

-- ── Helper anti-récursion : l'utilisateur courant est-il membre du groupe ? ──
create or replace function public.is_member(p_group uuid) returns boolean
language sql security definer stable set search_path = public as $$
  select exists (
    select 1 from public.group_members
    where group_id = p_group and user_id = auth.uid()
  );
$$;

-- ── RLS : voir aussi les tontines que l'on a REJOINTES (pas que les siennes) ─
drop policy if exists "groups_select_member" on public.groups;
create policy "groups_select_member" on public.groups
  for select using (auth.uid() = owner_id or public.is_member(id));

drop policy if exists "members_select_member" on public.group_members;
create policy "members_select_member" on public.group_members
  for select using (
    public.is_member(group_id)
    or exists (select 1 from public.groups g where g.id = group_id and g.owner_id = auth.uid())
  );

drop policy if exists "contrib_select_member" on public.contributions;
create policy "contrib_select_member" on public.contributions
  for select using (
    public.is_member(group_id)
    or exists (select 1 from public.groups g where g.id = group_id and g.owner_id = auth.uid())
  );

-- ── Rechercher une tontine par code (aperçu limité, sans exposer toute la table)
create or replace function public.find_group_by_code(p_code text)
returns table (
  id uuid, name text, emoji text, amount numeric, currency text,
  member_count bigint, max_members int
)
language sql security definer stable set search_path = public as $$
  select g.id, g.name, g.emoji, g.amount, g.currency,
         (select count(*) from public.group_members m where m.group_id = g.id),
         g.max_members
  from public.groups g
  where g.code = upper(p_code)
  limit 1;
$$;

-- ── Rejoindre une tontine par code ──────────────────────────────────────────
create or replace function public.join_group_by_code(p_code text, p_name text)
returns uuid
language plpgsql security definer set search_path = public as $$
declare
  g_id uuid;
  already int;
begin
  if auth.uid() is null then raise exception 'NOT_AUTHENTICATED'; end if;
  select id into g_id from public.groups where code = upper(p_code) limit 1;
  if g_id is null then raise exception 'GROUP_NOT_FOUND'; end if;

  select count(*) into already
  from public.group_members where group_id = g_id and user_id = auth.uid();

  if already = 0 then
    insert into public.group_members (group_id, user_id, name, position)
    values (
      g_id, auth.uid(), coalesce(nullif(p_name, ''), 'Membre'),
      (select coalesce(max(position), 0) + 1 from public.group_members where group_id = g_id)
    );
  end if;
  return g_id;
end;
$$;

grant execute on function public.find_group_by_code(text) to authenticated;
grant execute on function public.join_group_by_code(text, text) to authenticated;
