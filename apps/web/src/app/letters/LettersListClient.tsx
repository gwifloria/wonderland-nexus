// Hybrid SSR + CSR Letters List Component
"use client";
import PageIntro from "@/components/PageIntro";
import { ThreadsListResponse } from "@/services/letters";
import { ThreadApi } from "@/types/letter";
import { fmtDateTime } from "@/util/date";
import Image from "next/image";
import Link from "next/link";
import LettersTechDetails from "./LettersTechDetails";
import { COVERS, STICKER_IMGS, STICKER_POS } from "./constants";
import { initials } from "./util";

interface LettersListClientProps {
  initialData?: ThreadsListResponse;
}

export default function LettersListClient({
  initialData,
}: LettersListClientProps) {
  // Use SSR data initially, then switch to CSR data after user interactions
  const data = {
    data: initialData?.data || [],
    pagination: initialData?.pagination,
  };

  const items = data?.data || [];

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8">
      {/* Header */}
      <header className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-center gap-2 sm:gap-4">
          <h1 className="text-xl sm:text-2xl font-semibold">Letters</h1>
          <PageIntro>
            <LettersTechDetails />
          </PageIntro>
        </div>
      </header>

      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((t, i) => (
          <li key={t.id}>
            <ThreadCard t={t} index={i} />
          </li>
        ))}
      </ul>
    </main>
  );
}

export function ThreadHeader({ t, index }: { t: ThreadApi; index: number }) {
  const cover = COVERS[index % COVERS.length];
  const who = t.participants?.[0]?.address || "";
  const init = initials(who);
  return (
    <>
      {/* 封面背景（按 1~4 轮换） */}
      <Image
        src={cover}
        alt=""
        fill
        priority={index === 0}
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        className="pointer-events-none rounded-2xl object-cover"
      />
      {/* 米白遮罩，保证文字可读性 */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-2xl bg-[#fffdf8]/30 backdrop-blur-[0.5px]"
      />
      {/* 顶部标题背景区分（无渐变，纯色半透明） */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-28 rounded-t-2xl bg-white/40 transition-all group-hover:bg-white/30 backdrop-blur-[1px]"
      />
      {/* 右上角折角 */}
      <span
        aria-hidden
        className="pointer-events-none absolute right-0 top-0 z-[1] h-8 w-8 overflow-hidden"
      >
        <span className="absolute -right-4 -top-4 block h-8 w-8 rotate-45 bg-gradient-to-br from-white to-stone-200/70 shadow-[0_0_1px_rgba(0,0,0,.15)]" />
      </span>
      {/* 右上角邮票：用发件人首字母 */}
      <span
        aria-hidden
        title={who}
        className={[
          "absolute right-3 top-3 z-[1] grid h-10 w-8 place-items-center",
          "rounded-[3px] border border-stone-300/90 bg-white/95",
          "text-[9px] font-semibold tracking-wide text-stone-600",
          "shadow-[inset_0_0_0_1px_rgba(255,255,255,.8)]",
          "before:absolute before:inset-0 before:[background:repeating-linear-gradient(45deg,rgba(0,0,0,.05)_0_2px,transparent_2px_4px)]",
        ].join(" ")}
      >
        <span className="relative z-10">{init}</span>
      </span>
    </>
  );
}

export function ThreadCard({ t, index }: { t: ThreadApi; index: number }) {
  const title = t.subject || "(无标题)";

  return (
    <Link
      href={`/letters/${t.id}`}
      className="group relative block overflow-hidden rounded-2xl border border-stone-300/80 bg-[#fdfdfc] p-4 shadow-[inset_0_1px_0_#fff,0_1px_2px_rgba(0,0,0,.04)] transition-all duration-200 hover:-translate-y-[2px] hover:shadow-lg/30 sm:p-5 h-56 flex flex-col justify-between"
    >
      {" "}
      <ThreadHeader t={t} index={index}></ThreadHeader>
      <div className="flex-1 relative z-[1]">
        {/* 抬头（居中，信件题头味道） */}
        <header className="flex flex-col justify-between pr-14 min-h-[104px] h-auto max-h-32 pt-3 pb-2">
          {/* 留出邮票空间 */}
          <h2 className="font-serif text-[15px] sm:text-[17px] leading-tight text-stone-900 line-clamp-3 [-webkit-text-stroke:0.25px_white] [text-shadow:0_1px_0_#fff,0_0_2px_rgba(0,0,0,.06)] overflow-hidden">
            {title}
          </h2>
          <p className="mt-auto text-xs text-stone-700/90 [text-shadow:0_1px_0_#fff] flex-shrink-0">
            更新于 {fmtDateTime(t.updatedAt)} · {t.messageCount ?? 0} 封
          </p>
        </header>
      </div>
      {/* CTA 行文：更像打开信件 */}
      <p className="mt-auto text-center text-sm text-stone-700">
        <span className="inline-flex items-center gap-1 underline decoration-dotted underline-offset-4 transition-colors group-hover:text-stone-900">
          Open
          <span
            aria-hidden
            className="relative -mt-[1px] inline-block h-[14px] w-[20px]"
          >
            <span className="absolute inset-0 rounded-[2px] border border-stone-400/80 bg-white shadow-[0_0_0_1px_rgba(255,255,255,.6)_inset]" />
            <span className="absolute left-0 right-0 top-0 h-[50%] origin-top transition-transform duration-300 ease-out [clip-path:polygon(0_0,100%_0,50%_100%)] bg-gradient-to-b from-stone-300/90 to-stone-200/60 group-hover:-translate-y-[2px]" />
          </span>
          <span
            aria-hidden
            className="ml-0.5 transition-transform duration-200 group-hover:translate-x-[2px]"
          >
            →
          </span>
        </span>
      </p>
      {/* 角落和纸胶带（低饱和，手帐感） */}
      <span
        aria-hidden
        className="absolute left-3 top-3 h-2 w-10 rotate-[-6deg] rounded-[2px] bg-stone-300/25"
      />
      {/* Removed bottom-right tape */}
      {/* 随机贴纸元素 */}
      {(() => {
        const mod = index % STICKER_IMGS.length;
        const img = STICKER_IMGS[mod];
        const pos = STICKER_POS[index % STICKER_POS.length];
        return (
          <Image
            width={32}
            height={48}
            src={img}
            alt=""
            className={`pointer-events-none absolute opacity-60 drop-shadow-[0_1px_1px_rgba(0,0,0,.08)] ${pos}`}
          />
        );
      })()}
    </Link>
  );
}
