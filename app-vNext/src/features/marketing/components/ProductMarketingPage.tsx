import { Link } from "react-router-dom";

type FeatureCard = {
  title: string;
  description: string;
  tag?: string;
};

type ProductMarketingPageProps = {
  eyebrow: string;
  heroTitle: string;
  heroDescription: string;
  heroPoints: string[];
  heroCardTitle: string;
  heroCardBody: string;
  featuresTitle: string;
  featuresDescription: string;
  features: FeatureCard[];
  stepsTitle: string;
  steps: FeatureCard[];
  ctaTitle: string;
  ctaBody: string;
};

export function ProductMarketingPage({
  eyebrow,
  heroTitle,
  heroDescription,
  heroPoints,
  heroCardTitle,
  heroCardBody,
  featuresTitle,
  featuresDescription,
  features,
  stepsTitle,
  steps,
  ctaTitle,
  ctaBody,
}: ProductMarketingPageProps) {
  return (
    <main className="marketing-page">
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
          <span className="info-pill">EasyLife product</span>
          <h2>{heroCardTitle}</h2>
          <p>{heroCardBody}</p>
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
