export function workoutSaveFailureMessage(error: unknown): string {
  const code = error && typeof error === "object" && "code" in error ? String(error.code) : "";
  const reason = code.includes("permission-denied") ? "The server denied access. Download a backup before checking your sign-in."
    : code.includes("unauthenticated") ? "Your sign-in needs attention. Download a backup before signing in again."
    : code.includes("unavailable") || code.includes("deadline-exceeded") ? "The server could not be reached. Retry when connected."
    : code.includes("resource-exhausted") ? "The server is busy. Try again shortly."
    : code.includes("invalid-argument") ? "The server rejected the workout format. Download a backup and keep this page open."
    : "Saving was not confirmed. Download a backup and keep this page open before retrying.";
  return `${reason} Draft retained; no confirmed save.`;
}
