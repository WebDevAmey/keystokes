"use client";

import keyLayoutJson from "../../keysim/src/config/layouts/layout_100_default.json";
import keymapJson from "../../keysim/src/config/keymaps/keymap_100_default.json";

import { Canvas, useFrame } from "@react-three/fiber";
import {
  ContactShadows,
  Environment,
  RoundedBox,
  OrbitControls,
} from "@react-three/drei";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import * as THREE from "three";
import { usePhysicalKeys } from "@/hooks/use-physical-keys";
import { useStudio } from "@/lib/studio-store";

type SoundProfile = "soft" | "mechanical" | "retro";

type KeySimLayoutEntry = {
  x: number;
  y: number;
  w?: number;
  h?: number;
};

type KeySimLayoutJson = {
  layouts: {
    LAYOUT: {
      layout: KeySimLayoutEntry[];
    };
  };
};

type KeySimKeymapJson = {
  layers: string[][];
};

const KEY_UNIT = 0.75;

const KEY_LAYOUT = (
  keyLayoutJson as KeySimLayoutJson
).layouts.LAYOUT.layout;

const KEY_CODES = (
  keymapJson as KeySimKeymapJson
).layers[0] ?? [];

const QMK_TO_ID: Record<string, string> = {
  KC_ESC: "ESC",
  KC_PSCR: "PRINT",
  KC_SLCK: "SCROLL",
  KC_PAUS: "PAUSE",
  KC_GRV: "GRAVE",
  KC_MINS: "MINUS",
  KC_EQL: "EQUAL",
  KC_BSPC: "BACKSPACE",
  KC_INS: "INSERT",
  KC_HOME: "HOME",
  KC_PGUP: "PAGEUP",
  KC_NLCK: "NUMLOCK",
  KC_PSLS: "NUMDIVIDE",
  KC_PAST: "NUMMULTIPLY",
  KC_PMNS: "NUMSUBTRACT",
  KC_TAB: "TAB",
  KC_LBRC: "BRACKETLEFT",
  KC_RBRC: "BRACKETRIGHT",
  KC_BSLS: "BACKSLASH",
  KC_DEL: "DELETE",
  KC_END: "END",
  KC_PGDN: "PAGEDOWN",
  KC_P7: "NUM7",
  KC_P8: "NUM8",
  KC_P9: "NUM9",
  KC_PPLS: "NUMADD",
  KC_CAPS: "CAPSLOCK",
  KC_SCLN: "SEMICOLON",
  KC_QUOT: "QUOTE",
  KC_ENT: "ENTER",
  KC_P4: "NUM4",
  KC_P5: "NUM5",
  KC_P6: "NUM6",
  KC_LSFT: "SHIFTLEFT",
  KC_RSFT: "SHIFTRIGHT",
  KC_COMM: "COMMA",
  KC_DOT: "PERIOD",
  KC_SLSH: "SLASH",
  KC_UP: "ARROWUP",
  KC_P1: "NUM1",
  KC_P2: "NUM2",
  KC_P3: "NUM3",
  KC_PENT: "NUMENTER",
  KC_LCTL: "CONTROLLEFT",
  KC_RCTL: "CONTROLRIGHT",
  KC_LGUI: "METALEFT",
  KC_RGUI: "METARIGHT",
  KC_LALT: "ALTLEFT",
  KC_RALT: "ALTRIGHT",
  KC_APP: "MENU",
  KC_SPC: "SPACE",
  KC_LEFT: "ARROWLEFT",
  KC_DOWN: "ARROWDOWN",
  KC_RGHT: "ARROWRIGHT",
  KC_P0: "NUM0",
  KC_PDOT: "NUMDECIMAL",
};

function qmkId(code: string): string {
  if (QMK_TO_ID[code]) return QMK_TO_ID[code];

  if (/^KC_F(?:[1-9]|1[0-2])$/.test(code)) {
    return code.slice(3);
  }

  if (/^KC_[A-Z]$/.test(code)) {
    return code.slice(3);
  }

  if (/^KC_[0-9]$/.test(code)) {
    return code.slice(3);
  }

  return code;
}

