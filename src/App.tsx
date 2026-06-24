import React, { useState } from "react";
import { TagItem } from "./types";
import TagStage from "./components/TagStage";
import HelpManual from "./components/HelpManual";
import IntroPoster from "./components/IntroPoster";
import KunlunStage from "./components/KunlunStage";
import FinaleAnimation from "./components/FinaleAnimation";
import InkSplashOverlay from "./components/InkSplashOverlay";
import IntroTransitionOverlay from "./components/IntroTransitionOverlay";
import AzuriteTransitionOverlay from "./components/AzuriteTransitionOverlay";
import RoseFinaleTransitionOverlay from "./components/RoseFinaleTransitionOverlay";
import { BookOpen, Sparkles } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

export const TAG_MAPPING: Record<string, string> = {
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

const INITIAL_TAGS: string[] = [
  "柔弱", "胆小", "情绪化", "玻璃心", "敏感多疑", "优柔寡断", "目光短浅", "头发长见识短", 
  "不够理性", "能力差", "大龄剩女", "剩女", "嫁不出去", "顾家狂", "母老虎", "悍妇", 
  "全职主妇无用论", "花瓶", "玩物", "摆设", "颜值工具", "生育工具", "附属品", "摆设品", 
  "做作", "刻薄", "心机重", "贪慕虚荣"
];

export default function App() {
  const [stage, setStage] = useState<"intro" | "tagstage" | "kunlun" | "finale">("intro");
  const [isInkSpattering, setIsInkSpattering] = useState(false);
  const [isIntroTransitioning, setIsIntroTransitioning] = useState(false);
  const [isAzuriteTransitioning, setIsAzuriteTransitioning] = useState(false);
  const [isRoseTransitioning, setIsRoseTransitioning] = useState(false);

  // Convert list to stateful Tag objects
  const [tags, setTags] = useState<TagItem[]>(
    INITIAL_TAGS.map((text, idx) => ({
      id: `tag_${idx}`,
      text,
      originalText: text,
      selected: false,
      isTransformed: false,
      x: 0,
      y: 0,
      length: 120 + (idx % 3) * 35,
    }))
  );

  const [showHelp, setShowHelp] = useState(false);

  // Traditional Chinese Instrument Audio Synthesis Engine (Web Audio API)
  const audioCtxRef = React.useRef<AudioContext | null>(null);
  const pentatonicScale = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25, 783.99, 880.00];
  const lastNoteIdxRef = React.useRef(0);

  const initAudio = () => {
    if (!audioCtxRef.current) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        audioCtxRef.current = new AudioContextClass();
      }
    }
    if (audioCtxRef.current && audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  };

  // Guzheng Pluck (古筝弹拨音效)
  const playGuzhengPluck = (freq: number, velocity: number = 0.5) => {
    const ctx = initAudio();
    if (!ctx) return;
    const now = ctx.currentTime;

    const oscTri = ctx.createOscillator();
    const oscSine = ctx.createOscillator();
    const gainNode = ctx.createGain();
    const bandpass = ctx.createBiquadFilter();

    // Subtle pitch bend of Guzheng sliding
    const bend = 1.01 + Math.random() * 0.01;
    oscTri.type = "triangle";
    oscTri.frequency.setValueAtTime(freq * bend, now);
    oscTri.frequency.exponentialRampToValueAtTime(freq, now + 0.08);

    oscSine.type = "sine";
    oscSine.frequency.setValueAtTime(freq * bend, now);
    oscSine.frequency.exponentialRampToValueAtTime(freq, now + 0.05);

    bandpass.type = "bandpass";
    bandpass.frequency.setValueAtTime(freq * 2.0, now);
    bandpass.frequency.exponentialRampToValueAtTime(freq * 1.2, now + 0.8);
    bandpass.Q.setValueAtTime(2.5, now);

    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(velocity * 0.15, now + 0.006);
    gainNode.gain.exponentialRampToValueAtTime(velocity * 0.04, now + 0.2);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 1.8);

    oscTri.connect(bandpass);
    oscSine.connect(gainNode);
    bandpass.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscTri.start(now);
    oscSine.start(now);
    oscTri.stop(now + 2.0);
    oscSine.stop(now + 2.0);
  };

  // Xiao Flute (箫管柔和长音效)
  const playXiaoBlow = (freq: number, duration: number = 1.2) => {
    const ctx = initAudio();
    if (!ctx) return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    const vibrato = ctx.createOscillator();
    const vibratoGain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, now);

    // Subtle natural vibrato of ancient bamboo flute
    vibrato.frequency.setValueAtTime(5.8, now);
    vibratoGain.gain.setValueAtTime(3.2, now);

    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.08, now + 0.28); // gentle breathing sound attack
    gainNode.gain.setValueAtTime(0.08, now + duration - 0.2);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    vibrato.connect(vibratoGain);
    vibratoGain.connect(osc.frequency);
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    vibrato.start(now);
    osc.start(now);
    vibrato.stop(now + duration + 0.2);
    osc.stop(now + duration + 0.2);
  };

  // Play next scale note on interactive tag click
  const playNextPentatonicNote = () => {
    const freq = pentatonicScale[lastNoteIdxRef.current];
    playGuzhengPluck(freq, 0.45);
    lastNoteIdxRef.current = (lastNoteIdxRef.current + 1) % pentatonicScale.length;
  };

  // Beautiful Guzheng arpeggio cascade for transformation celebration
  const playCelebrationCascade = () => {
    const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50];
    notes.forEach((f, idx) => {
      setTimeout(() => {
        playGuzhengPluck(f, 0.5);
      }, idx * 75);
    });
  };

  // Toggle single tag activation
  const handleToggleTag = (id: string) => {
    playNextPentatonicNote();
    setTags((prev) =>
      prev.map((t) => (t.id === id ? { ...t, selected: !t.selected } : t))
    );
  };

  // Bulk select action (used by all select helper buttons)
  const handleBulkSelect = (ids: string[]) => {
    playGuzhengPluck(392.00, 0.4);
    setTimeout(() => playGuzhengPluck(523.25, 0.35), 80);
    setTags((prev) =>
      prev.map((t) => (ids.includes(t.id) ? { ...t, selected: true } : t))
    );
  };

  // Clear choices
  const handleClearSelection = () => {
    playGuzhengPluck(293.66, 0.35);
    setTags((prev) => prev.map((t) => ({ ...t, selected: false })));
  };

  // Transform tags to positive meanings
  const handleTransformTags = () => {
    playCelebrationCascade();
    setTags((prev) =>
      prev.map((t) => ({
        ...t,
        text: TAG_MAPPING[t.originalText || t.text] || t.text,
        isTransformed: true,
        swept: false,
      }))
    );
  };

  // Reset tags back to negative originals for repeating experience
  const handleResetTags = () => {
    playGuzhengPluck(261.63, 0.4);
    setTags((prev) =>
      prev.map((t) => ({
        ...t,
        text: t.originalText || t.text,
        isTransformed: false,
        selected: false,
        swept: false,
      }))
    );
  };

  // Set tag as mouse swept (to turn to yellow permanently after transformation)
  const handleSweepTag = (id: string) => {
    setTags((prev) =>
      prev.map((t) => (t.id === id ? { ...t, swept: true } : t))
    );
  };

  return (
    <>
      <AnimatePresence mode="wait">
        {stage === "intro" ? (
          <motion.div
            key="intro-poster"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.985, y: -5 }}
            transition={{ duration: 0.45, ease: "easeInOut" }}
            className="w-full min-h-screen"
          >
            <IntroPoster onEnter={() => {
              setIsIntroTransitioning(true);
              playXiaoBlow(329.63, 1.8);
              setTimeout(() => {
                setStage("tagstage");
              }, 500);
              setTimeout(() => {
                setIsIntroTransitioning(false);
              }, 1200);
            }} />
          </motion.div>
        ) : stage === "tagstage" ? (
          <motion.div
            key="main-app"
            initial={{ opacity: 0, scale: 1.015 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95, filter: "blur(15px)", y: 15 }}
            transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
            id="app-root"
            className="min-h-screen w-full text-[#e0d8cc] flex flex-col antialiased selection:bg-[#d4af37]/30 selection:text-[#f5f2ed]"
            style={{ 
              backgroundImage: tags.some((t) => t.isTransformed)
                ? "radial-gradient(circle at 50% 50%, #502a35 0%, #1f0f14 100%)"
                : "radial-gradient(circle at 50% 50%, #1f3a3a 0%, #142121 100%)"
            }}
          >
            <main className="w-screen h-screen flex flex-col overflow-hidden bg-transparent">
              <TagStage
                tags={tags}
                onToggleTag={handleToggleTag}
                onBulkSelect={handleBulkSelect}
                onClearSelection={handleClearSelection}
                onTransformTags={handleTransformTags}
                onResetTags={handleResetTags}
                onSweepTag={handleSweepTag}
                onShowHelp={() => setShowHelp(true)}
                onEnterKunlun={() => {
                  setIsAzuriteTransitioning(true);
                  playGuzhengPluck(392.00, 0.4);
                  setTimeout(() => playGuzhengPluck(523.25, 0.4), 100);
                  setTimeout(() => playGuzhengPluck(659.25, 0.35), 200);
                  setTimeout(() => playXiaoBlow(783.99, 1.2), 300);
                  setTimeout(() => {
                    setStage("kunlun");
                  }, 500);
                  setTimeout(() => {
                    setIsAzuriteTransitioning(false);
                  }, 1100);
                }}
              />
            </main>

            {/* Floating help instruction guidebook overlay modal */}
            <HelpManual isOpen={showHelp} onClose={() => setShowHelp(false)} />
          </motion.div>
        ) : stage === "kunlun" ? (
          <motion.div
            key="kunlun"
            initial={{ opacity: 0, scale: 1.02, filter: "blur(10px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 0.98, filter: "blur(10px)" }}
            transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
            className="w-full min-h-screen"
          >
            <KunlunStage 
              onBack={() => {
                setIsAzuriteTransitioning(true);
                playGuzhengPluck(523.25, 0.4);
                setTimeout(() => playGuzhengPluck(392.00, 0.35), 100);
                setTimeout(() => playXiaoBlow(329.63, 1.0), 200);
                setTimeout(() => {
                  setStage("tagstage");
                }, 400);
                setTimeout(() => {
                  setIsAzuriteTransitioning(false);
                }, 950);
              }} 
              onEnterFinale={() => {
                setIsRoseTransitioning(true);
                playCelebrationCascade();
                setTimeout(() => {
                  setStage("finale");
                }, 500);
                setTimeout(() => {
                  setIsRoseTransitioning(false);
                }, 1100);
              }}
            />
          </motion.div>
        ) : (
          <motion.div
            key="finale"
            initial={{ opacity: 0, scale: 1.03, filter: "blur(15px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 0.97, filter: "blur(12px)" }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="w-full min-h-screen"
          >
            <FinaleAnimation 
              onBackToKunlun={() => {
                setIsRoseTransitioning(true);
                playGuzhengPluck(392.00, 0.45);
                setTimeout(() => {
                  setStage("kunlun");
                }, 450);
                setTimeout(() => {
                  setIsRoseTransitioning(false);
                }, 1000);
              }}
            />
          </motion.div>
        )}
    </AnimatePresence>
    <InkSplashOverlay isActive={isInkSpattering} />
    <IntroTransitionOverlay isActive={isIntroTransitioning} />
    <AzuriteTransitionOverlay isActive={isAzuriteTransitioning} />
    <RoseFinaleTransitionOverlay isActive={isRoseTransitioning} />
  </>
  );
}
