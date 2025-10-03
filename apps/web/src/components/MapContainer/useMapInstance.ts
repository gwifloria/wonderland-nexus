import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import mapboxgl, { IControl } from "mapbox-gl";
import { useEffect, useRef, useState } from "react";
import useSWR from "swr";

export const useMapInstance = () => {
  const mapContainerRef = useRef(null);
  const [mapInstance, setMap] = useState<mapboxgl.Map | undefined>();

  const mapSearchRef = useRef<IControl>(null);

  const { data: mapKeyData } = useSWR<{ mapKey: string }>(
    "/floria-service/auth/info",
  );
  useEffect(() => {
    if (!mapKeyData) {
      return;
    }

    const geocoder = new MapboxGeocoder({
      accessToken: mapKeyData.mapKey,
      mapboxgl: mapboxgl as any,
    });
    mapSearchRef.current = geocoder;
  }, [mapKeyData]);

  useEffect(() => {
    if (!mapKeyData) {
      return;
    }

    mapboxgl.accessToken = mapKeyData.mapKey;

    const map = new mapboxgl.Map({
      container: "map",
      style: "mapbox://styles/mapbox/streets-v12",
      center: [0, 0],
      zoom: 2,
    });
    setMap(map);
  }, [mapKeyData]);

  useEffect(() => {
    if (!mapInstance) return;
    mapInstance.on("load", () => {
      if (!mapSearchRef.current) {
        return;
      }

      mapInstance.addControl(mapSearchRef.current);
    });
    return () => {
      // mapSearchRef?.current &&
      //   mapInstance &&
      //   mapInstance.removeControl(mapSearchRef.current);
    };
  }, [mapInstance]);

  return {
    mapContainerRef,
    mapInstance,
  };
};
