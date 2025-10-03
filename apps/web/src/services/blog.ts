import { dbConnect } from "@wonderland/database";
import BlogPost from "@/app/api/models/BlogPost";
import { CatKey } from "@/types/blog";
import { BlogPostItem, PinnedPost } from "@/types/blog";
import { githubService } from "./github";

export class BlogService {
  /**
   * 获取指定分类的置顶文章数据
   */
  async getPinnedPostsForCategory(category: string): Promise<PinnedPost[]> {
    try {
      await dbConnect();
      const pinnedPosts = await BlogPost.find({
        category,
        isPinned: true,
      }).lean();

      return pinnedPosts.map((post) => ({
        path: post.path,
        category: post.category,
        title: post.title,
        isPinned: post.isPinned,
        pinOrder: post.pinOrder || 0,
      }));
    } catch (error) {
      console.error(
        `Error fetching pinned posts for category ${category}:`,
        error,
      );
      return [];
    }
  }

  /**
   * 整合 GitHub 文件列表与置顶数据
   */
  async getBlogListWithPinData(category: string): Promise<BlogPostItem[]> {
    try {
      // 并行获取 GitHub 文件和置顶数据
      const [markdownFiles, pinnedPosts] = await Promise.all([
        githubService.listFiles(category),
        this.getPinnedPostsForCategory(category),
      ]);

      // 创建置顶文章映射
      const pinnedPostMap = new Map(
        pinnedPosts.map((post) => [post.path, post]),
      );

      // 合并数据
      const filesWithMetadata: BlogPostItem[] = markdownFiles.map((file) => {
        const pinnedPost = pinnedPostMap.get(file.path);
        return {
          name: file.name,
          path: file.path,
          isPinned: Boolean(pinnedPost),
          pinOrder: pinnedPost?.pinOrder || 0,
          title: pinnedPost?.title || file.name.replace(".md", ""),
        };
      });

      // 排序：置顶文章在前（按 pinOrder），然后是普通文章（按名称）
      const pinnedFiles = filesWithMetadata
        .filter((file) => file.isPinned)
        .sort((a, b) => a.pinOrder - b.pinOrder);

      const unpinnedFiles = filesWithMetadata
        .filter((file) => !file.isPinned)
        .sort((a, b) => a.name.localeCompare(b.name));

      return [...pinnedFiles, ...unpinnedFiles];
    } catch (error) {
      console.error(
        `Error fetching blog list for category ${category}:`,
        error,
      );
      return [];
    }
  }

  /**
   * 获取所有分类的博客文章（用于 sitemap 等）
   */
  async getAllBlogPosts(): Promise<BlogPostItem[]> {
    const categories: CatKey[] = ["ByteNotes", "Murmurs"];
    const allPosts: BlogPostItem[] = [];

    for (const category of categories) {
      const posts = await this.getBlogListWithPinData(category);
      allPosts.push(...posts);
    }

    return allPosts;
  }

  /**
   * 检查文章是否为置顶文章
   */
  async isPostPinned(path: string, category: string): Promise<boolean> {
    try {
      await dbConnect();
      const post = await BlogPost.findOne({
        path,
        category,
        isPinned: true,
      }).lean();

      return Boolean(post);
    } catch (error) {
      console.error(`Error checking pin status for ${path}:`, error);
      return false;
    }
  }

  /**
   * 更新文章置顶状态（供 API 使用）
   */
  async updatePostPinStatus(
    path: string,
    category: string,
    title: string,
    isPinned: boolean,
    pinOrder?: number,
  ): Promise<boolean> {
    try {
      await dbConnect();

      if (isPinned) {
        await BlogPost.findOneAndUpdate(
          { path, category },
          {
            path,
            category,
            title,
            isPinned: true,
            pinOrder: pinOrder || 0,
          },
          { upsert: true, new: true },
        );
      } else {
        await BlogPost.findOneAndDelete({ path, category });
      }

      return true;
    } catch (error) {
      console.error(`Error updating pin status for ${path}:`, error);
      return false;
    }
  }
}

// 创建单例实例
export const blogService = new BlogService();
