import { getAudioContext } from "@/lib/sound-engine";

export interface MusicSound {
  id: string;
  label: string;
  group: "note" | "percussion";
}

const NOTE_FREQUENCIES: Record<string, number> = {
  C4: 261.63,
  D4: 293.66,
  E4: 329.63,
  F4: 349.23,
  G4: 392.0,
  A4: 440.0,
  B4: 493.88,
  C5: 523.25,
};

const PERCUSSION: MusicSound[] = [
  { id: "perc-kick", label: "Kick", group: "percussion" },
  { id: "perc-snare", label: "Snare", group: "percussion" },
  { id: "perc-hihat", label: "Hi-hat", group: "percussion" },
];

function noteLabel(id: string): string {
  if (id.length === 2) {
    return `${id[0]} (${id[1]})`;
  }
  return id;
}

export const MUSIC_SOUNDS: MusicSound[] = [
  ...Object.keys(NOTE_FREQUENCIES).map((id) => ({
    id,
    label: noteLabel(id),
    group: "note" as const,
  })),
  ...PERCUSSION,
];

export function isMusicSound(id: string): boolean {
  return MUSIC_SOUNDS.some((sound) => sound.id === id);
}

export function musicSoundLabel(id: string): string | null {
  return MUSIC_SOUNDS.find((sound) => sound.id === id)?.label ?? null;
}

function synthNote(frequency: number, volume: number, ctx: AudioContext): void {
  const now = ctx.currentTime;

  const osc = ctx.createOscillator();
  osc.type = "triangle";
  osc.frequency.value = frequency;

  const overtone = ctx.createOscillator();
  overtone.type = "sine";
  overtone.frequency.value = frequency * 2;

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(Math.max(0.001, volume * 0.5), now + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.55);

  const overtoneGain = ctx.createGain();
  overtoneGain.gain.setValueAtTime(0.0001, now);
  overtoneGain.gain.exponentialRampToValueAtTime(Math.max(0.001, volume * 0.18), now + 0.01);
  overtoneGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);

  osc.connect(gain).connect(ctx.destination);
  overtone.connect(overtoneGain).connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.6);
  overtone.start(now);
  overtone.stop(now + 0.4);
}

function noiseBuffer(ctx: AudioContext, seconds: number): AudioBuffer {
  const length = Math.max(1, Math.floor(ctx.sampleRate * seconds));
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i += 1) {
    data[i] = Math.random() * 2 - 1;
  }
  return buffer;
}

function synthKick(volume: number, ctx: AudioContext): void {
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(150, now);
  osc.frequency.exponentialRampToValueAtTime(40, now + 0.18);
  gain.gain.setValueAtTime(Math.max(0.001, volume * 0.9), now);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.28);
  osc.connect(gain).connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.3);
}

function synthSnare(volume: number, ctx: AudioContext): void {
  const now = ctx.currentTime;
  const noise = ctx.createBufferSource();
  noise.buffer = noiseBuffer(ctx, 0.2);
  const filter = ctx.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = 1800;
  filter.Q.value = 0.8;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(Math.max(0.001, volume * 0.5), now);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
  noise.connect(filter).connect(gain).connect(ctx.destination);
  noise.start(now);
  noise.stop(now + 0.2);

  const body = ctx.createOscillator();
  const bodyGain = ctx.createGain();
  body.type = "triangle";
  body.frequency.value = 190;
  bodyGain.gain.setValueAtTime(Math.max(0.001, volume * 0.35), now);
  bodyGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);
  body.connect(bodyGain).connect(ctx.destination);
  body.start(now);
  body.stop(now + 0.14);
}

function synthHihat(volume: number, ctx: AudioContext): void {
  const now = ctx.currentTime;
  const noise = ctx.createBufferSource();
  noise.buffer = noiseBuffer(ctx, 0.08);
  const filter = ctx.createBiquadFilter();
  filter.type = "highpass";
  filter.frequency.value = 7000;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(Math.max(0.001, volume * 0.35), now);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.07);
  noise.connect(filter).connect(gain).connect(ctx.destination);
  noise.start(now);
  noise.stop(now + 0.09);
}

/** Synthesize a note or percussion hit. Returns false when the id is unknown. */
export function playMusicSound(id: string, volume: number): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  const clamped = Math.min(1, Math.max(0, volume));

  try {
    const ctx = getAudioContext();
    if (ctx.state === "suspended") {
      void ctx.resume().catch(() => {});
    }

    const frequency = NOTE_FREQUENCIES[id];
    if (frequency) {
      synthNote(frequency, clamped, ctx);
      return true;
    }
    if (id === "perc-kick") {
      synthKick(clamped, ctx);
      return true;
    }
    if (id === "perc-snare") {
      synthSnare(clamped, ctx);
      return true;
    }
    if (id === "perc-hihat") {
      synthHihat(clamped, ctx);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}
