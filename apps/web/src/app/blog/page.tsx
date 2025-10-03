import AntDShell from "@/provider/AntDShell";
import { EmptyState } from "./components/EmptyState";

export default function BlogIndex() {
  return (
    <AntDShell>
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <EmptyState />
      </div>
    </AntDShell>
  );
}
