"use client";

import { useEffect, useRef } from "react";

export interface PhysicalKeyHandlers {
  /** Fires once per press (auto-repeat is ignored). */
  onDown: (code: string, event: KeyboardEvent) => void;
  /** Fires on release; callers should ignore keys they never saw go down. */
  onUp: (code: string, event: KeyboardEvent) => void;
  /** Called when the window loses focus or the tab is hidden. */
  onClear?: () => void;
  enabled?: boolean;
}

// The typing test's hidden input is deliberately NOT excluded — it carries
// data-typing-input so keyboards keep mirroring keys while the test listens.
const EDITABLE_SELECTOR =
  "input:not([data-typing-input]), textarea, select, [contenteditable]:not([contenteditable='false'])";

const CONTROL_SELECTOR =
  "a[href], button:not([data-keyboard-key]), [role='button']:not([data-keyboard-key]), [role='switch'], [role='tab'], [role='slider'], [role='menuitem'], [role='radio']";

const MODIFIER_CODES = new Set([
  "Escape",
  "MetaLeft",
  "MetaRight",
  "ControlLeft",
  "ControlRight",
  "AltLeft",
  "AltRight",
  "ShiftLeft",
  "ShiftRight",
  "CapsLock",
  "ContextMenu",
]);

const ACTIVATION_CODES = new Set(["Space", "Enter", "NumpadEnter"]);

/**
 * Plain keys whose browser default is page scrolling. The playground blocks
 * only these — never modifier combos, so ⌘R / ⌘W / Ctrl+T keep working.
 */
const SCROLL_KEYS = new Set([
  "Space",
  "ArrowUp",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "PageUp",
  "PageDown",
]);

export function shouldBlockPageScroll(code: string): boolean {
  return SCROLL_KEYS.has(code);
}

function matches(target: EventTarget | null, selector: string): boolean {
  return target instanceof Element && target.closest(selector) !== null;
}

/**
 * Global physical-key mirroring shared by every keyboard surface.
 *
 * - Never calls preventDefault, so browser/OS shortcuts pass through untouched.
 * - Ignores input focus, IME composition, auto-repeat and modifier combos.
 * - Leaves Space/Enter alone while a UI control (not a keycap) has focus.
 */
export function usePhysicalKeys({
  onDown,
  onUp,
  onClear,
  enabled = true,
}: PhysicalKeyHandlers): void {
  const handlersRef = useRef({ onDown, onUp, onClear });

  useEffect(() => {
    handlersRef.current = { onDown, onUp, onClear };
  }, [onDown, onUp, onClear]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.repeat || event.isComposing) {
        return;
      }

      if (matches(event.target, EDITABLE_SELECTOR)) {
        return;
      }

      const combo =
        event.metaKey || event.ctrlKey || event.altKey;
      if (combo && !MODIFIER_CODES.has(event.code)) {
        return;
      }

      if (
        ACTIVATION_CODES.has(event.code) &&
        matches(event.target, CONTROL_SELECTOR)
      ) {
        return;
      }

      handlersRef.current.onDown(event.code, event);
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.isComposing) {
        return;
      }
      handlersRef.current.onUp(event.code, event);
    };

    const handleClear = () => {
      handlersRef.current.onClear?.();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState !== "visible") {
        handlersRef.current.onClear?.();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("blur", handleClear);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("blur", handleClear);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      // Never leave keys stuck down when the surface unmounts or goes idle.
      handlersRef.current.onClear?.();
    };
  }, [enabled]);
}
