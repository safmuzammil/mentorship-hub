import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    const prompt = `
      You are an expert academic and spiritual mentor at an Islamic residential college. 
      Analyze the following detailed student assessment to generate a mentorship plan.
      
      **Student Profile Data:**
      - Name: ${data.name}
      - Major/Department: ${data.major}
      - Social Energy (Introvert/Extrovert): ${data.energy}
      - Primary Learning Style (VARK): ${data.learningStyle}
      - Current Academic Standing: ${data.academicStanding}
      - Biggest Academic Struggle: ${data.academicStruggle}
      - Salah (Prayer) Connection (1-10): ${data.salahRating}
      - Spiritual/Personal Struggle: ${data.spiritualStruggle}
      - Primary Goal this Semester: ${data.semesterGoal}
      
      Respond STRICTLY in the following JSON format without any markdown formatting or extra text:
      {
        "mbti_estimation": "e.g., INFP, ESTJ (estimate heavily based on their social energy and goals)",
        "learning_profile": "A 1-sentence summary of their VARK learning style and how to leverage it",
        "academic_analysis": "A 2-sentence analysis of their academic situation and struggles",
        "spiritual_analysis": "A 2-sentence analysis of their spiritual state and Salah rating",
        "recommended_book": "Title and Author of one highly relevant book based on their holistic profile",
        "action_items": ["One practical academic task", "One spiritual/character task"]
      }
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });

    let cleanText = response.text || '{}';
    cleanText = cleanText.replace(/```json/gi, '').replace(/```/g, '').trim();

    const aiResult = JSON.parse(cleanText);
    return NextResponse.json(aiResult);

  } catch (error) {
    console.error("AI Generation Error:", error);
    return NextResponse.json({ error: "Failed to generate AI profile" }, { status: 500 });
  }
}