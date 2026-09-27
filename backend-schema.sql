-- MapDate backend schema draft
-- PostgreSQL / Supabase compatible
-- Never expose exact location to other clients.

create table if not exists profiles (
  id uuid primary key,
  display_name text not null,
  birth_year int not null check (birth_year <= extract(year from now()) - 18),
  bio text default '',
  avatar_url text,
  location_lat double precision,
  location_lng double precision,
  location_updated_at timestamptz,
  created_at timestamptz default now()
);

create table if not exists likes (
  from_user uuid not null,
  to_user uuid not null,
  created_at timestamptz default now(),
  primary key (from_user, to_user),
  check (from_user <> to_user)
);

create table if not exists matches (
  id uuid primary key,
  user_a uuid not null,
  user_b uuid not null,
  created_at timestamptz default now(),
  unique (user_a, user_b)
);

create table if not exists messages (
  id uuid primary key,
  match_id uuid not null,
  sender_id uuid not null,
  body text not null check (char_length(body) between 1 and 2000),
  created_at timestamptz default now()
);

-- Production must additionally enable row-level security,
-- restrict profile writes to the owning authenticated user,
-- restrict messages to match participants,
-- and expose only approximate location / distance.
