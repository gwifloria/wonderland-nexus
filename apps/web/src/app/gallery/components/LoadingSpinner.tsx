"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center gap-6 py-12">
      {/* Scrapbook-style loading: wobbling photo stack */}
      <div className="relative w-32 h-32">
        {/* Bottom photo - slightly rotated */}
        <motion.div
          animate={{
            rotate: [5, 7, 5],
            y: [0, -2, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute inset-0 bg-milktea-100 rounded-sm shadow-md border-4 border-milktea-50"
          style={{ transform: "rotate(5deg)" }}
        />

        {/* Middle photo - opposite rotation */}
        <motion.div
          animate={{
            rotate: [-3, -5, -3],
            y: [0, -3, 0],
          }}
          transition={{
            duration: 2.2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.3,
          }}
          className="absolute inset-0 bg-rose-100 rounded-sm shadow-lg border-4 border-rose-50"
          style={{ transform: "rotate(-3deg)" }}
        />

        {/* Top photo - with notebook icon */}
        <motion.div
          animate={{
            rotate: [2, 0, 2],
            y: [0, -4, 0],
          }}
          transition={{
            duration: 2.4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.6,
          }}
          className="absolute inset-0 bg-milktea-50 rounded-sm shadow-xl border-4 border-white flex items-center justify-center"
          style={{ transform: "rotate(2deg)" }}
        >
          <div className="relative w-16 h-16 opacity-40">
            <Image
              src="/images/notebook.png"
              alt=""
              fill
              style={{ objectFit: "contain" }}
            />
          </div>
        </motion.div>
      </div>

      {/* Handwritten loading text */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: [0.6, 1, 0.6] }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="text-center"
      >
        <div
          className="text-xl text-milktea-700"
          style={{ fontFamily: "'Caveat', cursive" }}
        >
          Loading memories...
        </div>
      </motion.div>

      {/* Hand-drawn dots */}
      <div className="flex gap-3">
        {[0, 1, 2].map((index) => (
          <motion.div
            key={index}
            initial={{ scale: 1, opacity: 0.5 }}
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.5, 0.8, 0.5],
            }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: index * 0.3,
            }}
            className="w-2.5 h-2.5 bg-milktea-400 rounded-full"
            style={{
              transform: `rotate(${index * 15}deg)`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
