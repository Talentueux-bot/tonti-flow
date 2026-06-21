-- ============================================================================
-- TontiFlow — Migration : frais de service + revenus admin
-- À exécuter dans Supabase → SQL Editor → Run. Idempotent.
-- ============================================================================

-- Colonnes de frais sur les paiements
alter table public.payment_intents add column if not exists platform_fee numeric not null default 0;
alter table public.payment_intents add column if not exists total_paid   numeric not null default 0;

-- Revenus agrégés (réservé aux administrateurs).
-- Security definer : contourne la RLS pour agréger TOUTES les transactions,
-- mais vérifie d'abord que l'appelant est administrateur (par email du JWT).
create or replace function public.admin_revenue()
returns table (today numeric, month numeric, total numeric, tx_count bigint, total_processed numeric)
language plpgsql security definer set search_path = public as $$
begin
  if lower(coalesce(auth.jwt() ->> 'email', '')) not in ('sonfackdiviol45@gmail.com') then
    raise exception 'NOT_ADMIN';
  end if;

  return query
  select
    coalesce(sum(platform_fee) filter (where created_at::date = current_date), 0)::numeric,
    coalesce(sum(platform_fee) filter (where date_trunc('month', created_at) = date_trunc('month', now())), 0)::numeric,
    coalesce(sum(platform_fee), 0)::numeric,
    count(*)::bigint,
    coalesce(sum(total_paid), 0)::numeric
  from public.payment_intents
  where status = 'COMPLETED';
end;
$$;

grant execute on function public.admin_revenue() to authenticated;
