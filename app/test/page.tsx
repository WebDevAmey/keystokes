import type { Metadata } from "next";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import AudioStatusPill from "@/components/studio/AudioStatusPill";
import TypingTest from "@/components/test/typing-test";

export const metadata: Metadata = {
  title: "Type Test · Keywave",
  description:
    "A minimalist typing test with live WPM, accuracy, and keyboard sound.",
};

export default function TypeTestPage() {
  return (
    <div className="min-h-screen bg-[#140f18]">
      <SiteHeader right={<AudioStatusPill />} />
      <TypingTest />
      <div className="mx-auto w-full max-w-6xl px-5 pb-8 sm:px-8">
        <SiteFooter />
      </div>
    </div>
  );
}
