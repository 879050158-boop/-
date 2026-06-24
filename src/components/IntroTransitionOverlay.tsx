import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";

interface IntroTransitionOverlayProps {
  isActive: boolean;
}

interface FloatingElement {
  id: number;
  x: number;
  y: number;
  tx: number;
  ty: number;
  scale: number;
  rotateStart: number;
  rotateEnd: number;
  duration: number;
  delay: number;
  type: "petal" | "goldDust" | "crane" | "butterfly";
}

export default function IntroTransitionOverlay({ isActive }: IntroTransitionOverlayProps) {
  const [elements, setElements] = useState<FloatingElement[]>([]);

  useEffect(() => {
    if (isActive) {
      // Create a rich suite of floating elements representing the elegant transition
      const newElements: FloatingElement[] = Array.from({ length: 30 }).map((_, i) => {
        const rand = Math.random();
        let type: "petal" | "goldDust" | "crane" | "butterfly" = "petal";
        if (rand < 0.35) {
          type = "petal";
        } else if (rand < 0.70) {
          type = "goldDust";
        } else if (rand < 0.85) {
          type = "butterfly";
        } else {
          type = "crane";
        }

        return {
          id: i,
          x: 5 + Math.random() * 90,
          y: 110, // Start below the screen
          tx: 5 + Math.random() * 90 + (Math.random() * 40 - 20),
          ty: -15 - Math.random() * 25, // Float up and off-screen
          scale: type === "crane" 
            ? 0.7 + Math.random() * 0.6 
            : type === "butterfly" 
              ? 0.5 + Math.random() * 0.5 
              : type === "petal" 
                ? 0.6 + Math.random() * 0.7 
                : 0.3 + Math.random() * 0.4,
          rotateStart: Math.random() * 360,
          rotateEnd: Math.random() * 360 + (Math.random() > 0.5 ? 270 : -270),
          duration: 1.1 + Math.random() * 0.7,
          delay: Math.random() * 0.3,
          type,
        };
      });
      setElements(newElements);
    } else {
      setElements([]);
    }
  }, [isActive]);

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="fixed inset-0 z-[99999] pointer-events-none overflow-hidden flex items-center justify-center bg-transparent"
        >
          {/* Glassmorphism blurring overlay connecting the screens (Deep Rose/Burgundy to Golden Amber tones, NO GREEN) */}
          <motion.div
            initial={{ backdropFilter: "blur(0px)", opacity: 0 }}
            animate={{ backdropFilter: "blur(20px)", opacity: 1 }}
            exit={{ backdropFilter: "blur(0px)", opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="absolute inset-0 bg-gradient-to-b from-[#fff5f6]/35 via-[#fbcfe8]/25 to-[#fecdd3]/35"
          />

          {/* Traditional Fine Water Ripple (水纹) Animated Symmetrical SVG Background */}
          <div className="absolute inset-0 w-full h-full opacity-20 flex items-center justify-center pointer-events-none z-10">
            <svg className="w-[85%] h-[85%]" viewBox="0 0 800 800" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="rippleGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#fda4af" stopOpacity="0.8" />
                  <stop offset="50%" stopColor="#f472b6" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#eab308" stopOpacity="0.6" />
                </linearGradient>
              </defs>
              {/* Dynamic Concentric Water Ripple waves */}
              <circle cx="400" cy="400" r="120" stroke="url(#rippleGrad)" strokeWidth="1" strokeDasharray="4 4" className="animate-pulse" style={{ animationDuration: "3s" }} />
              <circle cx="400" cy="400" r="220" stroke="url(#rippleGrad)" strokeWidth="0.85" />
              <circle cx="400" cy="400" r="320" stroke="url(#rippleGrad)" strokeWidth="0.7" strokeDasharray="8 8" />
              <circle cx="400" cy="400" r="420" stroke="url(#rippleGrad)" strokeWidth="0.5" />
              
              {/* Symmetrical overlapping classical waves (海波纹) */}
              <path d="M 100,400 Q 150,370 200,400 T 300,400 T 400,400 T 500,400 T 600,400 T 700,400" stroke="url(#rippleGrad)" strokeWidth="0.8" opacity="0.75" />
              <path d="M 150,420 Q 200,390 250,420 T 350,420 T 450,420 T 550,420 T 650,420" stroke="url(#rippleGrad)" strokeWidth="0.6" opacity="0.5" />
              <path d="M 50,380 Q 100,350 150,380 T 250,380 T 350,380 T 450,380 T 550,380 T 650,380 T 750,380" stroke="url(#rippleGrad)" strokeWidth="0.5" opacity="0.4" />
            </svg>
          </div>

          {/* Liquid Silk Watercolor Wash waves (Pink & Gold to Deep Royal Burgundy/Rose-950) */}
          <div className="absolute inset-0 w-full h-full flex flex-col justify-between z-0">
            {/* Top Wave (Flowing downward, Soft Peach-Pink watercolor) */}
            <motion.div
              initial={{ y: "-100%" }}
              animate={{ y: "0%" }}
              exit={{ y: "-100%" }}
              transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
              className="w-full h-[65%] absolute top-0 left-0"
              style={{
                background: "linear-gradient(180deg, #fff5f6 0%, rgba(255, 245, 246, 0.98) 40%, rgba(251, 182, 196, 0.8) 75%, rgba(0,0,0,0) 100%)",
                mixBlendMode: "normal",
              }}
            />

            {/* Bottom Wave (Flowing upward, elegant pastel blossom pink watercolor, completely replacing deep burgundy) */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: "0%" }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
              className="w-full h-[65%] absolute bottom-0 left-0"
              style={{
                background: "linear-gradient(0deg, #fecdd3 0%, rgba(254, 205, 211, 0.95) 45%, rgba(253, 224, 230, 0.7) 75%, rgba(0,0,0,0) 100%)",
                mixBlendMode: "normal",
              }}
            />

            {/* Elegant middle blending glow of precious gold dust & peony rose mist */}
            <motion.div
              initial={{ opacity: 0, scale: 0.75 }}
              animate={{ opacity: 0.9, scale: 1.25 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.75, ease: "easeOut" }}
              className="absolute inset-0 m-auto w-[450px] h-[450px] rounded-full filter blur-[60px]"
              style={{
                background: "radial-gradient(circle, rgba(234, 179, 8, 0.35) 0%, rgba(219, 39, 119, 0.22) 45%, rgba(0,0,0,0) 75%)",
              }}
            />
          </div>

          {/* High-End Celestial Zen Quote Card (Appears gracefully in the exact center) */}
          <div className="absolute inset-0 flex items-center justify-center z-30 select-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.05, y: -15 }}
              transition={{ duration: 0.7, delay: 0.1, ease: [0.19, 1, 0.22, 1] }}
              className="flex flex-col items-center justify-center p-6 sm:p-8 bg-white/95 border border-[#eab308]/30 rounded-lg shadow-[0_25px_60px_-15px_rgba(76,5,25,0.25),_inset_0_0_15px_rgba(251,113,133,0.06)] max-w-[350px] text-center"
              style={{
                backgroundImage: `radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.98) 0%, rgba(254, 242, 244, 0.99) 100%)`
              }}
            >
              {/* Elegant Gold Corner Frames */}
              <div className="absolute top-2 left-2 w-3.5 h-3.5 border-t border-l border-[#eab308]/60" />
              <div className="absolute top-2 right-2 w-3.5 h-3.5 border-t border-r border-[#eab308]/60" />
              <div className="absolute bottom-2 left-2 w-3.5 h-3.5 border-b border-l border-[#eab308]/60" />
              <div className="absolute bottom-2 right-2 w-3.5 h-3.5 border-b border-r border-[#eab308]/60" />

              {/* Small Red/Pink stamp signature design */}
              <div className="text-[10px] text-[#db2777] font-sans font-black tracking-[0.35em] uppercase mb-2 border-b border-[#db2777]/20 pb-1 w-full">
                K UN L U N  B A L L A D
              </div>

              {/* Main Calligraphy Quote in elegant pink-burgundy tones */}
              <div className="font-serif font-black text-lg sm:text-xl text-[#4c0519] tracking-[0.25em] mb-1.5 leading-relaxed">
                破茧成蝶 • 自得乾坤
              </div>

              {/* Supportive text */}
              <div className="font-serif text-[10.5px] text-stone-500 tracking-[0.18em] leading-relaxed">
                心藏恒久温柔，身拥无限力量
              </div>

              <div className="w-8 h-[1px] bg-[#eab308]/40 mt-3.5" />
            </motion.div>
          </div>

          {/* Drifting Petals, Gilded Butterflies, Cranes and Gold Dust elements floating upward */}
          <div className="absolute inset-0 w-full h-full z-20">
            {elements.map((el) => (
              <motion.div
                key={el.id}
                initial={{
                  left: `${el.x}%`,
                  top: `${el.y}%`,
                  scale: 0,
                  rotate: el.rotateStart,
                  opacity: 0,
                }}
                animate={{
                  left: `${el.tx}%`,
                  top: `${el.ty}%`,
                  scale: el.scale,
                  rotate: el.rotateEnd,
                  opacity: [0, 0.95, 0.95, 0],
                }}
                transition={{
                  duration: el.duration,
                  delay: el.delay,
                  ease: "easeOut",
                  times: [0, 0.18, 0.82, 1],
                }}
                className="absolute pointer-events-none"
              >
                {el.type === "petal" ? (
                  /* Elegant Pink Flower Petal SVG */
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    className="drop-shadow-[0_2px_4px_rgba(251,113,133,0.3)] text-pink-400"
                  >
                    <path
                      d="M12 2C12 2 4 8 4 14C4 18.42 7.58 22 12 22C16.42 22 20 18.42 20 14C20 8 12 2 12 2Z"
                      fill="currentColor"
                      fillOpacity="0.85"
                    />
                    <path
                      d="M12 4C12 4 6 9.5 6 14"
                      stroke="#ffe4e6"
                      strokeWidth="1.2"
                      strokeLinecap="round"
                      strokeOpacity="0.6"
                    />
                  </svg>
                ) : el.type === "butterfly" ? (
                  /* Gilded traditional butterfly (蝴蝶) representing transformation & grace */
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    className="drop-shadow-[0_2px_5px_rgba(234,179,8,0.4)] text-amber-300"
                  >
                    <path
                      d="M12 13C12 13 9 7 5 7C2 7 1 9.5 2 12C3 14 7 15 12 18C17 15 21 14 22 12C23 9.5 22 7 19 7C15 7 12 13 12 13ZM12 11C12 11 10 9 7 9C5 9 4.5 10 5 11.5C5.5 13 8 14 12 16.5C16 14 18.5 13 19 11.5C19.5 10 19 9 17 9C14 9 12 11 12 11Z"
                      fill="currentColor"
                      fillOpacity="0.85"
                      stroke="#ffffff"
                      strokeWidth="0.4"
                    />
                  </svg>
                ) : el.type === "crane" ? (
                  /* Soaring Crane (仙鹤) silhouette representing freedom and high-end elegance */
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    className="drop-shadow-[0_3px_6px_rgba(255,255,255,0.4)] text-[#fff5f6]"
                  >
                    <path
                      d="M12 12C10 9.5 8 10.5 7.5 11C8.5 12 10.5 12 11 11.5C10.5 12.5 10 14.5 11 15C11.5 14 11.5 12.5 11.5 11.5C12.5 12 14 12 14.5 11C13.5 10.5 12 9.5 11.5 12Z"
                      fill="currentColor"
                      transform="scale(1.8) translate(-3, -3)"
                    />
                  </svg>
                ) : (
                  /* Gilded gold dust sparkles */
                  <div
                    className="w-2.5 h-2.5 bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 rounded-full filter blur-[0.4px]"
                    style={{
                      boxShadow: "0 0 12px rgba(251, 191, 36, 0.95)",
                    }}
                  />
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
