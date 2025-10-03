import Image from "next/image";
import {
  DECORATION_IMAGES,
  HERO_TITLE_STYLE,
  labels,
  THEME_COLORS,
} from "../constants";

type Lang = "zh" | "en";

interface HeroSectionProps {
  lang: Lang;
  onLanguageChange?: (lang: Lang) => void;
}

export function HeroSection({ lang, onLanguageChange }: HeroSectionProps) {
  const L = labels[lang];

  return (
    <div
      className={`text-center mb-16 ${THEME_COLORS.cardBg} ${THEME_COLORS.border} border rounded-2xl p-6 print:hidden`}
    >
      <div className="relative inline-block mb-6">
        <div className="pointer-events-none absolute -top-6 left-2 rotate-24 opacity-90 w-10 h-10 print:hidden">
          <Image
            priority
            src={DECORATION_IMAGES.whiteBow}
            alt="bow"
            width={40}
            height={40}
            className="object-contain"
          />
        </div>

        <div className="w-[140px] h-[120px] relative">
          <Image
            priority
            fill
            alt="avatar"
            src="/images/me.png"
            className="border-4 rounded-full object-cover border-white shadow-lg"
            sizes="140px"
          />
        </div>
      </div>

      <h1
        className="text-rose-600 text-4xl font-bold mb-4 tracking-wide"
        style={HERO_TITLE_STYLE}
      >
        {L.about}
      </h1>

      <p className="text-base leading-relaxed text-neutral-700/90 max-w-2xl mx-auto">
        Hi there! I&apos;m a passionate developer who loves creating beautiful
        and functional web experiences. I believe in writing clean, maintainable
        code and always learning new technologies.
      </p>
    </div>
  );
}
