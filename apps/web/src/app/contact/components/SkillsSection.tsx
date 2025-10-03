import { skills } from "../constants";
import { getLocalizedText } from "../utils";

type Lang = "zh" | "en";

interface SkillsSectionProps {
  lang: Lang;
}

interface TechBadgeProps {
  text: string;
  size?: "sm" | "md";
}

export function TechBadge({ text, size = "md" }: TechBadgeProps) {
  const sizeClasses = {
    sm: "px-2 py-1 text-xs",
    md: "px-3 py-1.5 text-sm",
  };

  return (
    <div
      className={`${sizeClasses[size]} font-medium rounded-full bg-milktea-100 text-neutral-700 border border-milktea-300 hover:bg-rose-100 transition-colors`}
    >
      {text}
    </div>
  );
}
export function SkillsSection({ lang }: SkillsSectionProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {skills.map((skill: string | { zh: string; en: string }, idx: number) => (
        <TechBadge key={idx} text={getLocalizedText(skill, lang)} />
      ))}
    </div>
  );
}
