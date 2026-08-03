import type { ReactNode } from "react";

type PageSectionProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  headingLevel?: 1 | 2;
  children: ReactNode;
};

export function PageSection({
  eyebrow,
  title,
  description,
  headingLevel = 2,
  children,
}: PageSectionProps) {
  return (
    <section className="panel-section">
      <header className="panel-header">
        {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
        {headingLevel === 1 ? <h1>{title}</h1> : <h2>{title}</h2>}
        {description ? <p className="page-section-description">{description}</p> : null}
      </header>
      {children}
    </section>
  );
}
