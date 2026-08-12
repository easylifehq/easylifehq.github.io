import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { duplicateDrinkDraft, filterDrinks, normalizeDrinkDraft } from "../src/features/easydrinks/domain/drinks.ts";
import { canonicalIngredientName, drinkShoppingFingerprint, matchDrinkToPantry, rankDrinksForPantry, shoppingIngredients } from "../src/features/easydrinks/domain/pantry.ts";
import { formatDrinkAmount, parseDrinkAmount, scaleIngredient } from "../src/features/easydrinks/domain/scaling.ts";
import { derivePreparationStats, loadGuidedDrink, saveGuidedDrink } from "../src/features/easydrinks/domain/preparation.ts";
import { dailyChallenge, utcDateKey } from "../src/features/easygames/domain/gameContracts.ts";
import { completionRuns, deriveGameAchievements, deriveGameStats } from "../src/features/easygames/domain/gameAnalytics.ts";
import { createPairGarden, isPairGardenState, pairGardenScore, resolvePairCards, revealPairCard } from "../src/features/easygames/domain/pairGarden.ts";
import { createTrailScout, isTrailScoutState, moveTrailScout, trailBoardSpecs, trailScoutScore } from "../src/features/easygames/domain/trailScout.ts";
import { clearActiveGame, loadActiveGame, saveActiveGame, shouldAcceptRemoteGame } from "../src/features/easygames/domain/activeGameStorage.ts";
import { loadGameSessionOutbox, queueGameSession, removeGameSessionFromOutbox } from "../src/features/easygames/domain/gameSessionOutbox.ts";
import { buildAccountExport, emptyAccountDataCollections, serializeDomainCsv } from "../src/features/coreloop/domain/accountExport.ts";
import { withReviewMode } from "../src/features/coreloop/demo/reviewRoute.ts";

const drink = {
  id: "latte", ownerId: "private-owner", schemaVersion: "easydrinks-v2", name: "Maple oat latte", type: "coffee", baseServings: 1,
  ingredients: [{ id: "oat", name: " Oat   milk ", amount: " 8 ", unit: " oz ", optional: false }, { id: "cinnamon", name: "Cinnamon", amount: "1/4", unit: "tsp", optional: true }],
  steps: [{ id: "warm", text: "Warm gently", durationSeconds: 120 }], instructions: "Warm gently", notes: "Not too sweet", rating: 5, tags: ["Morning", " morning ", "#Warm"], date: "2026-08-08", favorite: true, sourceDrinkId: null, createdAt: new Date("2026-08-08T12:00:00Z"), updatedAt: new Date("2026-08-08T12:00:00Z"),
};

test("drink v2 capture normalizes structured recipes and keeps ownership out", () => {
  const normalized = normalizeDrinkDraft({ ...drink, name: "  Maple   oat latte  ", rating: 9 });
  assert.equal(normalized.name, "Maple oat latte"); assert.equal(normalized.rating, 5); assert.equal(normalized.baseServings, 1);
  assert.deepEqual(normalized.tags, ["morning", "warm"]);
  assert.deepEqual(normalized.ingredients[0], { id: "oat", name: "Oat milk", amount: "8", unit: "oz", optional: false });
  assert.equal(normalized.steps[0].durationSeconds, 120); assert.equal(normalized.instructions, "Warm gently"); assert.equal(Object.hasOwn(normalized, "ownerId"), false);
  assert.equal(filterDrinks([drink], { query: "oat warm", type: "coffee", favoritesOnly: true, minimumRating: 4 }).length, 1);
  const copy = duplicateDrinkDraft(drink, "2026-08-09"); assert.equal(copy.sourceDrinkId, "latte"); assert.equal(copy.favorite, false); assert.notEqual(copy.ingredients[0], drink.ingredients[0]);
});

