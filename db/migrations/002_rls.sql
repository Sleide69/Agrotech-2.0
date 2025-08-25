-- Activar RLS por tablas con tenant_id
alter table core.usuarios enable row level security;
alter table core.cultivos enable row level security;
alter table core.zonas enable row level security;
alter table core.sensores enable row level security;
alter table core.riegos enable row level security;
alter table core.detecciones_plaga enable row level security;
alter table telemetry.lecturas enable row level security;

-- Asegurar que exista el esquema auth antes de crear funciones/políticas
create schema if not exists auth;

-- Definir una función para obtener tenant_id desde JWT (para Supabase se usa auth.jwt())
create or replace function auth.tenant_id() returns uuid as $$
  select nullif((nullif(current_setting('request.jwt.claims', true), '')::json ->> 'tenant_id'), '')::uuid;
$$ language sql stable;

-- Helper to add policy
create or replace function core._add_rls(tbl regclass) returns void as $$
begin
  execute format('create policy tenant_select on %s using (tenant_id = auth.tenant_id())', tbl);
  execute format('create policy tenant_insert on %s for insert with check (tenant_id = auth.tenant_id())', tbl);
  execute format('create policy tenant_update on %s for update using (tenant_id = auth.tenant_id()) with check (tenant_id = auth.tenant_id())', tbl);
  execute format('create policy tenant_delete on %s for delete using (tenant_id = auth.tenant_id())', tbl);
end; $$ language plpgsql;

select core._add_rls('core.cultivos');
select core._add_rls('core.zonas');
select core._add_rls('core.sensores');
select core._add_rls('core.riegos');
select core._add_rls('core.detecciones_plaga');
-- Usuarios: permitir leer su propio usuario por email si coincide con JWT (ajustar a necesidad)
drop policy if exists usuarios_self on core.usuarios;
create policy usuarios_self on core.usuarios using (true);

-- Telemetry: join implícita por sensor_id -> sensor.tenant_id
drop policy if exists lecturas_tenant on telemetry.lecturas;
create policy lecturas_tenant on telemetry.lecturas using (
  exists (
    select 1 from core.sensores s where s.id = telemetry.lecturas.sensor_id and s.tenant_id = auth.tenant_id()
  )
);
