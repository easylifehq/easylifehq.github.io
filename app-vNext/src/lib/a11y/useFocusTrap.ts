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
    function getFocusTarget() {
      const initialFocusTarget = initialFocusRef?.current;
      if (initialFocusTarget && activeContainer.contains(initialFocusTarget)) return initialFocusTarget;
      return getFocusableElements(activeContainer)[0] || activeContainer;
    }

    const focusTimer = window.setTimeout(() => getFocusTarget().focus(), 0);

    function handleFocusIn(event: FocusEvent) {
      if (!(event.target instanceof Node) || activeContainer.contains(event.target)) return;
      getFocusTarget().focus();
    }

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

      if (!activeContainer.contains(activeElement)) {
        event.preventDefault();
        (event.shiftKey ? lastElement : firstElement).focus();
        return;
      }

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

    document.addEventListener("focusin", handleFocusIn);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener("focusin", handleFocusIn);
      document.removeEventListener("keydown", handleKeyDown);
      const returnTarget = returnFocusRef?.current || previousActiveElement;
      if (returnTarget && document.contains(returnTarget)) {
        window.setTimeout(() => returnTarget.focus(), 0);
      }
    };
  }, [containerRef, initialFocusRef, isActive, onEscape, returnFocusRef]);
}
