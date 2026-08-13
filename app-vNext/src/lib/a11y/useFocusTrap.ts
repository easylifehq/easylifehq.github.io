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
    const outsideElements: Array<{ element: HTMLElement; inert: boolean; ariaHidden: string | null }> = [];
    let currentBoundary = activeContainer.parentElement;
    while (currentBoundary?.parentElement) {
      for (const sibling of Array.from(currentBoundary.parentElement.children)) {
        if (!(sibling instanceof HTMLElement) || sibling === currentBoundary || ["SCRIPT", "STYLE", "LINK"].includes(sibling.tagName)) continue;
        outsideElements.push({ element: sibling, inert: sibling.inert, ariaHidden: sibling.getAttribute("aria-hidden") });
        sibling.inert = true;
        sibling.setAttribute("aria-hidden", "true");
      }
      currentBoundary = currentBoundary.parentElement;
    }
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
      outsideElements.forEach(({ element, inert, ariaHidden }) => {
        element.inert = inert;
        if (ariaHidden === null) element.removeAttribute("aria-hidden");
        else element.setAttribute("aria-hidden", ariaHidden);
      });
      const returnTarget = returnFocusRef?.current || previousActiveElement;
      if (returnTarget && document.contains(returnTarget)) {
        window.setTimeout(() => returnTarget.focus(), 0);
      }
    };
  }, [containerRef, initialFocusRef, isActive, onEscape, returnFocusRef]);
}
