import { useMemo, useState } from "react";
import { PageSection } from "@/components/ui/PageSection";
import { reconstructLegacyImports, type StoredLegacyImportRecords } from "../domain/legacyWorkoutDurableImport";
import { WorkoutLegacyProgressPanel } from "./WorkoutLegacyProgressPanel";

export type LegacyRollbackHandler = (batchId: string) => Promise<{ status: string }>;
export type LegacyStoredStatus = "idle" | "loading" | "ready" | "error";

type Notice = { tone: "success" | "error"; text: string };

export function WorkoutLegacyStoredHistory({ ownerId, stored, status, error, onRollbackImport }: {
  ownerId: string;
  stored: StoredLegacyImportRecords | null;
  status: LegacyStoredStatus;
  error: string;
  onRollbackImport?: LegacyRollbackHandler;
}) {
  const readback = useMemo(() => (stored ? reconstructLegacyImports(ownerId, stored) : null), [ownerId, stored]);
  const [confirming, setConfirming] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);

  async function handleRollback(batchId: string) {
    if (!onRollbackImport) return;
    setBusy(batchId);
    try {
      const result = await onRollbackImport(batchId);
      setNotice({
        tone: "success",
        text: result.status === "already-rolled-back"
          ? "This import was already rolled back."
          : "Import rolled back. It is hidden from progress; the stored records are kept for audit and export.",
      });
    } catch (cause) {
      setNotice({ tone: "error", text: `Rollback did not complete: ${cause instanceof Error ? cause.message : "unknown error"}. Your stored records were not modified.` });
    } finally {
      setBusy(null);
      setConfirming(null);
    }
  }

  if (status === "loading") return <p role="status" className="helper-copy">Loading stored legacy history…</p>;
  if (status === "error") return <p role="alert" className="error-copy">Could not load stored legacy history: {error || "unknown error"}. Importing and rollback are paused.</p>;
  if (!readback) return null;

  const isEmpty = readback.imports.length === 0 && readback.rolledBack.length === 0 && readback.issues.length === 0;

  return (
    <div className="workout-insights-stack legacy-import-stack" data-testid="legacy-stored-history">
      <PageSection
        headingLevel={2}
        eyebrow="Saved to your account"
        title="Stored legacy history"
        description="Imported legacy observations you confirmed earlier. They stay separate from your workout sessions, statistics and goals."
      >
        <div className="legacy-import-picker">
          {notice ? <p role={notice.tone === "error" ? "alert" : "status"} className={notice.tone === "error" ? "error-copy" : "helper-copy"}>{notice.text}</p> : null}
          {isEmpty ? <p className="helper-copy">No legacy history is stored yet.</p> : null}
          {readback.issues.length > 0 ? (
            <div className="legacy-import-errors" role="alert">
              <strong>Withheld from progress</strong>
              <ul>{readback.issues.map((issue) => <li key={issue.batchId}>{issue.batchId.slice(0, 12)} [{issue.code}]: {issue.message}</li>)}</ul>
            </div>
          ) : null}
          {readback.rolledBack.length > 0 ? (
            <div className="legacy-import-warnings">
              <strong>Rolled back</strong>
              <ul>{readback.rolledBack.map((entry) => <li key={entry.batchId}>{entry.sourceLabel ?? entry.batchId.slice(0, 12)}: rolled back and hidden from progress. The records are kept for audit and export.</li>)}</ul>
            </div>
          ) : null}
        </div>
      </PageSection>
      {readback.imports.map((item) => (
        <div key={item.batchId} className="legacy-stored-import" data-batch-id={item.batchId}>
          <div className="legacy-import-picker">
            <p className="legacy-import-file">{item.document.batch.sourceLabel}: {item.observationCount} observations, {item.setCount} sets stored.</p>
            {onRollbackImport ? (
              confirming === item.batchId ? (
                <div role="group" aria-label={`Confirm rollback of ${item.document.batch.sourceLabel}`} className="legacy-import-picker">
                  <p className="helper-copy">
                    Rolling back adds a permanent rollback receipt and hides this import from progress. The imported records stay in your account and exports, and nothing is deleted or edited.
                    It only proceeds if every stored record is still unchanged. In this version a rolled-back source cannot be imported again.
                  </p>
                  <button type="button" className="button" disabled={busy !== null} onClick={() => handleRollback(item.batchId)}>Confirm rollback</button>
                  <button type="button" className="button button-secondary" disabled={busy !== null} onClick={() => setConfirming(null)}>Cancel</button>
                </div>
              ) : (
                <button type="button" className="button button-secondary" disabled={busy !== null} onClick={() => setConfirming(item.batchId)}>Roll back this import</button>
              )
            ) : null}
          </div>
          <WorkoutLegacyProgressPanel document={item.document} eyebrow="Stored legacy history" />
        </div>
      ))}
    </div>
  );
}
