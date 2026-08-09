import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { duplicateDrinkDraft, filterDrinks, normalizeDrinkDraft } from "../src/features/easydrinks/domain/drinks.ts";
import { createPairGarden, pairGardenScore, resolvePairCards, revealPairCard } from "../src/features/easygames/domain/pairGarden.ts";
import { createTrailScout, moveTrailScout, trailScoutScore } from "../src/features/easygames/domain/trailScout.ts";
import { clearActiveGame, loadActiveGame, saveActiveGame } from "../src/features/easygames/domain/activeGameStorage.ts";
import { buildAccountExport, emptyAccountDataCollections, serializeDomainCsv } from "../src/features/coreloop/domain/accountExport.ts";
import { withReviewMode } from "../src/features/coreloop/demo/reviewRoute.ts";

const drink = {
  id: "latte",
  ownerId: "private-owner",
  schemaVersion: "easydrinks-v1",
  name: "Maple oat latte",
  type: "coffee",
  ingredients: [{ name: " Oat   milk ", amount: " 8 ", unit: " oz " }],
  instructions: "Warm gently",
  notes: "Not too sweet",
  rating: 5,
  tags: ["Morning", " morning ", "#Warm"],
  date: "2026-08-08",
  favorite: true,
  sourceDrinkId: null,
  createdAt: new Date("2026-08-08T12:00:00Z"),
  updatedAt: new Date("2026-08-08T12:00:00Z"),
};

test("drink capture normalizes flexible recipe fields without retaining ownership input", () => {
  const normalized = normalizeDrinkDraft({ ...drink, name: "  Maple   oat latte  ", rating: 9 });
  assert.equal(normalized.name, "Maple oat latte");
  assert.equal(normalized.rating, 5);
  assert.deepEqual(normalized.tags, ["morning", "warm"]);
  assert.deepEqual(normalized.ingredients, [{ name: "Oat milk", amount: "8", unit: "oz" }]);
  assert.equal(Object.hasOwn(normalized, "ownerId"), false);
  assert.equal(Object.hasOwn(normalized, "id"), false);
});

test("drink search and filters cover ingredients, tags, rating, type, and favorites", () => {
  assert.equal(filterDrinks([drink], { query: "oat warm", type: "coffee", favoritesOnly: true, minimumRating: 4 }).length, 1);
  assert.equal(filterDrinks([drink], { query: "mint", type: "all", favoritesOnly: false, minimumRating: 0 }).length, 0);
  assert.equal(filterDrinks([drink], { query: "", type: "tea", favoritesOnly: false, minimumRating: 0 }).length, 0);
  const copy = duplicateDrinkDraft(drink, "2026-08-09");
  assert.equal(copy.name, "Maple oat latte copy");
  assert.equal(copy.sourceDrinkId, "latte");
  assert.equal(copy.favorite, false);
});

test("Pair Garden is deterministic, serializable, and scores completed pairs", () => {
  let state = createPairGarden(42);
  assert.deepEqual(state.deck, createPairGarden(42).deck);
  const first = 0;
  const second = state.deck.findIndex((symbol, index) => index !== first && symbol === state.deck[first]);
  state = revealPairCard(revealPairCard(state, first), second);
  assert.equal(state.moves, 1);
  state = resolvePairCards(state);
  assert.deepEqual(new Set(state.matched), new Set([first, second]));
  const won = { ...state, matched: state.deck.map((_, index) => index), status: "won", moves: 8 };
  assert.equal(pairGardenScore(won), 890);
});

test("Trail Scout supports a complete keyboard-equivalent path and a finite score", () => {
  let state = createTrailScout(0);
  for (const direction of ["right", "right", "right", "right", "down", "down", "down", "down", "left", "left", "left", "left"]) {
    state = moveTrailScout(state, direction);
  }
  assert.equal(state.status, "won");
  assert.equal(state.collected, 3);
  assert.equal(state.movesRemaining, 16);
  assert.equal(trailScoutScore(state), 1320);
});

test("active game recovery is owner-scoped and fails closed on corrupt state", () => {
  const values = new Map();
  const storage = { setItem: (key, value) => values.set(key, value), getItem: (key) => values.get(key) || null, removeItem: (key) => values.delete(key) };
  const state = createPairGarden(7);
  saveActiveGame(storage, "owner-a", "pair-garden", state);
  assert.deepEqual(loadActiveGame(storage, "owner-a", "pair-garden", (value) => value?.version === 1), state);
  assert.equal(loadActiveGame(storage, "owner-b", "pair-garden", (value) => value?.version === 1), null);
  clearActiveGame(storage, "owner-a", "pair-garden");
  assert.equal(loadActiveGame(storage, "owner-a", "pair-garden", (value) => value?.version === 1), null);
});

