"use client";
import { useCallback, useState } from "react";
import Confetti from "react-confetti";
import { createPortal } from "react-dom";

const confettiColors = ["#A8D8B9", "#F7DAD9", "#FCE5B0", "#B5D6E0", "#FFD6A5"];

export function useConfetti() {
  const [visible, setVisible] = useState(false);

  const show = useCallback(
    (opts?: { numberOfPieces?: number; duration?: number }) => {
      setVisible(true);
      const duration = opts?.duration ?? 2500;
      setTimeout(() => setVisible(false), duration);
    },
    [],
  );

  const confettiContext = visible
    ? createPortal(
        <div
          className="confetti"
          style={{
            position: "fixed",
            inset: 0,
            pointerEvents: "none",
            zIndex: 9999,
          }}
        >
          <>
            <Confetti
              width={1080}
              height={540}
              numberOfPieces={120}
              recycle={false}
              colors={confettiColors}
            />
          </>
        </div>,
        document.body,
      )
    : null;

  return { show, confettiContext } as const;
}
