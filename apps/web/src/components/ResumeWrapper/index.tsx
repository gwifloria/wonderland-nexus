import { PROSE_CLASS } from "@/app/blog/constants";
import { ScrapbookCard } from "@/app/contact/components/ScrapbookCard";
import { getTapeVariant } from "@/app/contact/utils";
import {
  createMarkdownComponents,
  type MarkdownSize,
} from "@/components/Markdown";
import matter from "gray-matter";
import { ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypePrism from "rehype-prism-plus";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";

interface ResumeWrapperProps {
  /** Resume 内容 */
  content?: string;
  /** 静态组件降级 */
  fallbackComponent: ReactNode;
  /** 字号大小 */
  size?: MarkdownSize;
}

interface ResumeSection {
  title: string;
  content: string;
  order: number;
}

interface PersonalInfo {
  content: string;
}

export const ResumeWrapper = ({
  content,
  fallbackComponent,
  size = "default",
}: ResumeWrapperProps) => {
  // 有内容就解析显示，没内容显示静态降级
  if (content) {
    const { content: markdownContent } = matter(content);
    const { personalInfo, sections } = parseMarkdownContent(markdownContent);
    return (
      <ResumeContent
        personalInfo={personalInfo}
        sections={sections}
        size={size}
      />
    );
  }

  // 没有内容，显示静态组件
  console.log("ResumeWrapper: Using static fallback");
  return <>{fallbackComponent}</>;
};

// 提取渲染逻辑为独立组件
const ResumeContent = ({
  personalInfo,
  sections,
  size,
}: {
  personalInfo: PersonalInfo | null;
  sections: ResumeSection[];
  size: MarkdownSize;
}) => {
  return (
    <div className="space-y-10">
      {/* Personal Info Header - 只在打印时显示 */}
      {personalInfo && (
        <div className="hidden print:block print:mb-8">
          <div className="text-center border-b-2 border-gray-300 pb-4 mb-6">
            <div className={`prose prose-sm max-w-none ${PROSE_CLASS}`}>
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[
                  rehypeSlug,
                  rehypeAutolinkHeadings,
                  rehypePrism,
                ]}
                components={createMarkdownComponents(size)}
              >
                {personalInfo.content}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      )}

      {sections.map((section, index) => (
        <ScrapbookCard
          key={section.title}
          title={section.title}
          tapeVariant={getTapeVariant(index)}
        >
          <div className={`prose prose-sm max-w-none ${PROSE_CLASS}`}>
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeSlug, rehypeAutolinkHeadings, rehypePrism]}
              components={createMarkdownComponents(size)}
            >
              {section.content}
            </ReactMarkdown>
          </div>
        </ScrapbookCard>
      ))}
    </div>
  );
};

/**
 * 解析markdown内容，提取H1个人信息和H2分段内容
 */
function parseMarkdownContent(content: string): {
  personalInfo: PersonalInfo | null;
  sections: ResumeSection[];
} {
  const lines = content.split("\n");
  const sections: ResumeSection[] = [];
  let personalInfo: PersonalInfo | null = null;
  let currentSection: ResumeSection | null = null;
  let personalInfoContent = "";
  let order = 0;
  let inPersonalInfo = false;

  for (const line of lines) {
    // 检测一级标题 (个人信息)
    if (line.startsWith("# ")) {
      inPersonalInfo = true;
      personalInfoContent = line + "\n";
    }
    // 检测二级标题 (简历分段)
    else if (line.startsWith("## ")) {
      // 结束个人信息收集
      if (inPersonalInfo) {
        personalInfo = { content: personalInfoContent.trim() };
        inPersonalInfo = false;
      }

      // 保存上一个section
      if (currentSection) {
        sections.push(currentSection);
      }

      // 开始新的section
      const title = line.replace("## ", "").trim();
      currentSection = {
        title,
        content: "",
        order: order++,
      };
    }
    // 收集内容
    else if (inPersonalInfo) {
      // 添加到个人信息
      personalInfoContent += line + "\n";
    } else if (currentSection) {
      // 添加到当前section
      currentSection.content += line + "\n";
    }
  }

  // 处理剩余内容
  if (inPersonalInfo && personalInfoContent.trim()) {
    personalInfo = { content: personalInfoContent.trim() };
  }
  if (currentSection) {
    sections.push(currentSection);
  }

  return {
    personalInfo,
    sections: sections.map((section) => ({
      ...section,
      content: section.content.trim(),
    })),
  };
}

export default ResumeWrapper;
