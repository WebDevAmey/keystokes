import type { Metadata } from "next";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import AudioStatusPill from "@/components/studio/AudioStatusPill";
import MusicStudio from "@/components/studio/music-studio";

export const metadata: Metadata = {
  title: "Sound Studio · Keywave",
  description:
    "Map notes, percussion, and SoundCN effects to keyboard keys and play tunes.",
};

export default function StudioPage() {
  return (
    <div className="min-h-screen bg-kw-bg text-kw-text">
      <SiteHeader right={<AudioStatusPill />} />
      <MusicStudio />
      <div className="mx-auto w-full max-w-7xl px-5 pb-8 sm:px-8">
        <SiteFooter />
      </div>
    </div>
  );
}
