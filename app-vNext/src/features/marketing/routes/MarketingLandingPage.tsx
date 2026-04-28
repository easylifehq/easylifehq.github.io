import { Link } from "react-router-dom";

const productCards = [
  {
    id: "easyhq",
    href: "/easyhq",
    eyebrow: "EasyHQ",
    title: "The daily workspace.",
    description:
      "Open to the page that matters, see the shape of your day, and jump into the next useful action.",
  },
  {
    id: "easylist",
    href: "/easylist",
    eyebrow: "EasyList",
    title: "Tasks, deadlines, and quick lists.",
    description:
      "Capture anything from burritos to exam prep, then add urgency, notes, deadlines, or calendar time only when needed.",
  },
  {
    id: "easycalendar",
    href: "/easycalendar",
    eyebrow: "EasyCalendar",
    title: "The Google-style time layer.",
    description:
      "Separate fixed events, deadlines, and flexible work blocks so your day stays readable.",
  },
  {
    id: "easynotes",
    href: "/easynotes",
    eyebrow: "EasyNotes",
    title: "Fast notes that can turn into action.",
    description:
      "Write quickly, keep folders clean, and turn useful lines into task drafts when you are ready.",
  },
  {
    id: "easypipeline",
    href: "/easypipeline",
    eyebrow: "EasyPipeline",
    title: "The momentum tracker.",
    description:
      "Keep applications, follow-ups, and career movement organized without muddying the rest of your system.",
  },
  {
    id: "easyprojects",
    href: "/easyprojects",
    eyebrow: "EasyProjects",
    title: "The project planning layer.",
    description:
      "Turn rough goals into sections, linked tasks, target dates, and practical next steps.",
  },
  {
    id: "easycontacts",
    href: "/easycontacts",
    eyebrow: "EasyContacts",
    title: "The relationship memory.",
    description:
      "Keep people, context, and follow-up reminders close to the work they support.",
  },
  {
    id: "easyworkout",
    href: "/easyworkout",
    eyebrow: "EasyWorkout",
    title: "The training logger.",
    description:
      "Start Gym Mode, log exercises without fighting the keyboard, and keep routines close.",
  },
  {
    id: "easystatistics",
    href: "/easystatistics",
    eyebrow: "EasyStatistics",
    title: "The progress room.",
    description:
      "Keep the numbers fun without crowding the pages where you are trying to work.",
  },
];

const demoSteps = [
  {
    title: "Open from the home screen",
    description: "Launch into HQ, last-used, or the startup page you picked in Settings.",
  },
  {
    title: "Capture a real life item",
    description: "Add a task, deadline, class, note, or workout without deciding every detail first.",
  },
  {
    title: "Move it when it grows",
    description: "Send tasks into Calendar, Projects, Pipeline, or Notes when more structure is useful.",
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
          <p className="eyebrow">EasyLifeHQ</p>
          <h1>A clean workspace for the things you actually have to handle.</h1>
          <p>
            Capture the messy stuff fast, separate tasks from deadlines and fixed
            events, then open the app from your phone like it belongs there.
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
            <span className="info-pill">Home-screen ready</span>
            <span className="info-pill">Task vs deadline</span>
            <span className="info-pill">Local reminders</span>
            <span className="info-pill">Review-first AI</span>
          </div>
        </div>

        <div className="marketing-hero-card">
          <span className="info-pill">4.x mobile core</span>
          <h2>Built around daily use, not a settings maze.</h2>
          <p>
            Pick your startup page, add EasyLife to your iPhone home screen, keep
            reminders local, and export your data when you want a safety check.
          </p>
          <div className="marketing-card-metrics">
            <span>Launch</span>
            <span>Capture</span>
            <span>Review</span>
          </div>
        </div>
      </section>

      <section id="products" className="marketing-section">
        <div className="panel-header">
          <p className="eyebrow">Products</p>
          <h2>The EasyLifeHQ suite</h2>
          <p>Each app has a clear job, so the system stays simple as the suite grows.</p>
        </div>

        <div className="marketing-card-grid">
          {productCards.map((card) => (
            <article key={card.id} id={card.id} className="marketing-card">
              <p className="eyebrow">{card.eyebrow}</p>
              <h3>{card.title}</h3>
              <p>{card.description}</p>
              <Link to={card.href} className="text-button marketing-inline-link">
                Learn about {card.eyebrow}
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
            <p>Tasks, deadlines, classes, events, notes, and workouts each get the right amount of structure.</p>
          </article>
          <article className="marketing-card">
            <h3>3. Keep control</h3>
            <p>Reminders, exports, startup pages, visible apps, themes, and AI controls stay in Settings.</p>
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
            <span>Connected ecosystem</span>
            <strong>One login, shared context, and clean switching between the apps that need attention.</strong>
          </div>
          <div className="mini-panel-vnext">
            <span>Safe by design</span>
            <strong>Exports, scoped data, security rules, and review-first AI keep the user in charge.</strong>
          </div>
        </div>
      </section>
    </main>
  );
}
