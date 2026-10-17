// Disposable local integration fixture. Never deploy this test service.
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";
const { PGlite } = await import(pathToFileURL(process.env.PGLITE_MODULE).href);
const db = new PGlite();
await db.exec("create role anon; create role authenticated; create role service_role bypassrls;");
await db.exec(
  (
    await readFile(
      new URL("../supabase/migrations/20261005_analytics.sql", import.meta.url),
      "utf8",
    )
  ).split("-- Supabase supports pg_cron.")[0],
);
const args = {
  analytics_start: ["p_id", "p_visitor", "p_device", "p_source"],
  analytics_collect: ["p_id", "p_data"],
  analytics_forget: ["p_id"],
  analytics_rate_limit: ["p_key", "p_limit"],
  analytics_report: ["p_days"],
};
createServer(async (req, res) => {
  res.setHeader("content-type", "application/json");
  try {
    const url = new URL(req.url, "http://127.0.0.1:5190");
    if (url.pathname === "/auth/v1/user") {
      res.end(JSON.stringify({ id: "local-test-admin" }));
      return;
    }
    let text = "";
    for await (const part of req) text += part;
    const body = JSON.parse(text || "{}");
    if (url.pathname === "/auth/v1/token") {
      if (body.email !== "admin@example.test" || body.password !== "local-test-only") {
        res.statusCode = 401;
        res.end("{}");
        return;
      }
      res.end(JSON.stringify({ access_token: "local-test-token", expires_in: 3600 }));
      return;
    }
    const name = url.pathname.split("/").pop();
    if (!args[name]) {
      res.statusCode = 404;
      res.end("{}");
      return;
    }
    const values = args[name].map((key) =>
      typeof body[key] === "object" ? JSON.stringify(body[key]) : body[key],
    );
    const result = await db.query(
      `select public.${name}(${values.map((_, i) => "$" + (i + 1)).join(",")}) as result`,
      values,
    );
    res.end(JSON.stringify(result.rows[0].result));
  } catch (error) {
    res.statusCode = 500;
    res.end(JSON.stringify({ error: error.message }));
  }
}).listen(5190, "127.0.0.1", () =>
  console.log("Disposable local analytics PostgreSQL fixture: 5190"),
);
