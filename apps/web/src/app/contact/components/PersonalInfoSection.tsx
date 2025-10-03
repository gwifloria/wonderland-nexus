import { labels, DECORATION_IMAGES, DECORATION_SIZES } from "../constants";
import { getLocalizedText } from "../utils";
import { FloatingDecoration } from "./FloatingDecoration";

type Lang = "zh" | "en";

interface PersonalInfoSectionProps {
  lang: Lang;
}

export function PersonalInfoSection({ lang }: PersonalInfoSectionProps) {
  const L = labels[lang];

  return (
    <div className="relative">
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <strong className="text-neutral-500">{L.name}:</strong> 龚慧珏 /
          Floria
          <br />
          <strong className="text-neutral-500">毕业年份:</strong> 2019年 |{" "}
          <strong className="text-neutral-500">性别:</strong> 女 |{" "}
          <strong className="text-neutral-500">生日:</strong> 1997-05
          <br />
          <strong className="text-neutral-500">{L.email}:</strong>{" "}
          ghuijue@gmail.com
          <br />
          <strong className="text-neutral-500">电话:</strong> 18901829188 |{" "}
          <strong className="text-neutral-500">微信:</strong> light__bj
          <br />
          <strong className="text-neutral-500">当前状态:</strong>{" "}
          Gap（已调整好状态，随时可入职）
          <br />
          <strong className="text-neutral-500">期望:</strong> 小而美
        </div>
        <div>
          <strong className="text-neutral-500">{L.experience}:</strong> 5+ years
          <br />
          <strong className="text-neutral-500">{L.languages}:</strong> 中文 /
          English (TEM-8)
          <br />
          <strong className="text-neutral-500">{L.interests}:</strong> Web
          Development, Maps, Reusable UI
        </div>
      </div>

      <FloatingDecoration
        src={DECORATION_IMAGES.favSheep}
        alt="sheep"
        width={DECORATION_SIZES.sheep.width}
        height={DECORATION_SIZES.sheep.height}
        className="-bottom-3 right-6"
      />
    </div>
  );
}
