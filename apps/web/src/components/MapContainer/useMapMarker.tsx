import { GitItem, MapDestinationMarker } from "@/types";
import mapboxgl, { Marker } from "mapbox-gl";
import { StaticImageData } from "next/image";
import { useEffect, useState } from "react";
import { first, isNull, isUndefined } from "lodash";

export const useMapMarker = (
  map?: mapboxgl.Map,
  data?: MapDestinationMarker[],
) => {
  const [markers, setMarkers] = useState<Marker[]>();

  const getImageDom = (image: GitItem) => {
    const div = document.createElement("div");
    div.className = "rounded-full border-2 border-inherit	border-solid";
    const img = document.createElement("img");
    img.className = "rounded-full h-24 w-24";
    img.src = image.download_url;
    div.appendChild(img);
    return div;
  };

  useEffect(() => {
    let markers = data
      ?.map((i) => {
        const firstImage = first(i.gitImages);
        return firstImage
          ? new mapboxgl.Marker({
              element: getImageDom(firstImage),
            }).setLngLat([Number(i.longitude), Number(i.latitude)])
          : undefined;
      })
      .filter((i) => i !== undefined) as Marker[];
    setMarkers(markers);
  }, [data]);

  useEffect(() => {
    if (!map) return;
    markers?.forEach((i) => {
      i.addTo(map);
    });
    return () => markers?.forEach((i) => i.remove());
  }, [map, markers]);
};
