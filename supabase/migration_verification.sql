-- ============================================================================
-- TontiFlow — Migration : validation auto des comptes (5 min) + fonctions admin
-- À exécuter dans Supabase → SQL Editor → Run. Idempotent.
-- ============================================================================

-- Statut de vérification + horodatage de soumission
alter table public.profiles add column if not exists verification_status text default 'unverified';
alter table public.profiles add column if not exists verification_submitted_at timestamptz;

-- (Rappel) Vue d'ensemble admin : revenus + groupes actifs
create or replace function public.admin_overview()
returns table (today numeric, month numeric, total numeric, tx_count bigint, total_processed numeric, active_groups bigint)
language plpgsql security definer set search_path = public as $$
begin
  if lower(coalesce(auth.jwt() ->> 'email','')) not in ('raouljiokeng@gmail.com','sonfackdiviol45@gmail.com') then
    raise exception 'NOT_ADMIN';
  end if;
  return query
  select
    coalesce(sum(platform_fee) filter (where created_at::date = current_date),0)::numeric,
    coalesce(sum(platform_fee) filter (where date_trunc('month',created_at)=date_trunc('month',now())),0)::numeric,
    coalesce(sum(platform_fee),0)::numeric,
    count(*)::bigint,
    coalesce(sum(total_paid),0)::numeric,
    (select count(*) from public.groups where status='active')::bigint
  from public.payment_intents where status='COMPLETED';
end; $$;

-- (Rappel) Revenus par jour
create or replace function public.admin_revenue_daily(p_days int default 14)
returns table (day date, revenue numeric)
language plpgsql security definer set search_path = public as $$
begin
  if lower(coalesce(auth.jwt() ->> 'email','')) not in ('raouljiokeng@gmail.com','sonfackdiviol45@gmail.com') then
    raise exception 'NOT_ADMIN';
  end if;
  return query
  select d::date,
    coalesce((select sum(platform_fee) from public.payment_intents pi
              where pi.status='COMPLETED' and pi.created_at::date=d::date),0)::numeric
  from generate_series(current_date-(p_days-1), current_date, interval '1 day') d
  order by d;
end; $$;

grant execute on function public.admin_overview() to authenticated;
grant execute on function public.admin_revenue_daily(int) to authenticated;
