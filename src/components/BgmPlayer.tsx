import React, { useState, useEffect } from "react";
import { Play, Pause, Volume2, VolumeX, Music, Disc } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface BgmPlayerProps {
  bgmRef: React.RefObject<HTMLAudioElement | null>;
}

export default function BgmPlayer({ bgmRef }: BgmPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.45);
  const [isMuted, setIsMuted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  // Synchronize state with audio element on load and events
  useEffect(() => {
    const audio = bgmRef.current;
    if (!audio) return;

    // Set initial volume
    audio.volume = isMuted ? 0 : volume;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleVolumeChange = () => {
      if (audio.muted) {
        setIsMuted(true);
      } else {
        setIsMuted(audio.volume === 0);
        if (audio.volume > 0) {
          setVolume(audio.volume);
        }
      }
    };

    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("volumechange", handleVolumeChange);

    // Try auto-detecting current state
    setIsPlaying(!audio.paused);

    return () => {
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("volumechange", handleVolumeChange);
    };
  }, [bgmRef]);

  // Handle play/pause toggle
  const togglePlay = () => {
    const audio = bgmRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch((err) => {
        console.log("Interactive BGM trigger error:", err);
      });
    }
  };

  // Handle mute/unmute
  const toggleMute = () => {
    const audio = bgmRef.current;
    if (!audio) return;

    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    audio.volume = nextMuted ? 0 : volume;
  };

  // Handle volume slider changes
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = bgmRef.current;
    if (!audio) return;

    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
    audio.volume = newVolume;
    if (audio.muted && newVolume > 0) {
      audio.muted = false;
    }
  };

  // Brief flash tooltip when song starts
  useEffect(() => {
    if (isPlaying) {
      setShowTooltip(true);
      const timer = setTimeout(() => setShowTooltip(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [isPlaying]);

  return (
    <div 
      className="fixed bottom-18 left-6 z-50 flex items-center gap-3 select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      id="bgm-player-hud"
    >
      {/* Decorative Rotating Jade/Ink Disc & Core Play Button */}
      <div className="relative flex items-center justify-center">
        {/* Slowly rotating background circle resembling Chinese jade disk with golden thread */}
        <motion.div
          animate={{ rotate: isPlaying ? 360 : 0 }}
          transition={{ repeat: Infinity, duration: 15, ease: "linear" }}
          className={`absolute w-12 h-12 rounded-full border border-dashed flex items-center justify-center transition-all duration-500 pointer-events-none ${
            isPlaying 
              ? "border-[#d4af37]/60 shadow-[0_0_12px_rgba(212,175,55,0.3)] bg-[#121c1d]/65" 
              : "border-stone-600/30 bg-[#121c1d]/30"
          }`}
        />

        {/* Play/Pause Button */}
        <button
          onClick={togglePlay}
          className={`relative z-10 w-10 h-10 rounded-full border flex items-center justify-center transition-all duration-300 focus:outline-none cursor-pointer ${
            isPlaying
              ? "bg-[#d4af37]/10 text-[#d4af37] border-[#d4af37]/40 hover:bg-[#d4af37]/25 hover:border-[#d4af37]/80 hover:shadow-[0_0_12px_rgba(212,175,55,0.4)]"
              : "bg-stone-900/60 text-stone-400 border-stone-700/60 hover:text-[#d4af37] hover:border-[#d4af37]/50 hover:bg-[#121c1d]/80"
          }`}
          title={isPlaying ? "暂停背景音乐 (Pause BGM)" : "播放背景音乐 (Play BGM)"}
        >
          {isPlaying ? (
            <Pause className="w-4.5 h-4.5" />
          ) : (
            <Play className="w-4.5 h-4.5 ml-0.5" />
          )}
        </button>
      </div>

      {/* Expanded Control HUD with metadata, audio visualizer and volume slider */}
      <AnimatePresence>
        {(isHovered || showTooltip) && (
          <motion.div
            initial={{ opacity: 0, x: -15, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -10, scale: 0.95 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center gap-3.5 px-4 py-2 rounded-xl border border-[#d4af37]/20 bg-[#0a0f10]/95 backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.6)]"
          >
            {/* Song Details & Waveforms */}
            <div className="flex flex-col min-w-[150px] max-w-[200px]">
              <div className="flex items-center gap-1.5 overflow-hidden">
                <Music className={`w-3 h-3 text-[#d4af37] shrink-0 ${isPlaying ? "animate-bounce" : ""}`} />
                <span className="text-[11.5px] font-serif text-[#f5f2ed] font-bold tracking-wide truncate">
                  Into The Sun
                </span>
              </div>
              <span className="text-[9.5px] text-stone-400 font-mono truncate pl-4">
                Liquid Cinema (Indie Anthems)
              </span>
            </div>

            {/* Micro Audio Waveform Visualizer */}
            {isPlaying && (
              <div className="flex items-end gap-[2px] h-3.5 w-6 shrink-0 pt-1">
                {[1, 2, 3, 4, 5].map((idx) => {
                  const animDuration = [0.6, 0.85, 0.5, 0.75, 0.9][idx - 1];
                  const delay = [0, 0.2, 0.1, 0.3, 0.15][idx - 1];
                  return (
                    <motion.div
                      key={idx}
                      animate={{ height: ["15%", "100%", "15%"] }}
                      transition={{
                        repeat: Infinity,
                        duration: animDuration,
                        delay: delay,
                        ease: "easeInOut",
                      }}
                      className="w-[2.5px] bg-[#d4af37] rounded-full origin-bottom"
                    />
                  );
                })}
              </div>
            )}

            {/* Separator */}
            <div className="w-[1px] h-6 bg-stone-800" />

            {/* Mute/Volume controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={toggleMute}
                className="text-stone-400 hover:text-[#d4af37] transition-colors focus:outline-none cursor-pointer p-1 rounded hover:bg-stone-800/45"
                title={isMuted ? "取消静音" : "静音"}
              >
                {isMuted ? (
                  <VolumeX className="w-3.5 h-3.5 text-red-400/80" />
                ) : (
                  <Volume2 className="w-3.5 h-3.5" />
                )}
              </button>

              {/* Volume Slider */}
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-16 h-1 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-[#d4af37]"
                style={{
                  background: `linear-gradient(to right, #d4af37 0%, #d4af37 ${
                    (isMuted ? 0 : volume) * 100
                  }%, #1c1917 ${(isMuted ? 0 : volume) * 100}%, #1c1917 100%)`,
                }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
