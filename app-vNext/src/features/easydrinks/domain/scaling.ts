import type { DrinkIngredient } from "@/lib/firestore/drinks";

function parsePart(value: string) {
  const fraction = value.match(/^(\d+)\/(\d+)$/);
  if (fraction) {
    const denominator = Number(fraction[2]);
    return denominator ? Number(fraction[1]) / denominator : null;
  }
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : null;
}

export function parseDrinkAmount(value: string) {
  const normalized = value.trim();
  const mixed = normalized.match(/^(\d+)\s+(\d+\/\d+)$/);
  if (mixed) {
    const fraction = parsePart(mixed[2]);
    return fraction == null ? null : Number(mixed[1]) + fraction;
  }
  return /^(?:\d+(?:\.\d+)?|\d+\/\d+)$/.test(normalized) ? parsePart(normalized) : null;
}

export function formatDrinkAmount(value: number) {
  const rounded = Math.round(value * 100) / 100;
  const whole = Math.floor(rounded);
  const remainder = rounded - whole;
  const fractions = [[0.25, "1/4"], [1 / 3, "1/3"], [0.5, "1/2"], [2 / 3, "2/3"], [0.75, "3/4"]] as const;
  const match = fractions.find(([fraction]) => Math.abs(remainder - fraction) <= 0.015);
  if (match) return whole ? `${whole} ${match[1]}` : match[1];
  return String(rounded);
}

export function scaleIngredient(ingredient: DrinkIngredient, baseServings: number, targetServings: number) {
  const amount = parseDrinkAmount(ingredient.amount);
  if (amount == null || baseServings <= 0 || targetServings <= 0) {
    return { ...ingredient, displayAmount: ingredient.amount, scaled: false };
  }
  return { ...ingredient, displayAmount: formatDrinkAmount(amount * targetServings / baseServings), scaled: true };
}
