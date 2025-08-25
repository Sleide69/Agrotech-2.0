-- 010_core_camaras.sql
-- Crear tabla de cámaras con RLS por tenant

begin;

create schema if not exists core;

create table if not exists core.camaras (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  nombre varchar(255) not null,
  descripcion text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

-- Índices
create index if not exists camaras_tenant_idx on core.camaras(tenant_id);
create index if not exists camaras_created_idx on core.camaras(created_at desc);

-- Habilitar RLS
alter table core.camaras enable row level security;

-- Política: solo mismo tenant (drop/create para compatibilidad)
drop policy if exists camaras_isolation on core.camaras;
create policy camaras_isolation on core.camaras
  using (tenant_id = auth.tenant_id());

-- Insert/update/delete restringidos al tenant (drop/create)
drop policy if exists camaras_tenant_mod on core.camaras;
create policy camaras_tenant_mod on core.camaras for all
  using (tenant_id = auth.tenant_id())
  with check (tenant_id = auth.tenant_id());

-- Trigger de updated_at
create or replace function core.set_updated_at() returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end$$;

drop trigger if exists camaras_set_updated_at on core.camaras;
create trigger camaras_set_updated_at before update on core.camaras for each row execute function core.set_updated_at();

commit;