test("pantry matching is conservative, evidence-backed, optional-aware, and deterministic", () => {
  assert.equal(canonicalIngredientName("  Club   Soda "), "sparkling water");
  assert.notEqual(canonicalIngredientName("orange"), canonicalIngredientName("orange liqueur"));
  const pantry = [{ id: "oat", ownerId: "u", schemaVersion: "easydrinks-pantry-v1", name: "Oat milk", canonicalName: "oat milk", status: "available", note: "", createdAt: null, updatedAt: null }];
  const match = matchDrinkToPantry(drink, pantry);
  assert.equal(match.tier, "ready"); assert.deepEqual(match.available.map((item) => item.canonicalName), ["oat milk"]); assert.equal(match.optional.length, 1);
  const ambiguous = { ...drink, id: "ambiguous", name: "Ambiguous", ingredients: [{ id: "milk", name: "Milk or alternative", amount: "8", unit: "oz", optional: false }] };
  assert.equal(matchDrinkToPantry(ambiguous, pantry).unknown.length, 1);
  const missing = { ...drink, id: "missing", name: "Missing", ingredients: [{ id: "maple", name: "Maple syrup", amount: "1", unit: "tsp", optional: false }] };
  const unavailablePantry = [...pantry, { ...pantry[0], id: "maple", name: "Maple syrup", canonicalName: "maple syrup", status: "unavailable" }];
  const ranked = rankDrinksForPantry([missing, ambiguous, drink], unavailablePantry); assert.equal(ranked[0].drink.id, "latte"); assert.deepEqual(shoppingIngredients(ranked[1]).map((item) => item.canonicalName), ["maple syrup"]);
});

test("scaling parses only explicit numeric amounts and never converts units", () => {
  assert.equal(parseDrinkAmount("1 1/2"), 1.5); assert.equal(parseDrinkAmount("to taste"), null); assert.equal(parseDrinkAmount("1-2"), null); assert.equal(formatDrinkAmount(1.5), "1 1/2");
  assert.deepEqual(scaleIngredient(drink.ingredients[0], 1, 2), { ...drink.ingredients[0], displayAmount: "16", scaled: true });
  const asWritten = scaleIngredient({ ...drink.ingredients[0], amount: "to taste" }, 1, 2); assert.equal(asWritten.displayAmount, "to taste"); assert.equal(asWritten.scaled, false); assert.equal(asWritten.unit, " oz ");
});

test("guided preparation is owner scoped, corrupt-safe, clamped, and statistics are evidence-derived", () => {
  const values = new Map(); const storage = { setItem: (key, value) => values.set(key, value), getItem: (key) => values.get(key) || null };
  const state = { version: 1, ownerKey: "owner-a", drinkId: "latte", recipeUpdatedAt: drink.updatedAt.toISOString(), targetServings: 2, stepIndex: 99, completedStepIds: ["warm", "unknown"], timerEndsAt: null, updatedAt: new Date().toISOString() };
  assert.equal(saveGuidedDrink(storage, state), true); const loaded = loadGuidedDrink(storage, "owner-a", drink); assert.equal(loaded.stepIndex, 0); assert.deepEqual(loaded.completedStepIds, ["warm"]); assert.equal(loadGuidedDrink(storage, "owner-b", drink), null);
  const records = [{ id: "4", drinkId: "latte", drinkName: "Maple oat latte", drinkType: "coffee", rating: 5, preparedAt: new Date("2026-08-04") }, { id: "3", drinkId: "latte", drinkName: "Maple oat latte", drinkType: "coffee", rating: 5, preparedAt: new Date("2026-08-03") }, { id: "2", drinkId: "tea", drinkName: "Tea", drinkType: "tea", rating: 3, preparedAt: new Date("2026-08-02") }, { id: "1", drinkId: "tea", drinkName: "Tea", drinkType: "tea", rating: 3, preparedAt: new Date("2026-08-01") }];
  const stats = derivePreparationStats(records, new Set(["latte"])); assert.equal(stats.preparations, 4); assert.equal(stats.uniqueDrinks, 2); assert.deepEqual(stats.mostMade, { name: "Maple oat latte", count: 2 }); assert.equal(stats.averageRating, 4); assert.deepEqual(stats.categoryMix, [{ type: "coffee", count: 2 }, { type: "tea", count: 2 }]); assert.equal(stats.favoritePrepared, 1); assert.deepEqual(stats.ratingTrend, { recentAverage: 5, previousAverage: 3, delta: 2, windowSize: 2 }); assert.equal(derivePreparationStats(records.slice(0, 3)).ratingTrend, null);
  assert.equal(drinkShoppingFingerprint("latte", ["maple syrup", "oat milk", "maple syrup"]), drinkShoppingFingerprint("latte", ["oat milk", "maple syrup"]));
});

