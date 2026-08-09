import { Link, useLocation } from "react-router-dom";
import { PageSection } from "@/components/ui/PageSection";
import { useAuth } from "@/features/auth/AuthContext";
import { withReviewMode } from "@/features/coreloop/demo/reviewRoute";
import { useEasyGames } from "@/features/easygames/EasyGamesContext";

const games = [
  { id: "pair-garden" as const, title: "Pair Garden", eyebrow: "Memory · 2–4 minutes", description: "Turn over calm symbol cards and find all six pairs in as few moves as you can.", to: "/app/easygames/pair-garden", controls: "Touch, pointer, Tab + Enter, or Q–V keys" },
  { id: "trail-scout" as const, title: "Trail Scout", eyebrow: "Pathfinding · 1–3 minutes", description: "Guide a tiny scout around stones and collect three trail lights before your moves run out.", to: "/app/easygames/trail-scout", controls: "Touch controls, arrow keys, or WASD" },
];

export function EasyGamesPage() {
  const { isDemoMode } = useAuth();
  const location = useLocation();
  const { stats, isLoading, error } = useEasyGames();
  const sessions = stats.reduce((total, record) => total + record.sessionsPlayed, 0);
  return (
    <PageSection eyebrow="EasyGames" title="Two small games, ready when you are" description="Short, offline-friendly sessions with no ads, purchases, gambling, or endless feeds." headingLevel={1}>
      {isDemoMode ? <div className="demo-data-banner"><strong>Synthetic demo stats</strong><span>Playing updates local preview state only. No production data is written.</span></div> : null}
      {error ? <p className="error-copy" role="alert">{error}</p> : null}
      <div className="games-dashboard-summary" aria-label="Game statistics summary"><span><strong>{isLoading ? "—" : sessions}</strong> sessions played</span><span><strong>{stats.length}</strong> games tried</span><span><strong>Offline</strong> after loading</span></div>
      <div className="game-shelf">
        {games.map((game) => {
          const stat = stats.find((record) => record.id === game.id);
          return (
            <article className={`game-shelf-card game-shelf-card-${game.id}`} key={game.id}>
              <div><p className="eyebrow">{game.eyebrow}</p><h2>{game.title}</h2><p>{game.description}</p></div>
              <dl><div><dt>Best score</dt><dd>{stat?.bestScore || "New"}</dd></div><div><dt>Sessions</dt><dd>{stat?.sessionsPlayed || 0}</dd></div></dl>
              <small>{game.controls}</small>
              <Link className="button-primary" to={withReviewMode(game.to, location.search)}>Play {game.title}</Link>
            </article>
          );
        })}
      </div>
      <aside className="games-calm-note"><strong>Designed for a clean stopping point.</strong><p>Each game has a clear finish, a restart control, and lightweight score history. There are no streak penalties or real-money mechanics.</p></aside>
    </PageSection>
  );
}
