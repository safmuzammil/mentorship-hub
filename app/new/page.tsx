'use client'; 

import { useState } from 'react';
import Link from 'next/link';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase'; 

export default function NewAssessment() {
  const [formData, setFormData] = useState({
    name: '', major: '', energy: 'Introvert', learningStyle: 'Visual', 
    academicStanding: '', academicStruggle: '', salahRating: '5', 
    spiritualStruggle: '', semesterGoal: ''
  });

  const [aiResponse, setAiResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAiResponse(null);
    
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || "Failed to connect");
      
      setAiResponse(data); 

      await addDoc(collection(db, 'students'), {
        ...formData,
        aiProfile: data,
        createdAt: new Date()
      });
      
      alert("Success! Detailed holistic profile generated and saved.");
    } catch (error) {
      console.error("DETAILED ERROR:", error);
      alert("Error: Something went wrong. Check terminal logs!");
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen p-8 bg-gray-50 text-gray-900">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-gray-100">
        <Link href="/" className="text-blue-600 text-sm mb-6 inline-block hover:underline">&larr; Back to Dashboard</Link>
        <h1 className="text-3xl font-bold mb-6">Comprehensive Student Assessment</h1>
        
        <form onSubmit={handleSubmit} className="space-y-8 mb-10">
          
          {/* Section 1: Basic & Academic */}
          <div className="bg-gray-50 p-6 rounded-lg border">
            <h2 className="font-bold text-lg mb-4 text-blue-800">1. Academic Baseline</h2>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1">Student Name</label>
                <input type="text" required className="w-full border p-2 rounded" onChange={(e) => setFormData({...formData, name: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Major / Department</label>
                <input type="text" required className="w-full border p-2 rounded" onChange={(e) => setFormData({...formData, major: e.target.value})} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1">Current Standing/GPA</label>
                <input type="text" placeholder="e.g. 3.4 GPA or 'Good'" required className="w-full border p-2 rounded" onChange={(e) => setFormData({...formData, academicStanding: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Primary Semester Goal</label>
                <input type="text" required className="w-full border p-2 rounded" onChange={(e) => setFormData({...formData, semesterGoal: e.target.value})} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Biggest Academic Struggle</label>
              <textarea required className="w-full border p-2 rounded h-20" onChange={(e) => setFormData({...formData, academicStruggle: e.target.value})} />
            </div>
          </div>

          {/* Section 2: Behavioral & Cognitive (MBTI / VARK) */}
          <div className="bg-gray-50 p-6 rounded-lg border">
            <h2 className="font-bold text-lg mb-4 text-purple-800">2. Behavior & Learning Style</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Social Energy (MBTI focus)</label>
                <select className="w-full border p-2 rounded" onChange={(e) => setFormData({...formData, energy: e.target.value})}>
                  <option>Introvert (Gains energy alone)</option>
                  <option>Extrovert (Gains energy from others)</option>
                  <option>Ambivert (Balanced)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Learning Style (VARK focus)</label>
                <select className="w-full border p-2 rounded" onChange={(e) => setFormData({...formData, learningStyle: e.target.value})}>
                  <option>Visual (Reading, Diagrams)</option>
                  <option>Auditory (Listening, Discussing)</option>
                  <option>Kinesthetic (Hands-on, Doing)</option>
                  <option>Logical (Patterns, Math)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Spiritual & Personal */}
          <div className="bg-gray-50 p-6 rounded-lg border">
            <h2 className="font-bold text-lg mb-4 text-green-800">3. Spiritual & Character (Tarbiyah)</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Salah Connection (1 = Weak, 10 = Strong)</label>
              <input type="range" min="1" max="10" className="w-full" onChange={(e) => setFormData({...formData, salahRating: e.target.value})} />
              <div className="text-center text-sm font-bold text-gray-500">{formData.salahRating} / 10</div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Spiritual / Character Struggle</label>
              <textarea required placeholder="e.g., Struggling with consistency, lowering gaze, motivation..." className="w-full border p-2 rounded h-20" onChange={(e) => setFormData({...formData, spiritualStruggle: e.target.value})} />
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full bg-slate-800 text-white font-bold py-4 rounded-lg hover:bg-slate-700 disabled:bg-slate-400">
            {loading ? "Analyzing Holistic Profile..." : "Generate Full Mentorship Profile"}
          </button>
        </form>

        {aiResponse && (
          <div className="border-t-2 pt-8 mt-8 border-gray-100">
            <h2 className="text-2xl font-bold text-green-700 mb-4">AI Mentorship Plan Saved!</h2>
            <p className="text-gray-600">Head back to the dashboard to view the full detailed breakdown.</p>
          </div>
        )}
      </div>
    </main>
  );
}