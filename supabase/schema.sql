-- ============================================================================
-- TontiFlow — Schéma de base de données
-- À exécuter UNE FOIS dans Supabase → SQL Editor → New query → Run.
-- Sans danger de relancer (idempotent grâce à "if not exists" / "drop policy").
-- ============================================================================

-- ── Profils utilisateurs (lié à auth.users) ─────────────────────────────────
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  first_name  text,
  last_name   text,
  phone       text,
  country     text,
  plan        text not null default 'free',
  created_at  timestamptz not null default now()
);

-- ── Tontines (groupes) ──────────────────────────────────────────────────────
create table if not exists public.groups (
  id           uuid primary key default gen_random_uuid(),
  owner_id     uuid not null references auth.users(id) on delete cascade,
  name         text not null,
  emoji        text default '🏠',
  description  text,
  amount       numeric not null default 0,
  currency     text not null default 'FCFA',
  frequency    text not null default 'monthly',  -- weekly | biweekly | monthly
  max_members  int  not null default 10,
  start_date   date,
  rotation     text default 'random',            -- random | manual
  status       text not null default 'active',   -- active | completed
  created_at   timestamptz not null default now()
);

-- ── Membres de chaque tontine ───────────────────────────────────────────────
create table if not exists public.group_members (
  id          uuid primary key default gen_random_uuid(),
  group_id    uuid not null references public.groups(id) on delete cascade,
  user_id     uuid references auth.users(id) on delete set null,
  name        text not null,
  phone       text,
  position    int,
  is_owner    boolean not null default false,
  created_at  timestamptz not null default now()
);

-- ── Cotisations / paiements ─────────────────────────────────────────────────
create table if not exists public.contributions (
  id          uuid primary key default gen_random_uuid(),
  group_id    uuid not null references public.groups(id) on delete cascade,
  member_id   uuid references public.group_members(id) on delete set null,
  amount      numeric not null default 0,
  status      text not null default 'pending',   -- pending | paid | late
  due_date    date,
  paid_at     timestamptz,
  created_at  timestamptz not null default now()
);

create index if not exists idx_groups_owner       on public.groups(owner_id);
create index if not exists idx_members_group       on public.group_members(group_id);
create index if not exists idx_contrib_group       on public.contributions(group_id);

-- ============================================================================
-- Sécurité au niveau ligne (RLS) : chaque utilisateur ne voit QUE ses données
-- ============================================================================
alter table public.profiles      enable row level security;
alter table public.groups        enable row level security;
alter table public.group_members enable row level security;
alter table public.contributions enable row level security;

-- Profils : chacun gère le sien
drop policy if exists "profiles_self" on public.profiles;
create policy "profiles_self" on public.profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

-- Tontines : le propriétaire a tous les droits sur les siennes
drop policy if exists "groups_owner" on public.groups;
create policy "groups_owner" on public.groups
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

-- Membres : accessibles via la tontine que l'on possède
drop policy if exists "members_owner" on public.group_members;
create policy "members_owner" on public.group_members
  for all using (
    exists (select 1 from public.groups g where g.id = group_id and g.owner_id = auth.uid())
  ) with check (
    exists (select 1 from public.groups g where g.id = group_id and g.owner_id = auth.uid())
  );

-- Cotisations : idem, via la tontine possédée
drop policy if exists "contrib_owner" on public.contributions;
create policy "contrib_owner" on public.contributions
  for all using (
    exists (select 1 from public.groups g where g.id = group_id and g.owner_id = auth.uid())
  ) with check (
    exists (select 1 from public.groups g where g.id = group_id and g.owner_id = auth.uid())
  );

-- ============================================================================
-- Création automatique du profil à l'inscription (copie les métadonnées auth)
-- ============================================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, first_name, last_name, phone, country)
  values (
    new.id,
    new.raw_user_meta_data ->> 'first_name',
    new.raw_user_meta_data ->> 'last_name',
    new.raw_user_meta_data ->> 'phone',
    new.raw_user_meta_data ->> 'country'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
