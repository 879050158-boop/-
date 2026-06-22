import React, { useState, useEffect, useRef } from "react";
import { Sparkles, ArrowRight } from "lucide-react";

interface IntroPosterProps {
  onEnter: () => void;
}

const CHARACTER_LIST = [
  { char: "婉", right: "宛", desc: "婉丽如水，灵动温润" },
  { char: "她", right: "也", desc: "万载星河，皆是自我" },
  { char: "娇", right: "乔", desc: "皎若初雪，温婉且刚" },
  { char: "婷", right: "亭", desc: "亭亭玉立，独立傲然" },
  { char: "好", right: "子", desc: "圆满相谐，大美无言" },
  { char: "婧", right: "青", desc: "才婧横溢，风骨卓然" },
  { char: "妤", right: "予", desc: "予力己身，凌越群峰" },
  { char: "嫣", right: "焉", desc: "嫣然百态，生如夏花" },
  { char: "媛", right: "爰", desc: "媛雅如诗，气吞山河" },
  { char: "嬛", right: "瞏", desc: "嬛嬛一袅，内藏乾坤" },
  { char: "如", right: "口", desc: "坦荡自得，万事如意" },
  { char: "姚", right: "兆", desc: "姚若春华，风华绝代" },
  { char: "嬅", right: "华", desc: "灼灼其华，光耀长空" },
  { char: "婵", right: "单", desc: "婵娟独立，傲骨凌霜" },
  { char: "婠", right: "官", desc: "婠静怡然，胸怀丘壑" },
  { char: "媖", right: "英", desc: "巾帼英姿，智勇双全" },
  { char: "姈", right: "令", desc: "令德明敏，慧心无双" },
  { char: "妙", right: "少", desc: "妙笔生花，造物万千" },
  { char: "嫦", right: "常", desc: "追求极境，追寻真我" },
  { char: "娟", right: "肙", desc: "娟丽明月，朗朗清辉" },
  { char: "娆", right: "尧", desc: "袅娆而立，亦显锋芒" },
  { char: "妩", right: "无", desc: "天真绚烂，大美无拘" },
  { char: "姣", right: "交", desc: "姣好之颜，亦孕惊雷" },
  { char: "娜", right: "那", desc: "袅娜婆娑，势如破竹" },
  { char: "姗", right: "册", desc: "步履姗姗，从容不迫" },
  { char: "姽", right: "危", desc: "文武皆备，英气长存" },
  { char: "婳", right: "画", desc: "神妙若画，力透九重" },
  { char: "姝", right: "朱", desc: "静女其姝，赤子丹心" }
];

