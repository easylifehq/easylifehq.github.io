import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

type LoadingStateProps = {
  label?: string;
  detail?: string;
  delayedActionLabel?: string;
  delayedActionTo?: string;
  delayedHint?: string;
  delayMs?: number;
};

export function LoadingState({
  label = "Loading...",
  detail = "Opening your workspace.",
  delayedActionLabel,
  delayedActionTo,
  delayedHint = "Taking longer than usual. No changes have been made.",
  delayMs = 7000,
}: LoadingStateProps) {
  const [showDelayedHint, setShowDelayedHint] = useState(false);

  useEffect(() => {
    if (!delayedActionLabel && !delayedActionTo) return undefined;
    const timeoutId = window.setTimeout(() => setShowDelayedHint(true), delayMs);
    return () => window.clearTimeout(timeoutId);
  }, [delayedActionLabel, delayedActionTo, delayMs]);

  return (
    <div className="centered-state">
      <div className="loading-card" role="status" aria-live="polite" aria-busy="true">
        <span className="loading-orbit" aria-hidden="true" />
        <strong>{label}</strong>
        <small>{detail}</small>
        {showDelayedHint ? (
          <div className="loading-slow-hint">
            <span>{delayedHint}</span>
            {delayedActionTo && delayedActionLabel ? (
              <Link className="button-secondary compact-button" to={delayedActionTo}>
                {delayedActionLabel}
              </Link>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
