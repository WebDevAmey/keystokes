'use client';

import { cn } from "@/lib/utils";
import { usePhysicalKeys, shouldBlockPageScroll } from "@/hooks/use-physical-keys";
import { SOUND_DEFINES_DOWN, SOUND_DEFINES_UP, keySound } from "@/lib/key-sound";
import {
  IconArrowNarrowLeft,
  IconBrightnessDown,
  IconBrightnessUp,
  IconBulb,
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconChevronUp,
  IconCommand,
  IconFrame,
  IconLayoutDashboard,
  IconMicrophone,
  IconMoon,
  IconPlayerSkipForward,
  IconPlayerTrackNext,
  IconPlayerTrackPrev,
  IconSearch,
  IconVolume,
  IconVolume2,
  IconVolume3,
} from "@tabler/icons-react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  type RefObject,
} from "react";
import { useWebHaptics } from "web-haptics/react";

export { SOUND_DEFINES_DOWN, SOUND_DEFINES_UP };

// -----------------------------------------------------------------------------
// Public API
// -----------------------------------------------------------------------------

export type KeyboardEventSource = "physical" | "pointer";
export type KeyboardEventPhase = "down" | "up";
export type KeyboardThemeName = "classic" | "mint" | "royal" | "dolch" | "sand" | "scarlet";

export interface KeyboardInteractionEvent {
  code: string;
  phase: KeyboardEventPhase;
  source: KeyboardEventSource;
}

export interface KeyboardProps {
  className?: string;
  theme?: KeyboardThemeName;
  enableHaptics?: boolean;
  enableSound?: boolean;
  onKeyEvent?: (event: KeyboardInteractionEvent) => void;
}

export function Keyboard({
  className,
  theme = "classic",
  enableSound = true,
  enableHaptics = true,
  onKeyEvent,
}: KeyboardProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <KeyboardProvider
      containerRef={containerRef}
      theme={theme}
      enableSound={enableSound}
      enableHaptics={enableHaptics}
      onKeyEvent={onKeyEvent}
    >
      <div ref={containerRef} className={cn("inline-block", className)}>
        <KeyboardLayout />
      </div>
    </KeyboardProvider>
  );
}

export default Keyboard;

// -----------------------------------------------------------------------------
// Internal keyboard context
// -----------------------------------------------------------------------------

interface KeyboardContextType {
  themeName: KeyboardThemeName;
  pressedKeys: Set<string>;
  lastPressedKey: string | null;
  triggerPointerHaptic: () => void;
  pressKey: (keyCode: string, source: KeyboardEventSource) => void;
  releaseKey: (keyCode: string, source: KeyboardEventSource) => void;
  releaseAllKeys: (source?: KeyboardEventSource) => void;
}

const KeyboardContext = createContext<KeyboardContextType | null>(null);

function useKeyboardContext() {
  const context = useContext(KeyboardContext);
  if (!context) {
    throw new Error("Keyboard components must be used within KeyboardProvider");
  }
  return context;
}

interface KeyboardProviderProps {
  children: ReactNode;
  containerRef: RefObject<HTMLDivElement | null>;
  theme: KeyboardThemeName;
  enableSound: boolean;
  enableHaptics: boolean;
  onKeyEvent?: (event: KeyboardInteractionEvent) => void;
}