test("review and demo route state survives internal navigation and reloads", () => {
  assert.equal(withReviewMode("/app/easygames/pair-garden", "?demo=1"), "/app/easygames/pair-garden?demo=1");
  assert.equal(withReviewMode("/app/settings?section=customize#apps", "?visualQa=1&theme=night"), "/app/settings?section=customize&visualQa=1&theme=night#apps");
  assert.equal(withReviewMode("/app/hq?demo=0", "?demo=1"), "/app/hq?demo=0");
});

test("new-note redirect uses the shared review-mode route guard", async () => {
  const source = await readFile(new URL("../src/features/easynotes/routes/EasyNotesNewPage.tsx", import.meta.url), "utf8");
  assert.match(source, /withReviewMode\(noteId \? `\/app\/easynotes\/\$\{noteId\}`/);
  assert.match(source, /location\.search/);
});

test("account JSON and CSV include drinks and game statistics without owner IDs", () => {
  const gameStat = { id: "pair-garden", ownerId: "private-owner", schemaVersion: "easygames-stats-v1", sessionsPlayed: 2, bestScore: 900, totalScore: 1700 };
  const payload = buildAccountExport({ collections: { ...emptyAccountDataCollections, drinks: [drink], gameStats: [gameStat] }, settings: {}, exportedAt: "2026-08-09T00:00:00Z", timeZone: "UTC", weightUnit: "lb", appVersion: "5.0.0" });
  assert.equal(payload.manifest.included.find((entry) => entry.domain === "drinks").recordCount, 1);
  assert.equal(payload.manifest.included.find((entry) => entry.domain === "gameStats").recordCount, 1);
  assert.equal(Object.hasOwn(payload.collections.drinks[0], "ownerId"), false);
  assert.equal(Object.hasOwn(payload.collections.gameStats[0], "ownerId"), false);
  assert.match(serializeDomainCsv("drinks", [drink]), /Maple oat latte/);
  assert.match(serializeDomainCsv("gameStats", [gameStat]), /pair-garden/);
  assert.doesNotMatch(serializeDomainCsv("drinks", [drink]), /private-owner/);
});

test("Wave 10 routes are lazy, optional by default, valid in settings, and visible in demo QA", async () => {
  const [router, settings, settingsContext] = await Promise.all([
    readFile(new URL("../src/app/router/index.tsx", import.meta.url), "utf8"),
    readFile(new URL("../src/lib/firestore/settings.ts", import.meta.url), "utf8"),
    readFile(new URL("../src/features/settings/SettingsContext.tsx", import.meta.url), "utf8"),
  ]);
  assert.match(router, /import\("@\/features\/easydrinks\/layouts\/EasyDrinksLayout"\)/);
  assert.match(router, /import\("@\/features\/easygames\/layouts\/EasyGamesLayout"\)/);
  const defaultVisibleApps = settings.match(/visibleApps:\s*\[([\s\S]*?)\],\s*experimentalFeatures/)?.[1] || "";
  assert.doesNotMatch(defaultVisibleApps, /easydrinks|easygames/);
  const validVisibleApps = settings.match(/const validVisibleApps[^=]*=\s*\[([\s\S]*?)\];/)?.[1] || "";
  assert.match(validVisibleApps, /easydrinks/);
  assert.match(validVisibleApps, /easygames/);
  const demoVisibleApps = settingsContext.match(/const demoVisibleApps[^=]*=\s*\[([\s\S]*?)\];/)?.[1] || "";
  assert.match(demoVisibleApps, /easydrinks/);
  assert.match(demoVisibleApps, /easygames/);
});

test("demo adapters return before any production drink or game write", async () => {
  const [drinksContext, gamesContext] = await Promise.all([
    readFile(new URL("../src/features/easydrinks/EasyDrinksContext.tsx", import.meta.url), "utf8"),
    readFile(new URL("../src/features/easygames/EasyGamesContext.tsx", import.meta.url), "utf8"),
  ]);
  assert.match(drinksContext, /if \(isDemoMode\) \{[\s\S]{0,800}return id;[\s\S]{0,200}createDrink/);
  assert.match(drinksContext, /if \(isDemoMode\) \{[\s\S]{0,500}return;[\s\S]{0,200}updateDrink/);
  assert.match(gamesContext, /if \(isDemoMode\) \{[\s\S]{0,1200}return;[\s\S]{0,200}recordGameSession/);
});
