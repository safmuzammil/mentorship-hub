'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../../firebase';
import Link from 'next/link';

export default function MbtiAssessment() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [eOrI, setEOrI] = useState('');
  const [sOrN, setSOrN] = useState('');
  const [tOrF, setTOrF] = useState('');
  const [jOrP, setJOrP] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Combine their answers into the 4-letter type
    const mbtiResult = `${eOrI}${sOrN}${tOrF}${jOrP}`;
    
    try {
      const docRef = doc(db, 'students', id);
      await updateDoc(docRef, {
        mbtiAssessment: {
          type: mbtiResult,
          completedAt: new Date().toISOString()
        }
      });
      
      alert(`Success! MBTI Type logged as: ${mbtiResult}`);
      router.push(`/student/${id}`);
    } catch (error) {
      console.error("Error saving MBTI:", error);
      alert("Error saving data. Check terminal.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen p-8 bg-gray-50 text-gray-900">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-gray-100">
        <Link href={`/student/${id}`} className="text-purple-600 text-sm mb-6 inline-block hover:underline">
          &larr; Back to Profile
        </Link>
        
        <h1 className="text-3xl font-bold text-purple-900 mb-2">MBTI Personality Indicator</h1>
        <p className="text-gray-600 mb-8">Determine the student's psychological preferences in how they perceive the world and make decisions.</p>
        
        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Energy (E vs I) */}
          <div className="space-y-3">
            <label className="block font-bold text-lg text-gray-800">1. After a long, exhausting week of classes, how do you recharge?</label>
            <div className="flex gap-4">
              <label className="flex-1 p-4 border rounded-lg cursor-pointer hover:bg-purple-50 flex flex-col items-center text-center">
                <input type="radio" name="e_i" value="E" required onChange={(e) => setEOrI(e.target.value)} className="mb-2 w-4 h-4 text-purple-600" />
                <span className="font-bold">Extrovert (E)</span>
                <span className="text-sm text-gray-600 mt-1">Spending time with friends and socializing.</span>
              </label>
              <label className="flex-1 p-4 border rounded-lg cursor-pointer hover:bg-purple-50 flex flex-col items-center text-center">
                <input type="radio" name="e_i" value="I" onChange={(e) => setEOrI(e.target.value)} className="mb-2 w-4 h-4 text-purple-600" />
                <span className="font-bold">Introvert (I)</span>
                <span className="text-sm text-gray-600 mt-1">Spending quiet time alone in my room.</span>
              </label>
            </div>
          </div>

          {/* Information (S vs N) */}
          <div className="space-y-3">
            <label className="block font-bold text-lg text-gray-800">2. When learning, what holds your attention more?</label>
            <div className="flex gap-4">
              <label className="flex-1 p-4 border rounded-lg cursor-pointer hover:bg-purple-50 flex flex-col items-center text-center">
                <input type="radio" name="s_n" value="S" required onChange={(e) => setSOrN(e.target.value)} className="mb-2 w-4 h-4 text-purple-600" />
                <span className="font-bold">Sensing (S)</span>
                <span className="text-sm text-gray-600 mt-1">Practical facts, hard data, and concrete reality.</span>
              </label>
              <label className="flex-1 p-4 border rounded-lg cursor-pointer hover:bg-purple-50 flex flex-col items-center text-center">
                <input type="radio" name="s_n" value="N" onChange={(e) => setSOrN(e.target.value)} className="mb-2 w-4 h-4 text-purple-600" />
                <span className="font-bold">Intuition (N)</span>
                <span className="text-sm text-gray-600 mt-1">Big-picture concepts, theories, and ideas.</span>
              </label>
            </div>
          </div>

          {/* Decisions (T vs F) */}
          <div className="space-y-3">
            <label className="block font-bold text-lg text-gray-800">3. When making a difficult decision, what do you prioritize?</label>
            <div className="flex gap-4">
              <label className="flex-1 p-4 border rounded-lg cursor-pointer hover:bg-purple-50 flex flex-col items-center text-center">
                <input type="radio" name="t_f" value="T" required onChange={(e) => setTOrF(e.target.value)} className="mb-2 w-4 h-4 text-purple-600" />
                <span className="font-bold">Thinking (T)</span>
                <span className="text-sm text-gray-600 mt-1">Pure logic, consistency, and objective truth.</span>
              </label>
              <label className="flex-1 p-4 border rounded-lg cursor-pointer hover:bg-purple-50 flex flex-col items-center text-center">
                <input type="radio" name="t_f" value="F" onChange={(e) => setTOrF(e.target.value)} className="mb-2 w-4 h-4 text-purple-600" />
                <span className="font-bold">Feeling (F)</span>
                <span className="text-sm text-gray-600 mt-1">Empathy, harmony, and how it affects others.</span>
              </label>
            </div>
          </div>

          {/* Lifestyle (J vs P) */}
          <div className="space-y-3">
            <label className="block font-bold text-lg text-gray-800">4. How do you approach your daily schedule?</label>
            <div className="flex gap-4">
              <label className="flex-1 p-4 border rounded-lg cursor-pointer hover:bg-purple-50 flex flex-col items-center text-center">
                <input type="radio" name="j_p" value="J" required onChange={(e) => setJOrP(e.target.value)} className="mb-2 w-4 h-4 text-purple-600" />
                <span className="font-bold">Judging (J)</span>
                <span className="text-sm text-gray-600 mt-1">Strictly structured, planned, and organized.</span>
              </label>
              <label className="flex-1 p-4 border rounded-lg cursor-pointer hover:bg-purple-50 flex flex-col items-center text-center">
                <input type="radio" name="j_p" value="P" onChange={(e) => setJOrP(e.target.value)} className="mb-2 w-4 h-4 text-purple-600" />
                <span className="font-bold">Perceiving (P)</span>
                <span className="text-sm text-gray-600 mt-1">Flexible, spontaneous, and adaptable.</span>
              </label>
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full bg-purple-600 text-white font-bold py-4 rounded-lg hover:bg-purple-700 disabled:bg-purple-300 transition-colors">
            {loading ? "Calculating Profile..." : "Log MBTI Profile"}
          </button>
        </form>
      </div>
    </main>
  );
}