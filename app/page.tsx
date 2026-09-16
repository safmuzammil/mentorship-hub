'use client'; 

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from './firebase'; 

type Student = {
  id: string;
  name: string;
  major: string;
  aiProfile: any;
};

export default function Home() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const q = query(collection(db, 'students'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        
        const studentData: Student[] = [];
        querySnapshot.forEach((doc) => {
          studentData.push({ id: doc.id, ...doc.data() } as Student);
        });
        
        setStudents(studentData);
      } catch (error) {
        console.error("Error fetching students:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  return (
    <main className="min-h-screen p-8 bg-gray-50 text-gray-900">
      
      <header className="mb-10 border-b pb-4">
        <h1 className="text-4xl font-bold text-slate-800">Mentorship Hub</h1>
        <p className="text-slate-600 mt-2 text-lg">
          Student Profiles & Assessment Tracking
        </p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        
        <Link href="/new" className="bg-white p-6 rounded-xl shadow-sm border-2 border-dashed border-gray-300 flex flex-col items-center justify-center h-48 hover:bg-gray-50 transition-colors cursor-pointer">
           <div className="bg-blue-100 text-blue-600 rounded-full w-12 h-12 flex items-center justify-center mb-3 text-2xl">
             +
           </div>
           <span className="font-semibold text-gray-700">New Assessment</span>
           <span className="text-sm text-gray-500 mt-1">Add student data</span>
        </Link>

        {loading && (
          <div className="col-span-full mt-8 text-gray-500 text-center animate-pulse">
            Loading student profiles...
          </div>
        )}

        {!loading && students.map((student) => (
          <Link href={`/student/${student.id}`} key={student.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col min-h-[12rem] hover:shadow-md transition-shadow cursor-pointer">
             <h2 className="font-bold text-xl mb-1 capitalize">{student.name}</h2>
             <p className="text-sm text-gray-500 mb-4">{student.major}</p>
             
             <div className="mt-auto space-y-2">
               <p className="text-xs bg-green-50 text-green-800 p-2 rounded">
                 <strong>MBTI:</strong> {student.aiProfile?.mbti_estimation || "Pending"}
               </p>
               <p className="text-xs bg-blue-50 text-blue-800 p-2 rounded truncate" title={student.aiProfile?.recommended_book}>
                 <strong>Book:</strong> {student.aiProfile?.recommended_book || "Pending"}
               </p>
             </div>
          </Link>
        ))}

      </div>
    </main>
  );
}