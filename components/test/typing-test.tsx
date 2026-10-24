"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import KeyboardSwitcher from "@/components/studio/KeyboardSwitcher";
import {
  SoundProfileSelect,
  SoundToggle,
  VolumeSlider,
} from "@/components/studio/sound-controls";
import { useStudio } from "@/lib/studio-store";
import { playProfile } from "@/lib/sound-profiles";
import {
  getWordsServerSnapshot,
  getWordsSnapshot,
  regenerateWords,
  subscribeWords,
} from "./words";

const DURATIONS = [15, 30, 60, 120] as const;

type TestStatus = "idle" | "running" | "done";

interface TestResults {
  wpm: number;
  accuracy: number;
  errors: number;
  correct: number;
  typedTotal: number;
  elapsedSec: number;
}

const EDITABLE_SELECTOR =
  "input:not([data-typing-input]), textarea, select, [contenteditable]:not([contenteditable='false'])";

const CONTROL_SELECTOR =
  "button:not([data-typing-input]), a[href], [role='switch'], [role='tab'], [role='slider'], [role='menuitem'], [role='radio']";

function countMatches(target: string, typed: string): number {
  let correct = 0;
  for (let i = 0; i < typed.length && i < target.length; i += 1) {
    if (typed[i] === target[i]) correct += 1;
  }
  return correct;
}

