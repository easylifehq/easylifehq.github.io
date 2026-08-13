import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { PageSection } from "@/components/ui/PageSection";
import { withReviewMode } from "@/features/coreloop/demo/reviewRoute";
import { useEasyDrinks } from "@/features/easydrinks/EasyDrinksContext";
import { clearGuidedDrink, formatAuthoredDuration, loadGuidedDrink, saveGuidedDrink, type GuidedDrinkState } from "@/features/easydrinks/domain/preparation";
import { scaleIngredient } from "@/features/easydrinks/domain/scaling";

type WakeLockSentinelLike = { release: () => Promise<void>; addEventListener?: (type: "release", listener: () => void) => void; };

export function GuidedDrinkPage() {
  const { drinkId = "" } = useParams();
  const location = useLocation();
  const { drinks, userKey, isLoading, logPreparation, undoPreparation } = useEasyDrinks();
  const drink = drinks.find((item) => item.id === drinkId);
  const [state, setState] = useState<GuidedDrinkState | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [wakeLock, setWakeLock] = useState<WakeLockSentinelLike | null>(null);
  const [message, setMessage] = useState("");
  const [loggedId, setLoggedId] = useState<string | null>(null);

  useEffect(() => {
    if (!drink) return;
    const recovered = loadGuidedDrink(localStorage, userKey, drink);
    setState(recovered || { version: 1, ownerKey: userKey, drinkId: drink.id, recipeUpdatedAt: drink.updatedAt?.toISOString() || null, targetServings: drink.baseServings, stepIndex: 0, completedStepIds: [], timerEndsAt: null, updatedAt: new Date().toISOString() });
    if (recovered) setMessage(recovered.recipeUpdatedAt !== (drink.updatedAt?.toISOString() || null) ? "Recovered your place. The saved recipe has changed, so review this step before continuing." : "Recovered your last preparation step on this device.");
  }, [drink, userKey]);
  useEffect(() => { if (state && !saveGuidedDrink(localStorage, { ...state, updatedAt: new Date().toISOString() })) setMessage("This browser could not save your guided step. Keep this page open while preparing."); }, [state]);
  useEffect(() => {
    if (!state?.timerEndsAt) { setSecondsLeft(0); return; }
    const update = () => setSecondsLeft(Math.max(0, Math.ceil((new Date(state.timerEndsAt || 0).getTime() - Date.now()) / 1000)));
    update(); const interval = window.setInterval(update, 250); return () => window.clearInterval(interval);
  }, [state?.timerEndsAt]);
  useEffect(() => () => { void wakeLock?.release(); }, [wakeLock]);
  useEffect(() => { const releaseWhenHidden = () => { if (document.hidden && wakeLock) { void wakeLock.release(); setWakeLock(null); } }; document.addEventListener("visibilitychange", releaseWhenHidden); return () => document.removeEventListener("visibilitychange", releaseWhenHidden); }, [wakeLock]);

  const scaled = useMemo(() => drink && state ? drink.ingredients.map((ingredient) => scaleIngredient(ingredient, drink.baseServings, state.targetServings)) : [], [drink, state]);
  if (isLoading) return <PageSection title="Opening guided preparation…" headingLevel={1}><div className="empty-state" role="status">Checking for a safe saved step.</div></PageSection>;
  if (!drink) return <PageSection title="Drink not found" headingLevel={1}><Link className="button-secondary" to={withReviewMode("/app/easydrinks", location.search)}>Return to Drinks</Link></PageSection>;
  if (!state) return <PageSection title="Opening guided preparation…" headingLevel={1}><div className="empty-state" role="status">Recovering your saved step on this device.</div></PageSection>;
  const activeDrink = drink;
  const activeState = state;
  const step = activeDrink.steps[activeState.stepIndex];

  async function toggleWakeLock() {
    if (wakeLock) { await wakeLock.release(); setWakeLock(null); setMessage("Screen wake lock released."); return; }
    const manager = (navigator as Navigator & { wakeLock?: { request: (type: "screen") => Promise<WakeLockSentinelLike>; }; }).wakeLock;
    if (!manager) { setMessage("This browser does not offer screen wake lock. Preparation still works normally."); return; }
    try { const sentinel = await manager.request("screen"); sentinel.addEventListener?.("release", () => setWakeLock(null)); setWakeLock(sentinel); setMessage("Screen will stay awake while this page remains visible."); } catch { setMessage("Screen wake lock was not available. Preparation still works normally."); }
  }

  async function finish() {
    const id = await logPreparation({ drinkId: activeDrink.id, drinkName: activeDrink.name, drinkType: activeDrink.type, servings: activeState.targetServings, rating: activeDrink.rating });
    if (id) { clearGuidedDrink(localStorage, userKey, activeDrink.id); setLoggedId(id); setMessage("Preparation logged. You can undo this log below."); }
  }

  function restart() {
    if ((activeState.stepIndex > 0 || activeState.completedStepIds.length) && !window.confirm("Start this preparation over? Your saved step and timer will be replaced.")) return;
    setState({ ...activeState, stepIndex: 0, completedStepIds: [], timerEndsAt: null, recipeUpdatedAt: activeDrink.updatedAt?.toISOString() || null });
  }

  return (
    <PageSection eyebrow="EasyDrinks · Guided preparation" title={drink.name} description="Scale only plain numeric amounts, move one authored step at a time, and recover this preparation on this device." headingLevel={1}>
      <div className="game-toolbar"><Link className="ghost-button compact-button" to={withReviewMode(`/app/easydrinks/${encodeURIComponent(drink.id)}`, location.search)}>Recipe</Link><label className="field-stack compact-field"><span>Servings</span><input type="number" min={1} max={100} value={state.targetServings} onChange={(event) => setState({ ...state, targetServings: Math.max(1, Math.min(100, Number(event.target.value) || 1)) })} /></label><div className="button-row"><button type="button" className="button-secondary compact-button" onClick={() => void toggleWakeLock()}>{wakeLock ? "Allow sleep" : "Keep screen awake"}</button><button type="button" className="button-secondary compact-button" onClick={restart}>Start over</button></div></div>
      {message ? <p className="helper-copy" role="status">{message}</p> : null}
      <div className="guided-drink-grid">
        <section className="guided-step-card" aria-labelledby="guided-step-title">
          <p className="eyebrow">Step {drink.steps.length ? state.stepIndex + 1 : 0} of {drink.steps.length}</p>
          <h2 id="guided-step-title">{step?.text || "No preparation steps were saved."}</h2>
          {step?.durationSeconds ? <div className="guided-timer"><strong>{secondsLeft ? `${Math.floor(secondsLeft / 60)}:${String(secondsLeft % 60).padStart(2, "0")}` : formatAuthoredDuration(step.durationSeconds)}</strong><button type="button" className="button-secondary compact-button" onClick={() => setState({ ...state, timerEndsAt: new Date(Date.now() + step.durationSeconds! * 1_000).toISOString() })}>{secondsLeft ? "Restart timer" : "Start timer"}</button></div> : <p className="helper-copy">No timer was authored for this step.</p>}
          <div className="button-row"><button type="button" className="button-secondary" disabled={state.stepIndex === 0} onClick={() => setState({ ...state, stepIndex: Math.max(0, state.stepIndex - 1), timerEndsAt: null })}>Previous</button>{state.stepIndex < drink.steps.length - 1 ? <button type="button" className="button-primary" onClick={() => setState({ ...state, completedStepIds: step ? [...new Set([...state.completedStepIds, step.id])] : state.completedStepIds, stepIndex: state.stepIndex + 1, timerEndsAt: null })}>Complete step</button> : <button type="button" className="button-primary" disabled={Boolean(loggedId)} onClick={() => void finish()}>{loggedId ? "Preparation logged" : "Finish and log"}</button>}</div>
          {loggedId ? <button type="button" className="ghost-button compact-button" onClick={() => void undoPreparation(loggedId).then(() => { setLoggedId(null); setMessage("Preparation log undone. Your recipe was not changed."); })}>Undo preparation log</button> : null}
        </section>
        <aside className="guided-ingredient-card"><h2>Scaled ingredients</h2><ul>{scaled.map((ingredient) => <li key={ingredient.id}><strong>{ingredient.displayAmount} {ingredient.unit}</strong> {ingredient.name}{ingredient.optional ? " (optional)" : ""}{!ingredient.scaled && ingredient.amount ? <small> · as written</small> : null}</li>)}</ul><p className="helper-copy">EasyLife does not convert units or infer substitutions, nutrition, allergens, or alcohol content.</p></aside>
      </div>
    </PageSection>
  );
}
