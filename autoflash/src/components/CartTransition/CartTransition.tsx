'use client';

import { useEffect, useRef } from "react";
import type { DotLottie } from "@lottiefiles/dotlottie-react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import styles from "./CartTransition.module.css";

const CART_ANIMATION_URL =
  "https://lottie.host/836f4535-e066-4f5c-af6d-3b94b6c5e668/1b0cSeddqF.lottie";

export default function CartTransition({
  animationUrl = CART_ANIMATION_URL,
  title = "Added to cart",
  message = "Taking you to checkout when the animation finishes...",
  onComplete,
}: {
  animationUrl?: string;
  title?: string;
  message?: string;
  onComplete?: () => void;
}) {
  const hasCompletedRef = useRef(false);
  const timeoutRef = useRef<number | null>(null);

  const completeOnce = () => {
    if (hasCompletedRef.current) return;

    hasCompletedRef.current = true;
    onComplete?.();
  };

  useEffect(() => {
    timeoutRef.current = window.setTimeout(completeOnce, 7000);

    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div className={styles.overlay} role="status" aria-live="polite">
      <div className={styles.panel}>
        <DotLottieReact
          src={animationUrl}
          loop={false}
          autoplay
          speed={0.65}
          backgroundColor="transparent"
          dotLottieRefCallback={(dotLottie: DotLottie | null) => {
            if (!dotLottie) return;

            dotLottie.addEventListener("complete", completeOnce);
          }}
          className={styles.animation}
        />
        <h2>{title}</h2>
        <p>{message}</p>
      </div>
    </div>
  );
}
