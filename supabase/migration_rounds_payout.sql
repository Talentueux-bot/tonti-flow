-- ============================================================================
-- TontiFlow — Migration : tours (rounds) + planification du versement
-- À exécuter dans Supabase → SQL Editor → Run. Idempotent.
-- ============================================================================

-- Tour courant + nombre de versements déjà effectués + date/heure planifiée
alter table public.groups add column if not exists current_round int not null default 1;
alter table public.groups add column if not exists payouts_done int not null default 0;
alter table public.groups add column if not exists payout_at timestamptz;

-- Chaque cotisation est rattachée à un tour
alter table public.contributions add column if not exists round int not null default 1;
