import { getLocalizedText } from "../utils";
import { TechBadge } from "./SkillsSection";

type Lang = "zh" | "en";

interface Project {
  name: { zh: string; en: string };
  period: string;
  tech: { zh: string; en: string }[];
  highlights: { zh: string[]; en: string[] };
}

interface ProjectItemProps {
  project: Project;
  lang: Lang;
}

export function ProjectItem({ project, lang }: ProjectItemProps) {
  return (
    <div className="pl-3 border-l border-slate-200">
      <div className="flex justify-between items-start">
        <strong className="text-neutral-500">
          ✎ {getLocalizedText(project.name, lang)}
        </strong>
        <span className="text-xs text-neutral-500">{project.period}</span>
      </div>

      <div className="flex flex-wrap gap-2 my-2">
        {project.tech.map((tech, idx) => (
          <TechBadge key={idx} text={getLocalizedText(tech, lang)} size="sm" />
        ))}
      </div>

      <ul className="list-disc pl-5 text-neutral-700">
        {project.highlights[lang].map((highlight, idx) => (
          <li key={idx} className="mb-1">
            {highlight}
          </li>
        ))}
      </ul>
    </div>
  );
}
