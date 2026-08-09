import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { PageSection } from "@/components/ui/PageSection";
import { withReviewMode } from "@/features/coreloop/demo/reviewRoute";
import { useEasyGames } from "@/features/easygames/EasyGamesContext";
import { loadActiveGame, saveActiveGame } from "@/features/easygames/domain/activeGameStorage";
import { createTrailScout, isTrailScoutState, moveTrailScout, trailScoutScore, TRAIL_SIZE, type TrailDirection, type TrailScoutState } from "@/features/easygames/domain/trailScout";

const directionKeys: Record<string, TrailDirection> = { ArrowUp: "up", w: "up", ArrowRight: "right", d: "right", ArrowDown: "down", s: "down", ArrowLeft: "left", a: "left" };

export function TrailScoutPage() {
  const location = useLocation();
  const { userKey, finishSession, stats } = useEasyGames();
  const [state, setState] = useState<TrailScoutState>(() => loadActiveGame(localStorage, userKey, "trail-scout", isTrailScoutState) || createTrailScout());
  const score = trailScoutScore(state);
  const stat = stats.find((record) => record.id === "trail-scout");
  useEffect(() => saveActiveGame(localStorage, userKey, "trail-scout", state), [state, userKey]);
  useEffect(() => {
    if ((state.status !== "won" && state.status !== "lost") || state.submitted) return;
    let active = true;
    void finishSession("trail-scout", score).then(() => active && setState((current) => ({ ...current, submitted: true })));
    return () => { active = false; };
  }, [finishSession, score, state.status, state.submitted]);
  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey || event.altKey || (event.target instanceof HTMLElement && ["INPUT", "TEXTAREA", "SELECT"].includes(event.target.tagName))) return;
      const direction = directionKeys[event.key] || directionKeys[event.key.toLocaleLowerCase()];
      if (direction) {
        event.preventDefault();
        setState((current) => moveTrailScout(current, direction));
      }
      if (event.key.toLocaleLowerCase() === "p") setState((current) => current.status === "playing" ? { ...current, status: "paused" } : current.status === "paused" ? { ...current, status: "playing" } : current);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  function move(direction: TrailDirection) { setState((current) => moveTrailScout(current, direction)); }
  return (
    <PageSection eyebrow="EasyGames · Pathfinding" title="Trail Scout" description="Collect all three trail lights before your 28 moves run out. Stones block the path." headingLevel={1}>
      <div className="game-toolbar"><Link className="ghost-button compact-button" to={withReviewMode("/app/easygames", location.search)}>Game shelf</Link><div className="game-stat-strip"><span><strong>{state.movesRemaining}</strong> moves</span><span><strong>{state.collected}</strong> / 3 lights</span><span><strong>{stat?.bestScore || 0}</strong> best</span></div><div className="button-row"><button type="button" className="button-secondary compact-button" disabled={state.status === "won" || state.status === "lost"} onClick={() => setState((current) => current.status === "playing" ? { ...current, status: "paused" } : { ...current, status: "playing" })}>{state.status === "paused" ? "Resume" : "Pause"}</button><button type="button" className="button-secondary compact-button" onClick={() => setState(createTrailScout())}>New trail</button></div></div>
      <details className="game-instructions"><summary>How to play</summary><p>Move the scout through open squares and collect the three glowing lights. Stones cannot be crossed. Use the on-screen direction pad, arrow keys, or WASD. Press P to pause.</p></details>
      <div className="trail-game-shell">
        <div className={`trail-board${state.status === "paused" ? " is-paused" : ""}`} role="grid" aria-label={`Trail board, ${state.goals.length} lights remaining`} style={{ gridTemplateColumns: `repeat(${TRAIL_SIZE}, 1fr)` }}>
          {Array.from({ length: TRAIL_SIZE * TRAIL_SIZE }, (_, index) => {
            const kind = index === state.player ? "scout" : state.rocks.includes(index) ? "stone" : state.goals.includes(index) ? "light" : "path";
            return <span key={index} role="gridcell" className={`trail-cell trail-cell-${kind}`} aria-label={`Row ${Math.floor(index / TRAIL_SIZE) + 1}, column ${(index % TRAIL_SIZE) + 1}: ${kind}`}><span aria-hidden="true">{kind === "scout" ? "▲" : kind === "stone" ? "◆" : kind === "light" ? "✦" : ""}</span></span>;
          })}
          {state.status === "paused" ? <div className="game-pause-overlay" role="status"><strong>Trail paused</strong><button type="button" className="button-primary" onClick={() => setState((current) => ({ ...current, status: "playing" }))}>Resume</button></div> : null}
        </div>
        <div className="trail-controls" aria-label="Trail movement controls"><button type="button" onClick={() => move("up")} aria-label="Move up">↑</button><button type="button" onClick={() => move("left")} aria-label="Move left">←</button><button type="button" onClick={() => move("down")} aria-label="Move down">↓</button><button type="button" onClick={() => move("right")} aria-label="Move right">→</button></div>
      </div>
      {state.status === "won" || state.status === "lost" ? <div className="game-result" role="status"><p className="eyebrow">{state.status === "won" ? "Trail complete" : "Trail ended"}</p><h2>{score} points</h2><p>{state.status === "won" ? `All lights found with ${state.movesRemaining} moves left.` : `You found ${state.collected} of 3 lights. A new trail is ready whenever you are.`}</p><button type="button" className="button-primary" onClick={() => setState(createTrailScout())}>Start a new trail</button></div> : <p className="game-live-message" aria-live="polite">{state.goals.length} trail light{state.goals.length === 1 ? "" : "s"} still to find.</p>}
    </PageSection>
  );
}
