import { Link } from "react-router-dom";

const productCards = [
  {
    id: "easyhq",
    eyebrow: "EasyHQ",
    title: "The calm control center.",
    description:
      "See the shape of your day, the next things that matter, and where you still have room.",
  },
  {
    id: "easylist",
    eyebrow: "EasyList",
    title: "The master task system.",
    description:
      "Capture brain dumps, sort priorities, and turn loose thoughts into structured work.",
  },
  {
    id: "easycalendar",
    eyebrow: "EasyCalendar",
    title: "The time system.",
    description:
      "See fixed commitments, flexible task blocks, and the open windows where progress actually fits.",
  },
  {
    id: "easynotes",
    eyebrow: "EasyNotes",
    title: "The thought capture space.",
    description:
      "Write quickly, keep it simple, and turn rough notes into task drafts when you are ready.",
  },
  {
    id: "easypipeline",
    eyebrow: "EasyPipeline",
    title: "The momentum tracker.",
    description:
      "Keep applications, follow-ups, and career movement organized without muddying the rest of your system.",
  },
];

export function MarketingLandingPage() {
  return (
    <main className="marketing-page">
      <section className="marketing-hero">
        <div className="marketing-hero-copy">
          <p className="eyebrow">EasyLifeHQ</p>
          <h1>Turn free time into real progress without making life feel cluttered.</h1>
          <p>
            EasyLifeHQ connects tasks, time, notes, and your daily overview in one
            calm system that stays usable on both desktop and mobile.
          </p>

          <div className="marketing-hero-actions">
            <Link to="/login" className="button-primary">
              Start Free
            </Link>
            <a href="#products" className="button-secondary">
              Explore Products
            </a>
          </div>
        </div>

        <div className="marketing-hero-card">
          <span className="info-pill">Mobile-first where it matters</span>
          <h2>One ecosystem. Clearer days.</h2>
          <p>
            EasyList, EasyCalendar, EasyNotes, EasyPipeline, and EasyHQ each do
            one job well, then stay connected so the whole system still feels simple.
          </p>
        </div>
      </section>

      <section id="products" className="marketing-section">
        <div className="panel-header">
          <p className="eyebrow">Products</p>
          <h2>The core EasyLifeHQ apps</h2>
          <p>Each app has a clear job, so the system stays simple instead of turning into a mess.</p>
        </div>

        <div className="marketing-card-grid">
          {productCards.map((card) => (
            <article key={card.id} id={card.id} className="marketing-card">
              <p className="eyebrow">{card.eyebrow}</p>
              <h3>{card.title}</h3>
              <p>{card.description}</p>
              <Link to={`/${card.id === "easyhq" ? "" : card.id}`} className="text-button marketing-inline-link">
                {card.id === "easyhq" ? "See the system" : `Learn about ${card.eyebrow}`}
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section id="how-it-works" className="marketing-section">
        <div className="panel-header">
          <p className="eyebrow">How It Works</p>
          <h2>A simple loop that actually helps</h2>
        </div>

        <div className="marketing-card-grid">
          <article className="marketing-card">
            <h3>1. Capture it</h3>
            <p>Drop tasks, notes, and rough thoughts into the right app without forcing everything into one giant workspace.</p>
          </article>
          <article className="marketing-card">
            <h3>2. Plan it</h3>
            <p>Use EasyCalendar to place what matters into open time without confusing soft plans with fixed commitments.</p>
          </article>
          <article className="marketing-card">
            <h3>3. Stay connected</h3>
            <p>EasyHQ ties the suite together so you can jump between apps without losing the shape of your day.</p>
          </article>
        </div>
      </section>

      <section id="why-easy" className="marketing-section">
        <div className="panel-header">
          <p className="eyebrow">Why Easy</p>
          <h2>Focused tools instead of feature bloat</h2>
        </div>

        <div className="marketing-highlights">
          <div className="mini-panel-vnext">
            <span>Clear roles</span>
            <strong>Each app has a clear job instead of becoming one bloated all-in-one tool.</strong>
          </div>
          <div className="mini-panel-vnext">
            <span>Connected ecosystem</span>
            <strong>One login, shared context, and fast switching between apps.</strong>
          </div>
          <div className="mini-panel-vnext">
            <span>Calm design</span>
            <strong>Minimal enough to think clearly, warm enough to keep using.</strong>
          </div>
        </div>
      </section>
    </main>
  );
}
