-- Crear esquemas
create schema if not exists core;
create schema if not exists telemetry;

-- Tabla de usuarios
create table if not exists core.usuarios (
  id bigserial primary key,
  tenant_id uuid default gen_random_uuid(),
  email text unique not null,
  nombre text not null,
  hash_password text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Cultivos, zonas, sensores, riegos
create table if not exists core.cultivos (
  id bigserial primary key,
  tenant_id uuid,
  nombre text not null,
  descripcion text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists core.zonas (
  id bigserial primary key,
  tenant_id uuid,
  cultivo_id bigint references core.cultivos(id) on delete cascade,
  nombre text not null,
  geom jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists core.sensores (
  id bigserial primary key,
  tenant_id uuid,
  cultivo_id bigint references core.cultivos(id) on delete cascade,
  zona_id bigint references core.zonas(id) on delete set null,
  nombre text,
  tipo text not null,
  modelo text,
  device_id text unique,
  secret text,
  activo boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists core.riegos (
  id bigserial primary key,
  tenant_id uuid,
  cultivo_id bigint references core.cultivos(id) on delete cascade,
  zona_id bigint references core.zonas(id) on delete set null,
  programacion jsonb,
  estado text default 'pendiente',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Detecciones de plaga
create table if not exists core.detecciones_plaga (
  id bigserial primary key,
  tenant_id uuid,
  cultivo_id bigint references core.cultivos(id) on delete set null,
  zona_id bigint references core.zonas(id) on delete set null,
  imagen_url text,
  plaga text,
  score double precision,
  recomendacion text,
  metadata jsonb,
  created_at timestamptz default now()
);

-- Telemetría
create table if not exists telemetry.lecturas (
  id bigserial primary key,
  sensor_id bigint not null references core.sensores(id) on delete cascade,
  ts timestamptz not null default now(),
  metric text not null,
  value double precision not null,
  metadata jsonb
);

create index if not exists idx_telemetry_sensor_ts on telemetry.lecturas(sensor_id, ts desc);

-- Hypertable si existe TimescaleDB
do $$
begin
  if exists (select 1 from pg_extension where extname = 'timescaledb') then
    execute 'select create_hypertable(''telemetry.lecturas'', ''ts'', if_not_exists => true)';
  end if;
end$$;
