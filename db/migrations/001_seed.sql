insert into core.usuarios (email, nombre, hash_password)
values ('admin@example.com','Admin','dev-hash')
on conflict (email) do nothing;

insert into core.cultivos (nombre, descripcion)
values ('Tomates Norte','Invernadero Tomate Cherry')
on conflict do nothing;

insert into core.zonas (cultivo_id, nombre, geom)
select c.id, 'Zona A', '{"type":"Polygon"}'::jsonb from core.cultivos c where c.nombre='Tomates Norte'
on conflict do nothing;

-- sensor de humedad y temperatura
insert into core.sensores (cultivo_id, zona_id, nombre, tipo, modelo, device_id, secret)
select c.id, z.id, 'DHT11-1', 'clima', 'DHT11', 'dev-001', 'secret-001'
from core.cultivos c
join core.zonas z on z.cultivo_id=c.id
where c.nombre='Tomates Norte'
on conflict (device_id) do nothing;
