import { TextStyleKit } from "@tiptap/extension-text-style";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useId } from "react";
import "./index.scss";
import Toolbar from "./Toolbar";

const extensions = [TextStyleKit, StarterKit];

export const useTipTapEditor = () => {
  const id = useId();
  const labelId = `${id}-label`;
  const descId = `${id}-desc`;

  const editor = useEditor({
    extensions,
    immediatelyRender: false,
    content: ``,
    editorProps: {
      attributes: {
        role: "textbox",
        "aria-multiline": "true",
        id,
        "aria-labelledby": labelId,
        "aria-describedby": descId,
        "aria-placeholder": "写点什么吧…",
      },
    },
  });

  const element = (
    <div className="rounded-2xl bg-white  p-3 md:p-4">
      {editor && <Toolbar editor={editor}></Toolbar>}
      <div className="my-2 border-b border-dashed border-rose-200" />
      <span id={labelId} className="sr-only">
        留言编辑器
      </span>
      <span id={descId} className="sr-only">
        可编辑多行文本。按 Enter 换段落，Shift+Enter 插入换行。
      </span>
      <EditorContent
        className="tiptap-editor text-neutral-800 min-h-[160px] rounded-xl ring-1 ring-rose-100 bg-white px-3 py-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300"
        editor={editor}
      />
    </div>
  );
  return { element, editor };
};
