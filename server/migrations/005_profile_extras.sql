alter table users
  add column if not exists linkedin_url text,
  add column if not exists facebook_url text,
  add column if not exists portfolio_url text,
  add column if not exists contribution_count integer not null default 0,
  add column if not exists success_rate integer,
  add column if not exists eligibility text not null default '';

alter table users
  add constraint users_success_rate_range check (success_rate is null or (success_rate >= 0 and success_rate <= 100));

alter table users
  add constraint users_contribution_count_nonnegative check (contribution_count >= 0);
