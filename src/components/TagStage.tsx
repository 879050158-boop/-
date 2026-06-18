import React, { useState, useEffect, useRef } from "react";
import { TagItem } from "../types";
import { 
  playWindChime, 
  playPaperRustle, 
  playBreeze, 
  playTearOrShatter,
  playFlowerBloom,
  playTagsCascade,
  playWindScatter,
  playButtonClick,
  playThreadTighten,
  ensureAudioStarted,
  setAmbienceIntensity
} from "../utils";
import { Wind, RotateCcw, Volume2, Sparkles, HelpCircle } from "lucide-react";

interface TagStageProps {
  tags: TagItem[];
  onToggleTag: (id: string) => void;
  onBulkSelect: (ids: string[]) => void;
  onClearSelection: () => void;
  onTransformTags?: () => void;
  onResetTags?: () => void;
  onSweepTag?: (id: string) => void;
}

const LOCAL_TAG_MAPPING: Record<string, string> = {
  "柔弱": "坚韧峙岳",
  "优柔寡断": "果决自持",
  "胆小": "勇赴云巅",
  "大龄剩女": "自拥韶华",
  "剩女": "独身风华",
  "悍妇": "刚柔有度",
  "刻薄": "宽怀载川",
  "颜值工具": "风骨自华",
  "生育工具": "自我主宰",
  "全职主妇无用论": "持家亦怀丘壑",
  "目光短浅": "心揽星河",
  "心机重": "坦荡澄澈",
  "头发长见识短": "寸心藏万卷",
  "情绪化": "静澜藏智",
  "花瓶": "内蕴千峰",
  "附属品": "自成山岳",
  "嫁不出去": "静待同频",
  "贪慕虚荣": "清心守骨",
  "玻璃心": "雪骨凌风",
  "不够理性": "思虑周全",
  "顾家狂": "兼顾山河",
  "玩物": "掌握人生",
  "敏感多疑": "通透从容",
  "能力差": "巾帼凌云",
  "母老虎": "威而温良",
  "摆设": "顶立一方",
  "摆设品": "自成画卷",
  "做作": "本真自在"
};

