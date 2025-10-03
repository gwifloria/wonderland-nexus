import { Destination, MapDestinationMarker } from "@/types";
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";
import { MapEventType, MapMouseEvent } from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useCallback, useEffect } from "react";
import { useBarHidden } from "./useBarHidden";
import { useMapInstance } from "./useMapInstance";
import { useMapMarker } from "./useMapMarker";

type MapEventProps = {
  [K in MapEventType]?: (e: MapMouseEvent) => void;
};
interface MapContainerProps extends MapEventProps {
  destinations?: MapDestinationMarker[];
}

const MapContainer = (props: MapContainerProps) => {
  const { mapContainerRef, mapInstance } = useMapInstance();
  const { destinations, dblclick } = props;
  useBarHidden();

  useMapMarker(mapInstance, destinations);

  const dblistener = useCallback(
    (e: MapMouseEvent) => {
      dblclick && dblclick(e);
    },
    [dblclick],
  );

  useEffect(() => {
    const ref = mapInstance;

    if (!ref) {
      return;
    }
    ref?.on("dblclick", dblistener);

    return () => {
      ref?.off("dblclick", dblistener);
    };
  }, [dblistener, mapInstance]);

  return (
    <>
      <div id="map" ref={mapContainerRef} style={{ height: "100%" }}></div>
    </>
  );
};

export default MapContainer;
