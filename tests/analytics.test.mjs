import assert from "node:assert/strict";
import { readFile, writeFile, mkdir, rm } from "node:fs/promises";
import ts from "typescript";
const folder = new URL("./.analytics-test/", import.meta.url);
await mkdir(folder, { recursive: true });
try {
  for (const file of ["model", "validation", "server"]) {
    const source = await readFile(new URL(`../src/analytics/${file}.ts`, import.meta.url), "utf8");
    const js = ts
      .transpileModule(source, {
        compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
      })
      .outputText.replace(/from "\.\/(model|validation)"/g, 'from "./$1.mjs"');
    await writeFile(new URL(`${file}.mjs`, folder), js);
  }
  const { activeDelta, scrollPercent } = await import(new URL("model.mjs", folder));
  const { snapshotSchema, startSchema } = await import(new URL("validation.mjs", folder));
  const { analyticsRequest } = await import(new URL("server.mjs", folder));
  let passed = 0;
  async function check(name, fn) {
    await fn();
    passed++;
    console.log(`OK ${name}`);
  }
  await check("aba oculta não acumula tempo", () =>
    assert.equal(activeDelta(0, 20000, 0, false), 0),
  );
  await check("inatividade é limitada a 30 segundos", () =>
    assert.equal(activeDelta(15000, 90000, 0, true), 15000),
  );
  await check("retorno não recupera tempo ocioso", () =>
    assert.equal(activeDelta(90000, 91000, 0, true), 0),
  );
  await check("atividade recente contabiliza delta", () =>
    assert.equal(activeDelta(90000, 91000, 90000, true), 1000),
  );
  await check("scroll limitado e página curta", () => {
    assert.equal(scrollPercent(500, 500, 1000), 100);
    assert.equal(scrollPercent(0, 800, 600), 100);
    assert.equal(scrollPercent(-20, 500, 1000), 0);
  });
  const snapshot = {
    pageViews: 1,
    seq: 1,
    active: 1000,
    scroll: 25,
    sections: [{ id: "hero", ms: 1000 }],
    last: "hero",
    events: [],
  };
  await check("rejeita texto livre e dados pessoais", () => {
    assert.equal(
      startSchema.safeParse({
        visitor: crypto.randomUUID(),
        device: "mobile",
        source: "direct",
        email: "private@example.com",
      }).success,
      false,
    );
    assert.equal(
      snapshotSchema.safeParse({
        ...snapshot,
        events: [
          {
            id: crypto.randomUUID(),
            kind: "email",
            target: "user@example.com",
            section: "hero",
            at: 0,
          },
        ],
      }).success,
      false,
    );
  });
  await check("rejeita seções duplicadas e tempo inflado", () => {
    assert.equal(
      snapshotSchema.safeParse({
        ...snapshot,
        sections: [...snapshot.sections, ...snapshot.sections],
      }).success,
      false,
    );
    assert.equal(
      snapshotSchema.safeParse({ ...snapshot, sections: [{ id: "hero", ms: 99999 }] }).success,
      false,
    );
  });
  const origin = "https://test.example";
  const env = {
    ANALYTICS_ENABLED: "true",
    SUPABASE_URL: "https://db.example",
    SUPABASE_SERVICE_ROLE_KEY: "server-secret",
    SUPABASE_ANON_KEY: "public",
    ANALYTICS_SIGNING_SECRET: "test-only-secret-32-characters-long",
    ANALYTICS_ORIGIN: origin,
    ANALYTICS_ADMIN_IDS: "admin-id",
  };
  const post = (path, body, from = origin) =>
    new Request(origin + "/api/analytics/" + path, {
      method: "POST",
      headers: { origin: from, "content-type": "application/json" },
      body: JSON.stringify(body),
    });
  await check("desativado sem configuração", async () =>
    assert.deepEqual(
      await (await analyticsRequest(new Request(origin + "/api/analytics/status"), {})).json(),
      { enabled: false },
    ),
  );
  await check("bloqueia origem externa", async () =>
    assert.equal(
      (await analyticsRequest(post("start", {}, "https://evil.example"), env)).status,
      403,
    ),
  );
  await check("relatório exige autenticação", async () =>
    assert.equal(
      (await analyticsRequest(new Request(origin + "/api/analytics/report"), env)).status,
      401,
    ),
  );
  await check("rejeita token forjado", async () =>
    assert.equal(
      (await analyticsRequest(post("collect", { token: "forged", snapshot }), env)).status,
      401,
    ),
  );
  const originalFetch = globalThis.fetch;
  await check("subdomínio abre painel mesmo antes da ativação", async () => {
    const response = await analyticsRequest(new Request("https://painel.conselt.com.br/"), {
      ANALYTICS_ADMIN_ORIGIN: "https://painel.conselt.com.br",
    });
    assert.equal(response.status, 307);
    assert.equal(response.headers.get("location"), "/admin/analytics");
  });
  await check("origem do painel separada da coleta pública", async () => {
    const separated = { ...env, ANALYTICS_ADMIN_ORIGIN: "https://painel.conselt.com.br" };
    assert.equal((await analyticsRequest(new Request(origin + "/api/analytics/report"), separated)).status, 403);
    assert.equal((await analyticsRequest(new Request("https://painel.conselt.com.br/api/analytics/report"), separated)).status, 401);
    assert.equal((await analyticsRequest(new Request("https://painel.conselt.com.br/api/analytics/start", {
      method: "POST", headers: { origin: "https://painel.conselt.com.br" }, body: "{}",
    }), separated)).status, 403);
  });
  const calls = [];
  globalThis.fetch = async (url, options) => {
    calls.push({ url, options });
    if (String(url).endsWith("/auth/v1/user")) return Response.json({ id: "not-admin" });
    if (String(url).endsWith("analytics_rate_limit")) return Response.json(true);
    // Real Supabase void RPCs return no JSON, including analytics_start/collect/forget.
    return new Response(null, { status: 204 });
  };
  try {
    await check("coleta entre subdomínios permite somente a landing autorizada", async () => {
      const panel = "https://painel.conselt.com.br";
      const separated = { ...env, ANALYTICS_ADMIN_ORIGIN: panel };
      const start = new Request(panel + "/api/analytics/start", {
        method: "POST", headers: { origin, "content-type": "text/plain;charset=UTF-8" },
        body: JSON.stringify({ visitor: crypto.randomUUID(), device: "desktop", source: "direct" }),
      });
      const response = await analyticsRequest(start, separated);
      assert.equal(response.status, 200);
      assert.equal(response.headers.get("access-control-allow-origin"), origin);
      assert.equal(response.headers.get("access-control-allow-credentials"), null);
      const preflight = await analyticsRequest(new Request(panel + "/api/analytics/start", {
        method: "OPTIONS", headers: { origin, "access-control-request-method": "POST" },
      }), separated);
      assert.equal(preflight.status, 204);
      const foreign = await analyticsRequest(new Request(panel + "/api/analytics/start", {
        method: "OPTIONS", headers: { origin: "https://evil.example", "access-control-request-method": "POST" },
      }), separated);
      assert.equal(foreign.status, 403);
      const login = await analyticsRequest(new Request(panel + "/api/analytics/login", {
        method: "POST", headers: { origin }, body: "{}",
      }), separated);
      assert.equal(login.status, 403);
      assert.equal(login.headers.get("access-control-allow-origin"), null);
    });
    await check("conta autenticada sem autorização não acessa dados", async () =>
      assert.equal(
        (
          await analyticsRequest(
            new Request(origin + "/api/analytics/report", {
              headers: { cookie: "conselt_admin=valid-token" },
            }),
            env,
          )
        ).status,
        401,
      ),
    );
    const response = await analyticsRequest(
      post("start", { visitor: crypto.randomUUID(), device: "mobile", source: "direct" }),
      env,
    );
    const { token } = await response.json();
    await check("emite sessão assinada sem expor chave", () => {
      assert.equal(response.status, 200);
      assert.ok(token);
      assert.ok(!token.includes("server-secret"));
    });
    await check("coleta válida chega à RPC privada", async () => {
      assert.equal((await analyticsRequest(post("collect", { token, snapshot }), env)).status, 200);
      assert.ok(calls.some((c) => c.url.endsWith("analytics_collect")));
    });
    await check("alterar token invalida assinatura", async () =>
      assert.equal(
        (
          await analyticsRequest(
            post("collect", {
              token: token.slice(0, -1) + (token.endsWith("0") ? "1" : "0"),
              snapshot,
            }),
            env,
          )
        ).status,
        401,
      ),
    );
    await check("revogação usa sessão assinada", async () => {
      assert.equal((await analyticsRequest(post("forget", { token }), env)).status, 200);
      assert.ok(calls.some((c) => c.url.endsWith("analytics_forget")));
    });
    await check("cookie de logout é HttpOnly e Secure", async () => {
      const r = await analyticsRequest(post("logout", {}), env);
      assert.match(r.headers.get("set-cookie"), /HttpOnly; SameSite=Strict/);
      assert.match(r.headers.get("set-cookie"), /Secure/);
    });
    await check("payload excessivo recusado", async () =>
      assert.equal(
        (await analyticsRequest(post("collect", { text: "x".repeat(17000) }), env)).status,
        503,
      ),
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
  console.log(`${passed} verificações passaram. Banco real não é simulado como validação SQL.`);
} finally {
  await rm(folder, { recursive: true, force: true });
}
