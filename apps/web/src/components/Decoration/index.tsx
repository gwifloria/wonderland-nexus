import Image from "next/image";

interface DecorationProps {
  src: string;
  className?: string;
  alt?: string;
}

export default function Decoration({
  src,
  className = "",
  alt = "",
}: DecorationProps) {
  return (
    <div
      className={`pointer-events-none absolute ${className}`}
      aria-hidden="true"
    >
      <Image src={src} alt={alt} fill className="object-contain" />
    </div>
  );
}
