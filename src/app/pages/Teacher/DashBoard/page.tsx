// src/app/pages/Teacher/DashBoard/page.tsx
"use client";

import { useEffect, useState } from "react";
import StuNav from "@/src/app/components/StuNav";
import Link from "next/link";
import { 
  Users, 
  BookOpen, 
  CheckCircle2, 
  ArrowRight,
  ShieldCheck,
  BadgeCheck,
  Phone,
  Mail
} from "lucide-react";

interface Teacher {
  id: number;
  name: string;
  department: string;
  designation: string;
  assigned_courses: string[];
}

export default function TeacherDashboard() {
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTeacherData() {
      try {
        const [resSession, resStudents] = await Promise.all([
          fetch("/api/auth/session"),
          fetch("/api/applicants")
        ]);

        if (resSession.ok) {
          const session = await resSession.json();
          if (session.teacherId) {
            const resT = await fetch(`/api/teachers?id=${session.teacherId}`);
            if (resT.ok) setTeacher(await resT.json());
          }
        }

        if (resStudents.ok) {
          const s = await resStudents.json();
          setStudents(s);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadTeacherData();
  }, []);

  const totalStudents = students.length;
  const verifiedDocsCount = students.filter(s => (s.documents_status || "Verified") === "Verified").length;

  return (
    <>
      <StuNav name="Teacher Portal" role="teacher" />

      <main className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-6">

          {/* Hero Welcome Banner */}
          <div className="bg-[#06090C] rounded-3xl p-6 sm:p-8 text-white border border-[#85B6E9]/20 shadow-md relative overflow-hidden">
            <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#4285CD]/20 text-[#85B6E9] text-xs font-bold mb-3 border border-[#85B6E9]/30">
                  <span>Instructor & Training Faculty</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  Welcome back, {teacher ? teacher.name : "Faculty Instructor"}!
                </h1>
                <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-xl">
                  {teacher ? `${teacher.department} • ${teacher.designation}` : "Vocational Training Department"}
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  href="/pages/Teacher/Students"
                  className="px-4 py-2.5 rounded-xl bg-[#4285CD] hover:bg-[#2F8AD4] text-white font-bold text-xs shadow-xs flex items-center gap-2 transition-all cursor-pointer"
                >
                  <Users size={16} />
                  <span>View Student Roster</span>
                </Link>
              </div>
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-1">
              <span className="text-xs font-bold text-slate-400 uppercase">Assigned Students</span>
              <p className="text-2xl font-black text-slate-900">{totalStudents}</p>
              <p className="text-xs text-slate-500">Across active batches</p>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-1">
              <span className="text-xs font-bold text-slate-400 uppercase">Verified Documents</span>
              <p className="text-2xl font-black text-emerald-700">{verifiedDocsCount} / {totalStudents}</p>
              <p className="text-xs text-slate-500">Aadhaar & certificates checked</p>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-1">
              <span className="text-xs font-bold text-slate-400 uppercase">Active Trades</span>
              <p className="text-2xl font-black text-indigo-600">3 Trades</p>
              <p className="text-xs text-slate-500">COPA, Electrician, Fitter</p>
            </div>
          </div>

          {/* Student Roster Preview */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Enrolled Students Roster</h3>
                <p className="text-xs text-slate-500">Student contact details and document status</p>
              </div>
              <Link
                href="/pages/Teacher/Students"
                className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1"
              >
                <span>Full Roster</span>
                <ArrowRight size={13} />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {students.map((s) => (
                <div key={s.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-150 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-indigo-700 bg-indigo-100/70 px-2 py-0.5 rounded-md">
                      {s.course}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      Roll: {s.roll_no || s.id}
                    </span>
                  </div>

                  <h4 className="text-sm font-extrabold text-slate-800">{s.name}</h4>
                  <p className="text-xs text-slate-500">Father: <b>{s.fatherName}</b></p>
                  
                  <div className="pt-2 border-t border-slate-200/70 text-[11px] text-slate-600 space-y-0.5">
                    <p className="flex items-center gap-1.5">
                      <Phone size={12} className="text-slate-400" />
                      <span>{s.phone}</span>
                    </p>
                    <p className="flex items-center gap-1.5 truncate">
                      <Mail size={12} className="text-slate-400" />
                      <span className="truncate">{s.email}</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </main>
    </>
  );
}