export default function TagStage({
  tags,
  onToggleTag,
  onBulkSelect,
  onClearSelection,
  onTransformTags,
  onResetTags,
  onSweepTag,
}: TagStageProps) {
  // Motion states: 'idle' (hanging vertically under the flower), 'scattered' (dispersed naturally)
  const [layoutState, setLayoutState] = useState<"idle" | "scattered">("idle");
  const [isMuted, setIsMuted] = useState(false);
  const [hoveredTag, setHoveredTag] = useState<string | null>(null);
  const [shatteringIds, setShatteringIds] = useState<string[]>([]);
  const stageRef = useRef<HTMLDivElement>(null);

  // High-fidelity intro stages matching the video
  // "dormant" -> "landing" (flower drops) -> "blooming" (flower opens) -> "cascading" (tags fall down) -> "ready" (interactive)
  const [introStage, setIntroStage] = useState<"dormant" | "landing" | "blooming" | "cascading" | "ready">("dormant");
  const [resetKey, setResetKey] = useState(0);

  // Dynamic wind-gale simulation states
  const [gustActive, setGustActive] = useState(false);
  const [gustIntensity, setGustIntensity] = useState(0);

  interface HoverParticle {
    id: string;
    tagId: string;
    x: number;
    y: number;
    tx: string;
    ty: string;
    rot: string;
    dur: string;
    delay: string;
    color: string;
    size: number;
  }
  const [hoverParticles, setHoverParticles] = useState<HoverParticle[]>([]);

  const addParticles = (startX: number, startY: number, tagId: string, isTransformed: boolean, isSwept: boolean, count: number) => {
    const newParticles: HoverParticle[] = [];
    
    let colors = ["#ffd700", "#ffea00", "#fffbeb", "#f5d76e"]; // Gold/yellow stars
    if (!isTransformed) {
      colors = ["#ffd755", "#ffe082", "#fffdd0", "#e57373", "#d4af37"]; // Gold & vermillion blush
    } else if (!isSwept) {
      colors = ["#ff5252", "#ffd740", "#ffeb3b", "#ffffff", "#ff8f00"]; // Cinnabar & gold firefly sparks
    } else {
      colors = ["#ffd700", "#ffe082", "#ffffff", "#ffb300", "#fff9c4"]; // Radiant stars
    }

    for (let i = 0; i < count; i++) {
      const id = `${Date.now()}-${Math.random()}`;
      const distanceX = (Math.random() * 60 + 15) * (Math.random() > 0.5 ? 1 : -1);
      const distanceY = - (Math.random() * 60 + 15); // float upwards mostly
      
      const size = Math.random() * 3.5 + 2.0; 
      const color = colors[Math.floor(Math.random() * colors.length)];
      const dur = `${0.65 + Math.random() * 0.7}s`;
      const delay = `${Math.random() * 0.08}s`;
      const rot = `${Math.random() * 360 - 180}deg`;

      newParticles.push({
        id,
        tagId,
        x: startX,
        y: startY,
        tx: `${distanceX}px`,
        ty: `${distanceY}px`,
        rot,
        dur,
        delay,
        color,
        size,
      });
    }

    setHoverParticles((prev) => {
      const merged = [...prev, ...newParticles];
      if (merged.length > 200) {
        return merged.slice(merged.length - 200);
      }
      return merged;
    });

    setTimeout(() => {
      setHoverParticles((prev) => prev.filter((p) => !newParticles.find((np) => np.id === p.id)));
    }, 1500);
  };

  const handleTagMouseMove = (e: React.MouseEvent<HTMLDivElement>, tagId: string, isTransformed: boolean, isSwept: boolean) => {
    // Only spawn occasional particles on mouse move to keep it super lightweight but beautiful
    if (Math.random() > 0.5) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      addParticles(x, y, tagId, isTransformed, isSwept, 1);
    }
  };

  const handleTagMouseEnter = (tagId: string, isTransformed: boolean, isSwept: boolean) => {
    setHoveredTag(tagId);
    if (isTransformed) {
      if (!isSwept) {
        onSweepTag?.(tagId);
      }
      triggerSound("chime");
    } else {
      triggerSound("rustle");
    }
    // Spawn a burst of 12 particles upon mouse touch!
    addParticles(80, 25, tagId, isTransformed, isSwept, 12);
  };
  
  // Audio trigger helper supporting high-fidelity procedural synthesis states
  const triggerSound = (
    type: "chime" | "rustle" | "breeze" | "tear" | "bloom" | "cascade" | "scatter" | "click" | "thread"
  ) => {
    if (isMuted) return;
    if (type === "chime") playWindChime(Math.random() - 0.5);
    if (type === "rustle") playPaperRustle();
    if (type === "breeze") playBreeze();
    if (type === "tear") playTearOrShatter();
    if (type === "bloom") playFlowerBloom();
    if (type === "cascade") playTagsCascade(28);
    if (type === "scatter") playWindScatter();
    if (type === "click") playButtonClick();
    if (type === "thread") playThreadTighten();
  };

  // Beautiful intro sequence matching the video: closed bud landing down -> blooming open -> tags cascading down
  const triggerIntro = () => {
    setIntroStage("dormant");
    
    // Phase 1: Slide down from the sky as a closed bud
    const timerLanding = setTimeout(() => {
      setIntroStage("landing");
    }, 100);

    // Phase 2: Bloom open petals (State 1: Flower Blooming deep sub-bass and heavy silk rustling shimmer)
    const timerBloom = setTimeout(() => {
      setIntroStage("blooming");
      triggerSound("bloom");
    }, 1200);

    // Phase 3: Cascade tags down (State 2: Tags Dropping crisp wooden clack and high-speed stacked paper cards card-shuffle)
    const timerCascade = setTimeout(() => {
      setIntroStage("cascading");
      triggerSound("cascade");
    }, 2400);

    // Phase 4: Stable interactive state
    const timerReady = setTimeout(() => {
      setIntroStage("ready");
    }, 4200);

    return () => {
      clearTimeout(timerLanding);
      clearTimeout(timerBloom);
      clearTimeout(timerCascade);
      clearTimeout(timerReady);
    };
  };

  // Trigger intro on mount
  useEffect(() => {
    const cleanup = triggerIntro();
    return () => cleanup && cleanup();
  }, []);

  // 1:1 Video-accurate physical Wind Storm Gust implementation
  const handleWindGust = () => {
    if (gustActive) return; // Prevent double trigger
    setGustActive(true);

    let elapsed = 0;
    const duration = 7500; // 7.5 seconds complete wind loop
    const interval = setInterval(() => {
      elapsed += 50;
      if (elapsed >= duration) {
        clearInterval(interval);
        setGustActive(false);
        setGustIntensity(0);
        setAmbienceIntensity(0); // reset ambient music sway
      } else {
        // Curve profile: sharp linear/exponential build-up, lingering flutter, smooth gravity recovery
        let intensity = 0;
        if (elapsed < 1600) {
          // Sharp wind rising: 0 to 1.0
          intensity = elapsed / 1600;
        } else if (elapsed < 4200) {
          // Lingering storm with peak waves of flutter
          intensity = 0.88 + Math.sin(elapsed / 160) * 0.12;
        } else {
          // Smooth decay as strings settle back to their center hang points
          intensity = 1.0 - (elapsed - 4200) / 3300;
          if (intensity < 0) intensity = 0;
        }
        setGustIntensity(intensity);
        setAmbienceIntensity(intensity); // Real-time auditory sway matching tag physics!
      }
    }, 50);
  };

  // Trigger scatter fallback (still mapped to main buttons but utilizes the gust storm)
  const handleScatter = () => {
    triggerSound("scatter"); // State 3 Wind Valley whoosh and rhythmic flutters
    setLayoutState("scattered");
    handleWindGust();
  };

  const handleGather = () => {
    triggerSound("thread"); // State 4 Puppet Thread Snapping and tightening sfx
    setGustActive(false);
    setGustIntensity(0);
    setAmbienceIntensity(0); // reset ambient music sway
    setLayoutState("idle");
  };

  // Automated gentle swaying in idle state (mimics micro breeze)
  const [swayTime, setSwayTime] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setSwayTime((prev) => prev + 0.015);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const handleTearAway = () => {
    // 1. Play dramatic paper-tearing and glass-cracking sound
    triggerSound("tear");

    // 2. Determine all non-transformed negative tags to run the shatter animation
    const negativeTags = tags.filter((t) => !t.isTransformed);
    const negativeIds = negativeTags.map((t) => t.id);

    setShatteringIds(negativeIds);

    // 3. Stagger the real text transformation inside parent state to synchronize with peak tear
    setTimeout(() => {
      if (onTransformTags) {
        onTransformTags();
      }
    }, 620);

    // 4. Remove tags from shattering state after 2.3s
    setTimeout(() => {
      setShatteringIds([]);
    }, 2300);
  };

  const handleReset = () => {
    triggerSound("rustle");
    if (onResetTags) {
      onResetTags();
    }
    setLayoutState("idle");
    setResetKey((prev) => prev + 1);
    // Also trigger the beautiful bud dropping and blooming cascade intro on reset!
    triggerIntro();
  };

  return (
    <div 
      id="tag-stage"
      className="relative flex flex-col h-full overflow-hidden select-none border border-[#d4af37]/20 rounded-2xl bg-[#142121] shadow-2xl"
      style={{
        backgroundImage: "radial-gradient(circle at 50% 50%, #1f3a3a 0%, #142121 100%)",
      }}
      ref={stageRef}
      onPointerDown={() => ensureAudioStarted()}
      onTouchStart={() => ensureAudioStarted()}
    >
      <style>{`
        @keyframes clipTearLeft {
          0% { transform: translate(0, 0) rotate(0deg) scale(1); opacity: 1; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.3)); }
          3% { transform: translate(-1.5px, 0.5px) rotate(0.8deg); }
          6% { transform: translate(1.5px, -1px) rotate(-0.8deg); }
          9% { transform: translate(-2px, -0.5px) rotate(1.2deg); }
          12% { transform: translate(1.5px, 1px) rotate(-1.2deg); }
          15% { transform: translate(0, 0) rotate(0deg); opacity: 1; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.4)); }
          35% { transform: translate(-30px, -4px) rotate(-12deg) scale(0.98); opacity: 0.98; }
          60% { transform: translate(-95px, 85px) rotate(-38deg) scale(0.85) skewY(-8deg); opacity: 0.85; filter: drop-shadow(0 12px 24px rgba(0,0,0,0.5)); }
          100% { transform: translate(-220px, 320px) rotate(-95deg) scale(0.4) skewY(-18deg); opacity: 0; filter: drop-shadow(0 25px 45px rgba(0,0,0,0.6)); }
        }
        .animate-clip-left {
          animation: clipTearLeft 1.5s cubic-bezier(0.15, 0.85, 0.35, 1) both;
        }

        @keyframes clipTearRight {
          0% { transform: translate(0, 0) rotate(0deg) scale(1); opacity: 1; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.3)); }
          3% { transform: translate(1.5px, -0.5px) rotate(-0.8deg); }
          6% { transform: translate(-1.5px, 1px) rotate(0.8deg); }
          9% { transform: translate(2px, 0.5px) rotate(-1.2deg); }
          12% { transform: translate(-1.5px, -1px) rotate(1.2deg); }
          15% { transform: translate(0, 0) rotate(0deg); opacity: 1; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.4)); }
          35% { transform: translate(30px, -4px) rotate(12deg) scale(0.98); opacity: 0.98; }
          60% { transform: translate(95px, 85px) rotate(38deg) scale(0.85) skewY(8deg); opacity: 0.85; filter: drop-shadow(0 12px 24px rgba(0,0,0,0.5)); }
          100% { transform: translate(220px, 320px) rotate(95deg) scale(0.4) skewY(18deg); opacity: 0; filter: drop-shadow(0 25px 45px rgba(0,0,0,0.6)); }
        }
        .animate-clip-right {
          animation: clipTearRight 1.5s cubic-bezier(0.15, 0.85, 0.35, 1) both;
        }

        @keyframes newTagPop {
          0% { opacity: 0; transform: scale(0.68) rotate(4deg); filter: brightness(1.6) blur(2px); }
          32% { opacity: 0; }
          40% { opacity: 0.2; }
          100% { opacity: 1; transform: scale(1.08) rotate(0deg); filter: none; }
        }
        .animate-new-tag-pop {
          animation: newTagPop 0.85s cubic-bezier(0.175, 0.885, 0.32, 1.275) both;
        }

        @keyframes rustleShred1 {
          0% { transform: translate(0, 0) scale(1) rotate(0deg); opacity: 0; }
          14% { opacity: 0; }
          15% { transform: translate(0, 0) scale(1.2) rotate(0deg); opacity: 1; }
          100% { transform: translate(-110px, -120px) scale(0.1) rotate(-420deg); opacity: 0; }
        }
        .animate-rustle-shred-1 {
          animation: rustleShred1 1.6s cubic-bezier(0.1, 0.8, 0.2, 1) both;
        }

        @keyframes rustleShred2 {
          0% { transform: translate(0, 0) scale(1) rotate(0deg); opacity: 0; }
          14% { opacity: 0; }
          15% { transform: translate(0, 0) scale(1.2) rotate(0deg); opacity: 1; }
          100% { transform: translate(120px, -110px) scale(0.1) rotate(420deg); opacity: 0; }
        }
        .animate-rustle-shred-2 {
          animation: rustleShred2 1.6s cubic-bezier(0.1, 0.8, 0.2, 1) both;
        }

        @keyframes rustleShred3 {
          0% { transform: translate(0, 0) scale(1); opacity: 0; }
          14% { opacity: 0; }
          15% { transform: scale(1.4); opacity: 1; }
          100% { transform: translate(var(--tx, 15px), var(--ty, 75px)) scale(0.1); opacity: 0; }
        }
        .animate-rustle-shred-3 {
          animation: rustleShred3 1.3s cubic-bezier(0.1, 0.8, 0.2, 1) both;
        }

        @keyframes tearGlow {
          0% { opacity: 0; transform: scaleY(0.1); }
          12% { opacity: 0; transform: scaleY(0.1); }
          15% { opacity: 1; transform: scaleY(1.15); filter: drop-shadow(0 0 10px #d4af37); }
          22% { opacity: 1; transform: scaleY(1); }
          45% { opacity: 0; transform: scaleY(0.4); }
          100% { opacity: 0; }
        }
        .animate-tear-glow {
          animation: tearGlow 1.5s cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        @keyframes goldGlow {
          0%, 100% { box-shadow: 0 0 6px rgba(212, 175, 55, 0.25), inset 0 0 3px rgba(212, 175, 55, 0.1); border-color: rgba(212, 175, 55, 0.5); }
          50% { box-shadow: 0 0 16px rgba(212, 175, 55, 0.5), inset 0 0 8px rgba(212, 175, 55, 0.25); border-color: rgba(212, 175, 55, 1); }
        }
        .animate-gold-glow {
          animation: goldGlow 3s ease-in-out infinite;
        }

        @keyframes pollenSparkle {
          0% {
            transform: translate(0, 0) scale(0.15) rotate(0deg);
            opacity: 0;
          }
          15% {
            opacity: 0.95;
          }
          65% {
            opacity: 0.85;
          }
          100% {
            transform: translate(var(--tx), var(--ty)) scale(1.05) rotate(var(--rot));
            opacity: 0;
          }
        }
        .animate-pollen {
          animation: pollenSparkle var(--dur) cubic-bezier(0.1, 0.8, 0.25, 1) var(--delay) forwards;
        }

        @keyframes cascadeCard {
          0% {
            opacity: 0;
            transform: translate(-50%, -10%) translateY(-185px) scale(0.12) rotate(12deg);
          }
          15% {
            opacity: 0.2;
          }
          100% {
            opacity: 1;
            transform: translate(-50%, -10%) translateY(0) scale(1) rotate(0deg);
          }
        }
        .cascade-animate-card {
          animation: cascadeCard 1.5s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
      `}</style>

      {/* 1. Chinese Ancient Xuan Paper & Calligraphy Wallpaper Overlay from Artistic Flair */}
      <div 
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `url('data:image/svg+xml,%3Csvg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"%3E%3Cfilter id="noiseFilter"%3E%3CfeTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch"/%3E%3C/filter%3E%3Crect width="100%25" height="100%25" filter="url(%23noiseFilter)"/%3E%3C/svg%3E')`,
        }}
      />
      
      {/* Background ink washes and ancient calligraphy script floating around */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-around overflow-hidden">
        {/* Soft atmospheric radial glows */}
        <div className="absolute w-[450px] h-[450px] -top-20 bg-[#660000]/10 blur-[120px] rounded-full" />
        <div className="absolute w-96 h-96 bottom-10 right-10 bg-[#d4af37]/8 blur-[100px] rounded-full" />

        {/* Traditional Calligraphy Characters Floating (Faded ink / gold calligraphy look) */}
        <div className="absolute top-[15%] left-[8%] text-8xl font-serif text-[#d4af37] opacity-[0.06] transform -rotate-12 line-clamp-1 select-none whitespace-pre leading-loose">
          自尊自爱
        </div>
        <div className="absolute top-[28%] right-[8%] text-8xl font-serif text-[#d4af37] opacity-[0.05] transform rotate-12 line-clamp-1 select-none whitespace-pre leading-loose">
          独立精神
        </div>
        <div className="absolute bottom-[10%] left-[12%] text-7xl font-serif text-[#d4af37] opacity-[0.06] transform -rotate-6 line-clamp-1 select-none whitespace-pre leading-loose">
          巾帼不让须眉 · 内蕴千峰
        </div>
      </div>

      {/* 2. Top Banner Header with Controls in Artistic Flair Gilded style */}
      <div className="relative z-10 flex flex-wrap items-center justify-between px-6 py-4 bg-[#0f1b1b]/90 backdrop-blur-md border-b border-[#d4af37]/15 font-sans">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-[#8b0000] animate-pulse" />
          <div>
            <h3 className="text-sm font-semibold text-[#d4af37] tracking-widest uppercase">
              束缚之茧 (The Cocoon of Stereotypes)
            </h3>
            <p className="text-[11px] text-stone-400 mt-0.5">
              点击标签落入逆向池 · 激活微风拉伸傀儡物理线
            </p>
          </div>
        </div>

        {/* Floating Action Button Bar */}
        <div className="flex items-center gap-2 mt-2 sm:mt-0 text-xs text-[#e0d8cc]">
          <button
            onClick={() => {
              const nextMuted = !isMuted;
              setIsMuted(nextMuted);
              if (nextMuted === false) {
                // If unmuting, instantly play a delightful click to confirm sound is active!
                setTimeout(() => playButtonClick(), 40);
              } else {
                triggerSound("click");
              }
            }}
            className={`p-2 rounded-lg border transition-all duration-300 flex items-center gap-1.5 cursor-pointer ${
              isMuted 
                ? 'border-[#8b0000]/30 bg-[#8b0000]/20 text-[#be123c] hover:bg-[#8b0000]/30' 
                : 'border-stone-700 bg-stone-800/40 text-stone-300 hover:bg-stone-700/40'
            }`}
            title={isMuted ? "解禁音效" : "静音模拟器"}
          >
            <Volume2 className="h-3.5 w-3.5" />
            <span className="hidden md:inline">{isMuted ? "静音" : "有声"}</span>
          </button>

          <button
            onClick={() => {
              triggerSound("click");
              if (layoutState === "idle") {
                handleScatter();
              } else {
                handleGather();
              }
            }}
            className={`px-3 py-2 rounded-lg transition-all duration-300 border font-medium flex items-center gap-1.5 shadow-lg cursor-pointer ${
              layoutState === "scattered"
                ? "bg-[#8b0000] text-[#f5f2ed] border-[#8b0000]/60 hover:bg-[#6c0000]"
                : "bg-[#1f3a3a] text-[#d4af37] border-[#d4af37]/40 hover:bg-[#1a2b2b] hover:text-[#f5f2ed]"
            }`}
          >
            <Wind className={`h-3.5 w-3.5 ${gustActive ? "animate-spin-fast" : "animate-spin-slow"}`} />
            <span>{layoutState === "idle" ? "阵风散落 (Scatter)" : "回归原位 (Gather)"}</span>
          </button>

          <div className="h-6 w-px bg-stone-800 mx-1" />

          {/* Prompt quick action selectors */}
          <button
            onClick={() => {
              triggerSound("click");
              onBulkSelect(tags.map(t => t.id));
              triggerSound("chime");
            }}
            className="px-3 py-1.5 rounded-lg bg-stone-850 hover:bg-stone-750 text-[#d4af37] border border-[#d4af37]/35 font-medium whitespace-nowrap cursor-pointer transition-all hover:scale-[1.03] active:scale-[0.98]"
          >
            拿起标签
          </button>
          
          <button
            onClick={() => {
              triggerSound("click");
              handleTearAway();
            }}
            className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-[#8b0000] to-[#5a0000] hover:from-[#9c0000] hover:to-[#6c0000] text-[#f5f2ed] border border-[#8b0000]/60 font-semibold tracking-wide whitespace-nowrap cursor-pointer shadow-md shadow-[#8b0000]/25 transition-all hover:brightness-110 hover:scale-[1.03] active:scale-[0.98]"
            title="撕掉落后偏见标签，重塑自我主宰的定义"
          >
            撕掉标签定义
          </button>

          {tags.some(t => t.isTransformed) && (
            <button
              onClick={() => {
                triggerSound("click");
                handleReset();
              }}
              className="px-2.5 py-1.5 rounded-lg bg-stone-900/80 hover:bg-stone-850 text-stone-400 hover:text-stone-200 border border-stone-800 font-medium whitespace-nowrap cursor-pointer transition-all flex items-center gap-1 hover:scale-[1.03]"
              title="重造宣纸，重新体验破茧"
            >
              <RotateCcw className="h-3 w-3" />
              <span>复原一新</span>
            </button>
          )}
        </div>
      </div>

      {/* 3. Main Stage Context */}
      <div className={`relative flex-1 w-full transition-all duration-500 ${
        layoutState === "scattered" ? "min-h-[825px]" : "min-h-[580px] sm:min-h-[640px]"
      }`}>
        
        {/* Giant deep red hanging Amaryllis/Lotus SVG flower top center using CSS gradients matching Artistic Flair */}
        <div 
          className="absolute left-1/2 z-20 pointer-events-none flex flex-col items-center select-none"
          style={{
            top: "-64px",
            transform: `translateX(-50%) translateY(${introStage === "dormant" ? -280 : 0}px) scale(${introStage === "dormant" ? 0.45 : introStage === "landing" ? 0.95 : 1.08})`,
            opacity: introStage === "dormant" ? 0 : 1,
            transition: "transform 1.6s cubic-bezier(0.19, 1, 0.22, 1), opacity 1.2s ease-out",
          }}
        >
          <svg 
            width="390" 
            height="300" 
            viewBox="0 0 390 300" 
            className="filter drop-shadow-[0_20px_45px_rgba(139,0,0,0.65)] animate-pulse-slow"
          >
            <defs>
              <linearGradient id="velvetCrimson" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#e11d48" />
                <stop offset="40%" stopColor="#9f1239" />
                <stop offset="85%" stopColor="#4c0519" />
                <stop offset="100%" stopColor="#1e020a" />
              </linearGradient>
              <linearGradient id="velvetGoldOutline" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ffe082" />
                <stop offset="50%" stopColor="#d4af37" />
                <stop offset="100%" stopColor="#aa7c11" />
              </linearGradient>
              <radialGradient id="sacredGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#fffae6" />
                <stop offset="40%" stopColor="#ffd866" />
                <stop offset="80%" stopColor="#d4af37" stopOpacity="0.85" />
                <stop offset="100%" stopColor="#d4af37" stopOpacity="0" />
              </radialGradient>
              <linearGradient id="leafGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#1e3a24" />
                <stop offset="100%" stopColor="#08140c" />
              </linearGradient>
            </defs>

            {/* Elegant hanging vine stem */}
            <path 
              d="M195,-20 Q200,35 195,100" 
              stroke="#0b1313" 
              strokeWidth="6" 
              strokeLinecap="round" 
              fill="none" 
            />

            {/* Exquisite flanking leaves */}
            <path d="M195,15 C160,5 145,28 165,45 C175,32 188,22 195,15 Z" fill="url(#leafGrad)" stroke="#d4af37" strokeWidth="0.8" opacity="0.6" />
            <path d="M195,28 C230,18 245,40 225,58 C215,45 202,35 195,28 Z" fill="url(#leafGrad)" stroke="#d4af37" strokeWidth="0.8" opacity="0.6" />

            {/* Inverted Hanging Flower Bud & Outer Petals with gentle breathing sway */}
            <g style={{ transformOrigin: '195px 100px', animation: "sway 7s ease-in-out infinite" }}>
              {/* Outer Deep Red Petals (Hanging downwards) - blooming rotation pivots - stretched down by 25px */}
              <path 
                d="M140,100 C100,155 65,220 150,250 C178,180 168,135 140,100 Z" 
                fill="url(#velvetCrimson)" 
                opacity="0.8" 
                style={{
                  transformOrigin: "195px 100px",
                  transform: `rotate(${(introStage === "dormant" || introStage === "landing") ? "14deg" : "0deg"})`,
                  transition: "transform 1.6s cubic-bezier(0.19, 1, 0.22, 1)"
                }}
              />
              <path 
                d="M250,100 C290,155 325,220 240,250 C212,180 222,135 250,100 Z" 
                fill="url(#velvetCrimson)" 
                opacity="0.8" 
                style={{
                  transformOrigin: "195px 100px",
                  transform: `rotate(${(introStage === "dormant" || introStage === "landing") ? "-14deg" : "0deg"})`,
                  transition: "transform 1.6s cubic-bezier(0.19, 1, 0.22, 1)"
                }}
              />
              
              {/* Back dark accent layers - stretched down by 25px */}
              <path 
                d="M100,100 C75,150 45,210 120,230 C145,175 140,130 100,100 Z" 
                fill="#310008" 
                style={{
                  transformOrigin: "195px 100px",
                  transform: `rotate(${(introStage === "dormant" || introStage === "landing") ? "18deg" : "0deg"})`,
                  transition: "transform 1.6s cubic-bezier(0.19, 1, 0.22, 1)"
                }}
              />
              <path 
                d="M290,100 C315,150 345,210 270,230 C245,175 250,130 290,100 Z" 
                fill="#310008" 
                style={{
                  transformOrigin: "195px 100px",
                  transform: `rotate(${(introStage === "dormant" || introStage === "landing") ? "-18deg" : "0deg"})`,
                  transition: "transform 1.6s cubic-bezier(0.19, 1, 0.22, 1)"
                }}
              />

              {/* Crimson center petals with gold leaf highlights - stretched down by 25px */}
              <path 
                d="M160,100 C135,160 120,245 195,260 C205,200 180,135 160,100 Z" 
                fill="url(#velvetCrimson)" 
                stroke="url(#velvetGoldOutline)" 
                strokeWidth="0.9" 
                strokeOpacity="0.5" 
                style={{
                  transformOrigin: "195px 100px",
                  transform: `rotate(${(introStage === "dormant" || introStage === "landing") ? "8deg" : "0deg"})`,
                  transition: "transform 1.6s cubic-bezier(0.19, 1, 0.22, 1)"
                }}
              />
              <path 
                d="M230,100 C255,160 270,245 195,260 C185,200 210,135 230,100 Z" 
                fill="url(#velvetCrimson)" 
                stroke="url(#velvetGoldOutline)" 
                strokeWidth="0.9" 
                strokeOpacity="0.5" 
                style={{
                  transformOrigin: "195px 100px",
                  transform: `rotate(${(introStage === "dormant" || introStage === "landing") ? "-8deg" : "0deg"})`,
                  transition: "transform 1.6s cubic-bezier(0.19, 1, 0.22, 1)"
                }}
              />

              {/* Seeds, core, stamens which scale outwards as it blooms */}
              <g 
                style={{
                  transformOrigin: "195px 155px",
                  transform: `scale(${(introStage === "dormant" || introStage === "landing") ? 0.35 : 1.0})`,
                  opacity: (introStage === "dormant" || introStage === "landing") ? 0.1 : 1.0,
                  transition: "transform 1.8s cubic-bezier(0.19, 1, 0.22, 1), opacity 1.5s ease-out"
                }}
              >
                {/* Beautiful bright core bulb with glowing gold node - stretched down by 25px */}
                <path d="M175,100 C160,155 165,250 195,255 C225,250 230,155 215,100 Z" fill="#9f1239" />
                
                {/* Stamens hanging down with shimmering golden tips - stretched down by 25px */}
                <path d="M182,145 Q168,215 162,240" stroke="url(#velvetGoldOutline)" strokeWidth="1" fill="none" />
                <circle cx="162" cy="240" r="3.5" fill="url(#velvetGoldOutline)" className="animate-pulse" />

                <path d="M195,145 Q195,230 195,257" stroke="url(#velvetGoldOutline)" strokeWidth="1.2" fill="none" />
                <circle cx="195" cy="257" r="4.2" fill="url(#velvetGoldOutline)" className="animate-pulse" />

                <path d="M208,145 Q222,215 228,240" stroke="url(#velvetGoldOutline)" strokeWidth="1" fill="none" />
                <circle cx="228" cy="240" r="3.5" fill="url(#velvetGoldOutline)" className="animate-pulse" />

                {/* Inner glowing seedpod halo */}
                <circle cx="195" cy="155" r="16" fill="url(#sacredGlow)" className="animate-pulse" />
                <circle cx="195" cy="155" r="5" fill="#4c0519" />

                {/* Authentic hanging thread knot mount - shifted down by 25px */}
                <rect x="189" y="219" width="12" height="6" rx="1.5" fill="#d4af37" />
                <circle cx="195" cy="229" r="5.5" fill="#d4af37" />
                <circle cx="195" cy="229" r="2" fill="#142121" />
              </g>
            </g>
          </svg>
          <div className="text-[10px] text-[#d4af37] font-serif tracking-widest mt-1.5 opacity-85 font-bold bg-[#0f1b1b]/95 px-3 py-0.5 rounded border border-[#d4af37]/25 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
            <span>赤尊朱兰 · AMARYLLIS MAJESTICA</span>
          </div>
        </div>

        {/* 4. Puppetry Black Threads & Creamy Styled Tags Card Deck */}
        <div key={resetKey} className="absolute inset-x-0 bottom-0 top-0 z-10">
          {/* 4.1 Stable Cloned Base Layer for Spawning/Reproduction Visuals during Scatter */}
          {(layoutState === "scattered" || gustActive) && (
            <>
              {tags.map((tag, index) => {
                const flowerY = 152;
                const strandIdx = index % 7;
                const positionInStrand = Math.floor(index / 7);
                const fanOutWeight = (strandIdx - 3) * (3.4 + positionInStrand * 1.6);
                const idleX = 50 + fanOutWeight + Math.sin(index * 2.3) * 1.2;
                const rowOffset = positionInStrand * 94;
                const columnStagger = (strandIdx % 2 === 0 ? 0 : 44) + (3 - Math.abs(strandIdx - 3)) * 9;
                const idleY = 235 + rowOffset + columnStagger + Math.cos(index * 1.9) * 6;

                const swayAmplitude = 2.0;
                const swaySpeed = 0.8 + (index % 5) * 0.25;
                const swayPhase = index * 0.7;
                const offsetX = Math.sin(swayTime * swaySpeed + swayPhase) * swayAmplitude;
                const offsetY = Math.cos(swayTime * swaySpeed * 1.5 + swayPhase) * (swayAmplitude * 0.4);

                const displayX = idleX + offsetX;
                const displayY = idleY + offsetY;

                const clientWidth = stageRef.current ? stageRef.current.clientWidth : 800;
                const originX = 50 + (strandIdx - 3) * 0.45;
                const originY = flowerY - Math.abs(strandIdx - 3) * 0.60;
                const startX = (originX / 100) * clientWidth;
                const startY = originY;

                const endX = (displayX / 100) * clientWidth;
                const endY = displayY;

                const cp1x = startX + (endX - startX) * 0.28;
                const cp1y = startY + (endY - startY) * 0.35;
                const cp2x = startX + (endX - startX) * 0.72;
                const cp2y = startY + (endY - startY) * 0.7;

                const pathData = `M ${startX} ${startY} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${endX} ${endY}`;

                return (
                  <React.Fragment key={`clone-${tag.id}`}>
                    {/* Stable Cords */}
                    <svg
                      className="absolute inset-0 w-full h-full pointer-events-none overflow-visible"
                      style={{ zIndex: 4, opacity: 0.35 }}
                    >
                      <path
                        d={pathData}
                        stroke={tag.selected ? "#d4af37" : "#0d1616"}
                        strokeOpacity="0.4"
                        strokeWidth="1"
                        strokeDasharray={tag.selected ? "none" : (index % 3 === 0 ? "2,2" : "none")}
                        fill="none"
                      />
                    </svg>

                    {/* Stable Spawning Tag */}
                    <div
                      className="absolute cursor-pointer transform -translate-x-1/2 -translate-y-[10%] select-none pointer-events-none"
                      style={{
                        left: `${displayX}%`,
                        top: `${displayY}px`,
                        zIndex: 15,
                        opacity: 0.82,
                      }}
                    >
                      <div
                        className={`relative px-5 py-2.5 text-[15.5px] font-serif tracking-widest whitespace-nowrap transition-all duration-300 shadow-sm ${
                          tag.isTransformed
                            ? tag.swept
                              ? "bg-gradient-to-br from-[#fffdf2] via-[#fdefcc] to-[#ebcf99] text-[#7c1414] border-2 border-[#d4af37] border-l-[7.5px] border-l-[#d4af37] shadow-[0_0_12px_rgba(212,175,55,0.3)] font-bold rounded-lg scale-102"
                              : "bg-gradient-to-br from-[#7c1414] to-[#450303] border-2 border-[#e5be53] text-[#fffbeb] shadow-[0_4px_12px_rgba(139,0,0,0.4)] ring-1 ring-[#e5be53] scale-102 font-bold rounded-lg"
                            : tag.selected
                              ? "bg-[#8b0000]/95 border-[#d4af37] text-[#f5f2ed] shadow-md ring-1 ring-[#d4af37] rounded-sm"
                              : "bg-[#f5f2ed] border-[#cbbca3] text-[#2c2c2c] border-l-[4px] border-l-[#8b0000]/60 rounded-sm"
                        }`}
                      >
                        {/* Hole */}
                        <div className={`absolute top-[2px] left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full border ${
                          tag.isTransformed
                            ? tag.swept
                              ? "bg-[#fffbeb] border-[#d4af37]"
                              : "bg-[#7c1414] border-[#ffe082]"
                            : tag.selected
                              ? "bg-black border-[#d4af37]/40"
                              : "bg-[#c4b79c] border-[#9f8f74]"
                        }`} />
                        
                        <span className="inline-flex items-center gap-1.5 mt-0.5 text-[15px] font-medium leading-none">
                          {tag.isTransformed && (
                            <svg className="h-4 w-4 animate-spin-slow text-[#e5be53]" viewBox="0 0 24 24" fill="none">
                              <path d="M12 2L15 9L22 12L15 15L12 22L9 15L2 12L9 9Z" fill="currentColor" />
                            </svg>
                          )}
                          <span className={tag.isTransformed ? "font-serif font-extrabold tracking-widest text-[16px] text-[#fffbeb] drop-shadow-[0_1px_1.5px_rgba(0,0,0,0.7)]" : ""}>
                            {tag.text}
                          </span>
                          {tag.isTransformed && (
                            <span className="inline-block px-1 rounded-sm border leading-none scale-90 translate-y-[-0.5px] font-serif shadow-xs text-[9.5px] font-bold bg-[#fffbeb] text-[#7c1414] border-[#fffbeb]">
                              良
                            </span>
                          )}
                        </span>
                      </div>
                    </div>
                  </React.Fragment>
                );
              })}
            </>
          )}

          {tags.map((tag, index) => {
            // Determine coordinate positioning based on active state

            // Center of the flower base (adjusted vertically due to stretched flower size and removing p-4 shift)
            const flowerX = 50; // percentage style
            const flowerY = 152; // Tucked elegantly deep inside the newly stretched flower petals center node

            // 7 core stamen filaments fanning out gracefully from the flower center
            const strandIdx = index % 7; // 0 to 6 columns
            const positionInStrand = Math.floor(index / 7); // 0 to 3 Row positions inside filament

            // Horizontal stamen spreading curves outward as it descends to mimic real flower morphology
            const fanOutWeight = (strandIdx - 3) * (3.4 + positionInStrand * 1.6);
            let idleX = 50 + fanOutWeight + Math.sin(index * 2.3) * 1.2;

            // Cascade drop heights staggered symmetrically so tags do not bunch up or overlap
            const rowOffset = positionInStrand * 94;
            const columnStagger = (strandIdx % 2 === 0 ? 0 : 44) + (3 - Math.abs(strandIdx - 3)) * 9;
            let idleY = 235 + rowOffset + columnStagger + Math.cos(index * 1.9) * 6;
            let idleLength = idleY - flowerY;

            // Scattered State: Dispersing dynamically into a wide, tidy wind-whirled grid field with generous negative space to prevent overlaps
            const rowIdx = Math.floor(index / 4);
            const colIdx = index % 4;
            
            // Stagger horizontal position based on odd/even rows to give an organic brick look
            const rowOffsetX = (rowIdx % 2 === 0) ? 0 : 4.4;
            let scatterX = 14 + colIdx * 21.6 + rowOffsetX + (index % 3 === 0 ? 1.5 : -1.5);
            
            // Spaced out vertically with a generous 84px gap
            let scatterY = 240 + rowIdx * 83 + (index % 2 === 0 ? 8 : -8);
            
            // Clear the hanging flower visual zone at the top
            if (rowIdx === 0) {
              scatterY += 20;
            }

            const targetX = layoutState === "idle" ? idleX : scatterX;
            const targetY = layoutState === "idle" ? idleY : scatterY;
            const currentStringLength = layoutState === "idle" ? idleLength : targetY - flowerY;

            // Dynamic swaying offset computation
            const swayAmplitude = layoutState === "idle" ? 3.5 : 1.2;
            const swaySpeed = 0.8 + (index % 5) * 0.25;
            const swayPhase = index * 0.7;
            const offsetX = Math.sin(swayTime * swaySpeed + swayPhase) * swayAmplitude;
            const offsetY = Math.cos(swayTime * swaySpeed * 1.5 + swayPhase) * (swayAmplitude * 0.4);

            // WIND-BLOWN FLUTTER SIMULATION
            // We combine both layoutState (scattered) and active high-velocity wind storm gust
            const activeIntensity = gustIntensity > 0 ? gustIntensity : (layoutState === "scattered" ? 0.35 : 0);
            
            // UNIFIED WIND GUST DYNAMICS (Blowing together beautifully matching the reference video)
            const windDirection = 1; // Unified direction (sweeping elegant wind to the right)
            
            // Sweep sideways together with custom aerodynamic lift raising them as the ropes tighten
            const gustDisplacementX = windDirection * (14 + (index % 6) * 4.2) * activeIntensity;
            const gustDisplacementY = - (10 + (index % 4) * 3.6) * activeIntensity;
            
            // Waves of fluttering sway with traveling wave front passing from side to side
            const dynamicSwaySpeed = 1.0 + activeIntensity * 3.5;
            const dynamicWavePhase = (index % 7) * 0.45 - (swayTime * 2.8);
            const flutterX = Math.sin(swayTime * 5.4 * dynamicSwaySpeed + dynamicWavePhase) * (2.8 + activeIntensity * 12.5);
            const flutterY = Math.cos(swayTime * 4.6 * dynamicSwaySpeed + dynamicWavePhase) * (1.1 + activeIntensity * 6.0);

            // 4.1 Intro Cascade check: Let's keep display coordinates independent of JS timing to prevent any stuck state!
            // Apply high-fidelity wind compensation bias shifting base coordinates left by up to 13.5% under max wind gust
            const windBiasX = - (13.5 * activeIntensity);

            const displayX = targetX + gustDisplacementX + windBiasX + (flutterX / 6.5) + (hoveredTag === tag.id ? offsetX : 0);
            const displayY = targetY + gustDisplacementY + flutterY + (hoveredTag === tag.id ? offsetY : 0);

            // Connect lines (threads) SVG element background logic
            const clientWidth = stageRef.current ? stageRef.current.clientWidth : 800;
            
            // Individual fanning coordinate origin points on the flower base - tightly converged to loop cleanly out of the stamen knot
            const originX = 50 + (strandIdx - 3) * 0.45; 
            const originY = flowerY - Math.abs(strandIdx - 3) * 0.60;
            const startX = (originX / 100) * clientWidth;
            const startY = originY;

            const isShattering = shatteringIds.includes(tag.id);

            // Staggered tearing timing logic (same index formula as elements below for perfect sync!)
            const tearDelay = `${(index % 6) * 100}ms`;

            const endX = (displayX / 100) * clientWidth;
            const endY = displayY;

            // If shattering, the severed rope snaps up toward the flower stamen base point with elastic pull
            const finalEndX = isShattering ? startX + (Math.sin(index * 2) * 14) : endX;
            const finalEndY = isShattering ? startY + 18 : endY;

            // Beautiful wind bow: ropes curve horizontally outward in high wind representing aerodynamic drag
            const ropeBowX = windDirection * 48 * activeIntensity;
            const cp1x = startX + (finalEndX - startX) * 0.28 + (isShattering ? 0 : ropeBowX);
            const cp1y = startY + (finalEndY - startY) * 0.35 - (isShattering ? 0 : (8 * activeIntensity));
            const cp2x = startX + (finalEndX - startX) * 0.72 + (isShattering ? 0 : (ropeBowX * 0.75));
            const cp2y = startY + (finalEndY - startY) * 0.7;

            const pathData = `M ${startX} ${startY} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${finalEndX} ${finalEndY}`;

            // Cascade animations properties
            const isWaitingToCascade = introStage === "dormant" || introStage === "landing" || introStage === "blooming";
            const cascadeDelay = `${(index % 8) * 110}ms`;
            const opacityValue = isWaitingToCascade ? 0 : 1;

            return (
              <React.Fragment key={tag.id}>
                {/* Slender Black Puppet Thread */}
                <svg
                  className="absolute inset-0 w-full h-full pointer-events-none overflow-visible"
                  style={{ 
                    zIndex: 5, 
                    opacity: isWaitingToCascade ? 0 : (isShattering ? 0 : 0.5), 
                    transition: isShattering
                      ? `opacity 0.3s cubic-bezier(0.16, 1, 0.3, 1) calc(${tearDelay} + 120ms)` // synchronized with the rip
                      : isWaitingToCascade 
                        ? "opacity 0.2s linear" 
                        : `opacity 1.2s cubic-bezier(0.16, 1, 0.3, 1) ${cascadeDelay}` 
                  }}
                >
                  <path
                    // Draw cubic bezier curve for realistic wind deflection
                    d={pathData}
                    stroke={tag.selected ? "#d4af37" : "#0d1616"}
                    strokeOpacity={tag.selected ? "0.9" : "0.5"}
                    strokeWidth={tag.selected ? "1.5" : "1"}
                    strokeDasharray={tag.selected ? "none" : (index % 3 === 0 ? "2,2" : "none")}
                    fill="none"
                    style={{
                      transition: isShattering 
                        ? "d 0.35s cubic-bezier(0.19, 1, 0.22, 1)"
                        : "stroke 0.4s ease, stroke-opacity 0.4s ease",
                    }}
                  />
                </svg>

                {/* Tag Container */}
                <div
                  className={`absolute cursor-pointer focus:outline-none ${
                    introStage !== "ready" ? "cascade-animate-card" : "transform -translate-x-1/2 -translate-y-[10%]"
                  }`}
                  style={{
                    left: `${displayX}%`,
                    top: `${displayY}px`,
                    zIndex: hoveredTag === tag.id ? 9999 : (tag.selected ? 60 : 25),
                    opacity: opacityValue,
                    animationDelay: cascadeDelay,
                    transition: isWaitingToCascade
                      ? "left 0.1s linear, top 0.1s linear, opacity 0.5s ease"
                      : "left 1.2s cubic-bezier(0.16, 1, 0.3, 1), top 1.2s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.8s ease-out, transform 1.2s cubic-bezier(0.175, 0.885, 0.32, 1.2)",
                  }}
                  onMouseEnter={() => handleTagMouseEnter(tag.id, !!tag.isTransformed, !!tag.swept)}
                  onMouseMove={(e) => handleTagMouseMove(e, tag.id, !!tag.isTransformed, !!tag.swept)}
                  onMouseLeave={() => setHoveredTag(null)}
                  onClick={() => {
                    if (shatteringIds.includes(tag.id)) return; // Disable click during explosive tearing
                    if (!tag.isTransformed) {
                      onToggleTag(tag.id);
                      triggerSound("chime");
                    } else {
                      triggerSound("chime");
                    }
                  }}
                >
                  {/* Particle Emitter Layer */}
                  <div className="absolute inset-0 pointer-events-none overflow-visible z-50">
                    {hoverParticles
                      .filter((p) => p.tagId === tag.id)
                      .map((p) => (
                        <div
                          key={p.id}
                          className="absolute rounded-full pointer-events-none animate-pollen"
                          style={{
                            left: `${p.x}px`,
                            top: `${p.y}px`,
                            width: `${p.size}px`,
                            height: `${p.size}px`,
                            backgroundColor: p.color,
                            boxShadow: `0 0 ${p.size * 1.8}px ${p.color}`,
                            ['--tx' as any]: p.tx,
                            ['--ty' as any]: p.ty,
                            ['--rot' as any]: p.rot,
                            ['--dur' as any]: p.dur,
                            ['--delay' as any]: p.delay,
                            ['--color' as any]: p.color,
                          } as React.CSSProperties}
                        />
                      ))}
                  </div>
                  {/* Rice Paper Label Styled Box with curled border effect matching Artistic Flair */}
                  <div
                    className={`relative px-5 py-2.5 text-[15.5px] font-serif tracking-widest whitespace-nowrap transition-all duration-300 shadow-md ${
                      shatteringIds.includes(tag.id)
                        ? "bg-transparent border-transparent shadow-none"
                        : tag.isTransformed
                          ? tag.swept
                            ? "bg-gradient-to-br from-[#fffdf2] via-[#fdefcc] to-[#ebcf99] text-[#7c1414] border-2 border-[#d4af37] border-l-[7.5px] border-l-[#d4af37] shadow-[0_0_18px_rgba(212,175,55,0.45)] animate-gold-glow font-bold rounded-lg scale-105 select-none"
                            : "bg-gradient-to-br from-[#7c1414] to-[#450303] border-2 border-[#e5be53] text-[#fffbeb] shadow-[0_4px_16px_rgba(139,0,0,0.6)] ring-2 ring-[#e5be53] scale-105 font-bold rounded-lg"
                          : tag.selected
                            ? "bg-[#8b0000]/95 border-[#d4af37] text-[#f5f2ed] shadow-lg shadow-[#8b0000]/50 ring-1 ring-[#d4af37] scale-105 rounded-sm"
                            : "bg-[#f5f2ed] hover:bg-[#faf9f5] border-[#cbbca3] text-[#2c2c2c] border-l-[4px] border-l-[#8b0000]/60 rounded-sm"
                    } ${
                      hoveredTag === tag.id && !shatteringIds.includes(tag.id)
                        ? "scale-110 -translate-y-1 shadow-lg ring-1 ring-[#e5be53]" 
                        : ""
                    }`}
                    style={{
                      filter: tag.selected && !shatteringIds.includes(tag.id)
                        ? "drop-shadow(0 4px 8px rgba(139,0,0, 0.5))" 
                        : "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.35))",
                      transform: hoveredTag === tag.id && !shatteringIds.includes(tag.id) ? "scale(1.1)" : "rotate(" + (Math.sin(index) * 4) + "deg)",
                    }}
                  >
                    {/* Exquisite Traditional Chinese Floral/Brocade Pattern Background on Hover */}
                    {hoveredTag === tag.id && !shatteringIds.includes(tag.id) && (
                      <div className="absolute inset-0 rounded-[inherit] overflow-hidden pointer-events-none z-0">
                        {/* Elegant crimson/gold gradient base */}
                        <div className="absolute inset-0 bg-gradient-to-br from-[#9a1c1c] via-[#b91c1c] to-[#6d0e0e] opacity-98 transition-opacity" />
                        {/* Silk floral/brocade visual pattern overlay using an inline SVG */}
                        <svg className="absolute inset-0 w-full h-full opacity-30" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
                          <defs>
                            <pattern id="chineseBrocade" width="18" height="18" patternUnits="userSpaceOnUse">
                              {/* Classic Chinese interlocking wave/cloud/flower motifs */}
                              <path d="M 0 9 C 4.5 4.5, 4.5 13.5, 9 9 Q 13.5 4.5, 18 9" stroke="#ffe082" strokeWidth="1" fill="none" />
                              <path d="M 9 0 Q 13.5 4.5, 9 9 C 4.5 13.5, 4.5 4.5, 9 18" stroke="#ffe082" strokeWidth="0.8" fill="none" />
                              <circle cx="9" cy="9" r="1.8" fill="#ffe082" />
                            </pattern>
                          </defs>
                          <rect width="100%" height="100%" fill="url(#chineseBrocade)" />
                        </svg>
                        {/* Delicate golden borders */}
                        <div className="absolute inset-0 border border-[#e5be53]/80 rounded-[inherit] m-[1.5px]" />
                        <div className="absolute inset-y-0 left-0 w-[5px] bg-gradient-to-b from-[#e5be53] to-[#aa7c11]" />
                      </div>
                    )}

                    {shatteringIds.includes(tag.id) ? (
                      <div className="relative w-full h-full min-w-[135px] min-h-[46px] flex items-center justify-center">
                        {/* THE NEW POSITIVE TAG BACKGROUND AND WORD (gorgeous bright eye-catching cream-gold jade, pristine and highly legible) */}
                        <div 
                          className="absolute inset-0 bg-gradient-to-br from-[#fffdf9] via-[#fdf7e3] to-[#ebcf99] text-[#7c1414] border-2 border-[#e5be53] border-l-[7px] border-l-[#b91c1c] shadow-[0_0_24px_rgba(229,190,83,0.65)] rounded-lg scale-110 flex items-center justify-center font-bold px-4 py-2 text-center animate-new-tag-pop select-none z-0"
                          style={{
                            animationDelay: "calc(" + tearDelay + " + 180ms)",
                          }}
                        >
                          <div className="flex items-center gap-1 pb-0.5 text-[16px] font-serif font-extrabold text-[#7c1414] tracking-widest pl-1 py-1 drop-shadow-[0_1px_0.5px_rgba(255,255,255,1)]">
                            <svg className="h-4.5 w-4.5 animate-spin-slow text-[#c2961c] shrink-0 mr-1.5" viewBox="0 0 24 24" fill="none">
                              <path d="M12 2L15 9L22 12L15 15L12 22L9 15L2 12L9 9Z" fill="currentColor" />
                            </svg>
                            {LOCAL_TAG_MAPPING[tag.originalText || ""] || tag.text}
                            <span className="inline-block px-1 ml-1.5 bg-[#b91c1c] text-[#fffcf3] text-[10px] font-serif font-extrabold rounded-sm border border-[#e5be53] leading-none scale-95 translate-y-[-0.5px] shadow-sm">
                              良
                            </span>
                          </div>
                        </div>

                        {/* Left Fragment Paper Piece (looks like the old gray tag split jaggedly with high detail) */}
                        <div
                          className="absolute inset-0 flex items-center justify-center bg-[#f5f2ed] border border-[#cbbca3] text-[#2c2c2c] border-l-[4px] border-l-[#8b0000]/60 font-serif select-none px-5 py-2.5 text-[15px] rounded-sm animate-clip-left"
                          style={{
                            clipPath: "polygon(0% 0%, 51% 0%, 47% 12%, 53% 25%, 46% 38%, 52% 52%, 45% 68%, 54% 82%, 48% 91%, 51% 100%, 0% 100%)",
                            zIndex: 10,
                            animationDelay: tearDelay,
                          }}
                        >
                          {tag.originalText || tag.text}
                        </div>

                        {/* Right Fragment Paper Piece (matching jagged split edge) */}
                        <div
                          className="absolute inset-0 flex items-center justify-center bg-[#f5f2ed] border border-[#cbbca3] text-[#2c2c2c] font-serif select-none px-5 py-2.5 text-[15px] rounded-sm animate-clip-right"
                          style={{
                            clipPath: "polygon(51% 0%, 100% 0%, 100% 100%, 51% 100%, 48% 91%, 54% 82%, 45% 68%, 52% 52%, 46% 38%, 53% 25%, 47% 12%)",
                            zIndex: 10,
                            animationDelay: tearDelay,
                          }}
                        >
                          {tag.originalText || tag.text}
                        </div>

                        {/* Jagged central glowing tear-line */}
                        <div 
                          className="absolute left-[47%] top-[-15%] bottom-[-15%] w-[2.2px] bg-[#d4af37]/90 shadow-[0_0_12px_rgba(212,175,55,0.95)] pointer-events-none animate-tear-glow z-20" 
                          style={{
                            animationDelay: tearDelay,
                          }}
                        />

                        {/* Shredded paper fibers and dust particles bursting out dynamically */}
                        <div className="absolute inset-0 pointer-events-none overflow-visible z-20">
                          {/* Left-flying paper fibers */}
                          <span 
                            className="absolute left-[47%] top-[25%] w-1.5 h-3 bg-[#e4dfd5] border border-[#cbbca3]/40 rounded-xs animate-rustle-shred-1" 
                            style={{ animationDelay: tearDelay }} 
                          />
                          <span 
                            className="absolute left-[46%] top-[65%] w-2.5 h-1.5 bg-[#efebe1] border border-[#cbbca3]/40 rounded-xs animate-rustle-shred-1" 
                            style={{ animationDelay: tearDelay }} 
                          />

                          {/* Right-flying paper fibers */}
                          <span 
                            className="absolute left-[52%] top-[15%] w-2.5 h-2.5 bg-[#e4dfd5] border border-[#cbbca3]/40 rounded-xs animate-rustle-shred-2" 
                            style={{ animationDelay: tearDelay }} 
                          />
                          <span 
                            className="absolute left-[53%] top-[55%] w-3 h-1.2 bg-[#efebe1] border border-[#cbbca3]/40 rounded-xs animate-rustle-shred-2" 
                            style={{ animationDelay: tearDelay }} 
                          />

                          {/* Radiant golden dust sparks flying and scattering */}
                          <span 
                            className="absolute left-[49%] top-[35%] w-1.5 h-1.5 bg-[#e5be53] rounded-full shadow-[0_0_6px_#e5be53] animate-rustle-shred-3" 
                            style={{ animationDelay: tearDelay, ['--tx' as any]: '-30px', ['--ty' as any]: '50px' } as React.CSSProperties} 
                          />
                          <span 
                            className="absolute left-[50%] top-[45%] w-2 h-2 bg-[#d4af37] rounded-full shadow-[0_0_8px_#d4af37] animate-rustle-shred-3" 
                            style={{ animationDelay: tearDelay, ['--tx' as any]: '40px', ['--ty' as any]: '65px' } as React.CSSProperties} 
                          />
                          <span 
                            className="absolute left-[51%] top-[25%] w-1 h-1 bg-[#fffbeb] rounded-full shadow-[0_0_4px_#fffbeb] animate-rustle-shred-3" 
                            style={{ animationDelay: tearDelay, ['--tx' as any]: '10px', ['--ty' as any]: '-45px' } as React.CSSProperties} 
                          />
                        </div>
                      </div>
                    ) : (
                      <>
                        {/* Tiny tie node hole on top center of tag */}
                        <div className={`absolute top-[2px] left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full border z-10 transition-colors duration-200 ${
                          hoveredTag === tag.id && !shatteringIds.includes(tag.id)
                            ? "bg-[#fffbeb] border-[#e5be53]"
                            : tag.isTransformed
                              ? tag.swept
                                ? "bg-[#fffbeb] border-[#d4af37]"
                                : "bg-[#7c1414] border-[#ffe082]"
                              : tag.selected
                                ? "bg-black border-[#d4af37]/40"
                                : "bg-[#c4b79c] border-[#9f8f74]"
                        }`} />
                        
                        {/* Chinese Character Label text */}
                        <span className={`relative z-10 inline-flex items-center gap-1.5 mt-0.5 select-none text-[15px] font-medium leading-none transition-colors duration-200 ${
                          hoveredTag === tag.id && !shatteringIds.includes(tag.id)
                            ? "text-[#fffcf0] font-bold drop-shadow-[0_1.5px_2px_rgba(0,0,0,0.85)]"
                            : ""
                        }`}>
                          {tag.isTransformed && (
                            <svg className={`h-4 w-4 animate-spin-slow shrink-0 ${
                              hoveredTag === tag.id && !shatteringIds.includes(tag.id)
                                ? "text-[#e5be53]"
                                : tag.swept 
                                  ? 'text-[#c2961c]' 
                                  : 'text-[#e5be53]'
                            }`} viewBox="0 0 24 24" fill="none">
                              <path d="M12 2L15 9L22 12L15 15L12 22L9 15L2 12L9 9Z" fill="currentColor" />
                            </svg>
                          )}
                          <span className={
                            hoveredTag === tag.id && !shatteringIds.includes(tag.id)
                              ? "font-serif tracking-widest text-[#fffdf5] drop-shadow-[0_1.5px_2px_rgba(0,0,0,0.9)]"
                              : tag.isTransformed 
                                ? `font-serif font-extrabold tracking-widest text-[16px] ${tag.swept ? 'text-[#7c1414] drop-shadow-[0_1px_1px_rgba(255,255,255,0.7)]' : 'text-[#fffbeb] drop-shadow-[0_1px_1.5px_rgba(0,0,0,0.7)]'}` 
                                : ''
                          }>
                            {tag.text}
                          </span>
                          {tag.isTransformed && (
                            <span className={`inline-block px-1 rounded-sm border leading-none scale-90 translate-y-[-0.5px] font-serif shadow-xs text-[9.5px] font-bold ${
                              hoveredTag === tag.id && !shatteringIds.includes(tag.id)
                                ? "bg-[#fffbeb] text-[#7c1414] border-[#fffbeb]"
                                : tag.swept
                                  ? 'bg-[#b91c1c] text-[#fffcf3] border-[#e5be53]/45'
                                  : 'bg-[#fffbeb] text-[#7c1414] border-[#fffbeb]'
                            }`} title="金石印鉴：重塑之印">
                              良
                            </span>
                          )}
                        </span>

                        {/* Selection Indicator Glow Dot on corner */}
                        {tag.selected && (
                          <span className="absolute -top-1 -right-1 flex h-2 w-2 z-10">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#d4af37] opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#d4af37]"></span>
                          </span>
                        )}

                        {/* Chinese ink stroke motif background */}
                        <div className="absolute inset-x-0 bottom-0 h-[2px] bg-gradient-to-r from-transparent via-stone-400/20 to-transparent pointer-events-none" />
                      </>
                    )}
                  </div>
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* 5. Minimal Bottom Statistics & Display Bar */}
      <div className="z-10 px-6 py-3 bg-[#0a0f10]/80 border-t border-[#d4af37]/15 text-[11px] text-stone-300 flex items-center justify-between font-mono">
        <div className="flex items-center gap-4">
          <span>总数: <strong className="text-[#d4af37] font-sans">{tags.length}</strong></span>
          <span className="text-stone-700">|</span>
          <span>已选偏见: <strong className="text-red-400 font-sans">{tags.filter(t => t.selected).length}</strong></span>
        </div>
        <div className="flex items-center gap-1.5 text-stone-500">
          <Sparkles className="h-3 w-3 text-[#d4af37]" />
          <span>ARTISTIC FLAIR CORE 1.2</span>
        </div>
      </div>
    </div>
  );
}
