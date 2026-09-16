import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { student } = await req.json();

    // Construct the prompt using the student's exact test results
    const prompt = `
      You are an expert academic and spiritual mentor at an Islamic university.
      Create a highly actionable, structured "Semester Action Plan" for a student with the following profile:
      
      - Major: ${student.major}
      - Personality (MBTI): ${student.mbtiAssessment?.type || 'Unknown'}
      - Learning Style (VARK): ${student.varkAssessment?.primaryStyle || 'Unknown'}
      - Spiritual Struggle: ${student.spiritualAssessment?.tazkiyahObstacle || 'Unknown'}
      - Salah Consistency: ${student.spiritualAssessment?.salahConsistency || 'Unknown'}

      Based strictly on this profile, provide a customized plan formatted exactly with these three headings:
      
      ### 📚 Recommended Reading
      Suggest 2 specific books (one for personal/academic growth suited to their MBTI, and one Islamic/Tarbiyah book suited to their spiritual struggle). Include a 1-sentence reason why for each.

      ### 🧠 Academic Strategy
      Suggest 3 highly specific study habits tailored to their exact VARK learning style and MBTI.

      ### 🕌 Spiritual Routine
      Suggest 2 daily actionable habits to specifically overcome their stated Tarbiyah/Fajr struggles.
    `;

    // Call the Gemini API
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    const data = await response.json();
    const generatedPlan = data.candidates[0].content.parts[0].text;

    return NextResponse.json({ plan: generatedPlan });
  } catch (error) {
    console.error("AI Error:", error);
    return NextResponse.json({ error: "Failed to generate plan." }, { status: 500 });
  }
}