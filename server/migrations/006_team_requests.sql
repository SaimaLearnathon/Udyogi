create table if not exists team_requests (
  id uuid primary key default gen_random_uuid(),
  thesis_id uuid not null references theses(id) on delete cascade,
  founder_id uuid not null references users(id) on delete cascade,
  candidate_id uuid not null references users(id) on delete cascade,
  skill_tag text,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'declined')),
  message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (thesis_id, candidate_id)
);

create index if not exists team_requests_candidate_idx on team_requests (candidate_id);
create index if not exists team_requests_founder_idx on team_requests (founder_id);
