import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { PageSection } from "@/components/ui/PageSection";
import { ApplicationDrawer } from "@/features/easypipeline/components/ApplicationDrawer";
import { useEasyPipeline } from "@/features/easypipeline/EasyPipelineContext";
import type { ApplicationRecord, ApplicationStatus } from "@/lib/firestore/applications";

const statusOrder: Array<{ key: ApplicationStatus; label: string }> = [
  { key: "need_to_apply", label: "Need to Apply" },
  { key: "applied", label: "Applied" },
  { key: "follow_up", label: "Follow Up" },
  { key: "interviewing", label: "Interviewing" },
  { key: "offer", label: "Offer" },
  { key: "archived", label: "Archived" },
];

function isFollowUpDue(nextFollowUp: string) {
  if (!nextFollowUp) return false;
  const today = new Date().toISOString().split("T")[0];
  return nextFollowUp <= today;
}

export function EasyPipelineDashboardPage() {
  const { applications, isLoading, error, saveApplication, deleteApplication } =
    useEasyPipeline();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedApplication, setSelectedApplication] = useState<ApplicationRecord | null>(null);
  const applicationParam = searchParams.get("application");
  const grouped = useMemo(
    () =>
      statusOrder.map(({ key, label }) => ({
        key,
        label,
        items: applications.filter((application) => application.status === key),
      })),
    [applications]
  );
  const followUpsDue = applications.filter((application) => isFollowUpDue(application.nextFollowUp)).length;

  useEffect(() => {
    if (!applicationParam) return;
    const matchingApplication = applications.find((application) => application.id === applicationParam);
    if (matchingApplication) {
      setSelectedApplication(matchingApplication);
    }
  }, [applicationParam, applications]);

  function closeApplicationDrawer() {
    setSelectedApplication(null);
    if (!applicationParam) return;
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete("application");
    setSearchParams(nextParams, { replace: true });
  }

  return (
    <>
      <PageSection eyebrow="Pipeline" title="Applications">
        {error ? <p className="error-copy">{error}</p> : null}
        <div className="quiet-metrics-row" aria-label="Pipeline snapshot">
          <span>{applications.length} total</span>
          <span>{followUpsDue} follow-up{followUpsDue === 1 ? "" : "s"} due</span>
        </div>
      </PageSection>

      <PageSection eyebrow="Board" title="Status lanes">
        {isLoading ? <p className="helper-copy">Loading applications...</p> : null}

        <div className="pipeline-board-grid">
          {grouped.map((group) => (
            <section key={group.key} className="pipeline-column">
              <header className="pipeline-column-header">
                <strong>{group.label}</strong>
                <span>{group.items.length}</span>
              </header>

              <div className="pipeline-card-stack">
                {group.items.length ? (
                  group.items.map((application) => (
                    <button
                      key={application.id}
                      type="button"
                      className="pipeline-card"
                      onClick={() => setSelectedApplication(application)}
                    >
                      <div>
                        <strong>{application.title || "Untitled role"}</strong>
                        <p>{application.company || "Unknown company"}</p>
                      </div>
                      <div className="pipeline-card-meta">
                        <span className={`chip-pill priority-${application.priority}`}>{application.priority}</span>
                        {application.nextFollowUp ? <span className="chip-pill">{application.nextFollowUp}</span> : null}
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="empty-card-vnext">Nothing here yet.</div>
                )}
              </div>
            </section>
          ))}
        </div>
      </PageSection>

      <ApplicationDrawer
        application={selectedApplication}
        isOpen={Boolean(selectedApplication)}
        onClose={closeApplicationDrawer}
        onSave={saveApplication}
        onDelete={deleteApplication}
      />
    </>
  );
}
