// 旅行和地图相关类型
import { GitHubFile } from "./common";

// 目的地基础类型
export interface Destination {
  longitude: string;
  latitude: string;
  destination: string;
  visited: boolean;
  isDomestic: boolean;
  imgUrl?: string;
}

// 地图标记类型（扩展目的地，包含GitHub图片）
export interface MapDestinationMarker extends Destination {
  gitImages?: GitHubFile[];
}