test("UTC daily contracts change only with date, game, or difficulty", () => {
  assert.equal(utcDateKey(new Date("2026-08-11T23:59:59Z")), "2026-08-11");
  const first = dailyChallenge("pair-garden", "standard", new Date("2026-08-11T01:00:00Z")); const retry = dailyChallenge("pair-garden", "standard", new Date("2026-08-11T23:00:00Z"));
  assert.deepEqual(first, retry); assert.notEqual(first.seed, dailyChallenge("pair-garden", "hard", new Date("2026-08-11T01:00:00Z")).seed); assert.notEqual(first.seed, dailyChallenge("trail-scout", "standard", new Date("2026-08-11T01:00:00Z")).seed); assert.notEqual(first.seed, dailyChallenge("pair-garden", "standard", new Date("2026-08-12T01:00:00Z")).seed);
});

test("Pair Garden difficulty is meaningful, deterministic, strictly guarded, and transparently scored", () => {
  assert.equal(createPairGarden(42, { difficulty: "easy" }).deck.length, 8); assert.equal(createPairGarden(42, { difficulty: "standard" }).deck.length, 12); assert.equal(createPairGarden(42, { difficulty: "hard" }).deck.length, 16); assert.deepEqual(createPairGarden(42).deck, createPairGarden(42).deck);
  let state = createPairGarden(42); const second = state.deck.findIndex((symbol, index) => index > 0 && symbol === state.deck[0]); state = resolvePairCards(revealPairCard(revealPairCard(state, 0), second)); assert.equal(state.moves, 1); assert.equal(state.matched.length, 2);
  const won = { ...createPairGarden(42), matched: Array.from({ length: 12 }, (_, index) => index), status: "won", moves: 8 }; assert.equal(pairGardenScore(won), 890); assert.equal(isPairGardenState(won), true); assert.equal(isPairGardenState({ ...won, deck: [...won.deck.slice(0, 11), "invalid"] }), false);
});

function boardIsSolvable(spec) {
  const queue = [{ position: 0, found: new Set(), moves: 0 }]; const seen = new Set(["0|"]);
  while (queue.length) { const current = queue.shift(); if (current.found.size === spec.goals.length) return current.moves <= spec.moves; if (current.moves >= spec.moves) continue; const row = Math.floor(current.position / spec.size); const column = current.position % spec.size; for (const [dr, dc] of [[-1, 0], [0, 1], [1, 0], [0, -1]]) { const r = row + dr; const c = column + dc; if (r < 0 || r >= spec.size || c < 0 || c >= spec.size) continue; const next = r * spec.size + c; if (spec.rocks.includes(next)) continue; const found = new Set(current.found); const goalIndex = spec.goals.indexOf(next); if (goalIndex >= 0) found.add(goalIndex); const key = `${next}|${[...found].sort().join(",")}`; if (!seen.has(key)) { seen.add(key); queue.push({ position: next, found, moves: current.moves + 1 }); } } }
  return false;
}

test("every Trail Scout difficulty board is finite, deterministic, solvable, and guarded", () => {
  assert.ok(trailBoardSpecs().every(boardIsSolvable)); assert.equal(createTrailScout(0, { difficulty: "easy" }).totalGoals, 2); assert.equal(createTrailScout(0, { difficulty: "standard" }).totalGoals, 3); assert.equal(createTrailScout(0, { difficulty: "hard" }).size, 6);
  let state = createTrailScout(0); for (const direction of ["right", "right", "right", "right", "down", "down", "down", "down", "left", "left", "left", "left"]) state = moveTrailScout(state, direction); assert.equal(state.status, "won"); assert.equal(state.collected, 3); assert.equal(trailScoutScore(state), 1395); assert.equal(isTrailScoutState(state), true); assert.equal(isTrailScoutState({ ...state, player: 999 }), false);
});

