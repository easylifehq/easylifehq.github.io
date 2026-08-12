import { useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { PageSection } from "@/components/ui/PageSection";
import { useAuth } from "@/features/auth/AuthContext";
import { withReviewMode } from "@/features/coreloop/demo/reviewRoute";
import { useEasyGames } from "@/features/easygames/EasyGamesContext";
import { completionRuns, deriveGameAchievements, deriveGameStats } from "@/features/easygames/domain/gameAnalytics";
import { difficultyLabels, utcDateKey } from "@/features/easygames/domain/gameContracts";

const games = [
  { id: "pair-garden" as const, title: "Pair Garden", eyebrow: "Memory · 2–4 minutes", description: "Match 4, 6, or 8 calm symbol pairs. Difficulty changes the board and scoring pressure.", to: "/app/easygames/pair-garden", controls: "Touch, pointer, Tab + Enter, or focused letter keys" },
  { id: "trail-scout" as const, title: "Trail Scout", eyebrow: "Pathfinding · 1–4 minutes", description: "Navigate a validated finite trail. Difficulty changes geometry, goals, and move pressure.", to: "/app/easygames/trail-scout", controls: "Touch controls or focused arrow/WASD keys" },
];

export function EasyGamesPage() {
  const { isDemoMode } = useAuth(); const location = useLocation(); const { stats: legacyStats, sessions, isLoading, error } = useEasyGames(); const allStats = useMemo(() => deriveGameStats(sessions), [sessions]); const runs = useMemo(() => completionRuns(sessions), [sessions]); const achievements = useMemo(() => deriveGameAchievements(sessions), [sessions]); const today = utcDateKey(); const todayGames = new Set(sessions.filter((record) => record.completed && record.dateKey === today).map((record) => record.gameId));
  return (
    <PageSection eyebrow="EasyGames" title="Two small games with honest history" description="Finite free-play and UTC daily sessions, meaningful difficulty, offline recovery, and private evidence-backed statistics." headingLevel={1}>
      {isDemoMode ? <div className="demo-data-banner"><strong>Synthetic demo history</strong><span>Playing updates local preview state only. No production data is written.</span></div> : null}{error ? <p className="error-copy" role="alert">{error}</p> : null}
      <div className="games-dashboard-summary" aria-label="Game statistics summary"><span><strong>{isLoading ? "—" : allStats.sessions}</strong> v2 sessions</span><span><strong>{allStats.completions}</strong> completions</span><span><strong>{Math.round(allStats.completionRate * 100)}%</strong> completion (n={allStats.sessions})</span><span><strong>{runs.active}</strong> active daily run</span><span><strong>{runs.longest}</strong> longest run</span><span><strong>{todayGames.size}/2</strong> UTC dailies today</span></div>
      {legacyStats.length ? <p className="helper-copy">Earlier Wave 10 totals remain visible on each game card as legacy evidence. Difficulty, history, and achievements use only immutable v2 sessions; EasyLife does not fabricate detail from old aggregates.</p> : null}
      <div className="game-shelf">{games.map((game) => { const gameStats = deriveGameStats(sessions, game.id); const legacy = legacyStats.find((record) => record.id === game.id); return <article className={`game-shelf-card game-shelf-card-${game.id}`} key={game.id}><div><p className="eyebrow">{game.eyebrow}</p><h2>{game.title}</h2><p>{game.description}</p></div><dl><div><dt>V2 best</dt><dd>{gameStats.bestScore || "New"}</dd></div><div><dt>V2 finish rate</dt><dd>{Math.round(gameStats.completionRate * 100)}% <small>(n={gameStats.sessions})</small></dd></div><div><dt>Legacy sessions</dt><dd>{legacy?.sessionsPlayed || 0}</dd></div></dl><small>{game.controls}</small><div className="button-row"><Link className="button-primary" to={withReviewMode(game.to, location.search)}>Choose mode and play</Link></div></article>; })}</div>
      <section className="games-history-panel" aria-labelledby="game-achievements-title"><div><p className="eyebrow">Derived, not rewarded</p><h2 id="game-achievements-title">Quiet achievements</h2><p>No currency, leaderboard, or streak penalty—just transparent evidence from private session records.</p></div><div className="achievement-grid">{achievements.map((achievement) => <article className={achievement.earned ? "is-earned" : ""} key={achievement.id}><span aria-hidden="true">{achievement.earned ? "✓" : "○"}</span><div><strong>{achievement.title}</strong><p>{achievement.detail}</p></div></article>)}</div></section>
      <section className="games-history-panel" aria-labelledby="game-history-title"><div><p className="eyebrow">Private evidence</p><h2 id="game-history-title">Recent sessions</h2></div>{!sessions.length ? <div className="empty-state"><strong>No v2 sessions yet.</strong><p>Finish a free or daily game to create the first immutable history record.</p></div> : <div className="game-history-list">{sessions.slice(0, 10).map((record) => <article key={record.id}><div><strong>{record.gameId === "pair-garden" ? "Pair Garden" : "Trail Scout"}</strong><p>{difficultyLabels[record.difficulty]} · {record.mode === "daily" ? `${record.dateKey} UTC daily` : "Free play"} · {record.completed ? "Completed" : "Ended"}</p></div><div><strong>{record.score}</strong><small>{record.moves} moves</small></div></article>)}</div>}</section>
      <aside className="games-calm-note"><strong>Designed for a clean stopping point.</strong><p>Every board is finite. Daily runs end at the latest day you completed and do not punish you for taking today off.</p></aside>
    </PageSection>
  );
}
