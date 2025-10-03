"use client";
import { useConfetti } from "@/hooks/useConfetti";
import { useMessage } from "@/provider/UIProviders";
import { Button } from "antd";
import { useCallback, useState } from "react";
import { useThrottle } from "../../app/tools/useThrottle";
import { useTipTapEditor } from "./useTipTapEditor";
const MAX_CHARS = 200;

export default function TipTapEditor({
  onSendSuccess,
  showAuthStatus, // 是否在发布按钮左侧显示登录状态
}: {
  onSendSuccess: (content: string) => void;
  showAuthStatus?: React.ReactNode;
}) {
  const { element, editor } = useTipTapEditor();
  const message = useMessage();

  const { show, confettiContext } = useConfetti();

  const [loading, setLoading] = useState(false);

  const handleUpload = useCallback(async () => {
    if (!editor) return;
    const content = editor.getHTML();
    const plain = editor.getText().trim();

    if (!plain) {
      message.warning("内容不能为空");
      editor.commands.focus("end");
      return;
    }
    if (plain.length > MAX_CHARS) {
      message.warning(`最多只能输入 ${MAX_CHARS} 个字`);
      editor.commands.focus("end");
      return;
    }

    try {
      setLoading(true);
      await onSendSuccess(content);
      message.success("留言已发送");
      show({ numberOfPieces: 300, duration: 5000 });
      editor.commands.clearContent();
      setLoading(false);
    } catch (err) {
      message.error("发送失败");
      setLoading(false);
    }
  }, [editor, message, onSendSuccess, show]);

  const throttledPost = useThrottle(handleUpload, 3000);

  return (
    <div className="rounded-2xl bg-white ring-1 ring-rose-200 shadow-sm p-3 md:p-4 mb-6">
      {confettiContext}
      {editor && (
        <>
          {element}
          <div
            className={`flex mt-2 ${showAuthStatus ? "justify-between" : "justify-end"} items-center`}
          >
            {showAuthStatus && (
              <div className="flex-shrink-0">{showAuthStatus}</div>
            )}
            <Button
              disabled={loading}
              aria-label="发布留言"
              onClick={throttledPost}
              data-testid="post-btn"
              className={`rounded-full h-10 px-5 bg-rose-600 hover:bg-rose-700 text-rose-50 shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 disabled:opacity-50 transition-colors ${loading ? "cursor-wait opacity-70" : ""}`}
            >
              {loading ? "发布中..." : "发布"}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
