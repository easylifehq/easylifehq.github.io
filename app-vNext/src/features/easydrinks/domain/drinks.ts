import type { DrinkDraft, DrinkRecord, DrinkType } from "@/lib/firestore/drinks";

export type DrinkFilters = {
  query: string;
  type: DrinkType | "all";
  favoritesOnly: boolean;
  minimumRating: number;
};

export function todayDateKey(now = new Date()) {
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 10);
}

export function createLocalId(prefix: string, random = Math.random()) {
  return `${prefix}-${Date.now().toString(36)}-${Math.floor(random * 0x100000).toString(36)}`;
}

export function emptyDrinkDraft(date = todayDateKey()): DrinkDraft {
  return {
    name: "",
    type: "coffee",
    baseServings: 1,
    ingredients: [{ id: "ingredient-1", name: "", amount: "", unit: "", optional: false }],
    steps: [{ id: "step-1", text: "", durationSeconds: null }],
    instructions: "",
    notes: "",
    rating: 0,
    tags: [],
    date,
    favorite: false,
    sourceDrinkId: null,
  };
}

function clean(value: string, maximum: number) {
  return value.trim().replace(/\s+/g, " ").slice(0, maximum);
}

function safeId(value: string, fallback: string) {
  const normalized = clean(value, 120).replace(/[^A-Za-z0-9_-]/g, "-");
  return normalized || fallback;
}

export function normalizeDrinkDraft(draft: DrinkDraft): DrinkDraft {
  const seenTags = new Set<string>();
  const tags = draft.tags
    .map((tag) => clean(tag.replace(/^#/, ""), 40).toLocaleLowerCase())
    .filter((tag) => tag && !seenTags.has(tag) && seenTags.add(tag))
    .slice(0, 24);
  const ingredients = draft.ingredients
    .map((ingredient, index) => ({
      id: safeId(ingredient.id, `ingredient-${index + 1}`),
      name: clean(ingredient.name, 200),
      amount: clean(ingredient.amount, 80),
      unit: clean(ingredient.unit, 80),
      optional: Boolean(ingredient.optional),
    }))
    .filter((ingredient) => ingredient.name || ingredient.amount || ingredient.unit)
    .slice(0, 40);
  const steps = draft.steps
    .map((step, index) => ({
      id: safeId(step.id, `step-${index + 1}`),
      text: step.text.trim().slice(0, 2_000),
      durationSeconds: Number.isInteger(step.durationSeconds) && Number(step.durationSeconds) >= 1 && Number(step.durationSeconds) <= 86_400
        ? Number(step.durationSeconds)
        : null,
    }))
    .filter((step) => step.text)
    .slice(0, 40);
  const instructions = steps.map((step) => step.text).join("\n").slice(0, 20_000);

  return {
    name: clean(draft.name, 300),
    type: draft.type,
    baseServings: Math.max(1, Math.min(100, Math.round(Number(draft.baseServings) || 1))),
    ingredients,
    steps,
    instructions,
    notes: draft.notes.trim().slice(0, 20_000),
    rating: Math.max(0, Math.min(5, Math.round(draft.rating))),
    tags,
    date: /^\d{4}-\d{2}-\d{2}$/.test(draft.date) ? draft.date : todayDateKey(),
    favorite: Boolean(draft.favorite),
    sourceDrinkId: draft.sourceDrinkId?.slice(0, 200) || null,
  };
}

export function filterDrinks(drinks: DrinkRecord[], filters: DrinkFilters) {
  const terms = filters.query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
  return drinks.filter((drink) => {
    if (filters.type !== "all" && drink.type !== filters.type) return false;
    if (filters.favoritesOnly && !drink.favorite) return false;
    if (drink.rating < filters.minimumRating) return false;
    const haystack = [
      drink.name,
      drink.type,
      drink.instructions,
      drink.notes,
      ...drink.steps.map((step) => step.text),
      ...drink.tags,
      ...drink.ingredients.flatMap((ingredient) => [ingredient.name, ingredient.amount, ingredient.unit]),
    ].join(" ").toLocaleLowerCase();
    return terms.every((term) => haystack.includes(term));
  });
}

export function duplicateDrinkDraft(drink: DrinkRecord, date = todayDateKey()): DrinkDraft {
  return {
    name: `${drink.name} copy`.slice(0, 300),
    type: drink.type,
    baseServings: drink.baseServings,
    ingredients: drink.ingredients.map((ingredient, index) => ({ ...ingredient, id: `ingredient-${index + 1}` })),
    steps: drink.steps.map((step, index) => ({ ...step, id: `step-${index + 1}` })),
    instructions: drink.instructions,
    notes: drink.notes,
    rating: drink.rating,
    tags: [...drink.tags],
    date,
    favorite: false,
    sourceDrinkId: drink.id,
  };
}

export const drinkTypeLabels: Record<DrinkType, string> = {
  cocktail: "Cocktail",
  mocktail: "Mocktail",
  coffee: "Coffee",
  tea: "Tea",
  smoothie: "Smoothie",
  "protein-shake": "Protein shake",
  other: "Custom / other",
};
