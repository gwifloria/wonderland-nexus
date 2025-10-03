import {
  experiences,
  DECORATION_IMAGES,
  DECORATION_SIZES,
  SPACING,
} from "../constants";
import { getLocalizedText } from "../utils";
import { ProjectItem } from "./ProjectItem";
import { FloatingDecoration } from "./FloatingDecoration";

function TimelineBar() {
  return (
    <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-lg bg-gradient-to-b from-rose-200 to-rose-400" />
  );
}

type Lang = "zh" | "en";

interface ExperienceSectionProps {
  lang: Lang;
}

export function ExperienceSection({ lang }: ExperienceSectionProps) {
  return (
    <div className="relative">
      <div className={SPACING.contentGap}>
        {experiences.map((exp, idx) => (
          <div key={idx} className="relative pl-6">
            <TimelineBar />

            <div className="flex justify-between items-start mb-1">
              <h3 className="mb-0 text-lg font-semibold">
                {getLocalizedText(exp.company, lang)} —{" "}
                {getLocalizedText(exp.role, lang)}
              </h3>
              <span className="text-sm text-neutral-500">{exp.period}</span>
            </div>

            <p className="text-neutral-700 mb-0">
              {getLocalizedText(exp.description, lang)}
            </p>

            {exp.projects && exp.projects.length > 0 && (
              <div className="mt-3 space-y-4">
                {exp.projects.map((project, i) => (
                  <ProjectItem key={i} project={project} lang={lang} />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <FloatingDecoration
        src={DECORATION_IMAGES.phoneWhite}
        alt="phone"
        width={DECORATION_SIZES.phone.width}
        height={DECORATION_SIZES.phone.height}
        className="-bottom-4 right-5"
      />
    </div>
  );
}
