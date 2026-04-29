import { Link } from "react-router-dom";

type FeatureCard = {
  title: string;
  description: string;
  tag?: string;
  details?: string[];
};

type HeroPreviewItem = {
  app: string;
  detail: string;
  status?: string;
};

type ProductMarketingPageProps = {
  pageClassName?: string;
  eyebrow: string;
  heroTitle: string;
  heroDescription: string;
  heroPoints: string[];
  heroCardTitle: string;
  heroCardBody: string;
  heroPreviewContext?: string;
  heroPreviewItems?: HeroPreviewItem[];
  featuresTitle: string;
  featuresDescription: string;
  features: FeatureCard[];
  stepsTitle: string;
  steps: FeatureCard[];
  ctaTitle: string;
  ctaBody: string;
  demoPath?: FeatureCard[];
};

export function ProductMarketingPage({
  pageClassName,
  eyebrow,
  heroTitle,
  heroDescription,
  heroPoints,
  heroCardTitle,
  heroCardBody,
  heroPreviewContext,
  heroPreviewItems,
  featuresTitle,
  featuresDescription,
  features,
  stepsTitle,
  steps,
  ctaTitle,
  ctaBody,
  demoPath = [],
}: ProductMarketingPageProps) {
  const pageClass = pageClassName
    ? `marketing-page marketing-page--product ${pageClassName}`
    : "marketing-page marketing-page--product";
  const previewItems = heroPreviewItems ?? [
    { app: "EasyHQ", detail: "Daily pulse" },
    { app: "EasyList", detail: "Brain dumps" },
    { app: "EasyCalendar", detail: "Plan My Day" },
    { app: "EasyNotes", detail: "Draft handoff to EasyList" },
  ];

  return (
    <main className={pageClass}>
      <section id="overview" className="marketing-hero">
        <div className="marketing-hero-copy">
          <p className="eyebrow">{eyebrow}</p>
          <h1>{heroTitle}</h1>
          <p>{heroDescription}</p>

          <div className="marketing-hero-actions">
            <Link to="/login" className="button-primary">
              Start Free
            </Link>
            <a href="#features" className="button-secondary">
              See Features
            </a>
          </div>

          <div className="marketing-points">
            {heroPoints.map((point) => (
              <span key={point} className="info-pill">
                {point}
              </span>
            ))}
          </div>
        </div>

        <div className="marketing-hero-card">
          <div className="marketing-hero-preview-header">
            <span className={heroPreviewContext ? "marketing-hero-preview-context" : "info-pill marketing-hero-preview-product"}>
              {heroPreviewContext ?? eyebrow}
            </span>
            <div>
              <h2>{heroCardTitle}</h2>
              <p>{heroCardBody}</p>
            </div>
          </div>

          <div className="marketing-hero-preview" aria-label={`${eyebrow} daily structure preview`}>
            {previewItems.map((item) => (
              <div key={`${item.app}-${item.detail}`} className="marketing-hero-preview-row">
                <span>{item.app}</span>
                <strong>
                  {item.detail}
                  {item.status ? <em>{item.status}</em> : null}
                </strong>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="marketing-section">
        <div className="panel-header">
          <p className="eyebrow">Features</p>
          <h2>{featuresTitle}</h2>
          <p>{featuresDescription}</p>
        </div>

        <div className="marketing-card-grid">
          {features.map((feature) => (
            <article key={feature.title} className="marketing-card">
              {feature.tag ? <p className="eyebrow">{feature.tag}</p> : null}
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
              {feature.details?.length ? (
                <ul className="marketing-card-details" aria-label={`${feature.title} details`}>
                  {feature.details.map((detail) => (
                    <li key={detail}>{detail}</li>
                  ))}
                </ul>
              ) : null}
            </article>
          ))}
        </div>
      </section>

      <section id={stepsTitle.toLowerCase().includes("plan") ? "planning" : "workflow"} className="marketing-section">
        <div className="panel-header">
          <p className="eyebrow">How It Works</p>
          <h2>{stepsTitle}</h2>
        </div>

        <div className="marketing-card-grid">
          {steps.map((step, index) => (
            <article key={step.title} className="marketing-card">
              <p className="eyebrow">Step {index + 1}</p>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </article>
          ))}
        </div>
      </section>

      {demoPath.length ? (
        <section id="demo" className="marketing-section">
          <div className="panel-header">
            <p className="eyebrow">Demo Path</p>
            <h2>Show this first</h2>
            <p>Use these moments to explain the product without wandering through every setting.</p>
          </div>

          <div className="marketing-demo-list">
            {demoPath.map((item, index) => (
              <article key={item.title} className="marketing-demo-step">
                <span>{index + 1}</span>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      <section id="start" className="marketing-section">
        <div className="marketing-cta-card">
          <div>
            <p className="eyebrow">Get Started</p>
            <h2>{ctaTitle}</h2>
            <p>{ctaBody}</p>
          </div>

          <div className="marketing-hero-actions">
            <Link to="/login" className="button-primary">
              Create Account
            </Link>
            <Link to="/login" className="button-secondary">
              Log In
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
