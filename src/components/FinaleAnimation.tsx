import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, RefreshCw, Volume2, VolumeX, ArrowLeft, Play } from "lucide-react";

// The idioms requested by the user, expanded with new warm and inspiring descriptions
const IDIOMS = [
  "薪火相传", "芳华永续", "绵绵不绝", "静水流深", "蕙质松骨", 
  "柔而有锋", "自拔流俗", "玉骨凌霜", "卓立峰峦", "破茧成峰", 
  "清和有骨", "婉而有锋", "芳脉绵延",
  "蕙心明断", "澄心有度", "自有千秋", "内外兼辉", "自持本心", 
  "巾帼凌云", "灵韵长存", "岁岁芳华", "川流不绝", "卓峙云巅", 
  "层峦藏锋", "静澜藏智", "破茧昭华", "坤厚载光", "清标傲雪", 
  "襟怀万里"
];

const pinkLilyBg = "/src/assets/images/pink_lily_bg_1782277330197.jpg";

// Single characters extracted from idioms for a rich flow similar to the video's letters
const SINGLE_CHARS = Array.from(new Set(IDIOMS.join("").split("")));

interface FinaleAnimationProps {
  onBackToKunlun: () => void;
}

// Particle interface for high-fps canvas simulation
interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  color: string;
  decay: number;
  rotation: number;
  rotSpeed: number;
  type: "dust" | "star" | "char" | "heart" | "petal" | "sparkle";
  text?: string;
  scale?: number;
  glow?: boolean;
  trail?: { x: number; y: number }[];
}

// BloomingFlower interface for gorgeous vector art blooms
interface BloomingFlower {
  id: number;
  x: number;
  y: number;
  size: number;
  maxSize: number;
  rotation: number;
  rotSpeed: number;
  growth: number; // 0 to 1
  petals: number;
  petalColor: string;
  alpha: number;
  pulsePhase: number;
  decaySpeed: number;
  life: number;
  bloomSpeed: number;
  swayWidth: number;
  swaySpeed: number;
  baseX: number;
}

// 3D Floating Idioms for authentic depth and cinematic parallax
interface Idiom3D {
  text: string;
  x3d: number;      // -width/2 to width/2
  y3d: number;      // -height/2 to height/2
  z3d: number;      // depth: 0.1 to 3.0 (drifts closer as z3d decreases)
  rotation: number;
  rotSpeed: number;
  pulsePhase: number;
  opacity: number;
  scaleMultiplier: number;
  colorType: number; // For slight gold-to-peach variations
  sparkTime: number; // Highlight animation when swept over
  blur?: number;     // Cinematic camera lens blur
}

// Interactive realistic liquid glass water ripple
interface WaterRipple {
  id: number;
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  life: number;
  decay: number;
  type: "trail" | "wave";
}

