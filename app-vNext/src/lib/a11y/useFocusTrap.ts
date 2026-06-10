import { useEffect, type RefObject } from "react";

type FocusTrapOptions = {
  initialFocusRef?: RefObject<HTMLElement>;
  returnFocusRef?: RefObject<HTMLElement>;
  onEscape?: () => void;
};

const focusableSelector = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "summary",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

function getFocusableElements(container: HTMLElement) {
  return Array.from(container.querySelectorAll<HTMLElement>(focusableSelector)).filter(
    (element) => !element.hasAttribute("disabled") && element.getAttribute("aria-hidden") !== "true"
  );
}

export function useFocusTrap(
  isActive: boolean,
  containerRef: RefObject<HTMLElement>,
  { initialFocusRef, returnFocusRef, onEscape }: FocusTrapOptions = {}
) {
  useEffect(() => {
    if (!isActive) return;

    const container = containerRef.current;
    if (!container) return;
    const activeContainer = container;

    const previousActiveElement = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const focusTarget = initialFocusRef?.current || getFocusableElements(activeContainer)[0] || activeContainer;
    window.setTimeout(() => focusTarget.focus(), 0);

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onEscape?.();
        return;
      }

      if (event.key !== "Tab") return;

      const focusableElements = getFocusableElements(activeContainer);
      if (!focusableElements.length) {
        event.preventDefault();
        activeContainer.focus();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      const activeElement = document.activeElement;

      if (event.shiftKey && activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
        return;
      }

      if (!event.shiftKey && activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      const returnTarget = returnFocusRef?.current || previousActiveElement;
      if (returnTarget && document.contains(returnTarget)) {
        window.setTimeout(() => returnTarget.focus(), 0);
      }
    };
  }, [containerRef, initialFocusRef, isActive, onEscape, returnFocusRef]);
}
