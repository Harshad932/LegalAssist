// services/prioritizationService.js
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function analyzeCasePriority(caseText) {
  if (!caseText || typeof caseText !== 'string' || !caseText.trim()) {
    return "Low";
  }
  
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    
    const prompt = `
    You are a legal expert. Classify this case as 'Critical', 'High', 'Medium', or 'Low' priority based on legal severity, urgency, and harm potential.
    Respond with ONLY the priority level word.Case details: ${caseText}`;
    
    const result = await model.generateContent(prompt);
    const response = result.response;
    const textResponse = response.text().trim().toLowerCase();
    
    if (textResponse.includes("critical")) return "Critical";
    if (textResponse.includes("high")) return "High";
    if (textResponse.includes("medium")) return "Medium";
    if (textResponse.includes("low")) return "Low";
    
    return "Medium"; // Default
  } catch (error) {
    console.error("Gemini API Error:", error);
    
    // Fallback logic
    const text = caseText.toLowerCase();
    if (text.includes("murder") || text.includes("homicide") || 
        text.includes("terrorism") || text.includes("kidnap")) {
      return "Critical";
    } else if (text.includes("robbery") || text.includes("assault") || 
              text.includes("rape") || text.includes("violence")) {
      return "High";
    } else if (text.includes("theft") || text.includes("fraud") || 
              text.includes("drug")) {
      return "Medium";
    } else {
      return "Low";
    }
  }
}