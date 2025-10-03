"use client";
import AuthLayout from "@/components/AuthProvider";
import UIProviders from "@/provider/UIProviders";
import { MailMessageApi } from "@/types/letter";
import { fmtDateTime } from "@/util/date";
import DOMPurify from "isomorphic-dompurify";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useLetterDetail } from "../useLetterDetail";
import { STICKER_IMGS } from "../constants";
import {
  MAX_VISIBLE_MESSAGES,
  PAPER_BACKGROUNDS,
  STICKER_SIZE,
} from "./constants";
import { MailComment } from "./MailComment";

/** 单条邮件：统一"信件/手帐"气质 */
function MessageCard({
  m,
  index,
  isPriority = false,
}: {
  m: MailMessageApi;
  index: number;
  isPriority?: boolean;
}) {
  // determine sender key and choose background
  const addr = (m.from?.address || "anonymous").toLowerCase();
  let paperBg: string = PAPER_BACKGROUNDS[0];
  if (addr.startsWith("g")) {
    paperBg = PAPER_BACKGROUNDS[0];
  } else if (addr.startsWith("m")) {
    paperBg = PAPER_BACKGROUNDS[1] || PAPER_BACKGROUNDS[0];
  } else {
    paperBg = PAPER_BACKGROUNDS[2];
  }

  return (
    <article
      id={`msg-${m.id}`}
      className="group relative overflow-visible bg-transparent p-0 z-[2] mx-auto"
    >
      <div className="relative overflow-hidden z-[1] rounded-2xl px-10 py-6 ring-1 ring-neutral-200/40 backdrop-blur-[0.5px] transition-transform duration-200">
        <Image
          fill
          alt=""
          src={paperBg}
          priority={isPriority}
          className="pointer-events-none absolute scale-[2] inset-0 opacity-40 contrast-70 object-cover"
          style={{ objectPosition: "center top" }}
        />
        <div className="relative z-[1]">
          <header className="relative mb-3 flex items-start justify-between gap-3 pr-2">
            <div className="min-w-0 flex-1 truncate font-medium text-neutral-800 flex items-center gap-2 text-[13px] leading-5">
              {m.from?.address}
            </div>
            <time className="ml-2 shrink-0 pt-0.5 text-[12px] leading-5 text-neutral-500">
              {fmtDateTime(m.sentAt)}
            </time>
          </header>
          <hr className="relative my-2 border-0 border-t border-dashed border-neutral-300/80" />
          <div
            className="relative prose prose-neutral prose-sm max-w-none leading-relaxed text-neutral-800"
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(m.html) }}
          />
        </div>
      </div>
      <Image
        width={STICKER_SIZE.width}
        height={STICKER_SIZE.height}
        src={STICKER_IMGS[index % STICKER_IMGS.length]}
        alt=""
        className="pointer-events-none absolute z-[2] opacity-60 left-3 bottom-3"
      />
    </article>
  );
}

/** 历史消息折叠区 */
function HistorySection({ historyMsgs }: { historyMsgs: MailMessageApi[] }) {
  const [open, setOpen] = useState(false);

  if (!historyMsgs.length) return null;

  return (
    <section className="my-8">
      {!open ? (
        <button
          className="w-full rounded-xl bg-neutral-50/80 px-4 py-2 text-sm text-neutral-600 hover:bg-neutral-100 shadow-sm transition"
          onClick={() => setOpen(true)}
        >
          ➕ 展开历史 {historyMsgs.length} 封
        </button>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-[12px] text-neutral-500">
            <span>历史</span>
            <button
              className="rounded px-2 py-1 hover:bg-neutral-100"
              onClick={() => setOpen(false)}
            >
              ▾ 收起历史
            </button>
          </div>
          {historyMsgs.map((m, i) => (
            <MessageCard key={m.id} m={m} index={i} />
          ))}
        </div>
      )}
    </section>
  );
}

/* ---------- Page ---------- */
export default function LetterDetailClient({ threadId }: { threadId: string }) {
  const { thread, messages, loading, error } = useLetterDetail(threadId);

  if (loading)
    return <div className="p-8 text-center text-neutral-500">加载中…</div>;
  if (error)
    return <div className="p-8 text-center text-red-500">加载失败</div>;
  if (!thread || !messages)
    return <div className="p-8 text-center text-neutral-500">未找到</div>;
  const visibleMsgs = (messages || []).slice(0, MAX_VISIBLE_MESSAGES);
  const restMsgs = (messages || []).slice(MAX_VISIBLE_MESSAGES);

  return (
    <main className="mx-auto w-full max-w-2xl px-3 md:px-4 py-6">
      <header className="mb-5 space-y-1">
        <Link
          href="/letters"
          className="inline-flex items-center gap-1 text-[13px] text-neutral-500 hover:text-neutral-700"
        >
          ← 返回列表
        </Link>
        <h1 className="text-[22px] md:text-2xl font-semibold text-neutral-900 tracking-[.2px]">
          {thread.subject || "(无标题)"}
        </h1>
        <p className="text-[13px] text-neutral-500">
          {fmtDateTime(thread?.firstAt)} · 更新 {fmtDateTime(thread?.updatedAt)}{" "}
          · {thread.messageCount ?? messages.length} 封
        </p>
      </header>

      {/* 最近两封 */}
      <section className="space-y-6">
        {visibleMsgs.map((m, i) => (
          <MessageCard key={m.id} m={m} index={i} isPriority={i === 0} />
        ))}
      </section>

      {/* 历史（默认折叠） */}
      <HistorySection historyMsgs={restMsgs} />

      {/* 评论 */}
      <section className="mt-8">
        <div className="mb-3 text-[12px] text-neutral-500 tracking-wide">
          评论
        </div>
        <UIProviders>
          <AuthLayout>
            <MailComment threadId={threadId}></MailComment>
          </AuthLayout>
        </UIProviders>
      </section>
    </main>
  );
}
