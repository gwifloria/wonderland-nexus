export default function CommitInfo() {
  const app = process.env.NEXT_PUBLIC_COMMIT_ID ?? "unknown";
  const buildTime = process.env.NEXT_PUBLIC_BUILD_TIME ?? "unknown";

  return (
    <div className="fixed opacity-20 bottom-2 right-2 bg-neutral-50/70 backdrop-blur-sm px-2 py-1 rounded text-[11px] leading-4 text-neutral-400 print:hidden">
      <span className="mr-3 hidden">
        App: <code>{app}</code>
      </span>
      <span>
        Built: <code>{buildTime}</code>
      </span>
    </div>
  );
}
