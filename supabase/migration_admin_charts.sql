-- ============================================================================
-- TontiFlow — Migration : vue d'ensemble admin (groupes actifs) + revenus/jour
-- À exécuter dans Supabase → SQL Editor → Run. Idempotent.
-- ============================================================================

-- Vue d'ensemble : revenus + nombre de groupes actifs.
create or replace function public.admin_overview()
returns table (
  today numeric, month numeric, total numeric,
  tx_count bigint, total_processed numeric, active_groups bigint
)
language plpgsql security definer set search_path = public as $$
begin
  if lower(coalesce(auth.jwt() ->> 'email', '')) not in ('raouljiokeng@gmail.com', 'sonfackdiviol45@gmail.com') then
    raise exception 'NOT_ADMIN';
  end if;

  return query
  select
    coalesce(sum(platform_fee) filter (where created_at::date = current_date), 0)::numeric,
    coalesce(sum(platform_fee) filter (where date_trunc('month', created_at) = date_trunc('month', now())), 0)::numeric,
    coalesce(sum(platform_fee), 0)::numeric,
    count(*)::bigint,
    coalesce(sum(total_paid), 0)::numeric,
    (select count(*) from public.groups where status = 'active')::bigint
  from public.payment_intents
  where status = 'COMPLETED';
end;
$$;

-- Revenus (frais) par jour sur les N derniers jours (0 si aucun ce jour-là).
create or replace function public.admin_revenue_daily(p_days int default 14)
returns table (day date, revenue numeric)
language plpgsql security definer set search_path = public as $$
begin
  if lower(coalesce(auth.jwt() ->> 'email', '')) not in ('raouljiokeng@gmail.com', 'sonfackdiviol45@gmail.com') then
    raise exception 'NOT_ADMIN';
  end if;

  return query
  select d::date,
    coalesce((
      select sum(platform_fee) from public.payment_intents pi
      where pi.status = 'COMPLETED' and pi.created_at::date = d::date
    ), 0)::numeric
  from generate_series(current_date - (p_days - 1), current_date, interval '1 day') d
  order by d;
end;
$$;

grant execute on function public.admin_overview() to authenticated;
grant execute on function public.admin_revenue_daily(int) to authenticated;
