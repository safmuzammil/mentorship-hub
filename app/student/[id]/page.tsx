'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../../firebase';

export default function StudentDetail() {
  const params = useParams();
  const id = params.id as string;
  
  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // New State for interactive inputs
  const [newGoal, setNewGoal] = useState('');
  const [newAchievement, setNewAchievement] = useState('');

  // Fetch the student data
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

  // Function to save a new Goal
  const handleAddGoal = async () => {
    if (!newGoal.trim()) return;
    const docRef = doc(db, 'students', id);
    await updateDoc(docRef, { goals: arrayUnion(newGoal) });
    setStudent({ ...student, goals: [...(student.goals || []), newGoal] });
    setNewGoal('');
  };

  // Function to save a new Achievement
  const handleAddAchievement = async () => {
    if (!newAchievement.trim()) return;
    const docRef = doc(db, 'students', id);
    await updateDoc(docRef, { achievements: arrayUnion(newAchievement) });
    setStudent({ ...student, achievements: [...(student.achievements || []), newAchievement] });
    setNewAchievement('');
  };

  if (loading) return <div className="p-8 text-center mt-10">Loading profile...</div>;
  if (!student) return <div className="p-8 text-center mt-10">Student not found.</div>;

  return (
    <main className="min-h-screen p-8 bg-gray-50 text-gray-900">
      <div className="max-w-5xl mx-auto">
        <Link href="/" className="text-blue-600 text-sm mb-6 inline-block hover:underline">
          &larr; Back to Dashboard
        </Link>
        
        {/* Profile Header */}
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 mb-6 flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold capitalize mb-2">{student.name}</h1>
            <p className="text-xl text-gray-600">{student.major}</p>
            <span className="inline-block mt-4 bg-slate-800 text-white text-sm px-3 py-1 rounded-full mr-2">
              {student.aiProfile?.mbti_estimation || "MBTI Pending"}
            </span>
            <span className="inline-block mt-4 bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full">
              {student.learningStyle || "VARK Pending"}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Left Column: AI Analysis */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-l-blue-500">
              <h2 className="font-bold text-lg mb-2">Academic Analysis</h2>
              <p className="text-gray-700">{student.aiProfile?.academic_analysis || "No data yet."}</p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-l-green-500">
              <span className="inline-block mt-4 bg-slate-800 text-white text-sm px-3 py-1 rounded-full mr-2">
              {student.mbtiAssessment?.type || student.aiProfile?.mbti_estimation || "MBTI Pending"}
            </span>
            <span className="inline-block mt-4 bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full">
              {student.varkAssessment?.primaryStyle || "VARK Pending"}
            </span>
            </div>
          </div>

          {/* Right Column: Goals & Achievements */}
          <div className="space-y-6">
            {/* Quick Assessments */}
            <div className="bg-blue-50 p-6 rounded-xl shadow-sm border border-blue-100 mb-6 flex justify-between items-center">
              <div>
                <h2 className="font-bold text-lg text-blue-900">VARK Assessment</h2>
                <p className="text-sm text-blue-700">Determine learning style</p>
              </div>
              <Link href={`/student/${id}/vark`} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm hover:bg-blue-700">
                Start Test &rarr;
              </Link>
            </div>
            <div className="bg-purple-50 p-6 rounded-xl shadow-sm border border-purple-100 flex justify-between items-center mt-4 mb-6">
              <div>
                <h2 className="font-bold text-lg text-purple-900">MBTI Assessment</h2>
                <p className="text-sm text-purple-700">Determine personality type</p>
              </div>
              <Link href={`/student/${id}/mbti`} className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm hover:bg-purple-700">
                Start Test &rarr;
              </Link>
            </div>
            {/* Goals Tracker */}
            <div className="bg-amber-50 p-6 rounded-xl shadow-sm border border-amber-100">
              <h2 className="font-bold text-lg mb-4 text-amber-900">Active Goals</h2>
              <ul className="list-disc pl-5 space-y-2 text-amber-900 mb-4 text-sm">
                {student.goals?.map((goal: string, i: number) => <li key={i}>{goal}</li>) || <p className="text-xs text-amber-700 italic">No goals set yet.</p>}
              </ul>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={newGoal} 
                  onChange={(e) => setNewGoal(e.target.value)} 
                  placeholder="Add a new goal..." 
                  className="w-full text-sm p-2 border rounded"
                />
                <button onClick={handleAddGoal} className="bg-amber-600 text-white px-3 py-2 rounded text-sm font-bold">+</button>
              </div>
            </div>

            {/* Achievements Tracker */}
            <div className="bg-emerald-50 p-6 rounded-xl shadow-sm border border-emerald-100">
              <h2 className="font-bold text-lg mb-4 text-emerald-900">Achievements</h2>
              <ul className="list-disc pl-5 space-y-2 text-emerald-900 mb-4 text-sm">
                {student.achievements?.map((ach: string, i: number) => <li key={i}>{ach}</li>) || <p className="text-xs text-emerald-700 italic">No achievements logged yet.</p>}
              </ul>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={newAchievement} 
                  onChange={(e) => setNewAchievement(e.target.value)} 
                  placeholder="Log an achievement..." 
                  className="w-full text-sm p-2 border rounded"
                />
                <button onClick={handleAddAchievement} className="bg-emerald-600 text-white px-3 py-2 rounded text-sm font-bold">+</button>
              </div>
            </div>

          </div>
        </div>

      </div>
    </main>
  );
}