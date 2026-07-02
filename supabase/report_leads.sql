create table if not exists public.report_leads (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  report_slug text not null,
  report_title text,
  source_path text,
  user_agent text,
  created_at timestamptz not null default now()
);

alter table public.report_leads enable row level security;

drop policy if exists "Anyone can submit report leads" on public.report_leads;
create policy "Anyone can submit report leads"
on public.report_leads
for insert
to anon
with check (
  email ~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
  and length(email) <= 320
  and length(report_slug) <= 160
);
