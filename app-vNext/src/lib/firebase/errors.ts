export function toSafeFirebaseMessage(error: unknown) {
  const code = typeof error === "object" && error && "code" in error ? String((error as { code?: unknown }).code) : "";

  if (code.includes("permission-denied")) {
    return "You do not have access to that data. Try signing in again.";
  }

  if (code.includes("unauthenticated")) {
    return "Sign in again to keep using EasyLife.";
  }

  if (code.includes("unavailable") || code.includes("deadline-exceeded")) {
    return "EasyLife could not reach the server. Check your connection and try again.";
  }

  if (code.includes("resource-exhausted")) {
    return "EasyLife is getting too many requests right now. Give it a moment and try again.";
  }

  return "EasyLife could not load that data. Try again in a moment.";
}
