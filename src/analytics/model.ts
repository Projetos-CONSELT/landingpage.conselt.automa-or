export type { Snapshot, AnalyticsEvent } from "./validation";

export const sections = [
  "hero",
  "features",
  "living",
  "benefits",
  "trust",
  "faq",
  "cta",
  "footer",
] as const;
export const labels: Record<string, string> = {
  hero: "Apresentação",
  features: "Diferenciais",
  living: "Soluções",
  benefits: "Benefícios",
  trust: "Engenharia",
  faq: "Perguntas frequentes",
  cta: "Chamada final",
  footer: "Rodapé",
};
// Time since last interaction is capped; hidden time never accrues.
export function activeDelta(
  previous: number,
  now: number,
  lastInteraction: number,
  visible: boolean,
) {
  return visible ? Math.max(0, Math.min(now, lastInteraction + 30000) - previous) : 0;
}
export function scrollPercent(top: number, viewport: number, height: number) {
  return Math.max(0, Math.min(100, height <= viewport ? 100 : (top / (height - viewport)) * 100));
}
