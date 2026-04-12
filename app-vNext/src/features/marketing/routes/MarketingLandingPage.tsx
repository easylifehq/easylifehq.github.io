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
  {
    id: "easyprojects",
    eyebrow: "EasyProjects",
    title: "The project planning layer.",
    description:
      "Turn rough goals into sections, linked tasks, target dates, and practical next steps.",
  },
  {
    id: "easycontacts",
    eyebrow: "EasyContacts",
    title: "The relationship memory.",
    description:
      "Keep people, context, and follow-up reminders close to the work they support.",
  },
  {
    id: "easyworkout",
    eyebrow: "EasyWorkout",
    title: "The training tracker.",
    description:
      "Log workouts, reuse routines, and keep gym progress from disappearing between sessions.",
  },
];

export function MarketingLandingPage() {
  return (
    <main className="marketing-page">
      <section className="marketing-hero">
        <div className="marketing-hero-copy">
          <p className="eyebrow">EasyLifeHQ</p>
          <h1>A calmer operating system for real life.</h1>
          <p>
            EasyLifeHQ connects tasks, time, notes, projects, follow-ups, contacts,
            and workouts in one suite that stays soft, fast, and usable.
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
          <span className="info-pill">Smarter without getting loud</span>
          <h2>Start with the core. Add the rest when it helps.</h2>
          <p>
            The first view stays focused on List, Notes, and Calendar. The full suite is
            ready when projects, pipelines, contacts, and workouts need their own space.
          </p>
        </div>
      </section>

      <section id="products" className="marketing-section">
        <div className="panel-header">
          <p className="eyebrow">Products</p>
          <h2>The EasyLifeHQ suite</h2>
          <p>Each app has a clear job, so the system stays simple instead of turning into a mess.</p>
        </div>

        <div className="marketing-card-grid">
          {productCards.map((card) => (
            <article key={card.id} id={card.id} className="marketing-card">
              <p className="eyebrow">{card.eyebrow}</p>
              <h3>{card.title}</h3>
              <p>{card.description}</p>
              {["easyhq", "easylist", "easycalendar", "easynotes", "easypipeline"].includes(card.id) ? (
                <Link to={`/${card.id === "easyhq" ? "" : card.id}`} className="text-button marketing-inline-link">
                  {card.id === "easyhq" ? "See the system" : `Learn about ${card.eyebrow}`}
                </Link>
              ) : (
                <Link to="/login" className="text-button marketing-inline-link">
                  Open {card.eyebrow}
                </Link>
              )}
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
            <p>Use EasyCalendar and EasyProjects to turn rough intent into real time, sections, and next steps.</p>
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
            <span>Core first</span>
            <strong>New accounts start with the essentials, then can turn on more apps when they are useful.</strong>
          </div>
          <div className="mini-panel-vnext">
            <span>Connected ecosystem</span>
            <strong>One login, shared context, and fast switching between the parts of life that need attention.</strong>
          </div>
          <div className="mini-panel-vnext">
            <span>Helpful intelligence</span>
            <strong>AI assists with capture and planning, but the final call stays with the user.</strong>
          </div>
        </div>
      </section>
    </main>
  );
}
