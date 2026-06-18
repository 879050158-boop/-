import React, { useState } from "react";
import { TagItem } from "./types";
import TagStage from "./components/TagStage";
import HelpManual from "./components/HelpManual";
import IntroPoster from "./components/IntroPoster";
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
  const [showIntro, setShowIntro] = useState(true);

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

  // Toggle single tag activation
  const handleToggleTag = (id: string) => {
    setTags((prev) =>
      prev.map((t) => (t.id === id ? { ...t, selected: !t.selected } : t))
    );
  };

  // Bulk select action (used by all select helper buttons)
  const handleBulkSelect = (ids: string[]) => {
    setTags((prev) =>
      prev.map((t) => (ids.includes(t.id) ? { ...t, selected: true } : t))
    );
  };

  // Clear choices
  const handleClearSelection = () => {
    setTags((prev) => prev.map((t) => ({ ...t, selected: false })));
  };

  // Transform tags to positive meanings
  const handleTransformTags = () => {
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
    <AnimatePresence mode="wait">
      {showIntro ? (
        <motion.div
          key="intro-poster"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 0.985, y: -5 }}
          transition={{ duration: 0.45, ease: "easeInOut" }}
          className="w-full min-h-screen"
        >
          <IntroPoster onEnter={() => setShowIntro(false)} />
        </motion.div>
      ) : (
        <motion.div
          key="main-app"
          initial={{ opacity: 0, scale: 1.015 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          id="app-root"
          className="min-h-screen w-full bg-[#142121] text-[#e0d8cc] flex flex-col antialiased selection:bg-[#d4af37]/30 selection:text-[#f5f2ed]"
          style={{ backgroundImage: "radial-gradient(circle at 50% 50%, #1f3a3a 0%, #142121 100%)" }}
        >
          {/* Dynamic top elegant navigation branding bar */}
          <header className="relative z-20 flex items-center justify-between px-6 py-4 bg-[#0f1b1b]/95 border-b border-[#d4af37]/30 backdrop-blur-md shadow-lg">
            <div className="flex items-center gap-3">
              <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-[#d4af37] to-[#f9e79f] shadow-md shadow-black/40">
                <Sparkles className="h-4.5 w-4.5 text-[#142121] animate-pulse" />
                <div className="absolute inset-0 rounded-xl border border-[#d4af37]/30 animate-ping opacity-25" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold tracking-widest text-[#d4af37] font-serif">
                    昆仑谣·了不起的她们
                  </span>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#8b0000]/60 border border-[#8b0000]/40 text-[#f5f2ed]">
                    Artistic Flair Live
                  </span>
                </div>
                <h1 className="text-[11px] text-stone-400 tracking-wider mt-0.5 font-sans">
                  打破偏见  撕掉标签·破执与重聚
                </h1>
              </div>
            </div>

            {/* Action Button Set */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowHelp(true)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#1a2b2b] border border-[#d4af37]/20 text-[#e0d8cc] hover:text-[#f5f2ed] hover:border-[#d4af37]/50 hover:bg-[#1f3a3a] transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <BookOpen className="h-3.5 w-3.5 text-[#d4af37]" />
                <span>设计及意向说明</span>
              </button>
            </div>
          </header>

          {/* Main interactive container layout taking full height and width */}
          <main className="flex-1 w-full max-w-[1600px] mx-auto p-4 md:p-6 flex flex-col justify-stretch">
            <div className="flex-1 w-full flex flex-col">
              <TagStage
                tags={tags}
                onToggleTag={handleToggleTag}
                onBulkSelect={handleBulkSelect}
                onClearSelection={handleClearSelection}
                onTransformTags={handleTransformTags}
                onResetTags={handleResetTags}
                onSweepTag={handleSweepTag}
              />
            </div>
          </main>

          {/* Floating help instruction guidebook overlay modal */}
          <HelpManual isOpen={showHelp} onClose={() => setShowHelp(false)} />

          {/* Universal aesthetic copyright footer */}
          <footer className="py-3 text-center text-[10px] text-stone-500 border-t border-[#d4af37]/10 bg-[#0f1b1b]/40 font-mono tracking-widest">
            &copy; {new Date().getFullYear()} XUANYU-CYAN XUAN PAPER DIGITAL INTERFACE. ARTISTIC FLAIR EDITION. ALL RIGHTS RESERVED.
          </footer>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
