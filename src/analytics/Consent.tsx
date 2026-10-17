import { useEffect, useRef, useState } from "react";
import "./consent.css";
import { analyticsEndpoint } from "./endpoint";

const preferenceKey = "conselt-analytics-consent-v1";
type Tracker = Awaited<ReturnType<typeof import("./tracker").startTracker>>;
export function AnalyticsConsent() {
  const [enabled, setEnabled] = useState(false),
    [choice, setChoice] = useState<string | null>(null),
    [open, setOpen] = useState(false),
    [message, setMessage] = useState("");
  const tracker = useRef<Tracker | null>(null);
  useEffect(() => {
    let alive = true;
    void fetch(analyticsEndpoint("status"), { credentials: "omit" })
      .then((r) => r.json())
      .then((data: { enabled: boolean }) => {
        if (!alive || !data.enabled) return;
        setEnabled(true);
        let saved: { value: string; expires: number } | null = null;
        try {
          saved = JSON.parse(localStorage.getItem(preferenceKey) || "null");
        } catch {
          /* Ask again. */
        }
        const value = saved && saved.expires > Date.now() ? saved.value : null;
        setChoice(value);
        setOpen(!value);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);
  useEffect(() => {
    function sync(event: StorageEvent) {
      if (event.key !== preferenceKey) return;
      try {
        const saved = JSON.parse(event.newValue || "null") as {
          value: string;
          expires: number;
        } | null;
        const value = saved && saved.expires > Date.now() ? saved.value : null;
        if (value !== "accepted") tracker.current?.stop();
        setChoice(value);
        setOpen(!value);
      } catch {
        tracker.current?.stop();
        setChoice(null);
        setOpen(true);
      }
    }
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);
  useEffect(() => {
    if (!enabled || choice !== "accepted") return;
    let alive = true;
    const controller = new AbortController();
    void import("./tracker")
      .then((m) => (alive ? m.startTracker(controller.signal) : null))
      .then((instance) => {
        if (!instance) return;
        if (alive) tracker.current = instance;
        else instance.stop();
      })
      .catch(() => {});
    return () => {
      alive = false;
      controller.abort();
      tracker.current?.stop();
      tracker.current = null;
    };
  }, [enabled, choice]);
  function choose(value: string) {
    if (value !== "accepted") tracker.current?.stop();
    try {
      localStorage.setItem(
        preferenceKey,
        JSON.stringify({ value, expires: Date.now() + 180 * 86400000 }),
      );
    } catch {
      /* Only this page visit. */
    }
    if (value !== "accepted") {
      try {
        localStorage.removeItem("conselt-analytics-visitor-v1");
        sessionStorage.removeItem("conselt-analytics-session-v1");
      } catch {
        /* Storage unavailable. */
      }
    }
    setChoice(value);
    setOpen(false);
    setMessage("");
  }
  async function forget() {
    if (!tracker.current) {
      setMessage(
        "Não foi possível localizar uma sessão ativa. Tente recarregar esta página ou entre em contato com a CONSELT. Sem o identificador local, não conseguimos localizar visitas anteriores.",
      );
      return;
    }
    tracker.current.stop();
    try {
      await tracker.current.forget();
      choose("rejected");
    } catch {
      setMessage(
        "Coleta interrompida. A exclusão não foi confirmada; tente novamente ou recuse a coleta.",
      );
    }
  }
  if (!enabled) return null;
  return (
    <aside
      className="analytics-consent"
      data-analytics-ignore="true"
      aria-label="Preferências de privacidade"
    >
      {!open ? (
        <button className="analytics-preferences" onClick={() => setOpen(true)}>
          Privacidade
        </button>
      ) : (
        <div className="analytics-consent-panel" role="region" aria-labelledby="privacy-title">
          <h2 id="privacy-title">Sua privacidade</h2>
          <p>
            Com sua permissão, a CONSELT mede visitas, tempo ativo, seções e cliques para melhorar
            este site. Usamos identificadores aleatórios neste navegador, sem coletar nome,
            telefone, e-mail ou conteúdo de formulários.
          </p>
          <details>
            <summary>Como usamos os dados</summary>
            <p>
              Dados de navegação ficam no Supabase por até 90 dias. A preferência vale por 180 dias.
              Você pode recusar sem perder funcionalidades e voltar aqui para revogar sua escolha.
              As medidas são aproximadas e os identificadores são pseudônimos. A infraestrutura
              processa a conexão de rede; o analytics não guarda o IP original. Entre em contato
              pelos canais da CONSELT para exercer seus direitos.
            </p>
          </details>
          <div className="analytics-consent-actions">
            <button onClick={() => choose("rejected")}>Recusar análise</button>
            <button onClick={() => choose("accepted")}>Permitir análise</button>
            {choice && <button onClick={() => setOpen(false)}>Fechar</button>}
          </div>
          {choice === "accepted" && (
            <button className="analytics-delete" onClick={() => void forget()}>
              Excluir meus dados de análise e recusar
            </button>
          )}
          {message && <p role="status">{message}</p>}
        </div>
      )}
    </aside>
  );
}
