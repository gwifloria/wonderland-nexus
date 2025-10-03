"use client";

import { useMessage, useModal } from "@/provider/UIProviders";
import { ClearOutlined, UploadOutlined } from "@ant-design/icons";
import { Button } from "antd";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { isAdminUser } from "@/constants/auth";

interface WhisperAdminControlsProps {
  onClearSuccess: () => void;
}

export default function WhisperAdminControls({
  onClearSuccess,
}: WhisperAdminControlsProps) {
  const { data: session } = useSession();
  const messageApi = useMessage();
  const modalApi = useModal();

  // Check if user is admin
  const isAdmin = isAdminUser(session?.user?.email);

  const handleClearAll = () => {
    modalApi.confirm({
      title: "确认清空",
      content: (
        <div>
          <p>⚠️ 这将删除所有 whisper 记录，此操作不可恢复！</p>
          <p>确定要清空所有数据吗？</p>
        </div>
      ),
      okText: "确认清空",
      okType: "danger",
      cancelText: "取消",
      onOk: async () => {
        try {
          const response = await fetch("/api/whispers/clear", {
            method: "POST",
          });

          if (response.ok) {
            messageApi.success("清空成功");
            onClearSuccess();
          } else {
            const errorData = await response.json();
            messageApi.error(errorData.error || "清空失败");
          }
        } catch (error) {
          console.error("Clear error:", error);
          messageApi.error("清空失败");
        }
      },
    });
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <>
      <Link href="/whispers/upload">
        <Button
          type="primary"
          icon={<UploadOutlined />}
          size="small"
          className="bg-nepal-500 hover:bg-nepal-600 border-nepal-500 hover:border-nepal-600"
        >
          Upload
        </Button>
      </Link>
      <Button
        danger
        icon={<ClearOutlined />}
        onClick={handleClearAll}
        size="small"
        className="border-rose-400 text-rose-600 hover:border-rose-500 hover:text-rose-700 bg-rose-100 hover:bg-rose-200"
      >
        Clear
      </Button>
    </>
  );
}