function KeyboardProvider({
  children,
  containerRef,
  theme,
  enableSound,
  enableHaptics,
  onKeyEvent,
}: KeyboardProviderProps) {
  const pressedKeysRef = useRef<Set<string>>(new Set());
  const { trigger } = useWebHaptics();

  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set());
  const [lastPressedKey, setLastPressedKey] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(true);

  // The shared engine owns the AudioContext, decoding and volume, so
  // mounting this keyboard never spins up new audio resources.
  const playSound = useCallback(
    (phase: KeyboardEventPhase, keyCode: string) => {
      if (!enableSound) {
        return;
      }

      const segment =
        phase === "down" ? SOUND_DEFINES_DOWN[keyCode] : SOUND_DEFINES_UP[keyCode];
      if (!segment) {
        return;
      }

      keySound.play(segment);
    },
    [enableSound],
  );

  const emitKeyEvent = useCallback(
    (phase: KeyboardEventPhase, code: string, source: KeyboardEventSource) => {
      onKeyEvent?.({ code, phase, source });
    },
    [onKeyEvent],
  );

  const triggerPointerHaptic = useCallback(() => {
    if (!enableHaptics) {
      return;
    }

    void trigger([
      { duration: 25 },
    ], { intensity: 0.7 })
  }, [enableHaptics, trigger]);

  const pressKey = useCallback(
    (keyCode: string, source: KeyboardEventSource) => {
      if (pressedKeysRef.current.has(keyCode)) {
        return;
      }

      const next = new Set(pressedKeysRef.current);
      next.add(keyCode);
      pressedKeysRef.current = next;
      setPressedKeys(next);

      setLastPressedKey(keyCode);
      playSound("down", keyCode);
      emitKeyEvent("down", keyCode, source);
    },
    [emitKeyEvent, playSound],
  );

  const releaseKey = useCallback(
    (keyCode: string, source: KeyboardEventSource) => {
      if (!pressedKeysRef.current.has(keyCode)) {
        return;
      }

      const next = new Set(pressedKeysRef.current);
      next.delete(keyCode);
      pressedKeysRef.current = next;
      setPressedKeys(next);

      playSound("up", keyCode);
      emitKeyEvent("up", keyCode, source);
    },
    [emitKeyEvent, playSound],
  );

  const releaseAllKeys = useCallback(
    (source: KeyboardEventSource = "physical") => {
      const keysToRelease = Array.from(pressedKeysRef.current);
      if (keysToRelease.length === 0) {
        return;
      }

      pressedKeysRef.current = new Set();
      setPressedKeys(new Set());

      for (const keyCode of keysToRelease) {
        emitKeyEvent("up", keyCode, source);
      }
    },
    [emitKeyEvent],
  );

  // Physical input, blur and visibility handling live in one shared hook.
  usePhysicalKeys({
    enabled: isVisible,
    onDown: (code, event) => {
      if (shouldBlockPageScroll(code)) {
        event.preventDefault();
      }
      pressKey(code, "physical");
    },
    onUp: (code) => {
      releaseKey(code, "physical");
    },
    onClear: () => {
      releaseAllKeys();
    },
  });

  useEffect(() => {
    const element = containerRef.current;
    if (!element || typeof IntersectionObserver === "undefined") {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.1 },
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [containerRef]);

  return (
    <KeyboardContext.Provider
      value={{
        themeName: theme,
        pressedKeys,
        lastPressedKey,
        triggerPointerHaptic,
        pressKey,
        releaseKey,
        releaseAllKeys,
      }}
    >
      {children}
    </KeyboardContext.Provider>
  );
}

// -----------------------------------------------------------------------------
// UI rendering
// -----------------------------------------------------------------------------

