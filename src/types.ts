export interface TagItem {
  id: string;
  text: string;
  selected: boolean;
  x: number; // custom horizontal offset % (relative to center)
  y: number; // custom vertical height offset (px)
  length: number; // length of string (px)
  isTransformed?: boolean;
  originalText?: string;
  swept?: boolean;
}

export interface QuickActionPreset {
  id: string;
  name: string;
  systemPrompt: string;
  icon: string; // lucide icon name
  isCustom?: boolean;
}

export interface PromptResult {
  tagsUsed: string[];
  visualPrompt: string; // 画面主体与视觉细节
  lightingTexture: string; // 光影与材质细节
  cameraMovement: string; // 镜头与运镜代码
  empoweredInterpretation: string; // 女性偏见标签重构为独立力量的意向阐释
}
