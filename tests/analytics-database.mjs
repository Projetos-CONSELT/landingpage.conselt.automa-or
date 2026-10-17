// Run with PGLITE_MODULE pointing to an installed @electric-sql/pglite module.
// This is an isolated in-memory PostgreSQL test; no Supabase account is accessed.
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";
const { PGlite } = await import(
  process.env.PGLITE_MODULE ? pathToFileURL(process.env.PGLITE_MODULE).href : "@electric-sql/pglite"
);
const db = new PGlite();
try {
  await db.exec("create role anon; create role authenticated; create role service_role bypassrls;");
  const migration = await readFile(
    new URL("../supabase/migrations/20261005_analytics.sql", import.meta.url),
    "utf8",
  );
  await db.exec(migration.split("-- Supabase supports pg_cron.")[0]);
  const visitor = crypto.randomUUID(),
    first = crypto.randomUUID(),
    second = crypto.randomUUID(),
    event = crypto.randomUUID();
  await db.query("select analytics_start($1,$2,'mobile','direct')", [first, visitor]);
  await db.query("select analytics_start($1,$2,'desktop','search')", [second, visitor]);
  const data = {
    pageViews: 2,
    seq: 1,
    active: 7000,
    scroll: 100,
    sections: ["hero", "features", "living", "benefits", "trust", "faq", "cta"].map((id) => ({
      id,
      ms: 1000,
    })),
    last: "cta",
    events: [{ id: event, kind: "whatsapp", target: "cta-whatsapp-1", section: "cta", at: 7000 }],
  };
  await db.query("select analytics_collect($1,$2::jsonb)", [first, JSON.stringify(data)]);
  await db.query("select analytics_collect($1,$2::jsonb)", [first, JSON.stringify(data)]);
  let report = (await db.query("select analytics_report(30) as report")).rows[0].report;
  assert.equal(report.overview.sessions, 2);
  assert.equal(report.overview.visitors, 1);
  assert.equal(report.overview.newVisitors, 1);
  assert.equal(report.overview.returningVisitors, 1);
  assert.equal(report.overview.pageViews, 3);
  assert.equal(report.overview.completion, 50);
  assert.equal(report.events[0].clicks, 1);
  assert.equal(report.sections.length, 7);
  console.log(
    "OK PostgreSQL: criação, deduplicação, recorrência, visualizações, conclusão e eventos",
  );
  await db.query(
    "update analytics_sessions set started_at=now()-interval '1 hour',updated_at=now()-interval '31 minutes' where id=$1",
    [second],
  );
  report = (await db.query("select analytics_report(30) as report")).rows[0].report;
  assert.equal(report.overview.abandonment, 100);
  assert.equal(report.overview.ended, 1);
  console.log("OK abandono considera apenas sessões encerradas");
  const inflated = { ...data, seq: 2, active: 800000 };
  await assert.rejects(() =>
    db.query("select analytics_collect($1,$2::jsonb)", [first, JSON.stringify(inflated)]),
  );
  console.log("OK banco rejeita duração superior ao tempo real");
  await db.exec("set role anon");
  await assert.rejects(() => db.query("select * from analytics_sessions"));
  await assert.rejects(() => db.query("select analytics_report(30)"));
  await assert.rejects(() => db.query("select analytics_rate_limit('x',100)"));
  await db.exec("reset role; set role authenticated");
  await assert.rejects(() => db.query("select analytics_report(30)"));
  await db.exec("reset role");
  console.log("OK anon e authenticated não têm acesso às tabelas nem às RPCs");
  assert.equal(
    (await db.query("select analytics_rate_limit('test',1) allowed")).rows[0].allowed,
    true,
  );
  assert.equal(
    (await db.query("select analytics_rate_limit('test',1) allowed")).rows[0].allowed,
    false,
  );
  console.log("OK limite de requisições persistente");
  await db.query("select analytics_forget($1)", [first]);
  assert.equal((await db.query("select count(*)::int n from analytics_sessions")).rows[0].n, 0);
  assert.equal((await db.query("select count(*)::int n from analytics_events")).rows[0].n, 0);
  console.log("OK exclusão por visitante com cascata dos eventos");
  console.log("Migração e métricas validadas em PostgreSQL. Cron deve ser verificado no Supabase.");
} finally {
  await db.close();
}
