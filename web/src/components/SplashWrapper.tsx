import React, { useState, useEffect } from "react";
import { motion, useAnimation } from "framer-motion";
import SharedLogo from "./SharedLogo";
import ChipsBurst from "./ChipsBurst";

interface SplashWrapperProps {
  children: React.ReactNode;
  pauseMs?: number;
}

export default function SplashWrapper({
  children,
  pauseMs = 800,
}: SplashWrapperProps) {
  const [showChildren, setShowChildren] = useState(false);
  const [showChips, setShowChips] = useState(false);
  const controls = useAnimation();

  useEffect(() => {
    (async () => {
      await controls.start({
        scale: 1,
        opacity: 1,
        y: "15%",
        filter: "blur(0px)",
        transition: { duration: 0.35 },
      }); //fly down
      setShowChips(true);
      await controls.start({
        y: "15%",
        x: [0, -20, 20, -15, 15, 0],
        transition: {
          duration: 0.6,
          times: [0, 0.1, 0.3, 0.5, 0.7, 1],
        },
      }); //impact
      await new Promise((res) => setTimeout(res, pauseMs));
      await controls.start({
        y: "200%",
        transition: { duration: 0.45 },
        scale: 0.35,
      }); //exit
      setShowChildren(true);
    })();
  }, [controls, pauseMs]);

  if (!showChildren) {
    return (
      <motion.div
      className="screen-container"
      initial={{ scale: 6, y: "55%" }}
      animate={controls}
    >
      <motion.div
        initial={{ filter: "blur(10px)" }}
        animate={{ filter: "blur(0px)" }}
        transition={{ duration: 0.35 }}
      >
        <SharedLogo width={1000} />
      </motion.div>
    
      {showChips && <ChipsBurst />}
    </motion.div>
    
    );
  }

  return <>{children}</>;
}
