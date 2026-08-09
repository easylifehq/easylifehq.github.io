import { useState, type FormEvent } from "react";
import { drinkTypeLabels, normalizeDrinkDraft } from "@/features/easydrinks/domain/drinks";
import { drinkTypes, type DrinkDraft } from "@/lib/firestore/drinks";

type DrinkEditorFormProps = {
  initialDraft: DrinkDraft;
  submitLabel: string;
  onSubmit: (draft: DrinkDraft) => Promise<void>;
  onCancel?: () => void;
};

export function DrinkEditorForm({ initialDraft, submitLabel, onSubmit, onCancel }: DrinkEditorFormProps) {
  const [draft, setDraft] = useState(initialDraft);
  const [tagsText, setTagsText] = useState(initialDraft.tags.join(", "));
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");

  function updateIngredient(index: number, field: "name" | "amount" | "unit", value: string) {
    setDraft((current) => ({
      ...current,
      ingredients: current.ingredients.map((ingredient, ingredientIndex) => ingredientIndex === index ? { ...ingredient, [field]: value } : ingredient),
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    const normalized = normalizeDrinkDraft({ ...draft, tags: tagsText.split(",") });
    if (!normalized.name) {
      setMessage("Add a drink name before saving.");
      return;
    }
    setIsSaving(true);
    try {
      await onSubmit(normalized);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "The drink could not be saved.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form className="drink-editor" onSubmit={handleSubmit}>
      <div className="drink-editor-primary">
        <label className="field-stack">
          <span>Drink name</span>
          <input required maxLength={300} value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} placeholder="Maple oat latte" autoFocus />
        </label>
        <label className="field-stack">
          <span>Type</span>
          <select value={draft.type} onChange={(event) => setDraft({ ...draft, type: event.target.value as DrinkDraft["type"] })}>
            {drinkTypes.map((type) => <option key={type} value={type}>{drinkTypeLabels[type]}</option>)}
          </select>
        </label>
        <label className="field-stack">
          <span>Date</span>
          <input required type="date" value={draft.date} onChange={(event) => setDraft({ ...draft, date: event.target.value })} />
        </label>
        <label className="field-stack">
          <span>Rating</span>
          <select value={draft.rating} onChange={(event) => setDraft({ ...draft, rating: Number(event.target.value) })}>
            <option value={0}>Not rated</option>
            {[1, 2, 3, 4, 5].map((rating) => <option key={rating} value={rating}>{rating} / 5</option>)}
          </select>
        </label>
      </div>

      <fieldset className="drink-ingredients">
        <legend>Ingredients</legend>
        <p className="helper-copy">Amounts and units are flexible so the recipe can match how you actually make it.</p>
        {draft.ingredients.map((ingredient, index) => (
          <div className="drink-ingredient-row" key={`${index}-${draft.ingredients.length}`}>
            <label className="field-stack"><span>Ingredient {index + 1}</span><input maxLength={200} value={ingredient.name} onChange={(event) => updateIngredient(index, "name", event.target.value)} placeholder="Oat milk" /></label>
            <label className="field-stack"><span>Amount</span><input maxLength={80} value={ingredient.amount} onChange={(event) => updateIngredient(index, "amount", event.target.value)} placeholder="8" /></label>
            <label className="field-stack"><span>Unit</span><input maxLength={80} value={ingredient.unit} onChange={(event) => updateIngredient(index, "unit", event.target.value)} placeholder="oz" /></label>
            <button type="button" className="ghost-button compact-button" disabled={draft.ingredients.length === 1} onClick={() => setDraft({ ...draft, ingredients: draft.ingredients.filter((_, ingredientIndex) => ingredientIndex !== index) })}>Remove</button>
          </div>
        ))}
        <button type="button" className="button-secondary compact-button" disabled={draft.ingredients.length >= 40} onClick={() => setDraft({ ...draft, ingredients: [...draft.ingredients, { name: "", amount: "", unit: "" }] })}>Add ingredient</button>
      </fieldset>

      <div className="drink-editor-notes">
        <label className="field-stack"><span>Preparation instructions <small>Optional</small></span><textarea rows={4} maxLength={20_000} value={draft.instructions} onChange={(event) => setDraft({ ...draft, instructions: event.target.value })} placeholder="Warm, combine, and stir gently." /></label>
        <label className="field-stack"><span>Notes <small>Optional</small></span><textarea rows={4} maxLength={20_000} value={draft.notes} onChange={(event) => setDraft({ ...draft, notes: event.target.value })} placeholder="What worked, what to change, or when you like it." /></label>
      </div>
      <label className="field-stack"><span>Tags <small>Comma separated</small></span><input value={tagsText} onChange={(event) => setTagsText(event.target.value)} placeholder="morning, warm, quick" /></label>
      <label className="settings-toggle-row drink-favorite-toggle"><input type="checkbox" checked={draft.favorite} onChange={(event) => setDraft({ ...draft, favorite: event.target.checked })} /><span><strong>Favorite</strong><small>Keep this drink easy to find.</small></span></label>
      {message ? <p className="error-copy" role="alert">{message}</p> : null}
      <div className="button-row drink-editor-actions">
        <button className="button-primary" disabled={isSaving}>{isSaving ? "Saving…" : submitLabel}</button>
        {onCancel ? <button type="button" className="button-secondary" onClick={onCancel}>Cancel</button> : null}
      </div>
    </form>
  );
}
