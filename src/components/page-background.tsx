import { useEffect, useRef } from "react";
import heroCameraPhone from "@/assets/hero-camera-phone.jpg";
import ctaCamera from "@/assets/cta-camera.jpg";
import livingLighting from "@/assets/smart-living-room.png";
import ufuImg from "@/assets/ufu-engenharia.png.asset.json";

/** One page-sized canvas; section geometry only anchors the existing photographs. */
export function PageBackground() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const page = canvas?.parentElement;
    if (!canvas || !page) return;

    const sections = Array.from(page.querySelectorAll<HTMLElement>(":scope > section, :scope > footer"));
    const update = () => {
      for (const section of sections) {
        const name = section.dataset["backdrop"];
        if (!name) continue;
        canvas.style.setProperty(`--${name}-top`, `${section.offsetTop}px`);
        canvas.style.setProperty(`--${name}-height`, `${section.offsetHeight}px`);
      }
    };

    update();
    // Also follows wrapping, font loading and accordion changes; no scroll listener.
    const observer = new ResizeObserver(update);
    observer.observe(page);
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="page-background" aria-hidden="true">
      <div className="page-background__photo page-background__hero">
        <img src={heroCameraPhone} alt="" fetchPriority="high" />
      </div>
      <div className="page-background__photo page-background__living">
        <img src={livingLighting} alt="" />
      </div>
      <div className="page-background__photo page-background__trust">
        <img src={ufuImg.url} alt="" loading="lazy" />
      </div>
      <div className="page-background__photo page-background__cta">
        <img src={ctaCamera} alt="" loading="lazy" width={1920} height={1088} />
      </div>
    </div>
  );
}
