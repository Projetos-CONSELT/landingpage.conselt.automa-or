import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";

import { ConseltLogo } from "@/components/conselt-logo";
import { BenefitCard } from "@/components/benefit-card";
import { PageBackground } from "@/components/page-background";
import modularImg from "@/assets/modular-system.jpg";
import sensorImg from "@/assets/presence-sensor.jpg";
import luminoImg from "@/assets/lighting-design.jpg";

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
  dark = false,
  centered = false,
  shadow = false,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  dark?: boolean;
  centered?: boolean;
  shadow?: boolean;
}) {
  return (
    <div className={centered ? "mx-auto max-w-3xl text-center" : "max-w-2xl"}>
      <span
        className={
          (centered
            ? (dark
                ? "inline-flex items-center border-b-2 border-blue-400 pb-1 text-xs font-bold uppercase tracking-wider text-white"
                : "inline-flex items-center border-b-2 border-blue-500 pb-1 text-xs font-bold uppercase tracking-wider text-blue-500")
            : (dark
                ? "inline-flex items-center border-l-2 border-blue-400 pl-3 text-xs font-bold uppercase text-white"
                : "inline-flex items-center border-l-2 border-blue-500 pl-3 text-xs font-bold uppercase text-blue-500")) +
          (dark ? " [text-shadow:_0_1px_4px_rgba(0,0,0,0.85)]" : "")
        }
      >
        {eyebrow}
      </span>
      <h2
        className={
          "mt-5 font-display text-3xl font-extrabold leading-tight sm:text-4xl " +
          (dark
            ? "text-white [text-shadow:_0_2px_8px_rgba(0,0,0,0.85),_0_1px_3px_rgba(0,0,0,0.9)]"
            : "text-foreground" + (shadow ? " [text-shadow:_0_1px_3px_rgba(0,0,0,0.4),_0_2px_6px_rgba(0,0,0,0.2)]" : ""))
        }
      >
        {title}
      </h2>
      {subtitle ? (
        <p
          className={
            "mt-4 text-base leading-relaxed sm:text-lg " +
            (dark
              ? "text-blue-100 [text-shadow:_0_1px_4px_rgba(0,0,0,0.8)]"
              : "text-muted-foreground" + (shadow ? " [text-shadow:_0_1px_3px_rgba(0,0,0,0.35)]" : ""))
          }
        >
          {subtitle}
        </p>
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
      image: modularImg,
      title: "Sistema modular",
      description:
        "Comece pelo essencial e amplie ambiente por ambiente, sem retrabalho.",
    },
    {
      icon: IconPresence,
      image: sensorImg,
      title: "Sensor de presença real",
      description:
        "Detecta pessoas, não apenas movimento, e aciona luz e clima com precisão.",
    },
    {
      icon: IconLight,
      image: luminoImg,
      title: "Engenharia luminotécnica",
      description:
        "Luz planejada para conforto, valorização do ambiente e eficiência.",
    },
  ];

  const beneficioItems = [
    {
      num: "01",
      badge: "Segurança Técnica",
      icon: IconShield,
      title: "Profissionalismo e segurança",
      description:
        "Instalação segura, com normas técnicas respeitadas e garantia formal de engenharia.",
    },
    {
      num: "02",
      badge: "Zero Quebra-Quebra",
      icon: IconNoWall,
      title: "Sem reformas pesadas",
      description:
        "Tecnologia integrada à estrutura existente, sem quebrar paredes, sem poeira ou obras.",
    },
    {
      num: "03",
      badge: "Conforto & Valor",
      icon: IconStar,
      title: "Experiência ímpar aos clientes",
      description:
        "Ambientes confortáveis e inteligentes que valorizam cada atendimento e transformam o espaço.",
    },
    {
      num: "04",
      badge: "Engenharia UFU",
      icon: IconEngineering,
      title: "Equipe especializada",
      description:
        "Especialistas formados pela UFU em automação residencial e projetos luminotécnicos.",
    },
    {
      num: "05",
      badge: "Direto da Engenharia",
      icon: IconTag,
      title: "Preço exclusivo no mercado",
      description:
        "Qualidade de engenharia com condições acessíveis, modularidade e sem intermediários.",
    },
  ];

  return (
    <div className="landing-page min-h-screen font-sans text-foreground">
      <PageBackground />
      {/* ============ CABEÇALHO ============ */}
      <header className="fixed inset-x-0 top-0 z-50 border-b border-border bg-background/95 backdrop-blur-md">
        <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-5 sm:px-8">
          <a href="#" className="flex items-center gap-3">
            <ConseltLogo className="h-9 w-auto" />
            <span className="font-display text-lg font-extrabold text-foreground">
              CONSELT
            </span>
          </a>
          <nav className="hidden items-center gap-8 text-sm font-semibold text-muted-foreground md:flex" aria-label="Navegação principal">
            <a href="#diferenciais" className="transition-colors hover:text-primary">Diferenciais</a>
            <a href="#sobre" className="transition-colors hover:text-primary">Automação</a>
            <a href="#confianca" className="transition-colors hover:text-primary">Experiência</a>
            <a href="#duvidas" className="transition-colors hover:text-primary">Dúvidas</a>
          </nav>
          <a
            href={waLink(WA_DEFAULT_MESSAGE)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-sm bg-navy-950 px-4 py-2.5 text-sm font-bold text-primary-foreground transition-colors hover:bg-navy-800 sm:px-5"
          >
            <IconWhatsApp className="h-4 w-4" />
            Fale conosco
          </a>
        </div>
      </header>

      {/* ============ BLOCO 1 · HERO ============ */}
      <section data-backdrop="hero" className="relative pt-18">
        <div className="relative mx-auto grid min-h-[690px] max-w-7xl items-center gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[1.02fr_.98fr] lg:py-24">
          <div className="animate-rise-in relative z-10 max-w-2xl">
            <span className="inline-flex items-center border-l-2 border-blue-400 pl-3 text-xs font-bold uppercase text-blue-200 [text-shadow:_0_1px_3px_rgba(0,0,0,0.8)]">Engenharia de precisão</span>
            <h1 className="mt-7 font-display text-4xl font-extrabold leading-[1.08] text-primary-foreground sm:text-6xl [text-shadow:_0_2px_8px_rgba(0,0,0,0.85),_0_1px_3px_rgba(0,0,0,0.9)]">
              Automação residencial e comercial
            </h1>
            <p className="mt-6 max-w-xl font-display text-xl font-bold leading-snug text-blue-200 sm:text-2xl [text-shadow:_0_2px_6px_rgba(0,0,0,0.85)]">
              Sua casa ou escritório. Inteligentes em cada detalhe.
            </p>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-blue-200/90 sm:text-lg [text-shadow:_0_1px_4px_rgba(0,0,0,0.8)]">
              Iluminação, clima e segurança no seu controle — <strong className="font-semibold text-primary-foreground">sem quebrar paredes.</strong>
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <a
                href={waLink(WA_DEFAULT_MESSAGE)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-8 py-3.5 text-base font-bold text-primary-foreground transition-all hover:-translate-y-0.5 hover:bg-blue-400 sm:w-auto"
              >
                <IconWhatsApp className="h-5 w-5" />
                Quero automatizar meu espaço
              </a>
              <a
                href="#sobre"
                className="inline-flex w-full items-center justify-center rounded-xl border border-blue-200/40 bg-transparent px-8 py-3.5 text-base font-semibold text-blue-200 transition-colors hover:border-blue-200 hover:text-primary-foreground sm:w-auto"
              >
                Conhecer a automação
              </a>
            </div>
          </div>
          <div className="relative z-10 flex justify-center lg:justify-center lg:mr-12">
            {/* Destaque 32 anos - Tipografia pura com Efeito de Zoom */}
            <div className="relative rounded-2xl p-6 sm:p-8 transition-all duration-500 ease-out hover:scale-105 hover:-translate-y-1 cursor-default select-none">
              <div className="flex flex-col items-center justify-center text-center">
                {/* Tradição comprovada */}
                <span className="text-xs font-bold uppercase tracking-widest text-blue-300 [text-shadow:_0_1px_3px_rgba(0,0,0,0.8)]">
                  Tradição comprovada
                </span>

                {/* 32 */}
                <span className="mt-3 font-display text-8xl font-extrabold leading-none tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white via-blue-100 to-blue-400 drop-shadow-[0_0_25px_rgba(66,165,211,0.4)] sm:text-9xl">
                  32
                </span>

                {/* anos */}
                <span className="mt-2 block font-display text-3xl font-extrabold leading-none text-white tracking-wide sm:text-4xl [text-shadow:_0_2px_8px_rgba(0,0,0,0.85)]">
                  anos
                </span>

                {/* de experiência */}
                <span className="mt-3 block text-xs font-semibold uppercase tracking-wider text-blue-200/90 sm:text-sm [text-shadow:_0_1px_4px_rgba(0,0,0,0.8)]">
                  de experiência
                </span>

                {/* em engenharia elétrica */}
                <span className="mt-1 block text-xs font-semibold uppercase tracking-wider text-blue-200/90 sm:text-sm [text-shadow:_0_1px_4px_rgba(0,0,0,0.8)]">
                  em engenharia elétrica
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Degradê sutil e progressivo unindo a Seção 1 com a Seção 2 */}
      </section>

      {/* ============ BLOCO 2 · DIFERENCIAIS ============ */}
      <section id="diferenciais" data-backdrop="features" className="relative scroll-mt-20 pb-40 pt-20 sm:pb-52 sm:pt-28">
        <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
          <SectionHeading
            eyebrow="Nossos diferenciais"
            title="Tecnologia que faz diferença de verdade"
            subtitle="Engenharia e inteligência para um sistema que cresce com você."
            dark
          />
          <div className="mt-14 grid gap-5 md:grid-cols-3">
            {diferencialItems.map((item) => (
              <div
                key={item.title}
                className="group relative min-h-80 overflow-hidden rounded-md border border-blue-200/25 bg-navy-950 p-7 transition-transform duration-300 ease-out hover:-translate-y-1 hover:scale-[1.02]"
              >
                <img src={item.image} alt={item.title} aria-hidden="true" loading="eager" decoding="async" className="pointer-events-none absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-navy-950/5 via-navy-950/25 to-navy-950/95" />
                <div className="absolute inset-x-0 bottom-0 z-10 p-7">
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-sm border border-blue-200/30 bg-navy-950/90 text-blue-200">
                  <item.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-5 font-display text-xl font-bold text-primary-foreground">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm font-medium leading-relaxed text-blue-200">
                  {item.description}
                </p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </section>

      {/* ============ BLOCO 3 · O QUE É AUTOMAÇÃO ============ */}
      <section id="sobre" data-backdrop="living" className="relative scroll-mt-20 py-28 sm:py-36">
        <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <SectionHeading
              eyebrow="O que é automação residencial?"
              title="Sua casa e seu escritório trabalhando por você"
              subtitle=""
              centered
              dark
            />
            <div className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-blue-100 font-medium sm:text-lg text-center [text-shadow:_0_1px_4px_rgba(0,0,0,0.85)]">
              <p>
                Conecte <strong className="font-semibold text-white">luzes, climatização, cortinas e segurança</strong> em um só sistema. Controle pelo celular, por voz ou deixe sua rotina acontecer automaticamente.
              </p>
            </div>

            {/* Cards modernos de funcionalidades de automação - Centralizados */}
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  title: "Iluminação inteligente",
                  desc: "Crie cenários e controle por voz ou app.",
                  icon: (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6" aria-hidden="true">
                      <path d="M9 18h6M10 21h4" />
                      <path d="M12 3a6 6 0 0 0-3.5 10.9c.8.6 1.5 1.6 1.5 2.6h4c0-1 .7-2 1.5-2.6A6 6 0 0 0 12 3Z" />
                      <path d="M12 1v2M3 12h2M19 12h2M5 5l1.5 1.5M17.5 6.5 19 5" />
                    </svg>
                  ),
                },
                {
                  title: "Clima e ar-condicionado",
                  desc: "Temperatura ideal em cada momento.",
                  icon: (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6" aria-hidden="true">
                      <path d="M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z" />
                      <path d="M12 11v4" />
                    </svg>
                  ),
                },
                {
                  title: "Cortinas e persianas",
                  desc: "Abertura sincronizada com a luz solar.",
                  icon: (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6" aria-hidden="true">
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <path d="M3 9h18M3 15h18M9 3v18" />
                    </svg>
                  ),
                },
                {
                  title: "Segurança e acesso",
                  desc: "Fechaduras digitais, alertas e câmeras.",
                  icon: (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6" aria-hidden="true">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
                      <path d="m9 12 2 2 4-4" />
                    </svg>
                  ),
                },
                {
                  title: "Cenas de iluminação",
                  desc: "Modos personalizados com um toque.",
                  icon: (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6" aria-hidden="true">
                      <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3L12 3Z" />
                    </svg>
                  ),
                },
                {
                  title: "Economia de energia",
                  desc: "Desligamento automático e eficiência.",
                  icon: (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6" aria-hidden="true">
                      <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />
                    </svg>
                  ),
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="group flex flex-col items-center justify-center text-center rounded-xl border border-border/80 bg-background/95 p-6 backdrop-blur-md shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/60 hover:bg-background hover:shadow-md"
                >
                  <div className="mb-3.5 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    {item.icon}
                  </div>
                  <h4 className="font-display text-base font-bold text-foreground transition-colors group-hover:text-primary sm:text-lg">
                    {item.title}
                  </h4>
                  <p className="mt-1.5 text-xs sm:text-sm leading-relaxed text-muted-foreground">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============ BLOCO 4 · BENEFÍCIOS ============ */}
      <section data-backdrop="benefits" className="relative py-20 sm:py-28">
        <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
            <SectionHeading
              eyebrow="Por que a CONSELT"
              title="Benefícios de contratar a CONSELT"
              subtitle="Segurança, excelência técnica e eficiência em cada etapa do seu projeto."
              shadow
            />
            <div className="hidden items-center gap-2 rounded-full border border-blue-400/25 bg-background/80 px-4 py-1.5 text-xs font-bold text-primary shadow-xs backdrop-blur-md md:inline-flex">
              <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              Padrão de Engenharia
            </div>
          </div>

          {/* Grid Bento Moderno (2 cards largos no topo + 3 cards equilibrados na base) */}
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-6">
            {beneficioItems.map((item, index) => {
              const isTopRow = index < 2;
              return (
                <BenefitCard
                  title={item.title}
                  key={item.title}
                  className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border/80 bg-card p-7 sm:p-8 shadow-xs transition-all duration-300 hover:-translate-y-1.5 hover:border-blue-400/60 hover:shadow-xl ${
                    isTopRow ? "lg:col-span-3" : "lg:col-span-2"
                  }`}
                >
                  {/* Linha de brilho superior ao passar o mouse */}
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-600 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  
                  {/* Glow sutil no canto do card */}
                  <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-blue-500/0 blur-2xl transition-all duration-500 group-hover:bg-blue-500/10 group-hover:scale-125" />

                  <div>
                    {/* Topo do Card: Ícone + Tag + Número */}
                    <div className="flex items-center justify-between">
                      <div className="flex h-13 w-13 items-center justify-center rounded-xl bg-navy-950 text-blue-300 shadow-md transition-all duration-300 group-hover:scale-105 group-hover:bg-primary group-hover:text-primary-foreground">
                        <item.icon className="h-6 w-6" />
                      </div>
                      <div className="flex items-center gap-2.5">
                        <span className="rounded-full bg-muted/90 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-primary border border-border/60">
                          {item.badge}
                        </span>
                        <span className="font-mono text-xs font-extrabold text-muted-foreground/40">
                          {item.num}
                        </span>
                      </div>
                    </div>

                    {/* Conteúdo */}
                    <div className="mt-6">
                      <h3 className="font-display text-xl font-bold text-foreground transition-colors group-hover:text-primary sm:text-2xl">
                        {item.title}
                      </h3>
                      <span className="benefit-card__hint" aria-hidden="true">Passe o mouse ou foque para saber mais ↗</span>
                      <p className="benefit-card__description mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  {/* Detalhe de rodapé do card */}
                  <div className="benefit-card__detail mt-8 flex flex-wrap items-center gap-2 pt-4 border-t border-border/40 text-xs font-semibold text-primary/80">
                    <span>Garantia CONSELT</span>
                    <span className="h-1 w-1 rounded-full bg-primary" />
                    <span className="text-muted-foreground font-normal">Excelência técnica</span>
                  </div>
                </BenefitCard>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============ BLOCO 5 · PROVAS DE CONFIANÇA ============ */}
      <section id="confianca" data-backdrop="trust" className="relative scroll-mt-20 py-28 sm:py-36">
        <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
          <SectionHeading
            eyebrow="Provas de confiança"
            title="Tradição e excelência em engenharia"
            subtitle="Experiência consolidada com o rigor técnico da engenharia UFU."
          />

          <div className="mt-14 grid gap-6 lg:grid-cols-[1.05fr_1fr]">
            {/* Painel de destaque · 32 anos */}
            <div className="group relative overflow-hidden rounded-xl border border-white/25 bg-navy-950/90 p-8 shadow-lg backdrop-blur-md transition-transform duration-300 ease-out hover:scale-[1.02] sm:p-10">
              {/* Elementos gráficos decorativos */}
              <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full border border-blue-400/15" aria-hidden="true" />
              <div className="pointer-events-none absolute -right-10 -top-10 h-64 w-64 rounded-full border border-blue-400/25" aria-hidden="true" />
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-400/60 to-transparent" aria-hidden="true" />

              <span className="text-xs font-bold uppercase tracking-wider text-blue-300">
                CONSELT · Empresa Júnior UFU
              </span>

              <div className="mt-6 flex items-end gap-3">
                <span className="font-display text-7xl font-extrabold leading-none tracking-tight text-white sm:text-8xl">
                  32
                </span>
                <span className="pb-2 font-display text-2xl font-bold text-blue-400 sm:text-3xl">
                  anos
                </span>
              </div>

              <div className="mt-6 h-px w-full bg-gradient-to-r from-blue-400/50 to-transparent" aria-hidden="true" />

              <p className="mt-6 text-base leading-relaxed text-blue-100 sm:text-lg">
                de experiência em soluções de{" "}
                <strong className="font-semibold text-white">engenharia elétrica</strong>, uma trajetória sólida construída projeto a projeto.
              </p>

              <ul className="mt-8 space-y-3.5">
                {[
                  "Equipe de estudantes de engenharia da UFU",
                  "Garantia formal de instalação e equipamentos",
                  "Suporte direto com a equipe de engenharia",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-3 text-sm font-medium text-blue-200 sm:text-base"
                  >
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-blue-400/40 bg-blue-400/10 text-blue-300">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3" aria-hidden="true">
                        <path d="m5 13 4 4L19 7" />
                      </svg>
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Cards de apoio · glassmorphism discreto */}
            <div className="flex flex-col gap-6">
              {[
                {
                  icon: IconAward,
                  tag: "Ensino federal",
                  title: "Engenharia UFU",
                  description:
                    "Qualidade e excelência da Universidade Federal de Uberlândia.",
                  highlight: "Universidade Federal de Uberlândia",
                },
                {
                  icon: IconShield,
                  tag: "Padrão técnico",
                  title: "Qualidade garantida",
                  description:
                    "Normas técnicas, garantia formal e suporte da própria equipe.",
                  highlight: "Normas técnicas · Garantia formal · Suporte próprio",
                },
              ].map((card) => (
                <div
                  key={card.title}
                  className="group flex flex-1 items-start gap-5 rounded-xl border border-white/70 bg-white/70 p-7 shadow-sm backdrop-blur-md transition-transform duration-300 ease-out hover:scale-[1.02] sm:p-8"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-primary/15 bg-primary/10 text-primary">
                    <card.icon className="h-6 w-6" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="font-display text-lg font-bold text-foreground">
                        {card.title}
                      </h3>
                      <span className="hidden rounded-full border border-border/70 bg-background/70 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-muted-foreground sm:inline-block">
                        {card.tag}
                      </span>
                    </div>
                    <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">
                      {card.description}
                    </p>
                    <div className="mt-5 h-px w-full bg-border/60" aria-hidden="true" />
                    <p className="mt-3.5 text-xs font-semibold text-primary">
                      {card.highlight}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============ BLOCO 6 · FAQ ============ */}
      <section id="duvidas" data-backdrop="faq" className="relative scroll-mt-20 py-20 sm:py-28">
        <div className="relative mx-auto max-w-3xl px-4 sm:px-6">
          <SectionHeading
            eyebrow="Perguntas frequentes"
            title="Tire suas dúvidas antes de falar com a gente"
          />
          <div className="mt-12 divide-y divide-border border-y border-border">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={faq.question}
                  className={
                    isOpen
                      ? "border-l-2 border-primary bg-muted transition-colors"
                      : "border-l-2 border-transparent bg-background transition-colors hover:bg-muted"
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
      <section data-backdrop="cta" aria-labelledby="closing-title" className="closing-cta relative">
        <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6">
          <div className="closing-cta__brand">
            <ConseltLogo className="h-10 w-auto" />
            <span className="text-xs font-bold uppercase tracking-widest text-primary">CONSELT · Engenharia</span>
          </div>
          <h2 id="closing-title" className="mt-8 font-display text-4xl font-extrabold leading-tight tracking-tight text-navy-950 sm:text-5xl">
            Pronto para viver o <span className="text-primary">futuro</span> hoje?
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Receba uma proposta personalizada para sua casa ou escritório.
          </p>
          <div className="mt-10">
            <a
              href={waLink(WA_DEFAULT_MESSAGE)}
              target="_blank"
              rel="noopener noreferrer"
             className="closing-cta__button inline-flex w-full items-center justify-center gap-3 rounded-xl border border-navy-950/10 bg-whatsapp px-6 py-4 text-base font-bold text-navy-950 transition-all hover:-translate-y-0.5 hover:bg-whatsapp-hover sm:w-auto sm:px-10 sm:text-lg"
            >
              <IconWhatsApp className="h-6 w-6" />
              Chamar no WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* ============ RODAPÉ ============ */}
      <footer data-backdrop="footer" className="relative py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-5 px-4 text-center sm:px-6">
          <div className="flex items-center gap-3">
            <ConseltLogo className="h-8 w-auto" />
            <span className="font-display text-base font-extrabold text-foreground">
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
