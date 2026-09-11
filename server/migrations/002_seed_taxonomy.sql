insert into field_taxonomy (slug, label_bn, label_en) values
  ('agritech', 'এগ্রিটেক', 'Agritech'),
  ('healthtech', 'হেলথটেক', 'Healthtech'),
  ('edtech', 'এডটেক', 'Edtech'),
  ('fintech', 'ফিনটেক', 'Fintech'),
  ('commerce', 'কমার্স', 'Commerce'),
  ('logistics', 'লজিস্টিকস', 'Logistics')
on conflict (slug) do nothing;

insert into skill_taxonomy (slug, label_bn, label_en) values
  ('product', 'প্রোডাক্ট', 'Product'),
  ('design', 'ডিজাইন', 'Design'),
  ('marketing', 'মার্কেটিং', 'Marketing'),
  ('software', 'সফটওয়্যার', 'Software'),
  ('operations', 'অপারেশনস', 'Operations'),
  ('sales', 'সেলস', 'Sales')
on conflict (slug) do nothing;

insert into interest_taxonomy (slug, label_bn, label_en) values
  ('impact', 'ইমপ্যাক্ট', 'Impact'),
  ('sme', 'এসএমই', 'SME'),
  ('rural', 'গ্রামীণ বাজার', 'Rural market'),
  ('youth', 'তরুণ উদ্যোক্তা', 'Youth entrepreneurship')
on conflict (slug) do nothing;

insert into matching_config (version, skill_weight, location_weight, field_weight, interest_weight)
values (1, 40, 20, 20, 20)
on conflict (version) do nothing;
