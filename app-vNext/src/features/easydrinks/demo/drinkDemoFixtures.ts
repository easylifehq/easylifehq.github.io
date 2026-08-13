import { DRINK_SCHEMA_VERSION, type DrinkRecord } from "@/lib/firestore/drinks";

export const drinkDemoFixtures: DrinkRecord[] = [
  {
    id: "demo-oat-latte", ownerId: "local-preview", schemaVersion: DRINK_SCHEMA_VERSION, name: "Maple oat latte", type: "coffee", baseServings: 1,
    ingredients: [
      { id: "espresso", name: "Espresso", amount: "2", unit: "shots", optional: false },
      { id: "oat-milk", name: "Oat milk", amount: "8", unit: "oz", optional: false },
      { id: "maple", name: "Maple syrup", amount: "1", unit: "tsp", optional: false },
      { id: "cinnamon", name: "Cinnamon", amount: "1/4", unit: "tsp", optional: true },
    ],
    steps: [
      { id: "warm", text: "Warm the oat milk gently.", durationSeconds: 120 },
      { id: "combine", text: "Combine with espresso and maple syrup, then stir.", durationSeconds: null },
    ],
    instructions: "Warm the oat milk gently.\nCombine with espresso and maple syrup, then stir.", notes: "Comforting without being too sweet.", rating: 5, tags: ["morning", "warm"], date: "2026-08-08", favorite: true, sourceDrinkId: null, createdAt: new Date("2026-08-08T14:00:00Z"), updatedAt: new Date("2026-08-08T14:00:00Z"),
  },
  {
    id: "demo-citrus-sparkler", ownerId: "local-preview", schemaVersion: DRINK_SCHEMA_VERSION, name: "Citrus garden sparkler", type: "mocktail", baseServings: 2,
    ingredients: [
      { id: "water", name: "Sparkling water", amount: "12", unit: "oz", optional: false },
      { id: "orange", name: "Orange juice", amount: "4", unit: "oz", optional: false },
      { id: "mint", name: "Mint", amount: "8", unit: "leaves", optional: true },
    ],
    steps: [{ id: "build", text: "Build over ice and stir once.", durationSeconds: null }], instructions: "Build over ice and stir once.", notes: "Bright and simple.", rating: 4, tags: ["citrus", "cold"], date: "2026-08-07", favorite: false, sourceDrinkId: null, createdAt: new Date("2026-08-07T20:00:00Z"), updatedAt: new Date("2026-08-07T20:00:00Z"),
  },
  {
    id: "demo-berry-shake", ownerId: "local-preview", schemaVersion: DRINK_SCHEMA_VERSION, name: "Berry recovery shake", type: "protein-shake", baseServings: 1,
    ingredients: [
      { id: "berries", name: "Frozen berries", amount: "1", unit: "cup", optional: false },
      { id: "protein", name: "Protein powder", amount: "1", unit: "scoop", optional: false },
      { id: "milk", name: "Milk or alternative", amount: "8", unit: "oz", optional: false },
    ],
    steps: [{ id: "blend", text: "Blend until smooth.", durationSeconds: 45 }], instructions: "Blend until smooth.", notes: "Add more liquid for a lighter texture.", rating: 4, tags: ["post-workout", "quick"], date: "2026-08-05", favorite: true, sourceDrinkId: null, createdAt: new Date("2026-08-05T22:00:00Z"), updatedAt: new Date("2026-08-05T22:00:00Z"),
  },
];
