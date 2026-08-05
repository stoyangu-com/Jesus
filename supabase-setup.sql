-- ============================================================
-- StoYangu — paste this WHOLE file into Supabase → SQL Editor → Run
-- ============================================================

-- 1) TABLES
create table if not exists profiles (
  id text primary key,
  email text,
  full_name text,
  role text,
  store_id integer,
  created_at timestamptz default now()
);

create table if not exists stores (
  id serial primary key,
  name text not null,
  slug text not null unique,
  owner_name text,
  whatsapp text,
  logo_url text,
  design_json jsonb default '{}'::jsonb,
  user_id text,
  total_visitors integer default 0,
  total_wa_clicks integer default 0,
  is_active boolean default true,
  created_at timestamptz default now()
);

create table if not exists products (
  id serial primary key,
  store_id integer not null references stores(id) on delete cascade,
  name text not null,
  description text,
  price numeric default 0,
  image_url text,
  is_hidden boolean default false,
  views integer default 0,
  orders integer default 0,
  created_at timestamptz default now()
);

create table if not exists daily_stats (
  id serial primary key,
  store_id integer not null,
  stat_date text not null,
  visitors integer default 0,
  wa_clicks integer default 0,
  created_at timestamptz default now()
);

create table if not exists product_daily_stats (
  id serial primary key,
  product_id integer not null,
  store_id integer not null,
  stat_date text not null,
  views integer default 0,
  orders integer default 0,
  created_at timestamptz default now()
);

create table if not exists report_logs (
  id serial primary key,
  store_id integer,
  report_date text,
  message text,
  status text,
  error text,
  created_at timestamptz default now()
);

create table if not exists applications (
  id serial primary key,
  full_name text not null,
  phone text not null,
  willing_video boolean default false,
  status text default 'pending',
  notes text,
  created_at timestamptz default now()
);

-- helpful indexes
create index if not exists idx_stores_slug on stores(slug);
create index if not exists idx_products_store on products(store_id);
create index if not exists idx_daily_stats_store_date on daily_stats(store_id, stat_date);
create index if not exists idx_product_daily_stats_product_date on product_daily_stats(product_id, stat_date);
create index if not exists idx_applications_status on applications(status);

-- 2) STORAGE BUCKET for logos / product images
insert into storage.buckets (id, name, public)
values ('stoyangu-assets', 'stoyangu-assets', true)
on conflict (id) do update set public = true;

-- Public read for files in the bucket
drop policy if exists "Public read stoyangu assets" on storage.objects;
create policy "Public read stoyangu assets"
on storage.objects for select
using (bucket_id = 'stoyangu-assets');

-- Allow uploads via service role / authenticated if needed
drop policy if exists "Authenticated upload stoyangu assets" on storage.objects;
create policy "Authenticated upload stoyangu assets"
on storage.objects for insert
with check (bucket_id = 'stoyangu-assets');

drop policy if exists "Authenticated update stoyangu assets" on storage.objects;
create policy "Authenticated update stoyangu assets"
on storage.objects for update
using (bucket_id = 'stoyangu-assets');

-- Done.
-- NEXT: create founder user in Authentication → Users, then insert into profiles (see OWNERSHIP_GUIDE.md)
