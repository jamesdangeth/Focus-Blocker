import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.GEMINI_API_KEY });

export const classifyIntent = async (url: string, time: string, activityLog: string[]) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Classify the intent of visiting ${url} at ${time}. Recent activity: ${activityLog.join(', ')}`,
      config: {
        systemInstruction: "You are an AI focus coach. Classify the user's intent into 'work', 'break', or 'unknown'. Return ONLY valid JSON.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            intent: { type: Type.STRING, enum: ["work", "break", "unknown"] },
            confidence: { type: Type.NUMBER }
          },
          required: ["intent", "confidence"]
        }
      }
    });

    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Gemini Intent Error:", error);
    return { intent: "unknown", confidence: 0 };
  }
};

export const generateWeeklyInsights = async (logs: any[]) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze these focus logs for the past 7 days: ${JSON.stringify(logs)}`,
      config: {
        systemInstruction: "Generate focus insights and recommendations. Keep it calm, witty, and intelligent. Return JSON only.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            insights: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            recommendations: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["insights", "recommendations"]
        }
      }
    });

    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Gemini Insights Error:", error);
    return { insights: [], recommendations: [] };
  }
};
