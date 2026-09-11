alter table team_requests
  add column if not exists responded_at timestamptz;
