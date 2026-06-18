import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Parse request bodies
app.use(express.json({ limit: "50mb" }));

// Initialize Gemini API client safely and lazily (to prevent crash if API key is not ready)
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not set. Please configure it in your Secrets Panel.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// 1. Full-stack API Route for reverse prompt generation with structured JSON response
app.post("/api/generate-prompt", async (req, res) => {
  try {
    const { tags, preset, customText } = req.body;
    
    if (!tags || !Array.isArray(tags) || tags.length === 0) {
      return res.status(400).json({ error: "Please select at least one tag." });
    }

    const ai = getGeminiClient();

    const systemInstruction = `你是一位东方美学视觉大师、AI视频编导和当代先锋艺术家。
任务是：将用户提供的、长期束缚并带有偏见的女性虚浮片面标签（如：柔弱、母老虎、花瓶、大龄剩女等），在视觉提示词和哲学意境上进行高能逆转与反写，转化为强大、纯粹、独立、高雅、充满生命力量和东方哲思的女性视觉特写镜头提示词（适合Sora, Kling, Runway, Midjourney等高端模型）。

你需要生成包含四个部分的JSON对象：
1. visualPrompt: 主体设计与画面细节提示词。将偏见词重塑为强大而富有隐喻的视觉场景。不留痕迹、高质感、高反差、东方主义艺术，提供丰富、高密度的电影级画笔描摹。
2. lightingTexture: 宣纸质感、油墨边缘渗化、自然虚化、极细金丝偏光或赛博霓虹积水反射、强反差光影刻画。
3. cameraMovement: 专业运镜控制与流畅运动代码，为AI视频定制（如 macro-cinematography, tracking shot, pan left, dolly zoom 等控制语）。
4. empoweredInterpretation: 哲学与艺术解析词。深刻阐释这次转换中，那些偏见标签（如"花瓶"重构为"承载历史风霜却坚如铁矿的晶体瓷坯"）是如何在视觉意向中被彻底粉碎、解构、并赋予神圣自主力量的。

请严格提供真实且高质量的中英双语输出。`;

    const userPromptText = `
【选中的偏见标签起点】:
${tags.join("、 ")}

【额外用户创意背景参数】:
${customText || "无额外描述，请全权自由发挥超现实、张力十足的东方美学电影级重构画面"}

【处理器定向快捷按钮指令】:
指令名称: ${preset.name}
指令微调: ${preset.systemPrompt}
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: userPromptText,
      config: {
        systemInstruction,
        temperature: 0.82,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["visualPrompt", "lightingTexture", "cameraMovement", "empoweredInterpretation"],
          properties: {
            visualPrompt: {
              type: Type.STRING,
              description: "The core subject & scene details prompt in English first, followed by clear Chinese translation under it."
            },
            lightingTexture: {
              type: Type.STRING,
              description: "Specific cinema lighting, textures and fine details of materials in English and Chinese."
            },
            cameraMovement: {
              type: Type.STRING,
              description: "AI video model-specific camera direction codes and parameters."
            },
            empoweredInterpretation: {
              type: Type.STRING,
              description: "Deep, profound artistic philosophic breakdown explaining how the negative labels are transformed into direct self-agency."
            }
          }
        }
      }
    });

    const bodyText = response.text;
    if (!bodyText) {
      return res.status(500).json({ error: "Gemini did not return any text response." });
    }

    const data = JSON.parse(bodyText);
    res.json(data);
    
  } catch (error: any) {
    console.error("Gemini Generation Error:", error);
    res.status(500).json({ 
      error: error.message || "服务器和模型处理出错，请确保你已经配置了正确的 GEMINI_API_KEY。" 
    });
  }
});

// 2. Vite Middleware Setup (Dynamic serving based on env)
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite development server connected.");
  } else {
    // In production, serve the built files
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Static production assets mounted.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Express application active and routing on http://localhost:${PORT}`);
  });
}

startServer();
