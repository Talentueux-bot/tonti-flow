-- ============================================================================
-- TontiFlow — Migration : suivi des retraits (Payout PawaPay)
-- À exécuter dans Supabase → SQL Editor → Run. Idempotent.
-- ============================================================================

-- Référence du payout PawaPay (pour réconcilier via le webhook).
alter table public.wallet_transactions add column if not exists reference text;