function KeyboardLayout() {
  return (
    <div>
      <div className="bg-black/70 border-2 border-black p-3 rounded-[16px] w-fit h-fit">
        <div className="bg-black/80 border border-black rounded-[5px] rounded-t-[8px] h-[278px]">
          <div className="-space-y-1 -translate-y-1 rounded-[5px] overflow-hidden">
            <Row>
              <Key keyCode={KEYCODE.Escape}>
                {"esc"}
              </Key>

              <Key keyCode={KEYCODE.F1}>
                <IconBrightnessDown className="size-[10px]" />
                <span>{"F1"}</span>
              </Key>
              <Key keyCode={KEYCODE.F2}>
                <IconBrightnessUp className="size-[10px]" />
                <span>{"F2"}</span>
              </Key>
              <Key keyCode={KEYCODE.F3}>
                <IconLayoutDashboard className="size-[10px]" />
                <span>{"F3"}</span>
              </Key>
              <Key keyCode={KEYCODE.F4}>
                <IconSearch className="size-[10px]" />
                <span>{"F4"}</span>
              </Key>

              <Key keyCode={KEYCODE.F5}>
                <IconMicrophone className="size-[10px]" />
                <span>{"F5"}</span>
              </Key>
              <Key keyCode={KEYCODE.F6}>
                <IconMoon className="size-[10px]" />
                <span>{"F6"}</span>
              </Key>
              <Key keyCode={KEYCODE.F7}>
                <IconPlayerTrackPrev className="size-[10px]" />
                <span>{"F7"}</span>
              </Key>
              <Key keyCode={KEYCODE.F8}>
                <IconPlayerSkipForward className="size-[10px]" />
                <span>{"F8"}</span>
              </Key>
              <Key keyCode={KEYCODE.F9}>
                <IconPlayerTrackNext className="size-[10px]" />
                <span>{"F9"}</span>
              </Key>

              <Key keyCode={KEYCODE.F10}>
                <IconVolume3 className="size-[10px]" />
                <span>{"F10"}</span>
              </Key>
              <Key keyCode={KEYCODE.F11}>
                <IconVolume2 className="size-[10px]" />
                <span>{"F11"}</span>
              </Key>
              <Key keyCode={KEYCODE.F12}>
                <IconVolume className="size-[10px]" />
                <span>{"F12"}</span>
              </Key>

              <Key keyCode={KEYCODE.F13}>
                <IconFrame className="size-[10px]" />
              </Key>
              <Key keyCode={KEYCODE.Delete}>
                {"del"}
              </Key>
              <Key keyCode={KEYCODE.F14}>
                <IconBulb className="size-[12px]" />
              </Key>
            </Row>

            <Row>
              <Key keyCode={KEYCODE.Backquote}>
                <span>{"~"}</span>
                <span>{"`"}</span>
              </Key>

              <Key keyCode={KEYCODE.Digit1}>
                <span>{"!"}</span>
                <span>{"1"}</span>
              </Key>
              <Key keyCode={KEYCODE.Digit2}>
                <span>{"@"}</span>
                <span>{"2"}</span>
              </Key>
              <Key keyCode={KEYCODE.Digit3}>
                <span>{"#"}</span>
                <span>{"3"}</span>
              </Key>
              <Key keyCode={KEYCODE.Digit4}>
                <span>{"$"}</span>
                <span>{"4"}</span>
              </Key>

              <Key keyCode={KEYCODE.Digit5}>
                <span>{"%"}</span>
                <span>{"5"}</span>
              </Key>
              <Key keyCode={KEYCODE.Digit6}>
                <span>{"^"}</span>
                <span>{"6"}</span>
              </Key>
              <Key keyCode={KEYCODE.Digit7}>
                <span>{"&"}</span>
                <span>{"7"}</span>
              </Key>
              <Key keyCode={KEYCODE.Digit8}>
                <span>{"*"}</span>
                <span>{"8"}</span>
              </Key>
              <Key keyCode={KEYCODE.Digit9}>
                <span>{"("}</span>
                <span>{"9"}</span>
              </Key>

              <Key keyCode={KEYCODE.Digit0}>
                <span>{")"}</span>
                <span>{"0"}</span>
              </Key>
              <Key keyCode={KEYCODE.Minus}>
                <span>{"_"}</span>
                <span>{"-"}</span>
              </Key>
              <Key keyCode={KEYCODE.Equal}>
                <span>{"+"}</span>
                <span>{"="}</span>
              </Key>

              <Key keyCode={KEYCODE.Backspace} width={100}>
                <IconArrowNarrowLeft className="size-[12px]" />
              </Key>
              <Key keyCode={KEYCODE.PageUp}>
                {"pgup"}
              </Key>
            </Row>

            <Row>
              <Key keyCode={KEYCODE.Tab} width={75}>
                {"tab"}
              </Key>

              <Key keyCode={KEYCODE.KeyQ}>{"Q"}</Key>
              <Key keyCode={KEYCODE.KeyW}>{"W"}</Key>
              <Key keyCode={KEYCODE.KeyE}>{"E"}</Key>
              <Key keyCode={KEYCODE.KeyR}>{"R"}</Key>

              <Key keyCode={KEYCODE.KeyT}>{"T"}</Key>
              <Key keyCode={KEYCODE.KeyY}>{"Y"}</Key>
              <Key keyCode={KEYCODE.KeyU}>{"U"}</Key>
              <Key keyCode={KEYCODE.KeyI}>{"I"}</Key>
              <Key keyCode={KEYCODE.KeyO}>{"O"}</Key>
              <Key keyCode={KEYCODE.KeyP}>{"P"}</Key>

              <Key keyCode={KEYCODE.BracketLeft}>
                <span>{"{"}</span>
                <span>{"["}</span>
              </Key>
              <Key keyCode={KEYCODE.BracketRight}>
                <span>{"}"}</span>
                <span>{"]"}</span>
              </Key>

              <Key keyCode={KEYCODE.Backslash} width={75}>
                <span>{"|"}</span>
                <span>{"\\"}</span>
              </Key>
              <Key keyCode={KEYCODE.PageDown}>
                {"pgdn"}
              </Key>
            </Row>

            <Row>
              <Key keyCode={KEYCODE.CapsLock} width={100}>
                {"caps lock"}
              </Key>

              <Key keyCode={KEYCODE.KeyA}>{"A"}</Key>
              <Key keyCode={KEYCODE.KeyS}>{"S"}</Key>
              <Key keyCode={KEYCODE.KeyD}>{"D"}</Key>
              <Key keyCode={KEYCODE.KeyF}>{"F"}</Key>

              <Key keyCode={KEYCODE.KeyG}>{"G"}</Key>
              <Key keyCode={KEYCODE.KeyH}>{"H"}</Key>
              <Key keyCode={KEYCODE.KeyJ}>{"J"}</Key>
              <Key keyCode={KEYCODE.KeyK}>{"K"}</Key>
              <Key keyCode={KEYCODE.KeyL}>{"L"}</Key>

              <Key keyCode={KEYCODE.Semicolon}>
                <span>{":"}</span>
                <span>{";"}</span>
              </Key>
              <Key keyCode={KEYCODE.Quote}>
                <span>{"\""}</span>
                <span>{"'"}</span>
              </Key>

              <Key keyCode={KEYCODE.Enter} width={100}>
                {"return"}
              </Key>
              <Key keyCode={KEYCODE.Home}>
                {"home"}
              </Key>
            </Row>

            <Row>
              <Key keyCode={KEYCODE.ShiftLeft} width={123}>
                {"shift"}
              </Key>

              <Key keyCode={KEYCODE.KeyZ}>{"Z"}</Key>
              <Key keyCode={KEYCODE.KeyX}>{"X"}</Key>
              <Key keyCode={KEYCODE.KeyC}>{"C"}</Key>
              <Key keyCode={KEYCODE.KeyV}>{"V"}</Key>

              <Key keyCode={KEYCODE.KeyB}>{"B"}</Key>
              <Key keyCode={KEYCODE.KeyN}>{"N"}</Key>
              <Key keyCode={KEYCODE.KeyM}>{"M"}</Key>

              <Key keyCode={KEYCODE.Comma}>
                <span>{"<"}</span>
                <span>{","}</span>
              </Key>
              <Key keyCode={KEYCODE.Period}>
                <span>{">"}</span>
                <span>{"."}</span>
              </Key>
              <Key keyCode={KEYCODE.Slash}>
                <span>{"?"}</span>
                <span>{"/"}</span>
              </Key>

              <Key keyCode={KEYCODE.ShiftRight} width={77}>
                {"shift"}
              </Key>
              <Key keyCode={KEYCODE.ArrowUp}>
                <IconChevronUp className="size-[12px]" />
              </Key>
              <Key keyCode={KEYCODE.End}>
                {"end"}
              </Key>
            </Row>

            <Row>
              <Key keyCode={KEYCODE.ControlLeft} width={62}>
                {"ctrl"}
              </Key>
              <Key keyCode={KEYCODE.AltLeft} width={62}>
                {"option"}
              </Key>
              <Key keyCode={KEYCODE.MetaLeft} width={62}>
                <IconCommand className="size-[12px]" />
              </Key>

              <Key keyCode={KEYCODE.Space} width={314} />

              <Key keyCode={KEYCODE.MetaRight}>
                <IconCommand className="size-[12px]" />
              </Key>
              <Key keyCode={KEYCODE.Fn}>
                {"fn"}
              </Key>
              <Key keyCode={KEYCODE.ControlRight}>
                {"ctrl"}
              </Key>
              <Key keyCode={KEYCODE.ArrowLeft}>
                <IconChevronLeft className="size-[12px]" />
              </Key>
              <Key keyCode={KEYCODE.ArrowDown}>
                <IconChevronDown className="size-[12px]" />
              </Key>
              <Key keyCode={KEYCODE.ArrowRight}>
                <IconChevronRight className="size-[12px]" />
              </Key>
            </Row>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ children }: { children: ReactNode }) {
  return <div className="flex">{children}</div>;
}

