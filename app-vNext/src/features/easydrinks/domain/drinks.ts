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

export function emptyDrinkDraft(date = todayDateKey()): DrinkDraft {
  return {
    name: "",
    type: "coffee",
    ingredients: [{ name: "", amount: "", unit: "" }],
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

export function normalizeDrinkDraft(draft: DrinkDraft): DrinkDraft {
  const seenTags = new Set<string>();
  const tags = draft.tags
    .map((tag) => clean(tag.replace(/^#/, ""), 40).toLocaleLowerCase())
    .filter((tag) => tag && !seenTags.has(tag) && seenTags.add(tag))
    .slice(0, 24);
  const ingredients = draft.ingredients
    .map((ingredient) => ({
      name: clean(ingredient.name, 200),
      amount: clean(ingredient.amount, 80),
      unit: clean(ingredient.unit, 80),
    }))
    .filter((ingredient) => ingredient.name || ingredient.amount || ingredient.unit)
    .slice(0, 40);

  return {
    name: clean(draft.name, 300),
    type: draft.type,
    ingredients,
    instructions: draft.instructions.trim().slice(0, 20_000),
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
    ingredients: drink.ingredients.map((ingredient) => ({ ...ingredient })),
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
