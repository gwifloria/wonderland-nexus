import CopyrightInfo from "@/components/CopyrightInfo";
import { HeroSection, NavCards, PaperBackdrop } from "@/components/Homepage";
import Image from "next/image";
export default function HomeContainer() {
  return (
    <>
      <div className="big-bg fixed inset-0 z-11 opacity-50 pointer-events-none overflow-hidden">
        <Image
          src="/images/niupizhi-bg-cropped.png"
          alt="Background"
          fill
          style={{ objectFit: "cover" }}
        />
      </div>
      <main className="mx-auto max-w-[720px] h-full w-full overflow-hidden px-4 py-8 sm:py-16 flex flex-col">
        {/* Background sits behind everything */}
        <PaperBackdrop />

        {/* Content column */}
        <section className="flex-1 w-full">
          {/* Lighter blur on mobile to avoid muddy text */}
          <HeroSection />
          <NavCards />
        </section>

        {/* Copyright info - only on homepage */}
        <CopyrightInfo />
      </main>
    </>
  );
}
