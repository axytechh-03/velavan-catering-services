-- ============================================================================
-- Supabase CMS & Admin Schema Migration for Velavan Catering Services
-- Migration: 002_cms_schema.sql
-- Created for Velavan Catering Services Official Administration Platform
-- ============================================================================

-- 1. ENQUIRIES TABLE ENHANCEMENTS
alter table if exists public.enquiries
  add column if not exists event_time text,
  add column if not exists admin_notes text,
  add column if not exists updated_at timestamp with time zone default timezone('utc'::text, now());

-- Ensure index exists
create index if not exists idx_enquiries_status on public.enquiries (status);
create index if not exists idx_enquiries_created on public.enquiries (created_at desc);

-- 2. MENU CATEGORIES TABLE
create table if not exists public.menu_categories (
  id text primary key,
  name_en text not null,
  name_ta text not null,
  icon_name text not null default 'Utensils',
  badge text,
  active boolean default true,
  display_order integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.menu_categories enable row level security;
create policy "Public menu categories read" on public.menu_categories for select using (true);
create policy "Admin menu categories manage" on public.menu_categories for all using (true);

-- 3. MENU ITEMS TABLE
create table if not exists public.menu_items (
  id text primary key,
  category_id text references public.menu_categories(id) on delete set null,
  name_en text not null,
  name_ta text not null,
  desc_en text,
  desc_ta text,
  badge text,
  is_signature boolean default false,
  is_live boolean default false,
  is_veg boolean default true,
  price_estimate text,
  active boolean default true,
  display_order integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.menu_items enable row level security;
create policy "Public menu items read" on public.menu_items for select using (true);
create policy "Admin menu items manage" on public.menu_items for all using (true);
create index if not exists idx_menu_items_category on public.menu_items (category_id);

-- 4. SERVICES TABLE
create table if not exists public.services (
  id text primary key,
  key text not null,
  service_number text not null,
  title_en text not null,
  title_ta text not null,
  tag_en text not null,
  tag_ta text not null,
  desc_en text not null,
  desc_ta text not null,
  capacity text,
  leaf_style text,
  featured_dishes jsonb default '{"en": [], "ta": []}'::jsonb,
  image text not null,
  image_position text default 'center center',
  active boolean default true,
  display_order integer default 0,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.services enable row level security;
create policy "Public services read" on public.services for select using (true);
create policy "Admin services manage" on public.services for all using (true);

-- 5. GALLERY ITEMS TABLE
create table if not exists public.gallery_items (
  id text primary key,
  title_en text not null,
  title_ta text not null,
  category_en text not null,
  category_ta text not null,
  url text not null,
  caption_en text not null,
  caption_ta text not null,
  object_position text default 'center center',
  active boolean default true,
  display_order integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.gallery_items enable row level security;
create policy "Public gallery items read" on public.gallery_items for select using (true);
create policy "Admin gallery items manage" on public.gallery_items for all using (true);

-- 6. CLIENTS TABLE
create table if not exists public.clients (
  id text primary key,
  name text not null,
  category text not null,
  active boolean default true,
  display_order integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.clients enable row level security;
create policy "Public clients read" on public.clients for select using (true);
create policy "Admin clients manage" on public.clients for all using (true);

-- 7. SITE CONTENT TABLE (Dynamic CMS Blocks)
create table if not exists public.site_content (
  key text primary key,
  section text not null,
  data jsonb not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.site_content enable row level security;
create policy "Public site content read" on public.site_content for select using (true);
create policy "Admin site content manage" on public.site_content for all using (true);

-- 8. ADMIN SETTINGS TABLE
create table if not exists public.admin_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.admin_settings enable row level security;
create policy "Admin settings manage" on public.admin_settings for all using (true);
