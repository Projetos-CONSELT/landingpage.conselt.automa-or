import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { labels, sections } from "@/analytics/model";
import "@/analytics/dashboard.css";

export const Route = createFileRoute("/admin/analytics")({
  head: () => ({
    meta: [{ title: "CONSELT · Analytics" }, { name: "robots", content: "noindex, nofollow" }],
  }),
  component: Dashboard,
});
type Report = {
  overview: {
    visitors: number;
    sessions: number;
    newVisitors: number;
    returningVisitors: number;
    activeSeconds: number;
    scroll: number;
    completion: number;
    abandonment: number;
    ended: number;
    pageViews: number;
    completedVisitors: number;
  };
  windows: { today: number; week: number; month: number };
  daily: { day: string; visitors: number; sessions: number; active_seconds: number }[];
  sections: { name: string; views: number; visitors: number; seconds: number }[];
  events: { kind: string; target: string; section: string; clicks: number; sessions: number }[];
  abandonment: { name: string | null; sessions: number }[];
  devices: { name: string; sessions: number; visitors: number }[];
  sources: { name: string; sessions: number }[];
  scroll: { depth: number; sessions: number; visitors: number }[];
  recent: {
    started_at: string;
    device: string;
    source: string;
    seconds: number;
    scroll: number;
    last_section: string | null;
    sections: number;
  }[];
  generatedAt: string;
};
const names: Record<string, string> = {
  desktop: "Computador",
  tablet: "Tablet",
  mobile: "Celular",
  direct: "Direto / não informado",
  internal: "Interno",
  search: "Busca",
  social: "Redes sociais",
  referral: "Outros sites",
  whatsapp: "WhatsApp",
  phone: "Telefone",
  email: "E-mail",
  external: "Link externo",
  button: "Botão",
  cta: "CTA / link interno",
  form_submit: "Tentativa de envio",
  form_success: "Formulário confirmado",
};
const time = (n: number) => `${Math.floor(n / 60)}min ${Math.round(n % 60)}s`;
function Bars({
  rows,
  suffix = "",
}: {
  rows: { label: string; value: number }[];
  suffix?: string;
}) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  return (
    <div className="analytics-bars">
      {rows.map((r) => (
        <div key={r.label}>
          <div>
            <span>{r.label}</span>
            <strong>
              {r.value}
              {suffix}
            </strong>
          </div>
          <div className="analytics-track">
            <span style={{ width: `${(r.value / max) * 100}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}
function Dashboard() {
  const [report, setReport] = useState<Report | null>(null),
    [days, setDays] = useState(30),
    [error, setError] = useState(""),
    [login, setLogin] = useState(false),
    [loading, setLoading] = useState(true),
    [configured, setConfigured] = useState(true);
  async function load(period = days) {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/analytics/report?days=${period}`);
      if (response.status === 401) {
        setLogin(true);
        setReport(null);
        return;
      }
      if (response.status === 503) {
        const status = (await fetch("/api/analytics/status").then((r) => r.json())) as {
          enabled: boolean;
        };
        if (!status.enabled) {
          setConfigured(false);
          return;
        }
      }
      if (!response.ok) throw new Error("Não foi possível consultar o banco. Tente novamente.");
      setReport((await response.json()) as Report);
      setLogin(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Falha de conexão.");
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    void load(days);
  }, [days]); // Fetch only when the selected period changes.
  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const form = event.currentTarget,
      data = new FormData(form);
    try {
      const response = await fetch("/api/analytics/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: data.get("email"), password: data.get("password") }),
      });
      form.reset();
      if (!response.ok) {
        const result = (await response.json()) as { error: string };
        throw new Error(result.error);
      }
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Falha de conexão.");
    } finally {
      setLoading(false);
    }
  }
  async function logout() {
    const response = await fetch("/api/analytics/logout", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: "{}",
    });
    if (response.ok) {
      setReport(null);
      setLogin(true);
    } else setError("Não foi possível encerrar a sessão. Tente novamente.");
  }
  return (
    <main className="analytics-admin">
      <header className="analytics-top">
        <div>
          <span className="analytics-eyebrow">CONSELT · INTELIGÊNCIA DIGITAL</span>
          <h1>Analytics</h1>
          <p>Entenda a jornada, respeitando a privacidade.</p>
        </div>
        <a href="https://landingpageautore.conselt.com.br/">Ver landing page ↗</a>
      </header>
      {error && (
        <p className="analytics-alert" role="alert">
          {error} <button onClick={() => void load()}>Tentar novamente</button>
        </p>
      )}
      {!configured ? (
        <section className="analytics-panel">
          <h2>Pronto para configurar</h2>
          <p>
            O banco e o acesso administrativo ainda não estão conectados. Nenhuma visita está sendo
            registrada.
          </p>
          <p>
            Siga o arquivo ANALYTICS.md do projeto para criar o banco, autorizar sua conta e ativar
            a coleta.
          </p>
        </section>
      ) : login ? (
        <form className="analytics-panel analytics-login" onSubmit={(event) => void signIn(event)}>
          <h2>Acesso administrativo</h2>
          <p>Use sua conta autorizada no Supabase.</p>
          <label>
            E-mail
            <input required type="email" name="email" autoComplete="username" maxLength={254} />
          </label>
          <label>
            Senha
            <input
              required
              type="password"
              name="password"
              autoComplete="current-password"
              maxLength={256}
            />
          </label>
          <button disabled={loading} type="submit">
            {loading ? "Entrando…" : "Entrar"}
          </button>
        </form>
      ) : null}
      {loading && <p role="status">Consultando dados…</p>}
      {report && (
        <>
          <div className="analytics-toolbar">
            <label>
              Período{" "}
              <select value={days} onChange={(e) => setDays(Number(e.target.value))}>
                <option value={1}>Hoje</option>
                <option value={7}>Últimos 7 dias</option>
                <option value={30}>Últimos 30 dias</option>
              </select>
            </label>
            <button disabled={loading} onClick={() => void load()}>
              Atualizar
            </button>
            <button onClick={() => void logout()}>Sair</button>
          </div>
          <p className="analytics-note">
            Horários de Brasília · Atualizado em{" "}
            {new Date(report.generatedAt).toLocaleString("pt-BR", {
              timeZone: "America/Sao_Paulo",
            })}
          </p>
          {!report.overview.sessions && (
            <section className="analytics-panel">
              <h2>Aguardando as primeiras visitas consentidas</h2>
              <p>
                Abra a landing page, permita a análise, navegue por algumas seções e volte para
                atualizar este painel.
              </p>
            </section>
          )}
          <div className="analytics-kpis">
            {[
              ["Visitantes hoje", report.windows.today],
              ["Visitantes · 7 dias", report.windows.week],
              ["Visitantes · 30 dias", report.windows.month],
              ["Sessões no período", report.overview.sessions],
              ["Tempo ativo médio", time(report.overview.activeSeconds)],
              ["Conclusão das 7 seções", `${report.overview.completion}%`],
              ["Abandono estimado", `${report.overview.abandonment}%`],
              ["Scroll máximo médio", `${report.overview.scroll}%`],
            ].map(([label, value]) => (
              <article className="analytics-kpi" key={label}>
                <span>{label}</span>
                <strong>{value}</strong>
              </article>
            ))}
          </div>
          <p className="analytics-note">
            {report.overview.completedVisitors} visitantes chegaram às 7 seções ·{" "}
            {report.overview.pageViews} visualizações de página · {report.overview.visitors}{" "}
            navegadores únicos · {report.overview.newVisitors} novos ·{" "}
            {report.overview.returningVisitors} recorrentes · {report.overview.ended} sessões
            encerradas por 30 minutos de inatividade. Um navegador pode constar como novo e
            recorrente no mesmo período.
          </p>
          <div className="analytics-grid">
            <section className="analytics-panel">
              <h2>Visitas ao longo dos dias</h2>
              <p>Visitantes / sessões · dias sem visitas são omitidos.</p>
              <Bars
                rows={report.daily.flatMap((d) => [
                  {
                    label: `${d.day.slice(8)}/${d.day.slice(5, 7)} · visitantes`,
                    value: d.visitors,
                  },
                  { label: `${d.day.slice(8)}/${d.day.slice(5, 7)} · sessões`, value: d.sessions },
                ])}
              />
            </section>
            <section className="analytics-panel">
              <h2>Tempo ativo por dia</h2>
              <Bars
                suffix="s"
                rows={report.daily.map((d) => ({ label: d.day, value: d.active_seconds }))}
              />
            </section>
            <section className="analytics-panel">
              <h2>Funil de alcance</h2>
              <p>Sessões que visualizaram cada seção; a navegação pode pular etapas.</p>
              <Bars
                rows={sections.map((id) => ({
                  label: `${labels[id] || id} · ${report.sections.find((s) => s.name === id)?.visitors || 0} visitantes`,
                  value: report.sections.find((s) => s.name === id)?.views || 0,
                }))}
              />
            </section>
            <section className="analytics-panel">
              <h2>Tempo ativo por seção</h2>
              <Bars
                suffix="s"
                rows={sections.map((id) => ({
                  label: labels[id] || id,
                  value: report.sections.find((s) => s.name === id)?.seconds || 0,
                }))}
              />
              <p className="analytics-note">
                Apenas a seção predominante recebe tempo, evitando contagem duplicada.
              </p>
            </section>
            <section className="analytics-panel">
              <h2>Visitantes por dispositivo</h2>
              <Bars
                rows={report.devices.map((d) => ({
                  label: `${names[d.name] || d.name} · ${d.sessions} sessões`,
                  value: d.visitors,
                }))}
              />
            </section>
            <section className="analytics-panel">
              <h2>Origem das sessões</h2>
              <Bars
                rows={report.sources.map((d) => ({
                  label: names[d.name] || d.name,
                  value: d.sessions,
                }))}
              />
            </section>
            <section className="analytics-panel">
              <h2>Profundidade de scroll</h2>
              <Bars
                rows={report.scroll.map((d) => ({
                  label: `${d.depth}% da página · ${d.sessions} sessões`,
                  value: d.visitors,
                }))}
              />
            </section>
            <section className="analytics-panel">
              <h2>Última seção antes do abandono</h2>
              <Bars
                rows={report.abandonment.map((d) => ({
                  label: d.name ? labels[d.name] || d.name : "Sem seção registrada",
                  value: d.sessions,
                }))}
              />
            </section>
          </div>
          <section className="analytics-panel">
            <h2>Eventos e conversões</h2>
            <p>
              Cliques são intenções, não vendas confirmadas. Envios e confirmações de formulário são
              contados separadamente.
            </p>
            <div className="analytics-table">
              <table>
                <thead>
                  <tr>
                    <th>Ação</th>
                    <th>Identificador</th>
                    <th>Seção</th>
                    <th>Eventos</th>
                    <th>Sessões</th>
                  </tr>
                </thead>
                <tbody>
                  {report.events.map((e) => (
                    <tr key={`${e.target}-${e.kind}-${e.section}`}>
                      <td>{names[e.kind] || e.kind}</td>
                      <td>{e.target}</td>
                      <td>{labels[e.section]}</td>
                      <td>{e.clicks}</td>
                      <td>{e.sessions}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!report.events.length && <p>Nenhum evento no período.</p>}
            </div>
          </section>
          <section className="analytics-panel">
            <h2>Últimas 30 sessões</h2>
            <div className="analytics-table">
              <table>
                <thead>
                  <tr>
                    <th>Início · Brasília</th>
                    <th>Dispositivo</th>
                    <th>Origem</th>
                    <th>Tempo ativo</th>
                    <th>Seções</th>
                    <th>Scroll</th>
                  </tr>
                </thead>
                <tbody>
                  {report.recent.map((r, i) => (
                    <tr key={i}>
                      <td>
                        {new Date(r.started_at).toLocaleString("pt-BR", {
                          timeZone: "America/Sao_Paulo",
                        })}
                      </td>
                      <td>{names[r.device]}</td>
                      <td>{names[r.source]}</td>
                      <td>{time(r.seconds)}</td>
                      <td>{r.sections}</td>
                      <td>{r.scroll}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
          <p className="analytics-note">
            Somente visitas com consentimento. Bloqueadores, conexão interrompida e fechamento
            abrupto podem causar subcontagem. Identificadores não representam pessoas identificadas.
            Retenção: 90 dias.
          </p>
        </>
      )}
    </main>
  );
}
