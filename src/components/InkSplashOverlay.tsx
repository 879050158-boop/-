import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";

interface InkSplashOverlayProps {
  isActive: boolean;
  onComplete?: () => void;
}

interface InkSplat {
  id: number;
  x: number; // percentage width
  y: number; // percentage height
  scaleStart: number;
  scaleEnd: number;
  delay: number;
  duration: number;
  color: string;
  rotateStart: number;
  rotateEnd: number;
}

export default function InkSplashOverlay({ isActive, onComplete }: InkSplashOverlayProps) {
  const [splats, setSplats] = useState<InkSplat[]>([]);

  useEffect(() => {
    if (isActive) {
      // Generate highly organic looking randomized splash spots across the screen center & quadrants
      const newSplats: InkSplat[] = [
        // Huge central core splat (濃墨)
        {
          id: 1,
          x: 50,
          y: 45,
          scaleStart: 0,
          scaleEnd: 4.8,
          delay: 0,
          duration: 0.95,
          color: "#121212", // Intense raw soot black
          rotateStart: -30,
          rotateEnd: 45,
        },
        // Secondary central red cinnabar bleed splat (朱砂)
        {
          id: 2,
          x: 48,
          y: 52,
          scaleStart: 0,
          scaleEnd: 3.6,
          delay: 0.08,
          duration: 1.1,
          color: "#831818", // Cinnabar/crimson red
          rotateStart: 15,
          rotateEnd: -60,
        },
        // Left quadrant scatter splash
        {
          id: 3,
          x: 25,
          y: 35,
          scaleStart: 0,
          scaleEnd: 2.8,
          delay: 0.14,
          duration: 0.85,
          color: "#1c1917", // warm wood-soot black
          rotateStart: -90,
          rotateEnd: 10,
        },
        // Right quadrant scatter splash
        {
          id: 4,
          x: 75,
          y: 60,
          scaleStart: 0,
          scaleEnd: 3.2,
          delay: 0.18,
          duration: 0.9,
          color: "#121212",
          rotateStart: 45,
          rotateEnd: 135,
        },
        // Top-right auxiliary spurt splat
        {
          id: 5,
          x: 68,
          y: 22,
          scaleStart: 0,
          scaleEnd: 2.2,
          delay: 0.22,
          duration: 0.75,
          color: "#831818",
          rotateStart: -15,
          rotateEnd: 15,
        },
        // Bottom-left supportive bleed
        {
          id: 6,
          x: 32,
          y: 72,
          scaleStart: 0,
          scaleEnd: 2.6,
          delay: 0.25,
          duration: 0.8,
          color: "#1c1917",
          rotateStart: 60,
          rotateEnd: -10,
        },
        // Small gold sparkling highlights (金屑飞溅)
        {
          id: 7,
          x: 52,
          y: 40,
          scaleStart: 0,
          scaleEnd: 1.4,
          delay: 0.3,
          duration: 0.6,
          color: "#d4af37", // Imperial gold highlight
          rotateStart: 0,
          rotateEnd: 180,
        },
        {
          id: 8,
          x: 45,
          y: 58,
          scaleStart: 0,
          scaleEnd: 1.6,
          delay: 0.35,
          duration: 0.65,
          color: "#d4af37",
          rotateStart: -45,
          rotateEnd: 90,
        }
      ];

      setSplats(newSplats);

      // Call completion callback after splash animation has peaked and starts fading
      const timer = setTimeout(() => {
        if (onComplete) {
          onComplete();
        }
      }, 2000);

      return () => clearTimeout(timer);
    } else {
      setSplats([]);
    }
  }, [isActive, onComplete]);

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, filter: "blur(20px)" }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="fixed inset-0 z-[99999] bg-stone-950/20 backdrop-blur-[1px] pointer-events-none flex items-center justify-center overflow-hidden"
          style={{
            // Apply a stunning liquid gooey filter so the expanding ink splats merge together organically!
            filter: "contrast(26) brightness(1.15)",
          }}
        >
          {/* Real parchment-texture base overlay that momentarily blocks view */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.95 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="absolute inset-0 bg-[#0f1012] mix-blend-multiply"
          />

          <div className="absolute inset-0 w-full h-full relative">
            {splats.map((splat) => (
              <motion.div
                key={splat.id}
                initial={{
                  x: `${splat.x}vw`,
                  y: `${splat.y}vh`,
                  scale: splat.scaleStart,
                  rotate: splat.rotateStart,
                  opacity: 0,
                  filter: "blur(18px)",
                }}
                animate={{
                  scale: splat.scaleEnd,
                  rotate: splat.rotateEnd,
                  opacity: 1,
                  filter: "blur(3px)",
                }}
                transition={{
                  scale: {
                    duration: splat.duration,
                    delay: splat.delay,
                    ease: [0.1, 0.82, 0.165, 1], // deep fast splash ease out
                  },
                  rotate: {
                    duration: splat.duration + 0.5,
                    delay: splat.delay,
                    ease: "easeOut",
                  },
                  opacity: {
                    duration: 0.18,
                    delay: splat.delay,
                    ease: "linear",
                  },
                  filter: {
                    duration: splat.duration * 0.9,
                    delay: splat.delay,
                    ease: "easeOut",
                  },
                }}
                className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full"
                style={{
                  width: `${60 + splat.id * 8}px`,
                  height: `${60 + splat.id * 8}px`,
                  backgroundColor: splat.color,
                  // Traditional irregular organic ink bleeds simulated using randomized border radius values
                  borderRadius: splat.id % 2 === 0 
                    ? "38% 62% 63% 37% / 41% 44% 56% 59%" 
                    : "68% 32% 43% 57% / 31% 65% 35% 69%",
                  boxShadow: `0 0 35px ${splat.color}`,
                }}
              >
                {/* Irregular brush-splat micro-spikes inside the dynamic gooey filter */}
                <div 
                  className="absolute inset-[10%] bg-current opacity-80"
                  style={{
                    color: splat.color,
                    borderRadius: "45% 55% 32% 68% / 55% 35% 65% 45%",
                    transform: `rotate(${splat.id * 45}deg)`,
                  }}
                />
              </motion.div>
            ))}
          </div>

          {/* Gorgeous ink ripples expansion */}
          {[...Array(4)].map((_, idx) => (
            <motion.div
              key={idx}
              initial={{ scale: 0.1, opacity: 0 }}
              animate={{ scale: 2.8, opacity: [0, 0.45, 0] }}
              transition={{
                duration: 1.8,
                delay: idx * 0.35,
                ease: "easeOut",
                repeat: 0,
              }}
              className="absolute w-[220px] h-[220px] rounded-full border-[1.5px] border-stone-800"
              style={{
                borderRadius: "44% 56% 51% 49% / 57% 41% 59% 43%",
                filter: "blur(4px)",
              }}
            />
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
