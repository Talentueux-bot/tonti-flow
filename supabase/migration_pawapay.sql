-- ============================================================================
-- TontiFlow — Migration : intégration PawaPay (intentions de paiement)
-- À exécuter dans Supabase → SQL Editor → Run. Idempotent.
-- ============================================================================

create table if not exists public.payment_intents (
  deposit_id  uuid primary key,
  user_id     uuid not null references auth.users(id) on delete cascade,
  purpose     text not null,                  -- cotisation | subscription | recharge
  amount      numeric not null,
  currency    text not null,
  status      text not null default 'PENDING', -- PENDING | COMPLETED | FAILED
  group_id    uuid,
  member_id   uuid,
  plan        text,
  applied     boolean not null default false,
  created_at  timestamptz not null default now()
);
create index if not exists idx_intents_user on public.payment_intents(user_id);

alter table public.payment_intents enable row level security;
drop policy if exists "intents_self" on public.payment_intents;
create policy "intents_self" on public.payment_intents
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Autoriser un membre à enregistrer SA propre cotisation (paiement de soi-même)
drop policy if exists "contrib_self_member" on public.contributions;
create policy "contrib_self_member" on public.contributions
  for insert with check (
    exists (select 1 from public.group_members m where m.id = member_id and m.user_id = auth.uid())
  );
