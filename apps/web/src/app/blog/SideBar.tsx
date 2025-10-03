import { blogService } from "@/services/blog";
import { Skeleton } from "antd";
import Link from "next/link";
import Icon from "@/components/SmartIcon";
import PinControl from "./components/PinControl";
import { categories, CatKey, catStyles, cx } from "./constants";
// components/ui/SectionTape.tsx
export function SectionTape({ label }: { label: string }) {
  return (
    <div className="relative inline-flex items-center gap-2 pl-2">
      <span
        className="absolute -top-2 -left-4 rotate-[-6deg] w-20 h-4
        bg-[url('/stickers/tape-blue.png')] bg-contain bg-no-repeat opacity-90"
      />
      <span className="font-semibold tracking-wide text-neutral-700">
        {label}
      </span>
    </div>
  );
}
function toSlugPath(p: string) {
  return p.split("/").map(encodeURIComponent).join("/");
}

async function SidebarSection({
  category,
  activePost,
}: {
  category: CatKey;
  activePost: string;
}) {
  const isByteNotes = category === "ByteNotes";
  const { dot } = catStyles(category);

  try {
    // 直接调用服务层获取整合后的数据
    const group = await blogService.getBlogListWithPinData(category);
    if (group.length === 0) {
      return (
        <section className="space-y-2">
          <header className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">
            <span className={cx("inline-block h-2 w-2 rounded-sm", dot)} />
            <span className="font-medium">{category}</span>
          </header>
          <div className="text-xs text-neutral-400 px-3 py-2">暂无文章</div>
        </section>
      );
    }

    return (
      <section className="space-y-1">
        <header className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">
          <span className={cx("inline-block h-2 w-2 rounded-sm", dot)} />
          <span className="font-medium">{category}</span>
          {isByteNotes ? (
            <span className="ml-1 font-mono text-[11px] opacity-80">
              {"</>"}
            </span>
          ) : (
            <span className="ml-1 text-[13px]">💭</span>
          )}
        </header>
        <ul className="space-y-1">
          {group?.map((file) => {
            // URL decode activePost for comparison
            const decodedActivePost = decodeURIComponent(activePost);
            const isActive = file.path === decodedActivePost;
            const display = (file.title || file.name).replace(
              /\.(md|mdx)$/i,
              "",
            );
            const href = `/blog/${toSlugPath(file.path)}`;
            return (
              <li
                className="border-b border-dotted border-neutral-300/60 last:border-b"
                key={file.path}
              >
                <Link
                  href={href}
                  aria-label="page"
                  title={display} // Show full title on hover
                  className={cx(
                    "group relative block rounded-md px-3 py-2 text-sm transition-colors text-neutral-700",
                    "hover:text-neutral-900 hover:bg-neutral-100 ",
                    isActive &&
                      "bg-mint-50/50 text-mint-700 border-l-2 border-mint-300",
                  )}
                >
                  <span className="flex items-center gap-2">
                    {file.isPinned && (
                      <Icon
                        name="pin-icon"
                        size={16}
                        className="text-amber-500 flex-shrink-0"
                      />
                    )}
                    <span className="truncate">{display}</span>
                  </span>
                  <PinControl post={file} category={category} />
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
    );
  } catch (error) {
    console.error(`Error loading sidebar for category ${category}:`, error);
    return (
      <section className="space-y-2">
        <header className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">
          <span className={cx("inline-block h-2 w-2 rounded-sm", dot)} />
          <span className="font-medium">{category}</span>
        </header>
        <Skeleton
          active
          title={false}
          paragraph={{ rows: 3, width: ["80%", "60%", "72%"] }}
          className="!m-0"
        />
      </section>
    );
  }
}

export const Sidebar = ({ activePost }: { activePost: string }) => {
  return (
    <>
      <Link
        href="/blog"
        aria-label="Go to Blog home"
        className="inline-block font-bold text-lg mb-4 text-neutral-800 hover:text-nepal-600 transition-colors"
      >
        Blog
      </Link>
      <nav className="space-y-5">
        {categories.map((g) => (
          <SidebarSection
            key={g.key}
            category={g.key}
            activePost={activePost}
          />
        ))}
      </nav>
    </>
  );
};