const KEY_CODE_NAMES: Partial<Record<string, string>> = {
  Space: "Space",
  Escape: "Escape",
  Backspace: "Backspace",
  Delete: "Delete",
  Tab: "Tab",
  CapsLock: "Caps lock",
  Enter: "Enter",
  ShiftLeft: "Left shift",
  ShiftRight: "Right shift",
  ControlLeft: "Left control",
  ControlRight: "Right control",
  AltLeft: "Left option",
  AltRight: "Right option",
  MetaLeft: "Left command",
  MetaRight: "Right command",
  ArrowUp: "Up arrow",
  ArrowDown: "Down arrow",
  ArrowLeft: "Left arrow",
  ArrowRight: "Right arrow",
  PageUp: "Page up",
  PageDown: "Page down",
};

function describeKeyCode(keyCode?: KEYCODE): string {
  if (!keyCode) {
    return "Key";
  }

  const known = KEY_CODE_NAMES[keyCode];
  if (known) {
    return known;
  }

  if (/^Key[A-Z]$/.test(keyCode)) {
    return keyCode.slice(3);
  }
  if (/^Digit\d$/.test(keyCode)) {
    return keyCode.slice(5);
  }
  if (/^F\d{1,2}$/.test(keyCode)) {
    return keyCode;
  }

  const spaced = keyCode.replace(/([a-z0-9])([A-Z])/g, "$1 $2");
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

interface KeyProps {
  width?: number;
  children?: ReactNode;
  className?: string;
  keyCode?: KEYCODE;
}

function Key({
  width = 50,
  children,
  className,
  keyCode,
}: KeyProps) {
  const { themeName, pressedKeys, pressKey, releaseKey, triggerPointerHaptic } = useKeyboardContext();
  const isPressed = keyCode ? pressedKeys.has(keyCode) : false;
  const keyVariantSlot = resolveKeyVariant(themeName, keyCode);
  const keyVariant = KEYBOARD_THEMES[themeName].variants[keyVariantSlot];

  const handlePointerDown = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (!keyCode || event.button !== 0 || isPressed) {
      return;
    }

    event.preventDefault();
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      // Ignore capture failures on browsers/platforms that do not support this path.
    }
    pressKey(keyCode, "pointer");
  };

  const handlePointerRelease = () => {
    if (!keyCode || !isPressed) {
      return;
    }

    releaseKey(keyCode, "pointer");
  };

  return (
    <button
      type="button"
      onClick={triggerPointerHaptic}
      aria-label={describeKeyCode(keyCode)}
      data-keyboard-key=""
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerRelease}
      onPointerCancel={handlePointerRelease}
      onPointerLeave={handlePointerRelease}
      onLostPointerCapture={handlePointerRelease}
      style={{ height: 50, width }}
      className="flex items-end cursor-pointer touch-none appearance-none border-0 bg-transparent p-0 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-400"
    >
      <div
        className={cn(
          "relative overflow-hidden h-[50px] rounded-[4px] rounded-t-[12px] border border-black/40 flex items-start justify-center transition-all duration-100",
          isPressed && "h-[45px]",
        )}
        style={{
          width: `${width}px`,
          backgroundColor: toRgba(keyVariant.bg, 0.8),
        }}
      >
        <div
          className={cn(
            "relative z-10 h-[37px] rounded-[6px] border border-t-0 border-black/40 transition-all duration-100",
            "text-[9px] font-medium flex flex-col items-center justify-between p-1 gap-0.5 select-none",
            className,
          )}
          style={{
            width: `${width - 13}px`,
            backgroundColor: keyVariant.bg,
            color: keyVariant.text,
          }}
        >
          {children}
        </div>

        <div
          className={cn(
            "absolute z-0 bottom-0 right-0 h-px w-8 rotate-70 translate-x-3.5 bg-black/30 transition-all duration-100",
            isPressed && "rotate-60",
          )}
        />
        <div
          className={cn(
            "absolute z-0 bottom-0 left-0 h-px w-8 -rotate-70 -translate-x-3.5 bg-black/30 transition-all duration-100",
            isPressed && "-rotate-60",
          )}
        />
      </div>
    </button>
  );
}

