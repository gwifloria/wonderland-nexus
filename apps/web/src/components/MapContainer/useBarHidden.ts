import { useEffect } from "react";

const eleName = "mapboxgl-ctrl-attrib-inner";

export const useBarHidden = () => {
  useEffect(() => {
    const elements = document.getElementsByClassName(eleName);
    Array.from(elements).forEach((ele: any) => {
      ele.style.visibility = "hidden";
      const a = ele.getElementsByTagName("a");
      Array.from(a).forEach((i: any) => (i.style.visibility = "hidden"));
    });
  }, []);
};
