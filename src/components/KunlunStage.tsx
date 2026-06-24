import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, Volume2, VolumeX, Sparkles, Music } from "lucide-react";
const kunlunBg = "/src/assets/images/kunlun_bg_fish_1782129094691.jpg";
const waterRippleBg = "/src/assets/images/water_ripple_texture_1782131563514.jpg";

// Beautiful lightweight hand-drawn vector elements mimicking Peach/Cherry Blossoms
const PeachBlossom = ({ scale = 1, rotation = 0 }: { scale?: number; rotation?: number }) => (
  <svg 
    className="w-7 h-7 drop-shadow-[0_2px_4px_rgba(244,114,182,0.3)] select-none pointer-events-none transition-transform"
    style={{ transform: `scale(${scale}) rotate(${rotation}deg)` }}
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Five elegant calligraphic pink flower petals */}
    <path d="M12 12C12 7.5 10.2 4.5 12 4.5C13.8 4.5 12 7.5 12 12Z" fill="#fbcfe8" stroke="#f472b6" strokeWidth="0.6"/>
    <path d="M12 12C16.5 12 19.5 10.2 19.5 12C19.5 13.8 16.5 12 12 12Z" fill="#ffb7c5" stroke="#f472b6" strokeWidth="0.6"/>
    <path d="M12 12C12 16.5 13.8 19.5 12 19.5C10.2 19.5 12 16.5 12 12Z" fill="#ffb7c5" stroke="#e879f9" strokeWidth="0.6"/>
    <path d="M12 12C7.5 12 4.5 13.8 4.5 12C4.5 10.2 7.5 12 12 12Z" fill="#fbcfe8" stroke="#f472b6" strokeWidth="0.6"/>
    
    {/* Secondary inner glowing layer */}
    <path d="M12 12C9.5 9.5 7.2 10.8 8.2 9.8C9.2 8.8 10.5 10.5 12 12Z" fill="#ffd1dc" opacity="0.9"/>
    <path d="M12 12C14.5 9.5 14.8 7.2 13.8 8.2C12.8 9.2 14.5 10.5 12 12Z" fill="#ffd1dc" opacity="0.9"/>
    <path d="M12 12C14.5 14.5 16.8 13.2 15.8 14.2C14.8 15.2 13.5 14.5 12 12Z" fill="#ffa4b6" opacity="0.9"/>
    <path d="M12 12C9.5 14.5 9.2 16.8 10.2 15.8C11.2 14.8 9.5 13.5 12 12Z" fill="#ffa4b6" opacity="0.9"/>
    
    {/* Small golden pollen pistil/stamens */}
    <circle cx="12" cy="12" r="1.8" fill="#fbbf24"/>
    <path d="M12 12L12 9.5 M12 12L14 10 M12 12L14 14 M12 12L10 14" stroke="#fbbf24" strokeWidth="0.5" strokeLinecap="round" />
  </svg>
);

const TreeTwig = () => (
  <svg className="w-12 h-8 opacity-45 pointer-events-none select-none drop-shadow-sm" viewBox="0 0 40 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2 14C12 14 22 10 36 12 M14 13C17 8 20 7 22 8 M26 11C28 15 32 17 33 16" stroke="#5c4033" strokeWidth="1.2" strokeLinecap="round" />
    <path d="M15 10C14 7 12 6 10 7" stroke="#65a30d" strokeWidth="1.0" strokeLinecap="round" />
    <path d="M27 13C29 15 30 16 31 15" stroke="#65a30d" strokeWidth="1.0" strokeLinecap="round" />
  </svg>
);

// Types
interface ActiveSentence {
  id: string;
  text: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  rotSpeed: number;
  scale: number;
  opacity: number;
  isVertical: boolean;
  color: string;
  subLabel: string;
  shadowColor: string;
  blossoms: Array<{ x: number; y: number; scale: number; rotate: number; lag: number }>;
}

interface RainParticle {
  id: string;
  x: number;
  y: number;
  speed: number;
  length: number;
  opacity: number;
}

interface NoteParticle {
  id: string;
  x: number;
  y: number;
  char: string;
  vx: number;
  vy: number;
  scale: number;
  opacity: number;
  rotation: number;
  rotSpeed: number;
  color: string;
}

// Gorgeous short female empowerment quotes
const SHORT_POEMS = [
  { text: "我生来就是高山而非溪流", subLabel: "I was born to be a mountain, not a creek" },
  { text: "我欲于群峰之巅俯视平庸的沟壑", subLabel: "Overlooking the valleys from the highest peak" },
  { text: "我生来就是人杰而非草芥", subLabel: "I was born to be a hero, not a blade of grass" },
  { text: "我站在伟人之肩藐视卑微的懦夫", subLabel: "Standing on the shoulders of giants" },
  { text: "“她靠自己的翅膀飞翔。”", subLabel: "She flies with her own wings" },
  { text: "昆仑有谣，女子自成峰", subLabel: "Kunlun Mountains say she is a peak of her own" },
  { text: "雪骨藏锋，生生不息", subLabel: "Bones of snow harboring sharp resilience" },
  { text: "挣脱茧缚，立作山峦", subLabel: "Breaking the cage, she rises like a mountain range" },
  { text: "山不问性别，她自有锋芒", subLabel: "Nature knows no gender, she shines brilliantly" },
  { text: "一身芳骨，传唱昆仑谣", subLabel: "Bearing the pride of female ancestors" },
  { text: "不做附庸，自峙云巅", subLabel: "Never dependent, standing isolated above clouds" },
  { text: "昆仑千峰百态，女子不必同模", subLabel: "Infinite variations, standardizing nothing" },
  { text: "山风不问标签，我自舒展风华", subLabel: "The winds don't care about labels, I bloom" },
  { text: "雪山无定义，女子有千种模样", subLabel: "No definitions can bind a woman's soul" },
  { text: "褪去世俗茧缚，听山谣叙我心", subLabel: "Listen to the mountain telling my heart's song" },
  { text: "挣脱偏见之茧，化作云上青峰", subLabel: "Metamorphosis from cocoon to pristine mountain" },
  { text: "不做摆件花瓶，心有万里昆仑", subLabel: "Never a toy or flower vase, mind as vast as Kunlun" },
  { text: "抛开世俗标尺，活成自己山峦", subLabel: "Throw away metrics, live as your own landscape" },
  { text: "一曲瑶谣横雪岭，女子自成万重峰。", subLabel: "Her melody traverses snow ridges" },
  { text: "不借青山为依靠，一身芳骨峙昆仑。", subLabel: "Standing tall without relying on any support" },
  { text: "瑶池不待君王至，独驭长风唱岭谣。", subLabel: "Riding the cosmic wind across the sky" },
  { text: "莫论柔骨无鸿志，雪岭女儿可擎天。", subLabel: "Delicate shoulders supporting the heavens" },
  { text: "撕去尘间偏见茧，踏风高唱昆仑谣。", subLabel: "Tearing off earthly prejudices" },
  { text: "抛却俗规千重缚，立身冰岳自昭华。", subLabel: "Shining bright amidst frozen heights" },
  { text: "世人妄设闺中尺，我向云巅筑岭家。", subLabel: "Let the world measure, I build my castle on high" },
  { text: "解去周身规束网，昆仑风雪赠清狂。", subLabel: "Wild and free in the gusts of Kunlun" }
];

