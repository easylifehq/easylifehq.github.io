import { useMemo, useState } from "react";
import { PageSection } from "@/components/ui/PageSection";
import { useEasyPipeline } from "@/features/easypipeline/EasyPipelineContext";

function buildFallbackDraft(payload: {
  company: string;
  role: string;
  emailType: string;
  tone: string;
  notes: string;
  customGoal: string;
  extraContext: string;
}) {
  const subject =
    payload.emailType === "thank-you"
      ? `Thank you for the ${payload.role} conversation`
      : payload.emailType === "networking"
        ? `Connecting about ${payload.company}`
        : `Following up on ${payload.role}`;

  const body = [
    "Hi,",
    "",
    `I wanted to follow up regarding ${payload.role} at ${payload.company}.`,
    payload.customGoal || "I'm still very interested and would love to stay in touch.",
    payload.notes ? `Relevant context: ${payload.notes}` : "",
    payload.extraContext || "",
    "",
    payload.tone === "confident"
      ? "I'd be glad to continue the conversation whenever helpful."
      : payload.tone === "concise"
        ? "Thanks again for your time."
        : "Thanks so much for your time and consideration.",
    "",
    "Best,",
    "Spencer",
  ]
    .filter(Boolean)
    .join("\n");

  return { subject, body };
}

export function EasyPipelineEmailPage() {
  const { applications, drafts, saveEmailDraft } = useEasyPipeline();
  const [applicationId, setApplicationId] = useState("");
  const [emailType, setEmailType] = useState("follow-up");
  const [tone, setTone] = useState("professional");
  const [extraContext, setExtraContext] = useState("");
  const [customGoal, setCustomGoal] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const selectedApplication = useMemo(
    () => applications.find((application) => application.id === applicationId) || null,
    [applications, applicationId]
  );

  async function handleGenerate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedApplication) return;

    const generated = buildFallbackDraft({
      company: selectedApplication.company || "the company",
      role: selectedApplication.title || "the role",
      emailType,
      tone,
      notes: selectedApplication.notes,
      customGoal,
      extraContext,
    });

    setSubject(generated.subject);
    setBody(generated.body);
  }

  async function handleSaveDraft() {
    if (!selectedApplication || !subject.trim() || !body.trim()) return;

    await saveEmailDraft({
      subject: subject.trim(),
      body: body.trim(),
      company: selectedApplication.company,
      applicationId: selectedApplication.id,
      emailType,
      tone,
    });
  }

  return (
    <div className="dashboard-grid">
      <PageSection
        eyebrow="Generator"
        title="Email drafts"
        description="Draft follow-ups, thank-yous, and networking notes from saved applications."
      >
        <form className="task-composer" onSubmit={handleGenerate}>
          <label className="field-stack">
            <span>Application</span>
            <select value={applicationId} onChange={(event) => setApplicationId(event.target.value)} required>
              <option value="">Select an application</option>
              {applications.map((application) => (
                <option key={application.id} value={application.id}>
                  {application.company || "Unknown company"} - {application.title || "Untitled role"}
                </option>
              ))}
            </select>
          </label>
          <div className="task-composer-grid">
            <label className="field-stack">
              <span>Email type</span>
              <select value={emailType} onChange={(event) => setEmailType(event.target.value)}>
                <option value="follow-up">Follow up</option>
                <option value="thank-you">Thank you</option>
                <option value="networking">Networking</option>
              </select>
            </label>
            <label className="field-stack">
              <span>Tone</span>
              <select value={tone} onChange={(event) => setTone(event.target.value)}>
                <option value="professional">Professional</option>
                <option value="friendly">Friendly</option>
                <option value="confident">Confident</option>
                <option value="concise">Concise</option>
              </select>
            </label>
          </div>
          <label className="field-stack">
            <span>Custom goal</span>
            <input value={customGoal} onChange={(event) => setCustomGoal(event.target.value)} />
          </label>
          <label className="field-stack">
            <span>Extra context</span>
            <textarea value={extraContext} onChange={(event) => setExtraContext(event.target.value)} rows={4} />
          </label>
          <button type="submit" className="primary-button">
            Generate draft
          </button>
        </form>
      </PageSection>

      <PageSection
        eyebrow="Output"
        title="Draft preview"
        description="Tweak the subject and body, then save it for later."
      >
        <div className="task-composer">
          <label className="field-stack">
            <span>Subject</span>
            <input value={subject} onChange={(event) => setSubject(event.target.value)} />
          </label>
          <label className="field-stack">
            <span>Body</span>
            <textarea value={body} onChange={(event) => setBody(event.target.value)} rows={12} />
          </label>
          <button type="button" className="button-secondary" onClick={() => void handleSaveDraft()}>
            Save draft
          </button>

          <div className="hq-list">
            {drafts.slice(0, 6).map((draft) => (
              <article key={draft.id} className="hq-list-card">
                <strong>{draft.subject || "Untitled draft"}</strong>
                <p>{draft.company || "No company"}</p>
              </article>
            ))}
          </div>
        </div>
      </PageSection>
    </div>
  );
}
