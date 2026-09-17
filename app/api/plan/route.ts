import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { student } = await req.json();

    const prompt = `
      You are an expert academic and spiritual mentor at an Islamic university.
      Create a highly actionable, structured "Semester Action Plan" for a student with the following profile:
      
      - Major: ${student.major || 'Unknown'}
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

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    const data = await response.json();

    // NEW: Check if Google sent an error instead of a plan!
    if (!response.ok || data.error) {
      console.error("🔴 GOOGLE API ERROR:", data.error || data);
      return NextResponse.json({ plan: null, error: data.error?.message || "Google API refused the request." }, { status: 400 });
    }

    // NEW: Safely check if the candidates array exists
    if (!data.candidates || !data.candidates[0]) {
      console.error("🔴 UNEXPECTED GOOGLE FORMAT:", data);
      return NextResponse.json({ plan: null, error: "AI returned an empty response." }, { status: 500 });
    }

    const generatedPlan = data.candidates[0].content.parts[0].text;

    return NextResponse.json({ plan: generatedPlan });
  } catch (error) {
    console.error("🔴 SERVER ROUTE ERROR:", error);
    return NextResponse.json({ plan: null, error: "Failed to generate plan." }, { status: 500 });
  }
}