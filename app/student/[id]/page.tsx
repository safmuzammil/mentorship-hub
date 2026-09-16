'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';

export default function StudentDetail() {
  const params = useParams();
  const id = params.id as string; // Grabs the ID from the URL
  
  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const docRef = doc(db, 'students', id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setStudent(docSnap.data());
        } else {
          console.log("No such student found!");
        }
      } catch (error) {
        console.error("Error fetching student:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchStudent();
  }, [id]);

  if (loading) return <div className="p-8 text-center mt-10">Loading profile...</div>;
  if (!student) return <div className="p-8 text-center mt-10">Student not found.</div>;

  return (
    <main className="min-h-screen p-8 bg-gray-50 text-gray-900">
      <div className="max-w-4xl mx-auto">
        <Link href="/" className="text-blue-600 text-sm mb-6 inline-block hover:underline">
          &larr; Back to Dashboard
        </Link>
        
        {/* Header */}
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 mb-6">
          <h1 className="text-4xl font-bold capitalize mb-2">{student.name}</h1>
          <p className="text-xl text-gray-600">{student.major}</p>
          <span className="inline-block mt-4 bg-slate-800 text-white text-sm px-3 py-1 rounded-full">
            {student.aiProfile?.mbti_estimation}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* AI Analysis Column */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-blue-500">
              <h2 className="font-bold text-lg mb-2">Academic Analysis</h2>
              <p className="text-gray-700">{student.aiProfile?.academic_analysis}</p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-green-500">
              <h2 className="font-bold text-lg mb-2">Spiritual Analysis</h2>
              <p className="text-gray-700">{student.aiProfile?.spiritual_analysis}</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 border-l-4 border-l-purple-500">
              <h2 className="font-bold text-lg mb-2">Recommended Reading</h2>
              <p className="text-gray-700 font-semibold">{student.aiProfile?.recommended_book}</p>
            </div>
          </div>

          {/* Action Items & Raw Data Column */}
          <div className="space-y-6">
            <div className="bg-amber-50 p-6 rounded-xl shadow-sm border border-amber-100">
              <h2 className="font-bold text-lg mb-4 text-amber-900">Mentor Action Items</h2>
              <ul className="list-disc pl-5 space-y-2 text-amber-900">
                {student.aiProfile?.action_items?.map((item: string, i: number) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="bg-gray-100 p-6 rounded-xl shadow-sm">
              <h2 className="font-bold text-lg mb-4 text-gray-700">Baseline Data</h2>
              <div className="mb-4">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Academic Struggle</span>
                <p className="text-sm mt-1">{student.academicStruggle}</p>
              </div>
              <div>
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Spiritual Focus</span>
                <p className="text-sm mt-1">{student.spiritualStruggle}</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}