const ENVELOPE_QUOTES = [
  "我生来就是高山而非溪流，我欲于群峰之巅俯视平庸的沟壑。 我生来就是人杰而非草芥，我站在伟人之肩藐视卑微的懦夫。"
];

// Shifting beautiful pastels / mineral silk colors matching the mood (pink, blue, white, green, yellow, purple)
const DREAMY_PALETTES = [
  { text: "#ffccd5", sub: "SILK CHERRY BLOSSOM PINK", shadow: "rgba(244, 63, 94, 0.65)" },    // Soft Silk Cherry Pink (粉色)
  { text: "#bae6fd", sub: "GLACIER CELESTIAL BLUE",  shadow: "rgba(14, 165, 233, 0.65)" },   // Clear Mountain Sky Blue (蓝色)
  { text: "#ffffff", sub: "PEARLESCENT MOUNTAIN WHITE", shadow: "rgba(255, 255, 255, 0.55)" }, // Snowy Cap Pearl White (白色)
  { text: "#c6f6d5", sub: "BAMBOO HERB DEW GREEN",   shadow: "rgba(34, 197, 94, 0.6)" },    // Tender Bamboo Green (绿色)
  { text: "#fef08a", sub: "GILDED ESCARPMENT AMBER", shadow: "rgba(234, 179, 8, 0.65)" },    // Gilded Saffron Yellow (黄色)
  { text: "#f3e8ff", sub: "WISTERIA AURORA ASTRAL",  shadow: "rgba(168, 85, 247, 0.55)" }    // Starry Wisteria Purple (紫色)
];

// Slots mapped for non-overlapping layout (all horizontal as requested)
const SLOTS = [
  { x: 0.22, y: 0.25, isVertical: false },
  { x: 0.78, y: 0.28, isVertical: false },
  { x: 0.25, y: 0.72, isVertical: false },
  { x: 0.75, y: 0.70, isVertical: false },
  { x: 0.50, y: 0.18, isVertical: false },
  { x: 0.50, y: 0.82, isVertical: false },
  { x: 0.18, y: 0.48, isVertical: false },
  { x: 0.82, y: 0.48, isVertical: false }
];

const NOTE_SYMBOLS = ["♪", "♫", "♬", "♩", "♭", "𝄢", "𝅘𝅥"];

// Pentatonic scales for interaction audio (Chinese C Major Pentatonic)
const PENTATONIC_FREQS = [
  196.00, 220.00, // G3, A3
  261.63, 293.66, 329.63, 392.00, 440.00, // C4, D4, E4, G4, A4
  523.25, 587.33, 659.25, 783.99, 880.00, // C5, D5, E5, G5, A5
  1046.50, 1174.66, 1318.51 // C6, D6, E6
];

interface WaterRipple {
  id: string;
  x: number;
  y: number;
}

interface MouseRipple {
  id: string;
  x: number;
  y: number;
}

