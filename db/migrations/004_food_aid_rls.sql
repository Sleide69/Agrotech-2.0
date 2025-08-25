-- Food Aid Multi-tenant RLS
-- Paso 1: Añadir tenant_id y políticas RLS

create schema if not exists auth;

-- Asegurar función auth.tenant_id() (reutiliza si ya existe)
do $$
begin
  if not exists (
    select 1 from pg_proc p join pg_namespace n on n.oid = p.pronamespace
    where p.proname = 'tenant_id' and n.nspname = 'auth'
  ) then
    execute $$
      create or replace function auth.tenant_id() returns uuid as $$
        select nullif((nullif(current_setting('request.jwt.claims', true), '')::json ->> 'tenant_id'), '')::uuid;
      $$ language sql stable;
    $$;
  end if;
end$$;

-- Añadir columna tenant_id a tablas (excepto roles)
alter table if exists food_aid.users add column if not exists tenant_id uuid not null;
alter table if exists food_aid.foods add column if not exists tenant_id uuid not null;
alter table if exists food_aid.donations add column if not exists tenant_id uuid not null;
alter table if exists food_aid.distributions add column if not exists tenant_id uuid not null;
alter table if exists food_aid.inventory_movements add column if not exists tenant_id uuid not null;
alter table if exists food_aid.notifications add column if not exists tenant_id uuid not null;

-- Índices por tenant para acelerar queries
create index if not exists idx_users_tenant on food_aid.users(tenant_id);
create index if not exists idx_foods_tenant on food_aid.foods(tenant_id);
create index if not exists idx_donations_tenant on food_aid.donations(tenant_id);
create index if not exists idx_distributions_tenant on food_aid.distributions(tenant_id);
create index if not exists idx_inv_mov_tenant on food_aid.inventory_movements(tenant_id);
create index if not exists idx_notifications_tenant on food_aid.notifications(tenant_id);

-- Activar RLS
alter table if exists food_aid.users enable row level security;
alter table if exists food_aid.foods enable row level security;
alter table if exists food_aid.donations enable row level security;
alter table if exists food_aid.distributions enable row level security;
alter table if exists food_aid.inventory_movements enable row level security;
alter table if exists food_aid.notifications enable row level security;

-- Helper local para crear políticas de tenant
do $$
begin
  if not exists (
    select 1 from pg_proc p join pg_namespace n on n.oid = p.pronamespace
    where p.proname = '_add_rls' and n.nspname = 'food_aid'
  ) then
    execute $$
      create function food_aid._add_rls(tbl regclass) returns void as $$
      begin
        execute format('create policy if not exists tenant_select on %s using (tenant_id = auth.tenant_id())', tbl);
        execute format('create policy if not exists tenant_insert on %s for insert with check (tenant_id = auth.tenant_id())', tbl);
        execute format('create policy if not exists tenant_update on %s for update using (tenant_id = auth.tenant_id()) with check (tenant_id = auth.tenant_id())', tbl);
        execute format('create policy if not exists tenant_delete on %s for delete using (tenant_id = auth.tenant_id())', tbl);
      end; $$ language plpgsql;
    $$;
  end if;
end$$;

select food_aid._add_rls('food_aid.users');
select food_aid._add_rls('food_aid.foods');
select food_aid._add_rls('food_aid.donations');
select food_aid._add_rls('food_aid.distributions');
select food_aid._add_rls('food_aid.inventory_movements');
select food_aid._add_rls('food_aid.notifications');
