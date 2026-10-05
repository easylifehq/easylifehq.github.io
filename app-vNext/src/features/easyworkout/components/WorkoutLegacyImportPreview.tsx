import { useMemo, useRef, useState, type ChangeEvent } from "react";
import { PageSection } from "@/components/ui/PageSection";
import {
  LEGACY_IMPORT_MAX_OBSERVATIONS,
  buildLegacyImportPlan,
  previewLegacyDurableImport,
  type StoredLegacyImportRecords,
} from "../domain/legacyWorkoutDurableImport";
import {
  parseLegacyObservationJson,
  type LegacyObservationDocument,
  type LegacyValidationIssue,
} from "../domain/legacyWorkoutObservation";
import { WorkoutLegacyProgressPanel } from "./WorkoutLegacyProgressPanel";
import { WorkoutLegacyStoredHistory, type LegacyRollbackHandler, type LegacyStoredStatus } from "./WorkoutLegacyStoredHistory";

const MAX_LOCAL_FILE_BYTES = 5 * 1024 * 1024;
const MAX_LISTED_CONFLICTS = 5;

export type LegacyConfirmHandler = (document: LegacyObservationDocument) => Promise<{ status: string; created: number; existing: number }>;

type LocalPreviewState = {
  status: "idle" | "reading" | "valid" | "invalid";
  fileName: string;
  document: LegacyObservationDocument | null;
  errors: LegacyValidationIssue[];
  warnings: LegacyValidationIssue[];
};

type ConfirmState =
  | { status: "idle" }
  | { status: "saving" }
  | { status: "saved"; message: string }
  | { status: "failed"; message: string };

const IDLE_CONFIRM: ConfirmState = { status: "idle" };