// -----------------------------------------------------------------------------
// Keyboard constants
// -----------------------------------------------------------------------------

export enum KEYCODE {
  Escape = "Escape",
  F1 = "F1",
  F2 = "F2",
  F3 = "F3",
  F4 = "F4",
  F5 = "F5",
  F6 = "F6",
  F7 = "F7",
  F8 = "F8",
  F9 = "F9",
  F10 = "F10",
  F11 = "F11",
  F12 = "F12",
  F13 = "F13",
  Delete = "Delete",
  F14 = "F14",
  Backquote = "Backquote",
  Digit1 = "Digit1",
  Digit2 = "Digit2",
  Digit3 = "Digit3",
  Digit4 = "Digit4",
  Digit5 = "Digit5",
  Digit6 = "Digit6",
  Digit7 = "Digit7",
  Digit8 = "Digit8",
  Digit9 = "Digit9",
  Digit0 = "Digit0",
  Minus = "Minus",
  Equal = "Equal",
  Backspace = "Backspace",
  PageUp = "PageUp",
  Tab = "Tab",
  KeyQ = "KeyQ",
  KeyW = "KeyW",
  KeyE = "KeyE",
  KeyR = "KeyR",
  KeyT = "KeyT",
  KeyY = "KeyY",
  KeyU = "KeyU",
  KeyI = "KeyI",
  KeyO = "KeyO",
  KeyP = "KeyP",
  BracketLeft = "BracketLeft",
  BracketRight = "BracketRight",
  Backslash = "Backslash",
  PageDown = "PageDown",
  CapsLock = "CapsLock",
  KeyA = "KeyA",
  KeyS = "KeyS",
  KeyD = "KeyD",
  KeyF = "KeyF",
  KeyG = "KeyG",
  KeyH = "KeyH",
  KeyJ = "KeyJ",
  KeyK = "KeyK",
  KeyL = "KeyL",
  Semicolon = "Semicolon",
  Quote = "Quote",
  Enter = "Enter",
  Home = "Home",
  ShiftLeft = "ShiftLeft",
  KeyZ = "KeyZ",
  KeyX = "KeyX",
  KeyC = "KeyC",
  KeyV = "KeyV",
  KeyB = "KeyB",
  KeyN = "KeyN",
  KeyM = "KeyM",
  Comma = "Comma",
  Period = "Period",
  Slash = "Slash",
  ShiftRight = "ShiftRight",
  ArrowUp = "ArrowUp",
  End = "End",
  ControlLeft = "ControlLeft",
  AltLeft = "AltLeft",
  MetaLeft = "MetaLeft",
  Space = "Space",
  MetaRight = "MetaRight",
  Fn = "Fn",
  ControlRight = "ControlRight",
  ArrowLeft = "ArrowLeft",
  ArrowDown = "ArrowDown",
  ArrowRight = "ArrowRight",
  AltRight = "AltRight",
}

