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
  const { applications, isLoading, error, addApplication, saveApplication, deleteApplication } =
    useEasyPipeline();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedApplication, setSelectedApplication] = useState<ApplicationRecord | null>(null);
  const [company, setCompany] = useState("");
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState<ApplicationStatus>("need_to_apply");
  const [priority, setPriority] = useState<"high" | "medium" | "low">("medium");
  const [nextFollowUp, setNextFollowUp] = useState("");
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
  const activeApplications = applications.filter((application) => application.status !== "archived").length;
  const interviewCount = applications.filter((application) => application.status === "interviewing").length;
  const newestApplication = applications[0];

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

  async function handleAddApplication(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!company.trim() || !title.trim()) return;

    await addApplication({
      company: company.trim(),
      title: title.trim(),
      status,
      priority,
      offerResponse: "",
      dateApplied: status === "need_to_apply" ? "" : new Date().toISOString().split("T")[0],
      nextFollowUp,
      location: "",
      link: "",
      notes: "",
      contactName: "",
      contactEmail: "",
    });

    setCompany("");
    setTitle("");
    setStatus("need_to_apply");
    setPriority("medium");
    setNextFollowUp("");
  }

  return (
    <>
      <PageSection
        eyebrow="Pipeline"
        title="Track a job"
        description="Add the role now. Details, links, contacts, and drafts can come later."
      >
        {error ? <p className="error-copy">{error}</p> : null}
        <form className="pipeline-command-strip" onSubmit={handleAddApplication}>
          <label className="field-stack">
            <span>Company</span>
            <input value={company} onChange={(event) => setCompany(event.target.value)} placeholder="Company" />
          </label>
          <label className="field-stack">
            <span>Role</span>
            <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Role" />
          </label>
          <label className="field-stack">
            <span>Status</span>
            <select value={status} onChange={(event) => setStatus(event.target.value as ApplicationStatus)}>
              {statusOrder.filter((entry) => entry.key !== "archived").map((entry) => (
                <option key={entry.key} value={entry.key}>{entry.label}</option>
              ))}
            </select>
          </label>
          <label className="field-stack">
            <span>Priority</span>
            <select value={priority} onChange={(event) => setPriority(event.target.value as "high" | "medium" | "low")}>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </label>
          <label className="field-stack">
            <span>Follow-up</span>
            <input type="date" value={nextFollowUp} onChange={(event) => setNextFollowUp(event.target.value)} />
          </label>
          <button type="submit" className="primary-button" disabled={!company.trim() || !title.trim()}>
            Add
          </button>
        </form>
        <div className="pipeline-focus-strip" aria-label="Pipeline snapshot">
          <span><strong>{followUpsDue}</strong> due</span>
          <span><strong>{interviewCount}</strong> interviewing</span>
          <span><strong>{activeApplications}</strong> active</span>
          <span>{newestApplication ? `Newest: ${newestApplication.company || newestApplication.title}` : "No roles yet"}</span>
        </div>
      </PageSection>

      <PageSection eyebrow="Board" title="Status lanes">
        {isLoading ? <p className="helper-copy">Loading applications...</p> : null}

        <div className="pipeline-board-grid pipeline-board-focused">
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
