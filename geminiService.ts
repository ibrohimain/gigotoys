import { GoogleGenAI } from "@google/genai";
import { SaleReport, AgentPlan } from "./types";

export const getSalesInsights = async (reports: SaleReport[], plans: AgentPlan[]) => {
  // Always use a named parameter and obtain the API key exclusively from process.env.API_KEY.
  // Creating a new instance inside the function ensures the client uses the most up-to-date configuration.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const prompt = `
    GIGO TOYS savdo ma'lumotlarini tahlil qiling:
    Hozirgi hisobotlar: ${JSON.stringify(reports)}
    Agent rejalari: ${JSON.stringify(plans)}
    
    Iltimos, direktor uchun quyidagilarni taqdim eting (O'zbek tilida):
    1. Savdo o'sishining qisqacha xulosasi.
    2. Qaysi agent eng yaxshi natija ko'rsatmoqda?
    3. Savdoni oshirish uchun 3 ta strategik maslahat.
    Faqat professional va foydali ma'lumot bering.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    // Use response.text property directly (not a method) to access the generated string.
    return response.text;
  } catch (error) {
    console.error("Gemini AI Error:", error);
    return "Tahlilni yuklashda xatolik yuz berdi.";
  }
};