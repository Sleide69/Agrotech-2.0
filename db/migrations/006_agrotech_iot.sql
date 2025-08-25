-- Agrotech IoT domain: tablas y RLS en esquema core/telemetry

-- Tabla de plagas
create table if not exists core.plagas (
  id bigserial primary key,
  tenant_id uuid not null,
  nombre text not null unique,
  descripcion text,
  nivel_peligro int not null check (nivel_peligro between 1 and 5),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  deleted_at timestamptz
);

-- Ampliar detecciones_plaga existente para cubrir campos requeridos
alter table if exists core.detecciones_plaga
  add column if not exists plaga_id bigint references core.plagas(id) on delete set null,
  add column if not exists fecha_detectada timestamptz default now(),
  add column if not exists severidad int check (severidad between 1 and 5),
  add column if not exists confirmado_por text,
  add column if not exists updated_at timestamptz default now(),
  add column if not exists deleted_at timestamptz;

-- Notificaciones
create table if not exists core.notificaciones (
  id bigserial primary key,
  tenant_id uuid not null,
  user_id bigint references core.usuarios(id) on delete set null,
  mensaje text not null,
  tipo text,
  leida boolean default false,
  fecha_envio timestamptz default now(),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  deleted_at timestamptz
);

-- Acciones correctivas
create table if not exists core.acciones_correctivas (
  id bigserial primary key,
  tenant_id uuid not null,
  deteccion_id bigint references core.detecciones_plaga(id) on delete cascade,
  descripcion text not null,
  responsable text,
  fecha_accion timestamptz default now(),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  deleted_at timestamptz
);

-- Vista de lecturas_sensores compatible (mapea telemetry.lecturas)
create or replace view core.lecturas_sensores as
  select 
    l.id,
    l.sensor_id,
    l.value as valor,
    coalesce(l.metadata->>'unit', l.metric) as unidad,
    l.ts as fecha_hora
  from telemetry.lecturas l;

-- Triggers de updated_at
do $$
begin
  if not exists (
    select 1 from pg_proc p join pg_namespace n on n.oid = p.pronamespace
    where p.proname = 'set_updated_at_core' and n.nspname = 'core'
  ) then
    execute $$
      create function core.set_updated_at_core() returns trigger as $$
      begin
        new.updated_at := now();
        return new;
      end;
      $$ language plpgsql;
    $$;
  end if;
end$$;

drop trigger if exists trg_set_updated_at on core.plagas;
create trigger trg_set_updated_at before update on core.plagas for each row execute function core.set_updated_at_core();
drop trigger if exists trg_set_updated_at on core.detecciones_plaga;
create trigger trg_set_updated_at before update on core.detecciones_plaga for each row execute function core.set_updated_at_core();
drop trigger if exists trg_set_updated_at on core.notificaciones;
create trigger trg_set_updated_at before update on core.notificaciones for each row execute function core.set_updated_at_core();
drop trigger if exists trg_set_updated_at on core.acciones_correctivas;
create trigger trg_set_updated_at before update on core.acciones_correctivas for each row execute function core.set_updated_at_core();

-- RLS: habilitar y políticas por tenant
alter table core.plagas enable row level security;
alter table core.notificaciones enable row level security;
alter table core.acciones_correctivas enable row level security;

-- reutiliza helper core._add_rls definido en 002_rls.sql
select core._add_rls('core.plagas');
select core._add_rls('core.notificaciones');
select core._add_rls('core.acciones_correctivas');
