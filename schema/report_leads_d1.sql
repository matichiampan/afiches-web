create table if not exists report_leads (
  id integer primary key autoincrement,
  email text not null,
  report_slug text not null,
  report_title text,
  source_path text,
  user_agent text,
  created_at text not null default (datetime('now'))
);

create index if not exists idx_report_leads_created_at on report_leads(created_at);
create index if not exists idx_report_leads_report_slug on report_leads(report_slug);
