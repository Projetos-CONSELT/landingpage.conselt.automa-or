import { snapshotSchema, startSchema } from "./validation";

type Config = {
  url: string;
  key: string;
  anon: string;
  secret: string;
  origin: string;
  adminOrigin: string;
  admins: string[];
};
const json = (data: unknown, status = 200, extra: Record<string, string> = {}) =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json",
      "cache-control": "no-store",
      "x-content-type-options": "nosniff",
      ...extra,
    },
  });
function config(env: unknown): Config | null {
  const vars = {
    ...(typeof process !== "undefined" ? process.env : {}),
    ...(typeof env === "object" && env ? env : {}),
  } as Record<string, string | undefined>;
  if (vars["ANALYTICS_ENABLED"] !== "true") return null;
  const url = vars["SUPABASE_URL"],
    key = vars["SUPABASE_SERVICE_ROLE_KEY"],
    anon = vars["SUPABASE_ANON_KEY"],
    secret = vars["ANALYTICS_SIGNING_SECRET"],
    origin = vars["ANALYTICS_ORIGIN"];
  if (
    !url ||
    !key ||
    !anon ||
    !secret ||
    secret.length < 32 ||
    !origin ||
    !vars["ANALYTICS_ADMIN_IDS"]
  )
    return null;
  return {
    url: url.replace(/\/$/, ""),
    key,
    anon,
    secret,
    origin,
    adminOrigin: vars["ANALYTICS_ADMIN_ORIGIN"] || origin,
    admins: vars["ANALYTICS_ADMIN_IDS"].split(",").map((s) => s.trim()),
  };
}
async function rpc(c: Config, name: string, args: unknown) {
  const response = await fetch(`${c.url}/rest/v1/rpc/${name}`, {
    method: "POST",
    headers: {
      apikey: c.key,
      Authorization: `Bearer ${c.key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(args),
    signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) throw new Error("Analytics database unavailable");
  // PostgREST can return an empty body for functions declared RETURNS void.
  const body = await response.text();
  return body.trim() ? JSON.parse(body) : null;
}
async function sign(c: Config, value: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(c.secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const result = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value));
  return Array.from(new Uint8Array(result), (b) => b.toString(16).padStart(2, "0")).join("");
}
async function tokenId(c: Config, token: unknown) {
  if (typeof token !== "string" || token.length > 160) return null;
  const [id, expiry, signature] = token.split(".");
  if (!id || !expiry || !signature || !/^[0-9a-f-]{36}$/.test(id) || Number(expiry) < Date.now())
    return null;
  const expected = await sign(c, `${id}.${expiry}`);
  let difference = expected.length ^ signature.length;
  for (let i = 0; i < expected.length; i++)
    difference |= expected.charCodeAt(i) ^ (signature.charCodeAt(i) || 0);
  return difference === 0 ? id : null;
}
async function readBody(request: Request) {
  if (Number(request.headers.get("content-length") || 0) > 16384) throw new Error("body");
  const reader = request.body?.getReader();
  if (!reader) throw new Error("body");
  let size = 0,
    text = "";
  const decoder = new TextDecoder();
  while (true) {
    const part = await reader.read();
    if (part.done) break;
    size += part.value.length;
    if (size > 16384) {
      await reader.cancel();
      throw new Error("body");
    }
    text += decoder.decode(part.value, { stream: true });
  }
  return JSON.parse(text + decoder.decode()) as Record<string, unknown>;
}
async function admin(c: Config, token: string) {
  if (!token || token.length > 8000) return false;
  const response = await fetch(`${c.url}/auth/v1/user`, {
    headers: { apikey: c.anon, Authorization: `Bearer ${token}` },
    signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) return false;
  const user = (await response.json()) as { id?: string };
  return !!user.id && c.admins.includes(user.id);
}
function cookie(request: Request) {
  return (
    request.headers
      .get("cookie")
      ?.split(";")
      .map((s) => s.trim())
      .find((s) => s.startsWith("conselt_admin="))
      ?.slice(14) || ""
  );
}
function setCookie(c: Config, value: string, seconds: number) {
  return `conselt_admin=${value}; HttpOnly; SameSite=Strict; Path=/api/analytics; Max-Age=${seconds}${c.origin.startsWith("https:") ? "; Secure" : ""}`;
}

async function handleAnalyticsRequest(request: Request, env: unknown): Promise<Response | null> {
  const requestUrl = new URL(request.url);
  const path = requestUrl.pathname;
  const adminOrigin = (typeof env === "object" && env
    ? (env as Record<string, string>)["ANALYTICS_ADMIN_ORIGIN"] : undefined)
    || (typeof process !== "undefined" ? process.env["ANALYTICS_ADMIN_ORIGIN"] : undefined);
  if (adminOrigin === requestUrl.origin && path === "/")
    return new Response(null, { status: 307, headers: { location: "/admin/analytics", "cache-control": "no-store" } });
  if (!path.startsWith("/api/analytics/")) return null;
  const c = config(env);
  if (path === "/api/analytics/status" && request.method === "GET") return json({ enabled: !!c });
  if (!c) return json({ error: "Analytics ainda não configurado." }, 503);
  const administrative = ["/api/analytics/login", "/api/analytics/logout", "/api/analytics/report"].includes(path);
  const expectedOrigin = administrative ? c.adminOrigin : c.origin;
  if (requestUrl.origin !== c.adminOrigin)
    return json({ error: "Origem não permitida." }, 403);
  if (request.method !== "GET" && request.headers.get("origin") !== expectedOrigin)
    return json({ error: "Origem não permitida." }, 403);
  try {
    if (path === "/api/analytics/report" && request.method === "GET") {
      if (!(await admin(c, cookie(request))))
        return json({ error: "Entre com uma conta administradora autorizada." }, 401);
      const days = Number(new URL(request.url).searchParams.get("days") || 30);
      if (![1, 7, 30].includes(days)) return json({ error: "Período inválido" }, 400);
      return json(await rpc(c, "analytics_report", { p_days: days }));
    }
    if (request.method !== "POST") return json({ error: "Método não permitido" }, 405);
    const body = await readBody(request);
    if (path === "/api/analytics/login") {
      const address =
        request.headers.get("x-vercel-forwarded-for") ||
        request.headers.get("cf-connecting-ip") ||
        "local";
      const loginBucket = await sign(c, `login:${Math.floor(Date.now() / 900000)}:${address}`);
      if (!(await rpc(c, "analytics_rate_limit", { p_key: loginBucket, p_limit: 15 })))
        return json({ error: "Muitas tentativas. Aguarde 15 minutos." }, 429);
      if (
        typeof body["email"] !== "string" ||
        body["email"].length > 254 ||
        typeof body["password"] !== "string" ||
        body["password"].length > 256
      )
        return json({ error: "Credenciais inválidas" }, 400);
      const response = await fetch(`${c.url}/auth/v1/token?grant_type=password`, {
        method: "POST",
        headers: { apikey: c.anon, "content-type": "application/json" },
        body: JSON.stringify({ email: body["email"], password: body["password"] }),
        signal: AbortSignal.timeout(10000),
      });
      const result = (await response.json()) as { access_token?: string; expires_in?: number };
      if (!response.ok || !result.access_token || !(await admin(c, result.access_token)))
        return json({ error: "Credenciais inválidas ou conta sem autorização." }, 401);
      return json({ ok: true }, 200, {
        "set-cookie": setCookie(c, result.access_token, Math.min(result.expires_in || 3600, 3600)),
      });
    }
    if (path === "/api/analytics/logout")
      return json({ ok: true }, 200, { "set-cookie": setCookie(c, "", 0) });
    if (path === "/api/analytics/start") {
      const input = startSchema.safeParse(body);
      if (!input.success) return json({ error: "Dados inválidos" }, 400);
      // A rotating HMAC is used solely for abuse control, discarded after 24h. No IP is stored.
      const ip =
        request.headers.get("x-vercel-forwarded-for") ||
        request.headers.get("cf-connecting-ip") ||
        "local";
      const bucket = await sign(c, `rate:${new Date().toISOString().slice(0, 13)}:${ip}`);
      const allowed = await rpc(c, "analytics_rate_limit", { p_key: bucket, p_limit: 120 });
      if (!allowed) return json({ error: "Limite temporário" }, 429);
      const id = crypto.randomUUID(),
        expiry = Date.now() + 86400000;
      await rpc(c, "analytics_start", {
        p_id: id,
        p_visitor: input.data.visitor,
        p_device: input.data.device,
        p_source: input.data.source,
      });
      const payload = `${id}.${expiry}`;
      return json({ token: `${payload}.${await sign(c, payload)}` });
    }
    const id = await tokenId(c, body["token"]);
    if (!id) return json({ error: "Sessão inválida" }, 401);
    if (path === "/api/analytics/forget") {
      await rpc(c, "analytics_forget", { p_id: id });
      return json({ ok: true });
    }
    if (path === "/api/analytics/collect") {
      const parsed = snapshotSchema.safeParse(body["snapshot"]);
      if (!parsed.success) return json({ error: "Evento inválido" }, 400);
      await rpc(c, "analytics_collect", { p_id: id, p_data: parsed.data });
      return json({ ok: true });
    }
    return json({ error: "Não encontrado" }, 404);
  } catch {
    return json({ error: "Não foi possível processar os dados. Tente novamente." }, 503);
  }
}

const publicPaths = new Set(["status", "start", "collect", "forget"]);
export async function analyticsRequest(request: Request, env: unknown): Promise<Response | null> {
  const path = new URL(request.url).pathname;
  const c = config(env);
  const isPublic = publicPaths.has(path.replace(/^\/api\/analytics\//, "")) && path.startsWith("/api/analytics/");
  const allowed = !!c && request.headers.get("origin") === c.origin && new URL(request.url).origin === c.adminOrigin;
  if (request.method === "OPTIONS" && isPublic) {
    if (!allowed || !["GET", "POST"].includes(request.headers.get("access-control-request-method") || ""))
      return json({ error: "Origem não permitida." }, 403);
    return new Response(null, { status: 204, headers: {
      "access-control-allow-origin": c!.origin,
      "access-control-allow-methods": "GET, POST",
      "access-control-allow-headers": "content-type",
      "access-control-max-age": "600",
      "vary": "Origin",
    } });
  }
  const response = await handleAnalyticsRequest(request, env);
  if (response && isPublic && allowed) {
    response.headers.set("access-control-allow-origin", c!.origin);
    response.headers.set("vary", "Origin");
  }
  return response;
}
