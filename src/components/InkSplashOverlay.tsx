import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";

interface InkSplashOverlayProps {
  isActive: boolean;
  onComplete?: () => void;
}

interface FloatingElement {
  id: number;
  type: "gold" | "petal";
  x: number;       // initial horizontal percentage
  y: number;       // initial vertical percentage
  tx: number;      // translation target X
  ty: number;      // translation target Y
  scale: number;
  rotateStart: number;
  rotateEnd: number;
  duration: number;
  delay: number;
  color: string;
}

interface SoftInkCloud {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  delay: number;
  duration: number;
  scaleMax: number;
}

export default function InkSplashOverlay({ isActive, onComplete }: InkSplashOverlayProps) {
  const [floaters, setFloaters] = useState<FloatingElement[]>([]);
  const [inkClouds, setInkClouds] = useState<SoftInkCloud[]>([]);

  useEffect(() => {
    if (isActive) {
      // 1. Generate elegant falling details: Luxury Gold Foil (泥金) & Azurite Blue Petals (石青花瓣)
      const newFloaters: FloatingElement[] = Array.from({ length: 24 }).map((_, i) => {
        const isLeft = i % 2 === 0;
        const type = Math.random() > 0.4 ? "gold" : "petal";
        
        // Exquisite color variations
        const goldColors = ["#ffd700", "#fbbf24", "#fcd34d", "#f59e0b"];
        const petalColors = ["#0e7490", "#0284c7", "#38bdf8", "#0369a1", "#025287"];
        const selectedColor = type === "gold" 
          ? goldColors[Math.floor(Math.random() * goldColors.length)]
          : petalColors[Math.floor(Math.random() * petalColors.length)];

        return {
          id: i,
          type,
          x: isLeft ? -10 - Math.random() * 20 : 110 + Math.random() * 20,
          y: Math.random() * 80 + 10,
          tx: isLeft ? 120 + Math.random() * 20 : -20 - Math.random() * 20,
          ty: Math.random() * 100 + 10,
          scale: type === "gold" ? 0.3 + Math.random() * 0.5 : 0.6 + Math.random() * 0.6,
          rotateStart: Math.random() * 360,
          rotateEnd: Math.random() * 360 + (isLeft ? 360 : -360),
          duration: 1.5 + Math.random() * 1.3,
          delay: Math.random() * 0.3,
          color: selectedColor
        };
      });
      setFloaters(newFloaters);

      // 2. Generate soft, majestic deep-blue ink wash clouds
      const newClouds: SoftInkCloud[] = [
        // Center main wash (Deep Azurite Navy)
        {
          id: 1,
          x: 50,
          y: 48,
          size: 600,
          color: "rgba(13, 59, 87, 0.94)", // Kunlun base dark blue
          delay: 0,
          duration: 1.0,
          scaleMax: 3.4,
        },
        // Left splash (Cerulean Blue)
        {
          id: 2,
          x: 35,
          y: 45,
          size: 500,
          color: "rgba(14, 116, 144, 0.88)", // Deep teal-blue
          delay: 0.04,
          duration: 1.1,
          scaleMax: 3.1,
        },
        // Right splash (Luminous Indigo)
        {
          id: 3,
          x: 65,
          y: 52,
          size: 520,
          color: "rgba(3, 105, 161, 0.85)", // Indigo-sky blue
          delay: 0.08,
          duration: 1.1,
          scaleMax: 3.0,
        },
        // Bottom-up background wash (Slate Charcoal)
        {
          id: 4,
          x: 50,
          y: 70,
          size: 650,
          color: "rgba(15, 23, 42, 0.92)", // Slate dark gray
          delay: 0.02,
          duration: 0.9,
          scaleMax: 2.8,
        },
        // Gentle emerald water wash shimmer (adds sophisticated organic variation)
        {
          id: 5,
          x: 45,
          y: 35,
          size: 420,
          color: "rgba(13, 148, 136, 0.65)", // Sage/teal wash
          delay: 0.12,
          duration: 1.2,
          scaleMax: 3.3,
        },
        // Luminous gold halo bleed (simulating gilded lacquer ink wash boundary)
        {
          id: 6,
          x: 52,
          y: 45,
          size: 380,
          color: "rgba(234, 179, 8, 0.18)", // Pure warm gold dust glow
          delay: 0.05,
          duration: 1.2,
          scaleMax: 3.2,
        },
      ];
      setInkClouds(newClouds);

      // Trigger transition callback when screen is fully blanketed
      const timer = setTimeout(() => {
        if (onComplete) {
          onComplete();
        }
      }, 550);

      return () => clearTimeout(timer);
    } else {
      setFloaters([]);
      setInkClouds([]);
    }
  }, [isActive, onComplete]);

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.45, ease: "easeInOut" }}
          className="fixed inset-0 z-[99999] pointer-events-none overflow-hidden flex items-center justify-center bg-transparent"
        >
          {/* Main Backdrop Glassmorphism Blur */}
          <motion.div
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
            animate={{ opacity: 1, backdropFilter: "blur(24px)" }}
            exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
            transition={{ duration: 0.45 }}
            className="absolute inset-0 bg-[#020617]/35"
          />

          {/* Flowing Water Silk Background Gradient */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.95 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.75 }}
            className="absolute inset-0 bg-gradient-to-tr from-[#020c1b] via-[#092c4e] to-[#041d33] mix-blend-color-grow"
          />

          {/* 1. Soft Ink Wash Watercolor Bleeds */}
          <div className="absolute inset-0 w-full h-full">
            {inkClouds.map((cloud) => (
              <motion.div
                key={cloud.id}
                initial={{
                  x: `${cloud.x}vw`,
                  y: `${cloud.y}vh`,
                  scale: 0.05,
                  opacity: 0,
                }}
                animate={{
                  scale: cloud.scaleMax,
                  opacity: [0, 0.98, 0.98, 0],
                }}
                exit={{
                  opacity: 0,
                  scale: cloud.scaleMax * 1.15,
                }}
                transition={{
                  duration: cloud.duration,
                  delay: cloud.delay,
                  ease: [0.16, 1, 0.3, 1], // super smooth cinematic ease out
                  times: [0, 0.38, 0.82, 1]
                }}
                className="absolute -translate-x-1/2 -translate-y-1/2 filter blur-[65px]"
                style={{
                  width: `${cloud.size}px`,
                  height: `${cloud.size}px`,
                  backgroundColor: cloud.color,
                  borderRadius: "50%",
                  mixBlendMode: "multiply"
                }}
              />
            ))}
          </div>

          {/* 2. Self-Drawing Calligraphic Silk Gold Ribbon (水墨金丝飞仙) */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" viewBox="0 0 1000 1000" preserveAspectRatio="none">
            <defs>
              <linearGradient id="silkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity="0" />
                <stop offset="30%" stopColor="#0ea5e9" stopOpacity="0.4" />
                <stop offset="70%" stopColor="#fbbf24" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
              </linearGradient>
            </defs>
            <motion.path
              d="M-50,650 C250,550 150,150 500,450 C850,750 750,150 1050,350"
              fill="none"
              stroke="url(#silkGrad)"
              strokeWidth="2.5"
              strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: [0, 1, 1, 0] }}
              transition={{ duration: 1.8, ease: "easeInOut", times: [0, 0.2, 0.8, 1] }}
            />
            <motion.path
              d="M-30,680 C270,580 180,180 520,420 C860,660 780,180 1070,320"
              fill="none"
              stroke="url(#silkGrad)"
              strokeWidth="1.2"
              strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: [0, 0.7, 0.7, 0] }}
              transition={{ duration: 2.0, delay: 0.15, ease: "easeInOut", times: [0, 0.2, 0.8, 1] }}
            />
          </svg>

          {/* 3. Traditional "Jin Bi Shan Shui" (金碧山水) Mountain Outlines */}
          <div className="absolute inset-x-0 bottom-0 h-[60%] flex items-end justify-center pointer-events-none select-none z-20">
            <svg className="w-full h-full text-[#ffd700] fill-current" viewBox="0 0 1440 320" preserveAspectRatio="none">
              <defs>
                <linearGradient id="mountGrad1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgba(25, 55, 109, 0.85)" />
                  <stop offset="100%" stopColor="rgba(12, 20, 28, 0.95)" />
                </linearGradient>
                <linearGradient id="mountGrad2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgba(10, 72, 112, 0.78)" />
                  <stop offset="100%" stopColor="rgba(8, 16, 24, 0.95)" />
                </linearGradient>
                <linearGradient id="mountGrad3" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgba(3, 46, 92, 0.90)" />
                  <stop offset="100%" stopColor="rgba(4, 10, 18, 0.98)" />
                </linearGradient>
              </defs>

              {/* Layer 1: Distant Misty Peaks */}
              <motion.path 
                initial={{ opacity: 0, y: 110 }}
                animate={{ opacity: [0, 0.35, 0.35, 0], y: [100, 10, 10, -25] }}
                transition={{ duration: 1.9, ease: [0.16, 1, 0.3, 1], times: [0, 0.35, 0.82, 1] }}
                d="M0,280 L140,160 L280,240 L450,110 L600,200 L780,90 L950,220 L1120,130 L1300,230 L1440,150 L1440,320 L0,320 Z" 
                fill="url(#mountGrad1)"
                stroke="rgba(253, 224, 71, 0.2)"
                strokeWidth="1"
              />

              {/* Layer 2: Mid-ground Rugged Crests */}
              <motion.path 
                initial={{ opacity: 0, y: 120 }}
                animate={{ opacity: [0, 0.55, 0.55, 0], y: [110, 15, 15, -35] }}
                transition={{ duration: 1.8, delay: 0.08, ease: [0.16, 1, 0.3, 1], times: [0, 0.35, 0.82, 1] }}
                d="M0,320 L180,220 L350,150 L520,260 L680,140 L840,210 L1020,130 L1180,240 L1320,170 L1440,250 L1440,320 L0,320 Z" 
                fill="url(#mountGrad2)"
                stroke="rgba(254, 240, 138, 0.55)"
                strokeWidth="1.2"
              />

              {/* Layer 3: Foreground Celestial Slopes */}
              <motion.path 
                initial={{ opacity: 0, y: 130 }}
                animate={{ opacity: [0, 0.82, 0.82, 0], y: [120, 20, 20, -45] }}
                transition={{ duration: 1.7, delay: 0.14, ease: [0.16, 1, 0.3, 1], times: [0, 0.35, 0.82, 1] }}
                d="M0,320 L250,260 L450,220 L620,280 L800,210 L980,250 L1200,190 L1440,270 L1440,320 L0,320 Z" 
                fill="url(#mountGrad3)"
                stroke="#ffd700"
                strokeWidth="1.8"
                style={{ filter: "drop-shadow(0 0 12px rgba(253, 224, 71, 0.45))" }}
              />
            </svg>
          </div>

          {/* 4. Concentric Water Ripples (Zen Ripple expansion) */}
          {[...Array(3)].map((_, idx) => (
            <motion.div
              key={idx}
              initial={{ scale: 0.05, opacity: 0 }}
              animate={{ scale: 3.5, opacity: [0, 0.48, 0.48, 0] }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 1.9,
                delay: idx * 0.28,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="absolute w-[280px] h-[280px] rounded-full border-[1.2px] border-sky-300/40 mix-blend-screen"
              style={{
                borderRadius: "53% 47% 54% 46% / 47% 53% 47% 53%",
                filter: "blur(2.5px)",
                boxShadow: "0 0 15px rgba(56, 189, 248, 0.15), inset 0 0 15px rgba(56, 189, 248, 0.15)"
              }}
            />
          ))}

          {/* 5. Swirling Gold Leaf (泥金) & Azurite Blue Petals */}
          <div className="absolute inset-0 w-full h-full z-30">
            {floaters.map((floater) => (
              <motion.div
                key={floater.id}
                initial={{
                  left: `${floater.x}%`,
                  top: `${floater.y}%`,
                  scale: 0,
                  rotate: floater.rotateStart,
                  opacity: 0,
                }}
                animate={{
                  left: `${floater.tx}%`,
                  top: `${floater.ty}%`,
                  scale: floater.scale,
                  rotate: floater.rotateEnd,
                  opacity: [0, 0.9, 0.9, 0],
                }}
                transition={{
                  duration: floater.duration,
                  delay: floater.delay,
                  ease: "easeInOut",
                  times: [0, 0.2, 0.85, 1]
                }}
                className="absolute pointer-events-none"
              >
                {floater.type === "gold" ? (
                  // Gilded Gold Foil leaf (泥金)
                  <div 
                    className="w-3.5 h-2.5 rotate-45"
                    style={{
                      backgroundColor: floater.color,
                      borderRadius: "1px",
                      boxShadow: "0 0 6px rgba(253, 224, 71, 0.7)",
                      transform: "skew(10deg, 10deg)"
                    }}
                  />
                ) : (
                  // Handcrafted fluid Azurite Blue Petal shape
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="drop-shadow-[0_2px_4px_rgba(14,165,233,0.35)]"
                    style={{ color: floater.color }}
                  >
                    <path
                      d="M12 2C12 2 4 8 4 14C4 18.42 7.58 22 12 22C16.42 22 20 18.42 20 14C20 8 12 2 12 2Z"
                      fill="currentColor"
                      fillOpacity="0.88"
                    />
                    <path
                      d="M12 4C12 4 6 9.5 6 14C6 15.5 6.5 17 7.5 18"
                      stroke="#e0f2fe"
                      strokeWidth="1.2"
                      strokeLinecap="round"
                      strokeOpacity="0.7"
                    />
                  </svg>
                )}
              </motion.div>
            ))}
          </div>

          {/* 6. Glowing Gold Dust Sparks */}
          {[...Array(16)].map((_, idx) => {
            const rx = Math.random() * 100;
            const ry = Math.random() * 100;
            return (
              <motion.div
                key={`spark-${idx}`}
                initial={{ left: `${rx}%`, top: `${ry}%`, scale: 0, opacity: 0 }}
                animate={{
                  scale: [0, 1.4, 1.4, 0],
                  opacity: [0, 0.9, 0.9, 0],
                  y: [0, -50 - Math.random() * 50]
                }}
                transition={{
                  duration: 1.4 + Math.random() * 0.8,
                  delay: Math.random() * 0.4,
                  ease: "easeOut",
                }}
                className="absolute w-1.5 h-1.5 bg-gradient-to-r from-amber-200 to-yellow-300 rounded-full filter blur-[0.3px] z-20"
                style={{
                  boxShadow: "0 0 10px rgba(253, 224, 71, 0.8)",
                }}
              />
            );
          })}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