test("active recovery and completed outbox are owner/slot scoped, corrupt-safe, and idempotent", () => {
  const values = new Map(); const storage = { setItem: (key, value) => values.set(key, value), getItem: (key) => values.get(key) || null, removeItem: (key) => values.delete(key) }; const slot = { gameId: "pair-garden", mode: "free", difficulty: "standard", dateKey: null }; const state = createPairGarden(7);
  assert.equal(saveActiveGame(storage, "owner-a", slot, state), true); assert.deepEqual(loadActiveGame(storage, "owner-a", slot, isPairGardenState), state); assert.equal(loadActiveGame(storage, "owner-b", slot, isPairGardenState), null); clearActiveGame(storage, "owner-a", slot); assert.equal(loadActiveGame(storage, "owner-a", slot, isPairGardenState), null); assert.equal(shouldAcceptRemoteGame({ revision: 2, updatedAt: "2026-01-01" }, { revision: 3, updatedAt: "2025-01-01" }), true);
  const draft = { sessionId: "session-safe-1", gameId: "pair-garden", difficulty: "standard", mode: "free", dateKey: null, challengeKey: null, generatorVersion: "easygames-generator-v2", seed: 7, puzzleSpec: { deck: state.deck }, completed: true, score: 900, moves: 7, pairs: 6, goalsCollected: null, totalGoals: null, movesRemaining: null, startedAt: state.startedAt, completedAt: new Date().toISOString() };
  queueGameSession(storage, "owner-a", draft); queueGameSession(storage, "owner-a", draft); assert.equal(loadGameSessionOutbox(storage, "owner-a").length, 1); assert.equal(loadGameSessionOutbox(storage, "owner-b").length, 0); removeGameSessionFromOutbox(storage, "owner-a", draft.sessionId); assert.equal(loadGameSessionOutbox(storage, "owner-a").length, 0);
});

test("game history formulas dedupe UTC completion days and achievements use evidence", () => {
  const base = { ownerId: "u", schemaVersion: "easygames-session-v1", formulaVersion: "easygames-score-v2", difficulty: "standard", mode: "daily", challengeKey: "key", generatorVersion: "easygames-generator-v2", seed: 1, puzzleSpec: {}, completed: true, score: 900, moves: 7, pairs: 6, goalsCollected: null, totalGoals: null, movesRemaining: null, startedAt: new Date(), completedAt: new Date(), createdAt: new Date() };
  const records = [{ ...base, id: "1", gameId: "pair-garden", dateKey: "2026-08-09" }, { ...base, id: "2", gameId: "pair-garden", dateKey: "2026-08-10" }, { ...base, id: "3", gameId: "trail-scout", dateKey: "2026-08-10", pairs: null, goalsCollected: 3, totalGoals: 3, movesRemaining: 10 }];
  assert.deepEqual(completionRuns(records), { active: 2, longest: 2, latestDate: "2026-08-10" }); assert.equal(deriveGameStats(records).completionRate, 1); assert.equal(deriveGameStats(records).dailyCompletions, 2); assert.equal(deriveGameAchievements(records).find((item) => item.id === "daily-duo").earned, true);
});

test("account JSON/CSV v4 exports all user-meaningful depth evidence without owner IDs", () => {
  const payload = buildAccountExport({ collections: { ...emptyAccountDataCollections, drinks: [drink], drinkPantry: [{ id: "oat", ownerId: "private-owner", name: "Oat milk" }], drinkPreparations: [{ id: "prep", ownerId: "private-owner", drinkName: "Latte" }], gameSessions: [{ id: "session", ownerId: "private-owner", gameId: "pair-garden" }] }, settings: {}, exportedAt: "2026-08-11T00:00:00Z", timeZone: "UTC", weightUnit: "lb", appVersion: "5.0.0" });
  assert.equal(payload.schemaVersion, "easylife-account-export-v4"); assert.equal(payload.manifest.included.find((entry) => entry.domain === "gameSessions").recordCount, 1); assert.equal(Object.hasOwn(payload.collections.drinks[0], "ownerId"), false); assert.match(serializeDomainCsv("drinkPantry", [{ id: "oat", name: "Oat milk" }]), /Oat milk/); assert.doesNotMatch(serializeDomainCsv("gameSessions", [{ id: "session", ownerId: "private-owner", gameId: "pair-garden" }]), /private-owner/);
});

test("Wave 10.1 routes stay lazy, review-mode-safe, and demo writes remain isolated", async () => {
  assert.equal(withReviewMode("/app/easygames/pair-garden", "?demo=1"), "/app/easygames/pair-garden?demo=1");
  const [router, drinksContext, gamesContext] = await Promise.all([readFile(new URL("../src/app/router/index.tsx", import.meta.url), "utf8"), readFile(new URL("../src/features/easydrinks/EasyDrinksContext.tsx", import.meta.url), "utf8"), readFile(new URL("../src/features/easygames/EasyGamesContext.tsx", import.meta.url), "utf8")]);
  assert.match(router, /GuidedDrinkPage/); assert.match(router, /:drinkId\/prepare/); assert.match(drinksContext, /if \(isDemoMode\)[\s\S]{0,900}setDrinks/); assert.match(gamesContext, /if \(isDemoMode\)[\s\S]{0,500}setSessions/); assert.match(gamesContext, /queueGameSession/);
});
