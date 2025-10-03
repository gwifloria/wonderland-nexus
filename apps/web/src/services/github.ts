import {
  BlogContent,
  BlogMeta,
  CommitMeta,
  GitHubAPIError,
  GitHubFile,
  GitHubServiceConfig,
} from "@/types/blog";
import matter from "gray-matter";

export class GitHubService {
  private config: Required<GitHubServiceConfig>;

  constructor() {
    this.config = {
      owner: process.env.GITHUB_OWNER || "gwifloria",
      repo: process.env.GITHUB_REPO || "eriko-whispers",
      branch: process.env.GITHUB_BRANCH || "main",
      token: process.env.GITHUB_TOKEN || "",
    };

    if (!process.env.GITHUB_TOKEN) {
      throw new Error("GitHub token is required");
    }
  }

  private async makeRequest(
    url: string,
    options: RequestInit = {},
  ): Promise<Response> {
    const response = await fetch(url, {
      ...options,
      headers: {
        Authorization: `token ${process.env.GITHUB_TOKEN}`,
        Accept: "application/vnd.github.v3+json",
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = new Error(
        `GitHub API error: ${response.statusText}`,
      ) as GitHubAPIError;
      error.status = response.status;
      error.url = url;
      throw error;
    }

    return response;
  }

  /**
   * 获取指定分类下的所有文件
   */
  async listFiles(category: string): Promise<GitHubFile[]> {
    const safePath = category.split("/").map(encodeURIComponent).join("/");
    const url = `https://api.github.com/repos/${this.config.owner}/${this.config.repo}/contents/${safePath}?ref=${encodeURIComponent(this.config.branch)}`;

    const response = await this.makeRequest(url);
    const files: GitHubFile[] = await response.json();

    return files.filter(
      (file) => file.type === "file" && file.name.endsWith(".md"),
    );
  }

  /**
   * 获取文件原始内容
   */
  async getFileContent(path: string): Promise<BlogContent> {
    const safePath = path.split("/").map(encodeURIComponent).join("/");
    const url = `https://api.github.com/repos/${this.config.owner}/${this.config.repo}/contents/${safePath}?ref=${encodeURIComponent(this.config.branch)}`;

    console.log("GitHub Service: Fetching content from:", url);

    const response = await this.makeRequest(url, {
      headers: {
        Accept: "application/vnd.github.raw",
        Authorization: `token ${this.config.token}`,
      },
    });

    const rawContent = await response.text();
    const { data: frontMatter, content } = matter(rawContent);
    console.log(frontMatter, content);
    return {
      content,
      meta: {
        title: frontMatter.title,
        description: frontMatter.description,
        date: frontMatter.date,
        tags: frontMatter.tags,
        category: frontMatter.category,
      },
    };
  }

  /**
   * 获取文件的最新提交信息
   */
  async getCommitInfo(path: string): Promise<CommitMeta> {
    const safePath = path.split("/").map(encodeURIComponent).join("/");
    const url = `https://api.github.com/repos/${this.config.owner}/${this.config.repo}/commits?path=${safePath}&per_page=1&sha=${encodeURIComponent(this.config.branch)}`;

    const response = await this.makeRequest(url);
    const commits = await response.json();

    if (!Array.isArray(commits) || commits.length === 0) {
      throw new Error("No commits found for this file");
    }

    const latestCommit = commits[0];

    return {
      updatedAt:
        latestCommit.commit.committer.date || latestCommit.commit.author.date,
      author: latestCommit.commit.author.name,
      message: latestCommit.commit.message,
      sha: latestCommit.sha,
      url: latestCommit.html_url,
    };
  }

  /**
   * 获取文件内容的 Base64 编码版本（用于特殊情况）
   */
  async getFileContentBase64(
    path: string,
  ): Promise<{ content: string; encoding: string }> {
    const safePath = path.split("/").map(encodeURIComponent).join("/");
    const url = `https://api.github.com/repos/${this.config.owner}/${this.config.repo}/contents/${safePath}?ref=${encodeURIComponent(this.config.branch)}`;

    const response = await this.makeRequest(url);
    const data = await response.json();

    if (data.type !== "file") {
      throw new Error("Path does not point to a file");
    }

    return {
      content: data.content,
      encoding: data.encoding,
    };
  }
}

// 创建单例实例，便于在不同地方使用
export const githubService = new GitHubService();

// 辅助函数：提取文章标题
export function extractTitle(content: string, meta: BlogMeta): string {
  if (meta.title) {
    return meta.title;
  }

  // 尝试从内容中提取第一个 h1 标题
  const h1Match = content.match(/^#\s+(.+)$/m);
  if (h1Match) {
    return h1Match[1].trim();
  }

  return "博客文章";
}

// 辅助函数：生成文章描述
export function extractDescription(content: string, meta: BlogMeta): string {
  if (meta.description) {
    return meta.description;
  }

  // 从内容中提取前150个字符作为描述
  const cleanContent = content
    .replace(/^#.+$/gm, "") // 移除标题
    .replace(/```[\s\S]*?```/g, "") // 移除代码块
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // 移除链接格式，保留文本
    .replace(/[*_`]/g, "") // 移除markdown格式符号
    .trim();

  const firstParagraph = cleanContent.split("\n\n")[0];
  const description =
    firstParagraph.length > 150
      ? firstParagraph.substring(0, 150) + "..."
      : firstParagraph;

  return description || "Floria's Wonderland 博客文章";
}
