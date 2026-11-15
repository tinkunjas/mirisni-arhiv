create table if not exists public.catalog_state (
  id integer primary key check (id = 1),
  data jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.catalog_state enable row level security;

create or replace function public.is_catalog_owner()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select (select auth.uid()) = 'a32204a9-de19-4bed-8c13-67a7615d9af0'::uuid
$$;

revoke all on function public.is_catalog_owner() from public;
grant execute on function public.is_catalog_owner() to authenticated;

grant usage on schema public to anon, authenticated;
grant select on public.catalog_state to anon, authenticated;
grant insert, update, delete on public.catalog_state to authenticated;

drop policy if exists "Anyone can read perfume catalog" on public.catalog_state;
drop policy if exists "Only owner can insert" on public.catalog_state;
drop policy if exists "Only owner can update" on public.catalog_state;
drop policy if exists "Only owner can delete" on public.catalog_state;

create policy "Anyone can read perfume catalog"
on public.catalog_state for select to anon, authenticated using (true);

create policy "Only owner can insert"
on public.catalog_state for insert to authenticated
with check ((select public.is_catalog_owner()));

create policy "Only owner can update"
on public.catalog_state for update to authenticated
using ((select public.is_catalog_owner()))
with check ((select public.is_catalog_owner()));

create policy "Only owner can delete"
on public.catalog_state for delete to authenticated
using ((select public.is_catalog_owner()));
