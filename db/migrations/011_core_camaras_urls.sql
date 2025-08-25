begin;

alter table core.camaras
  add column if not exists snapshot_url text,
  add column if not exists stream_url text;

commit;