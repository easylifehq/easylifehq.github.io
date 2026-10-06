import { useState, type InputHTMLAttributes } from "react";
import {
  reconcileDecimalText,
  sanitizeDecimalInput,
  settleDecimalText,
  toDecimalDraft,
} from "@/features/easyworkout/domain/workoutNumericInput";

type DecimalLoadInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "type" | "inputMode"> & {
  value: number;
  onValueChange: (value: number) => void;
};

/** Pound load field that keeps in-progress text such as "7." so fractional loads like 7.5 can be typed. */
export function DecimalLoadInput({ value, onValueChange, onBlur, ...inputProps }: DecimalLoadInputProps) {
  const [text, setText] = useState(() => reconcileDecimalText("", value));
  const shown = reconcileDecimalText(text, value);
  return (
    <input
      {...inputProps}
      type="text"
      inputMode="decimal"
      pattern="[0-9]*[.]?[0-9]*"
      value={shown}
      onChange={(event) => {
        const next = sanitizeDecimalInput(event.target.value);
        setText(next);
        onValueChange(toDecimalDraft(next));
      }}
      onBlur={(event) => {
        setText(settleDecimalText(value));
        onBlur?.(event);
      }}
    />
  );
}
