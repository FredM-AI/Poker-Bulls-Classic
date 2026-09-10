-- Poker Bulls Classic - Supabase schema
-- Run this once in the Supabase SQL editor (Project > SQL Editor > New query).

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Players
-- ---------------------------------------------------------------------------
create table if not exists players (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name text not null,
  nickname text,
  email text not null unique,
  phone text,
  avatar_url text,
  is_guest boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Seasons
-- ---------------------------------------------------------------------------
create table if not exists seasons (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  start_date date not null,
  end_date date,
  is_active boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Blind structures (reusable templates)
-- ---------------------------------------------------------------------------
create table if not exists blind_structures (
  id text primary key,
  name text not null,
  starting_stack integer,
  levels jsonb not null default '[]',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Events
-- ---------------------------------------------------------------------------
create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  date timestamptz not null,
  buy_in numeric not null default 0,
  rebuy_price numeric,
  bounties numeric,
  mystery_ko numeric,
  include_bounties_in_net boolean default true,
  max_players integer,
  starting_stack integer,
  status text not null default 'draft' check (status in ('draft', 'active', 'completed', 'cancelled')),
  season_id uuid references seasons(id) on delete set null,
  prize_pool_total numeric not null default 0,
  prize_pool_distribution_type text not null default 'automatic' check (prize_pool_distribution_type in ('automatic', 'custom')),
  prize_pool_distribution jsonb not null default '[]',
  blind_structure_id text references blind_structures(id) on delete set null,
  blind_structure_snapshot jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists events_season_id_idx on events(season_id);
create index if not exists events_status_idx on events(status);

-- ---------------------------------------------------------------------------
-- Event participants (replaces Event.participants: string[])
-- ---------------------------------------------------------------------------
create table if not exists event_participants (
  event_id uuid not null references events(id) on delete cascade,
  player_id uuid not null references players(id) on delete cascade,
  primary key (event_id, player_id)
);

-- ---------------------------------------------------------------------------
-- Event results (replaces Event.results: EventResult[])
-- ---------------------------------------------------------------------------
create table if not exists event_results (
  event_id uuid not null references events(id) on delete cascade,
  player_id uuid not null references players(id) on delete cascade,
  position integer not null,
  prize numeric not null default 0,
  rebuys integer not null default 0,
  eliminated_by uuid references players(id) on delete set null,
  bounties_won numeric not null default 0,
  mystery_ko_won numeric not null default 0,
  primary key (event_id, player_id)
);

-- ---------------------------------------------------------------------------
-- App settings (single row)
-- ---------------------------------------------------------------------------
create table if not exists app_settings (
  id integer primary key default 1 check (id = 1),
  theme text not null default 'light',
  default_buy_in numeric not null default 20,
  default_max_players integer not null default 90
);

insert into app_settings (id) values (1) on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- Row Level Security: public read, authenticated write
-- ---------------------------------------------------------------------------
alter table players enable row level security;
alter table seasons enable row level security;
alter table blind_structures enable row level security;
alter table events enable row level security;
alter table event_participants enable row level security;
alter table event_results enable row level security;
alter table app_settings enable row level security;

do $$
declare
  t text;
begin
  for t in select unnest(array['players', 'seasons', 'blind_structures', 'events', 'event_participants', 'event_results', 'app_settings'])
  loop
    execute format('drop policy if exists "%1$s_select_all" on %1$s', t);
    execute format('create policy "%1$s_select_all" on %1$s for select using (true)', t);

    execute format('drop policy if exists "%1$s_write_authenticated" on %1$s', t);
    execute format(
      'create policy "%1$s_write_authenticated" on %1$s for all to authenticated using (true) with check (true)',
      t
    );
  end loop;
end $$;