export function WorkoutLegacyImportPreview({
  initialDocument,
  ownerId = null,
  isDemoMode = false,
  stored = null,
  storedStatus = "idle",
  storedError = "",
  onConfirmImport,
  onRollbackImport,
}: {
  initialDocument?: LegacyObservationDocument;
  ownerId?: string | null;
  isDemoMode?: boolean;
  stored?: StoredLegacyImportRecords | null;
  storedStatus?: LegacyStoredStatus;
  storedError?: string;
  onConfirmImport?: LegacyConfirmHandler;
  onRollbackImport?: LegacyRollbackHandler;
}) {
  const initialState: LocalPreviewState = initialDocument
    ? { status: "valid", fileName: "Synthetic demo fixture", document: initialDocument, errors: [], warnings: [] }
    : { status: "idle", fileName: "", document: null, errors: [], warnings: [] };
  const [preview, setPreview] = useState<LocalPreviewState>(initialState);
  const [confirm, setConfirm] = useState<ConfirmState>(IDLE_CONFIRM);
  const selectionId = useRef(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const canWrite = !isDemoMode && Boolean(ownerId) && typeof onConfirmImport === "function";
  const plan = useMemo(() => (preview.document && ownerId ? buildLegacyImportPlan(ownerId, preview.document) : null), [preview.document, ownerId]);
  const storagePreview = useMemo(
    () => (canWrite && storedStatus === "ready" && stored && plan?.ok ? previewLegacyDurableImport(plan.plan, stored) : null),
    [canWrite, storedStatus, stored, plan],
  );
  const canConfirm = storagePreview?.canConfirm ?? false;
  const busy = confirm.status === "saving";

  async function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    const currentSelection = selectionId.current + 1;
    selectionId.current = currentSelection;
    setConfirm(IDLE_CONFIRM);
    if (!file) return;

    if (file.size > MAX_LOCAL_FILE_BYTES) {
      setPreview({
        status: "invalid",
        fileName: file.name,
        document: null,
        warnings: [],
        errors: [{ path: "", code: "file-size-limit", message: "JSON file must be 5 MiB or smaller." }],
      });
      return;
    }

    setPreview({ status: "reading", fileName: file.name, document: null, errors: [], warnings: [] });
    try {
      const result = parseLegacyObservationJson(await file.text());
      if (selectionId.current !== currentSelection) return;
      setPreview({
        status: result.valid ? "valid" : "invalid",
        fileName: file.name,
        document: result.valid ? result.document : null,
        errors: result.errors,
        warnings: result.warnings,
      });
    } catch {
      if (selectionId.current !== currentSelection) return;
      setPreview({
        status: "invalid",
        fileName: file.name,
        document: null,
        warnings: [],
        errors: [{ path: "", code: "file-read-failed", message: "The selected file could not be read locally." }],
      });
    }
  }

  function clearPreview() {
    selectionId.current += 1;
    if (inputRef.current) inputRef.current.value = "";
    setConfirm(IDLE_CONFIRM);
    setPreview({ status: "idle", fileName: "", document: null, errors: [], warnings: [] });
  }

  async function handleConfirm() {
    if (!canWrite || !canConfirm || !preview.document || !onConfirmImport) return;
    setConfirm({ status: "saving" });
    try {
      const result = await onConfirmImport(preview.document);
      setConfirm({
        status: "saved",
        message: result.created === 0
          ? "Nothing new to save: this import was already stored."
          : `Import saved: ${result.created} new record${result.created === 1 ? "" : "s"} added, ${result.existing} already stored. It now appears under Stored legacy history.`,
      });
    } catch (cause) {
      setConfirm({ status: "failed", message: cause instanceof Error ? cause.message : "unknown error" });
    }
  }

  const stateCopy = storagePreview
    ? {
        new: `Nothing is stored for this source yet. Confirming will add ${storagePreview.counts.new} records.`,
        partial: `${storagePreview.counts.existing} records are already stored and match this file. Confirming will add only the ${storagePreview.counts.new} missing ones.`,
        "already-imported": "This file is already stored exactly as shown. Confirming would write nothing.",
        conflict: `Import blocked: ${storagePreview.conflictCount} stored record${storagePreview.conflictCount === 1 ? " differs" : "s differ"} from this file. Nothing will be written.`,
        "rolled-back": "This source was rolled back earlier and cannot be imported again in this version. Nothing will be written. Use a new source key for a corrected file.",
      }[storagePreview.state]
    : "";

  return (
    <div className="workout-insights-stack legacy-import-stack">
      <PageSection
        headingLevel={2}
        eyebrow="Legacy workout history"
        title="Preview legacy workout JSON"
        description="Choose the extractor JSON from this device. The file is read and checked in this browser tab only. Nothing is uploaded until you confirm an import below; clearing this page removes the local preview."
      >
        <div className="legacy-import-picker">
          <label htmlFor="legacy-workout-json">Legacy workout JSON</label>
          <input
            ref={inputRef}
            id="legacy-workout-json"
            type="file"
            accept=".json,application/json"
            aria-describedby="legacy-workout-json-help"
            onChange={handleFile}
          />
          <p id="legacy-workout-json-help" className="helper-copy">Maximum 5 MiB. Parsing and chart preparation happen only in this browser tab.</p>
          {preview.fileName ? <p className="legacy-import-file">Selected: {preview.fileName}</p> : null}
          {preview.status === "reading" ? <p role="status">Reading locally…</p> : null}
          {preview.document ? <p role="status">Ready: {preview.document.batch.sourceLabel}</p> : null}
          {preview.warnings.length > 0 ? (
            <div className="legacy-import-warnings" role="status">
              <strong>Preview warnings</strong>
              <ul>{preview.warnings.map((warning, index) => <li key={`${warning.path}-${warning.code}-${index}`}>{warning.path || "document"}: {warning.message}</li>)}</ul>
            </div>
          ) : null}
          {preview.errors.length > 0 ? (
            <div className="legacy-import-errors" role="alert">
              <strong>Preview blocked</strong>
              <ul>{preview.errors.map((error, index) => <li key={`${error.path}-${error.code}-${index}`}>{error.path || "document"} [{error.code}]: {error.message}</li>)}</ul>
            </div>
          ) : null}
          {preview.status !== "idle" ? <button type="button" className="button button-secondary" onClick={clearPreview}>Clear local preview</button> : null}
        </div>
      </PageSection>

      {preview.document ? (
        <PageSection
          headingLevel={2}
          eyebrow="Before you save"
          title="Storage preview"
          description="How this file compares with what is already stored in your account. Checking this does not upload anything."
        >
          <div className="legacy-import-picker" data-testid="legacy-storage-preview">
            {isDemoMode ? (
              <p className="helper-copy">Demo mode never saves. This synthetic preview stays on this page and nothing is written anywhere.</p>
            ) : !ownerId ? (
              <p className="helper-copy">Sign in to save this import to your account. Until then the file stays local and nothing is written.</p>
            ) : storedStatus === "error" ? (
              <p role="alert" className="error-copy">Your stored history could not be checked{storedError ? `: ${storedError}` : ""}. Saving is paused so nothing is overwritten.</p>
            ) : plan && !plan.ok ? (
              <p role="alert" className="error-copy">This file cannot be saved: {plan.errors[0]?.message ?? "it is not valid"}.</p>
            ) : !storagePreview ? (
              <p role="status" className="helper-copy">Checking your stored history…</p>
            ) : (
              <>
                <ul className="legacy-import-counts">
                  <li>New records: {storagePreview.counts.new}</li>
                  <li>Already stored: {storagePreview.counts.existing}</li>
                  <li>Conflicts: {storagePreview.counts.conflict}</li>
                </ul>
                <p className="helper-copy">
                  {storagePreview.observationCount} observations and {storagePreview.setCount} sets, plus one batch record and one confirmation receipt ({storagePreview.counts.total} records in all).
                </p>
                <p role="status">{stateCopy}</p>
                {storagePreview.tooLarge ? <p role="alert" className="error-copy">This file is too large to save in one safe, all-or-nothing step. Nothing will be written.</p> : null}
                {storagePreview.conflicts.length > 0 ? (
                  <div className="legacy-import-errors" role="alert">
                    <strong>Conflicting stored records</strong>
                    <ul>
                      {storagePreview.conflicts.slice(0, MAX_LISTED_CONFLICTS).map((conflict) => <li key={`${conflict.kind}-${conflict.id}`}>{conflict.kind}: {conflict.id}</li>)}
                    </ul>
                    {storagePreview.conflictCount > MAX_LISTED_CONFLICTS ? <p className="helper-copy">And {storagePreview.conflictCount - MAX_LISTED_CONFLICTS} more.</p> : null}
                  </div>
                ) : null}
              </>
            )}
            {!isDemoMode ? (
              <>
                <p className="helper-copy">
                  Confirming saves the validated observation records from this file (not the file itself) to your account in one all-or-nothing step and never overwrites anything already stored.
                  A saved import holds at most {LEGACY_IMPORT_MAX_OBSERVATIONS} observations per file; larger files can still be previewed locally but cannot be saved.
                  Planned and ambiguous sets are kept as evidence but stay out of trends. Your workout sessions, statistics and goals are not changed.
                </p>
                <button type="button" className="button" disabled={!canWrite || !canConfirm || busy} onClick={handleConfirm}>
                  Confirm import to my account
                </button>
              </>
            ) : null}
            {confirm.status === "saving" ? <p role="status">Saving to your account…</p> : null}
            {confirm.status === "saved" ? <p role="status">{confirm.message}</p> : null}
            {confirm.status === "failed" ? (
              <p role="alert" className="error-copy">Import failed: {confirm.message}. The import is all-or-nothing; check Stored legacy history before trying again.</p>
            ) : null}
          </div>
        </PageSection>
      ) : null}

      {preview.document ? <WorkoutLegacyProgressPanel document={preview.document} eyebrow={isDemoMode ? "Read-only demo" : "Local preview, not saved"} /> : null}
      {!isDemoMode && ownerId ? <WorkoutLegacyStoredHistory ownerId={ownerId} stored={stored} status={storedStatus} error={storedError} onRollbackImport={onRollbackImport} /> : null}
    </div>
  );
}
