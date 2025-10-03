"use client";
import dynamic from "next/dynamic";

const RoomScene = dynamic(() => import("./Scene").then((mod) => mod.default), {
  ssr: false,
  loading: () => (
    <div className="flex h-screen items-center justify-center bg-black">
      <div className="text-white">Loading 3D Scene...</div>
    </div>
  ),
});

export default function SpacePage() {
  return (
    <div className="space-page-container h-screen ">
      <RoomScene />
    </div>
  );
}
