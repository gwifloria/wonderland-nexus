"use client";

import DecorativeCard from "@/components/DecorativeCard";
import { isAdminUser } from "@/constants/auth";
import { useMessage, useModal } from "@/provider/UIProviders";
import { WhisperEntryApi } from "@/types/whisper";
import { fmtDateTime } from "@/util/date";
import { DeleteOutlined } from "@ant-design/icons";
import { Button, Tag } from "antd";
import { useSession } from "next-auth/react";
import Image from "next/image";

interface WhisperEntryCardProps {
  entry: WhisperEntryApi;
  selectedTag: string | null;
  onTagClick: (tag: string) => void;
  onDeleteSuccess: () => void;
  isPriority?: boolean; // For first card LCP optimization
}

export default function WhisperEntryCard({
  entry,
  selectedTag,
  onTagClick,
  onDeleteSuccess,
  isPriority = false,
}: WhisperEntryCardProps) {
  const { data: session } = useSession();
  const messageApi = useMessage();
  const modalApi = useModal();

  // Check if user is admin
  const isAdmin = isAdminUser(session?.user?.email);

  const handleDelete = () => {
    modalApi.confirm({
      title: "确认删除",
      content: (
        <div>
          <p>确定要删除这条 whisper 记录吗？</p>
          <div className="mt-2 p-2 bg-gray-50 rounded text-sm text-gray-600">
            {entry.content.substring(0, 100)}...
          </div>
        </div>
      ),
      okText: "删除",
      okType: "danger",
      cancelText: "取消",
      onOk: async () => {
        try {
          const response = await fetch(`/api/whispers/list?id=${entry.id}`, {
            method: "DELETE",
          });

          if (response.ok) {
            messageApi.success("删除成功");
            onDeleteSuccess();
          } else {
            const errorData = await response.json();
            messageApi.error(errorData.error || "删除失败");
          }
        } catch (error) {
          console.error("Delete error:", error);
          messageApi.error("删除失败");
        }
      },
    });
  };

  return (
    <div className="relative pl-16">
      {/* Timeline marker - positioned to align with the vertical line */}
      <div className="absolute left-[19px] top-4 w-[14px] h-[14px] bg-gradient-to-br from-nepal-400 to-nepal-500 border-[3px] border-white rounded-full shadow-sm z-10"></div>

      {/* Decorative card - only manages card styling */}
      <DecorativeCard
        id={entry.id}
        isPriority={isPriority}
        className="hover:shadow-md transition-all duration-200 hover:-translate-y-1"
        renderHeader={() => (
          <div className="flex justify-between items-center mb-3 pb-2 border-b border-nepal-100">
            <time className="text-xs text-nepal-600 font-medium">
              {fmtDateTime(entry.timestamp.toString())}
            </time>
            {isAdmin && (
              <Button
                type="text"
                danger
                size="small"
                icon={<DeleteOutlined />}
                onClick={handleDelete}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
                title="删除"
              />
            )}
          </div>
        )}
        content={
          <div className="text-xs">
            {entry.content.split("\n").map((paragraph, pIndex) =>
              paragraph.trim() ? (
                <p key={pIndex} className="mb-1 last:mb-0">
                  {paragraph}
                </p>
              ) : (
                <div key={pIndex} className="h-1" />
              ),
            )}
          </div>
        }
        renderFooter={() => (
          <>
            {/* Images */}
            {entry.images.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 mb-3 mt-3">
                {entry.images.map((image, imgIndex) => (
                  <div
                    key={imgIndex}
                    className="relative rounded-lg overflow-hidden border border-sand-200 shadow-sm"
                  >
                    <Image
                      src={image}
                      alt={`Whisper image ${imgIndex + 1}`}
                      width={300}
                      height={200}
                      className="w-full h-auto object-cover transition-transform duration-200 hover:scale-105"
                      unoptimized
                      onError={(e) => {
                        // Hide broken images gracefully
                        const target = e.target as HTMLImageElement;
                        target.style.display = "none";
                      }}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Tags - only show if tags exist */}
            {entry.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-3">
                {entry.tags.map((tag) => (
                  <Tag
                    key={tag}
                    className={`cursor-pointer transition-all duration-200 ${
                      selectedTag === tag
                        ? "bg-rose-500 text-white border-rose-500"
                        : "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100"
                    }`}
                    onClick={() => onTagClick(tag)}
                  >
                    #{tag}
                  </Tag>
                ))}
              </div>
            )}
          </>
        )}
      />
    </div>
  );
}
