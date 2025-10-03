import { BriefIntroduction } from "@/components/BriefIntro";
import { RouteIcon } from "@/components/SmartIcon";
import { routeDescriptions } from "@/constants/routes";
import Image from "next/image";
import Link from "next/link";
import { PageRoute, routes } from "../PageHeader/router";
import UsageGuide from "../UsageGuide";

const NAV = (
  Object.entries(routes) as [PageRoute, { emoji: string; icon?: string }][]
).map(([key, iconConfig]) => ({
  href: key,
  title: key,
  desc: routeDescriptions[key] || "",
  emoji: iconConfig.emoji,
  icon: iconConfig.icon,
}));

export const PaperBackdrop = () => {
  return (
    <>
      <div className="absolute right-28 bottom-0">
        <UsageGuide></UsageGuide>
      </div>
      <Image
        src="/images/paper-beige-texture.png"
        alt="texture"
        fetchPriority="high"
        loading="eager"
        fill
        sizes="100vw"
        style={{ top: "-10px" }}
        className="opacity-90 sm:opacity-0 transition-opacity duration-300 pointer-events-none left-1/2 mx-auto min-w-[120px] max-w-[280px] 
                object-contain "
      />
      <div
        aria-hidden
        className="opacity-95 sm:opacity-0 transition-opacity duration-300 pointer-events-none absolute top-20 left-16 -rotate-6"
      >
        <Image
          src="/images/tape-blue.png"
          alt="tape-blue"
          width={120}
          height={48}
          aria-hidden
          priority
          className="w-24 sm:w-28 drop-shadow-sm"
        />
      </div>

      <div
        aria-hidden
        className="opacity-95 w-24 h-16 sm:opacity-0 transition-opacity duration-300 pointer-events-none absolute bottom-28 right-6 rotate-6"
      >
        <Image
          src="/images/basket-flower.png"
          alt="basket-flower"
          fill
          priority
          aria-hidden
          className="drop-shadow-md"
        />
      </div>

      <div
        aria-hidden
        className="opacity-0 sm:opacity-50 transition-opacity duration-300 w-48 h-60 pointer-events-none absolute bottom-36 left-24 md:left-32 -rotate-12 "
      >
        <Image
          src="/images/book.png"
          alt="book"
          fill
          priority
          aria-hidden
          className="w-48 drop-shadow-md"
        />
      </div>
      <div className="opacity-0 sm:opacity-55 transition-opacity transition-position duration-300 w-48 h-60 pointer-events-none z-1 absolute top-24 right-24 md:right-32 -rotate-8 ">
        <Image
          src="/images/bag-flower.png"
          alt="bag-flower"
          priority
          fill
          className="drop-shadow-md"
        />
      </div>
    </>
  );
};

export const HeroSection = () => {
  return (
    <section className="relative w-full flex flex-col items-center justify-center py-4 sm:px-6 pt-6 z-10">
      {/* Avatar */}
      <div className="relative mb-4 sm:mb-6">
        <div className="rounded-full bg-white/80 shadow-lg p-1.5 sm:p-2">
          <Image
            src="/images/me.png"
            alt="Avatar"
            width={104}
            height={84}
            className="rounded-full border-4 border-mint-200 shadow-xl w-20 h-16"
            priority
          />
        </div>
      </div>

      {/* Welcome Title */}
      <h1 className="typing relative z-10 text-center text-[18px] sm:text-2xl md:text-3xl leading-snug font-serif italic font-bold text-neutral-700 tracking-wide [text-shadow:0.5px_0.5px_0_rgba(0,0,0,0.06)]">
        Welcome to My Wonderland
      </h1>

      <div className="mt-2 max-w-[26rem] text-sm leading-relaxed text-center">
        <BriefIntroduction />
      </div>
    </section>
  );
};

export const CardLink = ({ item }: { item: (typeof NAV)[number] }) => {
  return (
    <Link
      href={item.href}
      aria-label={item.title}
      className="group flex items-center justify-center gap-3 px-3 py-3 rounded-xl hover:bg-white/50 transition-colors"
    >
      <div className="flex-shrink-0 flex items-center justify-center">
        <RouteIcon route={item.href} size={22} />
      </div>
      <div className="min-w-0">
        <div className="flex items-center gap-1">
          <span className="text-neutral-800 font-semibold text-[15px] tracking-tight">
            {item.title}
          </span>
          <span className="opacity-0 group-hover:opacity-100 transition-opacity text-neutral-600">
            →
          </span>
        </div>
        {item.desc && (
          <div className="text-xs text-neutral-600/80 mt-1 leading-relaxed line-clamp-2">
            {item.desc}
          </div>
        )}
      </div>
    </Link>
  );
};
export const NavCards = () => {
  return (
    <nav aria-label="Main sections" className="w-full flex justify-center">
      <div className="relative z-10 w-full max-w-sm grid px-4 sm:px-8 grid-cols-1 py-8 sm:py-8 sm:grid-cols-2 gap-4 sm:gap-6">
        {NAV.map((it) => (
          <CardLink key={it.href} item={it} />
        ))}
      </div>
    </nav>
  );
};
