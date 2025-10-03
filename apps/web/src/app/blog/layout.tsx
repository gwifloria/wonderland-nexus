import NotebookPaper from "@/components/NotebookPaper";
import AntDShell from "@/provider/AntDShell";
import { SWRShell } from "@/provider/SWRShell";
import Image from "next/image";
import React from "react";
import { Sidebar } from "./SideBar";

export default function BlogLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug?: string[] }>;
}) {
  const resolved = React.use(params);
  const activePost = Array.isArray(resolved?.slug)
    ? resolved.slug.map(decodeURIComponent).join("/")
    : "";

  return (
    <AntDShell>
      <SWRShell>
        <div className="flex h-full pt-8 justify-center">
          <NotebookPaper className="w-[300px] flex:1 md:flex-shrink-0 border-r p-6  overflow-y-auto h-full">
            <Sidebar activePost={activePost} />
          </NotebookPaper>
          <div className="hidden overflow-hidden md:block flex-1 ml-2 min-w-0 h-full relative">
            <div className="absolute inset-0 pointer-events-none opacity-[0.35] z-0">
              <Image
                src="/images/blog-empty.png"
                alt=""
                fill
                style={{
                  objectFit: "cover",
                  mixBlendMode: "multiply",
                }}
                className="opacity-80"
              />
            </div>
            <div className="relative z-10 w-full h-full py-4 px-6 md:py-8">
              {children}
            </div>
          </div>
        </div>
      </SWRShell>
    </AntDShell>
  );
}
