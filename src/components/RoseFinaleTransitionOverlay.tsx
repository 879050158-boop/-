import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";

interface RoseFinaleTransitionOverlayProps {
  isActive: boolean;
}

interface CustomParticle {
  id: number;
  type: "sakuraPetal" | "goldDust" | "crystalSpark" | "glowingHalos";
  x: number; // radius or start x
  y: number; // angle or start y
  size: number;
  color: string;
  delay: number;
  duration: number;
  angleSpeed: number;
  radialSpeed: number;
  spinSpeed: number;
  opacityMax: number;
}

interface WatercolorMist {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  delay: number;
  duration: number;
  scaleMax: number;
}

export default function RoseFinaleTransitionOverlay({ isActive }: RoseFinaleTransitionOverlayProps) {
  const [particles, setParticles] = useState<CustomParticle[]>([]);
  const [mists, setMists] = useState<WatercolorMist[]>([]);

  useEffect(() => {
    if (isActive) {
      // 1. Generate 85 luxurious swirling transition particles (Sakura petals, gold dust, glowing crystals)
      const generatedParticles: CustomParticle[] = Array.from({ length: 85 }).map((_, i) => {
        const rand = Math.random();
        let type: "sakuraPetal" | "goldDust" | "crystalSpark" | "glowingHalos" = "sakuraPetal";
        if (rand < 0.3) {
          type = "sakuraPetal";
        } else if (rand < 0.65) {
          type = "goldDust";
        } else if (rand < 0.88) {
          type = "crystalSpark";
        } else {
          type = "glowingHalos";
        }

        // Soft, gorgeous, non-dark pinks and radiant golds
        const pinkColors = [
          "#ffb7c5", // Sakura Pink
          "#fda4af", // Soft Rose
          "#fbcfe8", // Light Pink Orchid
          "#fecdd3", // Peach Blossom
          "#ffe4e6", // Pearl Pink
        ];
        const goldColors = [
          "#fef08a", // Soft Yellow Gold
          "#fde047", // Luminous Gold
          "#fed7aa", // Warm Apricot Gold
          "#ffffff", // Crystal White
        ];

        const isPink = Math.random() > 0.4;
        const color = isPink 
          ? pinkColors[Math.floor(Math.random() * pinkColors.length)]
          : goldColors[Math.floor(Math.random() * goldColors.length)];

        return {
          id: i,
          type,
          x: Math.random() * 100, // percentage x
          y: Math.random() * 100, // percentage y
          size: type === "sakuraPetal"
            ? 8 + Math.random() * 12
            : type === "glowingHalos"
              ? 14 + Math.random() * 18
              : 3 + Math.random() * 5,
          color,
          delay: Math.random() * 0.4,
          duration: 1.5 + Math.random() * 1.2,
          angleSpeed: (Math.random() > 0.5 ? 1 : -1) * (120 + Math.random() * 240), // spin in vortex
          radialSpeed: 40 + Math.random() * 80, // expand outward
          spinSpeed: Math.random() * 360,
          opacityMax: 0.75 + Math.random() * 0.25,
        };
      });
      setParticles(generatedParticles);

      // 2. Generate soft, ethereal blooming watercolor mists (Light peach-blossom pink and amber gold)
      const generatedMists: WatercolorMist[] = [
        // Central pure Sakura Bloom
        {
          id: 1,
          x: 50,
          y: 48,
          size: 750,
          color: "rgba(255, 183, 197, 0.55)", // Soft Sakura
          delay: 0,
          duration: 1.4,
          scaleMax: 3.2,
        },
        // Upper-right Peach Gold glow
        {
          id: 2,
          x: 65,
          y: 35,
          size: 600,
          color: "rgba(254, 215, 170, 0.45)", // Warm Apricot Gold
          delay: 0.1,
          duration: 1.5,
          scaleMax: 3.0,
        },
        // Left flank soft rose quartz
        {
          id: 3,
          x: 30,
          y: 55,
          size: 580,
          color: "rgba(253, 164, 175, 0.48)", // Soft Rose Quartz
          delay: 0.05,
          duration: 1.6,
          scaleMax: 2.8,
        },
        // Luminous Core pearl mist
        {
          id: 4,
          x: 50,
          y: 50,
          size: 450,
          color: "rgba(255, 255, 255, 0.85)", // Pearl core glow
          delay: 0.15,
          duration: 1.3,
          scaleMax: 3.5,
        },
        // Bottom grounding lavender pink mist for subtle depth
        {
          id: 5,
          x: 48,
          y: 68,
          size: 650,
          color: "rgba(244, 114, 182, 0.25)", // Subtle pink halo
          delay: 0.08,
          duration: 1.7,
          scaleMax: 2.7,
        }
      ];
      setMists(generatedMists);
    } else {
      setParticles([]);
      setMists([]);
    }
  }, [isActive]);

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-[99999] pointer-events-none overflow-hidden flex items-center justify-center bg-transparent"
        >
          {/* 1. Luminous Glassmorphic Frosted Backdrop with soft peach tint */}
          <motion.div
            initial={{ backdropFilter: "blur(0px)", opacity: 0 }}
            animate={{ backdropFilter: "blur(20px)", opacity: 1 }}
            exit={{ backdropFilter: "blur(0px)", opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className="absolute inset-0 bg-[#fffbfc]/60"
          />

          {/* 2. Ethereal Pearl Rose & Gold Fluid Satin Background */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.96 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0 bg-gradient-to-br from-[#fff6f7] via-[#ffe4eb] to-[#fffbf2]"
          />

          {/* 3. Smooth Watercolor Paint Mists Blooming Dynamically */}
          <div className="absolute inset-0 w-full h-full mix-blend-multiply">
            {mists.map((mist) => (
              <motion.div
                key={mist.id}
                initial={{
                  x: `${mist.x}vw`,
                  y: `${mist.y}vh`,
                  scale: 0.05,
                  opacity: 0,
                }}
                animate={{
                  scale: mist.scaleMax,
                  opacity: [0, 0.95, 0.95, 0],
                }}
                exit={{
                  opacity: 0,
                  scale: mist.scaleMax * 1.15,
                }}
                transition={{
                  duration: mist.duration,
                  delay: mist.delay,
                  ease: [0.1, 0.8, 0.2, 1.0], // fluid wash motion
                  times: [0, 0.3, 0.85, 1]
                }}
                className="absolute -translate-x-1/2 -translate-y-1/2 filter blur-[55px]"
                style={{
                  width: `${mist.size}px`,
                  height: `${mist.size}px`,
                  backgroundColor: mist.color,
                  borderRadius: "50%",
                }}
              />
            ))}
          </div>

          {/* 4. Elegant Water Ripple Circles expanding in soft gold and pink */}
          {[...Array(4)].map((_, idx) => (
            <motion.div
              key={`ripple-${idx}`}
              initial={{ scale: 0.1, opacity: 0 }}
              animate={{ scale: 3.6, opacity: [0, 0.55, 0.55, 0] }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 2.0,
                delay: idx * 0.2,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="absolute w-[280px] h-[280px] rounded-full border-[0.85px] border-dashed border-pink-300/40 mix-blend-overlay"
              style={{
                borderRadius: "50%",
                filter: "blur(1.5px)",
                boxShadow: "0 0 12px rgba(253,164,175,0.15), inset 0 0 12px rgba(253,164,175,0.15)"
              }}
            />
          ))}

          {/* 5. Classical Golden Mountain Contour Outlines for poetic depth */}
          <div className="absolute inset-x-0 bottom-0 h-[40%] flex items-end justify-center pointer-events-none select-none z-10">
            <svg className="w-full h-full text-pink-200/50" viewBox="0 0 1440 320" preserveAspectRatio="none">
              <defs>
                <linearGradient id="mistyShanshui" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgba(255, 214, 222, 0.7)" />
                  <stop offset="100%" stopColor="rgba(255, 245, 246, 0.95)" />
                </linearGradient>
              </defs>
              <motion.path
                initial={{ opacity: 0, y: 100 }}
                animate={{ opacity: [0, 0.8, 0.8, 0], y: [90, 10, 10, -20] }}
                transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
                d="M0,240 Q360,180 720,240 T1440,240 L1440,320 L0,320 Z"
                fill="url(#mistyShanshui)"
                stroke="rgba(251, 113, 133, 0.3)"
                strokeWidth="1.5"
              />
            </svg>
          </div>

          {/* 6. Dynamic Vortex/Swirling Particle Field (粒子转场核心特效) */}
          <div className="absolute inset-0 w-full h-full z-20">
            {particles.map((p) => {
              // Calculate beautiful spiraling vortex/sweep paths around center
              const angleRad = (p.spinSpeed + p.angleSpeed) * (Math.PI / 180);
              const dx = Math.cos(angleRad) * p.radialSpeed;
              const dy = Math.sin(angleRad) * p.radialSpeed;

              return (
                <motion.div
                  key={`p-${p.id}`}
                  initial={{
                    left: `${p.x}%`,
                    top: `${p.y}%`,
                    scale: 0,
                    opacity: 0,
                    rotate: p.spinSpeed,
                  }}
                  animate={{
                    left: [`${p.x}%`, `${p.x + dx / 6}%`, `${p.x + dx / 3}%`],
                    top: [`${p.y}%`, `${p.y + dy / 6}%`, `${p.y + dy / 3}%`],
                    scale: [0, 1.3, 1.3, 0],
                    opacity: [0, p.opacityMax, p.opacityMax, 0],
                    rotate: [p.spinSpeed, p.spinSpeed + p.angleSpeed / 1.5],
                  }}
                  transition={{
                    duration: p.duration,
                    delay: p.delay,
                    ease: "easeInOut",
                  }}
                  className="absolute pointer-events-none"
                >
                  {p.type === "sakuraPetal" ? (
                    /* Exquisite Soft Pink Sakura Blossom Petal */
                    <svg
                      width={p.size}
                      height={p.size}
                      viewBox="0 0 24 24"
                      fill="none"
                      className="drop-shadow-[0_1.5px_3px_rgba(251,113,133,0.25)]"
                      style={{ color: p.color }}
                    >
                      <path
                        d="M12 21C12 21 5 15 5 11C5 7.5 8.5 4.5 12 4.5C15.5 4.5 19 7.5 19 11C19 15 12 21 12 21Z"
                        fill="currentColor"
                        fillOpacity="0.85"
                      />
                      <path
                        d="M12 6.5C12 6.5 8 9.5 8 12"
                        stroke="#ffffff"
                        strokeWidth="1.0"
                        strokeLinecap="round"
                        strokeOpacity="0.65"
                      />
                    </svg>
                  ) : p.type === "goldDust" ? (
                    /* Sparkling Gold Stardust pieces */
                    <div
                      className="rotate-45 animate-pulse"
                      style={{
                        width: `${p.size}px`,
                        height: `${p.size}px`,
                        backgroundColor: p.color,
                        borderRadius: "1px",
                        boxShadow: `0 0 8px ${p.color}`,
                        transform: "skew(12deg, 12deg)",
                      }}
                    />
                  ) : p.type === "crystalSpark" ? (
                    /* Double star glow crystal */
                    <svg
                      width={p.size * 1.5}
                      height={p.size * 1.5}
                      viewBox="0 0 24 24"
                      fill="none"
                      style={{ color: p.color }}
                    >
                      <path
                        d="M12 2L14.8 9.2L22 12L14.8 14.8L12 22L9.2 14.8L2 12L9.2 9.2L12 2Z"
                        fill="currentColor"
                        className="drop-shadow-[0_0_6px_rgba(255,255,255,0.9)]"
                      />
                    </svg>
                  ) : (
                    /* Elegant Glowing Soft Pearlescent Ring */
                    <div
                      className="rounded-full border border-pink-200/50 flex items-center justify-center"
                      style={{
                        width: `${p.size}px`,
                        height: `${p.size}px`,
                        background: `radial-gradient(circle, ${p.color} 0%, rgba(255,255,255,0) 70%)`,
                        boxShadow: `0 0 10px ${p.color}`,
                      }}
                    />
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* 7. Divine Luminous Core Seal - "破茧成蝶" Circular Emblem in Pink/Gold */}
          <div className="absolute inset-0 flex items-center justify-center z-30 select-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: 25 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.08, y: -20 }}
              transition={{ duration: 0.85, delay: 0.15, ease: [0.19, 1, 0.22, 1] }}
              className="relative flex flex-col items-center justify-center w-[340px] h-[340px] rounded-full border border-pink-300/40 bg-white/70 shadow-[0_20px_45px_-10px_rgba(251,113,133,0.15),_inset_0_0_25px_rgba(255,255,255,0.9)] backdrop-blur-md"
            >
              {/* Spinning Ornate Concentric Rings */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                className="absolute inset-3 rounded-full border border-dashed border-pink-300/30"
              />
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
                className="absolute inset-5 rounded-full border-[0.75px] border-yellow-400/20"
              />

              {/* Chinese Cloud Frame Accent (云纹装饰) */}
              <div className="absolute top-5 flex space-x-2">
                <span className="text-[10px] text-pink-400/60 font-serif">✥</span>
                <span className="text-[10px] text-pink-400/60 font-serif">✥</span>
              </div>

              {/* Classical Royal Wax Seal Core */}
              <div className="flex items-center justify-center mb-3">
                <div 
                  className="w-12 h-12 border border-pink-300/85 flex items-center justify-center font-serif text-[14px] text-pink-600 font-bold tracking-tighter rounded-full"
                  style={{
                    backgroundColor: "rgba(253, 242, 248, 0.9)",
                    boxShadow: "inset 0 0 12px rgba(244, 114, 182, 0.35), 0 0 20px rgba(244, 114, 182, 0.15)",
                    fontFamily: '"STKaiti", "Kaiti SC", "Kaiti", serif',
                    textOrientation: "upright",
                    writingMode: "vertical-rl"
                  }}
                >
                  生生风骨
                </div>
              </div>

              {/* Elegant Subtitle */}
              <div className="text-[10.5px] text-pink-400 font-sans font-extrabold tracking-[0.45em] uppercase mb-1 border-b border-pink-300/20 pb-1 w-[75%] text-center">
                P E A C H  B L O S S O M
              </div>

              {/* Main Script text */}
              <div 
                className="font-serif font-black text-2xl text-[#c026d3] tracking-[0.3em] mb-2 leading-relaxed"
                style={{
                  fontFamily: '"STXingkai", "Xingkai SC", "华文行楷", "STKaiti", "Kaiti SC", serif',
                  textShadow: "0 0 8px rgba(244, 114, 182, 0.25)"
                }}
              >
                解茧华章
              </div>

              {/* Classical poetry lines */}
              <div 
                className="font-serif text-[12px] text-gray-600/90 tracking-[0.2em] max-w-[210px] leading-relaxed text-center"
                style={{
                  fontFamily: '"STKaiti", "Kaiti SC", "Kaiti", serif'
                }}
              >
                一曲昆仑谣，尽叙人间女子生生风骨。
              </div>

              <div className="w-8 h-[1px] bg-pink-300/40 mt-3" />
            </motion.div>
          </div>

          {/* 8. Additional Elegant Petals falling gently down */}
          {[...Array(15)].map((_, idx) => {
            const rx = Math.random() * 100;
            return (
              <motion.div
                key={`falling-sakura-${idx}`}
                initial={{ left: `${rx}%`, top: `-5%`, scale: 0, opacity: 0, rotate: 0 }}
                animate={{
                  scale: [0, 1.2, 1.2, 0],
                  opacity: [0, 0.9, 0.9, 0],
                  y: [0, window.innerHeight * 1.05],
                  x: [0, (Math.random() > 0.5 ? 40 : -40) * (idx % 3 + 1)],
                  rotate: [0, 360 + Math.random() * 360]
                }}
                transition={{
                  duration: 2.2 + Math.random() * 1.0,
                  delay: Math.random() * 0.4,
                  ease: "easeOut",
                }}
                className="absolute pointer-events-none"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="drop-shadow-[0_1px_3px_rgba(244,114,182,0.2)]"
                  style={{ color: "#ffb7c5" }}
                >
                  <path
                    d="M12 21C12 21 6 15 6 11C6 7.5 9.5 4.5 12 4.5C14.5 4.5 18 7.5 18 11C18 15 12 21 12 21Z"
                    fill="currentColor"
                    fillOpacity="0.8"
                  />
                </svg>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
