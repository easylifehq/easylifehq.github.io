export const AUDIT_PAGES_PROJECT_HOSTNAME = "easylife-wave10-1-audit.pages.dev";

const loopbackHostnames = new Set(["localhost", "127.0.0.1", "[::1]", "::1"]);
const pagesPreviewLabel = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/;

export type ReviewRuntimeMode = "none" | "loopback-demo" | "audit";

export function normalizeRuntimeHostname(hostname: string) {
  if (typeof hostname !== "string" || !hostname || hostname.trim() !== hostname) return null;
  const normalized = hostname.toLocaleLowerCase("en-US");
  if (normalized.endsWith(".")) return null;
  return normalized;
}

export function isLoopbackRuntimeHostname(hostname: string) {
  const normalized = normalizeRuntimeHostname(hostname);
  return normalized ? loopbackHostnames.has(normalized) : false;
}

export function isAuditPagesHostname(hostname: string) {
  const normalized = normalizeRuntimeHostname(hostname);
  if (!normalized) return false;
  if (normalized === AUDIT_PAGES_PROJECT_HOSTNAME) return true;

  const suffix = `.${AUDIT_PAGES_PROJECT_HOSTNAME}`;
  if (!normalized.endsWith(suffix)) return false;

  const deploymentLabel = normalized.slice(0, -suffix.length);
  return pagesPreviewLabel.test(deploymentLabel);
}

function hasExplicitLoopbackReviewQuery(search: string) {
  const params = new URLSearchParams(search);
  return params.get("demo") === "1" || params.get("visualQa") === "1";
}

export function resolveReviewRuntimeMode(input: { hostname: string; search: string }): ReviewRuntimeMode {
  if (isAuditPagesHostname(input.hostname)) return "audit";
  if (isLoopbackRuntimeHostname(input.hostname) && hasExplicitLoopbackReviewQuery(input.search)) {
    return "loopback-demo";
  }
  return "none";
}