function qmkLabel(code: string): string {
  const labels: Record<string, string> = {
    KC_ESC: "esc",
    KC_PSCR: "prtsc",
    KC_SLCK: "scroll",
    KC_PAUS: "pause",
    KC_GRV: "`",
    KC_BSPC: "backspace",
    KC_INS: "ins",
    KC_HOME: "home",
    KC_PGUP: "pgup",
    KC_NLCK: "num",
    KC_PSLS: "/",
    KC_PAST: "*",
    KC_PMNS: "-",
    KC_TAB: "tab",
    KC_LBRC: "[",
    KC_RBRC: "]",
    KC_BSLS: "\\",
    KC_DEL: "del",
    KC_END: "end",
    KC_PGDN: "pgdn",
    KC_CAPS: "caps",
    KC_ENT: "enter",
    KC_LSFT: "shift",
    KC_RSFT: "shift",
    KC_LCTL: "ctrl",
    KC_RCTL: "ctrl",
    KC_LALT: "alt",
    KC_RALT: "alt",
    KC_LGUI: "⌘",
    KC_RGUI: "⌘",
    KC_APP: "menu",
    KC_SPC: "",
    KC_UP: "↑",
    KC_DOWN: "↓",
    KC_LEFT: "←",
    KC_RGHT: "→",
    KC_PENT: "enter",
    KC_PPLS: "+",
    KC_COMM: ",",
    KC_DOT: ".",
    KC_SLSH: "/",
    KC_SCLN: ";",
    KC_QUOT: "'",
    KC_MINS: "-",
    KC_EQL: "=",
  };

  if (labels[code] !== undefined) {
    return labels[code];
  }

  if (/^KC_[A-Z]$/.test(code)) {
    return code.slice(3);
  }

  if (/^KC_[0-9]$/.test(code)) {
    return code.slice(3);
  }

  if (/^KC_F(?:[1-9]|1[0-2])$/.test(code)) {
    return code.slice(3);
  }

  return code.replace(/^KC_/, "").toLowerCase();
}

function createKeyGeometry(
  width: number,
  depth: number,
  row: number,
) {
  const w = Math.max(0.2, width - 0.05);
  const d = Math.max(0.2, depth - 0.05);
  const h = 0.5;
  const c = 0.05;
  const inset = 0.15;
  const topInset = 0.05;

  const vertices: number[][] = [
    [0, 0, 0],
    [w, 0, 0],
    [w, 0, d],
    [0, 0, d],
    [inset, h, topInset + c],
    [inset + c, h, topInset],
    [w - inset - c, h, topInset],
    [w - inset, h, topInset + c],
    [w - inset, h, d - inset - c],
    [w - inset - c, h, d - inset],
    [inset + c, h, d - inset],
    [inset, h, d - inset - c],
  ];

  const lower = (
    vertexIndex: number,
    amount: number,
  ) => {
    vertices[vertexIndex][1] -= amount;
  };

  if (row === 1) {
    [4, 5, 6, 7, 8, 9, 10, 11].forEach((i) =>
      lower(i, -0.05),
    );
  } else if (row === 2 || row === 3) {
    [4, 5, 6, 7, 8, 9, 10, 11].forEach((i) =>
      lower(i, 0.1),
    );
  }

  const faces = [
    [4, 7, 5],
    [7, 6, 5],
    [9, 11, 10],
    [9, 8, 11],
    [4, 11, 7],
    [8, 7, 11],
    [0, 4, 5],
    [1, 6, 7],
    [2, 8, 9],
    [3, 10, 11],
    [0, 5, 1],
    [1, 5, 6],
    [2, 7, 8],
    [2, 1, 7],
    [0, 3, 11],
    [0, 11, 4],
    [3, 2, 9],
    [3, 9, 10],
  ];

  const geometry = new THREE.BufferGeometry();

  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(
      vertices.flat(),
      3,
    ),
  );

  geometry.setIndex(faces.flat());
  geometry.computeVertexNormals();

  if (row >= 3) {
    geometry.rotateX(row === 3 ? -0.1 : -0.2);
    geometry.translate(
      0,
      row === 3 ? -0.1 : -0.19,
      0,
    );
  }

  geometry.translate(-w / 2, 0, -d / 2);

  return geometry;
}

