import React, { useState } from "react";
import { TagItem } from "./types";
import TagStage from "./components/TagStage";
import HelpManual from "./components/HelpManual";
import IntroPoster from "./components/IntroPoster";
import KunlunStage from "./components/KunlunStage";
import InkSplashOverlay from "./components/InkSplashOverlay";
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
  const [stage, setStage] = useState<"intro" | "tagstage" | "kunlun">("intro");
  const [isInkSpattering, setIsInkSpattering] = useState(false);

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
            <IntroPoster onEnter={() => setStage("tagstage")} />
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
                setIsInkSpattering(true);
                setTimeout(() => {
                  setStage("kunlun");
                }, 1000);
                setTimeout(() => {
                  setIsInkSpattering(false);
                }, 2200);
              }}
            />
          </main>

          {/* Floating help instruction guidebook overlay modal */}
          <HelpManual isOpen={showHelp} onClose={() => setShowHelp(false)} />
        </motion.div>
      ) : (
        <motion.div
          key="kunlun"
          initial={{ opacity: 0, scale: 1.02, filter: "blur(10px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          exit={{ opacity: 0, scale: 0.98, filter: "blur(10px)" }}
          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
          className="w-full min-h-screen"
        >
          <KunlunStage onBack={() => {
            setIsInkSpattering(true);
            setTimeout(() => {
              setStage("tagstage");
            }, 800);
            setTimeout(() => {
              setIsInkSpattering(false);
            }, 1800);
          }} />
        </motion.div>
      )}
    </AnimatePresence>
    <InkSplashOverlay isActive={isInkSpattering} />
  </>
  );
}
