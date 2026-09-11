create table if not exists user_custom_skills (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  label text not null,
  normalized_label text not null,
  created_at timestamptz not null default now(),
  unique (user_id, normalized_label)
);
