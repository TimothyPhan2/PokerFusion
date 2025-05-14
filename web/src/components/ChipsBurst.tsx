import { useEffect } from "react";
import { motion, useAnimation } from "framer-motion";

const CHIP_COUNT = 20;
const MAX_DISTANCE = 500;
export default function ChipsBurst() {
  const controls = useAnimation();

  useEffect(() => {
    (async () => {
      controls.start((i) => {
        const angle = (360 / CHIP_COUNT) * i + (Math.random() * 30 - 15);
        const rad = (angle * Math.PI) / 180;
        const dist = MAX_DISTANCE * (0.6 + Math.random() * 0.4);
        return {
          x: Math.cos(rad) * dist,
          y: Math.sin(rad) * dist,
          scale: 1.25 * Math.random() + 0.5,
          rotate: 360 * (Math.random() > 0.5 ? 1 : -1),
          transition: {
            duration: 0.25 + Math.random() * 0.4,
            ease: "easeOut",
          },
        };
      });
      controls.start({
        opacity: 0,
        transition: {
          duration: 1,
          ease: "easeOut",
        },
      });
    })();
  }, [controls]);

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: "45%",
        pointerEvents: "none",
        padding: "1rem",

        overflow: "visible",
        zIndex: -1, // ensure chips are at bottom of stacking context
      }}
    >
      {Array.from({ length: CHIP_COUNT }).map((_, i) => (
        <motion.img
          key={i}
          custom={i}
          animate={controls}
          src={`/logo/${i % 2}.png`}
          style={{
            position: "absolute",
            width: 40,
            height: 40,
            top: "50%",
            left: "50%",
            marginLeft: -20,
            // marginTop: -20,
          }}
        />
      ))}
    </div>
  );
}