type KeyVariantSlot = "accent" | "dark" | "light";

interface KeyVariantDefinition {
  bg: string;
  text: string;
}

interface KeyboardThemeDefinition {
  variants: Record<KeyVariantSlot, KeyVariantDefinition>;
  keyVariantOverrides: Partial<Record<KEYCODE, KeyVariantSlot>>;
}

const DEFAULT_KEY_VARIANT_SLOT: KeyVariantSlot = "light";

const CLASSIC_DARK_KEYS: KEYCODE[] = [
  KEYCODE.F5,
  KEYCODE.F6,
  KEYCODE.F7,
  KEYCODE.F8,
  KEYCODE.F9,
  KEYCODE.F13,
  KEYCODE.Delete,
  KEYCODE.F14,
  KEYCODE.Backspace,
  KEYCODE.PageUp,
  KEYCODE.Tab,
  KEYCODE.Backslash,
  KEYCODE.PageDown,
  KEYCODE.CapsLock,
  KEYCODE.Enter,
  KEYCODE.Home,
  KEYCODE.ShiftLeft,
  KEYCODE.ShiftRight,
  KEYCODE.End,
  KEYCODE.ControlLeft,
  KEYCODE.AltLeft,
  KEYCODE.MetaLeft,
  KEYCODE.MetaRight,
  KEYCODE.Fn,
  KEYCODE.ControlRight,
];

