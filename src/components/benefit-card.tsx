import { useEffect, useRef, type ReactNode } from "react";
import "./benefit-card.css";

export function BenefitCard({ children, className, title }: { children: ReactNode; className: string; title: string }) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const card = ref.current;
    if (!card) return;
    const pointer = matchMedia("(min-width: 768px) and (hover: hover) and (pointer: fine)");
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    let observer: IntersectionObserver | undefined;
    const configure = () => {
      observer?.disconnect();
      delete card.dataset["revealed"];
      if (motion.matches) {
        delete card.dataset["revealMode"];
      } else if (pointer.matches) {
        card.dataset["revealMode"] = "hover";
      } else if (typeof IntersectionObserver !== "undefined") {
        card.dataset["revealMode"] = "scroll";
        observer = new IntersectionObserver(([entry]) => {
          if (entry?.isIntersecting) {
            card.dataset["revealed"] = "true";
            observer?.disconnect();
          }
        }, { threshold: 0.15 });
        observer.observe(card);
      } else {
        delete card.dataset["revealMode"];
      }
    };
    configure();
    pointer.addEventListener("change", configure);
    motion.addEventListener("change", configure);
    return () => {
      observer?.disconnect();
      pointer.removeEventListener("change", configure);
      motion.removeEventListener("change", configure);
    };
  }, []);
  return <article data-motion="card" ref={ref} tabIndex={0} aria-label={title} className={`benefit-card ${className}`}>{children}</article>;
}
