export type FirestoreRuntimeTarget =
  | { kind: "configured-project" }
  | { kind: "emulator"; host: "127.0.0.1"; port: number; reason: "explicit-test" | "loopback-demo" };

const loopbackHosts = new Set(["localhost", "127.0.0.1", "[::1]", "::1"]);

function parseLoopbackEmulatorHost(value: string) {
  const [host, portText] = value.trim().split(":");
  const port = Number(portText);
  if (!loopbackHosts.has(host) || !Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("Firestore emulator host must be an explicit loopback host and valid port.");
  }
  return { host: "127.0.0.1" as const, port };
}

export function resolveFirestoreRuntimeTarget(input: {
  hostname: string;
  search: string;
  explicitEmulatorHost?: string;
}): FirestoreRuntimeTarget {
  if (input.explicitEmulatorHost) {
    return { kind: "emulator", ...parseLoopbackEmulatorHost(input.explicitEmulatorHost), reason: "explicit-test" };
  }

  const isLoopback = loopbackHosts.has(input.hostname);
  const params = new URLSearchParams(input.search);
  const isLocalReview = params.get("demo") === "1" || params.get("visualQa") === "1";
  if (isLoopback && isLocalReview) {
    return { kind: "emulator", host: "127.0.0.1", port: 8088, reason: "loopback-demo" };
  }

  return { kind: "configured-project" };
}
