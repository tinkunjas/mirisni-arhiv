begin;

create or replace function public.public_perfume_catalog()
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select case when c.data is null then null else
    pg_catalog.jsonb_set(
      pg_catalog.jsonb_set(
        c.data,
        '{bottles}',
        coalesce((
          select pg_catalog.jsonb_agg(value - 'personalRating' order by ord)
          from pg_catalog.jsonb_array_elements(c.data -> 'bottles') with ordinality as b(value,ord)
        ), '[]'::jsonb)
      ),
      '{testers}',
      coalesce((
        select pg_catalog.jsonb_agg(value - 'personalRating' order by ord)
        from pg_catalog.jsonb_array_elements(c.data -> 'testers') with ordinality as t(value,ord)
      ), '[]'::jsonb)
    ) end
  from public.catalog_state c
  where c.id = 1
$$;

revoke all on function public.public_perfume_catalog() from public;
grant execute on function public.public_perfume_catalog() to anon, authenticated;

update public.catalog_state c
set data = pg_catalog.jsonb_set(
  c.data,
  '{bottles}',
  coalesce((
    select pg_catalog.jsonb_agg(
      case
        when b.value ->> 'ownership' = 'owned' then
          pg_catalog.jsonb_set(
            pg_catalog.jsonb_set(b.value, '{status}',
              case
                when b.value ->> 'status' = 'Za prodaju' then '"Za prodaju"'::jsonb
                when pg_catalog.jsonb_typeof(b.value -> 'personalRating') = 'number'
                  and (b.value ->> 'personalRating')::numeric <= 7
                  then '"Za zamjenu"'::jsonb
                when b.value ->> 'status' in ('Za zamjenu', 'Moguća zamjena') then '"Za zamjenu"'::jsonb
                else '"U kolekciji"'::jsonb
              end),
            '{autoTrade}',
            case when b.value ->> 'status' <> 'Za prodaju'
                      and pg_catalog.jsonb_typeof(b.value -> 'personalRating') = 'number'
                      and (b.value ->> 'personalRating')::numeric <= 7
                 then 'true'::jsonb else coalesce(b.value -> 'autoTrade', 'false'::jsonb) end
          )
        else b.value
      end
      order by b.ord
    )
    from pg_catalog.jsonb_array_elements(c.data -> 'bottles') with ordinality as b(value,ord)
  ), '[]'::jsonb)
)
where c.id = 1;

alter table public.catalog_state enable row level security;
drop policy if exists "Anyone can read perfume catalog" on public.catalog_state;
drop policy if exists "Only owner can read" on public.catalog_state;
create policy "Only owner can read" on public.catalog_state
  for select to authenticated
  using ((select public.is_catalog_owner()));

revoke select on public.catalog_state from anon;
grant select on public.catalog_state to authenticated;

commit;
