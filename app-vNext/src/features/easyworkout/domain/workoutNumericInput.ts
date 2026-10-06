export const sanitizeWholeNumberInput = (value: string) => value.replace(/\D/g, "");

export const sanitizeDecimalInput = (value: string) => {
  const cleaned = value.replace(/[^\d.]/g, "");
  const [whole = "", ...decimalParts] = cleaned.split(".");
  const decimals = decimalParts.join("");
  return decimalParts.length ? `${whole}.${decimals}` : whole;
};

export const toWholeNumberDraft = (value: string) => {
  if (!value) return 0;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.max(0, Math.floor(parsed)) : 0;
};

export const toDecimalDraft = (value: string) => {
  if (!value) return 0;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.max(0, parsed) : 0;
};

const formatDecimalValue = (value: number) => (value > 0 ? String(value) : "");

/**
 * Keeps the text the user is typing ("7.", "7.50") while it still means the stored number,
 * and falls back to the stored number when it was changed from elsewhere (restore, prefill).
 */
export const reconcileDecimalText = (text: string, value: number) =>
  toDecimalDraft(sanitizeDecimalInput(text)) === value ? text : formatDecimalValue(value);
