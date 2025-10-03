import PageIntro from "@/components/PageIntro";
import Image from "next/image";
import BlogTechDetails from "../BlogTechDetails";

export function EmptyState() {
  return (
    <>
      <div className="relative  flex items-center flex-col justify-center rounded-xl min-h-[500px]">
        <div className="max-w-5xl text-left mx-auto p-6 relative z-10 bg-white/70 backdrop-blur-sm rounded-xl shadow-sm border border-milktea-200">
          <div className="flex align-center">
            <h2 className="text-xl mr-8 font-semibold mb-4 text-milktea-800">
              欢迎来到我的 blog 区
            </h2>
            <div className="h-[60px] w-[40px] right-0 bottom-0 absolute opacity-30 z-10">
              <Image
                alt="corner"
                fill
                src="/images/girl-with-book-brown.png"
              ></Image>
            </div>
            <PageIntro>
              <BlogTechDetails />
            </PageIntro>
          </div>

          <p className="text-milktea-700 mb-2">在这里你可以浏览两类文章：</p>
          <ul className="list-disc list-inside text-milktea-700">
            <li>
              <strong>ByteNotes</strong>：技术学习与开发笔记
            </li>
            <li>
              <strong>Murmurs</strong>：日常感想与随笔（可能会有点读书笔记）
            </li>
          </ul>
          <p className="mt-4 text-milktea-600 text-sm">
            从左侧选择一篇文章开始阅读吧。
          </p>
        </div>
      </div>
    </>
  );
}
