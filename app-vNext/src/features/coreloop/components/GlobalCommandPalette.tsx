import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useFocusTrap } from "@/lib/a11y/useFocusTrap";
import { useCoreLoopSearch } from "../CoreLoopSearchContext";
import { filterCoreLoopCommands, getSearchPresentationState, isGlobalSearchShortcut, movePaletteIndex, type CoreSearchResult } from "../domain/globalSearch";

function withReviewMode(target: string, currentSearch: string) {
  const [pathname, rawSearch = ""] = target.split("?");
  const next = new URLSearchParams(rawSearch);
  const current = new URLSearchParams(currentSearch);
  ["demo", "visualQa"].forEach((key) => {
    if (current.get(key) === "1" && !next.has(key)) next.set(key, "1");
  });
  const search = next.toString();
  return `${pathname}${search ? `?${search}` : ""}`;
}

function HighlightedText({ text, query }: { text: string; query: string }) {
  const terms = query.trim().split(/\s+/).filter(Boolean).map((term) => term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  if (!terms.length) return <>{text}</>;
  const expression = new RegExp(`(${terms.join("|")})`, "ig");
  return <>{text.split(expression).map((part, index) => index % 2 === 1 ? <mark key={`${part}-${index}`}>{part}</mark> : part)}</>;
}

export function GlobalCommandPalette() {
  const navigate = useNavigate();
  const location = useLocation();
  const { search, isLoading, errors, isOnline } = useCoreLoopSearch();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const dialogRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const close = useCallback(() => setIsOpen(false), []);
  useFocusTrap(isOpen, dialogRef, { initialFocusRef: inputRef, onEscape: close });

  useEffect(() => {
    const open = () => {
      setQuery("");
      setActiveIndex(0);
      setIsOpen(true);
    };
    const keydown = (event: KeyboardEvent) => {
      if (isGlobalSearchShortcut(event)) {
        event.preventDefault();
        open();
      }
    };
    window.addEventListener("keydown", keydown);
    window.addEventListener("easylife:open-command-palette", open);
    return () => {
      window.removeEventListener("keydown", keydown);
      window.removeEventListener("easylife:open-command-palette", open);
    };
  }, []);

  useEffect(() => close(), [close, location.pathname]);

  const commands = useMemo(() => filterCoreLoopCommands(query), [query]);
  const results = useMemo(() => search(query), [query, search]);
  const flatItems = useMemo(() => [
    ...commands.map((command) => ({ key: `command:${command.id}`, kind: "command" as const, command })),
    ...results.map((result) => ({ key: result.id, kind: "result" as const, result })),
  ], [commands, results]);
  const groupedResults = useMemo(() => results.reduce<Record<string, CoreSearchResult[]>>((groups, result) => {
    groups[result.group] = [...(groups[result.group] || []), result];
    return groups;
  }, {}), [results]);
  const state = getSearchPresentationState({ query, isLoading, errors, isOnline, resultCount: flatItems.length });

  useEffect(() => setActiveIndex(flatItems.length ? 0 : -1), [flatItems.length, query]);

  function activate(index: number) {
    const item = flatItems[index];
    if (!item) return;
    close();
    if (item.kind === "command" && "action" in item.command && item.command.action === "capture") {
      window.setTimeout(() => window.dispatchEvent(new Event("easylife:open-capture")), 0);
      return;
    }
    const target = item.kind === "command" && "to" in item.command ? item.command.to : item.kind === "result" ? item.result.to : "/app/hq";
    navigate(withReviewMode(target, location.search));
  }

  function optionButton(key: string, title: string, detail: string, index: number) {
    return (
      <button
        id={`core-palette-option-${index}`}
        key={key}
        type="button"
        role="option"
        aria-selected={activeIndex === index}
        className={`core-palette-option${activeIndex === index ? " active" : ""}`}
        onMouseEnter={() => setActiveIndex(index)}
        onClick={() => activate(index)}
      >
        <strong><HighlightedText text={title} query={query} /></strong>
        <span><HighlightedText text={detail} query={query} /></span>
      </button>
    );
  }

  if (!isOpen) return null;
  let optionIndex = -1;
  return (
    <div className="core-palette-backdrop" onMouseDown={(event) => event.target === event.currentTarget && close()}>
      <div ref={dialogRef} className="core-palette" role="dialog" aria-modal="true" aria-labelledby="core-palette-title" tabIndex={-1}>
        <div className="core-palette-heading">
          <div><span>Search and commands</span><h2 id="core-palette-title">Find anything in EasyLife</h2></div>
          <button type="button" className="ghost-button compact-button" onClick={close} aria-label="Close search">Close</button>
        </div>
        <label className="core-palette-search">
          <span className="sr-only">Search Notes, People, Projects, Job Applications, Plan items, and Workouts</span>
          <input
            ref={inputRef}
            value={query}
            role="combobox"
            aria-expanded="true"
            aria-controls="core-palette-results"
            aria-activedescendant={activeIndex >= 0 ? `core-palette-option-${activeIndex}` : undefined}
            aria-autocomplete="list"
            placeholder="Search or type a command…"
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "ArrowDown" || event.key === "ArrowUp") {
                event.preventDefault();
                setActiveIndex((current) => movePaletteIndex(current, event.key === "ArrowDown" ? 1 : -1, flatItems.length));
              } else if (event.key === "Enter" && activeIndex >= 0) {
                event.preventDefault();
                activate(activeIndex);
              }
            }}
          />
          <kbd>Esc</kbd>
        </label>
        {state === "offline" ? <p className="core-palette-state" role="status"><strong>Offline.</strong> Search is limited to data already loaded on this device. Navigation and Capture remain available.</p> : null}
        {state === "loading" ? <p className="core-palette-state" role="status">Loading your searchable records… Commands are ready now.</p> : null}
        {state === "partial-error" ? <p className="core-palette-state" role="status"><strong>Some results are unavailable.</strong> Loaded areas and commands still work.</p> : null}
        {state === "empty" ? <p className="core-palette-state" role="status">No matching records. Try a person, project, exercise, or shorter phrase.</p> : null}
        <div id="core-palette-results" className="core-palette-results" role="listbox" aria-label="Search results">
          {commands.length ? (
            <section role="group" aria-labelledby="core-palette-commands">
              <h3 id="core-palette-commands">Commands</h3>
              {commands.map((command) => {
                optionIndex += 1;
                return optionButton(`command:${command.id}`, command.label, command.detail, optionIndex);
              })}
            </section>
          ) : null}
          {Object.entries(groupedResults).map(([group, groupResults]) => (
            <section key={group} role="group" aria-labelledby={`core-palette-group-${group.replace(/\W/g, "-")}`}>
              <h3 id={`core-palette-group-${group.replace(/\W/g, "-")}`}>{group}</h3>
              {groupResults.map((result) => {
                optionIndex += 1;
                return optionButton(result.id, result.title, result.detail, optionIndex);
              })}
            </section>
          ))}
        </div>
        <p className="core-palette-hint"><span>↑↓ move</span><span>Enter open</span><span>Esc close</span></p>
      </div>
    </div>
  );
}
