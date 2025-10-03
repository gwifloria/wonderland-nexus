import { Editor, useEditorState } from "@tiptap/react";

const btnBase =
  "inline-flex items-center justify-center h-8 px-3 rounded-full border text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 focus-visible:ring-offset-2 focus-visible:ring-offset-rose-50";
const btnDefault = "bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100";
const btnActive = "bg-rose-600 text-rose-50 border-rose-600 hover:bg-rose-700";
const btnDisabled = "opacity-50 cursor-not-allowed";

export default function Toolbar({ editor }: { editor: Editor }) {
  const s = useEditorState({
    editor,
    selector: (ctx) => {
      return {
        // inline styles
        isBold: ctx.editor.isActive("bold") ?? false,
        canBold: ctx.editor.can().chain().toggleBold().run() ?? false,
        isItalic: ctx.editor.isActive("italic") ?? false,
        canItalic: ctx.editor.can().chain().toggleItalic().run() ?? false,
        isStrike: ctx.editor.isActive("strike") ?? false,
        canStrike: ctx.editor.can().chain().toggleStrike().run() ?? false,
        isUnderline: ctx.editor.isActive("underline") ?? false,
        canUnderline:
          ctx.editor.can().chain().toggleUnderline?.().run?.() ?? true,
        isCode: ctx.editor.isActive("code") ?? false,
        canCode: ctx.editor.can().chain().toggleCode().run() ?? false,
        canClearMarks: ctx.editor.can().chain().unsetAllMarks().run() ?? false,

        // block/structure
        isParagraph: ctx.editor.isActive("paragraph") ?? false,
        isHeading2: ctx.editor.isActive("heading", { level: 2 }) ?? false,
        isHeading3: ctx.editor.isActive("heading", { level: 3 }) ?? false,
        isBulletList: ctx.editor.isActive("bulletList") ?? false,
        isOrderedList: ctx.editor.isActive("orderedList") ?? false,
        isCodeBlock: ctx.editor.isActive("codeBlock") ?? false,
        isBlockquote: ctx.editor.isActive("blockquote") ?? false,

        // history
        canUndo: ctx.editor.can().chain().undo().run() ?? false,
        canRedo: ctx.editor.can().chain().redo().run() ?? false,
      };
    },
  });

  return (
    <div className="flex flex-wrap gap-1">
      <button
        data-testid="tt-btn-bold"
        className={[
          btnBase,
          s.isBold ? btnActive : btnDefault,
          !s.canBold && btnDisabled,
        ]
          .filter(Boolean)
          .join(" ")}
        aria-pressed={s.isBold}
        disabled={!s.canBold}
        title="加粗"
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        B
      </button>

      <button
        data-testid="tt-btn-italic"
        className={[
          btnBase,
          s.isItalic ? btnActive : btnDefault,
          !s.canItalic && btnDisabled,
        ]
          .filter(Boolean)
          .join(" ")}
        aria-pressed={s.isItalic}
        disabled={!s.canItalic}
        title="斜体"
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        I
      </button>

      <button
        data-testid="tt-btn-underline"
        className={[
          btnBase,
          s.isUnderline ? btnActive : btnDefault,
          !s.canUnderline && btnDisabled,
        ]
          .filter(Boolean)
          .join(" ")}
        aria-pressed={s.isUnderline}
        disabled={!s.canUnderline}
        title="下划线"
        onClick={() => editor.chain().focus().toggleUnderline?.().run?.()}
      >
        U
      </button>

      <button
        data-testid="tt-btn-h2"
        className={[btnBase, s.isHeading2 ? btnActive : btnDefault].join(" ")}
        aria-pressed={s.isHeading2}
        title="标题2"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      >
        H2
      </button>

      <button
        data-testid="tt-btn-h3"
        className={[btnBase, s.isHeading3 ? btnActive : btnDefault].join(" ")}
        aria-pressed={s.isHeading3}
        title="标题3"
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
      >
        H3
      </button>

      <button
        data-testid="tt-btn-bullet"
        className={[btnBase, s.isBulletList ? btnActive : btnDefault].join(" ")}
        aria-pressed={s.isBulletList}
        title="无序列表"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        • 列表
      </button>

      <button
        data-testid="tt-btn-ordered"
        className={[btnBase, s.isOrderedList ? btnActive : btnDefault].join(
          " ",
        )}
        aria-pressed={s.isOrderedList}
        title="有序列表"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        1. 列表
      </button>

      <button
        data-testid="tt-btn-quote"
        className={[btnBase, s.isBlockquote ? btnActive : btnDefault].join(" ")}
        aria-pressed={s.isBlockquote}
        title="引用"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
      >
        引用
      </button>

      <button
        data-testid="tt-btn-code"
        className={[btnBase, s.isCodeBlock ? btnActive : btnDefault].join(" ")}
        aria-pressed={s.isCodeBlock}
        title="代码块"
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
      >
        代码
      </button>

      <button
        data-testid="tt-btn-undo"
        className={[btnBase, btnDefault, !s.canUndo && btnDisabled]
          .filter(Boolean)
          .join(" ")}
        disabled={!s.canUndo}
        title="撤销"
        onClick={() => editor.chain().focus().undo().run()}
      >
        撤销
      </button>

      <button
        data-testid="tt-btn-clear"
        className={[btnBase, btnDefault, !s.canClearMarks && btnDisabled]
          .filter(Boolean)
          .join(" ")}
        disabled={!s.canClearMarks}
        title="清除格式"
        onClick={() =>
          editor.chain().focus().clearNodes().unsetAllMarks().run()
        }
      >
        清除格式
      </button>
    </div>
  );
}
