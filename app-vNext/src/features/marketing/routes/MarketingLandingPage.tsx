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

const demoSteps = [
  {
    title: "Start in EasyHQ",
    description: "Open with the daily snapshot, quick entry points, and the core-first setup.",
  },
  {
    title: "Capture a real task",
    description: "Add a task in EasyList, set an urgency, and show how it can move into time.",
  },
  {
    title: "Write a messy note",
    description: "Create a note fast, then turn useful lines into tasks or a project.",
  },
  {
    title: "Show the handoff",
    description: "Send one task to EasyCalendar, EasyProjects, or EasyPipeline to show the suite connection.",
  },
];

export function MarketingLandingPage() {
  return (
    <main className="marketing-page">
      <section className="marketing-hero">
        <div className="marketing-hero-copy">
          <p className="eyebrow">EasyLifeHQ</p>
          <h1>One calm place for tasks, time, notes, and momentum.</h1>
          <p>
            Start with the core: capture what is on your mind, put real work into
            time, and keep notes close enough to turn ideas into action.
          </p>

          <div className="marketing-hero-actions">
            <Link to="/login" className="button-primary">
              Open EasyLifeHQ
            </Link>
            <a href="#products" className="button-secondary">
              Explore Products
            </a>
          </div>

          <div className="marketing-points">
            <span className="info-pill">Fast capture</span>
            <span className="info-pill">Calendar handoffs</span>
            <span className="info-pill">Notes to tasks</span>
            <span className="info-pill">Review-first AI</span>
          </div>
        </div>

        <div className="marketing-hero-card">
          <span className="info-pill">Demo-ready core</span>
          <h2>Show the simple loop first.</h2>
          <p>
            EasyHQ, EasyList, EasyNotes, and EasyCalendar explain the product in
            minutes. Projects, Pipeline, Contacts, Workouts, and Statistics are ready
            when the story needs more depth.
          </p>
          <div className="marketing-card-metrics">
            <span>Capture</span>
            <span>Plan</span>
            <span>Finish</span>
          </div>
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

      <section id="demo-path" className="marketing-section">
        <div className="panel-header">
          <p className="eyebrow">Demo Path</p>
          <h2>A clean walkthrough for a first look</h2>
          <p>Use this path when someone needs to understand the product quickly.</p>
        </div>

        <div className="marketing-demo-list">
          {demoSteps.map((step, index) => (
            <article key={step.title} className="marketing-demo-step">
              <span>{index + 1}</span>
              <div>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </div>
            </article>
          ))}
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
