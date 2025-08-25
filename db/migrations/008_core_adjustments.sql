-- Ajustes de esquema para cumplir con requerimientos específicos

-- cultivos: usuario_id, ubicacion, fecha_siembra, estado
alter table core.cultivos
  add column if not exists usuario_id bigint references core.usuarios(id) on delete set null,
  add column if not exists ubicacion text,
  add column if not exists fecha_siembra date,
  add column if not exists estado text,
  add column if not exists deleted_at timestamptz;

-- estado permitido opcionalmente (flexible)
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'cultivos_estado_chk'
  ) then
    alter table core.cultivos add constraint cultivos_estado_chk check (estado is null or estado in ('activo','en_riesgo','cosechado','inactivo'));
  end if;
end$$;

-- sensores: ubicacion y check de tipo
alter table core.sensores
  add column if not exists ubicacion text,
  add column if not exists deleted_at timestamptz;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'sensores_tipo_chk'
  ) then
    alter table core.sensores add constraint sensores_tipo_chk check (tipo in ('temperatura','humedad','pH','CO2','luz','clima'));
  end if;
end$$;
