import diamondLogo from "@/assets/conselt-diamond.jpg";

import transparentDiamond from "@/assets/conselt-diamond-transparent.png";

interface ConseltLogoProps {
  className?: string;
  transparent?: boolean;
  priority?: boolean;
}

/** CONSELT mark — official diamond + lightning bolt logo. */
export function ConseltLogo({ className, transparent = false, priority = false }: ConseltLogoProps) {
  return (
    <img
      src={transparent ? transparentDiamond : diamondLogo}
      fetchPriority={priority ? "high" : "auto"}
      alt="CONSELT"
      width={64}
      height={64}
      className={`shrink-0 object-contain ${className ?? ""}`}
      loading="eager"
      decoding="async"
    />
  );
}
