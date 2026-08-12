import type { DrinkRecord } from "@/lib/firestore/drinks";
import type { DrinkPreparationRecord } from "@/lib/firestore/drinkPreparations";

export type GuidedDrinkState = {
  version: 1;
  ownerKey: string;
  drinkId: string;
  recipeUpdatedAt: string | null;
  targetServings: number;
  stepIndex: number;
  completedStepIds: string[];
  timerEndsAt: string | null;
  updatedAt: string;
};

export function guidedDrinkStorageKey(ownerKey: string, drinkId: string) {
  return `easylife:drinks:guided:v1:${encodeURIComponent(ownerKey)}:${encodeURIComponent(drinkId)}`;
}

export function saveGuidedDrink(storage: Pick<Storage, "setItem">, state: GuidedDrinkState) {
  try {
    storage.setItem(guidedDrinkStorageKey(state.ownerKey, state.drinkId), JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}

export function loadGuidedDrink(storage: Pick<Storage, "getItem">, ownerKey: string, drink: DrinkRecord) {
  try {
    const raw = storage.getItem(guidedDrinkStorageKey(ownerKey, drink.id));
    if (!raw) return null;
    const value = JSON.parse(raw) as Partial<GuidedDrinkState>;
    if (value.version !== 1 || value.ownerKey !== ownerKey || value.drinkId !== drink.id || !Array.isArray(value.completedStepIds)) return null;
    const targetServings = Number(value.targetServings);
    const stepIndex = Number(value.stepIndex);
    return {
      ...value,
      version: 1,
      ownerKey,
      drinkId: drink.id,
      recipeUpdatedAt: typeof value.recipeUpdatedAt === "string" ? value.recipeUpdatedAt : null,
      targetServings: Number.isInteger(targetServings) && targetServings >= 1 && targetServings <= 100 ? targetServings : drink.baseServings,
      stepIndex: Number.isInteger(stepIndex) ? Math.max(0, Math.min(drink.steps.length - 1, stepIndex)) : 0,
      completedStepIds: value.completedStepIds.filter((id): id is string => typeof id === "string" && drink.steps.some((step) => step.id === id)),
      timerEndsAt: typeof value.timerEndsAt === "string" ? value.timerEndsAt : null,
      updatedAt: typeof value.updatedAt === "string" ? value.updatedAt : new Date(0).toISOString(),
    } satisfies GuidedDrinkState;
  } catch {
    return null;
  }
}

export function clearGuidedDrink(storage: Pick<Storage, "removeItem">, ownerKey: string, drinkId: string) {
  try { storage.removeItem(guidedDrinkStorageKey(ownerKey, drinkId)); } catch { /* recovery storage is best effort */ }
}

export function derivePreparationStats(records: DrinkPreparationRecord[], favoriteDrinkIds: ReadonlySet<string> = new Set()) {
  const byDrink = new Map<string, { name: string; count: number; }>();
  const byType = new Map<string, number>();
  const favoritePreparedIds = new Set<string>();
  let ratingTotal = 0;
  let ratedCount = 0;

  for (const record of records) {
    const current = byDrink.get(record.drinkId) || { name: record.drinkName, count: 0 };
    byDrink.set(record.drinkId, { name: current.name || record.drinkName, count: current.count + 1 });
    byType.set(record.drinkType, (byType.get(record.drinkType) || 0) + 1);
    if (favoriteDrinkIds.has(record.drinkId)) favoritePreparedIds.add(record.drinkId);
    if (record.rating > 0) { ratingTotal += record.rating; ratedCount += 1; }
  }

  const mostMade = [...byDrink.entries()].sort((left, right) => right[1].count - left[1].count || left[1].name.localeCompare(right[1].name) || left[0].localeCompare(right[0]))[0]?.[1] || null;
  const categoryMix = [...byType.entries()].map(([type, count]) => ({ type, count })).sort((left, right) => right.count - left.count || left.type.localeCompare(right.type));
  const rated = records.filter((record) => record.rating > 0).sort((left, right) => (right.preparedAt?.getTime() || 0) - (left.preparedAt?.getTime() || 0) || right.id.localeCompare(left.id));
  const windowSize = rated.length >= 4 ? Math.min(3, Math.floor(rated.length / 2)) : 0;
  const average = (items: DrinkPreparationRecord[]) => Math.round((items.reduce((sum, record) => sum + record.rating, 0) / items.length) * 10) / 10;
  const recentAverage = windowSize ? average(rated.slice(0, windowSize)) : null;
  const previousAverage = windowSize ? average(rated.slice(windowSize, windowSize * 2)) : null;
  const ratingTrend = recentAverage == null || previousAverage == null ? null : {
    recentAverage,
    previousAverage,
    delta: Math.round((recentAverage - previousAverage) * 10) / 10,
    windowSize,
  };

  return {
    preparations: records.length,
    uniqueDrinks: byDrink.size,
    mostMade,
    averageRating: ratedCount ? Math.round((ratingTotal / ratedCount) * 10) / 10 : null,
    ratedCount,
    categoryMix,
    favoritePrepared: favoritePreparedIds.size,
    ratingTrend,
  };
}