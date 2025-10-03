import AntDShell from "@/provider/AntDShell";
import { Popover } from "antd";
import Image from "next/image";

interface PageIntroProps {
  children?: React.ReactNode;
}

export default function PageIntro({ children }: PageIntroProps) {
  const content = (
    <div className="max-w-xs">
      <div className="text-sm text-neutral-700 leading-relaxed">{children}</div>
    </div>
  );

  return (
    <AntDShell>
      <Popover
        content={content}
        title={null}
        trigger="hover"
        placement="bottomLeft"
      >
        <button
          className="relative inline-block rotate-12 opacity-70 hover:opacity-100 transition-all duration-200 group"
          style={{ width: "24px", height: "16px" }}
          aria-label="查看页面详情"
        >
          <Image
            src="/images/env-small.png"
            alt="Info tape"
            width={24}
            height={16}
            className="object-contain group-hover:scale-105 transition-transform"
          />
        </button>
      </Popover>
    </AntDShell>
  );
}
