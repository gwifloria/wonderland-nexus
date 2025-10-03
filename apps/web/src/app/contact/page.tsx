import { labels } from "./constants";
import { GapMarkdown } from "./components/GapMarkdown";
import "./print.css";

// Components
import ResumeWrapper from "@/components/ResumeWrapper";
import { githubService } from "@/services/github";
import { HeroSection } from "./components/HeroSection";
import { PaperContainer } from "./components/PaperContainer";
import { ScrapbookCard } from "./components/ScrapbookCard";
import { StaticResumeContent } from "./components/StaticResumeContent";
import { PrintButton } from "./PrintButton";
import { getTapeVariant } from "./utils";

export default async function AboutMePage() {
  const lang = "zh";
  const L = labels[lang];

  // 尝试 SSR 获取远程 Resume.md
  let resumeContent = null;

  try {
    const result = await githubService.getFileContent("resume.md");
    console.log("Contact page: result from githubService:", result);

    resumeContent = result.content;
  } catch (error) {
    console.log("Contact page: Error caught:", error);
    console.log("Contact page: Resume.md not found, using static content");
  }

  return (
    <>
      <main id="about" className="about-page min-h-screen">
        <PaperContainer>
          <HeroSection lang={lang} />

          <div className="space-y-10">
            <section>
              <ResumeWrapper
                content={resumeContent || undefined}
                fallbackComponent={<StaticResumeContent lang={lang} />}
              />

              <ScrapbookCard
                title={L.journey}
                className="space-y-6 print:hidden"
                tapeVariant={getTapeVariant(4)}
              >
                <div className="mx-auto leading-8">
                  <GapMarkdown />
                </div>
              </ScrapbookCard>
            </section>
          </div>
        </PaperContainer>
        <PrintButton></PrintButton>
      </main>
    </>
  );
}
