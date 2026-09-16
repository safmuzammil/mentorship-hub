'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../../firebase';
import Link from 'next/link';

// Detailed Situational Questions
const varkQuestions = [
  {
    question: "1. You are helping someone find their way to the airport. Do you:",
    options: [
      { text: "Draw them a map.", type: "Visual" },
      { text: "Tell them the directions out loud.", type: "Auditory" },
      { text: "Write down a list of street names and turns.", type: "Reading/Writing" },
      { text: "Go with them or drive ahead of them.", type: "Kinesthetic" }
    ]
  },
  {
    question: "2. You are learning to use a complex new software for your coursework. Do you:",
    options: [
      { text: "Look at the pictures and diagrams in the manual.", type: "Visual" },
      { text: "Talk to a classmate who knows how to use it.", type: "Auditory" },
      { text: "Read the written instructions and documentation.", type: "Reading/Writing" },
      { text: "Just start clicking around and figuring it out by doing it.", type: "Kinesthetic" }
    ]
  },
  {
    question: "3. You are planning a study group schedule. You want feedback on the plan. Do you:",
    options: [
      { text: "Show them a visual calendar or chart of the times.", type: "Visual" },
      { text: "Describe the schedule to them over a call.", type: "Auditory" },
      { text: "Send them a printed itinerary to read.", type: "Reading/Writing" },
      { text: "Walk through a physical practice run of the schedule.", type: "Kinesthetic" }
    ]
  },
  {
    question: "4. A professor is explaining a difficult concept. You prefer it when they:",
    options: [
      { text: "Use the whiteboard to draw diagrams and flowcharts.", type: "Visual" },
      { text: "Explain it verbally using different tones and stories.", type: "Auditory" },
      { text: "Provide a detailed handout with bullet points to read.", type: "Reading/Writing" },
      { text: "Bring a physical model or run a live experiment.", type: "Kinesthetic" }
    ]
  },
  {
    question: "5. You are about to buy a new laptop for university. What influences you most?",
    options: [
      { text: "It looks modern and has a cool, sleek design.", type: "Visual" },
      { text: "The salesperson or a YouTube review telling me about it.", type: "Auditory" },
      { text: "Reading the specific technical details and specs online.", type: "Reading/Writing" },
      { text: "Holding it in my hand and testing the keyboard.", type: "Kinesthetic" }
    ]
  },
  {
    question: "6. Remember a time when you learned how to do something totally new. You learned best by:",
    options: [
      { text: "Seeing diagrams, sketches, or visual clues.", type: "Visual" },
      { text: "Listening to explanations or asking questions.", type: "Auditory" },
      { text: "Reading written instructions.", type: "Reading/Writing" },
      { text: "Practicing and doing it yourself immediately.", type: "Kinesthetic" }
    ]
  }
];

export default function VarkAssessment() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  // Store answers as { questionIndex: "VARK Type" }
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [studyEnvironment, setStudyEnvironment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSelect = (qIndex: number, type: string) => {
    setAnswers(prev => ({ ...prev, [qIndex]: type }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Make sure they answered all 6 questions
    if (Object.keys(answers).length < varkQuestions.length) {
      alert("Please answer all the questions before submitting!");
      return;
    }

    setLoading(true);

    // Tally the scores programmatically
    const scores: Record<string, number> = { "Visual": 0, "Auditory": 0, "Reading/Writing": 0, "Kinesthetic": 0 };
    Object.values(answers).forEach(type => {
      scores[type] += 1;
    });

    // Find the highest score to determine primary style
    let primaryStyle = "Visual";
    let maxScore = 0;
    for (const [style, score] of Object.entries(scores)) {
      if (score > maxScore) {
        maxScore = score;
        primaryStyle = style;
      }
    }
    
    try {
      const docRef = doc(db, 'students', id);
      await updateDoc(docRef, {
        varkAssessment: {
          primaryStyle: primaryStyle,
          detailedScores: scores, // We save the exact tally for the AI to analyze later!
          preferredEnvironment: studyEnvironment,
          completedAt: new Date().toISOString()
        }
      });
      
      alert(`Success! Dominant Learning Style calculated as: ${primaryStyle}`);
      router.push(`/student/${id}`);
    } catch (error) {
      console.error("Error saving VARK:", error);
      alert("Error saving data. Check terminal.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen p-8 bg-gray-50 text-gray-900">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-gray-100">
        <Link href={`/student/${id}`} className="text-blue-600 text-sm mb-6 inline-block hover:underline">
          &larr; Back to Profile
        </Link>
        
        <h1 className="text-3xl font-bold text-blue-900 mb-2">Comprehensive VARK Indicator</h1>
        <p className="text-gray-600 mb-8">Answer these situational questions to automatically calculate the dominant learning style.</p>
        
        <form onSubmit={handleSubmit} className="space-y-8">
          
          {varkQuestions.map((q, index) => (
            <div key={index} className="space-y-3 bg-blue-50/30 p-6 rounded-lg border border-blue-50">
              <label className="block font-bold text-lg text-gray-800">{q.question}</label>
              <div className="space-y-2">
                {q.options.map((opt, oIndex) => (
                  <label key={oIndex} className="flex items-center space-x-3 p-3 bg-white border rounded hover:bg-blue-50 cursor-pointer transition-colors">
                    <input 
                      type="radio" 
                      name={`question_${index}`} 
                      value={opt.type} 
                      onChange={() => handleSelect(index, opt.type)} 
                      className="w-4 h-4 text-blue-600" 
                    />
                    <span>{opt.text}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}

          {/* Study Environment */}
          <div className="space-y-3 bg-slate-50 p-6 rounded-lg border border-slate-100">
            <label className="block font-bold text-lg text-gray-800">
              7. What is your ideal environment for deep studying?
            </label>
            <select required className="w-full border p-3 rounded bg-white text-gray-700" onChange={(e) => setStudyEnvironment(e.target.value)}>
              <option value="">Select an environment...</option>
              <option value="Total Silence">Total silence (Library/Quiet Room)</option>
              <option value="Ambient Noise">Ambient noise (Coffee shop vibes)</option>
              <option value="Group Study">Group study with classmates</option>
              <option value="Music">Listening to instrumental music or white noise</option>
            </select>
          </div>

          <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white font-bold py-4 rounded-lg hover:bg-blue-700 disabled:bg-blue-300 transition-colors">
            {loading ? "Calculating Profile..." : "Calculate & Log Learning Style"}
          </button>
        </form>
      </div>
    </main>
  );
}