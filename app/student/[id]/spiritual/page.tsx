'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../../firebase';
import Link from 'next/link';

export default function SpiritualAssessment() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [salahConsistency, setSalahConsistency] = useState('');
  const [fajrStruggle, setFajrStruggle] = useState('');
  const [quranConnection, setQuranConnection] = useState('');
  const [tazkiyahObstacle, setTazkiyahObstacle] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const docRef = doc(db, 'students', id);
      await updateDoc(docRef, {
        spiritualAssessment: {
          salahConsistency, fajrStruggle, quranConnection, tazkiyahObstacle,
          completedAt: new Date().toISOString()
        }
      });
      alert("Success! Spiritual indicator logged.");
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
        <Link href={`/student/${id}`} className="text-green-600 text-sm mb-6 inline-block hover:underline">&larr; Back to Profile</Link>
        <h1 className="text-3xl font-bold text-green-900 mb-2">Spiritual & Tarbiyah Indicator</h1>
        <p className="text-gray-600 mb-8">Assess baseline spiritual health to guide customized mentorship.</p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-3 bg-green-50/30 p-6 rounded-lg border border-green-50">
            <label className="block font-bold text-lg text-gray-800">1. Overall Salah Consistency:</label>
            <select required className="w-full border p-3 rounded bg-white text-gray-700" onChange={(e) => setSalahConsistency(e.target.value)}>
              <option value="">Select status...</option>
              <option value="Excellent (All 5 on time, Jama'ah when possible)">Excellent (All 5 on time, Jama'ah when possible)</option>
              <option value="Good (All 5, occasionally delayed)">Good (All 5, occasionally delayed)</option>
              <option value="Struggling (Missing 1-2 prayers frequently)">Struggling (Missing 1-2 prayers frequently)</option>
              <option value="Weak (Struggling to establish the habit)">Weak (Struggling to establish the habit)</option>
            </select>
          </div>

          <div className="space-y-3 bg-green-50/30 p-6 rounded-lg border border-green-50">
            <label className="block font-bold text-lg text-gray-800">2. Specifically regarding Fajr prayer, what is the biggest hurdle?</label>
            <select required className="w-full border p-3 rounded bg-white text-gray-700" onChange={(e) => setFajrStruggle(e.target.value)}>
              <option value="">Select obstacle...</option>
              <option value="No struggle, I wake up easily">No struggle, I wake up easily</option>
              <option value="Late screen time / bad sleep schedule">Late screen time / bad sleep schedule</option>
              <option value="Deep sleeper / alarm doesn't work">Deep sleeper / alarm doesn't work</option>
              <option value="Lack of spiritual motivation at that hour">Lack of spiritual motivation at that hour</option>
            </select>
          </div>

          <div className="space-y-3 bg-green-50/30 p-6 rounded-lg border border-green-50">
            <label className="block font-bold text-lg text-gray-800">3. Current connection with the Quran:</label>
            <select required className="w-full border p-3 rounded bg-white text-gray-700" onChange={(e) => setQuranConnection(e.target.value)}>
              <option value="">Select status...</option>
              <option value="Daily recitation and/or memorization">Daily recitation and/or memorization</option>
              <option value="A few times a week">A few times a week</option>
              <option value="Only on Fridays (Surah Kahf) or rarely">Only on Fridays (Surah Kahf) or rarely</option>
              <option value="Disconnected right now">Disconnected right now</option>
            </select>
          </div>

          <div className="space-y-3 bg-green-50/30 p-6 rounded-lg border border-green-50">
            <label className="block font-bold text-lg text-gray-800">4. What is the primary Tazkiyah (internal) struggle right now?</label>
            <textarea required rows={3} placeholder="E.g., Managing social media distraction, maintaining sincerity in studies, dealing with peer pressure..." className="w-full border p-3 rounded text-gray-700" onChange={(e) => setTazkiyahObstacle(e.target.value)}></textarea>
          </div>

          <button type="submit" disabled={loading} className="w-full bg-green-600 text-white font-bold py-4 rounded-lg hover:bg-green-700 disabled:bg-green-300">
            {loading ? "Logging data..." : "Log Spiritual Indicator"}
          </button>
        </form>
      </div>
    </main>
  );
}