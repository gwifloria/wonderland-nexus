// app/whispers/page.tsx
import AntDShell from "@/provider/AntDShell";
import { SWRShell } from "@/provider/SWRShell";
import WhisperTimelineClient from "./WhisperTimelineClient";

export const metadata = {
  title: "Whispers - Floria's Wonderland",
  description: "Personal thoughts and fleeting moments",
  robots: { index: true, follow: true },
};

export default function WhispersPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <AntDShell>
        <SWRShell>
          <WhisperTimelineClient />
        </SWRShell>
      </AntDShell>
    </div>
  );
}
