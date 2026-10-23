"use client";

import { useCallback, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { usePhysicalKeys, shouldBlockPageScroll } from "@/hooks/use-physical-keys";
import {
  GENERIC_DOWN,
  GENERIC_UP,
  SOUND_DEFINES_DOWN,
  SOUND_DEFINES_UP,
  keySound,
} from "@/lib/key-sound";

// -----------------------------------------------------------------------------
// Layout — every row sums to 15 key units so columns line up.
// -----------------------------------------------------------------------------

const TOTAL_UNITS = 15;
const FN_UNIT = TOTAL_UNITS / 14;

type MacKey = {
  /** `KeyboardEvent.code` used to mirror the physical keyboard. */
  code: string;
  label?: string;
  /** Shifted symbol printed above the base legend. */
  alt?: string;
  /** Decorative function-row glyph printed above the F label. */
  glyph?: string;
  w: number;
  aria: string;
  /** Word/modifier keys render smaller. */
  small?: boolean;
  /** Half-height stacked cell holding two keys. */
  stack?: [MacKey, MacKey];
};

const FUNCTION_ROW: MacKey[] = [
  { code: "Escape", label: "esc", w: FN_UNIT, aria: "Escape" },
  { code: "F1", label: "F1", glyph: "☼", w: FN_UNIT, aria: "F1, brightness down" },
  { code: "F2", label: "F2", glyph: "☀", w: FN_UNIT, aria: "F2, brightness up" },
  { code: "F3", label: "F3", glyph: "▤", w: FN_UNIT, aria: "F3, mission control" },
  { code: "F4", label: "F4", glyph: "⌕", w: FN_UNIT, aria: "F4, launchpad" },
  { code: "F5", label: "F5", glyph: "◖", w: FN_UNIT, aria: "F5" },
  { code: "F6", label: "F6", glyph: "◗", w: FN_UNIT, aria: "F6" },
  { code: "F7", label: "F7", glyph: "⏮", w: FN_UNIT, aria: "F7, previous track" },
  { code: "F8", label: "F8", glyph: "⏯", w: FN_UNIT, aria: "F8, play or pause" },
  { code: "F9", label: "F9", glyph: "⏭", w: FN_UNIT, aria: "F9, next track" },
  { code: "F10", label: "F10", glyph: "🔇", w: FN_UNIT, aria: "F10, mute" },
  { code: "F11", label: "F11", glyph: "🔉", w: FN_UNIT, aria: "F11, volume down" },
  { code: "F12", label: "F12", glyph: "🔊", w: FN_UNIT, aria: "F12, volume up" },
  { code: "TouchID", w: FN_UNIT, aria: "Touch ID" },
];

const NUMBER_ROW: MacKey[] = [
  { code: "Backquote", label: "`", alt: "~", w: 1, aria: "Backtick" },
  { code: "Digit1", label: "1", alt: "!", w: 1, aria: "1" },
  { code: "Digit2", label: "2", alt: "@", w: 1, aria: "2" },
  { code: "Digit3", label: "3", alt: "#", w: 1, aria: "3" },
  { code: "Digit4", label: "4", alt: "$", w: 1, aria: "4" },
  { code: "Digit5", label: "5", alt: "%", w: 1, aria: "5" },
  { code: "Digit6", label: "6", alt: "^", w: 1, aria: "6" },
  { code: "Digit7", label: "7", alt: "&", w: 1, aria: "7" },
  { code: "Digit8", label: "8", alt: "*", w: 1, aria: "8" },
  { code: "Digit9", label: "9", alt: "(", w: 1, aria: "9" },
  { code: "Digit0", label: "0", alt: ")", w: 1, aria: "0" },
  { code: "Minus", label: "-", alt: "_", w: 1, aria: "Minus" },
  { code: "Equal", label: "=", alt: "+", w: 1, aria: "Equals" },
  { code: "Backspace", label: "delete", w: 2, aria: "Delete", small: true },
];

const TAB_ROW: MacKey[] = [
  { code: "Tab", label: "tab", w: 1.5, aria: "Tab", small: true },
  { code: "KeyQ", label: "Q", w: 1, aria: "Q" },
  { code: "KeyW", label: "W", w: 1, aria: "W" },
  { code: "KeyE", label: "E", w: 1, aria: "E" },
  { code: "KeyR", label: "R", w: 1, aria: "R" },
  { code: "KeyT", label: "T", w: 1, aria: "T" },
  { code: "KeyY", label: "Y", w: 1, aria: "Y" },
  { code: "KeyU", label: "U", w: 1, aria: "U" },
  { code: "KeyI", label: "I", w: 1, aria: "I" },
  { code: "KeyO", label: "O", w: 1, aria: "O" },
  { code: "KeyP", label: "P", w: 1, aria: "P" },
  { code: "BracketLeft", label: "[", alt: "{", w: 1, aria: "Left bracket" },
  { code: "BracketRight", label: "]", alt: "}", w: 1, aria: "Right bracket" },
  { code: "Backslash", label: "\\", alt: "|", w: 1.5, aria: "Backslash" },
];

const CAPS_ROW: MacKey[] = [
  { code: "CapsLock", label: "caps lock", w: 1.75, aria: "Caps lock", small: true },
  { code: "KeyA", label: "A", w: 1, aria: "A" },
  { code: "KeyS", label: "S", w: 1, aria: "S" },
  { code: "KeyD", label: "D", w: 1, aria: "D" },
  { code: "KeyF", label: "F", w: 1, aria: "F" },
  { code: "KeyG", label: "G", w: 1, aria: "G" },
  { code: "KeyH", label: "H", w: 1, aria: "H" },
  { code: "KeyJ", label: "J", w: 1, aria: "J" },
  { code: "KeyK", label: "K", w: 1, aria: "K" },
  { code: "KeyL", label: "L", w: 1, aria: "L" },
  { code: "Semicolon", label: ";", alt: ":", w: 1, aria: "Semicolon" },
  { code: "Quote", label: "'", alt: "\"", w: 1, aria: "Apostrophe" },
  { code: "Enter", label: "return", w: 2.25, aria: "Return", small: true },
];

const SHIFT_ROW: MacKey[] = [
  { code: "ShiftLeft", label: "shift", w: 2.25, aria: "Left shift", small: true },
  { code: "KeyZ", label: "Z", w: 1, aria: "Z" },
  { code: "KeyX", label: "X", w: 1, aria: "X" },
  { code: "KeyC", label: "C", w: 1, aria: "C" },
  { code: "KeyV", label: "V", w: 1, aria: "V" },
  { code: "KeyB", label: "B", w: 1, aria: "B" },
  { code: "KeyN", label: "N", w: 1, aria: "N" },
  { code: "KeyM", label: "M", w: 1, aria: "M" },
  { code: "Comma", label: ",", alt: "<", w: 1, aria: "Comma" },
  { code: "Period", label: ".", alt: ">", w: 1, aria: "Period" },
  { code: "Slash", label: "/", alt: "?", w: 1, aria: "Slash" },
  { code: "ShiftRight", label: "shift", w: 2.75, aria: "Right shift", small: true },
];

const BOTTOM_ROW: MacKey[] = [
  { code: "Fn", label: "fn", w: 1, aria: "Function", small: true },
  { code: "ControlLeft", label: "⌃", w: 1, aria: "Control", small: true },
  { code: "AltLeft", label: "⌥", w: 1, aria: "Option", small: true },
  { code: "MetaLeft", label: "⌘", w: 1.25, aria: "Command", small: true },
  { code: "Space", label: "", w: 5.5, aria: "Space" },
  { code: "MetaRight", label: "⌘", w: 1.25, aria: "Right command", small: true },
  { code: "AltRight", label: "⌥", w: 1, aria: "Right option", small: true },
  { code: "ArrowLeft", label: "◀", w: 1, aria: "Left arrow", small: true },
  {
    code: "ArrowStack",
    w: 1,
    aria: "Arrow keys",
    stack: [
      { code: "ArrowUp", label: "▲", w: 1, aria: "Up arrow", small: true },
      { code: "ArrowDown", label: "▼", w: 1, aria: "Down arrow", small: true },
    ],
  },
  { code: "ArrowRight", label: "▶", w: 1, aria: "Right arrow", small: true },
];

interface RowDefinition {
  name: string;
  keys: MacKey[];
  functionRow?: boolean;
}

const ROWS: RowDefinition[] = [
  { name: "Function row", keys: FUNCTION_ROW, functionRow: true },
  { name: "Number row", keys: NUMBER_ROW },
  { name: "QWERTY row", keys: TAB_ROW },
  { name: "Home row", keys: CAPS_ROW },
  { name: "Shift row", keys: SHIFT_ROW },
  { name: "Modifier row", keys: BOTTOM_ROW },
];

// -----------------------------------------------------------------------------
// Key cap
// -----------------------------------------------------------------------------

interface CapButtonProps {
  code: string;
  aria: string;
  pressed: ReadonlySet<string>;
  onPress: (code: string) => void;
  onRelease: (code: string) => void;
  compact?: boolean;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}

function CapButton({
  code,
  aria,
  pressed,
  onPress,
  onRelease,
  compact,
  className,
  style,
  children,
}: CapButtonProps) {
  const isPressed = pressed.has(code);

  const handlePointerDown = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (event.button !== 0) {
      return;
    }
    event.preventDefault();
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      // Pointer capture is a progressive enhancement.
    }
    onPress(code);
  };

  const handlePointerRelease = () => {
    onRelease(code);
  };

  return (
    <button
      type="button"
      data-keyboard-key=""
      aria-label={aria}
      aria-pressed={isPressed}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerRelease}
      onPointerCancel={handlePointerRelease}
      onPointerLeave={handlePointerRelease}
      onLostPointerCapture={handlePointerRelease}
      className={cn(
        "relative flex select-none appearance-none items-center justify-center overflow-hidden",
        "rounded-[clamp(3px,0.4vw,6px)]",
        "bg-[linear-gradient(180deg,#3b3d43_0%,#2c2e34_55%,#212227_100%)]",
        "text-[#f2f2f5] shadow-[inset_0_0_0_1px_rgba(0,0,0,0.55),inset_0_1.5px_0_rgba(255,255,255,0.09),0_1.5px_2.5px_rgba(0,0,0,0.4)]",
        "transition-[transform,box-shadow,filter] duration-75 ease-out",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-400",
        compact
          ? "text-[clamp(7px,0.8vw,10px)] font-normal"
          : "text-[clamp(10px,1.1vw,13px)] font-medium",
        isPressed &&
          "translate-y-[1.5px] brightness-[0.9] shadow-[inset_0_0_0_1px_rgba(0,0,0,0.7),inset_0_1px_4px_rgba(0,0,0,0.55)]",
        className,
      )}
      style={style}
    >
      {children}
    </button>
  );
}

