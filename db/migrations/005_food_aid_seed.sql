-- Seeds mínimos para food_aid
-- NOTA: Ajusta el hash de contraseña antes de producción

-- Crear tenant por defecto (usaremos gen_random_uuid para asignaciones consistentes en esta sesión)
do $$
declare
  t uuid := gen_random_uuid();
begin
  -- Roles
  insert into food_aid.roles (id, name) values
    (gen_random_uuid(), 'admin') on conflict (name) do nothing;
  insert into food_aid.roles (id, name) values
    (gen_random_uuid(), 'donor') on conflict (name) do nothing;
  insert into food_aid.roles (id, name) values
    (gen_random_uuid(), 'beneficiary') on conflict (name) do nothing;

  -- Usuario admin por defecto (hash temporal "dev-hash")
  insert into food_aid.users (id, role_id, name, email, password, tenant_id)
  select gen_random_uuid(), r.id, 'Admin', 'admin@food-aid.local', '$2y$10$DEVHASHPLACEHOLDER', t
  from food_aid.roles r where r.name = 'admin'
  on conflict (email) do nothing;

  -- Foods ejemplo
  insert into food_aid.foods (id, name, category, expiration_date, tenant_id)
  values
    (gen_random_uuid(), 'Arroz', 'Granos', now()::date + interval '180 days', t),
    (gen_random_uuid(), 'Leche', 'Lácteos', now()::date + interval '15 days', t),
    (gen_random_uuid(), 'Pan', 'Panadería', now()::date + interval '3 days', t)
  on conflict do nothing;
end$$;
