'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../../firebase';
import Link from 'next/link';

// Detailed MBTI Questions mapped to their specific trait dichotomy
const mbtiQuestions = [
  { trait: 'E_I', q: "1. At a large university networking event, you generally:", options: [{ text: "Talk to many different people and leave energized.", val: "E" }, { text: "Stick to a few people you know and leave feeling drained.", val: "I" }] },
  { trait: 'E_I', q: "2. When solving a difficult problem, do you prefer to:", options: [{ text: "Talk it out loud with a group.", val: "E" }, { text: "Think it through silently on your own first.", val: "I" }] },
  { trait: 'S_N', q: "3. If you were assigned a creative project, you would prefer:", options: [{ text: "Clear, step-by-step instructions on what is expected.", val: "S" }, { text: "A broad theme where you can invent your own approach.", val: "N" }] },
  { trait: 'S_N', q: "4. In your free time, are you more drawn to:", options: [{ text: "Practical skills, real-world news, and actionable facts.", val: "S" }, { text: "Philosophy, future possibilities, and abstract concepts.", val: "N" }] },
  { trait: 'T_F', q: "5. As a project leader, if a team member is underperforming, you:", options: [{ text: "Address the metrics and objectively critique their output.", val: "T" }, { text: "Check on their well-being and try to support them emotionally.", val: "F" }] },
  { trait: 'T_F', q: "6. Which compliment means more to you?", options: [{ text: "You are highly competent and logical.", val: "T" }, { text: "You are a very warm and compassionate person.", val: "F" }] },
  { trait: 'J_P', q: "7. When planning a weekend trip, you prefer to:", options: [{ text: "Have a strict itinerary booked in advance.", val: "J" }, { text: "Go with the flow and decide what to do when you get there.", val: "P" }] },
  { trait: 'J_P', q: "8. When working on a major essay, your timeline usually looks like:", options: [{ text: "Steady progress, finishing well before the deadline.", val: "J" }, { text: "A massive burst of energy and pressure right at the deadline.", val: "P" }] },
];

export default function MbtiAssessment() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(false);

  const handleSelect = (qIndex: number, val: string) => {
    setAnswers(prev => ({ ...prev, [qIndex]: val }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (Object.keys(answers).length < mbtiQuestions.length) {
      alert("Please answer all questions."); return;
    }
    setLoading(true);

    // Tally the scores
    const scores = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };
    Object.values(answers).forEach(val => { scores[val as keyof typeof scores]++; });

    // Calculate final type
    const type = `${scores.E >= scores.I ? 'E' : 'I'}${scores.S >= scores.N ? 'S' : 'N'}${scores.T >= scores.F ? 'T' : 'F'}${scores.J >= scores.P ? 'J' : 'P'}`;
    
    try {
      const docRef = doc(db, 'students', id);
      await updateDoc(docRef, {
        mbtiAssessment: { type, detailedScores: scores, completedAt: new Date().toISOString() }
      });
      alert(`Success! Calculated Type: ${type}`);
      router.push(`/student/${id}`);
    } catch (error) {
      console.error(error); alert("Error saving data.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen p-8 bg-gray-50 text-gray-900">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-gray-100">
        <Link href={`/student/${id}`} className="text-purple-600 text-sm mb-6 inline-block hover:underline">&larr; Back to Profile</Link>
        <h1 className="text-3xl font-bold text-purple-900 mb-2">Detailed MBTI Indicator</h1>
        <p className="text-gray-600 mb-8">Select the option that most naturally fits the student's behavior.</p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {mbtiQuestions.map((q, index) => (
            <div key={index} className="bg-purple-50/30 p-6 rounded-lg border border-purple-50">
              <label className="block font-bold text-lg text-gray-800 mb-3">{q.q}</label>
              <div className="space-y-2">
                {q.options.map((opt, oIndex) => (
                  <label key={oIndex} className="flex items-center space-x-3 p-3 bg-white border rounded hover:bg-purple-50 cursor-pointer">
                    <input type="radio" name={`q_${index}`} value={opt.val} onChange={() => handleSelect(index, opt.val)} className="w-4 h-4 text-purple-600" />
                    <span>{opt.text}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
          <button type="submit" disabled={loading} className="w-full bg-purple-600 text-white font-bold py-4 rounded-lg hover:bg-purple-700 disabled:bg-purple-300">
            {loading ? "Calculating..." : "Calculate MBTI"}
          </button>
        </form>
      </div>
    </main>
  );
}