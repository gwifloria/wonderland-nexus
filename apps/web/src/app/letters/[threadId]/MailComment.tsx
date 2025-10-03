import AuthStatus from "@/components/AuthStatus";
import DecorativeCard from "@/components/DecorativeCard";
import TipTapEditor from "@/components/TipTapEditor";
import { useMessage } from "@/provider/UIProviders";
import { fmtDateTime } from "@/util/date";
import DOMPurify from "isomorphic-dompurify";
import { useSession } from "next-auth/react";
import { useCallback } from "react";
import { useLetterComments } from "../useLetterComments";

export function MailComment({ threadId }: { threadId: string }) {
  const { data: session } = useSession();

  const message = useMessage();
  const { comments, addComment, deleteComment } = useLetterComments(threadId);

  const handleUpload = useCallback(
    async (content: string) => {
      try {
        await addComment({
          threadId,
          content: content,
          author: { name: session!.user!.name, address: session!.user!.email },
        });
      } catch (err) {
        console.log(err);
      }
    },
    [session, addComment, threadId],
  );

  const handleDelete = useCallback(
    async (commentId: string) => {
      if (!session?.user?.email) return;
      try {
        await deleteComment({ commentId, address: session.user.email });
        message.success("评论已删除");
      } catch (err) {
        console.error(err);
        message.error("删除失败");
      }
    },
    [deleteComment, message, session?.user?.email],
  );

  return (
    <div className="space-y-6">
      {/* Comments List */}
      {comments?.length ? (
        <div className="space-y-4">
          {comments.map((comment, index) => (
            <DecorativeCard
              key={comment.id}
              id={comment.id}
              isPriority={index === 0}
              author={
                comment?.author?.name || comment?.author?.address || "匿名"
              }
              createdAt={fmtDateTime(comment.createdAt)}
              content={
                <div
                  className="prose prose-neutral prose-sm max-w-full"
                  style={{ wordBreak: "break-word" }}
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(comment.content),
                  }}
                />
              }
              onDelete={handleDelete}
              showDeleteButton={comment.author.address === session?.user?.email}
            />
          ))}
        </div>
      ) : (
        <div className="relative bg-[#FFFDF9] border border-dashed border-rose-200 rounded-2xl p-8 text-center shadow-[0_1px_0_rgba(0,0,0,0.04)]">
          <div
            className="pointer-events-none absolute -top-2 left-1/2 transform -translate-x-1/2 w-[48px] h-[16px] -rotate-1 opacity-60"
            aria-hidden="true"
          >
            <svg
              viewBox="0 0 48 16"
              fill="none"
              className="w-full h-full text-rose-300"
            >
              <path
                d="M2 8 Q24 2 46 8 Q24 14 2 8"
                stroke="currentColor"
                strokeWidth="1"
                strokeDasharray="2,2"
                fill="none"
              />
            </svg>
          </div>
          <p className="text-neutral-400 font-handwritten">空空如也～</p>
        </div>
      )}

      {/* Authentication and Editor Section */}
      {session ? (
        <TipTapEditor
          onSendSuccess={handleUpload}
          showAuthStatus={<AuthStatus compact />}
        />
      ) : (
        <AuthStatus />
      )}
    </div>
  );
}
