import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    const prompt = `
      You are an expert academic and spiritual mentor at an Islamic residential college. 
      Analyze the following student data and provide a tailored mentorship plan.
      
      Student Name: ${data.name}
      Major/Department: ${data.major}
      Biggest Academic Struggle: ${data.academicStruggle}
      Spiritual/Personal Focus: ${data.spiritualStruggle}
      
      Respond STRICTLY in the following JSON format without any markdown formatting or extra text:
      {
        "mbti_estimation": "e.g., INFP, ESTJ (estimate based on data)",
        "academic_analysis": "A 2-sentence analysis of their academic situation",
        "spiritual_analysis": "A 2-sentence analysis of their spiritual state",
        "recommended_book": "Title and Author of one highly relevant book",
        "action_items": ["One practical task", "One spiritual/personal task"]
      }
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    // Clean the AI's response to remove any unexpected markdown backticks before parsing
    let cleanText = response.text || '{}';
    cleanText = cleanText.replace(/```json/gi, '').replace(/```/g, '').trim();

    const aiResult = JSON.parse(cleanText);
    return NextResponse.json(aiResult);

  } catch (error) {
    console.error("AI Generation Error:", error);
    return NextResponse.json({ error: "Failed to generate AI profile" }, { status: 500 });
  }
}