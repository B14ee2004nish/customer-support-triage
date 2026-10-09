-- Enable pgcrypto extension for gen_random_uuid()
create extension if not exists "pgcrypto";

-- 1. Create tickets table
create table if not exists tickets (
  id uuid primary key default gen_random_uuid(),
  ticket_id text unique not null,
  subject text not null,
  body text not null,
  customer_name text not null,
  customer_email text not null,
  status text default 'open',
  category text,
  priority text,
  department text,
  ai_confidence float,
  ai_reasoning text,
  needs_human_review boolean default false,
  human_override boolean default false,
  assigned_to text,
  triaged_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. Create ticket_events table
create table if not exists ticket_events (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid references tickets(id) on delete cascade,
  type text not null,
  actor text not null,
  payload jsonb,
  created_at timestamptz default now()
);

-- 3. Create indexes on status and needs_human_review
create index if not exists idx_tickets_status on tickets(status);
create index if not exists idx_tickets_review on tickets(needs_human_review);
create index if not exists idx_ticket_events_ticket_id on ticket_events(ticket_id);

-- 4. Automatically update updated_at on ticket changes
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_tickets_updated_at on tickets;
create trigger set_tickets_updated_at
before update on tickets
for each row
execute function update_updated_at_column();

-- 5. Row Level Security (RLS) policies for anon access
alter table tickets enable row level security;
alter table ticket_events enable row level security;

drop policy if exists "Enable all access for anon and authenticated users" on tickets;
create policy "Enable all access for anon and authenticated users"
  on tickets for all
  to anon, authenticated
  using (true)
  with check (true);

drop policy if exists "Enable all access for anon and authenticated users" on ticket_events;
create policy "Enable all access for anon and authenticated users"
  on ticket_events for all
  to anon, authenticated
  using (true)
  with check (true);
