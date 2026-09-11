create extension if not exists pgcrypto;

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email_lookup text unique not null,
  email_ciphertext text not null,
  password_hash text not null,
  public_name text not null,
  public_bio text not null default '',
  is_founder boolean not null default true,
  is_seeker boolean not null default true,
  availability text not null check (availability in ('full_time', 'part_time', 'advisor')),
  location_city text,
  location_region text,
  location_country text,
  location_precision text not null default 'city' check (location_precision in ('exact', 'city', 'region')),
  location_consent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists field_taxonomy (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  label_bn text not null,
  label_en text not null
);

create table if not exists field_adjacencies (
  field_id uuid not null references field_taxonomy(id),
  adjacent_field_id uuid not null references field_taxonomy(id),
  primary key (field_id, adjacent_field_id)
);

create table if not exists skill_taxonomy (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  label_bn text not null,
  label_en text not null
);

create table if not exists interest_taxonomy (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  label_bn text not null,
  label_en text not null
);

create table if not exists user_skills (
  user_id uuid not null references users(id) on delete cascade,
  skill_id uuid not null references skill_taxonomy(id),
  primary key (user_id, skill_id)
);

create table if not exists user_fields (
  user_id uuid not null references users(id) on delete cascade,
  field_id uuid not null references field_taxonomy(id),
  primary key (user_id, field_id)
);

create table if not exists user_interests (
  user_id uuid not null references users(id) on delete cascade,
  interest_id uuid not null references interest_taxonomy(id),
  primary key (user_id, interest_id)
);

create table if not exists consultant_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  mode text not null check (mode in ('ideation', 'validation')),
  status text not null default 'draft',
  created_at timestamptz not null default now()
);

create table if not exists consultant_messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references consultant_sessions(id) on delete cascade,
  role text not null check (role in ('user', 'assistant', 'system')),
  content_ciphertext text not null,
  created_at timestamptz not null default now()
);

create table if not exists theses (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references consultant_sessions(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  version integer not null,
  status text not null check (status in ('draft', 'confirmed')),
  parsed_data jsonb not null,
  raw_model_output text not null,
  confirmed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (session_id, version)
);

create table if not exists thesis_skills (
  thesis_id uuid not null references theses(id) on delete cascade,
  skill_id uuid not null references skill_taxonomy(id),
  priority text not null check (priority in ('High', 'Medium', 'Low')),
  primary key (thesis_id, skill_id)
);

create table if not exists published_listings (
  id uuid primary key default gen_random_uuid(),
  thesis_id uuid not null references theses(id),
  founder_id uuid not null references users(id),
  title text not null,
  short_pitch text not null,
  field_id uuid references field_taxonomy(id),
  status text not null default 'active' check (status in ('active', 'paused', 'unpublished')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists listing_roles (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references published_listings(id) on delete cascade,
  title text not null,
  description text not null
);

create table if not exists listing_role_skills (
  role_id uuid not null references listing_roles(id) on delete cascade,
  skill_id uuid not null references skill_taxonomy(id),
  primary key (role_id, skill_id)
);

create table if not exists listing_interests (
  listing_id uuid not null references published_listings(id) on delete cascade,
  interest_id uuid not null references interest_taxonomy(id),
  primary key (listing_id, interest_id)
);

create table if not exists matching_config (
  id uuid primary key default gen_random_uuid(),
  version integer not null unique,
  skill_weight integer not null,
  location_weight integer not null,
  field_weight integer not null,
  interest_weight integer not null,
  created_at timestamptz not null default now(),
  check (skill_weight + location_weight + field_weight + interest_weight = 100)
);

create table if not exists match_scores (
  id uuid primary key default gen_random_uuid(),
  seeker_id uuid not null references users(id) on delete cascade,
  listing_role_id uuid not null references listing_roles(id) on delete cascade,
  skill_score numeric not null,
  location_score numeric not null,
  field_score numeric not null,
  interest_score numeric not null,
  total_score numeric not null,
  config_version integer not null references matching_config(version),
  computed_at timestamptz not null default now()
);

create table if not exists connection_requests (
  id uuid primary key default gen_random_uuid(),
  seeker_id uuid not null references users(id) on delete cascade,
  listing_role_id uuid not null references listing_roles(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'declined')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists message_threads (
  id uuid primary key default gen_random_uuid(),
  connection_request_id uuid not null references connection_requests(id),
  created_at timestamptz not null default now()
);

create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references message_threads(id) on delete cascade,
  sender_id uuid not null references users(id) on delete cascade,
  content_ciphertext text not null,
  created_at timestamptz not null default now()
);

create table if not exists model_calls (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete set null,
  purpose text not null,
  model_version text not null,
  status text not null,
  prompt_tokens integer,
  completion_tokens integer,
  created_at timestamptz not null default now()
);
