import diamondAsset from "@/assets/conselt-diamond.png.asset.json";

interface ConseltLogoProps {
  className?: string;
}

/** CONSELT mark — official diamond + lightning bolt logo. */
export function ConseltLogo({ className }: ConseltLogoProps) {
  return (
    <img
      src={diamondAsset.url}
      alt="CONSELT"
      className={className}
      loading="eager"
      decoding="async"
    />
  );
}
