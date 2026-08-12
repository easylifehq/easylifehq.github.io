import type { DrinkIngredient, DrinkRecord } from "@/lib/firestore/drinks";
import type { DrinkPantryItem } from "@/lib/firestore/drinkPantry";

const ingredientAliases: Record<string, string> = {
  "club soda": "sparkling water",
  "soda water": "sparkling water",
  "confectioners sugar": "powdered sugar",
  "confectioner's sugar": "powdered sugar",
};

export type IngredientEvidence = {
  ingredient: DrinkIngredient;
  canonicalName: string;
  status: "available" | "missing" | "unknown" | "optional";
};

export type DrinkMatch = {
  drink: DrinkRecord;
  tier: "ready" | "almost" | "discovery";
  available: IngredientEvidence[];
  missing: IngredientEvidence[];
  unknown: IngredientEvidence[];
  optional: IngredientEvidence[];
  coverage: number;
};

export function canonicalIngredientName(name: string) {
  const normalized = name
    .normalize("NFKC")
    .trim()
    .toLocaleLowerCase()
    .replace(/[â€â€‘â€’â€“â€”]/g, "-")
    .replace(/\s*([,-])\s*/g, "$1 ")
    .replace(/\s+/g, " ");
  return ingredientAliases[normalized] || normalized;
}

export function isSafeCanonicalIngredient(name: string) {
  const normalized = canonicalIngredientName(name);
  return Boolean(normalized) && normalized.length <= 200 && !/\s(?:or|and\/or)\s|\//.test(normalized);
}

export function matchDrinkToPantry(drink: DrinkRecord, pantry: DrinkPantryItem[]): DrinkMatch {
  const pantryByName = new Map(pantry.map((item) => [item.canonicalName, item]));
  const evidence = drink.ingredients.map((ingredient): IngredientEvidence => {
    const canonicalName = canonicalIngredientName(ingredient.name);
    if (ingredient.optional) return { ingredient, canonicalName, status: "optional" };
    if (!isSafeCanonicalIngredient(ingredient.name)) return { ingredient, canonicalName, status: "unknown" };
    const pantryItem = pantryByName.get(canonicalName);
    if (!pantryItem) return { ingredient, canonicalName, status: "unknown" };
    return { ingredient, canonicalName, status: pantryItem.status === "available" ? "available" : "missing" };
  });
  const unique = (status: IngredientEvidence["status"]) => {
    const seen = new Set<string>();
    return evidence.filter((item) => item.status === status && (!seen.has(item.canonicalName) && seen.add(item.canonicalName)));
  };
  const available = unique("available");
  const missing = unique("missing");
  const unknown = unique("unknown");
  const optional = unique("optional");
  const requiredCount = available.length + missing.length + unknown.length;
  const unavailableCount = missing.length + unknown.length;
  const ready = requiredCount > 0 && unavailableCount === 0;
  return {
    drink,
    tier: ready ? "ready" : unavailableCount >= 1 && unavailableCount <= 2 ? "almost" : "discovery",
    available,
    missing,
    unknown,
    optional,
    coverage: requiredCount ? available.length / requiredCount : 0,
  };
}

const tierOrder: Record<DrinkMatch["tier"], number> = { ready: 0, almost: 1, discovery: 2 };

export function rankDrinksForPantry(drinks: DrinkRecord[], pantry: DrinkPantryItem[]) {
  return drinks.map((drink) => matchDrinkToPantry(drink, pantry)).sort((left, right) =>
    tierOrder[left.tier] - tierOrder[right.tier]
    || (left.missing.length + left.unknown.length) - (right.missing.length + right.unknown.length)
    || left.unknown.length - right.unknown.length
    || Number(right.drink.favorite) - Number(left.drink.favorite)
    || right.drink.rating - left.drink.rating
    || left.drink.name.localeCompare(right.drink.name)
  );
}

export function shoppingIngredients(match: DrinkMatch) {
  const seen = new Set<string>();
  return [...match.missing, ...match.unknown]
    .filter((item) => item.canonicalName && !seen.has(item.canonicalName) && seen.add(item.canonicalName))
    .map((item) => ({ canonicalName: item.canonicalName, name: item.ingredient.name }));
}

export function drinkShoppingFingerprint(drinkId: string, canonicalNames: string[]) {
  const normalized = [...new Set(canonicalNames.map((name) => name.trim()).filter(Boolean))].sort();
  let hash = 0x811c9dc5;
  const value = drinkId + "|" + normalized.join("|");
  for (let index = 0; index < value.length; index += 1) { hash ^= value.charCodeAt(index); hash = Math.imul(hash, 0x01000193) >>> 0; }
  return "drink-" + hash.toString(36);
}
