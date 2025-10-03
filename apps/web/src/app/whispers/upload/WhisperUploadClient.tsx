"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";
import {
  Button,
  Upload,
  Card,
  Alert,
  Progress,
  Divider,
  Collapse,
  Tag,
  Result,
} from "antd";
import {
  InboxOutlined,
  ArrowLeftOutlined,
  CheckCircleOutlined,
  LockOutlined,
} from "@ant-design/icons";
import AntDShell from "@/provider/AntDShell";
import Link from "next/link";
import { WhisperUploadResponse } from "@/types/whisper";
import { isAdminUser } from "@/constants/auth";

const { Dragger } = Upload;

export default function WhisperUploadClient() {
  const { data: session } = useSession();
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<WhisperUploadResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 检查是否为管理员
  const isAdmin = isAdminUser(session?.user?.email);

  // 如果不是管理员，显示无权限页面
  if (!isAdmin) {
    return (
      <AntDShell>
        <main className="max-w-4xl mx-auto px-4 py-8">
          <Result
            icon={<LockOutlined />}
            title="需要管理员权限"
            subTitle="此功能仅对管理员开放，请使用管理员账户登录。"
            extra={
              <Link href="/whispers">
                <Button type="primary">返回 Whispers</Button>
              </Link>
            }
          />
        </main>
      </AntDShell>
    );
  }

  const handleUpload = async (file: File) => {
    console.log("Starting upload:", file.name);
    setUploading(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      console.log("Sending request to API...");
      const response = await fetch("/api/whispers/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      console.log("API response:", data);

      if (!response.ok) {
        throw new Error(data.error || "Upload failed");
      }

      setResult(data);
    } catch (err) {
      console.error("Upload error:", err);
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }

    return false; // Prevent default upload behavior
  };

  const uploadProps = {
    name: "file",
    multiple: false,
    accept: ".zip",
    beforeUpload: handleUpload,
    showUploadList: false,
  };

  return (
    <AntDShell>
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <header className="flex items-center gap-4 mb-8 pb-4 border-b-2 border-nepal-100">
          <Link
            href="/whispers"
            className="flex items-center gap-2 text-xs px-4 py-2 border border-nepal-300 rounded-lg hover:bg-nepal-50 transition-all duration-200 hover:-translate-x-1 no-underline"
          >
            <ArrowLeftOutlined />
            Back to Whispers
          </Link>
          <h1 className="text-2xl font-semibold text-nepal-800">
            Upload Whisper Export
          </h1>
        </header>

        {/* Instructions */}
        <Card className="mb-8 border-nepal-200 shadow-sm">
          <div className="bg-gradient-to-br from-nepal-50 to-sand-50 rounded-lg p-6">
            <h3 className="text-nepal-800 mb-4 font-medium">How to Upload</h3>
            <ol className="text-nepal-700 leading-relaxed space-y-2 text-sm">
              <li>1. Export your flomo data from the flomo app (ZIP format)</li>
              <li>2. Upload the ZIP file below (includes HTML + all images)</li>
              <li>
                3. The system will automatically extract all entries and content
              </li>
              <li>
                4. All images will be uploaded to Cloudinary for optimal
                performance
              </li>
            </ol>

            <Alert
              message="ZIP Format Required"
              description="Only ZIP files exported from flomo are supported. This ensures all images are properly uploaded to Cloudinary."
              type="info"
              showIcon
              className="mt-4"
            />
          </div>
        </Card>

        {/* Upload Area */}
        <Card className="mb-8 border-nepal-200 shadow-sm">
          <div className="bg-gradient-to-br from-white to-nepal-50 rounded-lg p-8">
            <Dragger
              {...uploadProps}
              className="border-nepal-300 bg-gradient-to-br from-nepal-50 to-sand-50 hover:border-nepal-500 hover:bg-gradient-to-br hover:from-sand-50 hover:to-nepal-100"
              disabled={uploading}
            >
              <p className="ant-upload-drag-icon text-nepal-500 text-4xl mb-4">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text text-nepal-800 text-base font-medium mb-2">
                {uploading
                  ? "Processing..."
                  : "Click or drag ZIP file to upload"}
              </p>
              <p className="ant-upload-hint text-nepal-600 text-xs">
                Only ZIP files from flomo exports are supported
              </p>
            </Dragger>

            {uploading && (
              <div className="mt-6 text-center">
                <Progress
                  percent={100}
                  status="active"
                  showInfo={false}
                  strokeColor="#537687"
                />
                <p className="mt-3 text-nepal-600 text-xs">
                  Parsing whisper entries and processing content...
                </p>
              </div>
            )}
          </div>
        </Card>

        {/* Error Display */}
        {error && (
          <Alert
            message="Upload Failed"
            description={error}
            type="error"
            showIcon
            closable
            onClose={() => setError(null)}
            className="mb-8"
          />
        )}

        {/* Results Display */}
        {result && (
          <Card className="border-nepal-200 shadow-md">
            <div className="bg-gradient-to-br from-nepal-50 to-sand-50 rounded-lg p-6">
              <div className="flex items-center gap-4 mb-6">
                <CheckCircleOutlined className="text-nepal-600 text-xl" />
                <h2 className="text-nepal-800 text-lg font-semibold">
                  Upload Complete!
                </h2>
              </div>

              {/* Summary */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                <div className="flex flex-col items-center p-4 bg-white/80 border border-nepal-200 rounded-xl shadow-sm">
                  <span className="text-xl font-bold text-nepal-600 mb-1">
                    {result.summary.totalParsed}
                  </span>
                  <span className="text-xs text-nepal-700 font-medium">
                    Total Parsed
                  </span>
                </div>
                <div className="flex flex-col items-center p-4 bg-white/80 border border-nepal-200 rounded-xl shadow-sm">
                  <span className="text-xl font-bold text-nepal-600 mb-1">
                    {result.summary.saved}
                  </span>
                  <span className="text-xs text-nepal-700 font-medium">
                    Saved
                  </span>
                </div>
                <div className="flex flex-col items-center p-4 bg-white/80 border border-nepal-200 rounded-xl shadow-sm">
                  <span className="text-xl font-bold text-nepal-600 mb-1">
                    {result.summary.duplicates}
                  </span>
                  <span className="text-xs text-nepal-700 font-medium">
                    Duplicates
                  </span>
                </div>
                <div className="flex flex-col items-center p-4 bg-white/80 border border-nepal-200 rounded-xl shadow-sm">
                  <span className="text-xl font-bold text-nepal-600 mb-1">
                    {result.summary.errors}
                  </span>
                  <span className="text-xs text-nepal-700 font-medium">
                    Errors
                  </span>
                </div>
              </div>

              <Divider />

              {/* Detailed Results */}
              <Collapse
                ghost
                items={[
                  {
                    key: "saved",
                    label: `Saved Entries (${result.details.savedEntries.length})`,
                    className:
                      "bg-nepal-50/50 rounded-lg mb-2 border border-nepal-200",
                    children: (
                      <div className="bg-white/50 rounded-lg p-2 space-y-3">
                        {result.details.savedEntries.map((entry) => (
                          <div
                            key={entry.id}
                            className="p-3 border border-nepal-200 rounded-lg bg-white/80"
                          >
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-xs text-nepal-600 font-medium">
                                {entry.timestamp}
                              </span>
                              <Tag color="success">Saved</Tag>
                            </div>
                            <p className="text-sm text-gray-700">
                              {entry.contentPreview}
                            </p>
                          </div>
                        ))}
                      </div>
                    ),
                  },
                  ...(result.details.duplicates.length > 0
                    ? [
                        {
                          key: "duplicates",
                          label: `Duplicates Skipped (${result.details.duplicates.length})`,
                          className:
                            "bg-yellow-50/50 rounded-lg mb-2 border border-yellow-100",
                          children: (
                            <div className="bg-white/50 rounded-lg p-2 space-y-3">
                              {result.details.duplicates.map((dup, index) => (
                                <div
                                  key={index}
                                  className="p-3 border border-yellow-100 rounded-lg bg-white/80"
                                >
                                  <div className="flex justify-between items-center mb-2">
                                    <span className="text-xs text-yellow-600 font-medium">
                                      {dup.timestamp}
                                    </span>
                                    <Tag color="warning">Duplicate</Tag>
                                  </div>
                                  <p className="text-sm text-yellow-700 italic">
                                    {dup.reason}
                                  </p>
                                </div>
                              ))}
                            </div>
                          ),
                        },
                      ]
                    : []),
                  ...(result.details.saveErrors.length > 0
                    ? [
                        {
                          key: "errors",
                          label: `Save Errors (${result.details.saveErrors.length})`,
                          className:
                            "bg-red-50/50 rounded-lg mb-2 border border-red-100",
                          children: (
                            <div className="bg-white/50 rounded-lg p-2 space-y-3">
                              {result.details.saveErrors.map((err, index) => (
                                <div
                                  key={index}
                                  className="p-3 border border-red-100 rounded-lg bg-white/80"
                                >
                                  <div className="flex justify-between items-center mb-2">
                                    <span className="text-xs text-red-600 font-medium">
                                      {err.timestamp}
                                    </span>
                                    <Tag color="error">Error</Tag>
                                  </div>
                                  <p className="text-sm text-red-700">
                                    {err.error}
                                  </p>
                                </div>
                              ))}
                            </div>
                          ),
                        },
                      ]
                    : []),
                  {
                    key: "images",
                    label: `Content Processing (${result.details.imageFiles.processed} images found)`,
                    className:
                      "bg-rose-50/50 rounded-lg mb-2 border border-rose-200",
                    children: (
                      <div className="bg-white/50 rounded-lg p-4">
                        <div className="space-y-2 text-sm text-rose-700">
                          <p>
                            Images found: {result.details.imageFiles.processed}
                          </p>
                          <p>
                            Processing status:{" "}
                            {result.details.imageFiles.copied > 0
                              ? "Processed"
                              : "Embedded in HTML"}
                          </p>
                          {result.details.imageFiles.errors.length > 0 && (
                            <div>
                              <p className="font-medium">Notes:</p>
                              <ul className="ml-4 list-disc space-y-1">
                                {result.details.imageFiles.errors.map(
                                  (error, index) => (
                                    <li
                                      key={index}
                                      className="text-xs text-amber-600"
                                    >
                                      {error}
                                    </li>
                                  ),
                                )}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    ),
                  },
                ]}
              />

              <Divider />

              {/* Actions */}
              <div className="flex justify-center gap-4 flex-wrap">
                <Link href="/whispers">
                  <Button
                    type="primary"
                    size="large"
                    className="bg-nepal-500 hover:bg-nepal-600 border-nepal-500 hover:border-nepal-600"
                  >
                    View Timeline
                  </Button>
                </Link>
                <Button
                  onClick={() => {
                    setResult(null);
                    setError(null);
                  }}
                  size="large"
                  className="border-rose-300 text-rose-600 hover:border-rose-500 hover:text-rose-700 bg-rose-50 hover:bg-rose-100"
                >
                  Upload Another
                </Button>
              </div>
            </div>
          </Card>
        )}
      </main>
    </AntDShell>
  );
}
