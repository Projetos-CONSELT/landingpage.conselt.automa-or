import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";

import { ConseltLogo } from "@/components/conselt-logo";
import heroCameraPhone from "@/assets/hero-camera-phone.jpg";
import ctaCamera from "@/assets/cta-camera.jpg";
import livingLighting from "@/assets/living-lighting.jpg";
import modularImg from "@/assets/modular.png.asset.json";
import sensorImg from "@/assets/sensor.png.asset.json";
import ufuImg from "@/assets/ufu-engenharia.png.asset.json";
import luminoImg from "@/assets/luminotecnica.png.asset.json";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CONSELT | Automação Residencial e Comercial" },
      {
        name: "description",
        content:
          "Automação residencial e comercial sem quebrar paredes: sistema modular, sensor de presença real e projetos luminotécnicos. 32 anos de experiência e engenharia UFU.",
      },
      {
        property: "og:title",
        content: "CONSELT | Sua casa ou escritório, inteligentes em cada detalhe",
      },
      {
        property: "og:description",
        content:
          "Automação residencial e comercial com instalação sem reformas pesadas e preço exclusivo no mercado. Fale com a gente pelo WhatsApp.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const WHATSAPP_NUMBER = "5534997346250";

function waLink(message: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

const WA_DEFAULT_MESSAGE =
  "Olá! Vim pelo site da CONSELT e quero saber mais sobre automação residencial.";

/* ------------------------------------------------------------------ */
/*  Icons (inline, no dependencies)                                    */
/* ------------------------------------------------------------------ */

function IconWhatsApp({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.9-4.45 9.9-9.91A9.85 9.85 0 0 0 12.04 2Zm5.8 14.02c-.24.68-1.4 1.3-1.93 1.35-.53.05-1.03.24-3.48-.73-2.96-1.17-4.82-4.24-4.97-4.44-.14-.2-1.17-1.56-1.17-2.98 0-1.41.74-2.11 1-2.4.27-.29.58-.36.78-.36h.56c.18 0 .42-.07.65.5.24.58.82 2 .89 2.14.07.15.12.32.02.51-.1.2-.15.32-.29.5-.15.17-.31.38-.44.51-.15.14-.3.3-.13.59.17.29.75 1.24 1.61 2.01 1.11.99 2.04 1.3 2.33 1.44.29.15.46.12.63-.07.17-.2.73-.85.92-1.14.2-.29.39-.24.66-.15.27.1 1.7.8 1.99.95.29.14.48.22.55.34.07.12.07.7-.17 1.38Z" />
    </svg>
  );
}


function IconModules({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
      <path d="M17.5 5.5v2M6.5 16.5v2" />
    </svg>
  );
}

function IconPresence({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20c.8-3.2 3.6-5 7-5s6.2 1.8 7 5" />
      <path d="M12 1.5v1.8M4.2 4.2l1.3 1.3M19.8 4.2l-1.3 1.3" />
    </svg>
  );
}

function IconLight({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M9 18h6M10 21h4" />
      <path d="M12 3a6 6 0 0 0-3.5 10.9c.8.6 1.5 1.6 1.5 2.6h4c0-1 .7-2 1.5-2.6A6 6 0 0 0 12 3Z" />
      <path d="M12 0.8v0M2 12h1M21 12h1M4.9 4.9l.7.7M18.4 4.9l-.7.7" />
    </svg>
  );
}

function IconShield({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M12 22s8-3.5 8-10V5l-8-3-8 3v7c0 6.5 8 10 8 10Z" />
      <path d="m9 11.5 2 2 4-4.5" />
    </svg>
  );
}

function IconNoWall({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <rect x="3" y="4" width="18" height="16" rx="1.5" />
      <path d="M3 9.3h18M3 14.6h18M9 4v16M15 9.3v5.3" />
      <path d="M2 2l20 20" />
    </svg>
  );
}

function IconTag({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M20.6 13.4 12 22 2 12V2h10l8.6 8.6a2 2 0 0 1 0 2.8Z" />
      <circle cx="7.5" cy="7.5" r="1.5" />
    </svg>
  );
}

function IconStar({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="m12 2 3 6.6 7 .8-5.2 4.8L18.3 21 12 17.4 5.7 21l1.5-6.8L2 9.4l7-.8L12 2Z" />
    </svg>
  );
}

function IconAward({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <circle cx="12" cy="9" r="6" />
      <path d="m8.5 14-2 8 5.5-3 5.5 3-2-8" />
    </svg>
  );
}

function IconEngineering({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M14 6.5a3.5 3.5 0 0 1 4.9-3.2L16 6.2l1.8 1.8 2.9-2.9A3.5 3.5 0 0 1 17 9.5c-.6 0-1.2-.15-1.7-.42L7 17.4a2 2 0 1 1-2.8-2.8l8.3-8.3A3.5 3.5 0 0 1 14 6.5Z" />
      <path d="m4 20 .01.01" />
    </svg>
  );
}

function IconChevron({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Shared section header                                              */
/* ------------------------------------------------------------------ */

function SectionHeading({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <span className="inline-block rounded-full border border-navy-950 bg-navy-950 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-blue-200">
        {eyebrow}
      </span>
      <h2 className="mt-5 font-display text-3xl font-bold leading-tight text-foreground sm:text-4xl">
        {title}
      </h2>
      {subtitle ? (
        <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">{subtitle}</p>
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

function Index() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      question: "Para que serve a automação residencial?",
      answer:
        "Centraliza luzes, climatização, cortinas e segurança. Você controla tudo pelo celular, por voz ou automaticamente.",
    },
    {
      question: "O sistema é dependente de conexão com a internet?",
      answer:
        "Não. Os comandos essenciais funcionam sem internet. A conexão é usada apenas para acesso remoto e algumas integrações.",
    },
    {
      question: "O serviço tem garantia?",
      answer:
        "Sim. A instalação e os equipamentos contam com garantia formal.",
    },
    {
      question: "Tem suporte técnico?",
      answer:
        "Sim. O atendimento é feito diretamente pela nossa equipe de engenharia.",
    },
    {
      question: "Realmente não precisa quebrar parede para instalar?",
      answer:
        "Não. A tecnologia se integra à instalação existente, sem obra pesada, poeira ou retrabalho.",
    },
  ];

  const diferencialItems = [
    {
      icon: IconModules,
      image: modularImg.url,
      title: "Sistema modular",
      description:
        "Comece pelo essencial e amplie ambiente por ambiente, sem retrabalho.",
    },
    {
      icon: IconPresence,
      image: sensorImg.url,
      title: "Sensor de presença real",
      description:
        "Detecta pessoas, não apenas movimento, e aciona luz e clima com precisão.",
    },
    {
      icon: IconLight,
      image: luminoImg.url,
      title: "Engenharia luminotécnica",
      description:
        "Luz planejada para conforto, valorização do ambiente e eficiência.",
    },
  ];

  const beneficioItems = [
    {
      icon: IconShield,
      title: "Profissionalismo e segurança",
      description:
        "Instalação segura, com normas técnicas respeitadas.",
    },
    {
      icon: IconStar,
      title: "Experiência ímpar aos clientes",
      description:
        "Ambientes confortáveis que valorizam cada atendimento.",
    },
    {
      icon: IconNoWall,
      title: "Sem reformas pesadas",
      description:
        "Tecnologia integrada à estrutura existente, sem quebrar paredes.",
    },
    {
      icon: IconEngineering,
      title: "Equipe especializada",
      description:
        "Especialistas em automação e projetos luminotécnicos.",
    },
    {
      icon: IconTag,
      title: "Preço exclusivo no mercado",
      description:
        "Qualidade de engenharia com condições acessíveis e sem intermediários.",
    },
  ];

  return (
    <div className="min-h-screen font-sans text-foreground">
      {/* ============ CABEÇALHO ============ */}
      <header className="fixed inset-x-0 top-0 z-50 border-b border-border/60 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <a href="#" className="flex items-center gap-3">
            <ConseltLogo className="h-9 w-auto" />
            <span className="font-display text-lg font-bold tracking-[0.18em] text-foreground">
              CONSELT
            </span>
          </a>
          <a
            href={waLink(WA_DEFAULT_MESSAGE)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-navy-950 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-navy-800 sm:px-5"
          >
            <IconWhatsApp className="h-4 w-4" />
            Fale conosco
          </a>
        </div>
      </header>

      {/* ============ BLOCO 1 · HERO ============ */}
      <section className="relative overflow-hidden bg-navy-950 pt-16">
        <img src={heroCameraPhone} alt="" aria-hidden="true" width={1920} height={1088} className="absolute inset-0 h-full w-full object-cover object-center opacity-80" />
        <div className="absolute inset-0 bg-navy-950/35" />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-950/90 via-transparent to-navy-950/50" />
        <div className="relative mx-auto max-w-6xl px-4 pb-16 pt-14 sm:px-6 sm:pb-24 sm:pt-20">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="font-display text-4xl font-bold leading-[1.1] tracking-tight text-primary-foreground sm:text-6xl">
              Automação residencial
              <br />
              <span className="text-blue-400">&amp; comercial</span>
            </h1>
            <p className="mx-auto mt-6 max-w-xl font-display text-xl font-semibold leading-snug text-blue-200 sm:text-2xl">
              Sua casa ou escritório. Inteligentes em cada detalhe.
            </p>
            <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-blue-200/80 sm:text-lg">
              Iluminação, clima e segurança no seu controle — <strong className="font-semibold text-primary-foreground">sem quebrar paredes.</strong>
            </p>
            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <a
                href={waLink(WA_DEFAULT_MESSAGE)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-8 py-3.5 text-base font-bold text-primary-foreground transition-all hover:bg-primary/90 hover:glow-accent sm:w-auto"
              >
                <IconWhatsApp className="h-5 w-5" />
                Quero automatizar meu espaço
              </a>
              <a
                href="#sobre"
                className="inline-flex w-full items-center justify-center rounded-full border border-blue-400/50 bg-transparent px-8 py-3.5 text-base font-semibold text-blue-200 transition-colors hover:border-blue-400 hover:text-primary-foreground sm:w-auto"
              >
                Conhecer a automação
              </a>
            </div>
          </div>

        </div>
      </section>

      {/* ============ BLOCO 2 · DIFERENCIAIS ============ */}
      <section className="relative py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <SectionHeading
            eyebrow="Nossos diferenciais"
            title="Tecnologia que faz diferença de verdade"
            subtitle="Engenharia e inteligência para um sistema que cresce com você."
          />
          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {diferencialItems.map((item) => (
              <div
                key={item.title}
                className="card-sheen group relative min-h-72 overflow-hidden rounded-2xl border border-border bg-card p-7 backdrop-blur-sm transition-all hover:-translate-y-1 hover:border-primary/40 hover:glow-accent"
              >
                <img src={item.image} alt="" aria-hidden="true" loading="lazy" className="pointer-events-none absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/0 via-white/35 to-white/75" />
                <div className="relative">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-navy-950 text-white transition-colors group-hover:bg-navy-800">
                  <item.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-5 font-display text-xl font-semibold text-foreground">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ BLOCO 3 · O QUE É AUTOMAÇÃO ============ */}
      <section id="sobre" className="relative scroll-mt-20 py-20 sm:py-28">
        <img src={livingLighting} alt="" aria-hidden="true" loading="lazy" width={1600} height={1200} className="absolute inset-0 h-full w-full object-cover" />
        <div className="pointer-events-none absolute inset-0 bg-background/60" />
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mx-auto max-w-4xl">
            <div className="text-center">
              <SectionHeading
                eyebrow="O que é automação residencial?"
                title="Sua casa e seu escritório trabalhando por você"
                subtitle=""
              />
              <div className="mx-auto mt-6 max-w-3xl text-base leading-relaxed text-muted-foreground">
                <p>
                  Conecte <strong className="font-semibold text-foreground">luzes, climatização, cortinas e segurança</strong> em um só sistema. Controle pelo celular, por voz ou deixe sua rotina acontecer automaticamente.
                </p>
              </div>
              <div className="mt-8 flex flex-wrap justify-center gap-2.5">
                {[
                  "Iluminação inteligente",
                  "Clima e ar-condicionado",
                  "Cortinas e persianas",
                  "Segurança e acesso",
                  "Cenas de iluminação",
                  "Economia de energia",
                ].map((chip) => (
                  <span
                    key={chip}
                    className="rounded-full border border-navy-950 bg-navy-950 px-4 py-1.5 text-sm font-medium text-white"
                  >
                    {chip}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ BLOCO 4 · BENEFÍCIOS ============ */}
      <section className="relative py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <SectionHeading
            eyebrow="Por que a CONSELT"
            title="Benefícios de contratar a CONSELT"
            subtitle="Segurança e eficiência em cada etapa."
          />
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {beneficioItems.map((item, index) => (
              <div
                key={item.title}
                className={
                  index === 0
                    ? "card-sheen rounded-2xl border border-primary/40 bg-card p-7 backdrop-blur-sm transition-all hover:-translate-y-1 hover:glow-accent sm:col-span-2 lg:col-span-1"
                    : "card-sheen rounded-2xl border border-border bg-card p-7 backdrop-blur-sm transition-all hover:-translate-y-1 hover:border-primary/40 hover:glow-accent"
                }
              >
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-navy-950 text-white">
                  <item.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-5 font-display text-lg font-semibold text-foreground">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ BLOCO 5 · PROVAS DE CONFIANÇA ============ */}
      <section className="relative overflow-hidden py-20 sm:py-28">
        <img src={ufuImg.url} alt="" aria-hidden="true" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
        <div className="pointer-events-none absolute inset-0 bg-background/35" />
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
          <SectionHeading
            eyebrow="Provas de confiança"
            title="Tradição e excelência em engenharia"
            subtitle="Experiência consolidada com o rigor técnico da engenharia UFU."
          />
          <div className="mt-14 grid gap-6 md:grid-cols-3">
            <div className="card-sheen rounded-2xl border border-navy-950 bg-navy-950 p-8 text-center text-white">
              <span className="font-display text-5xl font-bold text-blue-400">32</span>
              <span className="font-display text-2xl font-bold text-blue-200"> anos</span>
              <p className="mt-3 text-sm leading-relaxed text-blue-200/80">
                de experiência em soluções de engenharia elétrica.
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-8 text-center backdrop-blur-sm">
              <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 text-primary">
                <IconAward className="h-6 w-6" />
              </div>
              <h3 className="mt-4 font-display text-lg font-semibold text-foreground">
                Engenharia UFU
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Qualidade e excelência da Universidade Federal de Uberlândia.
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-8 text-center backdrop-blur-sm">
              <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 text-primary">
                <IconShield className="h-6 w-6" />
              </div>
              <h3 className="mt-4 font-display text-lg font-semibold text-foreground">
                Qualidade garantida
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Normas técnicas, garantia formal e suporte da própria equipe.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============ BLOCO 6 · FAQ ============ */}
      <section className="relative py-20 sm:py-28">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <SectionHeading
            eyebrow="Perguntas frequentes"
            title="Tire suas dúvidas antes de falar com a gente"
          />
          <div className="mt-12 space-y-3">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={faq.question}
                  className={
                    isOpen
                      ? "rounded-xl border border-primary/40 bg-card backdrop-blur-sm transition-colors"
                      : "rounded-xl border border-border bg-card backdrop-blur-sm transition-colors hover:border-primary/30"
                  }
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    aria-expanded={isOpen}
                    className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                  >
                    <span className="font-display text-base font-semibold text-foreground">
                      {faq.question}
                    </span>
                    <IconChevron
                      className={
                        isOpen
                          ? "h-5 w-5 shrink-0 text-primary transition-transform duration-300 rotate-180"
                          : "h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-300"
                      }
                    />
                  </button>
                  <div
                    className={
                      isOpen
                        ? "grid grid-rows-[1fr] transition-all duration-300 ease-out"
                        : "grid grid-rows-[0fr] transition-all duration-300 ease-out"
                    }
                  >
                    <div className="overflow-hidden">
                      <p className="px-6 pb-5 text-sm leading-relaxed text-muted-foreground">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============ BLOCO 7 · CHAMADA FINAL (WHATSAPP) ============ */}
      <section className="relative overflow-hidden bg-navy-950 py-20 sm:py-28">
        <img src={ctaCamera} alt="" aria-hidden="true" loading="lazy" width={1920} height={1088} className="absolute inset-0 h-full w-full object-cover opacity-75" />
        <div className="absolute inset-0 bg-navy-950/45" />
        <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6">
          <ConseltLogo className="animate-float-soft mx-auto h-20 w-auto" />
          <h2 className="mt-8 font-display text-3xl font-bold leading-tight text-white sm:text-5xl">
            Pronto para viver o <span className="text-blue-400">futuro</span> hoje?
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-blue-200/80 sm:text-lg">
            Receba uma proposta personalizada para sua casa ou escritório.
          </p>
          <div className="mt-10">
            <a
              href={waLink(WA_DEFAULT_MESSAGE)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-3 rounded-full bg-whatsapp px-10 py-4 text-lg font-bold text-navy-950 transition-all hover:bg-whatsapp-hover hover:glow-accent"
            >
              <IconWhatsApp className="h-6 w-6" />
              Chamar no WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* ============ RODAPÉ ============ */}
      <footer className="border-t border-border/60 bg-white/60 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-5 px-4 text-center sm:px-6">
          <div className="flex items-center gap-3">
            <ConseltLogo className="h-8 w-auto" />
            <span className="font-display text-base font-bold tracking-[0.18em] text-foreground">
              CONSELT
            </span>
          </div>
          <p className="max-w-md text-xs leading-relaxed text-muted-foreground">
            CONSELT — Empresa Júnior de Engenharia Elétrica · Universidade Federal de Uberlândia
          </p>
          <div className="flex items-center gap-5">
            <a
              href={waLink("Olá! Vim pelo site da CONSELT e quero saber mais sobre automação residencial.")}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs text-muted-foreground transition-colors hover:text-whatsapp"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.297-.497.1-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
              </svg>
              WhatsApp
            </a>
            <a
              href="https://instagram.com/conselt.time"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs text-muted-foreground transition-colors hover:text-blue-400"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
                <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
              </svg>
              @conselt.time
            </a>
          </div>
          <p className="text-xs text-muted-foreground/70">
            © {new Date().getFullYear()} CONSELT. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
