import { useEffect, useRef } from "react";

type Kind = "title" | "text" | "detail" | "card" | "image" | "action" | "row" | "ambient";
const rhythms: Record<Kind, [number, number]> = {
  title: [680, 20], text: [540, 12], detail: [460, 8],
  card: [720, 22], image: [900, 16], action: [520, 10],
  row: [560, 12], ambient: [1100, 0],
};

/** One observer, one entrance per element. Content is visible without JS or motion. */
export function usePageMotion() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const page = ref.current;
    if (!page || typeof IntersectionObserver === "undefined" || !Element.prototype.animate) return;
    const preference = matchMedia("(prefers-reduced-motion: reduce)");
    const compact = matchMedia("(max-width: 767px)");
    const active = new Map<Element, Animation>();
    const seen = new Set<Element>();
    const kinds = new Map<HTMLElement, Kind>();
    // A card, link or FAQ row is a single composition, including its icons/text.
    const selector = '[data-motion], h1, h2, h3, h4, p, a, button, li, img, svg, span';
    const candidates = Array.from(page.querySelectorAll<HTMLElement>(selector));
    const candidateSet = new Set<Element>(candidates);
    const items = candidates.filter((element) => {
      if (element.closest('.page-background') && !element.matches('[data-motion]')) return false;
      for (let parent = element.parentElement; parent && parent !== page; parent = parent.parentElement) {
        if (candidateSet.has(parent)) return false;
      }
      return true;
    });
    for (const item of items) {
      const tag = item.tagName.toLowerCase();
      const kind = item.dataset["motion"] as Kind | undefined;
      kinds.set(item, kind ?? (/^h[1-4]$/.test(tag) ? "title" :
        tag === "img" ? "image" : tag === "a" || tag === "button" ? "action" :
        tag === "span" || tag === "svg" ? "detail" : "text"));
    }
    let observer: IntersectionObserver | undefined;
    const finish = (item: HTMLElement) => {
      seen.add(item);
      item.removeAttribute("data-motion-pending");
      active.get(item)?.cancel();
      active.delete(item);
      observer?.unobserve(item);
    };
    const reveal = (item: HTMLElement, delay: number) => {
      if (seen.has(item)) return;
      finish(item);
      const kind = kinds.get(item)!;
      const [duration, distance] = rhythms[kind];
      const small = compact.matches;
      const animation = item.animate([
        { opacity: kind === "ambient" ? .45 : 0, translate: `0 -${distance * (small ? .55 : 1)}px` },
        { opacity: 1, translate: "0 0" },
      ], { duration: duration * (small ? .85 : 1), delay,
        easing: "cubic-bezier(.22, 1, .36, 1)", fill: "backwards" });
      active.set(item, animation);
      animation.onfinish = () => { animation.cancel(); active.delete(item); };
    };
    const configure = () => {
      observer?.disconnect();
      active.forEach((animation) => animation.cancel());
      active.clear();
      items.forEach((item) => item.removeAttribute("data-motion-pending"));
      if (preference.matches) { items.forEach((item) => seen.add(item)); return; }
      observer = new IntersectionObserver((entries) => {
        // Stagger only neighbours entering together; no accumulating page-long delays.
        const groups = new Map<Element, number>();
        entries.filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top || a.boundingClientRect.left - b.boundingClientRect.left)
          .forEach(({ target }) => {
            const item = target as HTMLElement;
            const section = item.closest("section, header, footer") ?? page;
            const position = groups.get(section) ?? 0;
            const ambient = kinds.get(item) === "ambient";
            reveal(item, ambient ? 0 : Math.min(position * (compact.matches ? 45 : 65), 260));
            if (!ambient) groups.set(section, position + 1);
          });
      }, { threshold: 0, rootMargin: "0px 0px -24px 0px" });
      for (const item of items) {
        if (seen.has(item)) continue;
        // Never hide content above a restored scroll position or focused controls.
        if (item.getBoundingClientRect().bottom < 0 || item.contains(document.activeElement)) { finish(item); continue; }
        item.setAttribute("data-motion-pending", "");
        observer.observe(item);
      }
    };
    const focus = (event: FocusEvent) => {
      if (!(event.target instanceof Element)) return;
      for (const item of items) if (item.contains(event.target)) finish(item);
    };
    configure();
    preference.addEventListener("change", configure);
    page.addEventListener("focusin", focus);
    return () => {
      observer?.disconnect();
      active.forEach((animation) => animation.cancel());
      items.forEach((item) => item.removeAttribute("data-motion-pending"));
      preference.removeEventListener("change", configure);
      page.removeEventListener("focusin", focus);
    };
  }, []);
  return ref;
}