function KeyLabel({ alt, glyph, label }: { alt?: string; glyph?: string; label?: string }) {
  if (glyph) {
    return (
      <span className="flex flex-col items-center justify-center gap-[0.1em] leading-none">
        <span aria-hidden className="text-[0.85em] text-white/55">
          {glyph}
        </span>
        <span>{label}</span>
      </span>
    );
  }

  if (alt) {
    return (
      <span className="flex flex-col items-center justify-center gap-[0.1em] leading-none">
        <span aria-hidden className="text-[0.78em] text-white/45">
          {alt}
        </span>
        <span>{label}</span>
      </span>
    );
  }

  return <span className="leading-none">{label}</span>;
}

// -----------------------------------------------------------------------------
// Keyboard
// -----------------------------------------------------------------------------

export interface MacKeyboardProps {
  className?: string;
  enableSound?: boolean;
  onKeyPress?: (code: string) => void;
}

export default function MacKeyboard({
  className,
  enableSound = true,
  onKeyPress,
}: MacKeyboardProps) {
  const [pressed, setPressed] = useState<ReadonlySet<string>>(() => new Set());
  const pressedRef = useRef<Set<string>>(new Set());

  const press = useCallback(
    (code: string) => {
      if (pressedRef.current.has(code)) {
        return;
      }
      pressedRef.current.add(code);
      setPressed(new Set(pressedRef.current));

      if (enableSound) {
        keySound.play(SOUND_DEFINES_DOWN[code] ?? GENERIC_DOWN);
      }
      onKeyPress?.(code);
    },
    [enableSound, onKeyPress],
  );

  const release = useCallback(
    (code: string) => {
      if (!pressedRef.current.has(code)) {
        return;
      }
      pressedRef.current.delete(code);
      setPressed(new Set(pressedRef.current));

      if (enableSound) {
        keySound.play(SOUND_DEFINES_UP[code] ?? GENERIC_UP);
      }
    },
    [enableSound],
  );

  const clearPressed = useCallback(() => {
    if (pressedRef.current.size === 0) {
      return;
    }
    pressedRef.current.clear();
    setPressed(new Set());
  }, []);

  usePhysicalKeys({
    onDown: (code, event) => {
      if (shouldBlockPageScroll(code)) {
        event.preventDefault();
      }
      press(code);
    },
    onUp: release,
    onClear: clearPressed,
  });

  const renderKey = (key: MacKey, functionRow?: boolean): ReactNode => {
    const widthStyle: CSSProperties = {
      width: `${(key.w / TOTAL_UNITS) * 100}%`,
      borderRight: "var(--mac-gap) solid transparent",
    };

    if (key.stack) {
      const [top, bottom] = key.stack;
      return (
        <div
          key={key.code}
          className="flex h-full flex-col gap-[var(--mac-gap)]"
          style={widthStyle}
        >
          <CapButton
            code={top.code}
            aria={top.aria}
            pressed={pressed}
            onPress={press}
            onRelease={release}
            compact
            className="h-full"
          >
            <KeyLabel label={top.label} />
          </CapButton>
          <CapButton
            code={bottom.code}
            aria={bottom.aria}
            pressed={pressed}
            onPress={press}
            onRelease={release}
            compact
            className="h-full"
          >
            <KeyLabel label={bottom.label} />
          </CapButton>
        </div>
      );
    }

    const isTouchId = key.code === "TouchID";

    return (
      <CapButton
        key={key.code}
        code={key.code}
        aria={key.aria}
        pressed={pressed}
        onPress={press}
        onRelease={release}
        compact={key.small || functionRow}
        style={{ ...widthStyle, height: "100%" }}
      >
        {isTouchId ? (
          <span
            aria-hidden
            className="block h-[46%] w-[46%] rounded-full border border-white/25 shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)]"
          />
        ) : (
          <KeyLabel alt={key.alt} glyph={key.glyph} label={key.label} />
        )}
      </CapButton>
    );
  };

  const rootStyle = {
    "--mac-unit": "clamp(28px, 5vw, 44px)",
    "--mac-gap": "clamp(2px, 0.4vw, 5px)",
    width: "calc(15 * var(--mac-unit))",
  } as CSSProperties;

  return (
    <div className={cn("mx-auto select-none", className)} style={rootStyle}>
      <div className="relative overflow-hidden rounded-[clamp(12px,1.6vw,20px)] border border-white/25 bg-gradient-to-b from-[#c9cbd0] via-[#a9acb3] to-[#83868d] p-[clamp(6px,1vw,14px)] shadow-[0_30px_70px_-30px_rgba(0,0,0,0.9),inset_0_1px_1px_rgba(255,255,255,0.9)]">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(255,255,255,0.03)_3px)]"
        />

        <div className="relative flex flex-col gap-[var(--mac-gap)]">
          {ROWS.map((row, rowIndex) => (
            <div
              key={rowIndex}
              role="group"
              aria-label={row.name}
              className="flex w-full"
              style={{
                height: row.functionRow
                  ? "calc((var(--mac-unit) - var(--mac-gap)) * 0.6)"
                  : "calc(var(--mac-unit) - var(--mac-gap))",
              }}
            >
              {row.keys.map((key) => renderKey(key, row.functionRow))}
            </div>
          ))}
        </div>

        <div className="pointer-events-none absolute inset-x-10 bottom-0 h-px bg-white/40" />
      </div>
    </div>
  );
}
