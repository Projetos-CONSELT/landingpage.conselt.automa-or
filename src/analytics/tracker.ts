import { activeDelta, scrollPercent, sections, type AnalyticsEvent, type Snapshot } from "./model";
import { analyticsEndpoint } from "./endpoint";

type Section = (typeof sections)[number];
const visitorKey = "conselt-analytics-visitor-v1";
const sessionKey = "conselt-analytics-session-v1";
const request = (path: string, data: unknown, signal?: AbortSignal) =>
  fetch(analyticsEndpoint(path), {
    method: "POST",
    headers: { "content-type": "text/plain;charset=UTF-8" },
    credentials: "omit",
    body: JSON.stringify(data),
    keepalive: true,
    ...(signal ? { signal } : {}),
  });
export async function startTracker(signal?: AbortSignal) {
  if (signal?.aborted) throw new Error("Tracking cancelled");
  let visitor = crypto.randomUUID();
  try {
    const saved = JSON.parse(localStorage.getItem(visitorKey) || "null") as {
      id: string;
      expires: number;
    } | null;
    if (saved && saved.expires > Date.now() && /^[0-9a-f-]{36}$/.test(saved.id))
      visitor = saved.id as typeof visitor;
    localStorage.setItem(
      visitorKey,
      JSON.stringify({ id: visitor, expires: Date.now() + 90 * 86400000 }),
    );
  } catch {
    /* Memory-only when storage is blocked. */
  }
  let source = "direct";
  try {
    if (document.referrer) {
      const host = new URL(document.referrer).hostname;
      source =
        host === location.hostname
          ? "internal"
          : /(^|\.)(google\.[a-z.]+|bing.com|duckduckgo.com|yahoo.com)$/.test(host)
            ? "search"
            : /(^|\.)(instagram.com|facebook.com|linkedin.com|t.co|youtube.com)$/.test(host)
              ? "social"
              : "referral";
    }
  } catch {
    /* No URL, query or referrer is sent. */
  }
  const device = matchMedia("(pointer: coarse)").matches
    ? Math.min(screen.width, screen.height) >= 600
      ? "tablet"
      : "mobile"
    : "desktop";
  let token = "",
    started = Date.now(),
    lastInteraction = performance.now(),
    previous = lastInteraction,
    lastWall = Date.now();
  let state: Snapshot = {
    pageViews: 1,
    seq: 0,
    active: 0,
    scroll: 0,
    sections: [],
    last: null,
    events: [],
  };
  let stopped = false,
    busy = false,
    opening: Promise<void> | null = null,
    lastSent = "";
  function persist() {
    if (stopped || signal?.aborted) return;
    try {
      sessionStorage.setItem(sessionKey, JSON.stringify({ token, started, lastWall, state }));
    } catch {
      /* Best effort. */
    }
  }
  async function open() {
    const response = await request("start", { visitor, device, source }, signal);
    if (!response.ok) throw new Error("Analytics unavailable");
    const result = (await response.json()) as { token: string };
    if (stopped || signal?.aborted) throw new Error("Tracking cancelled");
    token = result.token;
    started = Date.now();
    previous = performance.now();
    lastInteraction = previous;
    lastSent = "";
    state = { pageViews: 1, seq: 0, active: 0, scroll: 0, sections: [], last: null, events: [] };
    persist();
  }
  try {
    const saved = JSON.parse(sessionStorage.getItem(sessionKey) || "null") as {
      token: string;
      started: number;
      lastWall: number;
      state: Snapshot;
    } | null;
    if (
      saved &&
      Date.now() - saved.lastWall < 1800000 &&
      Date.now() - saved.started < 23 * 3600000
    ) {
      token = saved.token;
      started = saved.started;
      lastWall = saved.lastWall;
      state = saved.state;
      state.pageViews = Math.min(1000, (state.pageViews || 1) + 1);
    }
  } catch {
    /* Invalid local data starts a fresh session. */
  }
  if (!token) await open();
  const nodes = [
    ...document.querySelectorAll<HTMLElement>("section[data-backdrop], footer[data-backdrop]"),
  ];
  const ratios = new Map<Section, number>();
  let current: Section | null = null;
  function sectionEvent(id: Section, kind: "section_enter" | "section_exit") {
    if (state.events.length < 100)
      state.events.push({
        id: crypto.randomUUID(),
        kind,
        target: id,
        section: id,
        at: Math.min(86400000, Date.now() - started),
      });
  }
  let visible = document.visibilityState === "visible" && document.hasFocus();
  function tick() {
    const now = performance.now();
    const delta = activeDelta(previous, now, lastInteraction, visible);
    previous = now;
    if (delta > 0 && !opening && !stopped) {
      state.active += Math.round(delta);
      if (current) {
        let section = state.sections.find((s) => s.id === current);
        if (!section) {
          section = { id: current, ms: 0 };
          state.sections.push(section);
        }
        section.ms += Math.round(delta);
        state.last = current;
      }
    }
  }
  const observer = new IntersectionObserver(
    (entries) => {
      tick();
      for (const entry of entries)
        ratios.set(
          (entry.target as HTMLElement).dataset["backdrop"] as Section,
          entry.intersectionRect.height,
        );
      const next =
        [...ratios.entries()].sort((a, b) => b[1] - a[1]).find(([, height]) => height > 0)?.[0] ||
        null;
      if (next !== current && visible) {
        if (current) sectionEvent(current, "section_exit");
        if (next) sectionEvent(next, "section_enter");
      }
      current = next;
    },
    { threshold: [0, 0.1, 0.25, 0.5, 0.75, 1], rootMargin: "-74px 0px 0px" },
  );
  nodes.forEach((node) => observer.observe(node));
  function activity() {
    tick();
    if ((Date.now() - lastWall >= 1800000 || Date.now() - started >= 23 * 3600000) && !opening) {
      opening = flush()
        .then(open)
        .catch(() => {
          token = "";
        })
        .finally(() => {
          opening = null;
          previous = performance.now();
        });
    }
    lastWall = Date.now();
    lastInteraction = performance.now();
    if (visible)
      state.scroll = Math.max(
        state.scroll,
        Math.round(
          scrollPercent(window.scrollY, window.innerHeight, document.documentElement.scrollHeight) *
            100,
        ) / 100,
      );
  }
  async function flush(beacon = false) {
    tick();
    persist();
    if (!token || busy || stopped) return;
    const fingerprint = JSON.stringify([
      state.active,
      state.scroll,
      state.sections,
      state.last,
      state.events,
    ]);
    if (fingerprint === lastSent) return;
    state.seq++;
    const events = state.events.slice(0, 30),
      body = { token, snapshot: { ...state, events } };
    persist();
    if (beacon && navigator.sendBeacon && new URL(analyticsEndpoint("collect"), location.href).origin === location.origin) {
      navigator.sendBeacon(
        analyticsEndpoint("collect"),
        new Blob([JSON.stringify(body)], { type: "application/json" }),
      );
      return;
    }
    busy = true;
    try {
      const response = await request("collect", body);
      if (response.ok && !stopped && !signal?.aborted) {
        const ids = new Set(events.map((e) => e.id));
        state.events = state.events.filter((e) => !ids.has(e.id));
        lastSent = JSON.stringify([
          body.snapshot.active,
          body.snapshot.scroll,
          body.snapshot.sections,
          body.snapshot.last,
          state.events,
        ]);
        persist();
      }
    } catch {
      /* Retry bounded events on the next heartbeat. */
    } finally {
      busy = false;
    }
  }
  function focus() {
    tick();
    const next = document.visibilityState === "visible" && document.hasFocus();
    if (next !== visible && current) sectionEvent(current, next ? "section_enter" : "section_exit");
    visible = next;
    previous = performance.now();
    if (visible) activity();
    else void flush(true);
  }
  function hide() {
    tick();
    if (visible && current) sectionEvent(current, "section_exit");
    visible = false;
    void flush(true);
  }
  function record(element: Element, kind: AnalyticsEvent["kind"]) {
    const parent = element.closest("[data-backdrop]");
    const section = (parent?.getAttribute("data-backdrop") as Section) || "hero";
    const elements = parent
      ? [...parent.querySelectorAll("a,button,form")]
      : [...document.querySelectorAll("header a,header button")];
    // Stable positional identifiers, never visible text, field values, phone numbers or URLs.
    const custom = element.getAttribute("data-analytics-id");
    const target =
      custom && /^[a-z0-9_-]{1,64}$/.test(custom)
        ? custom
        : `${section}-${kind}-${Math.max(0, elements.indexOf(element)) + 1}`;
    if (state.events.length < 100)
      state.events.push({
        id: crypto.randomUUID(),
        kind,
        target,
        section,
        at: Math.min(86400000, Date.now() - started),
      });
    void flush();
  }
  function click(event: MouseEvent) {
    activity();
    const el = event.target instanceof Element ? event.target.closest("a,button") : null;
    if (!el || el.closest("[data-analytics-ignore]")) return;
    let kind: AnalyticsEvent["kind"] = el.tagName === "A" ? "cta" : "button";
    if (el instanceof HTMLAnchorElement) {
      const url = new URL(el.href, location.href);
      kind =
        url.protocol === "tel:"
          ? "phone"
          : url.protocol === "mailto:"
            ? "email"
            : /(^|\.)(wa.me|whatsapp.com)$/.test(url.hostname)
              ? "whatsapp"
              : url.origin !== location.origin
                ? "external"
                : "cta";
    }
    record(el, kind);
  }
  function submit(event: Event) {
    activity();
    if (event.target instanceof HTMLFormElement && !event.target.closest("[data-analytics-ignore]"))
      record(event.target, "form_submit");
  }
  function success(event: Event) {
    if (event.target instanceof HTMLFormElement) record(event.target, "form_success");
  }
  window.addEventListener("scroll", activity, { passive: true });
  window.addEventListener("pointerdown", activity, { passive: true });
  window.addEventListener("keydown", activity);
  window.addEventListener("focus", focus);
  window.addEventListener("blur", focus);
  document.addEventListener("visibilitychange", focus);
  window.addEventListener("pagehide", hide);
  window.addEventListener("pageshow", focus);
  document.addEventListener("click", click);
  document.addEventListener("submit", submit);
  document.addEventListener("analytics:form-success", success);
  const timer = window.setInterval(() => {
    tick();
    void flush();
  }, 15000);
  activity();
  return {
    stop() {
      stopped = true;
      clearInterval(timer);
      observer.disconnect();
      window.removeEventListener("scroll", activity);
      window.removeEventListener("pointerdown", activity);
      window.removeEventListener("keydown", activity);
      window.removeEventListener("focus", focus);
      window.removeEventListener("blur", focus);
      document.removeEventListener("visibilitychange", focus);
      window.removeEventListener("pagehide", hide);
      window.removeEventListener("pageshow", focus);
      document.removeEventListener("click", click);
      document.removeEventListener("submit", submit);
      document.removeEventListener("analytics:form-success", success);
    },
    async forget() {
      const response = await request("forget", { token });
      if (!response.ok) throw new Error("Não foi possível excluir agora. Tente novamente.");
    },
  };
}
