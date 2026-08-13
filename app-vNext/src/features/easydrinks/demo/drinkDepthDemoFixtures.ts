import { DRINK_PANTRY_SCHEMA_VERSION, type DrinkPantryItem } from "@/lib/firestore/drinkPantry";
import { DRINK_PREPARATION_SCHEMA_VERSION, type DrinkPreparationRecord } from "@/lib/firestore/drinkPreparations";

export const drinkDemoPantry: DrinkPantryItem[] = [
  { id: "demo-pantry-espresso", ownerId: "local-preview", schemaVersion: DRINK_PANTRY_SCHEMA_VERSION, name: "Espresso", canonicalName: "espresso", status: "available", note: "", createdAt: new Date("2026-08-08T12:00:00Z"), updatedAt: new Date("2026-08-08T12:00:00Z") },
  { id: "demo-pantry-oat", ownerId: "local-preview", schemaVersion: DRINK_PANTRY_SCHEMA_VERSION, name: "Oat milk", canonicalName: "oat milk", status: "available", note: "One carton", createdAt: new Date("2026-08-08T12:00:00Z"), updatedAt: new Date("2026-08-08T12:00:00Z") },
  { id: "demo-pantry-maple", ownerId: "local-preview", schemaVersion: DRINK_PANTRY_SCHEMA_VERSION, name: "Maple syrup", canonicalName: "maple syrup", status: "unavailable", note: "", createdAt: new Date("2026-08-08T12:00:00Z"), updatedAt: new Date("2026-08-08T12:00:00Z") },
  { id: "demo-pantry-sparkling", ownerId: "local-preview", schemaVersion: DRINK_PANTRY_SCHEMA_VERSION, name: "Sparkling water", canonicalName: "sparkling water", status: "available", note: "", createdAt: new Date("2026-08-08T12:00:00Z"), updatedAt: new Date("2026-08-08T12:00:00Z") },
];

export const drinkDemoPreparations: DrinkPreparationRecord[] = [
  { id: "demo-prep-2", ownerId: "local-preview", schemaVersion: DRINK_PREPARATION_SCHEMA_VERSION, drinkId: "demo-oat-latte", drinkName: "Maple oat latte", drinkType: "coffee", servings: 1, rating: 5, preparedAt: new Date("2026-08-10T14:00:00Z"), createdAt: new Date("2026-08-10T14:00:00Z") },
  { id: "demo-prep-1", ownerId: "local-preview", schemaVersion: DRINK_PREPARATION_SCHEMA_VERSION, drinkId: "demo-citrus-sparkler", drinkName: "Citrus garden sparkler", drinkType: "mocktail", servings: 2, rating: 4, preparedAt: new Date("2026-08-09T20:00:00Z"), createdAt: new Date("2026-08-09T20:00:00Z") },
];
