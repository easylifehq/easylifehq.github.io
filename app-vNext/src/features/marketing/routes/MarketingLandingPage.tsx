import { Link } from "react-router-dom";

const assistantAreas = [
  {
    id: "today",
    href: "/easyhq",
    eyebrow: "Today",
    title: "Start with what needs attention.",
    description:
      "Open to the page that matters, see the shape of your day, and jump into the next useful action.",
  },
  {
    id: "inbox",
    href: "/easylist",
    eyebrow: "Inbox",
    title: "Capture without organizing first.",
    description:
      "Drop the messy thought, task, deadline, or reminder first, then decide what it should become.",
  },
  {
    id: "plan",
    href: "/easycalendar",
    eyebrow: "Plan",
    title: "Turn the day into a realistic shape.",
    description:
      "Separate fixed events, due items, and flexible focus blocks so your day stays readable.",
  },
  {
    id: "notes",
    href: "/easynotes",
    eyebrow: "Notes",
    title: "Keep memory close to action.",
    description:
      "Write quickly, keep context clean, and mark useful lines for task or plan review when you are ready.",
  },
  {
    id: "follow-ups",
    href: "/easypipeline",
    eyebrow: "Follow-ups",
    title: "Keep longer loops from disappearing.",
    description:
      "Keep applications, follow-ups, and career movement organized without muddying the rest of your system.",
  },
  {
    id: "projects",
    href: "/easyprojects",
    eyebrow: "Projects",
    title: "Break bigger goals into next moves.",
    description:
      "Turn rough goals into sections, linked tasks, target dates, and practical next steps.",
  },
  {
    id: "people",
    href: "/easycontacts",
    eyebrow: "People",
    title: "Remember context around people.",
    description:
      "Keep people, context, and follow-up reminders close to the work they support.",
  },
  {
    id: "workout",
    href: "/easyworkout",
    eyebrow: "Workout",
    title: "Keep training out of your head.",
    description:
      "Start Gym Mode, log exercises without fighting the keyboard, and keep routines close.",
  },
  {
    id: "progress",
    href: "/easystatistics",
    eyebrow: "Progress",
    title: "Review patterns without clutter.",
    description:
      "Keep the numbers fun without crowding the pages where you are trying to work.",
  },
];

const demoSteps = [
  {
    title: "Open from the home screen",
    description: "Launch into Today, last-used, or the startup page you picked in Settings.",
  },
  {
    title: "Capture a real life item",
    description: "Add a task, deadline, class, note, or workout without deciding every detail first.",
  },
  {
    title: "Move it when it grows",
    description: "Move it into a plan, project, follow-up, or note only when more structure is useful.",
  },
  {
    title: "Review safely",
    description: "Use exports, reminders, and review-first AI helpers without surprise changes.",
  },
];

export function MarketingLandingPage() {
  return (
    <main className="marketing-page">
      <section className="marketing-hero">
        <div className="marketing-hero-copy">
          <p className="eyebrow">EasyLife</p>
          <h1>One calm assistant for the things you actually have to handle.</h1>
          <p>
            Start with Today, catch loose thoughts in Inbox, shape the day in Plan,
            and keep useful context in Notes without turning life into a dashboard.
          </p>

          <div className="marketing-hero-actions">
            <Link to="/login" className="button-primary">
              Open EasyLife
            </Link>
            <a href="#assistant-map" className="button-secondary">
              See Assistant Flow
            </a>
          </div>

          <div className="marketing-points">
            <span className="info-pill">Today first</span>
            <span className="info-pill">Inbox capture</span>
            <span className="info-pill">Plan the day</span>
            <span className="info-pill">Notes as context</span>
          </div>
        </div>

        <div className="marketing-hero-card">
          <span className="info-pill">Assistant preview</span>
          <p className="marketing-hero-card-title">Built around daily use, not a feature maze.</p>
          <p>
            The first screen stays centered on attention, next moves, capture, and
            the few pieces of context that help you decide what to do.
          </p>
          <div className="marketing-card-metrics">
            <span>Today</span>
            <span>Capture</span>
            <span>Plan</span>
          </div>
        </div>
      </section>

      <section id="assistant-map" className="marketing-section">
        <div className="panel-header">
          <p className="eyebrow">Assistant Map</p>
          <h2>One path, with deeper context when you need it</h2>
          <p>Today stays first. The other areas support the assistant instead of competing with it.</p>
        </div>

        <div className="marketing-card-grid">
          {assistantAreas.map((card) => (
            <article key={card.id} id={card.id} className="marketing-card">
              <p className="eyebrow">{card.eyebrow}</p>
              <h3>{card.title}</h3>
              <p>{card.description}</p>
              <Link to={card.href} className="text-button marketing-inline-link">
                Preview {card.eyebrow}
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
            <h3>1. Capture fast</h3>
            <p>Drop the thought before it disappears. Details can stay hidden until they matter.</p>
          </article>
          <article className="marketing-card">
            <h3>2. Separate the shape</h3>
            <p>Tasks, deadlines, fixed events, notes, and routines each get the right amount of structure.</p>
          </article>
          <article className="marketing-card">
            <h3>3. Keep control</h3>
            <p>Settings keep control visible without implying hidden automation or surprise changes.</p>
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
            <span>Phone first</span>
            <strong>Add it to your home screen, pick your startup page, and get back in quickly.</strong>
          </div>
          <div className="mini-panel-vnext">
            <span>One assistant path</span>
            <strong>Today, Inbox, Plan, and Notes stay connected without turning into a catalog.</strong>
          </div>
          <div className="mini-panel-vnext">
            <span>Safe by design</span>
            <strong>Review-first suggestions keep the user in charge before deeper assistant behavior arrives.</strong>
          </div>
        </div>
      </section>
    </main>
  );
}
