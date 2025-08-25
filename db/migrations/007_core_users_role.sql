-- Añadir rol a usuarios y constraints
alter table core.usuarios add column if not exists rol text default 'agricultor';
alter table core.usuarios add constraint usuarios_rol_chk check (rol in ('admin','agricultor','tecnico'));
