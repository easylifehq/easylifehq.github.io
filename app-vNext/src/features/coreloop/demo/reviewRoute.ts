export function withReviewMode(target: string, currentSearch: string) {
  const hashIndex = target.indexOf("#");
  const hash = hashIndex >= 0 ? target.slice(hashIndex) : "";
  const withoutHash = hashIndex >= 0 ? target.slice(0, hashIndex) : target;
  const queryIndex = withoutHash.indexOf("?");
  const pathname = queryIndex >= 0 ? withoutHash.slice(0, queryIndex) : withoutHash;
  const next = new URLSearchParams(queryIndex >= 0 ? withoutHash.slice(queryIndex + 1) : "");
  const current = new URLSearchParams(currentSearch);

  ["demo", "visualQa", "theme"].forEach((key) => {
    const value = current.get(key);
    if (value && !next.has(key)) next.set(key, value);
  });

  const search = next.toString();
  return `${pathname}${search ? `?${search}` : ""}${hash}`;
}
