'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../../firebase';

export default function StudentDetail() {
  const params = useParams();
  const id = params.id as string;
  
  // State variables for the page
  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [newGoal, setNewGoal] = useState('');
  const [newAchievement, setNewAchievement] = useState('');
  
  // NEW: State for the AI generator
  const [generatingPlan, setGeneratingPlan] = useState(false);

  // Fetch the student data on load
  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const docRef = doc(db, 'students', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setStudent(docSnap.data());
        }
      } catch (error) {
        console.error("Error fetching student:", error);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchStudent();
  }, [id]);

  // Handlers for Goals and Achievements
  const handleAddGoal = async () => {
    if (!newGoal.trim()) return;
    const docRef = doc(db, 'students', id);
    await updateDoc(docRef, { goals: arrayUnion(newGoal) });
    setStudent({ ...student, goals: [...(student.goals || []), newGoal] });
    setNewGoal('');
  };

  const handleAddAchievement = async () => {
    if (!newAchievement.trim()) return;
    const docRef = doc(db, 'students', id);
    await updateDoc(docRef, { achievements: arrayUnion(newAchievement) });
    setStudent({ ...student, achievements: [...(student.achievements || []), newAchievement] });
    setNewAchievement('');
  };

  // NEW: Handler for calling the AI API
  const handleGeneratePlan = async () => {
    setGeneratingPlan(true);
    try {
      const res = await fetch('/api/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ student })
      });
      const data = await res.json();
      
      if (data.plan) {
        const docRef = doc(db, 'students', id);
        await updateDoc(docRef, { semesterPlan: data.plan });
        setStudent({ ...student, semesterPlan: data.plan });
      } else {
        alert("Could not generate plan. Please ensure you added your GEMINI_API_KEY to Vercel.");
      }
    } catch (error) {
      console.error("Failed to generate plan", error);
      alert("Error connecting to the AI generator.");
    } finally {
      setGeneratingPlan(false);
    }
  };

  if (loading) return <div className="p-8 text-center mt-10">Loading profile...</div>;
  if (!student) return <div className="p-8 text-center mt-10">Student not found.</div>;

  return (
    <main className="min-h-screen p-8 bg-gray-50 text-gray-900">
      <div className="max-w-6xl mx-auto">
        <Link href="/" className="text-blue-600 text-sm mb-6 inline-block hover:underline">
          &larr; Back to Dashboard
        </Link>
        
        {/* Profile Header */}
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h1 className="text-4xl font-bold capitalize mb-2">{student.name}</h1>
            <p className="text-xl text-gray-600">{student.major}</p>
            <div className="mt-4 flex gap-2">
              <span className="inline-block bg-slate-800 text-white text-sm px-3 py-1 rounded-full">
                {student.mbtiAssessment?.type || student.aiProfile?.mbti_estimation || "MBTI Pending"}
              </span>
              <span className="inline-block bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full">
                {student.varkAssessment?.primaryStyle || "VARK Pending"}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column: AI Analysis & Semester Plan */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-l-blue-500">
              <h2 className="font-bold text-lg mb-2">Academic Analysis</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{student.aiProfile?.academic_analysis || "No data yet. Complete the assessments to generate insights."}</p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-l-green-500">
              <h2 className="font-bold text-lg mb-2">Spiritual Analysis</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{student.aiProfile?.spiritual_analysis || "No data yet. Complete the spiritual indicator to generate insights."}</p>
            </div>

            {/* Semester Action Plan Box */}
            <div className="bg-slate-900 p-6 rounded-xl shadow-sm text-white mt-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-bold text-xl text-yellow-400">Semester Action Plan</h2>
                <button 
                  onClick={handleGeneratePlan} 
                  disabled={generatingPlan}
                  className="bg-yellow-500 text-slate-900 px-4 py-2 rounded-lg text-sm font-bold shadow-sm hover:bg-yellow-400 disabled:bg-slate-700 disabled:text-slate-500 transition"
                >
                  {generatingPlan ? "🤖 Gemini is thinking..." : "✨ Generate AI Plan"}
                </button>
              </div>
              
              {student.semesterPlan ? (
                <div className="prose prose-invert max-w-none text-gray-300 whitespace-pre-wrap">
                  {student.semesterPlan}
                </div>
              ) : (
                <p className="text-gray-400 italic">No plan generated yet. Ensure assessments are complete, then click generate to get AI-powered book recommendations and routines.</p>
              )}
            </div>
          </div>

          {/* Right Column: Tests, Goals & Achievements */}
          <div className="space-y-6">
            
            <div className="space-y-3">
              <div className="bg-blue-50 p-4 rounded-xl shadow-sm border border-blue-100 flex justify-between items-center">
                <div>
                  <h2 className="font-bold text-blue-900">VARK Test</h2>
                  <p className="text-xs text-blue-700">Learning style</p>
                </div>
                <Link href={`/student/${id}/vark`} className="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-bold shadow-sm hover:bg-blue-700 transition">
                  Start &rarr;
                </Link>
              </div>

              <div className="bg-purple-50 p-4 rounded-xl shadow-sm border border-purple-100 flex justify-between items-center">
                <div>
                  <h2 className="font-bold text-purple-900">MBTI Test</h2>
                  <p className="text-xs text-purple-700">Personality</p>
                </div>
                <Link href={`/student/${id}/mbti`} className="bg-purple-600 text-white px-3 py-2 rounded-lg text-sm font-bold shadow-sm hover:bg-purple-700 transition">
                  Start &rarr;
                </Link>
              </div>

              <div className="bg-green-50 p-4 rounded-xl shadow-sm border border-green-100 flex justify-between items-center">
                <div>
                  <h2 className="font-bold text-green-900">Spiritual Test</h2>
                  <p className="text-xs text-green-700">Tarbiyah metrics</p>
                </div>
                <Link href={`/student/${id}/spiritual`} className="bg-green-600 text-white px-3 py-2 rounded-lg text-sm font-bold shadow-sm hover:bg-green-700 transition">
                  Start &rarr;
                </Link>
              </div>
            </div>

            <div className="bg-amber-50 p-6 rounded-xl shadow-sm border border-amber-100">
              <h2 className="font-bold text-lg mb-4 text-amber-900">Active Goals</h2>
              <ul className="list-disc pl-5 space-y-2 text-amber-900 mb-4 text-sm">
                {student.goals?.map((goal: string, i: number) => <li key={i}>{goal}</li>) || <p className="text-xs text-amber-700 italic">No goals set yet.</p>}
              </ul>
              <div className="flex gap-2">
                <input type="text" value={newGoal} onChange={(e) => setNewGoal(e.target.value)} placeholder="Add goal..." className="w-full text-sm p-2 border rounded" />
                <button onClick={handleAddGoal} className="bg-amber-600 text-white px-3 py-2 rounded text-sm font-bold">+</button>
              </div>
            </div>

            <div className="bg-emerald-50 p-6 rounded-xl shadow-sm border border-emerald-100">
              <h2 className="font-bold text-lg mb-4 text-emerald-900">Achievements</h2>
              <ul className="list-disc pl-5 space-y-2 text-emerald-900 mb-4 text-sm">
                {student.achievements?.map((ach: string, i: number) => <li key={i}>{ach}</li>) || <p className="text-xs text-emerald-700 italic">No achievements logged yet.</p>}
              </ul>
              <div className="flex gap-2">
                <input type="text" value={newAchievement} onChange={(e) => setNewAchievement(e.target.value)} placeholder="Log win..." className="w-full text-sm p-2 border rounded" />
                <button onClick={handleAddAchievement} className="bg-emerald-600 text-white px-3 py-2 rounded text-sm font-bold">+</button>
              </div>
            </div>

          </div>
        </div>

      </div>
    </main>
  );
}