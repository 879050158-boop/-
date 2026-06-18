import React from "react";
import { HelpCircle, Layers, Moon, ShieldAlert } from "lucide-react";

interface HelpManualProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function HelpManual({ isOpen, onClose }: HelpManualProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-fade-in font-sans">
      <div className="w-full max-w-xl bg-[#0f1b1b] border border-[#d4af37]/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] text-[#e0d8cc]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#d4af37]/15 bg-[#0a1414] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HelpCircle className="h-4.5 w-4.5 text-[#d4af37]" />
            <h3 className="text-sm font-semibold text-[#d4af37] tracking-widest font-serif">
              设计及意向说明 (Artistic Stage Manual)
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="text-stone-400 hover:text-white transition-colors cursor-pointer text-lg"
          >
            ✕
          </button>
        </div>

        {/* Content Scroll area */}
        <div className="p-6 overflow-y-auto space-y-5 text-sm text-stone-300 leading-relaxed">
          {/* Aesthetic Section */}
          <div className="space-y-2">
            <h4 className="flex items-center gap-1.5 font-bold text-[#f5f2ed] font-serif">
              <Layers className="h-4 w-4 text-[#d4af37]" />
              <span>一、 视觉设计与意向背景 (Visual Intent)</span>
            </h4>
            <p>
              本交互界面以<strong>暗青宣纸纹理（玄羽青墨）</strong>作为视觉基底，浮现中国古风金字墨迹与自强精神，传递生命力度与独立自主姿态。
            </p>
            <p>
              正上方倒垂的<strong>朱顶红独之花 (Amaryllis Cruentus)</strong>，向下投射傀儡黑丝，系住28张写满刻板言语的米白色宣纸标签。这些标签象征附着在现代女性周身的刻板束缚之茧。
            </p>
          </div>

          {/* Interactive instruction */}
          <div className="space-y-2">
            <h4 className="flex items-center gap-1.5 font-bold text-[#f5f2ed] font-serif">
              <Moon className="h-4 w-4 text-red-400" />
              <span>二、 物理动效与阵风散落 (Dynamics)</span>
            </h4>
            <p>
              点击“<strong>阵风散落 (Scatter)</strong>”后，伴随着清脆的纸叶微动和竹哨风声，傀儡线拉长，标签自然散落，呈舒展错落的自由状态；
            </p>
            <p>
              点击“<strong>回归原位 (Gather)</strong>”或个别点击标签，可令标签连带傀儡索线以流畅自然的缓动弹簧曲线回归重力垂直悬挂态。
            </p>
          </div>

          {/* Empowerment */}
          <div className="space-y-2">
            <h4 className="flex items-center gap-1.5 font-bold text-[#f5f2ed] font-serif">
              <ShieldAlert className="h-4 w-4 text-[#d4af37]" />
              <span>三、 声效与质感 (Sensory Experience)</span>
            </h4>
            <p>
              本页面整合了纯 Web Audio API 合成的风铎、风拂宣纸和微风声效。每次交互或者风动，都能带来深层静谧的古韵听觉体验。
            </p>
          </div>
        </div>

        {/* Footer info */}
        <div className="px-6 py-4 border-t border-[#d4af37]/15 bg-[#0a1414] flex justify-between items-center text-[11px] text-stone-500 font-mono">
          <span>XUANYU-CYAN DIGITAL INTERFACE</span>
          <button 
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-[#8b0000] hover:bg-stone-800 text-white border border-[#d4af37]/20 font-sans text-xs cursor-pointer transition-colors"
          >
            开始体验
          </button>
        </div>
      </div>
    </div>
  );
}
