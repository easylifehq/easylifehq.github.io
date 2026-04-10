import { PageSection } from "@/components/ui/PageSection";
import { useEasyPipeline } from "@/features/easypipeline/EasyPipelineContext";

function formatPercent(part: number, whole: number) {
  if (!whole) return "0%";
  return `${Math.round((part / whole) * 100)}%`;
}

export function EasyPipelineStatsPage() {
  const { applications } = useEasyPipeline();
  const total = applications.length;
  const counts = {
    needToApply: applications.filter((application) => application.status === "need_to_apply").length,
    applied: applications.filter((application) => application.status === "applied").length,
    followUp: applications.filter((application) => application.status === "follow_up").length,
    interviewing: applications.filter((application) => application.status === "interviewing").length,
    offer: applications.filter((application) => application.status === "offer").length,
    archived: applications.filter((application) => application.status === "archived").length,
  };
  const responseCount = counts.followUp + counts.interviewing + counts.offer;
  const topCompanies = Object.entries(
    applications.reduce<Record<string, number>>((accumulator, application) => {
      const key = application.company.trim();
      if (!key) return accumulator;
      accumulator[key] = (accumulator[key] || 0) + 1;
      return accumulator;
    }, {})
  )
    .sort((left, right) => right[1] - left[1])
    .slice(0, 5);

  return (
    <>
      <PageSection
        eyebrow="Stats"
        title="Pipeline health"
        description="A simple read on momentum, response rate, and where your search is currently clustering."
      >
        <div className="stats-grid">
          <article className="stat-card-vnext"><span>Total</span><strong>{total}</strong></article>
          <article className="stat-card-vnext"><span>Response rate</span><strong>{formatPercent(responseCount, total)}</strong></article>
          <article className="stat-card-vnext"><span>Offer rate</span><strong>{formatPercent(counts.offer, total)}</strong></article>
          <article className="stat-card-vnext"><span>Archived rate</span><strong>{formatPercent(counts.archived, total)}</strong></article>
        </div>
      </PageSection>

      <div className="dashboard-grid">
        <PageSection eyebrow="Breakdown" title="Stage counts" description="Where applications currently sit across your search.">
          <div className="hq-list">
            <article className="hq-list-card"><strong>Need to Apply</strong><p>{counts.needToApply}</p></article>
            <article className="hq-list-card"><strong>Applied</strong><p>{counts.applied}</p></article>
            <article className="hq-list-card"><strong>Follow Up</strong><p>{counts.followUp}</p></article>
            <article className="hq-list-card"><strong>Interviewing</strong><p>{counts.interviewing}</p></article>
            <article className="hq-list-card"><strong>Offer</strong><p>{counts.offer}</p></article>
            <article className="hq-list-card"><strong>Archived</strong><p>{counts.archived}</p></article>
          </div>
        </PageSection>

        <PageSection eyebrow="Companies" title="Top company volume" description="The employers showing up the most in your search.">
          <div className="hq-list">
            {topCompanies.length ? topCompanies.map(([company, count]) => (
              <article key={company} className="hq-list-card">
                <strong>{company}</strong>
                <p>{count} application{count === 1 ? "" : "s"}</p>
              </article>
            )) : <div className="empty-card-vnext">No company patterns yet.</div>}
          </div>
        </PageSection>
      </div>
    </>
  );
}
