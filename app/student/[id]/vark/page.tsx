'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../../firebase';
import Link from 'next/link';

export default function VarkAssessment() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [learningPreference, setLearningPreference] = useState('');
  const [studyEnvironment, setStudyEnvironment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const docRef = doc(db, 'students', id);
      // We use updateDoc to append this new data without deleting their master profile
      await updateDoc(docRef, {
        varkAssessment: {
          primaryStyle: learningPreference,
          preferredEnvironment: studyEnvironment,
          completedAt: new Date().toISOString()
        }
      });
      
      alert("Success! VARK Learning Style logged.");
      router.push(`/student/${id}`); // Send them back to the student's master profile
    } catch (error) {
      console.error("Error saving VARK:", error);
      alert("Error saving data. Check terminal.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen p-8 bg-gray-50 text-gray-900">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-gray-100">
        <Link href={`/student/${id}`} className="text-blue-600 text-sm mb-6 inline-block hover:underline">
          &larr; Back to Profile
        </Link>
        
        <h1 className="text-3xl font-bold text-blue-900 mb-2">VARK Learning Indicator</h1>
        <p className="text-gray-600 mb-8">Determine how this student best absorbs and processes academic information.</p>
        
        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Question 1: VARK Spectrum */}
          <div className="space-y-3">
            <label className="block font-bold text-lg text-gray-800">
              1. When trying to learn a new, difficult concept, how do you prefer it to be presented?
            </label>
            <div className="space-y-2">
              <label className="flex items-center space-x-3 p-3 border rounded hover:bg-gray-50 cursor-pointer">
                <input type="radio" name="vark" value="Visual" required onChange={(e) => setLearningPreference(e.target.value)} className="w-4 h-4 text-blue-600" />
                <span><strong>Visual:</strong> Looking at charts, diagrams, and color-coded notes.</span>
              </label>
              <label className="flex items-center space-x-3 p-3 border rounded hover:bg-gray-50 cursor-pointer">
                <input type="radio" name="vark" value="Auditory" onChange={(e) => setLearningPreference(e.target.value)} className="w-4 h-4 text-blue-600" />
                <span><strong>Auditory:</strong> Listening to lectures and discussing topics out loud.</span>
              </label>
              <label className="flex items-center space-x-3 p-3 border rounded hover:bg-gray-50 cursor-pointer">
                <input type="radio" name="vark" value="Reading/Writing" onChange={(e) => setLearningPreference(e.target.value)} className="w-4 h-4 text-blue-600" />
                <span><strong>Reading/Writing:</strong> Reading textbooks and rewriting detailed notes.</span>
              </label>
              <label className="flex items-center space-x-3 p-3 border rounded hover:bg-gray-50 cursor-pointer">
                <input type="radio" name="vark" value="Kinesthetic" onChange={(e) => setLearningPreference(e.target.value)} className="w-4 h-4 text-blue-600" />
                <span><strong>Kinesthetic:</strong> Hands-on practice, examples, and physical movement.</span>
              </label>
            </div>
          </div>

          {/* Question 2: Study Environment */}
          <div className="space-y-3">
            <label className="block font-bold text-lg text-gray-800">
              2. What is your ideal environment for deep studying?
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
            {loading ? "Saving to Database..." : "Log Learning Style"}
          </button>
        </form>
      </div>
    </main>
  );
}