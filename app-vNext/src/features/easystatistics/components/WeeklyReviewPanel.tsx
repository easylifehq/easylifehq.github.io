import { Link } from "react-router-dom";
import { PageSection } from "../../../components/ui/PageSection";
import type { WeeklyReview } from "../domain/weeklyReview";
import { WEEKLY_REVIEW_DEMO_VERSION } from "../demo/weeklyReviewDemoFixtures";

const withDemo = (to: string, isDemoMode: boolean) => !isDemoMode ? to : `${to}${to.includes("?") ? "&" : "?"}demo=1`;

export function WeeklyReviewPanel({ review, isDemoMode, isLoading = false, error = "", focusedReviewTo }: { review: WeeklyReview; isDemoMode: boolean; isLoading?: boolean; error?: string; focusedReviewTo?: string }) {
  const lead = review.sections.find((section) => section.id === review.leadSectionId)!;
  return (
    <div className="workout-insights-stack" id="weekly-review">
      {isDemoMode ? <div className="demo-data-banner" role="note"><strong>Demo data</strong><span>{WEEKLY_REVIEW_DEMO_VERSION} · synthetic cross-module review. No Firebase writes.</span></div> : null}
      {error ? <p className="error-copy">Part of My week is unavailable: {error}</p> : null}
      <PageSection eyebrow="My week" title="Recover, decide, then plan" description={`Review window ${review.today} through ${review.reviewThrough}. Nothing is completed, scheduled, sent, or changed from this page.`}>
        {isLoading ? <p role="status">Checking the week…</p> : null}
        <div className="workout-next-move" aria-label="Weekly review starting action">
          <div><span>Start here · {review.formulaVersion}</span><strong>{review.leadTitle}</strong><p>{review.leadDetail}</p><small>One owning module, one deliberate next action.</small></div>
          <Link className="primary-button compact-button" to={withDemo(lead.actionTo, isDemoMode)}>{lead.actionLabel}</Link>
        </div>
      </PageSection>
      {focusedReviewTo ? (
        <div className="focused-review-entry">
          <div><strong>Prefer one decision at a time?</strong><span>The focused queue is optional and preserves your place in this browser.</span></div>
          <Link className="button-secondary compact-button" to={withDemo(focusedReviewTo, isDemoMode)}>Start focused review</Link>
        </div>
      ) : null}
      <div className="statistics-app-grid weekly-review-grid">
        {review.sections.filter((section) => section.id !== review.leadSectionId).map((section) => (
          <PageSection key={section.id} eyebrow={section.eyebrow} title={section.title} description={section.summary}>
            <div className="statistics-progress-list">
              {section.items.length ? section.items.map((item) => <div key={item.id}><span>{item.title}</span><strong>{item.detail}</strong></div>) : <div><span>Clear</span><strong>No recovery action</strong></div>}
            </div>
            <Link className="button-secondary compact-button" to={withDemo(section.actionTo, isDemoMode)}>{section.actionLabel}</Link>
          </PageSection>
        ))}
      </div>
    </div>
  );
}
