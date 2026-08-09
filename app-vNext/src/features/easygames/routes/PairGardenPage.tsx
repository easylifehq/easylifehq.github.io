import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { PageSection } from "@/components/ui/PageSection";
import { withReviewMode } from "@/features/coreloop/demo/reviewRoute";
import { useEasyGames } from "@/features/easygames/EasyGamesContext";
import { loadActiveGame, saveActiveGame } from "@/features/easygames/domain/activeGameStorage";
import { createPairGarden, isPairGardenState, pairGardenScore, resolvePairCards, revealPairCard, type PairGardenState } from "@/features/easygames/domain/pairGarden";

const cardKeys = ["q", "w", "e", "r", "a", "s", "d", "f", "z", "x", "c", "v"];
const symbolLabels: Record<string, string> = { sun: "Sun", leaf: "Leaf", drop: "Drop", moon: "Moon", spark: "Spark", stone: "Stone" };
const symbolMarks: Record<string, string> = { sun: "☀", leaf: "⌁", drop: "●", moon: "☾", spark: "✦", stone: "◆" };

export function PairGardenPage() {
  const location = useLocation();
  const { userKey, finishSession, stats } = useEasyGames();
  const [state, setState] = useState<PairGardenState>(() => loadActiveGame(localStorage, userKey, "pair-garden", isPairGardenState) || createPairGarden());
  const score = pairGardenScore(state);
  const stat = stats.find((record) => record.id === "pair-garden");
  const visible = useMemo(() => new Set([...state.revealed, ...state.matched]), [state.matched, state.revealed]);

  useEffect(() => saveActiveGame(localStorage, userKey, "pair-garden", state), [state, userKey]);
  useEffect(() => {
    if (state.revealed.length !== 2 || state.status !== "playing") return;
    const timeout = window.setTimeout(() => setState((current) => resolvePairCards(current)), 520);
    return () => window.clearTimeout(timeout);
  }, [state.revealed, state.status]);
  useEffect(() => {
    if (state.status !== "won" || state.submitted) return;
    let active = true;
    void finishSession("pair-garden", score).then(() => active && setState((current) => ({ ...current, submitted: true })));
    return () => { active = false; };
  }, [finishSession, score, state.status, state.submitted]);
  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey || event.altKey || (event.target instanceof HTMLElement && ["INPUT", "TEXTAREA", "SELECT"].includes(event.target.tagName))) return;
      const index = cardKeys.indexOf(event.key.toLocaleLowerCase());
      if (index >= 0) {
        event.preventDefault();
        setState((current) => revealPairCard(current, index));
      }
      if (event.key.toLocaleLowerCase() === "p") setState((current) => current.status === "playing" ? { ...current, status: "paused" } : current.status === "paused" ? { ...current, status: "playing" } : current);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  return (
    <PageSection eyebrow="EasyGames · Memory" title="Pair Garden" description="Find all six symbol pairs. Fewer turns earn a higher score." headingLevel={1}>
      <div className="game-toolbar"><Link className="ghost-button compact-button" to={withReviewMode("/app/easygames", location.search)}>Game shelf</Link><div className="game-stat-strip"><span><strong>{state.moves}</strong> moves</span><span><strong>{state.matched.length / 2}</strong> / 6 pairs</span><span><strong>{stat?.bestScore || 0}</strong> best</span></div><div className="button-row"><button type="button" className="button-secondary compact-button" disabled={state.status === "won"} onClick={() => setState((current) => current.status === "playing" ? { ...current, status: "paused" } : { ...current, status: "playing" })}>{state.status === "paused" ? "Resume" : "Pause"}</button><button type="button" className="button-secondary compact-button" onClick={() => setState(createPairGarden())}>New game</button></div></div>
      <details className="game-instructions"><summary>How to play</summary><p>Select two cards. A matching pair stays open; otherwise both turn back over. Use touch or pointer, move with Tab and press Enter, or use the letter shown on each card. Press P to pause.</p></details>
      <div className={`pair-garden-board${state.status === "paused" ? " is-paused" : ""}`} aria-label="Pair Garden card board">
        {state.deck.map((symbol, index) => {
          const isVisible = visible.has(index);
          const isMatched = state.matched.includes(index);
          return <button key={`${state.seed}-${index}`} type="button" className={`pair-card${isVisible ? " is-visible" : ""}${isMatched ? " is-matched" : ""}`} disabled={state.status !== "playing" || isMatched || state.revealed.length >= 2} aria-label={isVisible ? `${symbolLabels[symbol]} card${isMatched ? ", matched" : ""}` : `Hidden card ${index + 1}, key ${cardKeys[index].toUpperCase()}`} onClick={() => setState((current) => revealPairCard(current, index))}><kbd>{cardKeys[index].toUpperCase()}</kbd><span aria-hidden="true">{isVisible ? symbolMarks[symbol] : "?"}</span></button>;
        })}
        {state.status === "paused" ? <div className="game-pause-overlay" role="status"><strong>Game paused</strong><button type="button" className="button-primary" onClick={() => setState((current) => ({ ...current, status: "playing" }))}>Resume</button></div> : null}
      </div>
      {state.status === "won" ? <div className="game-result" role="status"><p className="eyebrow">Garden complete</p><h2>{score} points</h2><p>You found every pair in {state.moves} moves. Your durable stats update once for this finished session.</p><button type="button" className="button-primary" onClick={() => setState(createPairGarden())}>Play again</button></div> : <p className="game-live-message" aria-live="polite">{state.revealed.length === 1 ? "Choose one more card." : state.revealed.length === 2 ? "Checking the pair…" : "Choose any two cards."}</p>}
    </PageSection>
  );
}
