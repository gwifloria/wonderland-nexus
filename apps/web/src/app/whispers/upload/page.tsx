// app/whispers/upload/page.tsx
import AntDShell from "@/provider/AntDShell";
import { SWRShell } from "@/provider/SWRShell";
import WhisperUploadClient from "./WhisperUploadClient";

export const metadata = {
  title: "Upload Whispers - Floria's Wonderland",
  description: "Import whisper HTML exports",
  robots: { index: false, follow: false },
};

export default function WhisperUploadPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <AntDShell>
        <SWRShell>
          <WhisperUploadClient />
        </SWRShell>
      </AntDShell>
    </div>
  );
}
