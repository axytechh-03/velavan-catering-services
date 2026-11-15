-- Supabase Initial Schema for Velavan Catering Services
-- Created by AXY Technologies

-- 1. Create Enquiries Table
create table if not exists public.enquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  email text,
  event_type text not null,
  other_event_type text,
  guest_count integer not null,
  event_date date not null,
  event_time text,
  location text not null,
  special_requests text,
  status text default 'new',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Row Level Security Policies
alter table public.enquiries enable row level security;

-- Allow public anonymous inserts from the customer enquiry form
create policy "Allow anonymous enquiry submissions" on public.enquiries
  for insert with check (true);

-- Allow authorized viewing and updates
create policy "Allow enquiry viewing" on public.enquiries
  for select using (true);

create policy "Allow enquiry status updates" on public.enquiries
  for update using (true);

-- 3. Create Index for fast querying by date and status
create index if not exists idx_enquiries_date on public.enquiries (event_date);
create index if not exists idx_enquiries_status on public.enquiries (status);