export default function FinaleAnimation({ onBackToKunlun }: FinaleAnimationProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  
  const [muted, setMuted] = useState(false);
  const [isSweepActive, setIsSweepActive] = useState(true);
  const [showInstruction, setShowInstruction] = useState(true);
  const [titlePhase, setTitlePhase] = useState<"hidden" | "center" | "settled">("hidden");
  const hasTriggeredCenterTitle = useRef(false);
  
  const audioCtxRef = useRef<AudioContext | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const idioms3DRef = useRef<Idiom3D[]>([]);
  const waterRipplesRef = useRef<WaterRipple[]>([]);
  const mouseRef = useRef({ x: 0, y: 0, lastX: 0, lastY: 0, isDown: false, active: false });
  const waterTrailRef = useRef<{ x: number; y: number; life: number; width: number }[]>([]);
  
  const waterRippleIdCounterRef = useRef(0);
  
  // Sweep coordinate control
  const sweepRef = useRef({
    currentX: -200,
    targetX: -200,
    speed: 15,
    active: false,
    trailParticles: 0
  });

  const particleIdCounterRef = useRef(0);
  
  // High-fidelity blooming flower, timer, and transformation progress refs
  const bloomingFlowersRef = useRef<BloomingFlower[]>([]);
  const titleVisibleTimeRef = useRef<number | null>(null);
  const bloomTriggeredRef = useRef<boolean>(false);
  const bloomProgressRef = useRef<number>(0);

  // Single particle spawner accessible throughout component scope
  const spawnParticle = (
    x: number,
    y: number,
    vx: number,
    vy: number,
    type: "dust" | "star" | "char" | "heart" | "petal" | "sparkle",
    text = "",
    customColor?: string
  ) => {
    const scale = 0.4 + Math.random() * 0.8;
    const decay = 0.005 + Math.random() * 0.008;
    const size = type === "char" ? 14 : type === "star" ? 6 : type === "heart" ? 8 : type === "petal" ? 10 : type === "sparkle" ? 12 : 2;

    let colorBase = "";
    if (customColor) {
      if (customColor.startsWith("#")) {
        const r = parseInt(customColor.slice(1, 3), 16);
        const g = parseInt(customColor.slice(3, 5), 16);
        const b = parseInt(customColor.slice(5, 7), 16);
        colorBase = `rgba(${r}, ${g}, ${b}, `;
      } else if (customColor.startsWith("rgba(")) {
        colorBase = customColor;
      } else {
        colorBase = customColor + ", ";
      }
    } else {
      // Pure glowing white, soft rose pink, and rich gold colors matching the pink lily theme
      const colors = [
        "rgba(255, 255, 255, ", // Pure glowing white
        "rgba(251, 207, 232, ", // soft pink (pink-200)
        "rgba(244, 114, 182, ", // warm pink (pink-400)
        "rgba(251, 113, 133, ", // glowing rose (rose-400)
        "rgba(254, 240, 138, ", // soft yellow-200
        "rgba(253, 224, 71, ",  // golden light-300
        "rgba(234, 179, 8, "    // rich amber gold-500
      ];
      colorBase = colors[Math.floor(Math.random() * colors.length)];
    }

    particlesRef.current.push({
      id: particleIdCounterRef.current++,
      x,
      y,
      vx,
      vy,
      size,
      alpha: 0.95 + Math.random() * 0.05,
      color: colorBase,
      decay,
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.05,
      type,
      text,
      scale,
      glow: true,
      trail: []
    });
  };

  // Spawns interactive liquid water trail droplets or expanding waves
  const spawnWaterRipple = (x: number, y: number, type: "trail" | "wave") => {
    const isWave = type === "wave";
    const radius = isWave ? 2 : 10 + Math.random() * 5;
    const maxRadius = isWave ? 50 + Math.random() * 25 : 18 + Math.random() * 6;
    const decay = isWave ? 0.012 : 0.018 + Math.random() * 0.006;
    
    waterRipplesRef.current.push({
      id: waterRippleIdCounterRef.current++,
      x,
      y,
      radius,
      maxRadius,
      alpha: 1.0,
      life: 1.0,
      decay,
      type
    });
  };

  // Adds a point to the continuous water trail, with smart interpolation for fluid smoothness
  const addWaterTrailPoint = (x: number, y: number) => {
    // Disabled to remove the white water trail line completely on mouse movement
  };

  // Web Audio Context initialization
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

  // Play a gorgeous high-pitched golden chime sound matching particle bursts
  const playGoldenChime = (freq: number, gainVal: number = 0.12) => {
    if (muted) return;
    try {
      const ctx = initAudio();
      if (!ctx) return;
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const oscHarmonic = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now);
      
      oscHarmonic.type = "triangle";
      oscHarmonic.frequency.setValueAtTime(freq * 2.02, now); // Beautiful high overtone

      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(gainVal, now + 0.006);
      gainNode.gain.exponentialRampToValueAtTime(gainVal * 0.15, now + 0.18);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 1.4);

      osc.connect(gainNode);
      oscHarmonic.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start(now);
      oscHarmonic.start(now);
      osc.stop(now + 1.5);
      oscHarmonic.stop(now + 1.5);
    } catch (e) {
      // Audio autoplay restrictions catch-all
    }
  };

  // Triggers a magical sound arpeggio representing transition celebration
  const playMagicalArpeggio = () => {
    const freqs = [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98];
    freqs.forEach((freq, i) => {
      setTimeout(() => {
        playGoldenChime(freq, 0.06 - i * 0.005);
      }, i * 80);
    });
  };

  // Play a gorgeous cinematic chime sound when the title reveals in the center
  const playCenterTitleSound = () => {
    if (muted) return;
    try {
      const ctx = initAudio();
      if (!ctx) return;
      const now = ctx.currentTime;

      // Soft, majestic deep pad chord
      const oscLow = ctx.createOscillator();
      const gainLow = ctx.createGain();
      oscLow.type = "sine";
      oscLow.frequency.setValueAtTime(110.00, now); // Low A bass frequency
      gainLow.gain.setValueAtTime(0, now);
      gainLow.gain.linearRampToValueAtTime(0.20, now + 0.3);
      gainLow.gain.exponentialRampToValueAtTime(0.001, now + 3.0);
      oscLow.connect(gainLow);
      gainLow.connect(ctx.destination);
      oscLow.start(now);
      oscLow.stop(now + 3.1);

      // Sparkling arpeggiated bells chord (A major)
      const freqs = [440.00, 554.37, 659.25, 880.00];
      freqs.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + i * 0.08);
        gain.gain.setValueAtTime(0, now + i * 0.08);
        gain.gain.linearRampToValueAtTime(0.08, now + i * 0.08 + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.08 + 2.0);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + i * 0.08);
        osc.stop(now + i * 0.08 + 2.1);
      });
    } catch (e) {}
  };

  // Starts a high-fidelity white-gold sweep across the screen from left to right
  const triggerHorizontalSweep = () => {
    sweepRef.current.currentX = -250;
    sweepRef.current.targetX = window.innerWidth + 250;
    sweepRef.current.active = true;
    hasTriggeredCenterTitle.current = false;
    setTitlePhase("hidden");
    playMagicalArpeggio();
    
    // Spark idioms' highlight phases on sweep trigger
    idioms3DRef.current.forEach((idiom, idx) => {
      setTimeout(() => {
        idiom.sparkTime = 30; // 30 frames highlight
      }, idx * 120);
    });
  };

  // Initialize the 13 Idioms with 3D coordinate depth
  const initializeIdioms3D = (width: number, height: number) => {
    idioms3DRef.current = IDIOMS.map((text, idx) => {
      // Distribute evenly in a cylindrical space
      const angle = (idx / IDIOMS.length) * Math.PI * 2;
      const radiusX = width * 0.32 + Math.random() * (width * 0.08);
      const radiusY = height * 0.25 + Math.random() * (height * 0.08);
      
      return {
        text,
        x3d: Math.cos(angle) * radiusX,
        y3d: Math.sin(angle) * radiusY + (Math.random() * 80 - 40),
        z3d: 0.3 + (idx / IDIOMS.length) * 2.5, // Spread along Z axis
        rotation: (Math.random() - 0.5) * 0.2,
        rotSpeed: (Math.random() - 0.5) * 0.003,
        pulsePhase: Math.random() * Math.PI * 2,
        opacity: 0,
        scaleMultiplier: 0.8 + Math.random() * 0.4,
        colorType: idx % 3,
        sparkTime: 0
      };
    });
  };

  useEffect(() => {
    // Hide instruction alert after 4 seconds
    const timer = setTimeout(() => {
      setShowInstruction(false);
    }, 4500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Vector illustration rendering for organic, luxurious blooming flowers mimicking hand-drawn watercolor art
    const drawBloomingFlower = (ctx: CanvasRenderingContext2D, f: BloomingFlower) => {
      ctx.save();
      
      // Gentle horizontal swaying motion along with physical translations
      ctx.translate(f.x, f.y);
      ctx.rotate(f.rotation + Math.sin(f.pulsePhase * 0.8) * 0.05);
      
      ctx.globalAlpha = f.alpha;

      // Outer soft watercolor atmospheric bloom glow
      ctx.shadowBlur = (12 + Math.sin(f.pulsePhase) * 4) * (f.maxSize / 35);
      ctx.shadowColor = f.petalColor;

      // 1. Draw sage-green & light blue watercolor leaves behind the flower
      ctx.save();
      const leafCount = 2;
      for (let j = 0; j < leafCount; j++) {
        // Let the leaves stick out organically to the bottom-left and bottom-right
        const angle = (j === 0 ? -Math.PI * 0.65 : Math.PI * 0.5) + Math.sin(f.pulsePhase * 0.4) * 0.06;
        ctx.save();
        ctx.rotate(angle);
        
        // Leaf size increases with flower bloom size
        const leafSize = f.maxSize * 1.05 * Math.sin(f.growth * Math.PI * 0.5);
        if (leafSize > 2) {
          // Dual-tone green and soft sky blue watercolor wash gradient
          const leafGrad = ctx.createLinearGradient(0, 0, 0, -leafSize);
          leafGrad.addColorStop(0, "rgba(254, 240, 138, 0.15)"); // tender yellow-green core
          leafGrad.addColorStop(0.55, "rgba(134, 239, 172, 0.65)"); // soft sage green
          leafGrad.addColorStop(0.85, "rgba(125, 211, 252, 0.55)"); // elegant watercolor sky blue tip
          leafGrad.addColorStop(1, "rgba(56, 189, 248, 0)");
          
          ctx.fillStyle = leafGrad;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.bezierCurveTo(-leafSize * 0.28, -leafSize * 0.35, -leafSize * 0.14, -leafSize * 0.85, 0, -leafSize);
          ctx.bezierCurveTo(leafSize * 0.14, -leafSize * 0.85, leafSize * 0.28, -leafSize * 0.35, 0, 0);
          ctx.fill();

          // Hand-painted, delicate watercolor dark green outline
          ctx.strokeStyle = "rgba(22, 101, 52, 0.38)";
          ctx.lineWidth = 0.9;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.bezierCurveTo(-leafSize * 0.28, -leafSize * 0.35, -leafSize * 0.14, -leafSize * 0.85, 0, -leafSize);
          ctx.bezierCurveTo(leafSize * 0.14, -leafSize * 0.85, leafSize * 0.28, -leafSize * 0.35, 0, 0);
          ctx.stroke();

          // Leaf central vein line
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(0, -leafSize * 0.75);
          ctx.stroke();
        }
        ctx.restore();
      }
      ctx.restore();

      // Helper function to draw a single translucent dewdrop with specular reflection
      const drawDewdrop = (cx: number, cy: number, r: number) => {
        ctx.save();
        ctx.translate(cx, cy);
        
        const dropGrad = ctx.createRadialGradient(-r * 0.3, -r * 0.3, r * 0.05, 0, 0, r);
        dropGrad.addColorStop(0, "rgba(255, 255, 255, 0.98)");
        dropGrad.addColorStop(0.25, "rgba(224, 242, 254, 0.55)"); // watery blue
        dropGrad.addColorStop(0.75, "rgba(56, 189, 248, 0.25)");
        dropGrad.addColorStop(1, "rgba(14, 165, 233, 0.65)");
        
        ctx.fillStyle = dropGrad;
        ctx.beginPath();
        ctx.moveTo(0, -r);
        ctx.bezierCurveTo(-r, -r * 0.5, -r, r, 0, r);
        ctx.bezierCurveTo(r, r, r, -r * 0.5, 0, -r);
        ctx.fill();
        
        // Tiny white reflection spark
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(-r * 0.28, -r * 0.28, r * 0.18, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      };

      // Helper function to draw a gorgeous 4-pointed star sparkle matching the first reference image
      const drawSparkleStar = (cx: number, cy: number, r: number, opacity: number) => {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.globalAlpha = opacity;
        
        const starGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, r);
        starGrad.addColorStop(0, "rgba(255, 255, 255, 0.98)");
        starGrad.addColorStop(0.35, "rgba(186, 230, 253, 0.85)"); // soft powder-blue highlight
        starGrad.addColorStop(1, "rgba(56, 189, 248, 0)");
        ctx.fillStyle = starGrad;
        
        ctx.beginPath();
        ctx.moveTo(0, -r);
        ctx.quadraticCurveTo(0, 0, r, 0);
        ctx.quadraticCurveTo(0, 0, 0, r);
        ctx.quadraticCurveTo(0, 0, -r, 0);
        ctx.quadraticCurveTo(0, 0, 0, -r);
        ctx.fill();
        ctx.restore();
      };

      // 2. Staggered Bloom Layers for realistic petal unfolding (Pop/Bloom effect)
      // Outer layer unfolds first, followed by the middle and inner layers sequentially
      const layers = [
        { scale: 1.0, opacity: 0.88, rotOffset: 0, shadowBlur: 10, growth: Math.min(1.0, f.growth * 1.15) },
        { scale: 0.76, opacity: 0.96, rotOffset: Math.PI / f.petals, shadowBlur: 6, growth: Math.max(0, Math.min(1.0, (f.growth - 0.22) * 1.35)) },
        { scale: 0.54, opacity: 1.0, rotOffset: 0, shadowBlur: 3, growth: Math.max(0, Math.min(1.0, (f.growth - 0.48) * 1.95)) }
      ];

      layers.forEach((layer) => {
        if (layer.growth <= 0) return;
        ctx.save();
        ctx.rotate(layer.rotOffset);
        
        const layerSize = f.maxSize * layer.scale * Math.sin(layer.growth * Math.PI * 0.5);
        const darkerShadesMap: Record<string, string> = {
          "#e05a8d": "#901e4a",
          "#e86b97": "#9c2151",
          "#f472b6": "#9d174d",
          "#ec4899": "#9d174d",
          "#db2777": "#831843",
          "#f05c8d": "#9a1845",
          "#ff739b": "#a21b4a"
        };
        const darkerPetalColor = darkerShadesMap[f.petalColor] || "#9f1239";

        // Beautiful radial watercolor bleeding gradient inside the petal body
        const petalGrad = ctx.createRadialGradient(0, 0, layerSize * 0.1, 0, 0, layerSize);
        petalGrad.addColorStop(0, "#ffffff"); // Soft white central core
        petalGrad.addColorStop(0.42, f.petalColor); // Main pastel pink/rose watercolor shade
        petalGrad.addColorStop(1, darkerPetalColor); // Rich bleeding edge contour
        ctx.fillStyle = petalGrad;

        ctx.shadowBlur = layer.shadowBlur;
        ctx.shadowColor = "rgba(76, 5, 25, 0.15)";

        const petalCount = f.petals;
        for (let i = 0; i < petalCount; i++) {
          ctx.save();
          ctx.rotate((Math.PI * 2) / petalCount * i);
          
          // Lily-shaped slender petals flared at the sides and reflexed at the tip
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.bezierCurveTo(
            -layerSize * 0.36, -layerSize * 0.35,
            -layerSize * 0.42, -layerSize * 0.78,
            0, -layerSize
          );
          ctx.bezierCurveTo(
            layerSize * 0.42, -layerSize * 0.78,
            layerSize * 0.36, -layerSize * 0.35,
            0, 0
          );
          ctx.fill();

          // Darker hand-painted watercolor bleeding outline around each petal
          ctx.strokeStyle = darkerPetalColor + "95"; // semi-transparent outline
          ctx.lineWidth = 1.1;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.bezierCurveTo(
            -layerSize * 0.36, -layerSize * 0.35,
            -layerSize * 0.42, -layerSize * 0.78,
            0, -layerSize
          );
          ctx.bezierCurveTo(
            layerSize * 0.42, -layerSize * 0.78,
            layerSize * 0.36, -layerSize * 0.35,
            0, 0
          );
          ctx.stroke();

          // Delicate hand-painted crimson specks/stipples along the central vein (just like the lily reference)
          ctx.fillStyle = darkerPetalColor + "a8";
          const flecks = 5;
          for (let k = 0; k < flecks; k++) {
            const fleckY = -layerSize * (0.28 + (k / flecks) * 0.46);
            const fleckX = (Math.sin(fleckY * 0.08) + (Math.random() - 0.5) * 0.2) * (layerSize * 0.05);
            ctx.beginPath();
            ctx.arc(fleckX, fleckY, 1.25, 0, Math.PI * 2);
            ctx.fill();
          }

          // Central petal vein line
          ctx.strokeStyle = "rgba(254, 240, 138, 0.42)";
          ctx.lineWidth = 0.65;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(0, -layerSize * 0.75);
          ctx.stroke();

          ctx.restore();
        }
        ctx.restore();
      });

      // 3. Draw a soft light sky blue & lavender watercolor throat overlay at the core
      if (f.growth > 0.15) {
        ctx.save();
        const throatRadius = f.maxSize * 0.38 * Math.sin(f.growth * Math.PI * 0.5);
        const throatGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, throatRadius);
        throatGrad.addColorStop(0, "rgba(186, 230, 253, 0.78)"); // pastel blue center from first image
        throatGrad.addColorStop(0.48, "rgba(196, 181, 253, 0.42)"); // lavender bleed
        throatGrad.addColorStop(1, "rgba(196, 181, 253, 0)");
        ctx.fillStyle = throatGrad;
        ctx.beginPath();
        ctx.arc(0, 0, throatRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // 4. Draw detailed curved lily stamens shooting gracefully from the core
      const innerScale = layers[2].growth;
      if (innerScale > 0.1) {
        ctx.save();
        const stamenCount = 5;
        ctx.strokeStyle = "rgba(132, 204, 22, 0.75)"; // soft lime-green watercolor stalks
        ctx.lineWidth = 1.1;
        
        const currentSize = f.maxSize * innerScale;
        for (let i = 0; i < stamenCount; i++) {
          // Semi-asymmetrical spread pointing slightly upwards/sideways
          const stamenAngle = -Math.PI / 2 + (i - 2) * 0.36 + Math.sin(f.pulsePhase * 0.7) * 0.04;
          const length = currentSize * 0.48;
          
          // Bezier control points for exquisite curved look
          const cp1x = Math.cos(stamenAngle - 0.22) * (length * 0.45);
          const cp1y = Math.sin(stamenAngle - 0.22) * (length * 0.45);
          const cp2x = Math.cos(stamenAngle + 0.18) * (length * 0.82);
          const cp2y = Math.sin(stamenAngle + 0.18) * (length * 0.82);
          
          const endX = Math.cos(stamenAngle) * length;
          const endY = Math.sin(stamenAngle) * length;
          
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, endX, endY);
          ctx.stroke();
          
          // Pill-shaped maroon anthers at the stamen tip
          ctx.save();
          ctx.translate(endX, endY);
          ctx.rotate(stamenAngle + Math.PI / 2);
          
          ctx.fillStyle = "#451a03"; // deep dark reddish-brown
          ctx.beginPath();
          ctx.ellipse(0, 0, 3.4, 1.9, 0, 0, Math.PI * 2);
          ctx.fill();
          
          // Anther bright golden glow highlight
          ctx.fillStyle = "#d97706";
          ctx.beginPath();
          ctx.ellipse(-1.1, -0.6, 1.6, 0.85, 0, 0, Math.PI * 2);
          ctx.fill();
          
          ctx.restore();
        }
        ctx.restore();
      }

      // 5. Draw physical dewdrops on the petals once partially bloomed
      if (f.growth > 0.72) {
        ctx.save();
        const currentSize = f.maxSize * f.growth;
        
        // Hanging droplet on bottom right petal
        ctx.save();
        ctx.rotate(Math.PI * 0.35);
        drawDewdrop(0, -currentSize * 0.72, 3.6);
        ctx.restore();
        
        // Dripping droplet on bottom left petal
        ctx.save();
        ctx.rotate(-Math.PI * 0.28);
        drawDewdrop(0, -currentSize * 0.82, 4.4);
        ctx.restore();
        
        ctx.restore();
      }

      // 6. Draw the beautiful floating 4-pointed blue watercolor star sparkle below the flower
      if (f.growth > 0.45) {
        const currentSize = f.maxSize * f.growth;
        const sparkleY = currentSize * 1.15 + Math.sin(f.pulsePhase * 1.3) * 4.5;
        const sparkleX = Math.cos(f.pulsePhase * 0.8) * 8.0;
        drawSparkleStar(sparkleX, sparkleY, 13 * f.growth, 0.75 * f.alpha);
      }

      ctx.restore();
    };

    // Initial 3D Idioms setup
    initializeIdioms3D(width, height);

    // Initial automatically-triggered sweep
    triggerHorizontalSweep();

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initializeIdioms3D(width, height);
    };
    window.addEventListener("resize", handleResize);

    // Grid Dot Pattern Matrix (Highly precise matching the video's cobalt blue dot coordinate array)
    const gridSpacing = 40;
    const gridCols = Math.floor(width / gridSpacing) + 2;
    const gridRows = Math.floor(height / gridSpacing) + 2;
    const gridDots: { cx: number; cy: number; maxAlpha: number; phase: number; speed: number }[] = [];

    for (let c = 0; c < gridCols; c++) {
      for (let r = 0; r < gridRows; r++) {
        // Build rows of coordinates (matching the tech-art matrix grid)
        gridDots.push({
          cx: c * gridSpacing,
          cy: r * gridSpacing,
          maxAlpha: 0.14 + Math.random() * 0.16,
          phase: Math.random() * Math.PI * 2,
          speed: 0.01 + Math.random() * 0.015
        });
      }
    }

    // Frame Core Loop
    const render = () => {
      // 1. Clear rectangular canvas to show the beautiful pink lily background image underneath
      ctx.clearRect(0, 0, width, height);

      // Radial glowing spotlight overlay for cinematic lighting and depth
      const radialGlow = ctx.createRadialGradient(
        width * 0.5,
        height * 0.5,
        100,
        width * 0.5,
        height * 0.5,
        width * 0.85
      );
      radialGlow.addColorStop(0, "rgba(253, 244, 245, 0.05)");   // translucent soft white-rose
      radialGlow.addColorStop(0.5, "rgba(244, 114, 182, 0.08)");  // glowing pink
      radialGlow.addColorStop(1, "rgba(251, 113, 133, 0.18)");    // deeper rose-pink borders
      ctx.fillStyle = radialGlow;
      ctx.fillRect(0, 0, width, height);

      // 2. Draw the matrix dot pattern grid (Shimmering tech-art look in soft pink)
      gridDots.forEach((dot) => {
        dot.phase += dot.speed;
        const alpha = dot.maxAlpha + Math.sin(dot.phase) * 0.08;
        
        ctx.fillStyle = `rgba(244, 114, 182, ${Math.max(0.01, alpha * 0.85)})`;
        ctx.beginPath();
        ctx.arc(dot.cx, dot.cy, 1.1, 0, Math.PI * 2);
        ctx.fill();

        // Elegant double-dot accents (replicates professional visual blueprints)
        if (dot.cx % 160 === 0 && dot.cy % 160 === 0) {
          ctx.strokeStyle = `rgba(244, 114, 182, ${alpha * 0.4})`;
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.arc(dot.cx, dot.cy, 5, 0, Math.PI * 2);
          ctx.stroke();

          // Subtle horizontal dotted line connection
          ctx.strokeStyle = `rgba(244, 114, 182, 0.03)`;
          ctx.beginPath();
          ctx.moveTo(dot.cx - 20, dot.cy);
          ctx.lineTo(dot.cx + 20, dot.cy);
          ctx.stroke();
        }
      });

      // 3. Process Left-to-Right Organic Flowing Wind Breeze Wave
      const sweep = sweepRef.current;
      if (sweep.active) {
        sweep.currentX += sweep.speed;

        // Trigger cinematic center-stage title entrance as the wind breeze sweeps past center-left
        if (sweep.currentX > width * 0.4 && !hasTriggeredCenterTitle.current) {
          hasTriggeredCenterTitle.current = true;
          setTitlePhase("center");
          playCenterTitleSound();
        }
        
        // Render 3 independent flowing breeze lines/currents (Flow Ribbons)
        const drawDynamicWindStream = (offsetRatio: number, amp: number, freq: number, thickness: number, opacity: number, speedMult: number) => {
          ctx.save();
          ctx.shadowBlur = 30;
          ctx.shadowColor = "rgba(255, 230, 235, 0.75)"; // Soft glowing rose-white
          
          // Linear gradient for a fade-in, fade-out ribbon trail
          const ribbonGrad = ctx.createLinearGradient(sweep.currentX - 350, 0, sweep.currentX + 50, 0);
          ribbonGrad.addColorStop(0, "rgba(255, 255, 255, 0)");
          ribbonGrad.addColorStop(0.35, `rgba(254, 244, 245, ${opacity * 0.6})`);
          ribbonGrad.addColorStop(0.8, `rgba(255, 255, 255, ${opacity})`);
          ribbonGrad.addColorStop(1, "rgba(255, 255, 255, 0)");
          
          ctx.strokeStyle = ribbonGrad;
          ctx.lineWidth = thickness;
          ctx.beginPath();
          
          const startX = Math.max(0, sweep.currentX - 450);
          const endX = Math.min(width, sweep.currentX + 100);
          
          for (let x = startX; x <= endX; x += 10) {
            // Elegant liquid double-sine wave equation representing air currents
            const waveY = height * offsetRatio + 
              Math.sin(x * freq - sweep.currentX * 0.009 * speedMult) * amp +
              Math.cos(x * freq * 2.2 + sweep.currentX * 0.004) * (amp * 0.25);
              
            if (x === startX) {
              ctx.moveTo(x, waveY);
            } else {
              ctx.lineTo(x, waveY);
            }
          }
          ctx.stroke();
          ctx.restore();
        };

        // Draw 3 layers of magical wind ribbons representing the breath of Kunlun
        drawDynamicWindStream(0.35, 55, 0.0028, 2.2, 0.55, 1.25);
        drawDynamicWindStream(0.50, 40, 0.0035, 1.4, 0.40, 0.90);
        drawDynamicWindStream(0.65, 65, 0.0022, 1.8, 0.48, 1.15);

        // Spawn a rich dense trail of sparks along the multiple wind stream coordinates
        const spawnPerFrame = 9;
        for (let j = 0; j < spawnPerFrame; j++) {
          const spawnY = height * (0.25 + Math.random() * 0.5);
          
          // Calculate curved sweep X with small organic noise offsets
          const sampleY = spawnY;
          const curveOffset = Math.sin(sweep.currentX * 0.003 + sampleY * 0.002) * 40;
          const spawnX = sweep.currentX + curveOffset + (Math.random() * 60 - 30);

          // Velocity: particles flying gracefully with the breeze
          const vx = (3.0 + Math.random() * 5.0); 
          const vy = (Math.random() - 0.5) * 2.4;

          const rand = Math.random();
          let type: "dust" | "star" | "char" = "dust";
          let text = "";

          if (rand < 0.4) {
            type = "dust";
          } else if (rand < 0.78) {
            type = "star";
          } else {
            type = "char";
            text = SINGLE_CHARS[Math.floor(Math.random() * SINGLE_CHARS.length)];
          }

          spawnParticle(spawnX, spawnY, vx, vy, type, text);
        }

        // Complete sweep check
        if (sweep.currentX > width + 250) {
          sweep.active = false;
        }
      }

      // 4. Update and Project 3D Floating Idioms (Elegantly drifting and swaying in space)
      const idioms3D = idioms3DRef.current;
      idioms3D.forEach((idiom) => {
        // Move slowly forward along Z axis (z3d decreases to move closer to the camera)
        idiom.z3d -= 0.0028; // Elegant forward speed
        idiom.rotation += idiom.rotSpeed;
        idiom.pulsePhase += 0.015;

        // Gentle elegant 3D waving drift
        idiom.x3d += Math.sin(idiom.pulsePhase * 0.4) * 0.12;
        idiom.y3d += Math.cos(idiom.pulsePhase * 0.3) * 0.08;

        // Reset if too close to screen, infinite seamless cycle
        if (idiom.z3d <= 0.12) {
          idiom.z3d = 2.8;
          idiom.x3d = (Math.random() - 0.5) * (width * 0.7);
          idiom.y3d = (Math.random() - 0.5) * (height * 0.5);
          idiom.opacity = 0;
        }

        // Projection formulas (3D coordinates to 2D screen coordinate projection)
        const focalLength = 320;
        const scale = focalLength / (focalLength * idiom.z3d);
        
        // Add subtle natural organic sway offsets for "fluid motion"
        const swayX = Math.sin(idiom.pulsePhase * 0.8) * 15;
        const swayY = Math.cos(idiom.pulsePhase * 0.6) * 12;

        const projX = width / 2 + (idiom.x3d + swayX) * scale;
        const projY = height / 2 + (idiom.y3d + swayY) * scale;

        // Fade in when far, stay bright, and fade out when extremely close to camera
        let targetOpacity = 1;
        if (idiom.z3d > 2.2) {
          // Far away, fade in
          targetOpacity = (2.8 - idiom.z3d) / 0.6;
        } else if (idiom.z3d < 0.4) {
          // Very close, fade out gracefully
          targetOpacity = (idiom.z3d - 0.12) / 0.28;
        }
        
        // Slowly fade the idioms out entirely if the blooming transition has started
        targetOpacity *= (1 - bloomProgressRef.current);
        
        idiom.opacity = Math.max(0, Math.min(1, targetOpacity));

        // Highlight/Spark flash if sweep passes over it
        if (idiom.sparkTime > 0) {
          idiom.sparkTime--;
        }

        // Cinematic depth of field camera lens blur
        let blurAmount = 0;
        if (idiom.z3d > 2.0) {
          blurAmount = (idiom.z3d - 2.0) * 3.5; // far soft focus
        } else if (idiom.z3d < 0.38) {
          blurAmount = (0.38 - idiom.z3d) * 8.0; // near close-up focus
        }
        idiom.blur = Math.max(0, blurAmount);

        // Draw if within visible screen bounds
        if (projX > -150 && projX < width + 150 && projY > -100 && projY < height + 100) {
          ctx.save();
          ctx.translate(projX, projY);
          ctx.rotate(idiom.rotation);

          // Apply Depth of Field filter
          if (idiom.blur && idiom.blur > 0.4) {
            ctx.filter = `blur(${idiom.blur.toFixed(1)}px)`;
          } else {
            ctx.filter = "none";
          }

          // Build a stunning, professional multi-layered bloom shadow glow (毛茸茸的微光边缘)
          ctx.shadowBlur = idiom.sparkTime > 0 ? 35 : 16 + Math.sin(idiom.pulsePhase) * 6;
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 0;
          if (idiom.sparkTime > 0) {
            ctx.shadowColor = "#ffffff";
          } else {
            ctx.shadowColor = idiom.colorType === 0 ? "#f43f5e" : idiom.colorType === 1 ? "#ec4899" : "#a855f7";
          }
 
          // Text styling
          const baseFontSize = 32;
          const fontSz = Math.max(10, Math.floor(baseFontSize * scale * idiom.scaleMultiplier));
          ctx.font = `bold ${fontSz}px "Zhi Mang Xing", "Ma Shan Zheng", "Kaiti", "STKaiti", serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
  
          // Restored elegant white-pink-lavender gradient for maximum classical beauty
          const textGrad = ctx.createLinearGradient(0, -fontSz/2, 0, fontSz/2);
          if (idiom.sparkTime > 0) {
            textGrad.addColorStop(0, "#ffffff");
            textGrad.addColorStop(0.3, "#fdf2f8");
            textGrad.addColorStop(0.6, "#fbcfe8");
            textGrad.addColorStop(1, "#f472b6"); // bright flash pink
          } else {
            textGrad.addColorStop(0, "#ffffff");      // Ice-pearl white crown
            textGrad.addColorStop(0.25, "#fdf2f8");   // Soft rose ivory
            textGrad.addColorStop(0.5, "#fae8ff");    // Dreamy lavender
            textGrad.addColorStop(0.75, "#f472b6");   // Rich sakura pink
            textGrad.addColorStop(1, "#be185d");      // Deep royal rose bottom
          }

          ctx.fillStyle = textGrad;
          ctx.globalAlpha = idiom.opacity;

          // Draw the characters vertically for beautiful classical aesthetic
          const chars = idiom.text.split("");
          const lineSpacing = fontSz * 1.08;
          const totalHeight = chars.length * lineSpacing;
          
          ctx.translate(0, -totalHeight / 2 + lineSpacing / 2);
          chars.forEach((char, idx) => {
            // Draw subtle character offset for organic handmade feel
            const charSway = Math.sin(idiom.pulsePhase + idx * 0.5) * (fontSz * 0.03);
            
            // 1. Draw text body with shadow glow
            if (idiom.sparkTime > 0) {
              ctx.shadowColor = "#ffffff";
              ctx.shadowBlur = 35;
            } else {
              ctx.shadowColor = idiom.colorType === 0 ? "#f43f5e" : idiom.colorType === 1 ? "#ec4899" : "#a855f7";
              ctx.shadowBlur = 16 + Math.sin(idiom.pulsePhase) * 6;
            }
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;
            ctx.fillText(char, charSway, idx * lineSpacing);

            // 2. Draw crisp white stroke outline (No shadow for ultimate legibility)
            ctx.shadowColor = "transparent";
            ctx.shadowBlur = 0;
            ctx.strokeStyle = "rgba(255, 255, 255, 0.75)";
            ctx.lineWidth = 0.8;
            ctx.strokeText(char, charSway, idx * lineSpacing);
          });

          ctx.restore();
        }
      });



      // 4.5 Update and Draw Interactive Liquid Glass Water Ripples (Realistic 3D refractive water/gel)
      const waterRipples = waterRipplesRef.current;
      for (let i = waterRipples.length - 1; i >= 0; i--) {
        const r = waterRipples[i];
        r.life -= r.decay;

        if (r.type === "wave") {
          r.radius += (r.maxRadius - r.radius) * 0.08; // smooth ring expansion
          r.alpha = r.life;
        } else {
          r.radius += (r.maxRadius - r.radius) * 0.06; // smooth trail droplet growth
          r.alpha = r.life;
        }

        if (r.life <= 0) {
          waterRipples.splice(i, 1);
          continue;
        }

        ctx.save();
        const radius = r.radius;

        if (r.type === "wave") {
          // Glassy concentric expanding wave ripple
          ctx.shadowBlur = 6;
          ctx.shadowColor = "rgba(255, 255, 255, 0.12)";

          // Core wave ring
          ctx.strokeStyle = `rgba(255, 255, 255, ${r.alpha * 0.38})`;
          ctx.lineWidth = 1.8;
          ctx.beginPath();
          ctx.arc(r.x, r.y, radius, 0, Math.PI * 2);
          ctx.stroke();

          // Highlight top-left crescent
          ctx.strokeStyle = `rgba(255, 255, 255, ${r.alpha * 0.65})`;
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.arc(r.x, r.y, Math.max(0.1, radius - 1.8), Math.PI * 1.15, Math.PI * 1.65);
          ctx.stroke();

          // Outer colored refractive ring (Changed to pure water white)
          ctx.strokeStyle = `rgba(255, 255, 255, ${r.alpha * 0.18})`;
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.arc(r.x, r.y, radius + 2.5, 0, Math.PI * 2);
          ctx.stroke();
        } else {
          // Liquid gel trail droplet: Hyper-realistic 3D wet water body
          // 1. Drop shadow cast onto the background
          ctx.shadowColor = "rgba(15, 23, 42, 0.12)";
          ctx.shadowBlur = 6;
          ctx.shadowOffsetX = 2.0;
          ctx.shadowOffsetY = 3.0;
          ctx.fillStyle = "rgba(255, 255, 255, 0.01)"; // invisible shadow-caster
          ctx.beginPath();
          ctx.arc(r.x, r.y, radius, 0, Math.PI * 2);
          ctx.fill();

          // Reset shadows for glass rendering layers
          ctx.shadowColor = "transparent";
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 0;
          ctx.shadowBlur = 0;

          // 2. Translucent refractive water body gradient (Changed to pure water-white)
          const waterGrad = ctx.createRadialGradient(
            r.x - radius * 0.3, r.y - radius * 0.3, radius * 0.08,
            r.x, r.y, radius
          );
          waterGrad.addColorStop(0, `rgba(255, 255, 255, ${r.alpha * 0.38})`); // specular inner light reflection
          waterGrad.addColorStop(0.4, `rgba(248, 250, 252, ${r.alpha * 0.12})`);
          waterGrad.addColorStop(0.85, `rgba(255, 255, 255, ${r.alpha * 0.15})`); // soft refractive wall
          waterGrad.addColorStop(1, `rgba(255, 255, 255, ${r.alpha * 0.22})`); // white border rim
          ctx.fillStyle = waterGrad;
          ctx.beginPath();
          ctx.arc(r.x, r.y, radius, 0, Math.PI * 2);
          ctx.fill();

          // 3. Highlight Arc (top-left gloss ring)
          ctx.strokeStyle = `rgba(255, 255, 255, ${r.alpha * 0.88})`;
          ctx.lineWidth = 2.5;
          ctx.lineCap = "round";
          ctx.beginPath();
          ctx.arc(r.x, r.y, Math.max(0.1, radius - 2.5), Math.PI * 1.15, Math.PI * 1.65);
          ctx.stroke();

          // 4. Speck highlight dot (tiny bright sparkle)
          ctx.fillStyle = `rgba(255, 255, 255, ${r.alpha * 0.95})`;
          ctx.beginPath();
          ctx.arc(r.x - radius * 0.45, r.y - radius * 0.45, Math.max(0.1, radius * 0.08), 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      }

      // 5. Update and Draw active particle sparks (White, pink, and rose stars, particles and letter shards)
      const particles = particlesRef.current;
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];

        // Physics movement
        p.x += p.vx;
        p.y += p.vy;

        // Deceleration/friction drag
        p.vx *= 0.985;
        p.vy *= 0.985;

        // Soft float upward buoyancy
        p.vy -= 0.012;

        // Apply realistic wind wavy drift when the sweep is active
        if (sweep.active && p.x < sweep.currentX && p.x > sweep.currentX - 450) {
          p.vx += 0.14; // carry forward along with wind stream
          p.vy += Math.sin(p.x * 0.01 + p.id) * 0.22; // wavy turbulence
        } else {
          // Natural delicate air current drift
          p.vy += Math.sin(p.x * 0.005 + p.id) * 0.04;
          p.vx += Math.cos(p.y * 0.005 + p.id) * 0.03;
        }

        // Pull toward mouse cursor if interactive vortex is active
        if (mouseRef.current.active) {
          const dx = mouseRef.current.x - p.x;
          const dy = mouseRef.current.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 300 && dist > 15) {
            const pullForce = (300 - dist) / 300 * 0.055;
            p.vx += (dx / dist) * pullForce - (dy / dist) * pullForce * 0.35;
            p.vy += (dy / dist) * pullForce + (dx / dist) * pullForce * 0.35;
          }
        }

        // Decay particle life
        p.alpha -= p.decay;
        p.rotation += p.rotSpeed;

        // Update trail history for glowing trail effect
        if (!p.trail) p.trail = [];
        p.trail.push({ x: p.x, y: p.y });
        if (p.trail.length > 8) {
          p.trail.shift();
        }

        if (p.alpha <= 0) {
          particles.splice(i, 1);
          continue;
        }

        const currentAlpha = Math.max(0, p.alpha);

        // Draw the glowing trail first in absolute coordinates
        if (p.trail && p.trail.length > 1) {
          ctx.save();
          p.trail.forEach((pt, idx) => {
            const trailAlpha = currentAlpha * (idx / p.trail!.length) * 0.45;
            const trailSize = p.size * (p.scale || 1) * (0.35 + 0.65 * (idx / p.trail!.length));
            ctx.shadowBlur = 8;
            ctx.shadowColor = p.color + "0.75)";
            ctx.fillStyle = p.color + trailAlpha + ")";
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, trailSize, 0, Math.PI * 2);
            ctx.fill();
          });
          ctx.restore();
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);

        if (p.type === "dust") {
          if (p.glow) {
            ctx.shadowBlur = 10;
            ctx.shadowColor = p.color + "0.85)"; // Dynamic color glow
          }
          ctx.fillStyle = p.color + currentAlpha + ")";
          ctx.beginPath();
          ctx.arc(0, 0, p.size * (p.scale || 1), 0, Math.PI * 2);
          ctx.fill();
        } 
        else if (p.type === "star") {
          ctx.shadowBlur = 12;
          ctx.shadowColor = p.color + "0.95)"; // Dynamic star glow
          ctx.fillStyle = p.color + currentAlpha + ")";
          ctx.beginPath();
          
          const s = p.size * (p.scale || 1);
          ctx.moveTo(0, -s);
          ctx.quadraticCurveTo(0, 0, s, 0);
          ctx.quadraticCurveTo(0, 0, 0, s);
          ctx.quadraticCurveTo(0, 0, -s, 0);
          ctx.quadraticCurveTo(0, 0, 0, -s);
          ctx.closePath();
          ctx.fill();
        } 
        else if (p.type === "char") {
          // Shimmering single letters morphing in the background (No Yellows)
          ctx.shadowBlur = p.glow ? 14 : 4;
          ctx.shadowColor = p.color + "0.85)"; // Dynamic magenta rose glow
          ctx.fillStyle = p.color + currentAlpha + ")";
          ctx.font = `bold ${Math.floor(p.size * (p.scale || 1))}px "Zhi Mang Xing", "Kaiti", sans-serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(p.text || "", 0, 0);
        }
        else if (p.type === "heart") {
          ctx.shadowBlur = 12;
          ctx.shadowColor = p.color + "0.85)"; // Dynamic heart glow
          ctx.fillStyle = p.color + currentAlpha + ")";
          ctx.beginPath();
          const s = p.size * (p.scale || 1) * 0.9;
          ctx.moveTo(0, -s / 3);
          ctx.bezierCurveTo(s / 2, -s, s, -s / 3, 0, s);
          ctx.bezierCurveTo(-s, -s / 3, -s / 2, -s, 0, -s / 3);
          ctx.fill();
        }
        else if (p.type === "petal") {
          ctx.shadowBlur = 10;
          ctx.shadowColor = p.color + "0.85)"; // Dynamic petal glow
          ctx.fillStyle = p.color + currentAlpha + ")";
          ctx.beginPath();
          const s = p.size * (p.scale || 1) * 1.1;
          ctx.moveTo(0, -s);
          ctx.quadraticCurveTo(s * 0.6, -s * 0.4, 0, s);
          ctx.quadraticCurveTo(-s * 0.6, -s * 0.4, 0, -s);
          ctx.fill();
        }
        else if (p.type === "sparkle") {
          ctx.shadowBlur = 14;
          ctx.shadowColor = "#fde047"; // gold star-burst glow
          ctx.fillStyle = "rgba(255, 255, 255, " + currentAlpha + ")";
          ctx.beginPath();
          const s = p.size * (p.scale || 1) * 1.25;
          ctx.moveTo(0, -s);
          ctx.lineTo(s * 0.22, 0);
          ctx.lineTo(0, s);
          ctx.lineTo(-s * 0.22, 0);
          ctx.closePath();
          ctx.fill();
        }

        ctx.restore();
      }

      // 6. Draw interactive trail sparkles on mouse move
      if (mouseRef.current.active && (Math.abs(mouseRef.current.x - mouseRef.current.lastX) > 2 || Math.abs(mouseRef.current.y - mouseRef.current.lastY) > 2)) {
        const dX = mouseRef.current.x - mouseRef.current.lastX;
        const dY = mouseRef.current.y - mouseRef.current.lastY;
        const moveDist = Math.sqrt(dX * dX + dY * dY);
        const moveAngle = Math.atan2(dY, dX);

        // Add a point to the continuous water trail and occasionally trigger soft expansion ripples
        addWaterTrailPoint(mouseRef.current.x, mouseRef.current.y);
        if (moveDist > 12 || Math.random() > 0.86) {
          spawnWaterRipple(mouseRef.current.x, mouseRef.current.y, "wave");
        }

        const trailCount = 2;
        for (let k = 0; k < trailCount; k++) {
          const sparkSpeed = 0.4 + Math.random() * 2.2;
          const spread = moveAngle + Math.PI + (Math.random() - 0.5) * 0.9;
          const vx = Math.cos(spread) * sparkSpeed + (Math.random() - 0.5) * 0.8;
          const vy = Math.sin(spread) * sparkSpeed + (Math.random() - 0.5) * 0.8;

          const rand = Math.random();
          let type: "dust" | "star" | "char" = "dust";
          let text = "";

          if (rand < 0.55) {
            type = "dust";
          } else if (rand < 0.85) {
            type = "star";
          } else {
            type = "char";
            text = SINGLE_CHARS[Math.floor(Math.random() * SINGLE_CHARS.length)];
          }

          spawnParticle(mouseRef.current.x, mouseRef.current.y, vx, vy, type, text);
        }

        // Soft chime tone on high velocity drag
        if (Math.random() > 0.95 && moveDist > 6) {
          const randomTone = 440 * (1 + Math.floor(Math.random() * 6) * 0.15);
          playGoldenChime(randomTone, 0.035);
        }

        mouseRef.current.lastX = mouseRef.current.x;
        mouseRef.current.lastY = mouseRef.current.y;
      }

      // 7. Maintain the 5-second countdown timer once the title is visible
      if (hasTriggeredCenterTitle.current) {
        if (titleVisibleTimeRef.current === null) {
          titleVisibleTimeRef.current = Date.now();
        }
        
        const elapsed = Date.now() - titleVisibleTimeRef.current;

        // Elegant continuous star, sparkle and heart emission from the active center title!
        // This adds a mesmerizing, magical dynamic atmosphere as requested by the user
        if (Math.random() > 0.6) {
          const emitX = width / 2 + (Math.random() - 0.5) * (width > 640 ? 550 : width * 0.82);
          const emitY = height / 2 + (Math.random() - 0.5) * (width > 640 ? 110 : 70) - 20;
          const vx = (Math.random() - 0.5) * 1.4;
          const vy = -0.4 - Math.random() * 0.95; // floats up slowly
          
          // Spawn twinkling stars, golden sparkles, and mini floating hearts/petals
          const randType = Math.random();
          const pType = randType > 0.6 ? "sparkle" : (randType > 0.25 ? "star" : "heart");
          
          spawnParticle(emitX, emitY, vx, vy, pType);
        }
        
        // After 5 seconds, trigger the magical idiom-to-flower bloom transformation
        if (elapsed >= 5000 && !bloomTriggeredRef.current) {
          bloomTriggeredRef.current = true;
          playMagicalArpeggio();

          // Convert each active 3D idiom into a gorgeous blooming flower at its projected 2D coordinates
          const focalLength = 320;
          idioms3DRef.current.forEach((idiom) => {
            const scale = focalLength / (focalLength * idiom.z3d);
            const projX = width / 2 + idiom.x3d * scale;
            const projY = height / 2 + idiom.y3d * scale;

            if (projX > -50 && projX < width + 50 && projY > -50 && projY < height + 50) {
              const petals = [5, 6, 8][Math.floor(Math.random() * 3)];
              // Vibrant and elegant watercolor rose-magenta palette
              const colors = ["#e05a8d", "#e86b97", "#f472b6", "#ec4899", "#db2777", "#f05c8d", "#ff739b"];
              const petalColor = colors[Math.floor(Math.random() * colors.length)];
              
              // Disperse the coordinate layout outwards from the center to scatter them elegantly
              const dx = projX - width / 2;
              const dy = projY - height / 2;
              // Push outwards by 24% and add minor random scatter
              const scatterFactor = 1.24;
              const scatteredX = width / 2 + dx * scatterFactor + (Math.random() - 0.5) * 50;
              const scatteredY = height / 2 + dy * scatterFactor + (Math.random() - 0.5) * 50;

              bloomingFlowersRef.current.push({
                id: Math.random(),
                x: scatteredX,
                y: scatteredY,
                size: 0,
                maxSize: (32 + Math.random() * 28) * scale * (idiom.scaleMultiplier || 1.0),
                rotation: Math.random() * Math.PI * 2,
                rotSpeed: (Math.random() - 0.5) * 0.012,
                growth: 0,
                petals,
                petalColor,
                alpha: 1,
                pulsePhase: Math.random() * Math.PI * 2,
                decaySpeed: 0.0006 + Math.random() * 0.0008, // stays for a beautiful long while
                life: 1.0,
                bloomSpeed: 0.012 + Math.random() * 0.006, // majestic slow unfold for centerpieces
                swayWidth: 15 + Math.random() * 25,
                swaySpeed: 0.01 + Math.random() * 0.012,
                baseX: scatteredX
              });

              // Burst a festive cluster of sparkly stars, petals and hearts around the blooming flower
              for (let k = 0; k < 12; k++) {
                const angle = Math.random() * Math.PI * 2;
                const speed = 1.0 + Math.random() * 3.8;
                const vx = Math.cos(angle) * speed;
                const vy = Math.sin(angle) * speed - 0.5;
                const pType = Math.random() > 0.6 ? "heart" : (Math.random() > 0.3 ? "petal" : "sparkle");
                spawnParticle(scatteredX, scatteredY, vx, vy, pType, "", petalColor);
              }
            }
          });
        }
      }

      // Smooth progress update for idiom fade out
      if (bloomTriggeredRef.current) {
        if (bloomProgressRef.current < 1) {
          bloomProgressRef.current += 0.015; // fade idioms out in ~1 second
        }
        
        // Continuous organic spontaneous flower blooms
        if (Math.random() > 0.94) {
          let rX = Math.random() * width;
          let rY = Math.random() * height * 0.75 + height * 0.08;

          // Scatter away from the center title to keep it extremely clear and readable
          const dx = rX - width / 2;
          const dy = rY - height / 2;
          if (Math.abs(dx) < 280 && Math.abs(dy) < 120) {
            if (Math.random() > 0.5) {
              rX += dx > 0 ? 280 : -280;
            } else {
              rY += dy > 0 ? 140 : -140;
            }
          }

          const petals = [5, 6, 8][Math.floor(Math.random() * 3)];
          // Vibrant and elegant watercolor rose-magenta palette
          const colors = ["#e05a8d", "#e86b97", "#f472b6", "#ec4899", "#db2777", "#f05c8d", "#ff739b"];
          const petalColor = colors[Math.floor(Math.random() * colors.length)];

          const mSize = 16 + Math.random() * 28; // small-to-medium flowers
          bloomingFlowersRef.current.push({
            id: Math.random(),
            x: rX,
            y: rY,
            size: 0,
            maxSize: mSize,
            rotation: Math.random() * Math.PI * 2,
            rotSpeed: (Math.random() - 0.5) * 0.02,
            growth: 0,
            petals,
            petalColor,
            alpha: 1,
            pulsePhase: Math.random() * Math.PI * 2,
            decaySpeed: 0.0015 + Math.random() * 0.002, // decays slightly quicker for a lively atmosphere
            life: 1.0,
            bloomSpeed: 0.022 + Math.random() * 0.012, // small flowers bloom faster with high energy pop!
            swayWidth: 10 + Math.random() * 18,
            swaySpeed: 0.015 + Math.random() * 0.015,
            baseX: rX
          });

          // Elegant mini burst of sparkles and hearts
          for (let k = 0; k < 6; k++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 0.8 + Math.random() * 2.2;
            const pType = Math.random() > 0.5 ? "heart" : "sparkle";
            spawnParticle(rX, rY, Math.cos(angle) * speed, Math.sin(angle) * speed - 0.3, pType, "", petalColor);
          }
        }

        // Float up twinkling stars and hearts from the bottom
        if (Math.random() > 0.88) {
          const sX = Math.random() * width;
          const sY = height + 10;
          const svx = (Math.random() - 0.5) * 1.0;
          const svy = -1.0 - Math.random() * 2.0;
          const pType = Math.random() > 0.6 ? "heart" : (Math.random() > 0.3 ? "petal" : "star");
          spawnParticle(sX, sY, svx, svy, pType);
        }
      }

      // 8. Update and Draw Blooming Flowers (Beautiful high-end vector art blooms)
      const bloomingFlowers = bloomingFlowersRef.current;
      for (let i = bloomingFlowers.length - 1; i >= 0; i--) {
        const f = bloomingFlowers[i];
        
        // Update physics/animation state
        f.rotation += f.rotSpeed;
        f.pulsePhase += f.swaySpeed;
        
        if (f.growth < 1.0) {
          f.growth = Math.min(1.0, f.growth + f.bloomSpeed); // beautiful custom bloom rate
        }
        
        // Dynamic horizontal swaying motion along with gentle upward drift
        f.baseX += (Math.random() - 0.5) * 0.12; // slight organic noise drift
        f.x = f.baseX + Math.sin(f.pulsePhase) * f.swayWidth;
        
        // Let them drift slowly upward (smaller ones drift slightly faster for parallax feel)
        f.y -= 0.16 + (f.maxSize < 30 ? 0.1 : 0.04);
        
        // Decay life/alpha
        f.life -= f.decaySpeed;
        if (f.life <= 0.25) {
          f.alpha = f.life / 0.25; // fade out near end of life
        }
        
        if (f.life <= 0) {
          bloomingFlowers.splice(i, 1);
          continue;
        }

        // Delicate, continuous, glowing particle emission matching the flower's rose-pink/magenta hue
        const emitChance = f.growth > 0.45 ? 0.22 : 0.08;
        if (Math.random() < emitChance && f.alpha > 0.25) {
          const angle = Math.random() * Math.PI * 2;
          const dist = Math.random() * f.maxSize * 0.42 * f.growth;
          const px = f.x + Math.cos(angle) * dist;
          const py = f.y + Math.sin(angle) * dist;

          // Slow organic drifting speed
          const speed = 0.2 + Math.random() * 0.7;
          const pvx = Math.cos(angle) * speed + (Math.random() - 0.5) * 0.18;
          const pvy = Math.sin(angle) * speed - 0.28; // gentle float upwards

          const randType = Math.random();
          // Mix of hearts, petals, and stars matching the floral theme
          const pType = randType > 0.72 ? "star" : (randType > 0.38 ? "petal" : "heart");

          spawnParticle(px, py, pvx, pvy, pType, "", f.petalColor);
        }
        
        // Draw the flower using the custom vector graphics drawing helper
        drawBloomingFlower(ctx, f);
      }

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationId);
    };
  }, [muted]);

  // Handle Desktop Mouse Interaction
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const bounds = containerRef.current?.getBoundingClientRect();
    if (!bounds) return;
    const x = e.clientX - bounds.left;
    const y = e.clientY - bounds.top;

    if (!mouseRef.current.active) {
      mouseRef.current.lastX = x;
      mouseRef.current.lastY = y;
      mouseRef.current.active = true;
    }

    mouseRef.current.x = x;
    mouseRef.current.y = y;
  };

  const handleMouseLeave = () => {
    mouseRef.current.active = false;
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    mouseRef.current.isDown = true;
    const bounds = containerRef.current?.getBoundingClientRect();
    if (!bounds) return;
    const x = e.clientX - bounds.left;
    const y = e.clientY - bounds.top;

    // Trigger beautiful water ripples on click
    addWaterTrailPoint(x, y);
    spawnWaterRipple(x, y, "wave");

    // Trigger a massive golden splash burst of particles & characters!
    const sparkBurstCount = 26;
    for (let i = 0; i < sparkBurstCount; i++) {
      const angle = (i / sparkBurstCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.25;
      const speed = 2.0 + Math.random() * 5.5;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;

      const rand = Math.random();
      let type: "dust" | "star" | "char" = "dust";
      let text = "";

      if (rand < 0.45) {
        type = "dust";
      } else if (rand < 0.78) {
        type = "star";
      } else {
        type = "char";
        text = SINGLE_CHARS[Math.floor(Math.random() * SINGLE_CHARS.length)];
      }

      spawnParticle(x, y, vx, vy, type, text);
    }

    playMagicalArpeggio();
  };

  const handleMouseUp = () => {
    mouseRef.current.isDown = false;
  };

  // Handle Mobile Touch Interaction
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    const touch = e.touches[0];
    const bounds = containerRef.current?.getBoundingClientRect();
    if (!bounds) return;
    const x = touch.clientX - bounds.left;
    const y = touch.clientY - bounds.top;

    mouseRef.current.x = x;
    mouseRef.current.y = y;
    mouseRef.current.lastX = x;
    mouseRef.current.lastY = y;
    mouseRef.current.active = true;
    mouseRef.current.isDown = true;

    // Trigger beautiful water ripples on touch down
    addWaterTrailPoint(x, y);
    spawnWaterRipple(x, y, "wave");

    // Spawn touch burst
    const touchBurst = 16;
    for (let i = 0; i < touchBurst; i++) {
      const angle = (i / touchBurst) * Math.PI * 2 + (Math.random() - 0.5) * 0.3;
      const speed = 1.8 + Math.random() * 4.5;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed;

      const rand = Math.random();
      let type: "dust" | "star" | "char" = "dust";
      let text = "";

      if (rand < 0.5) {
        type = "dust";
      } else if (rand < 0.8) {
        type = "star";
      } else {
        type = "char";
        text = SINGLE_CHARS[Math.floor(Math.random() * SINGLE_CHARS.length)];
      }

      spawnParticle(x, y, vx, vy, type, text);
    }
    playMagicalArpeggio();
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    const touch = e.touches[0];
    const bounds = containerRef.current?.getBoundingClientRect();
    if (!bounds) return;
    const x = touch.clientX - bounds.left;
    const y = touch.clientY - bounds.top;

    mouseRef.current.x = x;
    mouseRef.current.y = y;
  };

  const handleTouchEnd = () => {
    mouseRef.current.active = false;
    mouseRef.current.isDown = false;
  };

  return (
    <div 
      ref={containerRef}
      className="relative w-screen h-screen overflow-hidden select-none cursor-crosshair flex flex-col justify-between bg-[#fff1f2]"
      onMouseMove={handleMouseMove}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* 1. Base watercolor-textured cream white canvas */}
      <div className="absolute inset-0 bg-[#fff5f6] z-[-3]" />

      {/* 2. Replicated pink cloudy watercolor paint washes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-[-2] opacity-90 mix-blend-multiply">
        {/* Soft pink top-left wash */}
        <div className="absolute -top-[15%] -left-[10%] w-[70%] h-[60%] rounded-full bg-gradient-to-br from-pink-300/35 via-pink-200/15 to-transparent blur-[110px]" />
        
        {/* Organic pink washes in the middle and sides mimicking the brushstrokes */}
        <div className="absolute top-[12%] -left-[20%] w-[55%] h-[40%] rounded-full bg-pink-400/20 blur-[90px] rotate-[20deg]" />
        <div className="absolute top-[35%] -right-[15%] w-[60%] h-[45%] rounded-full bg-rose-300/25 blur-[100px] rotate-[-15deg]" />
        <div className="absolute top-[60%] -left-[10%] w-[50%] h-[35%] rounded-full bg-pink-300/20 blur-[80px] rotate-[10deg]" />
        
        {/* Thick watercolor pools at the bottom corners and bottom edge */}
        <div className="absolute -bottom-[15%] -left-[5%] w-[65%] h-[50%] rounded-full bg-gradient-to-tr from-pink-400/30 via-rose-200/15 to-transparent blur-[110px]" />
        <div className="absolute -bottom-[20%] -right-[5%] w-[70%] h-[55%] rounded-full bg-gradient-to-tl from-pink-400/35 via-rose-200/20 to-transparent blur-[125px]" />
        <div className="absolute -bottom-[10%] left-[15%] w-[70%] h-[40%] rounded-full bg-pink-300/20 blur-[100px]" />
      </div>

      {/* 3. High-fidelity paper grain texture overlay for tactile fine-art print feel */}
      <div 
        className="absolute inset-0 opacity-[0.14] mix-blend-overlay pointer-events-none z-[-2]" 
        style={{ 
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='paperGrainFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23paperGrainFilter)'/%3E%3C/svg%3E")` 
        }} 
      />

      {/* 4. Exact replicated background decorative text elements from the uploaded image */}
      <div className="absolute inset-0 pointer-events-none z-[-1] select-none">
        {/* Top Centered Header: BLOOM NATURALLY · GLOW GENTLY */}
        <div className="absolute top-10 sm:top-14 inset-x-0 flex justify-center text-center px-4">
          <span className="text-[10px] sm:text-xs font-serif tracking-[0.45em] text-[#be123c]/50 font-medium whitespace-nowrap">
            BLOOM NATURALLY &nbsp;·&nbsp; GLOW GENTLY
          </span>
        </div>

        {/* Floating Concept Label 1: 自然 Naturally (Top-Left quadrant) */}
        <div className="absolute left-[12%] sm:left-[16%] top-[24%] flex flex-col items-start">
          <span className="text-base sm:text-lg font-serif text-[#9d174d]/85 tracking-widest font-semibold">自然</span>
          <span className="text-[10px] sm:text-[11px] font-sans text-[#db2777]/75 tracking-wider font-light">Naturally</span>
        </div>

        {/* Floating Concept Label 2: 温柔 Gently (Middle-Left quadrant) */}
        <div className="absolute left-[10%] sm:left-[14%] top-[54%] flex flex-col items-start">
          <span className="text-base sm:text-lg font-serif text-[#9d174d]/85 tracking-widest font-semibold">温柔</span>
          <span className="text-[10px] sm:text-[11px] font-sans text-[#db2777]/75 tracking-wider font-light">Gently</span>
        </div>

        {/* Floating Concept Label 3: 绽放 Bloom (Middle-Right quadrant) */}
        <div className="absolute right-[12%] sm:right-[16%] top-[38%] flex flex-col items-start">
          <span className="text-base sm:text-lg font-serif text-[#9d174d]/85 tracking-widest font-semibold">绽放</span>
          <span className="text-[10px] sm:text-[11px] font-sans text-[#db2777]/75 tracking-wider font-light">Bloom</span>
        </div>

        {/* Floating Concept Label 4: 发光 Glow (Bottom-Right quadrant) */}
        <div className="absolute right-[14%] sm:right-[18%] top-[68%] flex flex-col items-start">
          <span className="text-base sm:text-lg font-serif text-[#9d174d]/85 tracking-widest font-semibold">发光</span>
          <span className="text-[10px] sm:text-[11px] font-sans text-[#db2777]/75 tracking-wider font-light">Glow</span>
        </div>

        {/* Footer Left: She Blooms in Her Own Rhythm & Translation */}
        <div className="absolute bottom-10 left-[6%] sm:left-[10%] flex flex-col items-start text-left max-w-xs sm:max-w-md">
          <span className="text-[8px] sm:text-[9.5px] font-mono tracking-[0.18em] text-[#9d174d]/75 font-semibold">
            SHE BLOOMS IN HER OWN RHYTHM.
          </span>
          <span className="text-[10px] sm:text-xs font-serif text-[#be123c]/85 tracking-widest mt-1">
            她以自己的节奏 自在绽放
          </span>
        </div>

        {/* Footer Right: Date Stamp & Brand slogan */}
        <div className="absolute bottom-10 right-[6%] sm:right-[10%] flex flex-col items-end text-right">
          <span className="text-[10px] sm:text-xs font-mono tracking-[0.15em] text-[#9d174d]/75 font-bold">
            02/27
          </span>
          <span className="text-[10px] sm:text-xs font-serif text-[#be123c]/85 tracking-wider mt-1">
            RED.风也浪漫
          </span>
        </div>
      </div>

      {/* 3. Full-screen HTML5 Canvas Particle and 3D Typography Engine */}
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 w-full h-full block z-0 pointer-events-none" 
      />

      {/* 2. Top Navigation and Audio control bar (Floating frosted design) */}
      <div className="absolute top-4 inset-x-0 z-50 px-4 sm:px-6 flex items-center justify-between pointer-events-none">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onBackToKunlun();
          }}
          className="flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-serif tracking-widest text-yellow-100 bg-white/5 hover:bg-white/15 active:scale-95 transition-all duration-300 rounded-full border border-yellow-500/20 backdrop-blur-md cursor-pointer pointer-events-auto shadow-lg"
          id="finale-back-btn"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>返回信笺</span>
        </button>

        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Wave Sweep Action button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              triggerHorizontalSweep();
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-serif tracking-wider text-yellow-100 bg-white/5 hover:bg-white/10 active:scale-95 transition-all duration-300 rounded-full border border-yellow-500/20 backdrop-blur-md cursor-pointer shadow-lg"
            title="横扫星轨"
          >
            <RefreshCw className="h-3.5 w-3.5 text-yellow-400 animate-spin-slow" />
            <span>横扫星轨</span>
          </button>

          {/* Mute toggle */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setMuted(!muted);
            }}
            className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-serif tracking-wider text-yellow-100 bg-white/5 hover:bg-white/10 transition-all duration-300 rounded-full border border-yellow-500/20 backdrop-blur-md cursor-pointer"
            id="finale-mute-btn"
          >
            {muted ? <VolumeX className="h-3.5 w-3.5 text-stone-400" /> : <Volume2 className="h-3.5 w-3.5 text-yellow-400 animate-bounce" />}
            <span className="hidden sm:inline">
              {muted ? "山音沉落" : "凤萧重奏"}
            </span>
          </button>
        </div>
      </div>

      {/* 3. Helper toast instruction overlay */}
      <AnimatePresence>
        {showInstruction && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, y: -10 }}
            className="absolute top-20 inset-x-4 mx-auto max-w-sm z-40 bg-pink-950/80 border border-yellow-500/30 backdrop-blur-md rounded-lg p-3 text-center shadow-2xl pointer-events-none"
          >
            <p className="text-[11px] font-serif text-yellow-100 tracking-wider leading-relaxed">
              ✦ 拖拽、滑动屏幕触发璀璨星尘 ✦<br />
              凝聚了不起的她们之温热，中文成语于 3D 虚空漂流回荡
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 4. Cinematic Center-Stage Title Entrance (A stunning multi-phase motion graphic reveal in majestic imperial gold and white) */}
      <AnimatePresence>
        {titlePhase === "center" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-30 pointer-events-none">
            {/* Soft breathing golden backlight halo */}
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ 
                scale: [1, 1.35, 1.2], 
                opacity: [0, 0.45, 0.25] 
              }}
              exit={{ scale: 1.5, opacity: 0 }}
              transition={{ duration: 2.8, ease: "easeOut" }}
              className="absolute w-80 h-80 rounded-full bg-yellow-500/15 blur-[55px] mix-blend-screen"
            />
            
            {/* Elegant dewy golden spark particles drifting upward */}
            <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full h-full max-w-lg relative flex items-center justify-center"
              >
                {[...Array(12)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ x: Math.random() * 260 - 130, y: 160, opacity: 0, scale: 0.35 }}
                    animate={{ 
                      y: -160, 
                      opacity: [0, 0.9, 0],
                      scale: [0.35, 1.2, 0.35],
                      rotate: Math.random() * 360 
                    }}
                    transition={{ duration: 2.4 + Math.random() * 1.6, repeat: Infinity, delay: i * 0.12 }}
                    className="absolute w-2 h-2 rounded-full bg-yellow-100 shadow-[0_0_12px_#fef08a]"
                  />
                ))}
              </motion.div>
            </div>

            <motion.div
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: { staggerChildren: 0.16, delayChildren: 0.15 }
                },
                exit: {
                  opacity: 0,
                  y: -30,
                  filter: "blur(12px)",
                  transition: { duration: 0.75, ease: "easeInOut" }
                }
              }}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="flex flex-col items-center text-center px-6"
            >
              <motion.div 
                variants={{
                  hidden: { opacity: 0, scaleX: 0 },
                  visible: { opacity: 1, scaleX: 1, transition: { duration: 1.2 } }
                }}
                className="w-24 h-[1px] bg-gradient-to-r from-transparent via-yellow-500/80 to-transparent mb-5" 
              />

              <motion.span 
                variants={{
                  hidden: { opacity: 0, letterSpacing: "0.8em" },
                  visible: { opacity: 1, letterSpacing: "0.6em", transition: { duration: 1.2 } }
                }}
                className="text-[10px] sm:text-xs font-mono font-bold text-yellow-500 tracking-[0.6em] mb-4 uppercase"
              >
                ✦ KUNLUN BALLAD ✦
              </motion.span>
 
              {/* Main title character split animation in rich imperial yellow-gold */}
              <h1 
                className="text-8xl sm:text-9xl md:text-[8rem] lg:text-[10.5rem] xl:text-[13rem] 2xl:text-[15.5rem] font-serif font-black flex flex-wrap justify-center items-center gap-2 sm:gap-4 leading-none select-none text-center"
                style={{
                  filter: "drop-shadow(0 15px 30px rgba(76, 5, 25, 0.9)) drop-shadow(0 4px 8px rgba(0, 0, 0, 0.5))"
                }}
              >
                {"昆仑谣·了不起的她们".split("").map((char, idx) => {
                  return (
                    <motion.span
                      key={idx}
                      variants={{
                        hidden: { opacity: 0, scale: 1.6, rotate: (Math.random() - 0.5) * 12 },
                        visible: { 
                          opacity: 1, 
                          scale: 1, 
                          rotate: 0,
                          transition: { type: "spring", damping: 15, stiffness: 65 } 
                        }
                      }}
                      className="text-transparent bg-clip-text bg-gradient-to-b from-[#ffffff] via-[#fef08a] via-[#fbbf24] to-[#eab308] font-medium tracking-wide"
                      style={{
                        fontFamily: '"STXingkai", "Xingkai SC", "华文行楷", "STKaiti", "Kaiti SC", "Kaiti", "Noto Serif SC", serif',
                        marginRight: char === "·" ? "-10px" : "2.5px",
                        marginLeft: char === "·" ? "-10px" : "2.5px",
                        paddingBottom: "14px",
                        textShadow: "0 0 10px rgba(254, 240, 138, 0.95), 0 0 20px rgba(253, 224, 71, 0.85), 0 0 35px rgba(245, 158, 11, 0.65), 0 4px 12px rgba(0, 0, 0, 0.5)"
                      }}
                    >
                      {char}
                    </motion.span>
                  );
                })}
              </h1>
 
              <motion.div 
                variants={{
                  hidden: { scaleX: 0, opacity: 0 },
                  visible: { scaleX: 1, opacity: 1, transition: { duration: 1.2, delay: 0.9 } }
                }}
                className="flex items-center gap-6 mt-6 w-80 sm:w-96"
              >
                <div className="h-[1px] flex-grow bg-gradient-to-r from-transparent to-yellow-500/40" />
                <span className="text-xs sm:text-sm font-serif text-yellow-200 tracking-[0.22em] uppercase">了不起的她们</span>
                <div className="h-[1px] flex-grow bg-gradient-to-l from-transparent to-yellow-500/40" />
              </motion.div>
 
              <motion.p
                variants={{
                  hidden: { opacity: 0, y: 15 },
                  visible: { opacity: 1, y: 0, transition: { duration: 1.4, delay: 1.4 } }
                }}
                className="mt-8 text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-[#f472b6] tracking-[0.18em] leading-relaxed select-none max-w-2xl text-center"
                style={{
                  fontFamily: '"STKaiti", "Kaiti SC", "Kaiti", "Noto Serif SC", serif',
                  textShadow: "0 0 14px rgba(244, 114, 182, 0.85), 0 2px 6px rgba(0, 0, 0, 0.5)"
                }}
              >
                解茧立峰，一曲昆仑谣尽叙女子生生风骨。
              </motion.p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
