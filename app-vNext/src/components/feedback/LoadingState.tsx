export function LoadingState({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="centered-state">
      <div className="loading-card" role="status" aria-live="polite">
        <span className="loading-orbit" aria-hidden="true" />
        <strong>{label}</strong>
        <small>Opening your workspace.</small>
      </div>
    </div>
  );
}
