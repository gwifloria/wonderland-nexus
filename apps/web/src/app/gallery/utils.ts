import { GalleryImage, GitHubImageItem } from "@/types/gallery";
import { GALLERY_CONFIG } from "./constants";

export const formatGalleryImages = (
  items: GitHubImageItem[],
): GalleryImage[] => {
  return items.map(
    (item: GitHubImageItem): GalleryImage => ({
      id: item.sha,
      src: item.imageUrl,
      alt: item.name,
      width: GALLERY_CONFIG.IMAGE.DEFAULT_WIDTH,
      height: GALLERY_CONFIG.IMAGE.DEFAULT_HEIGHT,
    }),
  );
};