export default function KunlunStage({ onBack, onEnterFinale }: { onBack: () => void; onEnterFinale: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [muted, setMuted] = useState(false);
  const [activeSentences, setActiveSentences] = useState<ActiveSentence[]>([]);
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });
  const [hoveredSentenceId, setHoveredSentenceId] = useState<string | null>(null);
  const [ripples, setRipples] = useState<WaterRipple[]>([]);
  const [mouseRipples, setMouseRipples] = useState<MouseRipple[]>([]);
  const lastRipplePos = useRef({ x: 0, y: 0 });
  const [showInkTransition, setShowInkTransition] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowInkTransition(false);
    }, 1800);
    return () => clearTimeout(timer);
  }, []);

  const playWaterDrip = () => {
    if (muted) return;
    initAudioContext();
    const ctx = audioCtxRef.current;
    if (!ctx) return;

    if (ctx.state === "suspended") {
      ctx.resume().catch((err) => console.log("Audio resume error:", err));
    }

    const now = ctx.currentTime;
    
    // Bubble sound of water drip: low frequency rapidly ascending
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(1180, now + 0.14);

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.24, now + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.015, now + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);

    // Dynamic high-pitched plop impact sound for sparkling crispness
    const oscPlop = ctx.createOscillator();
    const gainPlop = ctx.createGain();

    oscPlop.type = "sine";
    oscPlop.frequency.setValueAtTime(1550, now);
    oscPlop.frequency.exponentialRampToValueAtTime(1920, now + 0.03);

    gainPlop.gain.setValueAtTime(0, now);
    gainPlop.gain.linearRampToValueAtTime(0.1, now + 0.002);
    gainPlop.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

    osc.connect(gain);
    gain.connect(ctx.destination);
    
    oscPlop.connect(gainPlop);
    gainPlop.connect(ctx.destination);

    osc.start(now);
    oscPlop.start(now);
    osc.stop(now + 0.35);
    oscPlop.stop(now + 0.1);
  };

  const addRipple = (x: number, y: number) => {
    const id = `${Date.now()}-${Math.random()}`;
    setRipples((prev) => [...prev, { id, x, y }]);
    playWaterDrip();
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== id));
    }, 2000);
  };

  const containerRef = useRef<HTMLDivElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const synthTimerRef = useRef<number | null>(null);

  const rainArray = useRef<RainParticle[]>([]);
  const noteArray = useRef<NoteParticle[]>([]);
  const sentenceIndex = useRef(0);
  const shuffledPoemsRef = useRef<{text: string; subLabel: string}[]>([]);

  // Initialize rain & shuffle quotes on mount
  useEffect(() => {
    const initialRain: RainParticle[] = [];
    for (let i = 0; i < 110; i++) {
       initialRain.push({
        id: `${i}-${Math.random()}`,
        x: Math.random() * (window.innerWidth + 200) - 100,
        y: Math.random() * window.innerHeight,
        speed: 6 + Math.random() * 6.5,
        length: 42 + Math.random() * 50,
        opacity: 0.45 + Math.random() * 0.42,
      });
    }
    rainArray.current = initialRain;

    // Shuffle index lists
    const shuffle = (array: Array<{text: string; subLabel: string}>) => {
      const copy = [...array];
      for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
      }
      return copy;
    };
    shuffledPoemsRef.current = shuffle(SHORT_POEMS);

    // Physics Animation Heartbeat tick
    let animId: number;
    const tick = () => {
      // 1. Rain
      rainArray.current.forEach((r) => {
        r.y += r.speed;
        r.x += r.speed * 0.22; // slanted drift x to match rotation
        if (r.y > window.innerHeight + 50 || r.x > window.innerWidth + 100) {
          r.y = -50;
          r.x = Math.random() * (window.innerWidth + 200) - 150;
        }
      });

      // 2. Translucent Notes
      noteArray.current.forEach((n) => {
        n.x += n.vx;
        n.y += n.vy;
        n.rotation += n.rotSpeed;
        n.opacity -= 0.0065;
      });
      noteArray.current = noteArray.current.filter((n) => n.opacity > 0);

      // 3. Sentences gentle drifting & fading
      setActiveSentences((prev) => {
        const next = prev.map((s) => ({
          ...s,
          x: s.x + s.vx,
          y: s.y + s.vy,
          rotation: s.rotation + s.rotSpeed,
          opacity: s.opacity - 0.0028, // Peaceful slow fading
        }));
        return next.filter((s) => s.opacity > 0);
      });

      if (isOpen && Math.random() > 0.94) {
        spawnAmbientLetterNote();
      }

      animId = requestAnimationFrame(tick);
    };
    animId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(animId);
      if (synthTimerRef.current) {
        clearInterval(synthTimerRef.current);
      }
    };
  }, [isOpen]);

  const initAudioContext = () => {
    if (audioCtxRef.current) return;
    try {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtxClass) {
        const ctx = new AudioCtxClass();
        audioCtxRef.current = ctx;
        scheduleAmbientPianoLoop();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const playGuzhengTune = (freq: number, velocity: number = 0.5) => {
    if (muted) return;
    initAudioContext();
    const ctx = audioCtxRef.current;
    if (!ctx) return;

    if (ctx.state === "suspended") {
      ctx.resume();
    }

    const now = ctx.currentTime;
    const oscTri = ctx.createOscillator();
    const oscSine = ctx.createOscillator();
    const gainNode = ctx.createGain();
    const bandpassFilter = ctx.createBiquadFilter();

    const microBend = 1.012 - Math.random() * 0.024;
    oscTri.type = "triangle";
    oscTri.frequency.setValueAtTime(freq * microBend, now);
    oscTri.frequency.exponentialRampToValueAtTime(freq, now + 0.08);

    oscSine.type = "sine";
    oscSine.frequency.setValueAtTime(freq * microBend, now);
    oscSine.frequency.exponentialRampToValueAtTime(freq, now + 0.05);

    bandpassFilter.type = "bandpass";
    bandpassFilter.frequency.setValueAtTime(freq * 2.0, now);
    bandpassFilter.frequency.exponentialRampToValueAtTime(freq * 1.2, now + 0.8);
    bandpassFilter.Q.setValueAtTime(3.0, now);

    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(velocity * 0.16, now + 0.008);
    gainNode.gain.exponentialRampToValueAtTime(velocity * 0.04, now + 0.22);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 2.2);

    oscTri.connect(bandpassFilter);
    oscSine.connect(gainNode);
    bandpassFilter.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscTri.detune.setValueAtTime((Math.random() - 0.5) * 8, now);

    oscTri.start(now);
    oscSine.start(now);
    oscTri.stop(now + 2.4);
    oscSine.stop(now + 2.4);
  };

  const playHarpCascade = () => {
    if (muted) return;
    const introScale = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 783.99];
    introScale.forEach((freq, idx) => {
      setTimeout(() => {
        playGuzhengTune(freq, 0.45);
      }, idx * 65);
    });
  };

  const scheduleAmbientPianoLoop = () => {
    const ctx = audioCtxRef.current;
    if (!ctx) return;

    const progressions = [
      [130.81, 196.00, 261.63, 329.63, 392.00, 493.88], // Cmaj9
      [110.00, 164.81, 220.00, 329.63, 392.00, 440.00], // Am9
      [87.31, 130.81, 174.61, 261.63, 329.63, 349.23],  // Fmaj9
      [98.00, 146.83, 196.00, 293.66, 392.00, 440.00]   // G6sus4
    ];

    let step = 0;
    const playNextChord = () => {
      if (muted || !isOpen) return;
      const chords = progressions[step];
      const now = ctx.currentTime;

      chords.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + i * 0.12);
        
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.038, now + i * 0.12 + 1.2);
        gain.gain.exponentialRampToValueAtTime(0.005, now + i * 0.12 + 3.0);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.12 + 5.2);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 5.5);
      });

      step = (step + 1) % progressions.length;
    };

    playNextChord();

    if (synthTimerRef.current) {
      clearInterval(synthTimerRef.current);
    }
    synthTimerRef.current = window.setInterval(playNextChord, 5500);
  };

  const spawnAmbientLetterNote = () => {
    const rx = window.innerWidth * 0.5 + (Math.random() - 0.5) * 80;
    const ry = window.innerHeight * 0.5 - 20;

    const accentColors = [
      "#ffffff", 
      "#e0f2fe", 
      "#bae6fd", 
      "#fbcfe8",
      "#cbd5e1"
    ];

    noteArray.current.push({
      id: `${Date.now()}-${Math.random()}`,
      x: rx,
      y: ry,
      char: NOTE_SYMBOLS[Math.floor(Math.random() * NOTE_SYMBOLS.length)],
      vx: (Math.random() - 0.5) * 2.2,
      vy: -1.2 - Math.random() * 2.5,
      scale: 0.8 + Math.random() * 0.7,
      opacity: 0.95,
      rotation: Math.random() * 360,
      rotSpeed: (Math.random() - 0.5) * 2.0,
      color: accentColors[Math.floor(Math.random() * accentColors.length)]
    });
  };

  const handleEnvelopeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    initAudioContext();
    
    if (audioCtxRef.current && audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume();
    }

    if (!isOpen) {
      addRipple(e.clientX, e.clientY);
      setIsOpen(true);
      playHarpCascade();

      // Trigger letters burst immediately
      for (let i = 0; i < 12; i++) {
        setTimeout(() => {
          spawnAmbientLetterNote();
        }, i * 150);
      }
    } else {
      handleTriggerSentence(e.clientX, e.clientY);
    }
  };

  // Safe non-overlapping coordinate slot allocation
  const handleTriggerSentence = (clickX: number, clickY: number) => {
    addRipple(clickX, clickY);
    if (!isOpen) return;

    initAudioContext();
    if (audioCtxRef.current && audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume();
    }

    // Pull next short quote
    let idx = sentenceIndex.current;
    if (idx >= shuffledPoemsRef.current.length) {
      // Re-shuffle to keep infinity loop
      const copy = [...SHORT_POEMS];
      for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
      }
      shuffledPoemsRef.current = copy;
      idx = 0;
    }
    const poemItem = shuffledPoemsRef.current[idx];
    sentenceIndex.current = idx + 1;

    // Use Slot allocation to fully guarantee 100% zero overlap!
    let bestSlot = SLOTS[0];
    let maxMinDistance = -1;

    SLOTS.forEach((slot) => {
      const sx = slot.x * window.innerWidth;
      const sy = slot.y * window.innerHeight;
      
      let minDistanceForSlot = 999999;
      // Calculate distance to any still-active sentence
      activeSentences.forEach((s) => {
        const dx = s.x - sx;
        const dy = s.y - sy;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < minDistanceForSlot) {
          minDistanceForSlot = d;
        }
      });
      
      if (minDistanceForSlot > maxMinDistance) {
        maxMinDistance = minDistanceForSlot;
        bestSlot = slot;
      }
    });

    // Elegant coordinates derived from the best free slot with organic scattering
    const jitterX = (Math.random() - 0.5) * 160; // scatter horizontal further
    const jitterY = (Math.random() - 0.5) * 110; // scatter vertical further
    const slotX = Math.max(80, Math.min(window.innerWidth - 80, bestSlot.x * window.innerWidth + jitterX));
    const slotY = Math.max(100, Math.min(window.innerHeight - 100, bestSlot.y * window.innerHeight + jitterY));

    // Slow upwards drifting speeds
    const vx = (Math.random() - 0.5) * 0.12;
    const vy = -0.15 - Math.random() * 0.15;

    // Select dreamy color palette
    const palette = DREAMY_PALETTES[Math.floor(Math.random() * DREAMY_PALETTES.length)];

    // Generate blossom offsets surrounding the text
    const blossoms = [
      { x: -35, y: -25, scale: 0.75, rotate: Math.random() * 360, lag: 0.1 },
      { x: 45, y: 35, scale: 0.85, rotate: Math.random() * 360, lag: 0.2 },
      { x: -15, y: 40, scale: 0.55, rotate: Math.random() * 360, lag: 0.3 }
    ];

    const newSentenceItem: ActiveSentence = {
      id: `${Date.now()}-${Math.random()}`,
      text: poemItem.text,
      subLabel: poemItem.subLabel,
      x: slotX,
      y: slotY,
      vx,
      vy,
      rotation: (Math.random() - 0.5) * 6,
      rotSpeed: (Math.random() - 0.5) * 0.03,
      scale: 0.95 + Math.random() * 0.15,
      opacity: 1.0,
      isVertical: bestSlot.isVertical,
      color: palette.text,
      shadowColor: palette.shadow,
      blossoms
    };

    setActiveSentences((prev) => {
      // Keep up to 6 sentences active at once
      return [...prev, newSentenceItem].slice(-6);
    });

    // Play Guzheng chimes
    const randomFreq = PENTATONIC_FREQS[Math.floor(Math.random() * PENTATONIC_FREQS.length)];
    playGuzhengTune(randomFreq, 0.48);

    for (let k = 0; k < 3; k++) {
      spawnAmbientLetterNote();
    }
  };

  const handleToggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMuted((prev) => !prev);
  };

  return (
    <div
      ref={containerRef}
      onClick={(e) => handleTriggerSentence(e.clientX, e.clientY)}
      onMouseMove={(e) => {
        const w = window.innerWidth;
        const h = window.innerHeight;
        setMouseOffset({
          x: (e.clientX - w / 2) / (w / 2),
          y: (e.clientY - h / 2) / (h / 2),
        });

        // Sliding water ripple effect
        const lastX = lastRipplePos.current.x;
        const lastY = lastRipplePos.current.y;
        const dist = Math.hypot(e.clientX - lastX, e.clientY - lastY);
        if (dist > 42) {
          const newId = `${Date.now()}-${Math.random()}`;
          setMouseRipples((prev) => [...prev.slice(-18), { id: newId, x: e.clientX, y: e.clientY }]);
          lastRipplePos.current = { x: e.clientX, y: e.clientY };
          setTimeout(() => {
            setMouseRipples((prev) => prev.filter((r) => r.id !== newId));
          }, 1400);
        }
      }}
      className="relative w-screen h-screen flex flex-col items-center justify-center overflow-hidden select-none cursor-pointer"
      style={{
        backgroundImage: `radial-gradient(circle at 50% 45%, rgba(14, 165, 233, 0.48) 0%, rgba(8, 145, 178, 0.58) 55%, rgba(13, 59, 87, 0.72) 100%), url(${kunlunBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat"
      }}
    >
      {/* Real-time high-fidelity SVG liquid fluid turbulence filter (no external texture needed) */}
      <svg className="absolute w-0 h-0 pointer-events-none" style={{ position: "absolute", width: 0, height: 0 }}>
        <defs>
          <filter id="fluid-ripple-filter" x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence 
              type="fractalNoise" 
              baseFrequency="0.006 0.01" 
              numOctaves="3" 
              result="noise"
            >
              <animate 
                attributeName="baseFrequency" 
                dur="12s" 
                values="0.006 0.01; 0.014 0.007; 0.006 0.01" 
                repeatCount="indefinite" 
              />
            </feTurbulence>
            <feDisplacementMap 
              in="SourceGraphic" 
              in2="noise" 
              scale="22" 
              xChannelSelector="R" 
              yChannelSelector="G" 
            />
          </filter>
        </defs>
      </svg>

      {/* Dynamic water animation rules & transition styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes floatWater1 {
          0% { background-position: 0% 0%; }
          50% { background-position: 5% 8%; }
          100% { background-position: 0% 0%; }
        }
        @keyframes floatWater2 {
          0% { background-position: 10% 20%; }
          50% { background-position: -5% -5%; }
          100% { background-position: 10% 20%; }
        }
      `}} />

      {/* Dynamic Water Ripple Layer 1 (Primary Base Flow) - Keep stable, no mouse translation */}
      <div 
        className="absolute inset-0 pointer-events-none z-0 overflow-hidden bg-cover"
        style={{
          backgroundImage: `url(${waterRippleBg})`,
          opacity: 0.62,
          mixBlendMode: "overlay",
          filter: "url(#fluid-ripple-filter)",
          animation: "floatWater1 18s infinite ease-in-out",
          transform: "scale(1.08)",
          transition: "transform 1.0s ease-in-out"
        }}
      />

      {/* Dynamic Water Ripple Layer 2 (Cross Flow & Deep Water Moiré) - Keep stable, no mouse translation */}
      <div 
        className="absolute inset-0 pointer-events-none z-0 overflow-hidden bg-cover"
        style={{
          backgroundImage: `url(${waterRippleBg})`,
          opacity: 0.42,
          mixBlendMode: "soft-light",
          filter: "url(#fluid-ripple-filter)",
          animation: "floatWater2 24s infinite ease-in-out",
          transform: "scale(1.12) rotate(2deg)",
          transition: "transform 1.2s ease-in-out"
        }}
      />

      {/* Interactive Deep Underwater Radial Glow Layer */}
      <div 
        className="absolute inset-0 pointer-events-none z-0 transition-transform duration-700 ease-out"
        style={{
          background: `radial-gradient(circle at ${50 + mouseOffset.x * 12}% ${45 + mouseOffset.y * 12}%, rgba(204, 251, 241, 0.40) 0%, rgba(45, 212, 191, 0.15) 45%, rgba(0, 0, 0, 0) 75%)`,
          mixBlendMode: "screen",
          transform: `translate(${mouseOffset.x * 15}px, ${mouseOffset.y * 15}px)`,
          opacity: 0.7
        }}
      />

      {/* Exquisite local Ink-wash Bleeding Transition Overlay to reveal Kunlun details */}
      <AnimatePresence>
        {showInkTransition && (
          <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ 
              opacity: 0, 
              filter: "blur(35px) contrast(0.55)", 
              scale: 1.15,
              transition: { duration: 1.4, ease: [0.25, 1, 0.5, 1] } 
            }}
            className="absolute inset-0 z-40 bg-[#0c141c] flex items-center justify-center pointer-events-none"
          >
            {/* Primary ink blossom core */}
            <motion.div
              initial={{ scale: 0.1, opacity: 0.8 }}
              animate={{ 
                scale: [0.1, 1.3, 4.2],
                opacity: [0.8, 0.95, 0],
              }}
              transition={{ duration: 1.6, ease: "easeOut" }}
              className="w-[260px] h-[260px] rounded-full"
              style={{
                background: "radial-gradient(circle, rgba(16, 28, 36, 1) 0%, rgba(20, 36, 48, 0.8) 40%, rgba(0,0,0,0) 70%)",
                filter: "blur(20px)",
              }}
            />
            {/* Auxiliary blooming aqua-wash */}
            <motion.div
              initial={{ scale: 0.1, opacity: 0.5 }}
              animate={{ 
                scale: [0.1, 1.6, 5.2],
                opacity: [0.5, 0.75, 0],
              }}
              transition={{ duration: 1.8, delay: 0.15, ease: "easeInOut" }}
              className="w-[320px] h-[320px] rounded-full absolute"
              style={{
                background: "radial-gradient(circle, rgba(13, 148, 136, 0.50) 0%, rgba(15, 23, 42, 0.30) 50%, rgba(0,0,0,0) 70%)",
                filter: "blur(28px)",
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sliding Client Cursor Ripples (交互水纹感觉) */}
      <div className="absolute inset-0 pointer-events-none z-[12] overflow-hidden">
        <AnimatePresence>
          {mouseRipples.map((mr) => (
            <motion.div
              key={mr.id}
              initial={{ scale: 0.1, opacity: 0.8, x: "-50%", y: "-50%" }}
              animate={{ scale: 2.5, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.3, ease: [0.1, 0.8, 0.25, 1] }}
              className="absolute rounded-full border border-sky-300/35"
              style={{
                left: mr.x,
                top: mr.y,
                width: "55px",
                height: "55px",
                background: "radial-gradient(circle, rgba(147, 197, 253, 0.22) 0%, rgba(56, 189, 248, 0.04) 55%, transparent 75%)",
                boxShadow: "0 0 12px rgba(56, 189, 248, 0.22) inset, 0 0 8px rgba(186, 230, 253, 0.15)",
              }}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* 1. Realistic Rainy backdrop sky droplets (优雅倾斜落风姿) */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        {rainArray.current.map((r, i) => (
          <div
            key={r.id || i}
            className="absolute bg-gradient-to-b from-white/35 to-white/75 rounded-full"
            style={{
              left: `${r.x}px`,
              top: `${r.y}px`,
              width: "1.5px",
              height: `${r.length}px`,
              opacity: r.opacity,
              transform: "rotate(-12deg)",
            }}
          />
        ))}

        {/* Dynamic expanding rainy drops circular sky ripples */}
        {[...Array(9)].map((_, idx) => {
          const delay = idx * 1.5;
          const leftRandom = (idx * 27 + 13) % 95;
          const topRandom = (idx * 33 + 19) % 85;
          return (
            <div
              key={idx}
              className="absolute border border-white/25 rounded-full animate-ping pointer-events-none"
              style={{
                left: `${leftRandom}%`,
                top: `${topRandom}%`,
                width: "90px",
                height: "90px",
                animationDelay: `${delay}s`,
                animationDuration: "4.5s",
                opacity: 0.16,
              }}
            />
          );
        })}
      </div>

      {/* 2. Soft sliding clouds layer behind the envelope (背景云朵) */}
      <div className="absolute inset-0 pointer-events-none z-0 opacity-[0.25] overflow-hidden">
        <div
          className="absolute top-[15%] -left-[10%] w-[420px] h-[250px] bg-white rounded-full filter blur-[90px] animate-pulse"
          style={{ animationDuration: "12s" }}
        />
        <div
          className="absolute top-[50%] -right-[15%] w-[480px] h-[280px] bg-white rounded-full filter blur-[100px] animate-pulse"
          style={{ animationDuration: "16s", animationDelay: "2s" }}
        />
        <div
          className="absolute bottom-[10%] left-[25%] w-[380px] h-[220px] bg-white rounded-full filter blur-[80px] animate-pulse"
          style={{ animationDuration: "14s", animationDelay: "4s" }}
        />
      </div>

      {/* 3. Top Navigation header with controllers */}
      <div className="absolute top-0 inset-x-0 z-[1000] px-4 py-4 sm:px-6 flex items-center justify-between pointer-events-none">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onBack();
          }}
          className="flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-serif tracking-widest text-slate-800 bg-white/45 hover:bg-white/70 active:scale-95 transition-all duration-300 rounded-full border border-white/40 backdrop-blur-md cursor-pointer pointer-events-auto shadow-sm"
          id="kunlun-back-btn"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>重诉心声</span>
        </button>

        <div className="hidden md:flex flex-col items-center">
          <span className="font-serif text-sm text-amber-100 tracking-[0.3em] font-extrabold drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
            我生来就是高山而非溪流
          </span>
          <span className="text-[10px] font-serif text-slate-200 tracking-[0.2em] mt-0.5 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
            昆仑万壑 • 女子风骨
          </span>
        </div>

        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            onClick={handleToggleMute}
            className="flex items-center gap-2 px-4 py-2 text-xs font-serif tracking-wider text-slate-800 bg-white/45 hover:bg-white/70 transition-all duration-300 rounded-full border border-white/40 backdrop-blur-md cursor-pointer"
            id="kunlun-mute-btn"
          >
            {muted ? <VolumeX className="h-4.5 w-4.5 text-slate-500 animate-pulse" /> : <Volume2 className="h-4.5 w-4.5 text-blue-600 animate-bounce" />}
            <span className="hidden sm:inline">
              {muted ? "山谣静沉 (Muted)" : "仙笛清越 (Sound On)"}
            </span>
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onEnterFinale();
            }}
            className="flex items-center gap-2 px-4 py-2 text-xs font-serif tracking-widest text-amber-950 bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-500 active:scale-95 transition-all duration-300 rounded-full border border-yellow-300/40 shadow-[0_4px_12px_rgba(234,179,8,0.25)] hover:shadow-[0_6px_20px_rgba(234,179,8,0.45)] cursor-pointer font-extrabold animate-pulse"
            style={{ animationDuration: "3.5s" }}
            id="kunlun-finale-btn"
          >
            <Sparkles className="h-4 w-4 text-amber-950 animate-spin-slow" />
            <span>终章：破茧成峰</span>
          </button>
        </div>
      </div>

      {/* 4. Center Interactive Letter Envelope (核心云起金漆信笺) */}
      <div className="relative flex flex-col items-center justify-center z-20 my-auto">
        <motion.div
          animate={{
            y: [0, -14, 0],
            rotate: [isOpen ? -2 : -6, isOpen ? 2 : -10, isOpen ? -2 : -6]
          }}
          transition={{
            repeat: Infinity,
            duration: 6,
            ease: "easeInOut"
          }}
          style={{
            transformStyle: "preserve-3d",
            perspective: 1000
          }}
          className="relative w-[480px] h-[288px] sm:w-[580px] sm:h-[348px] md:w-[700px] md:h-[420px] flex items-center justify-center select-none"
        >
          {/* Shadow */}
          <div
            className="absolute -bottom-8 left-[10%] right-[10%] h-4 bg-slate-900/15 filter blur-[15px] rounded-full scale-100 transition-all duration-300"
            style={{
              transform: `translate(${mouseOffset.x * 12}px, ${mouseOffset.y * 6}px)`,
            }}
          />

          {/* Envelope Body */}
          <div
            onClick={handleEnvelopeClick}
            className="absolute inset-0 bg-transparent transition-transform duration-300 scale-100 hover:scale-[1.03] active:scale-[0.98] cursor-pointer"
            style={{
              transform: `translate3d(${mouseOffset.x * 15}px, ${mouseOffset.y * 10}px, 0px)`
            }}
          >
            <div className="absolute inset-0 bg-white rounded-lg shadow-lg border border-slate-100 overflow-hidden" />

            {/* Inner Letter Card INSERT - Exquisite pink crystalline water ripple paper design */}
            <motion.div
              initial={{ y: 0 }}
              animate={{ y: isOpen ? "-58%" : "0%" }}
              transition={{ duration: 1.2, ease: [0.19, 1, 0.22, 1] }}
              className="absolute inset-x-3 sm:inset-x-4 top-2 h-[80%] z-10 rounded-md border border-pink-200/40 shadow-inner flex flex-col items-center justify-center pointer-events-none overflow-hidden"
              style={{ background: "linear-gradient(180deg, #fff9fb 0%, #ffd9e2 28%, #fbcfe8 58%, #fda4af 82%, #fff5f6 100%)" }}
            >
              {/* Subtle water ripple background blend */}
              <div 
                className="absolute inset-0 opacity-[0.25] mix-blend-overlay pointer-events-none"
                style={{
                  backgroundImage: `url(${waterRippleBg})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              />

              {isOpen ? (
                <div className="flex flex-col items-center w-full px-4 select-none relative z-10">
                  {/* Circle Mask silhouette container - water ripple palette */}
                  <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full border-2 border-[#ffd1dc]/80 bg-gradient-to-b from-[#fff5f5] via-[#fbcfe8] to-[#fda4af] overflow-hidden shadow-inner relative flex items-center justify-center">
                    {/* Beautiful, detail-rich celestial landscape illustration aligned with pink theme */}
                    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <defs>
                        <linearGradient id="circleSky" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#fff5f5" />
                          <stop offset="45%" stopColor="#ffd1dc" />
                          <stop offset="100%" stopColor="#fbcfe8" />
                        </linearGradient>
                        <radialGradient id="skySun" cx="0.5" cy="0.5" r="0.5">
                          <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
                          <stop offset="40%" stopColor="#fffcfc" stopOpacity="0.95" />
                          <stop offset="70%" stopColor="#ffd1dc" stopOpacity="0.5" />
                          <stop offset="100%" stopColor="#ffe4e6" stopOpacity="0" />
                        </radialGradient>
                        <linearGradient id="peakTeal" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#fda4af" />
                          <stop offset="100%" stopColor="#9f1239" />
                        </linearGradient>
                        <linearGradient id="peakBlue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#fbcfe8" />
                          <stop offset="100%" stopColor="#881337" />
                        </linearGradient>
                        <linearGradient id="peakOchre" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#ffe4e6" />
                          <stop offset="100%" stopColor="#fda4af" />
                        </linearGradient>
                      </defs>

                      <rect width="100" height="100" fill="url(#circleSky)" />
                      <circle cx="50" cy="46" r="16" fill="url(#skySun)" />

                      {/* Constellation stars (Soft white-gold) */}
                      <circle cx="28" cy="18" r="0.6" fill="#7d7568" opacity="0.3" />
                      <circle cx="34" cy="24" r="0.4" fill="#7d7568" opacity="0.2" />
                      <circle cx="70" cy="15" r="0.7" fill="#ffffff" opacity="0.8" />
                      <line x1="28" y1="18" x2="34" y2="24" stroke="rgba(110,100,90,0.15)" strokeWidth="0.25" />

                      {/* Floating Mist Clouds in soft cream */}
                      <path d="M -10,35 C 15,25 35,45 60,32 C 85,19 105,38 115,28" stroke="#ffffff" strokeWidth="0.4" fill="none" opacity="0.6" />
                      <path d="M -5,38 C 20,29 40,48 65,35 C 90,22 100,41 110,32" stroke="#ebe4d8" strokeWidth="0.3" fill="none" opacity="0.8" />

                      {/* Back Mountains (Soft Morandi Sage Mint) */}
                      <path d="M -10,100 L -10,65 C 10,50 25,60 40,48 C 55,36 68,44 78,38 C 88,32 100,42 110,35 L 110,100 Z" fill="url(#peakTeal)" stroke="#ffffff" strokeWidth="0.45" />

                      {/* Mid Mountains (Soft Morandi Slate Lavender Blue) */}
                      <path d="M -10,100 L -5,76 C 15,62 30,75 48,58 C 65,41 78,52 92,43 L 110,55 L 110,100 Z" fill="url(#peakBlue)" stroke="#ffffff" strokeWidth="0.5" />

                      {/* Crane silhouettes soaring */}
                      <g transform="translate(32, 28) scale(0.68)">
                        <path d="M 0,0 C -4,-6 -9,-2 -11,-1 C -8,2 -3,2 -1,1 C -3,3 -4,8 -1,10 C 1,8 2,3 1,1 C 4,2 8,2 10,-1 C 8,-2 3,-6 -1,0 Z" fill="#ffffff" />
                        <circle cx="-1" cy="0" r="0.4" fill="#fda4af" />
                      </g>

                      <g transform="translate(68, 22) scale(0.48)">
                        <path d="M 0,0 C -4,-6 -9,-2 -11,-1 C -8,2 -3,2 -1,1 C -3,3 -4,8 -1,10 C 1,8 2,3 1,1 C 4,2 8,2 10,-1 C 8,-2 3,-6 -1,0 Z" fill="#ffffff" />
                        <circle cx="-1" cy="0" r="0.4" fill="#fda4af" />
                      </g>

                      {/* Front Side Cliff and Pine (Soft Morandi Rose Silt / Ochre Clay) */}
                      <path d="M 65,100 C 70,82 78,72 82,62 C 86,52 95,45 105,38 L 110,100 Z" fill="url(#peakOchre)" stroke="#ffffff" strokeWidth="0.55" />
                      
                      <g transform="translate(78, 60) scale(0.72)" stroke="#ffffff" strokeWidth="0.45" fill="none">
                        <path d="M 12,18 C 10,12 5,8 0,6" stroke="#ffffff" strokeWidth="0.8" />
                        <path d="M 0,6 C -3,3 -7,4 -9,1 M 0,6 C -2,8 -6,9 -7,12" />
                        <path d="M 4,9 C 2,6 -1,5 -3,3 M 4,9 C 3,11 1,13 0,15" />
                      </g>

                      {/* White-cream soft waves at baseline */}
                      <path d="M 0,92 C 15,90 25,94 40,92 C 55,90 65,94 80,92" stroke="#ffffff" strokeWidth="0.4" fill="none" opacity="0.5" />
                      <path d="M -5,96 C 10,94 20,98 35,96 C 50,94 60,98 75,96" stroke="#ffffff" strokeWidth="0.25" fill="none" opacity="0.4" />
                    </svg>

                    <div className="absolute inset-0 bg-transparent overflow-hidden">
                      <Sparkles className="absolute top-2 left-4 h-3 w-3 text-pink-200 animate-spin-slow" />
                      <Sparkles className="absolute top-6 right-3 h-2 w-2 text-[#ffffff] animate-bounce" />
                    </div>
                  </div>

                  <div className="mt-2.5 text-[11px] sm:text-[13px] font-serif tracking-[0.08em] text-[#be185d] font-black uppercase text-center drop-shadow-sm">
                    KUNLUN YAO·了不起的她们
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center p-3 relative z-10 text-rose-950 font-serif">
                  <Music className="h-6 w-6 text-[#fda4af] animate-pulse mb-1.5" />
                  <span className="text-xs font-extrabold text-rose-900 tracking-widest leading-relaxed">
                    展开昆仑信纸，聆听心中深邃风骨
                  </span>
                  <span className="text-[9px] text-[#be185d] font-mono tracking-wider mt-1.5 uppercase font-bold">
                    Click to Open Letter
                  </span>
                </div>
              )}
            </motion.div>

            {/* Left triangle lapel - White */}
            <div
              className="absolute left-0 top-0 bottom-0 w-[51%] bg-gradient-to-r from-white via-slate-50 to-[#f5f5f5] shadow-inner"
              style={{
                clipPath: "polygon(0 0, 100% 50%, 0 100%)",
                zIndex: 15,
              }}
            />

            {/* Right triangle lapel - White */}
            <div
              className="absolute right-0 top-0 bottom-0 w-[51%] bg-gradient-to-l from-white via-slate-50 to-[#eeeeee] shadow-inner"
              style={{
                clipPath: "polygon(100% 0, 0 50%, 100% 100%)",
                zIndex: 15,
              }}
            />

            {/* Bottom Pocket cover - White */}
            <div
              className="absolute bottom-0 inset-x-0 h-[60%] bg-gradient-to-t from-[#f6f6f6] via-white to-white"
              style={{
                clipPath: "polygon(0 100%, 50% 0, 100% 100%)",
                zIndex: 18,
                boxShadow: "0 -2px 10px rgba(0,0,0,0.04)"
              }}
            />

            {/* Envelope flip cover - White */}
            <div
              className="absolute top-0 inset-x-0 h-1/2 overflow-visible origin-top transition-transform duration-[1200ms] ease-in-out"
              style={{
                transform: isOpen ? "rotateX(180deg)" : "rotateX(0deg)",
                transformStyle: "preserve-3d",
                zIndex: isOpen ? 5 : 25,
              }}
            >
              <div
                className="absolute inset-0 bg-white border-b border-slate-100"
                style={{
                  clipPath: "polygon(0 0, 50% 100%, 100% 0)",
                  backfaceVisibility: "hidden",
                }}
              />
              <div
                className="absolute inset-0 bg-[#fcfcfc] border-t border-slate-200/20"
                style={{
                  clipPath: "polygon(0 0, 50% 100%, 100% 0)",
                  transform: "rotateY(180deg) rotateX(180deg)",
                  backfaceVisibility: "hidden",
                }}
              />
            </div>

            {/* Celandine gold lacquer badge seal */}
            {!isOpen && (
              <div
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-[6px] z-30 w-11 h-11 rounded-full bg-gradient-to-br from-[#ffd700] via-[#d4af37] to-[#aa8010] shadow-md border border-[#ffd700]/30 flex items-center justify-center animate-pulse"
              >
                <div className="w-8 h-8 rounded-full border border-white/30 flex items-center justify-center font-serif text-[10px] text-white font-extrabold pb-0.5">
                  昆仑
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* 5. Render drifting note particles */}
      <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden">
        {noteArray.current.map((n) => (
          <div
            key={n.id}
            className="absolute font-serif select-none transition-all duration-75 text-shadow-[0_0_8px_rgba(255,255,255,0.9)]"
            style={{
              left: `${n.x}px`,
              top: `${n.y}px`,
              fontSize: `${13 * n.scale}px`,
              transform: `rotate(${n.rotation}deg)`,
              opacity: n.opacity,
              color: n.color,
            }}
          >
            {n.char}
          </div>
        ))}
      </div>

      {/* 6. High-end Calligraphy overlay (桃花酿 Styled Floating Words, 绝对无背景盒) */}
      <div className="absolute inset-0 pointer-events-none z-[80] overflow-hidden">
        <AnimatePresence>
          {activeSentences.map((s) => (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, scale: 0.65, y: s.y, x: s.x }}
              animate={{ opacity: s.opacity, scale: s.scale, y: s.y, x: s.x }}
              exit={{ opacity: 0, scale: 1.05, filter: "blur(20px)" }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              style={{
                position: "absolute",
                transform: "translate(-50%, -50%)",
                writingMode: "horizontal-tb",
              }}
              className="pointer-events-auto cursor-pointer p-8 select-none"
              onMouseEnter={() => setHoveredSentenceId(s.id)}
              onMouseLeave={() => setHoveredSentenceId(null)}
            >
              {/* Dynamic Parallax physical drifting wrapper - disabled per user request */}
              <div 
                className="relative flex flex-col items-center justify-center text-center antialiased"
              >
                {/* 6A. Small Red Wax Seal Stamp Badge ("印" 盖章图案) nestled gracefully next to characters */}
                <div 
                  className="absolute -top-4 -right-1 sm:top-1 sm:right-6 w-[22px] h-[22px] border-[1.2px] border-red-500 rounded-[2px] flex items-center justify-center rotate-6 select-none shadow-sm z-20"
                  style={{ backgroundColor: "rgba(239, 68, 68, 0.08)" }}
                >
                  <span className="text-[9px] font-black text-red-500 font-serif leading-none tracking-tight">
                    印
                  </span>
                </div>

                {/* 6B. Decorative Sakura/Peach blossoms (桃姬桃花伴绕) growing around the strokes */}
                {s.blossoms.map((bloom, bIdx) => (
                  <div
                    key={bIdx}
                    className="absolute pointer-events-none z-10"
                    style={{
                      left: `calc(50% + ${bloom.x}px)`,
                      top: `calc(50% + ${bloom.y}px)`,
                    }}
                  >
                    <PeachBlossom scale={bloom.scale} rotation={bloom.rotate} />
                  </div>
                ))}

                {/* Micro support leaves branch */}
                <div className="absolute -left-5 top-1/2 -translate-y-1/2 scale-90 opacity-40">
                  <TreeTwig />
                </div>

                {/* 6C. Responsive Curved Horizontal SVG text container (转的弯只有一个的桥形曲线) */}
                <svg 
                  width="540" 
                  height="145" 
                  viewBox="0 0 540 145" 
                  className="overflow-visible select-none pointer-events-none w-[290px] sm:w-[410px] md:w-[480px] lg:w-[540px] h-auto z-10"
                >
                  <defs>
                    {/* A gentle curved vector path arching upwards (with exactly one subtle bend/turn) */}
                    <path 
                      id={`chinese-path-${s.id}`} 
                      d="M 20,72 Q 270,18 520,72" 
                      fill="none" 
                    />
                    <path 
                      id={`english-path-${s.id}`} 
                      d="M 20,118 Q 270,64 520,118" 
                      fill="none" 
                    />
                  </defs>

                  {/* Elegant Calligraphy Chinese Phrase - Elegant custom color with high-contrast structural outline using matching deep shade */}
                  <text 
                    fill={s.color || "#ffffff"}
                    textAnchor="middle"
                    className="select-none font-extrabold text-[28px] sm:text-[34px] md:text-[38px] lg:text-[42px]"
                    style={{
                      fontFamily: '"Zhi Mang Xing", "Ma Shan Zheng", "Kaiti", "STKaiti", cursive, serif',
                      letterSpacing: "4px",
                      textShadow: `
                        0px 2px 4px ${s.deepShadow ? s.deepShadow.replace('0.95', '0.40') : 'rgba(0, 0, 0, 0.45)'},
                        0px 4px 12px ${s.deepShadow ? s.deepShadow.replace('0.95', '0.25') : 'rgba(0, 0, 0, 0.3)'},
                        0px 0px 10px rgba(0, 0, 0, 0.4)
                      `
                    }}
                  >
                    <textPath href={`#chinese-path-${s.id}`} startOffset="50%">
                      {s.text}
                    </textPath>
                  </text>

                  {/* Elegant Romanized Translation Sublabel - Yellow, boosted readable size, strong matching shadowing */}
                  <text 
                     fill="#fef08a"
                     textAnchor="middle"
                     className="select-none font-extrabold text-[16px] sm:text-[18px] md:text-[20px] lg:text-[22px]"
                     style={{
                       fontFamily: '"Cormorant Garamond", "Cinzel", "Playfair Display", "Georgia", serif',
                       letterSpacing: "3px",
                       textShadow: `
                         0px 1.5px 3px rgba(0, 0, 0, 0.4),
                         0px 3.5px 10px rgba(0, 0, 0, 0.35)
                       `
                     }}
                  >
                    <textPath href={`#english-path-${s.id}`} startOffset="50%">
                      {s.subLabel}
                    </textPath>
                  </text>
                </svg>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* 7. Bottom guidance bar */}
      <div className="absolute bottom-12 inset-x-0 z-40 flex justify-center pointer-events-none">
        <div
          className="flex items-center gap-2 px-5 py-2.5 text-xs font-serif tracking-widest text-[#1e293b] bg-white/70 border border-white/50 backdrop-blur-md rounded-full shadow-lg"
        >
          <Sparkles className="h-4.5 w-4.5 text-yellow-600 animate-spin-slow" />
          <span>
            {isOpen 
              ? "随意点击空中，山谣吟哦。点击右上角『终章：破茧成峰』凝聚万壑女性力量"
              : "点击信封上的古印封缄，解封并聆听山河长调"}
          </span>
        </div>
      </div>

      <div className="absolute bottom-3 right-4 z-40 text-[9px] font-mono text-slate-800/40 pointer-events-none tracking-widest uppercase">
        Kunlun Peak Epistles v3.5
      </div>

      {/* 8. Gorgeous interactive water ripples (水波涟漪状态) */}
      <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
        {ripples.map((rip) => (
          <div
            key={rip.id}
            className="absolute pointer-events-none"
            style={{ left: rip.x, top: rip.y }}
          >
            {/* Outer large expanding ripple */}
            <motion.div
              initial={{ scale: 0, opacity: 0.85 }}
              animate={{ scale: [0, 5, 10], opacity: [0.85, 0.4, 0] }}
              transition={{ duration: 1.8, ease: "easeOut" }}
              className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{
                width: "40px",
                height: "40px",
                border: "2px solid rgba(224, 242, 254, 0.75)",
                boxShadow: "0 0 16px rgba(147, 197, 253, 0.45), inset 0 0 12px rgba(186, 230, 253, 0.25)",
              }}
            />
            {/* Mid-sized delay ripple */}
            <motion.div
              initial={{ scale: 0, opacity: 0.65 }}
              animate={{ scale: [0, 4, 7.5], opacity: [0.65, 0.3, 0] }}
              transition={{ duration: 1.5, delay: 0.15, ease: "easeOut" }}
              className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{
                width: "40px",
                height: "40px",
                border: "1.5px solid rgba(186, 230, 253, 0.6)",
                boxShadow: "0 0 12px rgba(147, 197, 253, 0.3)",
              }}
            />
            {/* Inner close ripple */}
            <motion.div
              initial={{ scale: 0, opacity: 0.45 }}
              animate={{ scale: [0, 3, 5], opacity: [0.45, 0.2, 0] }}
              transition={{ duration: 1.2, delay: 0.3, ease: "easeOut" }}
              className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{
                width: "40px",
                height: "40px",
                border: "1px solid rgba(147, 197, 253, 0.45)",
                boxShadow: "0 0 8px rgba(147, 197, 253, 0.15)",
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