function createLegendTexture(label: string) {
  const canvas = document.createElement("canvas");

  canvas.width = 256;
  canvas.height = 256;

  const ctx = canvas.getContext("2d");

  if (!ctx) return null;

  ctx.clearRect(0, 0, 256, 256);

  ctx.fillStyle = "#e6e3eb";
  ctx.fillRect(0, 0, 256, 256);

  const gradient = ctx.createLinearGradient(
    0,
    0,
    256,
    256,
  );

  gradient.addColorStop(
    0,
    "rgba(255,255,255,0.18)",
  );

  gradient.addColorStop(
    1,
    "rgba(0,0,0,0.12)",
  );

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 256, 256);

  if (label) {
    ctx.fillStyle = "#292731";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.font =
      label.length > 5
        ? "bold 26px Arial, sans-serif"
        : label.length > 3
          ? "bold 34px Arial, sans-serif"
          : "bold 52px Arial, sans-serif";

    ctx.fillText(label, 128, 128, 224);
  }

  const texture = new THREE.CanvasTexture(canvas);

  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;

  return texture;
}

function SculptedKey({
  code,
  layout,
  active,
  onPress,
  onRelease,
}: {
  code: string;
  layout: KeySimLayoutEntry;
  active: boolean;
  onPress: (id: string) => void;
  onRelease: (id: string) => void;
}) {
  const group = useRef<THREE.Group>(null);

  const id = qmkId(code);
  const label = qmkLabel(code);

  const width = layout.w ?? 1;
  const depth = layout.h ?? 1;

  const geometry = useMemo(
    () =>
      createKeyGeometry(
        width,
        depth,
        Math.max(
          0,
          Math.min(4, Math.floor(layout.y)),
        ),
      ),
    [width, depth, layout.y],
  );

  useEffect(() => {
    return () => geometry.dispose();
  }, [geometry]);

  const legendTexture = useMemo(
    () => createLegendTexture(label),
    [label],
  );

  useEffect(() => {
    return () => legendTexture?.dispose();
  }, [legendTexture]);

  useFrame((_, delta) => {
    if (!group.current) return;

    group.current.position.y = THREE.MathUtils.damp(
      group.current.position.y,
      active ? 0.48 : 0.58,
      22,
      delta,
    );
  });

  const x =
    (layout.x + width / 2 - 11.25) * KEY_UNIT;

  const z =
    (layout.y + depth / 2 - 3.125) * KEY_UNIT;

  return (
    <group
      ref={group}
      position={[x, 0.58, z]}
      scale={KEY_UNIT}
    >
      <mesh
        geometry={geometry}
        castShadow
        receiveShadow
        onPointerDown={(event) => {
          event.stopPropagation();
          onPress(id);
        }}
        onPointerUp={(event) => {
          event.stopPropagation();
          onRelease(id);
        }}
        onPointerLeave={() => onRelease(id)}
      >
        <meshStandardMaterial
          color={active ? "#b7a8ff" : "#e5e3e9"}
          roughness={0.36}
          metalness={0.025}
        />

        <meshStandardMaterial
          color={active ? "#8874d9" : "#b9b6c2"}
          roughness={0.43}
          metalness={0.025}
        />
      </mesh>

      {legendTexture && label && (
        <mesh
          position={[0, 0.505, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          raycast={() => null}
        >
          <planeGeometry
            args={[
              Math.max(0.25, width - 0.3),
              Math.max(0.25, depth - 0.3),
            ]}
          />

          <meshBasicMaterial
            map={legendTexture}
            toneMapped={false}
            transparent
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      )}
    </group>
  );
}

function KeyboardModel({
  activeKeys,
  onPress,
  onRelease,
}: {
  activeKeys: string[];
  onPress: (id: string) => void;
  onRelease: (id: string) => void;
}) {
  const caseWidth = 23.5 * KEY_UNIT;
  const caseDepth = 7.25 * KEY_UNIT;

  return (
    // Flat model rotation for the top-down view
    <group rotation={[0, 0, 0]}>
      <RoundedBox
        args={[caseWidth, 0.48, caseDepth]}
        radius={0.2}
        smoothness={6}
        position={[0, 0.12, 0]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial
          color="#34313b"
          roughness={0.32}
          metalness={0.22}
        />
      </RoundedBox>

      <RoundedBox
        args={[
          caseWidth - 0.18,
          0.08,
          caseDepth - 0.18,
        ]}
        radius={0.13}
        smoothness={5}
        position={[0, 0.37, 0]}
        receiveShadow
      >
        <meshStandardMaterial
          color="#494550"
          roughness={0.4}
          metalness={0.2}
        />
      </RoundedBox>

      {KEY_LAYOUT.map((entry, index) => {
        const code = KEY_CODES[index];

        if (!code) return null;

        const id = qmkId(code);

        return (
          <SculptedKey
            key={`${code}-${index}`}
            code={code}
            layout={entry}
            active={activeKeys.includes(id)}
            onPress={onPress}
            onRelease={onRelease}
          />
        );
      })}
    </group>
  );
}

const CODE_TO_KEY: Record<string, string> = {
  Backquote: "GRAVE",
  Minus: "MINUS",
  Equal: "EQUAL",
  BracketLeft: "BRACKETLEFT",
  BracketRight: "BRACKETRIGHT",
  Backslash: "BACKSLASH",
  Semicolon: "SEMICOLON",
  Quote: "QUOTE",
  Comma: "COMMA",
  Period: "PERIOD",
  Slash: "SLASH",
  Backspace: "BACKSPACE",
  Tab: "TAB",
  CapsLock: "CAPSLOCK",
  Enter: "ENTER",
  ShiftLeft: "SHIFTLEFT",
  ShiftRight: "SHIFTRIGHT",
  ControlLeft: "CONTROLLEFT",
  ControlRight: "CONTROLRIGHT",
  AltLeft: "ALTLEFT",
  AltRight: "ALTRIGHT",
  MetaLeft: "METALEFT",
  MetaRight: "METARIGHT",
  Space: "SPACE",
  Escape: "ESC",
  Insert: "INSERT",
  Delete: "DELETE",
  Home: "HOME",
  End: "END",
  PageUp: "PAGEUP",
  PageDown: "PAGEDOWN",
  ArrowUp: "ARROWUP",
  ArrowDown: "ARROWDOWN",
  ArrowLeft: "ARROWLEFT",
  ArrowRight: "ARROWRIGHT",
  PrintScreen: "PRINT",
  ScrollLock: "SCROLL",
  Pause: "PAUSE",
  NumLock: "NUMLOCK",
  NumpadDivide: "NUMDIVIDE",
  NumpadMultiply: "NUMMULTIPLY",
  NumpadSubtract: "NUMSUBTRACT",
  NumpadAdd: "NUMADD",
  NumpadEnter: "NUMENTER",
  NumpadDecimal: "NUMDECIMAL",
};

for (const letter of "ABCDEFGHIJKLMNOPQRSTUVWXYZ") {
  CODE_TO_KEY[`Key${letter}`] = letter;
}

for (let i = 0; i <= 9; i++) {
  CODE_TO_KEY[`Digit${i}`] = String(i);
  CODE_TO_KEY[`Numpad${i}`] = `NUM${i}`;
}

for (let i = 1; i <= 12; i++) {
  CODE_TO_KEY[`F${i}`] = `F${i}`;
}

const KEY_LABELS = new Map(
  KEY_LAYOUT.map((_, index) => {
    const code = KEY_CODES[index] ?? "";

    return [qmkId(code), qmkLabel(code)];
  }),
);

const OPTIONS: {
  id: SoundProfile;
  label: string;
}[] = [
  { id: "soft", label: "Soft" },
  { id: "mechanical", label: "Mechanical" },
  { id: "retro", label: "Retro" },
];

export default function VirtualKeyboard() {
  const [sound, setSound] =
    useState<SoundProfile>("mechanical");

  const { soundEnabled, volume: masterVolume } = useStudio();

  const [activeKeys, setActiveKeys] =
    useState<string[]>([]);

  const pressed = useRef(new Set<string>());

  const audio = useRef<AudioContext | null>(null);

  const playSound = useCallback(
    (id: string) => {
      if (!soundEnabled || masterVolume <= 0) return;

      const AudioContextClass =
        window.AudioContext ||
        (
          window as typeof window & {
            webkitAudioContext?: typeof AudioContext;
          }
        ).webkitAudioContext;

      if (!AudioContextClass) return;

      const ctx =
        audio.current ?? new AudioContextClass();

      audio.current = ctx;

      if (ctx.state === "suspended") {
        void ctx.resume();
      }

      const now = ctx.currentTime;

      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();

      if (sound === "retro") {
        oscillator.type = "square";
        oscillator.frequency.value =
          180 + (id.charCodeAt(0) % 10) * 25;
      } else if (sound === "soft") {
        oscillator.type = "sine";
        oscillator.frequency.value = 520;
      } else {
        oscillator.type = "triangle";
        oscillator.frequency.value =
          900 + (id.charCodeAt(0) % 7) * 35;
      }

      const volume =
        (sound === "soft" ? 0.012 : 0.025) *
        masterVolume;

      gain.gain.setValueAtTime(volume, now);

      gain.gain.exponentialRampToValueAtTime(
        0.001,
        now + 0.065,
      );

      oscillator.connect(gain);
      gain.connect(ctx.destination);

      oscillator.start(now);
      oscillator.stop(now + 0.07);
    },
    [sound, soundEnabled, masterVolume],
  );

  const pressKey = useCallback(
    (id: string) => {
      if (pressed.current.has(id)) return;

      pressed.current.add(id);

      setActiveKeys((current) =>
        current.includes(id)
          ? current
          : [...current, id],
      );

      playSound(id);
    },
    [playSound],
  );

  const releaseKey = useCallback((id: string) => {
    pressed.current.delete(id);

    setActiveKeys((current) =>
      current.filter((item) => item !== id),
    );
  }, []);

  const clearPressed = useCallback(() => {
    pressed.current.clear();
    setActiveKeys([]);
  }, []);

  usePhysicalKeys({
    onDown: (code, event) => {
      const id = CODE_TO_KEY[code];
      if (!id) return;

      // The hook already filtered inputs, repeats and shortcuts; swallow the
      // plain key default so typing here never scrolls the page.
      event.preventDefault();
      pressKey(id);
    },
    onUp: (code) => {
      const id = CODE_TO_KEY[code];
      if (id) releaseKey(id);
    },
    onClear: clearPressed,
  });

  useEffect(() => {
    return () => {
      if (audio.current) {
        void audio.current.close();
      }
    };
  }, []);

  return (
    <section className="min-w-0 w-full">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-white">
            Sound profile
          </p>

          <p className="mt-1 text-xs text-zinc-500">
            Synthesized per key — mixes with the master sound switch
          </p>
        </div>
      </div>

      <div className="mb-4 grid grid-cols-3 gap-2">
        {OPTIONS.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => setSound(option.id)}
            aria-pressed={sound === option.id}
            className={`rounded-xl border p-3 text-sm transition ${
              sound === option.id
                ? "border-violet-400/50 bg-violet-400/10 text-white"
                : "border-white/[0.08] bg-white/[0.02] text-zinc-400 hover:bg-white/[0.05]"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="h-[320px] overflow-hidden rounded-2xl border border-white/10 bg-[#101014] sm:h-[440px]">
        <Canvas
          // Camera directly above the keyboard
          camera={{
            position: [0, 14, 0],
            fov: 42,
            near: 0.1,
            far: 100,
          }}
          dpr={[1, 1.5]}
          shadows
          gl={{
            antialias: true,
            alpha: false,
          }}
        >
          <color
            attach="background"
            args={["#101014"]}
          />

          <ambientLight intensity={1.15} />

          <directionalLight
            position={[-5, 9, 6]}
            intensity={3}
            castShadow
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
          />

          <pointLight
            position={[4, 3, -3]}
            intensity={16}
            color="#8874ff"
          />

          <Environment preset="city" />

          <KeyboardModel
            activeKeys={activeKeys}
            onPress={pressKey}
            onRelease={releaseKey}
          />

          <ContactShadows
            position={[0, -0.3, 0]}
            opacity={0.35}
            scale={19}
            blur={2.5}
            far={5}
          />

          {/* Keep the camera fixed overhead; allow zoom only */}
          <OrbitControls
            target={[0, 0, 0]}
            enableRotate={false}
            enablePan={false}
            enableZoom
            minPolarAngle={0}
            maxPolarAngle={0}
            minDistance={10}
            maxDistance={25}
          />
        </Canvas>
      </div>

      <p className="mt-3 text-center text-[11px] text-zinc-600">
        {activeKeys.length
          ? `Pressed: ${activeKeys
              .map((id) => KEY_LABELS.get(id) || id)
              .join(" + ")}`
          : "Interactive 3D keyboard · Full-size layout"}
      </p>
    </section>
  );
}