export default function TypingTest() {
  const { soundEnabled, soundProfile, volume } = useStudio();

  const [duration, setDuration] = useState<number>(30);
  const words = useSyncExternalStore(
    subscribeWords,
    getWordsSnapshot,
    getWordsServerSnapshot,
  );
  const [typed, setTyped] = useState("");
  const [status, setStatus] = useState<TestStatus>("idle");
  const [timeLeftMs, setTimeLeftMs] = useState(duration * 1000);
  const [typedTotal, setTypedTotal] = useState(0);
  const [correctTyped, setCorrectTyped] = useState(0);
  const [results, setResults] = useState<TestResults | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const currentCharRef = useRef<HTMLSpanElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const endsAtRef = useRef(0);
  const startedAtRef = useRef(0);
  const typedRef = useRef("");
  const typedTotalRef = useRef(0);
  const correctTypedRef = useRef(0);

  useEffect(() => {
    typedRef.current = typed;
  }, [typed]);
  useEffect(() => {
    typedTotalRef.current = typedTotal;
  }, [typedTotal]);
  useEffect(() => {
    correctTypedRef.current = correctTyped;
  }, [correctTyped]);

  const target = useMemo(() => words.join(" "), [words]);

  const reset = useCallback(
    (nextDuration = duration) => {
      regenerateWords();
      setTyped("");
      setStatus("idle");
      setTimeLeftMs(nextDuration * 1000);
      setTypedTotal(0);
      setCorrectTyped(0);
      setResults(null);
    },
    [duration],
  );

  const finish = useCallback(
    (finalTyped: string, total: number, correct: number) => {
      const elapsedSec = Math.max(
        0.5,
        (Date.now() - startedAtRef.current) / 1000,
      );
      const cappedSec = Math.min(elapsedSec, duration);
      const finalCorrect = countMatches(target, finalTyped);
      setResults({
        wpm: Math.round(finalCorrect / 5 / (cappedSec / 60)),
        accuracy: total > 0 ? Math.round((correct / total) * 100) : 100,
        errors: Math.max(0, total - correct),
        correct: finalCorrect,
        typedTotal: total,
        elapsedSec: Math.round(cappedSec),
      });
      setStatus("done");
    },
    [duration, target],
  );

  // Countdown ticker — only armed while the test is running.
  useEffect(() => {
    if (status !== "running") return;
    const timer = window.setInterval(() => {
      const remaining = endsAtRef.current - Date.now();
      if (remaining <= 0) {
        window.clearInterval(timer);
        setTimeLeftMs(0);
        finish(typedRef.current, typedTotalRef.current, correctTypedRef.current);
      } else {
        setTimeLeftMs(remaining);
      }
    }, 100);
    return () => window.clearInterval(timer);
  }, [status, finish]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey || event.isComposing) {
        return;
      }

      const targetEl = event.target instanceof Element ? event.target : null;
      if (targetEl?.closest(EDITABLE_SELECTOR)) {
        return;
      }
      if (
        (event.code === "Space" || event.code === "Enter") &&
        targetEl?.closest(CONTROL_SELECTOR)
      ) {
        return;
      }

      if (event.key === "Backspace") {
        if (typed.length === 0) return;
        event.preventDefault();
        if (soundEnabled) {
          playProfile(soundProfile, "Backspace", volume);
        }
        setTyped((prev) => prev.slice(0, -1));
        return;
      }

      if (event.key.length !== 1 || status === "done") {
        return;
      }

      event.preventDefault();

      if (soundEnabled) {
        playProfile(soundProfile, event.code, volume);
      }

      const nextTyped = typed + event.key;
      const matched = event.key === target[typed.length];
      const nextTotal = typedTotal + 1;
      const nextCorrect = correctTyped + (matched ? 1 : 0);

      setTyped(nextTyped);
      setTypedTotal(nextTotal);
      setCorrectTyped(nextCorrect);

      if (status === "idle") {
        startedAtRef.current = Date.now();
        endsAtRef.current = Date.now() + duration * 1000;
        setTimeLeftMs(duration * 1000);
        setStatus("running");
      }

      if (nextTyped.length >= target.length) {
        finish(nextTyped, nextTotal, nextCorrect);
      }
    },
    [
      typed,
      target,
      status,
      duration,
      typedTotal,
      correctTyped,
      soundEnabled,
      soundProfile,
      volume,
      finish,
    ],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Keep the caret visible as the passage scrolls.
  useEffect(() => {
    if (status !== "running") return;
    currentCharRef.current?.scrollIntoView({ block: "center" });
  }, [typed.length, status]);

  const elapsedSec =
    status === "running"
      ? Math.min(duration, (duration * 1000 - timeLeftMs) / 1000)
      : status === "done"
        ? results?.elapsedSec ?? 0
        : 0;
  const liveCorrect = countMatches(target, typed);
  const liveWpm =
    elapsedSec > 0.3 ? Math.round(liveCorrect / 5 / (elapsedSec / 60)) : 0;
  const liveAccuracy =
    typedTotal > 0 ? Math.round((correctTyped / typedTotal) * 100) : 100;
  const timeLeftSec = Math.max(0, Math.ceil(timeLeftMs / 1000));

  // Flat offset of each word inside the joined passage (pure derivation).
  const wordOffsets = useMemo(() => {
    const offsets: number[] = [];
    let cursor = 0;
    for (const word of words) {
      offsets.push(cursor);
      cursor += word.length + 1;
    }
    return offsets;
  }, [words]);

  return (
    <div className="flex flex-col">
      <div className="mx-auto w-full max-w-5xl px-5 pt-8 sm:px-8">
        {/* Stats row — timer / wpm / accuracy */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-zinc-400">
              type test
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              {DURATIONS.map((value) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={duration === value}
                  onClick={() => {
                    setDuration(value);
                    reset(value);
                  }}
                  className={cn(
                    "rounded-full px-3 py-1 text-xs transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-400",
                    duration === value
                      ? "bg-violet-500 text-white"
                      : "text-zinc-400 hover:bg-white/5 hover:text-zinc-300",
                  )}
                >
                  {value}s
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-6 font-[family-name:var(--font-geist-mono)] tabular-nums">
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-widest text-zinc-400">
                time
              </p>
              <p
                className={cn(
                  "mt-1 text-2xl",
                  status === "running" && timeLeftSec <= 5
                    ? "text-red-400"
                    : "text-zinc-200",
                )}
              >
                {timeLeftSec}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-widest text-zinc-400">
                wpm
              </p>
              <p className="mt-1 text-2xl text-zinc-200">
                {status === "done" ? results?.wpm ?? 0 : liveWpm}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-widest text-zinc-400">
                acc
              </p>
              <p className="mt-1 text-2xl text-zinc-200">
                {status === "done" ? results?.accuracy ?? 100 : liveAccuracy}%
              </p>
            </div>
          </div>
        </div>

        {/* Passage */}
        <div
          onPointerDown={() => inputRef.current?.focus()}
          className="relative mt-10 cursor-text select-none"
        >
          <div
            ref={scrollContainerRef}
            className="max-h-40 overflow-hidden font-[family-name:var(--font-geist-mono)] text-xl leading-[2.1] text-zinc-400 sm:text-2xl"
            aria-label="Typing passage"
          >
            {words.map((word, wordIdx) => (
              <span key={`${word}-${wordIdx}`} className="mr-3 inline-block">
                {word.split("").map((char, charIdx) => {
                  const index = wordOffsets[wordIdx] + charIdx;
                  const typedChar = typed[index];
                  const isTyped = index < typed.length;
                  const isCorrect = isTyped && typedChar === char;
                  const isWrong = isTyped && !isCorrect;
                  const isCurrent = index === typed.length && status !== "done";

                  return (
                    <span
                      key={index}
                      ref={isCurrent ? currentCharRef : undefined}
                      className={cn(
                        "relative transition-colors duration-75",
                        !isTyped && "text-zinc-400",
                        isCorrect && "text-zinc-100",
                        isWrong && "rounded-[3px] bg-red-500/20 text-red-400",
                        isCurrent && "text-red-400",
                      )}
                    >
                      {char}
                      {isCurrent && (
                        <span
                          aria-hidden
                          className="absolute -bottom-0.5 left-0 h-[2px] w-full animate-pulse rounded bg-red-400"
                        />
                      )}
                    </span>
                  );
                })}
                {/* Space after each word (typed state tracked on the virtual space char) */}
                {(() => {
                  const index = wordOffsets[wordIdx] + word.length;
                  const isTyped = index < typed.length;
                  const isCorrect = isTyped && typed[index] === " ";
                  const isCurrent = index === typed.length && status !== "done";
                  return (
                    <span
                      key={`space-${wordIdx}`}
                      className={cn(
                        "relative inline-block w-[0.6ch] transition-colors",
                        isTyped && isCorrect && "text-zinc-100",
                        isTyped && !isCorrect && "bg-red-500/20 text-red-400",
                        isCurrent && "text-red-400",
                      )}
                    >
                      {" "}
                      {isCurrent && (
                        <span
                          aria-hidden
                          className="absolute -bottom-0.5 left-0 h-[2px] w-full animate-pulse rounded bg-red-400"
                        />
                      )}
                    </span>
                  );
                })()}
              </span>
            ))}
          </div>

          {/* Hidden input: gives mobile keyboards a focus target without a visible field */}
          <input
            ref={inputRef}
            data-typing-input=""
            aria-label="Typing input"
            value=""
            onChange={() => {}}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            className="absolute inset-0 h-full w-full cursor-text bg-transparent p-0 text-transparent opacity-0 caret-transparent focus:outline-none"
          />
        </div>

        {/* Results */}
        {status === "done" && results && (
          <div className="mt-8 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5">
            <div className="flex flex-wrap items-end justify-between gap-5">
              <div className="flex items-end gap-8 font-[family-name:var(--font-geist-mono)] tabular-nums">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-zinc-400">
                    wpm
                  </p>
                  <p className="mt-1 text-4xl font-semibold text-white">
                    {results.wpm}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-zinc-400">
                    accuracy
                  </p>
                  <p className="mt-1 text-4xl font-semibold text-white">
                    {results.accuracy}%
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-zinc-400">
                    errors
                  </p>
                  <p className="mt-1 text-4xl font-semibold text-red-400">
                    {results.errors}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  reset();
                  inputRef.current?.focus();
                }}
                className="inline-flex items-center gap-2 rounded-xl bg-violet-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-violet-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-300"
              >
                <RotateCcw className="h-4 w-4" />
                Restart
              </button>
            </div>
          </div>
        )}

        {/* Compact controls */}
        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          <SoundProfileSelect />
          <SoundToggle className="sm:mt-6" />
          <VolumeSlider className="sm:mt-6" />
        </div>

        <p className="mt-3 text-center text-[11px] text-zinc-400">
          Click the passage (or just start typing) · Backspace works ·
          ⌘-shortcuts stay untouched
        </p>
      </div>

      {/* On-screen keyboard mirrors physical presses */}
      <div className="mx-auto mt-10 w-full max-w-6xl px-5 pb-14 sm:px-8">
        <KeyboardSwitcher enableSound={false} />
      </div>
    </div>
  );
}