const MINT_DARK_KEYS: KEYCODE[] = [
  KEYCODE.F5,
  KEYCODE.F6,
  KEYCODE.F7,
  KEYCODE.F8,
  KEYCODE.F9,
  KEYCODE.F13,
  KEYCODE.Delete,
  KEYCODE.F14,
  KEYCODE.Backspace,
  KEYCODE.PageUp,
  KEYCODE.Tab,
  KEYCODE.PageDown,
  KEYCODE.CapsLock,
  KEYCODE.Home,
  KEYCODE.ShiftLeft,
  KEYCODE.ShiftRight,
  KEYCODE.End,
  KEYCODE.ControlLeft,
  KEYCODE.AltLeft,
  KEYCODE.MetaLeft,
  KEYCODE.MetaRight,
  KEYCODE.Fn,
  KEYCODE.ControlRight,
];

// DEFINE YOUR CUSTOM THEMES HERE
const KEYBOARD_THEMES: Record<KeyboardThemeName, KeyboardThemeDefinition> = {
  classic: {
    variants: {
      accent: { bg: "#F57644", text: "rgba(0,0,0,0.5)" },
      dark: { bg: "#737373", text: "rgba(255,255,255,0.7)" },
      light: { bg: "#F5F5F5", text: "rgba(0,0,0,0.7)" },
    },
    keyVariantOverrides: buildKeyVariantOverrides({
      accent: [KEYCODE.Escape],
      dark: CLASSIC_DARK_KEYS,
    }),
  },
  mint: {
    variants: {
      accent: { bg: "#86C8AC", text: "rgba(255,255,255,0.7)" },
      dark: { bg: "#447B82", text: "rgba(255,255,255,0.7)" },
      light: { bg: "#EEEEEE", text: "#447B82" },
    },
    keyVariantOverrides: buildKeyVariantOverrides({
      accent: [
        KEYCODE.Escape,
        KEYCODE.Enter,
        KEYCODE.ArrowLeft,
        KEYCODE.ArrowRight,
        KEYCODE.ArrowUp,
        KEYCODE.ArrowDown
      ],
      dark: MINT_DARK_KEYS,
    }),
  },
  royal: {
    variants: {
      accent: { bg: "#E4D440", text: "rgba(0,0,0,0.7)" },
      dark: { bg: "#3A3B35", text: "rgba(255,255,255,0.7)" },
      light: { bg: "#324974", text: "rgba(255,255,255,0.7)" },
    },
    keyVariantOverrides: buildKeyVariantOverrides({
      accent: [
        KEYCODE.Escape,
        KEYCODE.Enter,
        KEYCODE.ArrowLeft,
        KEYCODE.ArrowRight,
        KEYCODE.ArrowUp,
        KEYCODE.ArrowDown
      ],
      dark: MINT_DARK_KEYS,
    }),
  },
  dolch: {
    variants: {
      accent: { bg: "#D73E42", text: "rgba(0,0,0,0.7)" },
      dark: { bg: "#3E3B4C", text: "rgba(255,255,255,0.7)" },
      light: { bg: "#4F5E78", text: "rgba(255,255,255,0.7)" },
    },
    keyVariantOverrides: buildKeyVariantOverrides({
      accent: [KEYCODE.Escape, KEYCODE.Enter, KEYCODE.Space],
      dark: [...MINT_DARK_KEYS, KEYCODE.Backquote, KEYCODE.Backslash],
    }),
  },
  sand: {
    variants: {
      accent: { bg: "#C94E41", text: "rgba(255,255,255,0.7)" },
      dark: { bg: "#893D36", text: "rgba(255,255,255,0.7)" },
      light: { bg: "#EFEFEF", text: "rgba(0,0,0,0.7)" },
    },
    keyVariantOverrides: buildKeyVariantOverrides({
      accent: [KEYCODE.Escape, KEYCODE.Enter],
      dark: MINT_DARK_KEYS,
    }),
  },
  scarlet: {
    variants: {
      accent: { bg: "#E1E1E1", text: "#8F4246" },
      dark: { bg: "#D5868A", text: "rgba(255,255,255,0.7)" },
      light: { bg: "#E4D7D7", text: "#8F4246" },
    },
    keyVariantOverrides: buildKeyVariantOverrides({
      accent: [KEYCODE.Escape, KEYCODE.Enter],
      dark: MINT_DARK_KEYS,
    }),
  },
};

