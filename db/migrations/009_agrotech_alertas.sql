-- 009_agrotech_alertas.sql
-- Crea tabla de alertas y enlaza con notificaciones

begin;

-- Tabla de alertas en esquema core
create table if not exists core.alertas (
  id serial primary key,
  tenant_id uuid not null,
  cultivo_id int not null references core.cultivos(id) on delete cascade,
  sensor_id int references core.sensores(id) on delete set null,
  tipo_alerta text not null,
  descripcion text,
  nivel text not null check (nivel in ('bajo','medio','alto')),
  fecha timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index if not exists ix_alertas_tenant on core.alertas(tenant_id);
create index if not exists ix_alertas_cultivo on core.alertas(cultivo_id);
create index if not exists ix_alertas_sensor on core.alertas(sensor_id);
create index if not exists ix_alertas_fecha on core.alertas(fecha desc);

-- Trigger de updated_at si existe función compartida
do $$
begin
  if exists (select 1 from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='core' and p.proname='set_updated_at') then
    create trigger set_updated_at before update on core.alertas
    for each row execute procedure core.set_updated_at();
  end if;
end$$;

-- RLS
alter table core.alertas enable row level security;

-- Helper core._add_rls(tabla) ya debería existir; si existe, úsalo
do $$
begin
  if exists (
    select 1 from information_schema.routines r where r.routine_schema='core' and r.routine_name='_add_rls'
  ) then
  perform core._add_rls('core.alertas');
  else
    -- Políticas mínimas por tenant_id
    create policy rls_alertas_select on core.alertas using (tenant_id = current_setting('request.jwt.claims', true)::json->>'tenant_id');
    create policy rls_alertas_mod on core.alertas using (tenant_id = current_setting('request.jwt.claims', true)::json->>'tenant_id') with check (tenant_id = current_setting('request.jwt.claims', true)::json->>'tenant_id');
  end if;
end$$;

-- Enlazar notificaciones con alertas
do $$
begin
  if not exists (
    select 1 from information_schema.columns where table_schema='core' and table_name='notificaciones' and column_name='alerta_id'
  ) then
    alter table core.notificaciones add column alerta_id int references core.alertas(id) on delete set null;
    create index if not exists ix_notificaciones_alerta on core.notificaciones(alerta_id);
  end if;
end$$;

commit;
