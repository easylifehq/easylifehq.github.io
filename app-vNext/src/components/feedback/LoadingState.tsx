export function LoadingState({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="centered-state">
      <div className="loading-card">{label}</div>
    </div>
  );
}