function buildKeyVariantOverrides({
  accent = [],
  dark = [],
  light = [],
}: {
  accent?: KEYCODE[];
  dark?: KEYCODE[];
  light?: KEYCODE[];
}): Partial<Record<KEYCODE, KeyVariantSlot>> {
  const entries: Array<[KEYCODE, KeyVariantSlot]> = [];

  for (const keyCode of accent) {
    entries.push([keyCode, "accent"]);
  }
  for (const keyCode of dark) {
    entries.push([keyCode, "dark"]);
  }
  for (const keyCode of light) {
    entries.push([keyCode, "light"]);
  }

  return Object.fromEntries(entries) as Partial<Record<KEYCODE, KeyVariantSlot>>;
}

function resolveKeyVariant(
  themeName: KeyboardThemeName,
  keyCode?: KEYCODE,
): KeyVariantSlot {
  if (!keyCode) {
    return DEFAULT_KEY_VARIANT_SLOT;
  }
  return (
    KEYBOARD_THEMES[themeName].keyVariantOverrides[keyCode] ??
    DEFAULT_KEY_VARIANT_SLOT
  );
}

function toRgba(color: string, alpha: number): string {
  if (!color.startsWith("#")) {
    return color;
  }

  const value = color.slice(1);
  const hex = value.length === 3
    ? value
        .split("")
        .map((char) => `${char}${char}`)
        .join("")
    : value;

  if (hex.length !== 6) {
    return color;
  }

  const red = Number.parseInt(hex.slice(0, 2), 16);
  const green = Number.parseInt(hex.slice(2, 4), 16);
  const blue = Number.parseInt(hex.slice(4, 6), 16);

  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

export function keyboardThemeAccent(
  themeName: KeyboardThemeName,
): string {
  return KEYBOARD_THEMES[themeName].variants.accent.bg;
}
