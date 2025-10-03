import { EducationSection } from "./EducationSection";
import { ExperienceSection } from "./ExperienceSection";
import { PersonalInfoSection } from "./PersonalInfoSection";
import { ScrapbookCard } from "./ScrapbookCard";
import { SkillsSection } from "./SkillsSection";
import { labels } from "../constants";
import { getTapeVariant } from "../utils";

interface StaticResumeContentProps {
  lang: "zh" | "en";
}

export const StaticResumeContent = ({ lang }: StaticResumeContentProps) => {
  const L = labels[lang];

  return (
    <>
      <ScrapbookCard title={L.personal} tapeVariant={getTapeVariant(0)}>
        <PersonalInfoSection lang={lang} />
      </ScrapbookCard>

      <ScrapbookCard title={L.skills} tapeVariant={getTapeVariant(1)}>
        <SkillsSection lang={lang} />
      </ScrapbookCard>

      <ScrapbookCard title={L.work} tapeVariant={getTapeVariant(2)}>
        <ExperienceSection lang={lang} />
      </ScrapbookCard>

      <ScrapbookCard title={L.edu} tapeVariant={getTapeVariant(3)}>
        <EducationSection lang={lang} />
      </ScrapbookCard>
    </>
  );
};

export default StaticResumeContent;
