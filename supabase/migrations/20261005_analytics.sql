-- Run once in the Supabase SQL editor. All data access goes through the server.
create table public.analytics_sessions (
 id uuid primary key, visitor uuid not null, started_at timestamptz not null default now(),
 updated_at timestamptz not null default now(), device text not null check(device in ('desktop','tablet','mobile')),
 source text not null check(source in ('direct','internal','search','social','referral')),
 is_new boolean not null, seq integer not null default 0, active_ms bigint not null default 0,
 scroll numeric not null default 0, page_views integer not null default 1, sections jsonb not null default '[]', last_section text
);
create index analytics_sessions_started on public.analytics_sessions(started_at);
create index analytics_sessions_visitor on public.analytics_sessions(visitor);
create table public.analytics_events (
 id uuid primary key, session_id uuid not null references public.analytics_sessions(id) on delete cascade,
 kind text not null, target text not null, section text not null, elapsed_ms integer not null,
 received_at timestamptz not null default now()
);
create index analytics_events_session on public.analytics_events(session_id);
create table public.analytics_limits (key text primary key, hits integer not null default 1, created_at timestamptz not null default now());
alter table public.analytics_sessions enable row level security;
alter table public.analytics_events enable row level security;
alter table public.analytics_limits enable row level security;
revoke all on public.analytics_sessions, public.analytics_events, public.analytics_limits from anon, authenticated;
grant all on public.analytics_sessions, public.analytics_events, public.analytics_limits to service_role;

create function public.analytics_rate_limit(p_key text, p_limit integer) returns boolean language plpgsql set search_path = '' as $$
declare n integer;
begin
 insert into public.analytics_limits(key) values(p_key) on conflict(key) do update set hits = analytics_limits.hits + 1 returning hits into n;
 return n <= p_limit;
end $$;
create function public.analytics_start(p_id uuid, p_visitor uuid, p_device text, p_source text) returns void language plpgsql set search_path = '' as $$
begin
 perform pg_advisory_xact_lock(hashtextextended(p_visitor::text,0));
 insert into public.analytics_sessions(id,visitor,device,source,is_new) values(p_id,p_visitor,p_device,p_source,not exists(select 1 from public.analytics_sessions where visitor=p_visitor));
end $$;
create function public.analytics_collect(p_id uuid, p_data jsonb) returns void language plpgsql set search_path = '' as $$
declare s public.analytics_sessions; e jsonb; n integer;
begin
 select * into s from public.analytics_sessions where id=p_id for update;
 if not found or s.started_at < now()-interval '24 hours' or (p_data->>'seq')::integer <= s.seq then return; end if;
 -- Browser time is untrusted: cap reported active time to elapsed server time (+ clock tolerance).
 if (p_data->>'active')::bigint > extract(epoch from now()-s.started_at)*1000+10000 then raise exception 'Invalid duration'; end if;
 update public.analytics_sessions set seq=(p_data->>'seq')::integer, updated_at=now(),
 active_ms=greatest(s.active_ms,(p_data->>'active')::bigint), scroll=greatest(s.scroll,(p_data->>'scroll')::numeric),
 page_views=greatest(s.page_views,(p_data->>'pageViews')::integer), sections=p_data->'sections',last_section=p_data->>'last' where id=p_id;
 select count(*) into n from public.analytics_events where session_id=p_id;
 for e in select value from jsonb_array_elements(p_data->'events') loop
  exit when n >= 500;
  insert into public.analytics_events(id,session_id,kind,target,section,elapsed_ms)
   values((e->>'id')::uuid,p_id,e->>'kind',e->>'target',e->>'section',(e->>'at')::integer) on conflict(id) do nothing;
  n:=n+1;
 end loop;
end $$;
create function public.analytics_forget(p_id uuid) returns void language sql set search_path = '' as $$
 delete from public.analytics_sessions where visitor=(select visitor from public.analytics_sessions where id=p_id);
