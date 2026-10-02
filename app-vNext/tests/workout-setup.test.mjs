import test from "node:test";
import assert from "node:assert/strict";

const setupModule = await import("../src/lib/workoutEquipmentSetup.ts").catch(() => ({}));

test("equipment setup normalization trims, bounds, and drops malformed values", () => {
  assert.equal(typeof setupModule.normalizeWorkoutEquipmentSetup, "function");
  assert.deepEqual(setupModule.normalizeWorkoutEquipmentSetup({
    seat: " 2 ",
    arm: "4",
    back: 3,
    pad: " ",
    other: ` cable tower ${"x".repeat(140)} `,
    unknown: "ignored",
  }), {
    seat: "2",
    arm: "4",
    other: `cable tower ${"x".repeat(108)}`,
  });
  assert.deepEqual(setupModule.normalizeWorkoutEquipmentSetup("seat 2"), {});
});

test("setup labels remain compact history rather than advice", () => {
  assert.equal(typeof setupModule.formatWorkoutEquipmentSetup, "function");
  assert.equal(setupModule.formatWorkoutEquipmentSetup({ seat: "2", arm: "4" }), "Seat 2 · Arm 4");
  assert.equal(setupModule.formatWorkoutEquipmentSetup({ back: "3", pad: "low", other: "left tower" }), "Back 3 · Pad low · left tower");
  assert.equal(setupModule.formatWorkoutEquipmentSetup({}), "");
});
