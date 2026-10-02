export const WORKOUT_SETUP_SHORT_MAX_LENGTH = 24;
export const WORKOUT_SETUP_OTHER_MAX_LENGTH = 120;

export type WorkoutEquipmentSetup = {
  seat?: string;
  arm?: string;
  back?: string;
  pad?: string;
  other?: string;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

const boundedText = (value: unknown, maximum: number) => {
  if (typeof value !== "string") return undefined;
  const normalized = value.trim().slice(0, maximum);
  return normalized || undefined;
};

export function normalizeWorkoutEquipmentSetup(value: unknown): WorkoutEquipmentSetup {
  if (!isRecord(value)) return {};
  const setup: WorkoutEquipmentSetup = {
    seat: boundedText(value.seat, WORKOUT_SETUP_SHORT_MAX_LENGTH),
    arm: boundedText(value.arm, WORKOUT_SETUP_SHORT_MAX_LENGTH),
    back: boundedText(value.back, WORKOUT_SETUP_SHORT_MAX_LENGTH),
    pad: boundedText(value.pad, WORKOUT_SETUP_SHORT_MAX_LENGTH),
    other: boundedText(value.other, WORKOUT_SETUP_OTHER_MAX_LENGTH),
  };
  return Object.fromEntries(Object.entries(setup).filter(([, entry]) => entry !== undefined));
}

export function hasWorkoutEquipmentSetup(value: WorkoutEquipmentSetup | null | undefined) {
  return Boolean(value && Object.values(value).some((entry) => Boolean(entry?.trim())));
}

export function formatWorkoutEquipmentSetup(value: WorkoutEquipmentSetup | null | undefined) {
  const setup = normalizeWorkoutEquipmentSetup(value);
  return [
    setup.seat ? `Seat ${setup.seat}` : "",
    setup.arm ? `Arm ${setup.arm}` : "",
    setup.back ? `Back ${setup.back}` : "",
    setup.pad ? `Pad ${setup.pad}` : "",
    setup.other || "",
  ].filter(Boolean).join(" · ");
}
