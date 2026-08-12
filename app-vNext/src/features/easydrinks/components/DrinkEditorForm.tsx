import { useState, type FormEvent } from "react";
import { createLocalId, drinkTypeLabels, normalizeDrinkDraft } from "@/features/easydrinks/domain/drinks";
import { drinkTypes, type DrinkDraft } from "@/lib/firestore/drinks";

type DrinkEditorFormProps = { initialDraft: DrinkDraft; submitLabel: string; onSubmit: (draft: DrinkDraft) => Promise<void>; onCancel?: () => void; };

export function DrinkEditorForm({ initialDraft, submitLabel, onSubmit, onCancel }: DrinkEditorFormProps) {
  const [draft, setDraft] = useState(initialDraft);
  const [tagsText, setTagsText] = useState(initialDraft.tags.join(", "));
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");

  function updateIngredient(index: number, updates: Partial<DrinkDraft["ingredients"][number]>) { setDraft((current) => ({ ...current, ingredients: current.ingredients.map((ingredient, itemIndex) => itemIndex === index ? { ...ingredient, ...updates } : ingredient) })); }
  function updateStep(index: number, updates: Partial<DrinkDraft["steps"][number]>) { setDraft((current) => ({ ...current, steps: current.steps.map((step, itemIndex) => itemIndex === index ? { ...step, ...updates } : step) })); }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setMessage("");
    const normalized = normalizeDrinkDraft({ ...draft, tags: tagsText.split(",") });
    if (!normalized.name) { setMessage("Add a drink name before saving."); return; }
    setIsSaving(true);
    try { await onSubmit(normalized); } catch (error) { setMessage(error instanceof Error ? error.message : "The drink could not be saved."); } finally { setIsSaving(false); }
  }

  return (
    <form className="drink-editor" onSubmit={handleSubmit}>
      <div className="drink-editor-primary">
        <label className="field-stack"><span>Drink name</span><input required maxLength={300} value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} placeholder="Maple oat latte" autoFocus /></label>
        <label className="field-stack"><span>Type</span><select value={draft.type} onChange={(event) => setDraft({ ...draft, type: event.target.value as DrinkDraft["type"] })}>{drinkTypes.map((type) => <option key={type} value={type}>{drinkTypeLabels[type]}</option>)}</select></label>
        <label className="field-stack"><span>Base servings</span><input required type="number" min={1} max={100} value={draft.baseServings} onChange={(event) => setDraft({ ...draft, baseServings: Number(event.target.value) })} /><small>Scaling uses this number without converting units.</small></label>
        <label className="field-stack"><span>Date</span><input required type="date" value={draft.date} onChange={(event) => setDraft({ ...draft, date: event.target.value })} /></label>
        <label className="field-stack"><span>Rating</span><select value={draft.rating} onChange={(event) => setDraft({ ...draft, rating: Number(event.target.value) })}><option value={0}>Not rated</option>{[1, 2, 3, 4, 5].map((rating) => <option key={rating} value={rating}>{rating} / 5</option>)}</select></label>
      </div>

      <fieldset className="drink-ingredients">
        <legend>Ingredients</legend>
        <p className="helper-copy">Mark true extras optional. Amounts stay as written unless they are a plain number or fraction.</p>
        {draft.ingredients.map((ingredient, index) => (
          <div className="drink-ingredient-row" key={ingredient.id}>
            <label className="field-stack"><span>Ingredient {index + 1}</span><input maxLength={200} value={ingredient.name} onChange={(event) => updateIngredient(index, { name: event.target.value })} placeholder="Oat milk" /></label>
            <label className="field-stack"><span>Amount</span><input maxLength={80} value={ingredient.amount} onChange={(event) => updateIngredient(index, { amount: event.target.value })} placeholder="8" /></label>
            <label className="field-stack"><span>Unit</span><input maxLength={80} value={ingredient.unit} onChange={(event) => updateIngredient(index, { unit: event.target.value })} placeholder="oz" /></label>
            <label className="drink-filter-check"><input type="checkbox" checked={ingredient.optional} onChange={(event) => updateIngredient(index, { optional: event.target.checked })} /> Optional</label>
            <button type="button" className="ghost-button compact-button" disabled={draft.ingredients.length === 1} onClick={() => setDraft({ ...draft, ingredients: draft.ingredients.filter((_, itemIndex) => itemIndex !== index) })}>Remove</button>
          </div>
        ))}
        <button type="button" className="button-secondary compact-button" disabled={draft.ingredients.length >= 40} onClick={() => setDraft({ ...draft, ingredients: [...draft.ingredients, { id: createLocalId("ingredient"), name: "", amount: "", unit: "", optional: false }] })}>Add ingredient</button>
      </fieldset>

      <fieldset className="drink-ingredients">
        <legend>Preparation steps</legend>
        <p className="helper-copy">Timers appear only for durations you enter. No duration is guessed from the instruction text.</p>
        {draft.steps.map((step, index) => (
          <div className="drink-step-row" key={step.id}>
            <label className="field-stack"><span>Step {index + 1}</span><textarea rows={2} maxLength={2_000} value={step.text} onChange={(event) => updateStep(index, { text: event.target.value })} placeholder="Warm the milk gently." /></label>
            <label className="field-stack"><span>Timer seconds <small>Optional</small></span><input type="number" min={1} max={86_400} value={step.durationSeconds ?? ""} onChange={(event) => updateStep(index, { durationSeconds: event.target.value ? Number(event.target.value) : null })} /></label>
            <button type="button" className="ghost-button compact-button" disabled={draft.steps.length === 1} onClick={() => setDraft({ ...draft, steps: draft.steps.filter((_, itemIndex) => itemIndex !== index) })}>Remove</button>
          </div>
        ))}
        <button type="button" className="button-secondary compact-button" disabled={draft.steps.length >= 40} onClick={() => setDraft({ ...draft, steps: [...draft.steps, { id: createLocalId("step"), text: "", durationSeconds: null }] })}>Add step</button>
      </fieldset>

      <div className="drink-editor-notes"><label className="field-stack"><span>Notes <small>Optional</small></span><textarea rows={4} maxLength={20_000} value={draft.notes} onChange={(event) => setDraft({ ...draft, notes: event.target.value })} placeholder="What worked or what to change." /></label><label className="field-stack"><span>Tags <small>Comma separated</small></span><input value={tagsText} onChange={(event) => setTagsText(event.target.value)} placeholder="morning, warm, quick" /></label></div>
      <label className="settings-toggle-row drink-favorite-toggle"><input type="checkbox" checked={draft.favorite} onChange={(event) => setDraft({ ...draft, favorite: event.target.checked })} /><span><strong>Favorite</strong><small>Keep this drink easy to find.</small></span></label>
      {message ? <p className="error-copy" role="alert">{message}</p> : null}
      <div className="button-row drink-editor-actions"><button className="button-primary" disabled={isSaving}>{isSaving ? "Saving…" : submitLabel}</button>{onCancel ? <button type="button" className="button-secondary" onClick={onCancel}>Cancel</button> : null}</div>
    </form>
  );
}
