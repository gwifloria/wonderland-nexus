import { education, SPACING } from "../constants";
import { getLocalizedText } from "../utils";

function TimelineBar() {
  return (
    <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-lg bg-gradient-to-b from-rose-200 to-rose-400" />
  );
}

type Lang = "zh" | "en";

interface EducationSectionProps {
  lang: Lang;
}

export function EducationSection({ lang }: EducationSectionProps) {
  return (
    <div className={SPACING.contentGap}>
      {education.map((edu, idx) => (
        <div key={idx} className="relative pl-6">
          <TimelineBar />

          <div className="flex justify-between items-start mb-2">
            <h3 className="mb-1 text-lg font-semibold">
              {getLocalizedText(edu.degree, lang)}
            </h3>
            <span className="text-sm text-neutral-500">{edu.period}</span>
          </div>

          <span className="mb-2 block bg-gradient-to-r from-rose-500 to-rose-700 bg-clip-text text-transparent font-semibold">
            {getLocalizedText(edu.school, lang)}
          </span>

          <p className="text-neutral-700 mb-0">
            {getLocalizedText(edu.description, lang)}
          </p>
        </div>
      ))}
    </div>
  );
}