export default function IntroPoster({ onEnter }: IntroPosterProps) {
  const [activeIndex, setActiveIndex] = useState<number>(0);
  
  const audioCtxRef = useRef<AudioContext | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const stepCountRef = useRef<number>(0);
  const delayNodeRef = useRef<DelayNode | null>(null);
  const feedbackNodeRef = useRef<GainNode | null>(null);
  const filterNodeRef = useRef<BiquadFilterNode | null>(null);

  // Exact reproduction of the high-speed mechanical click + typewriter clacking from the video
  const playMechanicalClick = (ctx: AudioContext, now: number, intensity = 1.0) => {
    try {
      // 1. Sharp typewriter key hit
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(5300, now);
      osc.frequency.exponentialRampToValueAtTime(850, now + 0.012);
      
      oscGain.gain.setValueAtTime(0.25 * intensity, now);
      oscGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.015);
      
      // 2. High-frequency friction snap (white noise burst)
      const bufferSize = Math.floor(ctx.sampleRate * 0.02); // 20ms of noise buffer
      if (bufferSize > 0) {
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }
        
        const noiseNode = ctx.createBufferSource();
        noiseNode.buffer = buffer;
        
        const noiseFilter = ctx.createBiquadFilter();
        noiseFilter.type = "bandpass";
        noiseFilter.frequency.setValueAtTime(3800, now);
        noiseFilter.Q.setValueAtTime(9.0, now);
        
        const noiseGain = ctx.createGain();
        noiseGain.gain.setValueAtTime(0.14 * intensity, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.018);
        
        noiseNode.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(ctx.destination);
        noiseNode.start(now);
        noiseNode.stop(now + 0.02);
      }
      
      osc.connect(oscGain);
      oscGain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.018);
    } catch {
      // Gracefully capture
    }
  };

  // Synthesize radio static crack noise burst
  const playRadioStatic = (ctx: AudioContext, now: number) => {
    try {
      const bufferSize = Math.floor(ctx.sampleRate * 0.03);
      if (bufferSize > 0) {
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() > 0.85 ? (Math.random() * 2 - 1) : 0;
        }
        
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        
        const filter = ctx.createBiquadFilter();
        filter.type = "bandpass";
        filter.frequency.setValueAtTime(2500, now);
        filter.Q.setValueAtTime(5.0, now);
        
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.025);
        
        source.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        source.start(now);
        source.stop(now + 0.03);
      }
    } catch {
      // Gracefully capture
    }
  };

  // Synthesize crisp digital glitch sound effects
  const playDigitalGlitchBleep = (ctx: AudioContext, now: number, baseFreq: number) => {
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = Math.random() > 0.5 ? "sine" : "square";
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.setValueAtTime(baseFreq * 1.5, now + 0.012);
      
      gain.gain.setValueAtTime(0.03, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
      
      const filter = ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(baseFreq * 2.2, now);
      filter.Q.setValueAtTime(7.5, now);
      
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(now);
      osc.stop(now + 0.045);
    } catch {
      // Gracefully capture
    }
  };

  // Beautiful, spacious, rhythmic bubbly BGM with stereo echo/delay from the uploaded video
  const playSequencerStep = (step: number) => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") {
        return; // Auto-paused by browser autostart policies
      }
      
      const now = ctx.currentTime;

      // 1. Initialize the Master Delay and Master Filter once for amazing echo tails
      if (!delayNodeRef.current) {
        const delay = ctx.createDelay(1.0);
        delay.delayTime.setValueAtTime(0.32, now); // Beautiful lo-fi delay time
        
        const fb = ctx.createGain();
        fb.gain.setValueAtTime(0.40, now); // ~40% feedback depth
        
        delay.connect(fb);
        fb.connect(delay);
        delay.connect(ctx.destination);
        
        delayNodeRef.current = delay;
        feedbackNodeRef.current = fb;
      }

      if (!filterNodeRef.current) {
        const filter = ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(1400, now);
        filter.Q.setValueAtTime(1.1, now);
        filter.connect(ctx.destination);
        if (delayNodeRef.current) {
          filter.connect(delayNodeRef.current);
        }
        filterNodeRef.current = filter;
      }

      // 2. Beautiful bubbling pentatonic arpeggio sequence exact to the video's cozy, light feel
      // Melodic sequences over 4 chords for a living, professional production
      const melodicPatterns = [
        [659.25, 830.61, 880.00, 987.77, 1109.73, 987.77, 880.00, 830.61], // Pattern A (E Major Pentatonic)
        [587.33, 739.99, 880.00, 987.77, 1174.66, 987.77, 880.00, 739.99], // Pattern B (D Major / B Minor Pentatonic)
        [659.25, 880.00, 987.77, 1109.73, 1318.51, 1109.73, 987.77, 880.00], // Pattern C (A Major Pentatonic)
      ];

      const patternIndex = Math.floor(step / 16) % melodicPatterns.length;
      const stepInBar = step % 8;
      const freq = melodicPatterns[patternIndex][stepInBar];

      // Custom Synth Pluck with exponential envelope
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      
      osc.type = "triangle"; // Gives that warm round marimba-like woodblock bubble tone
      osc.frequency.setValueAtTime(freq, now);
      
      oscGain.gain.setValueAtTime(0, now);
      oscGain.gain.linearRampToValueAtTime(0.12, now + 0.005);
      oscGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
      
      osc.connect(oscGain);
      if (filterNodeRef.current) {
        oscGain.connect(filterNodeRef.current);
      } else {
        oscGain.connect(ctx.destination);
      }
      
      osc.start(now);
      osc.stop(now + 0.20);

      // 3. Dynamic ambient lo-fi bass heart pulse on step % 4
      if (step % 4 === 0) {
        const subOsc = ctx.createOscillator();
        const subGain = ctx.createGain();
        
        subOsc.type = "sine";
        subOsc.frequency.setValueAtTime(65, now);
        subOsc.frequency.exponentialRampToValueAtTime(32, now + 0.12);
        
        subGain.gain.setValueAtTime(0.24, now);
        subGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.15);
        
        subOsc.connect(subGain);
        subGain.connect(ctx.destination);
        
        subOsc.start(now);
        subOsc.stop(now + 0.16);
      }

      // 4. Ultra-subtle shaker on odd beats for driving movement
      if (step % 2 === 1) {
        const bufferSize = Math.floor(ctx.sampleRate * 0.015);
        if (bufferSize > 0) {
          const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
          const data = buffer.getChannelData(0);
          for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
          }
          
          const noise = ctx.createBufferSource();
          noise.buffer = buffer;
          
          const highpass = ctx.createBiquadFilter();
          highpass.type = "highpass";
          highpass.frequency.setValueAtTime(7500, now);
          
          const noiseGain = ctx.createGain();
          noiseGain.gain.setValueAtTime(0.015, now);
          noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.012);
          
          noise.connect(highpass);
          highpass.connect(noiseGain);
          noiseGain.connect(ctx.destination);
          
          noise.start(now);
          noise.stop(now + 0.02);
        }
      }

      // 5. Delicate typewriter keystroke click on each step to replicate the mechanical paper feel
      const clickOsc = ctx.createOscillator();
      const clickGain = ctx.createGain();
      clickOsc.type = "sine";
      clickOsc.frequency.setValueAtTime(3200, now);
      clickOsc.frequency.exponentialRampToValueAtTime(600, now + 0.008);
      
      clickGain.gain.setValueAtTime(step % 4 === 0 ? 0.04 : 0.02, now);
      clickGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.01);
      
      clickOsc.connect(clickGain);
      clickGain.connect(ctx.destination);
      clickOsc.start(now);
      clickOsc.stop(now + 0.012);

      // 6. Beautiful crystalline wind chimes sound on each step, echoing the pure light theme
      const chimeFrequencies = [1800, 2100, 2400, 2750, 3100, 3500];
      const chimeFreq = chimeFrequencies[step % chimeFrequencies.length] + (Math.random() * 30 - 15);
      
      const chimeOsc = ctx.createOscillator();
      const chimeGain = ctx.createGain();
      const chimeFilter = ctx.createBiquadFilter();
      
      chimeOsc.type = "sine";
      chimeOsc.frequency.setValueAtTime(chimeFreq, now);
      
      chimeFilter.type = "bandpass";
      chimeFilter.frequency.setValueAtTime(chimeFreq, now);
      chimeFilter.Q.setValueAtTime(12.0, now);
      
      // Delicate volume for high clear chime
      chimeGain.gain.setValueAtTime(0, now);
      chimeGain.gain.linearRampToValueAtTime(0.05, now + 0.004);
      chimeGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.65);
      
      chimeOsc.connect(chimeFilter);
      chimeFilter.connect(chimeGain);
      
      // Route through master delay for spatial crystalline echo reflections
      if (delayNodeRef.current) {
        chimeGain.connect(delayNodeRef.current);
      } else {
        chimeGain.connect(ctx.destination);
      }
      
      chimeOsc.start(now);
      chimeOsc.stop(now + 0.7);

    } catch (e) {
      console.warn("Sequencer step audio error:", e);
    }
  };

  const playTransitionSound = () => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") ctx.resume();
      const now = ctx.currentTime;

      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = "sine";
      osc1.frequency.setValueAtTime(220, now);
      osc1.frequency.exponentialRampToValueAtTime(523.25, now + 1.2);

      osc2.type = "sine";
      osc2.frequency.setValueAtTime(330, now);
      osc2.frequency.exponentialRampToValueAtTime(659.25, now + 1.2);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.12, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.0);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc1.stop(now + 2.2);
      osc2.start(now);
      osc2.stop(now + 2.2);
    } catch (e) {
      console.warn("Transition sound error:", e);
    }
  };

  // High-fidelity rhythmic loop playing cute, bubbly, modern lo-fi music continuously
  useEffect(() => {
    const intervalTime = 145; // Sweet sixteenth note duration (~103 BPM cozy electronic groove)
    
    intervalRef.current = setInterval(() => {
      stepCountRef.current += 1;
      const step = stepCountRef.current;
      
      // Update character on every step to restore the fast, high-paced rhythmic morphing
      setActiveIndex((prev) => (prev + 1) % CHARACTER_LIST.length);
      
      playSequencerStep(step);
    }, intervalTime);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // Soft trigger to wake Web Audio Context immediately upon touch/interaction
  const handleInteractionWakeAudio = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    const ctx = audioCtxRef.current;
    if (ctx && ctx.state === "suspended") {
      ctx.resume().catch((err) => console.log("Audio resume error:", err));
    }
  };

  const handleBegin = (e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid duplicate triggering
    playTransitionSound();
    onEnter();
  };

  const activeData = CHARACTER_LIST[activeIndex];

  return (
    <div 
      onClick={handleInteractionWakeAudio}
      onTouchStart={handleInteractionWakeAudio}
      className="relative w-full h-screen bg-[#fdf2f4] text-[#1c1c1c] flex flex-col justify-between overflow-hidden p-6 select-none font-serif md:max-h-screen cursor-pointer transition-colors duration-500"
      style={{
        backgroundImage: `
          radial-gradient(circle at 15% 20%, rgba(251, 186, 198, 0.45) 0%, transparent 55%),
          radial-gradient(circle at 85% 15%, rgba(244, 63, 94, 0.12) 0%, transparent 60%),
          radial-gradient(circle at 50% 65%, rgba(255, 255, 255, 0.98) 0%, rgba(254, 238, 240, 0.99) 100%),
          url("data:image/svg+xml,%3Csvg viewBox='0 0 300 300' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='matrix' values='0 0 0 0 0.96 0 0 0 0 0.88 0 0 0 0 0.9 0 0 0 0.18 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")
        `
      }}
    >
      {/* 1. Botanical plant leaf patterns from the first image - rendered in soft pink vector shapes */}
      <div className="absolute inset-0 pointer-events-none select-none opacity-[0.16] z-0">
        <svg className="w-full h-full" viewBox="0 0 1000 1000" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          {/* Top Left Leaf Group */}
          <path d="M -50,-50 C 150,150 250,450 120,600 C 50,450 -20,250 -50,-50 Z" fill="#fda4af" opacity="0.4" />
          <path d="M -50,-50 Q 100,270 120,600" stroke="#db2777" strokeWidth="1.2" strokeDasharray="3 3" />
          <path d="M 0,100 Q 80,180 30,280" stroke="#db2777" strokeWidth="0.8" />
          <path d="M 30,220 Q 120,300 70,420" stroke="#db2777" strokeWidth="0.8" />
          <path d="M 60,340 Q 150,420 100,540" stroke="#db2777" strokeWidth="0.8" />

          {/* Overlapping Leaf 2 */}
          <path d="M 80,-80 C 350,20 420,300 280,480 C 180,320 100,160 80,-80 Z" fill="#ffe4e6" opacity="0.35" />
          <path d="M 80,-80 Q 240,200 280,480" stroke="#db2777" strokeWidth="1" strokeDasharray="3 3" />

          {/* Bottom Right Leaf Group */}
          <path d="M 1050,1050 C 750,950 680,650 820,500 C 890,650 960,850 1050,1050 Z" fill="#fda4af" opacity="0.4" />
          <path d="M 1050,1050 Q 810,800 820,500" stroke="#db2777" strokeWidth="1.2" strokeDasharray="3 3" />
          <path d="M 950,900 Q 850,800 900,700" stroke="#db2777" strokeWidth="0.8" />
          <path d="M 910,800 Q 800,700 860,580" stroke="#db2777" strokeWidth="0.8" />

          {/* Bottom Left Leaf Group */}
          <path d="M -50,1050 C 180,920 220,650 100,500 C 20,650 -20,850 -50,1050 Z" fill="#ffe4e6" opacity="0.3" />
          <path d="M -50,1050 Q 90,800 100,500" stroke="#db2777" strokeWidth="1" strokeDasharray="3 3" />
        </svg>
      </div>

      {/* 2. Golden boundary guidelines and rules from the drawing */}
      <div className="absolute inset-x-0 top-[26%] h-[1.5px] bg-[#dca87d]/40 pointer-events-none select-none z-0" />
      <div className="absolute inset-x-0 bottom-[26%] h-[1.5px] bg-[#dca87d]/40 pointer-events-none select-none z-0" />

      {/* 3. Three Translucent Glossy Spheres with specular highlights matching the drawing */}
      <div className="absolute left-[7%] top-[38%] w-[100px] h-[100px] sm:w-[130px] sm:h-[130px] rounded-full bg-gradient-to-tr from-[#db2777]/80 via-[#fca5a5]/70 to-[#fff5f6]/90 opacity-95 backdrop-blur-[1.5px] shadow-[inset_-12px_-12px_24px_rgba(0,0,0,0.18),0_15px_35px_rgba(219,39,119,0.3)] border border-white/40 pointer-events-none select-none z-10 animate-pulse duration-[7s]">
        <div className="absolute top-[15%] left-[15%] w-[18%] h-[18%] rounded-full bg-white/85 blur-[0.5px]" />
      </div>
      <div className="absolute right-[24%] top-[25%] w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-tr from-[#db2777]/65 via-[#fca5a5]/60 to-[#fff5f6]/80 opacity-90 backdrop-blur-[1.2px] shadow-[inset_-4px_-4px_10px_rgba(0,0,0,0.12),0_8px_18px_rgba(219,39,119,0.2)] border border-white/20 pointer-events-none select-none z-10">
        <div className="absolute top-[15%] left-[15%] w-[18%] h-[18%] rounded-full bg-white/75 blur-[0.5px]" />
      </div>
      <div className="absolute right-[33%] bottom-[20%] w-12 h-12 rounded-full bg-gradient-to-tr from-[#db2777]/70 via-[#fca5a5]/65 to-[#fff5f6]/80 opacity-90 backdrop-blur-[1.2px] shadow-[inset_-5px_-5px_12px_rgba(0,0,0,0.14),0_10px_22px_rgba(219,39,119,0.22)] border border-white/20 pointer-events-none select-none z-10">
        <div className="absolute top-[15%] left-[15%] w-[18%] h-[18%] rounded-full bg-white/75 blur-[0.5px]" />
      </div>

      {/* 4. Layered White Silk Smoke Swirls (SVG Paths) dynamically integrated into background */}
      <div className="absolute inset-0 pointer-events-none select-none opacity-45 mix-blend-screen z-0">
        <svg className="w-full h-full" viewBox="0 0 800 1000" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Main vertical loop of white smoke matching the uploaded vector style */}
          <path d="M 400 60 Q 520 220, 410 380 T 360 680 Q 420 840, 400 1010" stroke="white" strokeWidth="5.5" strokeLinecap="round" strokeDasharray="1 1" opacity="0.9"/>
          <path d="M 385 40 Q 550 200, 430 420 T 320 660 Q 450 860, 420 1020" stroke="white" strokeWidth="2" opacity="0.65"/>
          <path d="M 415 90 Q 320 290, 440 490 T 350 740 Q 410 880, 385 1000" stroke="#fbc5cb" strokeWidth="3.5" opacity="0.55"/>
          {/* Concentric sweeping organic curves mimicking ribbons */}
          <path d="M 460,320 C 500,400 320,430 360,540 C 410,650 490,580 450,730" stroke="white" strokeWidth="1.8" opacity="0.75" />
          <path d="M 340,160 C 480,240 580,360 420,500 C 260,640 380,800 480,880" stroke="white" strokeWidth="1.2" opacity="0.5" />
          {/* Small background calligraphy notes */}
          <text x="350" y="70" fill="#db2777" fontSize="8" fontFamily="serif" opacity="0.3" letterSpacing="2">Baowen Mai 3D Artist</text>
          <text x="590" y="650" fill="#db2777" fontSize="6" fontFamily="serif" transform="rotate(90, 590, 650)" opacity="0.45" letterSpacing="1">SANGANZISHI © 2026</text>
        </svg>
      </div>

      {/* Decorative Traditional Border Framing Lines */}
      <div className="absolute inset-5 border border-[#1c1c1c]/90 pointer-events-none z-30 select-none" />
      <div className="absolute inset-6 border-[3px] border-[#1c1c1c]/15 pointer-events-none z-30 select-none" />
      
      {/* Background Decorative Calligraphy & Seals overlaying empty spaces */}
      {/* Left Column 1: Small Seal script / Calligraphy "千秋无界" */}
      <div className="absolute top-[32%] left-[8%] pointer-events-none opacity-[0.22] select-none text-[50px] sm:text-[80px] font-calligraphy text-[#db2777] tracking-wider" style={{ writingMode: "vertical-rl", textShadow: "1.5px 1.5px 3px rgba(219,39,119,0.22)" }}>
        千秋无界
      </div>
      
      {/* Left Column 2: Inspiring theme "温柔纯粹，坚韧不拔" */}
      <div className="absolute top-[15%] left-[17%] pointer-events-none opacity-[0.45] select-none text-xs sm:text-sm font-serif text-[#db2777] leading-relaxed font-black max-w-xs block tracking-[0.25em]" style={{ writingMode: "vertical-rl", textShadow: "1.5px 1.5px 3px rgba(219,39,119,0.25)" }}>
        温柔纯粹，坚韧不拔
      </div>
      
      {/* Left Column 3: "以独立之心盛放，凭内在之力发光" */}
      <div className="absolute top-[18%] left-[23%] pointer-events-none opacity-[0.35] select-none text-xs sm:text-xs font-serif text-stone-700 leading-relaxed font-bold max-w-xs block hidden md:block tracking-[0.2em]" style={{ writingMode: "vertical-rl", textShadow: "1px 1px 2px rgba(28,28,28,0.12)" }}>
        以独立之心盛放，凭内在之力发光
      </div>

      {/* Right Column 1: Bold statement "无畏，盛放" with distinctive calligraphy design */}
      <div className="absolute top-[28%] right-[8%] pointer-events-none opacity-[0.25] select-none text-[45px] sm:text-[70px] font-calligraphy text-[#db2777] tracking-widest font-bold" style={{ writingMode: "vertical-rl", textShadow: "2px 2px 4px rgba(219,39,119,0.25)" }}>
        无畏，盛放
      </div>

      {/* Right Column 2: Poetic motto "心藏恒久温柔，身拥无限力量" */}
      <div className="absolute top-[18%] right-[16%] pointer-events-none opacity-[0.4] select-none text-xs sm:text-xs font-serif text-stone-800 leading-relaxed font-black max-w-xs block hidden lg:block tracking-[0.22em]" style={{ writingMode: "vertical-rl", textShadow: "1.5px 1.5px 3px rgba(28,28,28,0.15)" }}>
        心藏恒久温柔，身拥无限力量
      </div>

      <div className="absolute top-[18%] left-[29%] pointer-events-none opacity-[0.22] select-none text-[10px] sm:text-[11px] font-serif text-stone-500 leading-relaxed font-medium max-w-xs block hidden xl:block" style={{ writingMode: "vertical-rl", textShadow: "1px 1px 1px rgba(0,0,0,0.06)" }}>
        灼灼其华，光耀长空。不羁定义，自得天地。
      </div>

      {/* 1. West border (Left side English framing label): Women have infinite possibilities */}
      <div 
        className="absolute left-[30px] top-1/2 -translate-y-1/2 font-sans text-xs sm:text-sm tracking-[0.5em] font-black uppercase text-[#1c1c1c]/85 z-40 select-none" 
        style={{ writingMode: "vertical-lr", transform: "translateY(-50%) rotate(180deg)", textShadow: "1px 1px 2px rgba(28,28,28,0.1)" }}
      >
        Women have infinite possibilities
      </div>

      {/* East Border Decorative details */}
      <div 
        className="absolute right-[30px] top-1/2 -translate-y-1/2 font-sans text-[10px] tracking-[0.4em] font-semibold text-stone-500/70 select-none z-40 hidden md:block" 
        style={{ writingMode: "vertical-lr", textShadow: "1px 1px 1px rgba(28,28,28,0.05)" }}
      >
        KUNLUN BALLAD SPECIAL ITERATION • BREAK THE LABELS
      </div>

      {/* Top Header Section with customized titles requested */}
      <div className="w-full max-w-7xl mx-auto flex flex-col z-20 pt-5 px-6 relative select-none">
        <div className="flex flex-row items-baseline justify-between w-full border-b border-[#db2777]/20 pb-4 gap-4">
          {/* Main Title: English title in top-left made significantly LARGER with custom elegant text shadow */}
          <h1 
            className="text-[8.5vw] sm:text-[7.5vw] md:text-[6.5vw] lg:text-[5.5vw] xl:text-[4.8vw] font-serif font-black tracking-tighter uppercase leading-none text-[#1c1c1c] select-none"
            style={{ textShadow: "3px 3px 6px rgba(28,28,28,0.18), -1px -1px 0px rgba(255,255,255,0.85)" }}
          >
            Women’s Infinite Light
          </h1>
          {/* Right Subtitle with custom glowing pink-red drop text shadow */}
          <span 
            className="font-serif font-black text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl text-[#db2777] tracking-widest leading-none border-l-2 border-[#db2777]/30 pl-3 md:pl-4 transition-all uppercase whitespace-nowrap select-none"
            style={{ textShadow: "2px 2px 5px rgba(219,39,119,0.32), -1px -1px 0px rgba(255,255,255,0.7)" }}
          >
            女子千秋，风华无界
          </span>
        </div>

        {/* '女'字 的旁边是 prompt badge */}
        <div className="mt-4 text-left relative z-20 flex items-center gap-3 select-none">
          <span className="font-sans font-black text-3xl sm:text-4xl text-[#1c1c1c] tracking-wider bg-[#1c1c1c]/5 px-2.5 py-0.5 rounded" style={{ textShadow: "1px 1px 1px rgba(255,255,255,0.9)" }}>
            “女”字
          </span>
          <span className="font-sans font-bold text-sm sm:text-base text-stone-600 tracking-[0.25em]" style={{ textShadow: "1px 1px 1px rgba(255,255,255,0.9)" }}>
            的旁边是..
          </span>
        </div>
      </div>

      {/* Center Poster Matrix containing the huge Chinese Characters */}
      <div className="w-full flex-1 flex flex-col items-center justify-center relative z-20 my-auto py-4 select-none">
        
        {/* Crisp Display Character Frame Wrapper with classical burgundy border & aesthetic organic rose-gold glow */}
        <div 
          className="relative p-6 sm:p-10 bg-[#fffbfc] border-[3px] border-[#4a1c24] shadow-[0_20px_50px_-12px_rgba(219,39,119,0.18),_0_12px_24px_-10px_rgba(234,179,8,0.15),_inset_0_0_24px_rgba(251,113,133,0.04)] flex flex-col items-center justify-center w-[340px] h-[340px] sm:w-[410px] sm:h-[410px] md:w-[500px] md:h-[500px] select-none rounded-[4px]"
          style={{
            backgroundImage: `
              radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.99) 0%, rgba(254, 245, 247, 1) 100%),
              url("data:image/svg+xml,%3Csvg viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='paperNoise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23paperNoise)' opacity='0.045'/%3E%3C/svg%3E")
            `
          }}
        >
          {/* Inner Golden Filament Border representing precious craft lacquer */}
          <div className="absolute inset-[6px] border border-[#eab308]/30 pointer-events-none select-none" />
          
          {/* Inner Pink Filament Border nested tighter for chromatic harmony */}
          <div className="absolute inset-[10px] border border-dashed border-[#db2777]/12 pointer-events-none select-none" />

          {/* Traditional East Asian Double Corner Brackets in exquisite cinnabar paste tone */}
          <div className="absolute top-[14px] left-[14px] w-5 h-5 border-t border-l border-[#8b1c1c]/90 pointer-events-none select-none" />
          <div className="absolute top-[14px] right-[14px] w-5 h-5 border-t border-r border-[#8b1c1c]/90 pointer-events-none select-none" />
          <div className="absolute bottom-[14px] left-[14px] w-5 h-5 border-b border-l border-[#8b1c1c]/90 pointer-events-none select-none" />
          <div className="absolute bottom-[14px] right-[14px] w-5 h-5 border-b border-r border-[#8b1c1c]/90 pointer-events-none select-none" />

          {/* Golden Gilded Spot Seals on the Outer Corners */}
          <div className="absolute top-[13px] left-[13px] w-1.5 h-1.5 bg-[#eab308] rounded-full shadow-[0_0_4px_rgba(234,179,8,0.8)] pointer-events-none select-none" />
          <div className="absolute top-[13px] right-[13px] w-1.5 h-1.5 bg-[#eab308] rounded-full shadow-[0_0_4px_rgba(234,179,8,0.8)] pointer-events-none select-none" />
          <div className="absolute bottom-[13px] left-[13px] w-1.5 h-1.5 bg-[#eab308] rounded-full shadow-[0_0_4px_rgba(234,179,8,0.8)] pointer-events-none select-none" />
          <div className="absolute bottom-[13px] right-[13px] w-1.5 h-1.5 bg-[#eab308] rounded-full shadow-[0_0_4px_rgba(234,179,8,0.8)] pointer-events-none select-none" />

          {/* Authentic rose draft cross lines inside the matrix */}
          <div className="absolute inset-4 border border-[#db2777]/10 pointer-events-none select-none" />
          <div className="absolute inset-y-4 left-1/2 w-[1px] border-l border-dashed border-[#db2777]/15 pointer-events-none select-none" />
          <div className="absolute inset-x-4 top-1/2 h-[1px] border-t border-dashed border-[#db2777]/15 pointer-events-none select-none" />

          {/* Golden Corner Floral Ornaments */}
          <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-[#eab308]/50 select-none" />
          <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-[#eab308]/50 select-none" />
          <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-[#eab308]/50 select-none" />
          <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-[#eab308]/50 select-none" />

          {/* Elegant Circular Lattice Watermark representing union and traditional harmony */}
          <div className="absolute inset-8 rounded-full border border-[#db2777]/8 flex items-center justify-center pointer-events-none select-none">
            <div className="absolute inset-4 rounded-full border border-dashed border-[#eab308]/15" />
            <div className="absolute inset-[2.5rem] rounded-full border border-[#db2777]/4 flex items-center justify-center">
              {/* Complex celestial rose-gilt alignment vector line-art */}
              <svg className="w-2/3 h-2/3 text-[#db2777]/10 opacity-60" viewBox="0 0 120 120" fill="none" stroke="currentColor" strokeWidth="0.6">
                <circle cx="60" cy="60" r="45" strokeDasharray="3,3" />
                <circle cx="60" cy="60" r="30" />
                <circle cx="60" cy="60" r="15" strokeDasharray="2,2" />
                <path d="M60 5 L60 115" strokeDasharray="4,4" />
                <path d="M5 60 L115 60" strokeDasharray="4,4" />
                <path d="M20 20 L100 100" strokeWidth="0.3" strokeDasharray="2,2" />
                <path d="M20 100 L100 20" strokeWidth="0.3" strokeDasharray="2,2" />
                <path d="M30,60 Q60,30 90,60 Q60,90 30,60" strokeWidth="0.4" />
                <path d="M60,30 Q90,60 60,90 Q30,60 60,30" strokeWidth="0.4" />
              </svg>
            </div>
          </div>


          {/* EXQUISITE CHINESE CALLIGRAPHY (行楷体) LAYER - Fully solid dense velvet soft-pink gradients with multi-layered backings to completely fill dry-brush hollows with lighter tones, shifted slightly left for beautiful balance */}
          <div className="relative z-10 flex items-center justify-center font-calligraphy select-none text-[210px] sm:text-[255px] md:text-[310px] tracking-none leading-none scale-y-105 scale-x-105 select-none -translate-x-[12px] sm:-translate-x-[18px] md:-translate-x-[24px]">
            {/* Left Character "女" with beautiful solid layered backing */}
            <div className="relative inline-block select-none" style={{ width: "0.68em" }}>
              {/* Soft pink blur backing */}
              <span 
                className="absolute inset-0 text-right font-calligraphy text-[#f472b6]/40 select-none pointer-events-none blur-[4px] scale-[0.97]"
                style={{ width: "100%" }}
              >
                女
              </span>
              {/* Thick stroke background underlay to block paper showing through, with soft downward deep pink shadow */}
              <span 
                className="absolute inset-0 text-right font-calligraphy text-[#f472b6] select-none pointer-events-none blur-[0.5px] scale-[0.99]"
                style={{ 
                  width: "100%", 
                  WebkitTextStroke: "4px #f472b6",
                  textShadow: "0 22px 30px rgba(159, 18, 57, 0.7), 0 10px 14px rgba(219, 39, 119, 0.4)"
                }}
              >
                女
              </span>
              {/* Foremost glorious pink-to-velvet peony gradient text copy, low-contrast, highly aesthetic */}
              <span 
                className="relative z-10 text-right block font-normal text-transparent"
                style={{ 
                  width: "100%",
                  backgroundImage: "linear-gradient(135deg, #fbcfe8 0%, #f472b6 35%, #ec4899 68%, #db2777 100%)",
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  color: "transparent",
                  WebkitTextStroke: "0.2px rgba(244, 114, 182, 0.6)",
                  filter: "drop-shadow(0 20px 24px rgba(159, 18, 57, 0.5))",
                }}
              >
                女
              </span>
            </div>
            
            {/* Morphing Right Component in calligraphy brush-stroke style with identical underlay */}
            <div className="relative inline-block select-none transform transition-all duration-100 scale-100 hover:scale-[1.03] active:scale-95" style={{ width: "0.68em" }}>
              {/* Soft pink blur backing */}
              <span 
                className="absolute inset-0 text-left font-calligraphy text-[#f472b6]/40 select-none pointer-events-none blur-[4px] scale-[0.97]"
                style={{ width: "100%" }}
              >
                {activeData.right}
              </span>
              {/* Thick stroke background underlay to block paper showing through, with soft downward deep pink shadow */}
              <span 
                className="absolute inset-0 text-left font-calligraphy text-[#f472b6] select-none pointer-events-none blur-[0.5px] scale-[0.99]"
                style={{ 
                  width: "100%", 
                  WebkitTextStroke: "4px #f472b6",
                  textShadow: "0 22px 30px rgba(159, 18, 57, 0.7), 0 10px 14px rgba(219, 39, 119, 0.4)"
                }}
              >
                {activeData.right}
              </span>
              {/* Foremost glorious pink-to-velvet peony gradient text copy, low-contrast, highly aesthetic */}
              <span 
                className="relative z-10 text-left block font-normal text-transparent"
                style={{ 
                  width: "100%",
                  backgroundImage: "linear-gradient(135deg, #fbcfe8 0%, #f472b6 35%, #ec4899 68%, #db2777 100%)",
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  color: "transparent",
                  WebkitTextStroke: "0.2px rgba(244, 114, 182, 0.6)",
                  filter: "drop-shadow(0 20px 24px rgba(159, 18, 57, 0.5))",
                }}
              >
                {activeData.right}
              </span>
            </div>
          </div>

          {/* Live Seal Signature on the poster representing the complete combined word */}
          <div className="absolute top-4 right-4 flex flex-col items-center select-none">
            <div className="border border-[#db2777]/45 bg-[#db2777]/5 text-[#db2777] rounded text-[9px] py-0.5 px-1.5 font-bold uppercase tracking-widest leading-none select-none">
              重塑之迹
            </div>
            {/* Ink stamps of the composed word in matching deep pink */}
            <div className="mt-1.5 w-11 h-11 border-2 border-dashed border-[#db2777] flex items-center justify-center bg-[#db2777] text-white font-black text-2xl rounded shadow-md shadow-pink-900/25 select-none">
              {activeData.char}
            </div>
          </div>

          {/* Subtitles embedded elegantly inside the whitespace */}
          {/* Subtitle A: "每一个 都是我" */}
          <div className="absolute left-6 top-1/4 flex flex-col items-center gap-1 select-none pointer-events-none opacity-80 z-20 duration-150">
            <span className="font-serif text-[10px] sm:text-xs font-bold tracking-[0.25em] text-neutral-500 block py-1" style={{ writingMode: "vertical-rl" }}>
              每一个
            </span>
            <span className="font-serif text-xs sm:text-sm font-black tracking-[0.25em] text-[#db2777] block" style={{ writingMode: "vertical-rl" }}>
              都是我
            </span>
          </div>

          {/* Subtitle B: "不被定义 的我" */}
          <div className="absolute right-6 bottom-1/4 flex flex-col items-center gap-1 select-none pointer-events-none opacity-80 z-20 duration-150">
            <span className="font-serif text-xs sm:text-sm font-black tracking-[0.25em] text-[#db2777] block" style={{ writingMode: "vertical-rl" }}>
              不被定义
            </span>
            <span className="font-serif text-[10px] sm:text-xs font-bold tracking-[0.25em] text-neutral-500 block py-1" style={{ writingMode: "vertical-rl" }}>
              的我
            </span>
          </div>

          {/* Current index indicator and descriptor */}
          <div className="absolute bottom-4 left-4 font-mono font-bold text-[#1c1c1c]/35 text-[10px] uppercase tracking-wider select-none">
            POSS {activeIndex + 1} / {CHARACTER_LIST.length} • CONTINUOUS LOOP
          </div>
        </div>

        {/* Dynamic description lines explaining current state */}
        <div className="text-center mt-6 min-h-[46px] transition-all select-none">
          <span className="font-sans text-[11px] tracking-[0.3em] text-[#db2777]/80 font-bold block uppercase mb-1">
            重塑成字 : 【{activeData.char}】
          </span>
          <span className="text-xs sm:text-sm font-serif font-black text-stone-600 tracking-wider">
            “{activeData.desc}”
          </span>
        </div>

      </div>

      {/* Smoothly fading in floating CTA controller button */}
      <div className="w-full max-w-lg mx-auto flex flex-col items-center justify-center gap-3 relative z-30 pb-5 h-20 select-none">
        <div className="w-full flex items-center justify-center animate-fade-in duration-300">
          <button
            onClick={handleBegin}
            className="group relative px-10 py-4 rounded-xl bg-[#db2777] hover:bg-[#1c1c1c] text-[#fdfaf2] hover:text-white font-sans font-black tracking-[0.2em] text-xs sm:text-sm shadow-[0_6px_25px_rgba(219,39,119,0.35)] hover:shadow-2xl transition-all duration-300 flex items-center justify-center gap-3 scale-100 hover:scale-[1.03] active:scale-95 cursor-pointer outline-none border border-[#fdfaf2]/10"
          >
            <Sparkles className="h-4.5 w-4.5 text-amber-200 animate-pulse" />
            <span>开启破执及重塑之旅</span>
            <ArrowRight className="h-4.5 w-4.5 group-hover:translate-x-1.5 transition-transform" />
          </button>
        </div>
      </div>

      {/* Bottom Footer Section with specialized user labels */}
      <div className="w-full max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center border-t border-[#1c1c1c]/25 pt-4 text-[9.5px] font-sans text-stone-600 font-bold tracking-widest uppercase select-none gap-2 text-center sm:text-left z-20 pb-2 px-6">
        <div>
          THE PROTAGONIST OF THE WORLD SHINING NOT ONLY TODAY
        </div>
        
        {/* Customized Bottom-Right component requested */}
        <div className="text-[#db2777] font-serif font-black text-[12px] sm:text-[13.5px] tracking-[0.1em] lowercase whitespace-nowrap bg-pink-100/40 px-3 py-1 border border-pink-200/50 rounded transition-all select-none">
          拒绝单一评判，每一种女性都值得喝彩
        </div>
      </div>

    </div>
  );
}
