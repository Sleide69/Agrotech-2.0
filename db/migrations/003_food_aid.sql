-- Migration: Food Aid ERD with audit fields, CHECK constraints, and flexible notifications
-- Safe to run multiple times: uses IF NOT EXISTS where possible

-- Extensions required for UUID generation
create extension if not exists pgcrypto;

-- Dedicated schema to avoid name collisions with existing core schema
create schema if not exists food_aid;

-- Utility: unified updated_at trigger
do $$
begin
  if not exists (
    select 1 from pg_proc p join pg_namespace n on n.oid = p.pronamespace
    where p.proname = 'set_updated_at' and n.nspname = 'food_aid'
  ) then
    execute $$
      create function food_aid.set_updated_at() returns trigger as $$
      begin
        new.updated_at := now();
        return new;
      end;
      $$ language plpgsql;
    $$;
  end if;
end$$;

-- Roles
create table if not exists food_aid.roles (
  id uuid primary key default gen_random_uuid(),
  name varchar(50) not null unique,
  -- audit
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

-- Users
create table if not exists food_aid.users (
  id uuid primary key default gen_random_uuid(),
  role_id uuid not null references food_aid.roles(id) on delete restrict,
  name varchar(100) not null,
  email varchar(100) not null unique,
  password varchar(255) not null,
  -- audit
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  -- basic format guard; not perfect but avoids obvious bad values
  constraint users_email_format_chk check (position('@' in email) > 1)
);

-- Foods
create table if not exists food_aid.foods (
  id uuid primary key default gen_random_uuid(),
  name varchar(100) not null,
  category varchar(50) not null,
  expiration_date date,
  -- audit
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint foods_name_not_blank_chk check (btrim(name) <> ''),
  constraint foods_category_not_blank_chk check (btrim(category) <> '')
);

-- Donations
create table if not exists food_aid.donations (
  id uuid primary key default gen_random_uuid(),
  donor_id uuid not null references food_aid.users(id) on delete restrict,
  food_id uuid not null references food_aid.foods(id) on delete restrict,
  quantity int not null,
  status varchar(20) not null default 'pending',
  donated_at timestamptz not null default now(),
  -- audit
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint donations_qty_positive_chk check (quantity > 0),
  -- allow some flexibility but keep guardrails
  constraint donations_status_chk check (status in ('pending','approved','delivered','rejected','cancelled'))
);
create index if not exists idx_donations_donor on food_aid.donations(donor_id);
create index if not exists idx_donations_food on food_aid.donations(food_id);
create index if not exists idx_donations_status on food_aid.donations(status);

-- Distributions
create table if not exists food_aid.distributions (
  id uuid primary key default gen_random_uuid(),
  beneficiary_id uuid not null references food_aid.users(id) on delete restrict,
  food_id uuid not null references food_aid.foods(id) on delete restrict,
  quantity int not null,
  distributed_at timestamptz not null default now(),
  -- audit
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint distributions_qty_positive_chk check (quantity > 0)
);
create index if not exists idx_distributions_beneficiary on food_aid.distributions(beneficiary_id);
create index if not exists idx_distributions_food on food_aid.distributions(food_id);

-- Inventory movements
create table if not exists food_aid.inventory_movements (
  id uuid primary key default gen_random_uuid(),
  food_id uuid not null references food_aid.foods(id) on delete restrict,
  movement_type varchar(10) not null,
  quantity int not null,
  donation_id uuid references food_aid.donations(id) on delete set null,
  distribution_id uuid references food_aid.distributions(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint inv_mov_qty_positive_chk check (quantity > 0),
  constraint inv_mov_type_chk check (movement_type in ('IN','OUT')),
  -- ensure exactly one related reference and it matches the type
  constraint inv_mov_related_consistency_chk check (
    (movement_type = 'IN' and donation_id is not null and distribution_id is null) or
    (movement_type = 'OUT' and distribution_id is not null and donation_id is null)
  )
);
create index if not exists idx_inv_mov_food_ts on food_aid.inventory_movements(food_id, created_at desc);

-- Notifications (flexible)
create table if not exists food_aid.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references food_aid.users(id) on delete cascade,
  title varchar(140),
  message text not null,
  is_read boolean not null default false,
  type varchar(30),           -- e.g., system, donation, distribution, alert
  channel varchar(20) not null default 'in_app', -- in_app, email, sms, push, webhook
  status varchar(20) not null default 'queued',  -- queued, sent, failed, read, dismissed
  metadata jsonb,
  scheduled_at timestamptz,
  sent_at timestamptz,
  read_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint notifications_channel_chk check (channel in ('in_app','email','sms','push','webhook')),
  constraint notifications_status_chk check (status in ('queued','sent','failed','read','dismissed')),
  -- optional: when marked read, read_at should be set
  constraint notifications_read_consistency_chk check (
    (is_read = false and read_at is null) or (is_read = true and read_at is not null)
  )
);
create index if not exists idx_notifications_user_ts on food_aid.notifications(user_id, created_at desc);
create index if not exists idx_notifications_status on food_aid.notifications(status);

-- Attach updated_at trigger to all tables in this schema
do $$
declare
  r record;
begin
  for r in (
    select tablename from pg_tables where schemaname = 'food_aid'
  ) loop
    execute format('drop trigger if exists set_updated_at_trg on food_aid.%I', r.tablename);
    execute format('create trigger set_updated_at_trg before update on food_aid.%I for each row execute function food_aid.set_updated_at()', r.tablename);
  end loop;
end$$;
