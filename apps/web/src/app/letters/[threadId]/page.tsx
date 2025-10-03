// app/letters/[threadId]/page.tsx
import { SWRShell } from "@/provider/SWRShell";
import LetterDetailClient from "./LetterDetailClient";

export const metadata = {
  title: "Letter",
  robots: { index: false, follow: true },
};

export default async function ThreadPage({
  params,
}: {
  params: Promise<{ threadId: string }>;
}) {
  const { threadId } = await params;
  return (
    <SWRShell>
      <LetterDetailClient threadId={threadId} />
    </SWRShell>
  );
}
