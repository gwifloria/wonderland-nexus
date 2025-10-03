"use client";
import JournalPagination from "@/components/JournalPagination";
import PageIntro from "@/components/PageIntro";
import { WhisperListResponse, WhisperStatsResponse } from "@/types/whisper";
import { Empty, Input, Spin, Tag } from "antd";
import Image from "next/image";
import { useState } from "react";
import useSWR from "swr";
import WhisperAdminControls from "./components/WhisperAdminControls";
import WhisperEntryCard from "./components/WhisperEntryCard";
import WhisperTechDetails from "./WhisperTechDetails";

const { Search } = Input;

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function WhisperTimelineClient() {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Build query string
  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: "20",
    ...(searchQuery && { search: searchQuery }),
    ...(selectedTag && { tag: selectedTag }),
  });

  const { data, error, isLoading, mutate } = useSWR<WhisperListResponse>(
    `/api/whispers/list?${queryParams}`,
    fetcher,
  );

  // Get stats for header
  const { data: stats } = useSWR<WhisperStatsResponse>(
    "/api/whispers/stats",
    fetcher,
  );

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setPage(1);
  };

  const handleTagClick = (tag: string) => {
    if (selectedTag === tag) {
      setSelectedTag(null);
    } else {
      setSelectedTag(tag);
      setPage(1);
    }
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center p-12 text-red-600 bg-red-50 border border-red-200 rounded-xl">
          Failed to load whisper entries. Please try again.
        </div>
      </div>
    );
  }

  return (
    <main className="relative max-w-4xl mx-auto px-4 py-8">
      {/* Layer 2: Notebook journal spread (decorative focal point) */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.2] -z-10 flex items-center justify-center">
        <Image
          src="/images/blue-beach.png"
          alt=""
          fill
          className="scale-150 md:scale-125 lg:scale-150 opacity-70"
        />
      </div>

      {/* Left side beach decoration */}
      <div className="fixed left-4 top-1/4 pointer-events-none opacity-50 -z-10 hidden lg:block">
        <Image
          src="/images/blue-billboard.png"
          alt=""
          width={180}
          height={240}
          priority
          className="-rotate-12"
          style={{ objectFit: "contain" }}
        />
      </div>

      {/* Right side beach decoration */}
      <div className="fixed right-12 top-1/3 pointer-events-none opacity-30 -z-10 hidden lg:block">
        <Image
          src="/images/sea-dream-catcher.png"
          alt=""
          width={160}
          height={220}
          priority
          className="rotate-6"
          style={{ objectFit: "contain" }}
        />
      </div>

      {/* Header */}
      <header className="relative flex flex-col gap-2 mb-8">
        {/* Left top decoration - sea star */}
        <div className="absolute -left-2 -top-4 w-16 h-16 rotate-12 opacity-60 pointer-events-none">
          <Image src="/images/sea-star.png" alt="" fill />
        </div>

        {/* Right top decoration - island silhouette */}
        <div className="absolute -right-3 -top-6 w-24 h-20 -rotate-6 opacity-50 pointer-events-none">
          <Image src="/images/island-white-hengfu.png" alt="" fill />
        </div>

        {/* Header content with backdrop */}
        <div className="relative z-10 bg-sand-50/70 backdrop-blur-sm rounded-xl p-4 border-2 border-dashed border-sand-300">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold text-sand-800">Whispers</h1>
              <PageIntro>
                <WhisperTechDetails />
              </PageIntro>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Search box with decoration */}
              <div className="relative">
                <div className="absolute -top-2 -left-3 w-8 h-8 rotate-12 opacity-60 z-10 pointer-events-none">
                  <Image src="/images/stamp-memories.png" alt="" fill />
                </div>
                <Search
                  placeholder="Search whispers..."
                  allowClear
                  onSearch={handleSearch}
                  style={{
                    width: 200,
                    fontFamily: "'Caveat', cursive",
                  }}
                  size="small"
                  className="rounded-lg whisper-search-input"
                  classNames={{
                    input: "font-handwritten",
                  }}
                />
              </div>

              <WhisperAdminControls onClearSuccess={() => mutate()} />
            </div>
          </div>

          {selectedTag && (
            <div className="flex items-center gap-2">
              <Tag
                closable
                onClose={() => setSelectedTag(null)}
                className="bg-rose-100 text-rose-600 border-rose-200"
              >
                #{selectedTag}
              </Tag>
            </div>
          )}

          {/* Stats as footnote */}
          {stats && (
            <div className="text-[10px] text-nepal-400 opacity-60">
              {stats.overview.totalEntries} entries /{" "}
              {stats.overview.totalWithImages} with images /{" "}
              {stats.overview.totalTags} tags
            </div>
          )}
        </div>
      </header>

      {/* Content */}
      <div className="relative">
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Spin size="large" />
          </div>
        ) : !data?.data || data.data.length === 0 ? (
          <Empty
            image={
              <div className="relative w-32 h-32 mx-auto opacity-50">
                <Image src="/images/notebook.png" alt="" fill />
              </div>
            }
            description={
              <div className="text-milktea-600 font-handwritten">
                <p className="text-base mb-2">No whispers yet...</p>
                <p className="text-xs">Start recording your thoughts ✨</p>
              </div>
            }
            className="py-12"
          />
        ) : (
          <>
            {/* Timeline */}
            <div className="relative">
              {/* Vertical timeline line - dashed style */}
              <div className="absolute left-6 top-0 bottom-0 w-px border-l-2 border-dashed border-nepal-200/50"></div>

              <div className="space-y-6">
                {data.data.map((entry, index) => (
                  <div key={entry.id} className="relative">
                    {/* Timeline side decorations - sea theme */}
                    {index % 7 === 0 && (
                      <div className="absolute -left-8 top-4 w-12 h-12 opacity-40 rotate-12 pointer-events-none">
                        <Image src="/images/blue-heart.png" alt="" fill />
                      </div>
                    )}
                    {index % 5 === 2 && (
                      <div className="absolute -left-10 top-2 w-14 h-14 opacity-30 -rotate-6 pointer-events-none">
                        <Image src="/images/white-shell.png" alt="" fill />
                      </div>
                    )}
                    {index % 6 === 4 && (
                      <div className="absolute -left-9 top-6 w-10 h-10 opacity-35 rotate-6 pointer-events-none">
                        <Image src="/images/pink-bow.png" alt="" fill />
                      </div>
                    )}
                    {index % 8 === 1 && (
                      <div className="absolute -left-8 top-8 w-11 h-11 opacity-40 -rotate-12 pointer-events-none">
                        <Image src="/images/sea-star.png" alt="" fill />
                      </div>
                    )}

                    <WhisperEntryCard
                      entry={entry}
                      selectedTag={selectedTag}
                      onTagClick={handleTagClick}
                      onDeleteSuccess={() => mutate()}
                      isPriority={index === 0}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Pagination */}
            {data.pagination.pages > 1 && (
              <div className="flex justify-center mt-12 pt-8">
                <JournalPagination
                  current={page}
                  total={data.pagination.total}
                  pageSize={data.pagination.limit}
                  onChange={handlePageChange}
                  showQuickJumper
                  showTotal={(total, range) =>
                    `${range[0]}-${range[1]} of ${total} entries`
                  }
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* Bottom decoration layer - only show when loaded with data */}
      {!isLoading && data?.data && data.data.length > 0 && (
        <div className="relative mt-16 mb-8 h-32">
          {/* Left - sea star */}
          <div className="absolute bottom-0 left-[10%] w-24 h-24 opacity-40 -rotate-12 pointer-events-none">
            <Image src="/images/hailuo.png" alt="" fill />
          </div>

          {/* Center - island silhouette */}
          <div className="absolute bottom-12 left-[50%] -translate-x-1/2 w-32 h-20 opacity-35 pointer-events-none">
            <Image src="/images/island-white-hengfu.png" alt="" fill />
          </div>

          {/* Right - summer night (keep for dreamy feel) */}
          <div className="absolute bottom-2 right-[5%] w-28 h-28 opacity-35 pointer-events-none">
            <Image src="/images/summer-night.png" alt="" fill />
          </div>

          {/* Bottom dashed line */}
          <div className="absolute bottom-0 w-full border-b-2 border-dashed border-sand-200 opacity-50"></div>
        </div>
      )}
    </main>
  );
}
