-- ============================================================================
-- TontiFlow — Migration : vérification du compte (KYC) + solde / portefeuille
-- À exécuter dans Supabase → SQL Editor → Run. Idempotent.
-- ============================================================================

-- ── Profils : champs de vérification + solde ────────────────────────────────
alter table public.profiles add column if not exists date_of_birth date;
alter table public.profiles add column if not exists id_document_type text;     -- cni | passport | permis
alter table public.profiles add column if not exists id_document_path text;     -- chemin dans le bucket 'documents'
alter table public.profiles add column if not exists withdrawal_provider text;  -- wave | orange | mtn | free
alter table public.profiles add column if not exists withdrawal_number text;    -- numéro de retrait
alter table public.profiles add column if not exists name_verified boolean not null default false;
alter table public.profiles add column if not exists balance numeric not null default 0;

-- ── Opérations sur le solde (recharges / retraits) ──────────────────────────
create table if not exists public.wallet_transactions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  type        text not null,                 -- deposit | withdrawal
  amount      numeric not null,
  method      text,                          -- wave | orange | ...
  status      text not null default 'completed',
  created_at  timestamptz not null default now()
);
create index if not exists idx_wallet_user on public.wallet_transactions(user_id);

alter table public.wallet_transactions enable row level security;
drop policy if exists "wallet_self" on public.wallet_transactions;
create policy "wallet_self" on public.wallet_transactions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ── Recharge du solde ───────────────────────────────────────────────────────
create or replace function public.wallet_deposit(p_amount numeric, p_method text)
returns numeric language plpgsql security definer set search_path = public as $$
declare new_balance numeric;
begin
  if auth.uid() is null then raise exception 'NOT_AUTHENTICATED'; end if;
  if p_amount is null or p_amount <= 0 then raise exception 'INVALID_AMOUNT'; end if;
  update public.profiles set balance = balance + p_amount where id = auth.uid()
    returning balance into new_balance;
  insert into public.wallet_transactions(user_id, type, amount, method)
    values (auth.uid(), 'deposit', p_amount, p_method);
  return new_balance;
end; $$;

-- ── Retrait du solde ────────────────────────────────────────────────────────
create or replace function public.wallet_withdraw(p_amount numeric, p_method text)
returns numeric language plpgsql security definer set search_path = public as $$
declare cur numeric; new_balance numeric;
begin
  if auth.uid() is null then raise exception 'NOT_AUTHENTICATED'; end if;
  if p_amount is null or p_amount <= 0 then raise exception 'INVALID_AMOUNT'; end if;
  select balance into cur from public.profiles where id = auth.uid();
  if cur < p_amount then raise exception 'INSUFFICIENT_FUNDS'; end if;
  update public.profiles set balance = balance - p_amount where id = auth.uid()
    returning balance into new_balance;
  insert into public.wallet_transactions(user_id, type, amount, method)
    values (auth.uid(), 'withdrawal', p_amount, p_method);
  return new_balance;
end; $$;

grant execute on function public.wallet_deposit(numeric, text) to authenticated;
grant execute on function public.wallet_withdraw(numeric, text) to authenticated;

-- ── Stockage des pièces d'identité (bucket privé 'documents') ───────────────
insert into storage.buckets (id, name, public) values ('documents', 'documents', false)
  on conflict (id) do nothing;

drop policy if exists "documents_insert_own" on storage.objects;
create policy "documents_insert_own" on storage.objects for insert to authenticated
  with check (bucket_id = 'documents' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "documents_select_own" on storage.objects;
create policy "documents_select_own" on storage.objects for select to authenticated
  using (bucket_id = 'documents' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "documents_update_own" on storage.objects;
create policy "documents_update_own" on storage.objects for update to authenticated
  using (bucket_id = 'documents' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "documents_delete_own" on storage.objects;
create policy "documents_delete_own" on storage.objects for delete to authenticated
  using (bucket_id = 'documents' and (storage.foldername(name))[1] = auth.uid()::text);
