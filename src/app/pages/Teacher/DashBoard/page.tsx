// src/app/pages/Teacher/DashBoard/page.tsx
"use client";

import { useEffect, useState } from "react";
import StuNav from "@/src/app/components/StuNav";
import { 
  User, 
  Briefcase, 
  GraduationCap, 
  Award, 
  Calendar, 
  Phone, 
  Mail, 
  MapPin, 
  BadgeCheck, 
  ShieldCheck, 
  BookOpen, 
  Building,
  Clock,
  Sparkles,
  QrCode
} from "lucide-react";
import type { Teacher } from "@/src/app/lib/mockData";

export default function TeacherDashboard() {
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTeacherData() {
      try {
        const resSession = await fetch("/api/auth/session");
        if (resSession.ok) {
          const session = await resSession.json();
          const tid = session.teacherId || 1;
          const resT = await fetch(`/api/teachers?id=${tid}`);
          if (resT.ok) {
            const data = await resT.json();
            setTeacher(data);
          }
        }
      } catch (e) {
        console.error("Error loading teacher profile:", e);
      } finally {
        setLoading(false);
      }
    }
    loadTeacherData();
  }, []);

  if (loading) {
    return (
      <>
        <StuNav name="Instructor Profile" role="teacher" />
        <main className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="text-center space-y-3">
            <div className="h-10 w-10 border-4 border-[#4285CD] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-bold text-slate-500">Loading Instructor Profile...</p>
          </div>
        </main>
      </>
    );
  }

  // Fallback teacher data if not logged in
  const t = teacher || {
    id: 1,
    employee_id: "EMP-MG-101",
    name: "Er. Amit Sharma",
    email: "amit.sharma@mgiti.edu",
    phone: "9876543210",
    department: "Computer Operator & Programming Assistant",
    designation: "Senior Instructor & HOD",
    qualification: "B.Tech (CSE), MCA, CITS Certified",
    experience: "8 Years",
    assigned_courses: ["COPA"],
    assigned_batches: ["2024-2026", "2025-2027"],
    joining_date: "2018-06-15",
    status: "Active"
  };

  return (
    <>
      <StuNav name="Instructor Profile" role="teacher" userName={t.name} />

      <main className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto space-y-6">

          {/* Top Hero Banner */}
          <div className="bg-white rounded-xl p-5 sm:p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 sm:h-18 sm:w-18 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold text-2xl shadow-xs shrink-0">
                {t.name.split(" ").map(n => n[0]).slice(0, 2).join("")}
              </div>
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
                  <BadgeCheck size={14} />
                  <span>NCVT Certified Vocational Faculty</span>
                </div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  {t.name}
                </h1>
                <p className="text-xs sm:text-sm text-slate-500">
                  {t.designation} • {t.department}
                </p>
              </div>
            </div>

            {/* Quick Badge */}
            <div className="flex items-center gap-3 bg-slate-50 px-3.5 py-2.5 rounded-lg border border-slate-200 self-start md:self-auto">
              <ShieldCheck size={24} className="text-teal-600" />
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Faculty ID</span>
                <span className="text-sm font-mono font-bold text-slate-800">{t.employee_id}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

            {/* Left 7 Cols: Detailed Teacher Credentials */}
            <div className="lg:col-span-7 space-y-6">

              {/* Professional Credentials Card */}
              <div className="bg-white rounded-xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                    <Briefcase size={16} className="text-teal-600" />
                    <span>Academic & Professional Details</span>
                  </div>
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                    Status: {t.status || "Active"}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-0.5">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Employee ID</span>
                    <p className="text-xs font-bold text-slate-800 font-mono">{t.employee_id}</p>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-0.5">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Designation</span>
                    <p className="text-xs font-bold text-slate-800">{t.designation}</p>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-0.5 sm:col-span-2">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Department / Trade</span>
                    <p className="text-xs font-bold text-slate-800">{t.department}</p>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-0.5 sm:col-span-2">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Academic & Technical Qualification</span>
                    <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <GraduationCap size={14} className="text-teal-600 shrink-0" />
                      <span>{t.qualification}</span>
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-0.5">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Teaching Experience</span>
                    <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Award size={14} className="text-amber-500 shrink-0" />
                      <span>{t.experience}</span>
                    </p>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-0.5">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Joining Date</span>
                    <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Calendar size={14} className="text-slate-400 shrink-0" />
                      <span>{t.joining_date || "2018-06-15"}</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Assigned Trades & Batches */}
              <div className="bg-white rounded-xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-sm pb-3 border-b border-slate-100">
                  <BookOpen size={16} className="text-teal-600" />
                  <span>Assigned Trades & Curriculum</span>
                </div>

                <div className="space-y-3">
                  <div className="p-3.5 rounded-lg bg-teal-50/50 border border-teal-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-teal-700 uppercase">Primary Trade</span>
                      <h4 className="text-xs font-bold text-slate-900">
                        {t.assigned_courses?.join(", ") || t.department}
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">NCVT Approved Trade Curriculum & Workshop Supervision</p>
                    </div>
                    <span className="px-2.5 py-0.5 rounded bg-teal-600 text-white font-semibold text-[11px]">
                      Active
                    </span>
                  </div>

                  <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1.5">Assigned Batches</span>
                    <div className="flex flex-wrap gap-2">
                      {(t.assigned_batches || ["2024-2026", "2025-2027"]).map((batch, i) => (
                        <span key={i} className="px-2.5 py-1 rounded-md bg-white border border-slate-200 text-xs font-medium text-slate-700">
                          Batch: {batch}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Right 5 Cols: Official Faculty Pass & Contact Card */}
            <div className="lg:col-span-5 space-y-6">

              {/* Official Faculty Identity Card - CLEAN LIGHT DESIGN (NO DARK GRADIENT) */}
              <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-md bg-teal-600 text-white">
                      <GraduationCap size={15} />
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">MAA GAURI ITI</h4>
                      <p className="text-[9px] text-slate-400">Govt. NCVT Affiliated</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200 font-semibold">
                    FACULTY PASS
                  </span>
                </div>

                <div className="flex items-center gap-3.5">
                  <div className="h-14 w-14 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-teal-700 font-bold text-lg shrink-0">
                    {t.name.split(" ").map(n => n[0]).slice(0, 2).join("")}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-slate-900 truncate">{t.name}</h3>
                    <p className="text-xs text-slate-500 truncate">{t.designation}</p>
                    <p className="text-[11px] text-slate-400 font-mono mt-0.5">ID: {t.employee_id}</p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <div>
                    <span className="block text-slate-400 text-[10px]">Department</span>
                    <strong className="text-slate-800 font-semibold">{t.assigned_courses?.[0] || "COPA"} Trade</strong>
                  </div>
                  <div className="text-right">
                    <span className="block text-slate-400 text-[10px]">Validity</span>
                    <strong className="text-slate-800 font-semibold">2024 – 2027</strong>
                  </div>
                </div>
              </div>

              {/* Faculty Contact & Office Information */}
              <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-3">
                <h3 className="text-xs font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
                  <Phone size={14} className="text-teal-600" />
                  <span>Instructor Contact Details</span>
                </h3>

                <div className="space-y-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center gap-3">
                    <Mail size={15} className="text-teal-600 shrink-0" />
                    <div className="min-w-0">
                      <span className="text-[9px] text-slate-400 font-bold uppercase block">Official Email</span>
                      <a href={`mailto:${t.email}`} className="font-semibold text-slate-800 hover:text-teal-600 truncate block">
                        {t.email}
                      </a>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center gap-3">
                    <Phone size={15} className="text-teal-600 shrink-0" />
                    <div className="min-w-0">
                      <span className="text-[9px] text-slate-400 font-bold uppercase block">Mobile Number</span>
                      <a href={`tel:${t.phone}`} className="font-semibold text-slate-800 hover:text-teal-600 block">
                        +91 {t.phone}
                      </a>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center gap-3">
                    <Building size={15} className="text-slate-500 shrink-0" />
                    <div className="min-w-0">
                      <span className="text-[9px] text-slate-400 font-bold uppercase block">Faculty Office Location</span>
                      <p className="font-medium text-slate-700">Staff Room 102, Main Academic Building</p>
                    </div>
                  </div>
                </div>
              </div>

            </div>

          </div>

        </div>
      </main>
    </>
  );
}
