// app/letters/page.tsx
import { SWRShell } from "@/provider/SWRShell";
import { lettersService } from "@/services/letters";
import LettersListClient from "./LettersListClient";

export const metadata = {
  title: "Letters",
  robots: { index: true, follow: true },
};

export default async function LettersPage() {
  // SSR: Get initial data directly from service layer
  let initialData;
  let initialError = null;

  try {
    const rawData = await lettersService.getThreadsList({
      q: "",
      page: 1,
      limit: 20,
    });
    // Serialize the data to ensure it's plain objects for client components
    initialData = JSON.parse(JSON.stringify(rawData));
  } catch (error) {
    console.error("SSR: Failed to fetch letters list:", error);
    initialError = "Failed to load letters";
    initialData = {
      data: [],
      pagination: { page: 1, limit: 20, total: 0, pages: 0 },
    };
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <SWRShell>
        <LettersListClient initialData={initialData} />
      </SWRShell>
    </div>
  );
}
