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

  // High-paced Industrial Glitch Techno sequencer track (fully reproducing the BGM in the video)
  const playSequencerStep = (step: number) => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") {
        return; // Auto-paused by user agent security models
      }
      
      const now = ctx.currentTime;
      
      // Rhythmic high-speed typewriter clacking
      const scaleIntensity = step % 4 === 0 ? 1.0 : (step % 2 === 0 ? 0.7 : 0.55);
      playMechanicalClick(ctx, now, scaleIntensity);
      
      // Pitch-bent electronic error glitch sweeps
      if (step % 8 === 2) {
        playDigitalGlitchBleep(ctx, now, 2300 + (step % 3) * 550);
      }
      if (step % 16 === 7) {
        playDigitalGlitchBleep(ctx, now, 3900 - (step % 4) * 750);
      }
      
      // Static bursts
      if (step % 6 === 1 || step % 16 === 13) {
        playRadioStatic(ctx, now);
      }
      
      // Deep sub impulse beat (BGM bass feel)
      if (step % 8 === 0) {
        const subOsc = ctx.createOscillator();
        const subGain = ctx.createGain();
        subOsc.type = "sine";
        subOsc.frequency.setValueAtTime(55, now);
        subGain.gain.setValueAtTime(0.22, now);
        subGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);
        subOsc.connect(subGain);
        subGain.connect(ctx.destination);
        subOsc.start(now);
        subOsc.stop(now + 0.09);
      }
      
    } catch {
      // Handle silently
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

  // High-paced flickering interval loop - looping continuously forever
  useEffect(() => {
    const intervalTime = 111; // ~135 BPM steady tempo 16th notes
    
    intervalRef.current = setInterval(() => {
      stepCountRef.current += 1;
      const nextIndex = stepCountRef.current % CHARACTER_LIST.length;
      setActiveIndex(nextIndex);
      
      playSequencerStep(stepCountRef.current);
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
      className="relative w-full h-screen bg-[#f5f0e3] text-[#1c1c1c] flex flex-col justify-between overflow-hidden p-6 select-none font-serif md:max-h-screen cursor-pointer"
      style={{
        backgroundImage: `
          radial-gradient(circle at 50% 50%, rgba(254, 252, 247, 0.98) 0%, rgba(245, 240, 227, 1) 100%),
          url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.035'/%3E%3C/svg%3E")
        `
      }}
    >
      {/* Decorative Traditional Border Framing Lines */}
      <div className="absolute inset-5 border border-[#1c1c1c] pointer-events-none z-30 select-none" />
      <div className="absolute inset-6 border-[3px] border-[#1c1c1c]/15 pointer-events-none z-30 select-none" />
      
      {/* 1. West border (Left side English framing label): Women have infinite possibilities */}
      <div 
        className="absolute left-[30px] top-1/2 -translate-y-1/2 font-sans text-xs sm:text-sm tracking-[0.5em] font-black uppercase text-[#1c1c1c]/85 z-40 select-none" 
        style={{ writingMode: "vertical-lr", transform: "translateY(-50%) rotate(180deg)" }}
      >
        Women have infinite possibilities
      </div>

      {/* East Border Decorative details */}
      <div 
        className="absolute right-[30px] top-1/2 -translate-y-1/2 font-sans text-[10px] tracking-[0.4em] font-semibold text-stone-500/70 select-none z-40 hidden md:block" 
        style={{ writingMode: "vertical-lr" }}
      >
        KUNLUN BALLAD SPECIAL ITERATION • BREAK THE LABELS
      </div>

      {/* Top Header Section with customized titles requested */}
      <div className="w-full max-w-7xl mx-auto flex flex-col z-20 pt-5 px-6 relative select-none">
        <div className="flex flex-col md:flex-row md:items-baseline md:justify-between w-full border-b border-stone-800/10 pb-3 gap-3">
          {/* Main Title: Women’s Infinite Light along with '女性无限光芒' -- Enlarged Slightly */}
          <div className="flex flex-col md:flex-row md:items-baseline gap-2 md:gap-6">
            <h1 className="text-[8.5vw] sm:text-[7.5vw] md:text-[4.8vw] lg:text-[4.5vw] font-serif font-black tracking-tighter uppercase leading-none text-[#1c1c1c] select-none">
              Women’s Infinite Light
            </h1>
            <span className="font-serif font-black text-2xl sm:text-3xl md:text-4xl text-[#cb1b1b] tracking-widest leading-none drop-shadow-[0_1px_1px_rgba(0,0,0,0.05)] border-l-2 border-[#cb1b1b]/30 md:pl-5 transition-all uppercase whitespace-nowrap select-none">
              女性无限光芒
            </span>
          </div>
        </div>

        {/* '女'字 的旁边是 prompt badge */}
        <div className="mt-4 text-left relative z-20 flex items-center gap-3 select-none">
          <span className="font-sans font-black text-3xl sm:text-4xl text-[#1c1c1c] tracking-wider bg-[#1c1c1c]/5 px-2.5 py-0.5 rounded">
            “女”字
          </span>
          <span className="font-sans font-bold text-sm sm:text-base text-stone-600 tracking-[0.25em]">
            的旁边是..
          </span>
        </div>
      </div>

      {/* Center Poster Matrix containing the huge Chinese Characters */}
      <div className="w-full flex-1 flex flex-col items-center justify-center relative z-20 my-auto py-4 select-none">
        
        {/* Crisp Display Character Frame Wrapper with luxury double lines */}
        <div className="relative p-6 sm:p-10 bg-[#fdfaf2] border-[4px] border-[#1c1c1c] shadow-[12px_12px_0px_rgba(28,28,28,0.1)] flex flex-col items-center justify-center w-[320px] h-[320px] sm:w-[380px] sm:h-[380px] md:w-[460px] md:h-[460px] select-none">
          
          {/* Authentic red draft cross lines inside the matrix */}
          <div className="absolute inset-4 border border-[#cb1b1b]/10 pointer-events-none select-none" />
          <div className="absolute inset-y-4 left-1/2 w-[1px] border-l border-dashed border-[#cb1b1b]/15 pointer-events-none select-none" />
          <div className="absolute inset-x-4 top-1/2 h-[1px] border-t border-dashed border-[#cb1b1b]/15 pointer-events-none select-none" />

          {/* Golden Corner Floral Ornaments */}
          <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-[#cb1b1b]/30 select-none" />
          <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-[#cb1b1b]/30 select-none" />
          <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-[#cb1b1b]/30 select-none" />
          <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-[#cb1b1b]/30 select-none" />

          {/* EXQUISITE CHINESE TEXT LAYER */}
          <div className="relative z-10 flex items-center justify-center font-serif font-black tracking-none leading-none select-none text-[140px] sm:text-[165px] md:text-[210px] scale-y-110">
            {/* Stable Left Static "女" Character */}
            <span 
              className="text-[#cb1b1b] text-right inline-block font-black transition-all select-none"
              style={{ width: "1.05em" }}
            >
              女
            </span>
            
            {/* Morphing Right Component with perfectly stable spacing sizing */}
            <span 
              className="text-[#cb1b1b] text-left inline-block font-black select-none text-shadow-sm transform scale-100 animate-pulse text-[1.05em]"
              style={{ width: "1.05em" }}
            >
              {activeData.right}
            </span>
          </div>

          {/* Live Seal Signature on the poster representing the complete combined word */}
          <div className="absolute top-4 right-4 flex flex-col items-center select-none">
            <div className="border border-[#cb1b1b]/45 bg-[#cb1b1b]/5 text-[#cb1b1b] rounded text-[9px] py-0.5 px-1.5 font-bold uppercase tracking-widest leading-none select-none">
              重塑之迹
            </div>
            {/* Ink stamps of the composed word */}
            <div className="mt-1.5 w-11 h-11 border-2 border-dashed border-[#cb1b1b] flex items-center justify-center bg-[#cb1b1b] text-white font-black text-2xl rounded shadow-md shadow-red-900/20 select-none">
              {activeData.char}
            </div>
          </div>

          {/* Subtitles embedded elegantly inside the whitespace */}
          {/* Subtitle A: "每一个 都是我" */}
          <div className="absolute left-6 top-1/4 flex flex-col items-center gap-1 select-none pointer-events-none opacity-80 z-20 duration-150">
            <span className="font-serif text-[10px] sm:text-xs font-bold tracking-[0.25em] text-neutral-500 block py-1" style={{ writingMode: "vertical-rl" }}>
              每一个
            </span>
            <span className="font-serif text-xs sm:text-sm font-black tracking-[0.25em] text-[#cb1b1b] block" style={{ writingMode: "vertical-rl" }}>
              都是我
            </span>
          </div>

          {/* Subtitle B: "不被定义 的我" */}
          <div className="absolute right-6 bottom-1/4 flex flex-col items-center gap-1 select-none pointer-events-none opacity-80 z-20 duration-150">
            <span className="font-serif text-xs sm:text-sm font-black tracking-[0.25em] text-[#cb1b1b] block" style={{ writingMode: "vertical-rl" }}>
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
          <span className="font-sans text-[11px] tracking-[0.3em] text-[#cb1b1b]/70 font-bold block uppercase mb-1">
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
            className="group relative px-10 py-4 rounded-xl bg-[#cc1b1b] hover:bg-[#1c1c1c] text-[#fdfaf2] hover:text-white font-sans font-black tracking-[0.2em] text-xs sm:text-sm shadow-[0_6px_25px_rgba(204,27,27,0.35)] hover:shadow-2xl transition-all duration-300 flex items-center justify-center gap-3 scale-100 hover:scale-[1.03] active:scale-95 cursor-pointer outline-none border border-[#fdfaf2]/10"
          >
            <Sparkles className="h-4.5 w-4.5 text-amber-200 animate-pulse" />
            <span>开启破执及重塑之旅</span>
            <ArrowRight className="h-4.5 w-4.5 group-hover:translate-x-1.5 transition-transform" />
          </button>
        </div>
      </div>

      {/* Bottom Footer Section with specialized user labels</h1> */}
      <div className="w-full max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center border-t border-[#1c1c1c]/25 pt-4 text-[9.5px] font-sans text-stone-600 font-bold tracking-widest uppercase select-none gap-2 text-center sm:text-left z-20 pb-2 px-6">
        <div>
          THE PROTAGONIST OF THE WORLD SHINING NOT ONLY TODAY
        </div>
        
        {/* Customized Bottom-Right component requested */}
        <div className="text-[#cb1b1b] font-serif font-black text-[12px] sm:text-[13.5px] tracking-[0.1em] lowercase whitespace-nowrap bg-red-100/40 px-3 py-1 border border-red-200/50 rounded transition-all select-none">
          拒绝单一评判，每一种女性都值得喝彩
        </div>
      </div>

    </div>
  );
}
