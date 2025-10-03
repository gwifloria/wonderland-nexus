// LetterCard.tsx
import clsx from "clsx";
import "./index.scss";
type Props = {
  title: string;
  updatedAt: string; // 已格式化的时间，如 “更新于 2025年8月30日”
  count?: number; // 例如 3（封）
  onOpen?: () => void;
  className?: string;
  ctaText?: string; // 例如 “点击查看对话 →”
};

export default function LetterCard({
  title,
  updatedAt,
  count,
  onOpen,
  className,
  ctaText = "📨 打开信件 →",
}: Props) {
  return (
    <article
      className={clsx(
        // 基础纸张
        "relative isolate overflow-hidden rounded-[16px] border border-stone-200/80 bg-paper shadow-[0_1px_0_#fff_inset]",
        // 微内阴影 + 悬停抬起
        "transition-all duration-200 hover:-translate-y-[2px] hover:shadow-lg",
        // 细节：内边距与栅格
        "px-5 py-4 sm:px-6 sm:py-5",
        className,
      )}
      role="group"
    >
      {/* 折角（右上角小翻页） */}
      <span
        aria-hidden
        className="pointer-events-none absolute right-0 top-0 h-8 w-8 overflow-hidden"
      >
        <span className="absolute -right-4 -top-4 block h-8 w-8 rotate-45 bg-gradient-to-br from-white to-stone-200/70 shadow-[0_0_1px_rgba(0,0,0,.15)]" />
      </span>

      {/* 邮票（右上角） */}
      <span
        aria-hidden
        className="absolute right-3 top-3 grid h-10 w-8 place-items-center rounded-sm border border-stone-300 bg-stamp text-[10px] font-medium text-stone-600/70"
        title="stamp"
      >
        G
      </span>

      {/* 抬头区 */}
      <header className="pr-12">
        <h3 className="text-center font-serif text-[18px] leading-snug text-stone-800 sm:text-[19px]">
          {title}
        </h3>
        <p className="mt-2 text-center text-[12px] text-stone-500">
          {updatedAt}
          {typeof count === "number" && <> · {count} 封</>}
        </p>
      </header>

      {/* 虚线分隔，像撕纸 */}
      <hr className="my-4 border-0 border-t border-dashed border-stone-300/80" />

      {/* CTA */}
      <button
        onClick={onOpen}
        className={clsx(
          "mx-auto block rounded-md px-3 py-1.5 text-[13px] font-medium",
          "text-stone-700 underline decoration-dotted underline-offset-[6px]",
          "transition-colors hover:text-stone-900 group-hover:text-stone-900",
        )}
      >
        {ctaText}
      </button>

      {/* 四角贴纸（低调一点，手账感） */}
      <span
        aria-hidden
        className="absolute left-2 top-2 h-3 w-10 rotate-[-6deg] rounded-[2px] bg-stone-300/40"
      />
      <span
        aria-hidden
        className="absolute bottom-2 right-4 h-3 w-8 rotate-[8deg] rounded-[2px] bg-stone-300/30"
      />
    </article>
  );
}
