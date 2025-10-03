type Lang = "zh" | "en";

export function getLocalizedText(
  obj: string | { zh: string; en: string },
  lang: Lang,
): string {
  return typeof obj === "string" ? obj : obj[lang];
}

export function getTapeVariant(index: number): "pink" | "beige" | "blue" {
  const variants = ["beige", "pink", "blue"] as const;
  return variants[index % variants.length];
}

export function getRandomRotation(min: number = -12, max: number = 12): number {
  return Math.random() * (max - min) + min;
}
