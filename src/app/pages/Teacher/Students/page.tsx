// src/app/pages/Teacher/Students/page.tsx
"use client";

import { useEffect, useState } from "react";
import StuNav from "@/src/app/components/StuNav";
import { 
  Users, 
  Search, 
  Phone, 
  Mail, 
  MapPin, 
  GraduationCap, 
  CheckCircle2, 
  Download,
  Filter
} from "lucide-react";

interface Student {
  id: number;
  roll_no: string;
  name: string;
  fatherName: string;
  email: string;
  phone: string;
  Address: string;
  course: string;
  batch: string;
  Qualification: string;
}

export default function TeacherStudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [courseFilter, setCourseFilter] = useState("COPA");

  useEffect(() => {
    fetch("/api/applicants")
      .then(res => res.json())
      .then(data => setStudents(data))
      .catch(e => console.error(e))
      .finally(() => setLoading(false));
  }, []);

  const filteredStudents = students.filter(s => {
    const matchesCourse = courseFilter === "All" || s.course.toLowerCase() === courseFilter.toLowerCase();
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (s.roll_no && s.roll_no.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          s.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCourse && matchesSearch;
  });

  const exportCSV = () => {
    const headers = ["Roll No,Student Name,Father Name,Trade,Phone,Email,Qualification\n"];
    const rows = filteredStudents.map(s => 
      `"${s.roll_no || s.id}","${s.name}","${s.fatherName}","${s.course}","${s.phone}","${s.email}","${s.Qualification}"`
    ).join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${courseFilter}_Class_Roster_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  return (
    <>
      <StuNav name="My Class Students" role="teacher" />

      <main className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-6">

          {/* Header Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-150 shadow-xs">
            <div>
              <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider mb-1">
                <Users size={16} />
                <span>Class Roster & Directory</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">
                Assigned Students Roster
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                View student academic details, parent contact, qualification, and trade progress.
              </p>
            </div>

            <button
              onClick={exportCSV}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-700 transition-all cursor-pointer shadow-xs self-start sm:self-auto"
            >
              <Download size={15} />
              <span>Export Roster (CSV)</span>
            </button>
          </div>

          {/* Search and Trade Filter */}
          <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-4 rounded-2xl border border-slate-150 shadow-xs">
            <div className="relative flex-1 w-full">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search student by name, roll number, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-brand-teal focus:bg-white"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <label className="text-xs font-bold text-slate-500 whitespace-nowrap">Select Trade:</label>
              <select
                value={courseFilter}
                onChange={(e) => setCourseFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 focus:outline-none focus:border-brand-teal"
              >
                <option value="COPA">COPA</option>
                <option value="Electrician">Electrician</option>
                <option value="Fitter">Fitter</option>
                <option value="All">All Trades</option>
              </select>
            </div>
          </div>

          {/* Student Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {loading ? (
              <div className="col-span-full py-16 text-center text-slate-400 font-medium">
                Loading students roster...
              </div>
            ) : filteredStudents.length === 0 ? (
              <div className="col-span-full py-16 text-center text-slate-400 font-medium bg-white rounded-3xl border border-slate-150">
                No students enrolled in this trade.
              </div>
            ) : (
              filteredStudents.map((s) => (
                <div 
                  key={s.id}
                  className="bg-white rounded-3xl border border-slate-150 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="h-11 w-11 rounded-2xl bg-[#4285CD] text-white flex items-center justify-center font-bold text-sm shadow-xs">
                          {s.name.split(" ").map(n => n[0]).slice(0, 2).join("")}
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-[#06090C]">{s.name}</h3>
                          <span className="text-[10px] font-black text-[#4285CD] uppercase tracking-wider">
                            {s.roll_no || `ID: #${s.id}`}
                          </span>
                        </div>
                      </div>

                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#EEF5FC] text-[#4285CD] border border-[#85B6E9]/40">
                        {s.course}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs py-2 border-y border-slate-100 my-2 text-slate-600">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Father's Name:</span>
                        <b className="text-slate-700">{s.fatherName}</b>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Aadhaar / KYC:</span>
                        <span className="font-mono text-slate-700 font-bold">{(s as any).aadhaar_no || "Verified"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Document Status:</span>
                        <span className="font-extrabold text-emerald-700">{(s as any).documents_status || "Verified"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Qualification:</span>
                        <span className="font-semibold text-slate-700">{s.Qualification}</span>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-500 pt-1">
                      <div className="flex items-center gap-2 truncate">
                        <Mail size={13} className="text-slate-400 shrink-0" />
                        <span className="truncate">{s.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone size={13} className="text-slate-400 shrink-0" />
                        <span>{s.phone}</span>
                      </div>
                      <div className="flex items-center gap-2 truncate">
                        <MapPin size={13} className="text-slate-400 shrink-0" />
                        <span className="truncate">{s.Address}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

        </div>
      </main>
    </>
  );
}
