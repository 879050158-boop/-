import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";

interface AzuriteTransitionOverlayProps {
  isActive: boolean;
}

interface Floater {
  id: number;
  type: "goldLeaf" | "azuritePetal" | "glowingSpark";
  x: number;
  y: number;
  tx: number;
  ty: number;
  scale: number;
  rotateStart: number;
  rotateEnd: number;
  duration: number;
  delay: number;
  color: string;
}

interface WatercolorWash {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  delay: number;
  duration: number;
  scaleMax: number;
}

export default function AzuriteTransitionOverlay({ isActive }: AzuriteTransitionOverlayProps) {
  const [particles, setParticles] = useState<Floater[]>([]);
  const [washes, setWashes] = useState<WatercolorWash[]>([]);

  useEffect(() => {
    if (isActive) {
      // 1. Swirling Azurite (石青) petals, Gilded (泥金) leaf, and sparkling gold stardust
      const generatedParticles: Floater[] = Array.from({ length: 32 }).map((_, i) => {
        const rand = Math.random();
        let type: "goldLeaf" | "azuritePetal" | "glowingSpark" = "goldLeaf";
        if (rand < 0.4) {
          type = "azuritePetal";
        } else if (rand < 0.75) {
          type = "goldLeaf";
        } else {
          type = "glowingSpark";
        }

        const isLeft = i % 2 === 0;
        const goldColors = ["#ffd700", "#fbbf24", "#fcd34d", "#f59e0b"];
        const azuriteColors = ["#0ea5e9", "#0284c7", "#0369a1", "#025287", "#0d9488"];
        const selectedColor = type === "azuritePetal"
          ? azuriteColors[Math.floor(Math.random() * azuriteColors.length)]
          : type === "goldLeaf"
            ? goldColors[Math.floor(Math.random() * goldColors.length)]
            : "#ffffff";

        return {
          id: i,
          type,
          x: isLeft ? -10 - Math.random() * 15 : 110 + Math.random() * 15,
          y: 15 + Math.random() * 70,
          tx: isLeft ? 115 + Math.random() * 15 : -15 - Math.random() * 15,
          ty: 5 + Math.random() * 90,
          scale: type === "azuritePetal"
            ? 0.55 + Math.random() * 0.65
            : type === "goldLeaf"
              ? 0.35 + Math.random() * 0.5
              : 0.8 + Math.random() * 0.8,
          rotateStart: Math.random() * 360,
          rotateEnd: Math.random() * 360 + (isLeft ? 360 : -360),
          duration: 1.3 + Math.random() * 1.2,
          delay: Math.random() * 0.25,
          color: selectedColor
        };
      });
      setParticles(generatedParticles);

      // 2. Deep Blue & Teal watercolor splash washes for beautiful backdrop masking
      const generatedWashes: WatercolorWash[] = [
        // Center-Left Indigo Wash
        {
          id: 1,
          x: 42,
          y: 48,
          size: 600,
          color: "rgba(11, 60, 93, 0.96)", // Deep royal indigo
          delay: 0,
          duration: 1.0,
          scaleMax: 3.3,
        },
        // Center-Right Azurite Blue
        {
          id: 2,
          x: 58,
          y: 44,
          size: 550,
          color: "rgba(14, 116, 144, 0.93)", // Intense cyan-blue
          delay: 0.04,
          duration: 1.15,
          scaleMax: 3.1,
        },
        // Top-down Misty Cyan gradient glow
        {
          id: 3,
          x: 50,
          y: 30,
          size: 520,
          color: "rgba(3, 105, 161, 0.88)", // Bright celestial blue
          delay: 0.08,
          duration: 1.1,
          scaleMax: 2.9,
        },
        // Deep turquoise mineral wash
        {
          id: 4,
          x: 48,
          y: 65,
          size: 480,
          color: "rgba(13, 148, 136, 0.75)", // Jade mineral emerald teal
          delay: 0.12,
          duration: 1.2,
          scaleMax: 3.2,
        },
        // Warm gold dust halo bleed (gilded borders of ink wash)
        {
          id: 5,
          x: 50,
          y: 50,
          size: 400,
          color: "rgba(234, 179, 8, 0.22)", // Golden backlight
          delay: 0.06,
          duration: 1.2,
          scaleMax: 3.0,
        },
        // Bottom-up slate shadow mask
        {
          id: 6,
          x: 50,
          y: 75,
          size: 650,
          color: "rgba(15, 23, 42, 0.95)", // Slate dark grounding
          delay: 0.02,
          duration: 0.95,
          scaleMax: 2.8,
        }
      ];
      setWashes(generatedWashes);
    } else {
      setParticles([]);
      setWashes([]);
    }
  }, [isActive]);

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.45 }}
          className="fixed inset-0 z-[99999] pointer-events-none overflow-hidden flex items-center justify-center bg-transparent"
        >
          {/* Glassmorphic Backdrop Blur matching KunlunStage's deep celestial atmosphere */}
          <motion.div
            initial={{ backdropFilter: "blur(0px)", opacity: 0 }}
            animate={{ backdropFilter: "blur(24px)", opacity: 1 }}
            exit={{ backdropFilter: "blur(0px)", opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="absolute inset-0 bg-[#020c1b]/45"
          />

          {/* Liquid Silk Deep Teal-Indigo Watercolor Gradient Base */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.98 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.75 }}
            className="absolute inset-0 bg-gradient-to-tr from-[#020c1b] via-[#092c4e] to-[#041d33]"
          />

          {/* 1. Fluid Ink Wash Watercolor Clouds blooming dynamically */}
          <div className="absolute inset-0 w-full h-full">
            {washes.map((wash) => (
              <motion.div
                key={wash.id}
                initial={{
                  x: `${wash.x}vw`,
                  y: `${wash.y}vh`,
                  scale: 0.05,
                  opacity: 0,
                }}
                animate={{
                  scale: wash.scaleMax,
                  opacity: [0, 0.98, 0.98, 0],
                }}
                exit={{
                  opacity: 0,
                  scale: wash.scaleMax * 1.15,
                }}
                transition={{
                  duration: wash.duration,
                  delay: wash.delay,
                  ease: [0.16, 1, 0.3, 1], // smooth, sweeping ease out
                  times: [0, 0.35, 0.82, 1]
                }}
                className="absolute -translate-x-1/2 -translate-y-1/2 filter blur-[60px]"
                style={{
                  width: `${wash.size}px`,
                  height: `${wash.size}px`,
                  backgroundColor: wash.color,
                  borderRadius: "50%",
                  mixBlendMode: "multiply"
                }}
              />
            ))}
          </div>

          {/* 2. Classical Water Ripple Rings (涟漪) expanding outwards */}
          <div className="absolute inset-0 w-full h-full opacity-35 flex items-center justify-center pointer-events-none z-10">
            <svg className="w-[85%] h-[85%]" viewBox="0 0 800 800" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="azuriteRippleGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8" />
                  <stop offset="50%" stopColor="#0ea5e9" stopOpacity="0.45" />
                  <stop offset="100%" stopColor="#eab308" stopOpacity="0.7" />
                </linearGradient>
              </defs>
              <circle cx="400" cy="400" r="140" stroke="url(#azuriteRippleGrad)" strokeWidth="1" strokeDasharray="5 5" className="animate-pulse" style={{ animationDuration: "3s" }} />
              <circle cx="400" cy="400" r="240" stroke="url(#azuriteRippleGrad)" strokeWidth="0.85" />
              <circle cx="400" cy="400" r="340" stroke="url(#azuriteRippleGrad)" strokeWidth="0.7" strokeDasharray="8 8" />
              <circle cx="400" cy="400" r="440" stroke="url(#azuriteRippleGrad)" strokeWidth="0.5" />
              
              {/* Symmetrical undulating waves representing classical mountain rivers */}
              <path d="M 50,400 Q 150,360 250,400 T 450,400 T 650,400 T 750,400" stroke="url(#azuriteRippleGrad)" strokeWidth="0.8" opacity="0.65" />
              <path d="M 100,430 Q 200,390 300,430 T 500,430 T 700,430" stroke="url(#azuriteRippleGrad)" strokeWidth="0.6" opacity="0.45" />
            </svg>
          </div>

          {/* 3. Concentric Water Ripples expanding with motion */}
          {[...Array(3)].map((_, idx) => (
            <motion.div
              key={`ripple-${idx}`}
              initial={{ scale: 0.1, opacity: 0 }}
              animate={{ scale: 3.2, opacity: [0, 0.45, 0.45, 0] }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 1.8,
                delay: idx * 0.25,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="absolute w-[300px] h-[300px] rounded-full border-[1.2px] border-sky-300/35 mix-blend-screen"
              style={{
                borderRadius: "52% 48% 55% 45% / 46% 54% 46% 54%",
                filter: "blur(2px)",
                boxShadow: "0 0 15px rgba(14, 165, 233, 0.18), inset 0 0 15px rgba(14, 165, 233, 0.18)"
              }}
            />
          ))}

          {/* 4. Self-Drawing Winding Gold Silk Filigree Paths (金碧飞丝) */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" viewBox="0 0 1000 1000" preserveAspectRatio="none">
            <defs>
              <linearGradient id="goldSilkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity="0" />
                <stop offset="25%" stopColor="#0ea5e9" stopOpacity="0.4" />
                <stop offset="75%" stopColor="#fbbf24" stopOpacity="0.85" />
                <stop offset="100%" stopColor="#d97706" stopOpacity="0" />
              </linearGradient>
            </defs>
            <motion.path
              d="M-50,350 C300,150 100,650 500,480 C900,310 700,850 1050,650"
              fill="none"
              stroke="url(#goldSilkGrad)"
              strokeWidth="2.5"
              strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: [0, 1, 1, 0] }}
              transition={{ duration: 1.8, ease: "easeInOut", times: [0, 0.2, 0.8, 1] }}
            />
            <motion.path
              d="M-20,380 C320,180 130,620 520,450 C920,280 730,820 1070,620"
              fill="none"
              stroke="url(#goldSilkGrad)"
              strokeWidth="1.2"
              strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: [0, 0.75, 0.75, 0] }}
              transition={{ duration: 2.0, delay: 0.12, ease: "easeInOut", times: [0, 0.2, 0.8, 1] }}
            />
          </svg>

          {/* 5. Gilded Mountain Slopes Silhouette Layer (金碧叠嶂) */}
          <div className="absolute inset-x-0 bottom-0 h-[50%] flex items-end justify-center pointer-events-none select-none z-20">
            <svg className="w-full h-full text-[#0d9488]" viewBox="0 0 1440 320" preserveAspectRatio="none">
              <defs>
                <linearGradient id="shanshuiGrad1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgba(11, 44, 73, 0.85)" />
                  <stop offset="100%" stopColor="rgba(4, 15, 28, 0.98)" />
                </linearGradient>
                <linearGradient id="shanshuiGrad2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgba(13, 148, 136, 0.65)" />
                  <stop offset="100%" stopColor="rgba(6, 24, 40, 0.98)" />
                </linearGradient>
                <linearGradient id="shanshuiGrad3" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgba(14, 116, 144, 0.82)" />
                  <stop offset="100%" stopColor="rgba(2, 12, 22, 1)" />
                </linearGradient>
              </defs>

              {/* Layer 1: Distant Misty Cyan Ridges */}
              <motion.path
                initial={{ opacity: 0, y: 120 }}
                animate={{ opacity: [0, 0.45, 0.45, 0], y: [110, 15, 15, -20] }}
                transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1], times: [0, 0.35, 0.82, 1] }}
                d="M0,280 L180,180 L350,240 L520,140 L700,210 L880,110 L1050,230 L1220,150 L1360,220 L1440,160 L1440,320 L0,320 Z"
                fill="url(#shanshuiGrad1)"
                stroke="rgba(14, 165, 233, 0.25)"
                strokeWidth="1"
              />

              {/* Layer 2: Mid-ground Mineral Jade Mountains */}
              <motion.path
                initial={{ opacity: 0, y: 130 }}
                animate={{ opacity: [0, 0.65, 0.65, 0], y: [120, 20, 20, -30] }}
                transition={{ duration: 1.7, delay: 0.08, ease: [0.16, 1, 0.3, 1], times: [0, 0.35, 0.82, 1] }}
                d="M0,320 L220,230 L410,170 L580,260 L740,160 L910,220 L1100,150 L1260,240 L1380,180 L1440,250 L1440,320 L0,320 Z"
                fill="url(#shanshuiGrad2)"
                stroke="rgba(45, 212, 191, 0.55)"
                strokeWidth="1.2"
              />

              {/* Layer 3: Foreground Celestial Slopes lined with gold contours */}
              <motion.path
                initial={{ opacity: 0, y: 140 }}
                animate={{ opacity: [0, 0.88, 0.88, 0], y: [130, 25, 25, -40] }}
                transition={{ duration: 1.6, delay: 0.15, ease: [0.16, 1, 0.3, 1], times: [0, 0.35, 0.82, 1] }}
                d="M0,320 L280,265 L480,225 L660,285 L840,215 L1020,255 L1240,195 L1440,275 L1440,320 L0,320 Z"
                fill="url(#shanshuiGrad3)"
                stroke="#fbbf24"
                strokeWidth="1.6"
                style={{ filter: "drop-shadow(0 0 10px rgba(251, 191, 36, 0.45))" }}
              />
            </svg>
          </div>

          {/* 6. Celestial Calligraphy Parchment Card (Appears gracefully in the center) */}
          <div className="absolute inset-0 flex items-center justify-center z-30 select-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.06, y: -20 }}
              transition={{ duration: 0.75, delay: 0.12, ease: [0.19, 1, 0.22, 1] }}
              className="relative flex flex-col items-center justify-center p-6 sm:p-8 bg-gradient-to-b from-[#09203f]/95 to-[#0b3c5d]/95 border border-sky-400/40 rounded-xl shadow-[0_25px_60px_-15px_rgba(2,12,22,0.85),_inset_0_0_20px_rgba(56,189,248,0.12)] max-w-[380px] text-center backdrop-blur-md"
            >
              {/* Elegant Gold Corner Brackets */}
              <div className="absolute top-2.5 left-2.5 w-4 h-4 border-t border-l border-amber-300/60" />
              <div className="absolute top-2.5 right-2.5 w-4 h-4 border-t border-r border-amber-300/60" />
              <div className="absolute bottom-2.5 left-2.5 w-4 h-4 border-b border-l border-amber-300/60" />
              <div className="absolute bottom-2.5 right-2.5 w-4 h-4 border-b border-r border-amber-300/60" />

              {/* Elegant Silk Red Imperial Seal (昆仑印玺) design */}
              <div className="flex items-center justify-center mb-3">
                <div 
                  className="w-10 h-10 border border-[#f43f5e]/50 flex items-center justify-center font-serif text-[12px] text-[#f43f5e] font-black tracking-tighter rounded"
                  style={{
                    backgroundColor: "rgba(244, 63, 94, 0.08)",
                    boxShadow: "inset 0 0 6px rgba(244, 63, 94, 0.25), 0 0 10px rgba(244, 63, 94, 0.15)",
                    fontFamily: '"STKaiti", "Kaiti SC", "Kaiti", serif',
                    textOrientation: "upright",
                    writingMode: "vertical-rl"
                  }}
                >
                  昆仑仙
                </div>
              </div>

              {/* Signature stamp label */}
              <div className="text-[10.5px] text-sky-300 font-sans font-bold tracking-[0.38em] uppercase mb-1 border-b border-sky-500/20 pb-1.5 w-full">
                K U N L U N  B A L L A D
              </div>

              {/* Main Calligraphy quote representing the stage change */}
              <div 
                className="font-serif font-semibold text-lg sm:text-xl text-yellow-100 tracking-[0.25em] mb-2 leading-relaxed"
                style={{
                  fontFamily: '"STXingkai", "Xingkai SC", "华文行楷", "STKaiti", "Kaiti SC", serif'
                }}
              >
                解茧凌苍穹 • 振羽立青峰
              </div>

              {/* Secondary poetry lines */}
              <div 
                className="font-serif text-[11px] sm:text-[11.5px] text-amber-200/85 tracking-[0.2em] leading-relaxed"
                style={{
                  fontFamily: '"STKaiti", "Kaiti SC", "Kaiti", serif'
                }}
              >
                踏雪高歌昆仑谣，一身傲骨自昭华。
              </div>

              <div className="w-10 h-[1px] bg-amber-400/30 mt-4" />
            </motion.div>
          </div>

          {/* 7. Swirling Gold leaf, Azurite petals and sparkling stardust floating across screen */}
          <div className="absolute inset-0 w-full h-full z-20">
            {particles.map((p) => (
              <motion.div
                key={p.id}
                initial={{
                  left: `${p.x}%`,
                  top: `${p.y}%`,
                  scale: 0,
                  rotate: p.rotateStart,
                  opacity: 0,
                }}
                animate={{
                  left: `${p.tx}%`,
                  top: `${p.ty}%`,
                  scale: p.scale,
                  rotate: p.rotateEnd,
                  opacity: [0, 0.95, 0.95, 0],
                }}
                transition={{
                  duration: p.duration,
                  delay: p.delay,
                  ease: "easeInOut",
                  times: [0, 0.16, 0.84, 1],
                }}
                className="absolute pointer-events-none"
              >
                {p.type === "azuritePetal" ? (
                  /* Elegant Handcrafted Mineral Blue Flower Petal */
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    className="drop-shadow-[0_2px_4px_rgba(14,165,233,0.35)]"
                    style={{ color: p.color }}
                  >
                    <path
                      d="M12 2C12 2 4 8 4 14C4 18.42 7.58 22 12 22C16.42 22 20 18.42 20 14C20 8 12 2 12 2Z"
                      fill="currentColor"
                      fillOpacity="0.88"
                    />
                    <path
                      d="M12 4C12 4 6 9.5 6 14"
                      stroke="#e0f2fe"
                      strokeWidth="1.2"
                      strokeLinecap="round"
                      strokeOpacity="0.75"
                    />
                  </svg>
                ) : p.type === "goldLeaf" ? (
                  /* Gilded gold foil piece (泥金) */
                  <div
                    className="w-3 h-2 rotate-45"
                    style={{
                      backgroundColor: p.color,
                      borderRadius: "1px",
                      boxShadow: "0 0 6px rgba(253, 224, 71, 0.75)",
                      transform: "skew(8deg, 8deg)"
                    }}
                  />
                ) : (
                  /* Golden dust glowing stardust */
                  <div
                    className="w-1.5 h-1.5 bg-gradient-to-r from-amber-200 to-yellow-300 rounded-full filter blur-[0.2px]"
                    style={{
                      boxShadow: "0 0 8px rgba(253, 224, 71, 0.9)",
                    }}
                  />
                )}
              </motion.div>
            ))}
          </div>

          {/* 8. Extra glowing sparks floating upwards */}
          {[...Array(12)].map((_, idx) => {
            const rx = Math.random() * 100;
            const ry = Math.random() * 100;
            return (
              <motion.div
                key={`sparkle-${idx}`}
                initial={{ left: `${rx}%`, top: `${ry}%`, scale: 0, opacity: 0 }}
                animate={{
                  scale: [0, 1.3, 1.3, 0],
                  opacity: [0, 0.85, 0.85, 0],
                  y: [0, -60 - Math.random() * 60]
                }}
                transition={{
                  duration: 1.5 + Math.random() * 0.8,
                  delay: Math.random() * 0.3,
                  ease: "easeOut",
                }}
                className="absolute w-1 h-1 bg-yellow-200 rounded-full filter blur-[0.3px] z-20"
                style={{
                  boxShadow: "0 0 8px rgba(253, 224, 71, 0.8)",
                }}
              />
            );
          })}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