$$;
create function public.analytics_report(p_days integer) returns jsonb language sql stable set search_path = '' as $$
with selected as (
 select *, (select count(*) from jsonb_array_elements(sections) x where x->>'id' <> 'footer') = 7 as completed,
 updated_at < now()-interval '30 minutes' as ended
 from public.analytics_sessions
 where started_at >= ((now() at time zone 'America/Sao_Paulo')::date - (least(greatest(p_days,1),30)-1))::timestamp at time zone 'America/Sao_Paulo'
), section_rows as (
 select s.id,s.visitor,x->>'id' name,(x->>'ms')::bigint ms from selected s cross join lateral jsonb_array_elements(s.sections) x
), daily as (
 select (started_at at time zone 'America/Sao_Paulo')::date as day,count(*) sessions,count(distinct visitor) visitors,round(avg(active_ms)/1000) active_seconds
 from selected group by 1
), section_stats as (
 select name,count(*) views,count(distinct visitor) visitors,round(avg(ms)/1000) seconds from section_rows group by name
), clicks as (
 select e.kind,e.target,e.section,count(*) clicks,count(distinct s.id) sessions from public.analytics_events e join selected s on s.id=e.session_id where e.kind not in ('section_enter','section_exit') group by e.kind,e.target,e.section
), abandonment as (
 select last_section name,count(*) sessions from selected where ended and not completed group by last_section
)
select jsonb_build_object(
 'overview',(select jsonb_build_object('visitors',count(distinct visitor),'sessions',count(*),'newVisitors',count(distinct visitor) filter(where is_new),'returningVisitors',count(distinct visitor) filter(where not is_new),'activeSeconds',coalesce(round(avg(active_ms)/1000),0),'scroll',coalesce(round(avg(scroll)),0),'completion',coalesce(round(100.0*count(*) filter(where completed)/nullif(count(*),0),1),0),'abandonment',coalesce(round(100.0*count(*) filter(where ended and not completed)/nullif(count(*) filter(where ended),0),1),0),'ended',count(*) filter(where ended),'pageViews',coalesce(sum(page_views),0),'completedVisitors',count(distinct visitor) filter(where completed)) from selected),
 'windows',(select jsonb_build_object('today',count(distinct visitor) filter(where started_at >= (date_trunc('day',now() at time zone 'America/Sao_Paulo') at time zone 'America/Sao_Paulo')),'week',count(distinct visitor) filter(where started_at >= (((now() at time zone 'America/Sao_Paulo')::date-6)::timestamp at time zone 'America/Sao_Paulo')),'month',count(distinct visitor)) from public.analytics_sessions where started_at >= (((now() at time zone 'America/Sao_Paulo')::date-29)::timestamp at time zone 'America/Sao_Paulo')),
 'daily',coalesce((select jsonb_agg(d order by d.day) from daily d),'[]'::jsonb),
 'sections',coalesce((select jsonb_agg(s) from section_stats s),'[]'::jsonb),
 'events',coalesce((select jsonb_agg(c order by c.clicks desc) from clicks c),'[]'::jsonb),
 'abandonment',coalesce((select jsonb_agg(a order by a.sessions desc) from abandonment a),'[]'::jsonb),
 'devices',coalesce((select jsonb_agg(d) from (select device name,count(*) sessions,count(distinct visitor) visitors from selected group by device) d),'[]'::jsonb),
 'sources',coalesce((select jsonb_agg(d) from (select source name,count(*) sessions from selected group by source) d),'[]'::jsonb),
 'scroll',(select jsonb_agg(jsonb_build_object('depth',depth,'sessions',(select count(*) from selected where scroll>=depth),'visitors',(select count(distinct visitor) from selected where scroll>=depth))) from unnest(array[25,50,75,90,100]) depth),
 'recent',coalesce((select jsonb_agg(r) from (select started_at,device,source,round(active_ms/1000.0) seconds,scroll,last_section,jsonb_array_length(sections) sections from selected order by started_at desc limit 30) r),'[]'::jsonb),
 'generatedAt',now()
);
$$;
revoke execute on function public.analytics_rate_limit(text,integer), public.analytics_start(uuid,uuid,text,text), public.analytics_collect(uuid,jsonb), public.analytics_forget(uuid), public.analytics_report(integer) from public, anon, authenticated;
grant execute on function public.analytics_rate_limit(text,integer), public.analytics_start(uuid,uuid,text,text), public.analytics_collect(uuid,jsonb), public.analytics_forget(uuid), public.analytics_report(integer) to service_role;

-- Supabase supports pg_cron. If unavailable, enable Cron in Integrations before running this part.
create extension if not exists pg_cron;
select cron.schedule('conselt-analytics-retention','17 3 * * *', $$delete from public.analytics_sessions where started_at < now()-interval '90 days'; delete from public.analytics_limits where created_at < now()-interval '1 day';$$);
