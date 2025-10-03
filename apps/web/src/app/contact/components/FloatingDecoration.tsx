import Image from "next/image";

interface FloatingDecorationProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
}

export function FloatingDecoration({
  src,
  alt,
  width,
  height,
  className = "",
}: FloatingDecorationProps) {
  return (
    <div
      className={`pointer-events-none absolute opacity-60 ${className}`}
      style={{ width, height }}
    >
      <Image src={src} alt={alt} fill className="object-contain" />
    </div>
  );
}
