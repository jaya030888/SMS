// src/app/pages/Student/Profile/page.tsx
"use client";

import { useState, useEffect } from "react";
import StuNav from "@/src/app/components/StuNav";
import Link from "next/link";
import { 
  User, 
  Phone, 
  Mail, 
  Calendar, 
  MapPin, 
  GraduationCap, 
  ShieldCheck, 
  FileCheck2, 
  FileText, 
  CheckCircle2, 
  Clock, 
  Camera, 
  BadgeCheck, 
  Building,
  CreditCard,
  AlertCircle,
  Award,
  Printer
} from "lucide-react";
import type { PublishedMarksheet } from "@/src/app/lib/mockData";
import MarksheetModal from "@/src/app/components/ui/MarksheetModal";

interface StudentData {
  id: number;
  roll_no?: string;
  name: string;
  fatherName: string;
  motherName?: string;
  email: string;
  alt_email?: string;
  DOB: string;
  phone: string;
  alt_phone?: string;
  Address: string;
  course: string;
  batch?: string;
  Qualification: string;
  Enrollment_Date?: string;
  profile_photo?: string;
  gender?: string;
  blood_group?: string;
  aadhaar_no?: string;
  aadhaar_status?: "Verified" | "Submitted" | "Pending" | "Rejected";
  marksheet_10th_roll?: string;
  marksheet_10th_status?: "Verified" | "Submitted" | "Pending" | "Rejected";
  marksheet_12th_status?: "Verified" | "Submitted" | "Pending" | "Rejected" | "N/A";
  tc_status?: "Verified" | "Submitted" | "Pending" | "Rejected";
  category_cert_status?: "Verified" | "Submitted" | "Pending" | "General";
  documents_status?: "Verified" | "Pending Verification" | "Documents Incomplete";
  doc_remarks?: string;
}

const defaultStudent: StudentData = {
  id: 0,
  name: "Student",
  fatherName: "",
  email: "",
  DOB: "",
  phone: "",
  Address: "",
  course: "",
  Qualification: "",
  Enrollment_Date: "",
};

export default function StudentProfilePage() {
  const [student, setStudent] = useState<StudentData>(defaultStudent);
  const [marksheets, setMarksheets] = useState<PublishedMarksheet[]>([]);
  const [selectedMarksheet, setSelectedMarksheet] = useState<PublishedMarksheet | null>(null);
  const [acceptingId, setAcceptingId] = useState<number | null>(null);
  const [successToast, setSuccessToast] = useState("");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetch("/api/auth/session")
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error("No session");
      })
      .then((session) => {
        const studentId = session.studentId || 1;
        return Promise.all([
          fetch(`/api/applicants?id=${studentId}`).then(r => r.ok ? r.json() : defaultStudent),
          fetch(`/api/marksheets?student_id=${studentId}`).then(r => r.ok ? r.json() : [])
        ]);
      })
      .then(([data, mData]) => {
        setStudent(data);
        setMarksheets(mData);
      })
      .catch((err) => {
        console.error("Error fetching student profile:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleAcceptMarksheet = async (marksheetId: number) => {
    setAcceptingId(marksheetId);
    try {
      const res = await fetch("/api/marksheets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "accept", marksheet_id: marksheetId })
      });
      if (res.ok) {
        const data = await res.json();
        setMarksheets(prev => prev.map(m => m.id === marksheetId ? data.marksheet : m));
        if (selectedMarksheet?.id === marksheetId) {
          setSelectedMarksheet(data.marksheet);
        }
        setSuccessToast("Marksheet signed and accepted successfully!");
        setTimeout(() => setSuccessToast(""), 4000);
      }
    } catch (e) {
      console.error("Failed to accept marksheet:", e);
    } finally {
      setAcceptingId(null);
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "N/A";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
    } catch (e) {
      return dateStr;
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("Image size must be less than 2MB.");
      return;
    }

    setUploading(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      fetch("/api/applicants", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: student.id,
          profile_photo: base64
        })
      })
        .then((res) => {
          if (res.ok) {
            setStudent((prev) => ({ ...prev, profile_photo: base64 }));
          }
        })
        .finally(() => {
          setUploading(false);
        });
    };
    reader.readAsDataURL(file);
  };

  if (loading) {
    return (
      <>
        <StuNav name="My Documents & Profile" role="student" />
        <main className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="text-center space-y-3">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto"></div>
            <p className="text-slate-600 font-bold text-sm">Loading Student Document Details...</p>
          </div>
        </main>
      </>
    );
  }

  const docOverall = student.documents_status || (student.id % 2 === 0 ? "Verified" : "Pending Verification");

  return (
    <>
      <StuNav name="My Documents & Profile" role="student" userName={student.name} />

      <main className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto space-y-6">

          {/* Toast Notification */}
          {successToast && (
            <div className="p-4 rounded-2xl bg-emerald-600 text-white font-bold text-xs flex items-center justify-between shadow-lg">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={18} />
                <span>{successToast}</span>
              </div>
              <button onClick={() => setSuccessToast("")} className="text-white/80 hover:text-white cursor-pointer font-bold">✕</button>
            </div>
          )}

          {/* Profile Header Banner */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div className="relative group">
              {student.profile_photo ? (
                <img
                  src={student.profile_photo}
                  alt={student.name}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl object-cover border-4 border-slate-100 shadow-md"
                />
              ) : (
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-indigo-50 border-4 border-slate-100 flex items-center justify-center text-indigo-600 text-3xl font-black shadow-md">
                  {student.name[0]}
                </div>
              )}

              <label className="absolute bottom-0 right-0 p-2 rounded-xl bg-[#4285CD] text-white hover:bg-[#2F8AD4] shadow-md cursor-pointer transition-all hover:scale-105">
                <Camera size={14} />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
            </div>

            <div className="flex-1 text-center sm:text-left space-y-1.5">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
                <span className="text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
                  Roll: {student.roll_no || `MG-2024-${String(student.id).padStart(3, "0")}`}
                </span>
                <span className="text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700">
                  {student.course} Trade
                </span>
                <span className={`text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-0.5 rounded-md ${
                  docOverall === "Verified" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-amber-50 text-amber-700 border border-amber-200"
                }`}>
                  Documents: {docOverall}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-slate-900">{student.name}</h1>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                Student ID: #{student.id} • Session {student.batch || "2024-2026"} • Maa Gauri ITI
              </p>
            </div>

            <div className="sm:self-center">
              <Link
                href="/pages/Student/Fee_Details"
                className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1.5"
              >
                <CreditCard size={14} />
                <span>Fee Ledger</span>
              </Link>
            </div>
          </div>

          {/* OFFICIAL PUBLISHED MARKSHEETS & RESULTS SECTION */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                  <Award size={20} />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-slate-900">Official Published Marksheets</h2>
                  <p className="text-xs text-slate-500">View, download, and accept semester marksheet issued by Admin</p>
                </div>
              </div>
            </div>

            {marksheets.length === 0 ? (
              <div className="p-6 text-center bg-slate-50 rounded-2xl border border-slate-150">
                <p className="text-xs font-bold text-slate-500">No published marksheets available yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {marksheets.map((m) => {
                  const isAccepted = m.status === "Accepted by Student";
                  return (
                    <div key={m.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <span className="text-[10px] font-mono font-bold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                            {m.certificate_no}
                          </span>
                          <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                            isAccepted ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                          }`}>
                            {isAccepted ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                            <span>{m.status}</span>
                          </span>
                        </div>
                        <h4 className="text-xs font-extrabold text-slate-900">{m.semester}</h4>
                        <p className="text-[11px] text-slate-500">{m.exam_session}</p>
                        <p className="text-xs font-bold text-indigo-700 mt-1">Score: {m.total_marks}/{m.max_marks} ({m.percentage}%) • Grade: {m.grade}</p>
                      </div>

                      <div className="flex items-center gap-2 pt-2 border-t border-slate-200">
                        <button
                          onClick={() => setSelectedMarksheet(m)}
                          className="flex-1 py-2 px-3 rounded-xl bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Printer size={13} />
                          <span>View & Download</span>
                        </button>
                        {!isAccepted && (
                          <button
                            onClick={() => handleAcceptMarksheet(m.id)}
                            disabled={acceptingId === m.id}
                            className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer disabled:opacity-50"
                          >
                            <CheckCircle2 size={13} />
                            <span>{acceptingId === m.id ? "Signing..." : "Accept"}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Official Document Details Section */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                  <BadgeCheck size={20} />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-slate-900">Student Document Details & Verification</h2>
                  <p className="text-xs text-slate-500">Government identity and academic certificates submitted for admission</p>
                </div>
              </div>

              <span className={`self-start sm:self-auto px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 ${
                docOverall === "Verified" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-amber-50 text-amber-700 border border-amber-200"
              }`}>
                {docOverall === "Verified" ? <CheckCircle2 size={13} /> : <Clock size={13} />}
                <span>{docOverall}</span>
              </span>
            </div>

            {/* Grid of Documents */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 1. Aadhaar Card */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-150 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={18} className="text-indigo-600" />
                    <h3 className="text-xs font-extrabold text-slate-800">Government Aadhaar Card</h3>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                    (student.aadhaar_status || "Verified") === "Verified"
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-amber-100 text-amber-800"
                  }`}>
                    {student.aadhaar_status || "Verified"}
                  </span>
                </div>
                <div className="text-xs space-y-0.5">
                  <span className="text-[10px] uppercase font-bold text-slate-400">UIDAI Aadhaar Number</span>
                  <p className="font-mono font-bold text-slate-800">{student.aadhaar_no || "5821-9043-1290"}</p>
                </div>
              </div>

              {/* 2. 10th Marksheet */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-150 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileCheck2 size={18} className="text-indigo-600" />
                    <h3 className="text-xs font-extrabold text-slate-800">10th / Matriculation Marksheet</h3>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                    (student.marksheet_10th_status || "Verified") === "Verified"
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-amber-100 text-amber-800"
                  }`}>
                    {student.marksheet_10th_status || "Verified"}
                  </span>
                </div>
                <div className="text-xs space-y-0.5">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Board Roll / Certificate</span>
                  <p className="font-mono font-bold text-slate-800">{student.marksheet_10th_roll || "BSEB-2022-0941"}</p>
                </div>
              </div>

              {/* 3. 12th Marksheet */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-150 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileCheck2 size={18} className="text-indigo-600" />
                    <h3 className="text-xs font-extrabold text-slate-800">12th / Intermediate Certificate</h3>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                    (student.marksheet_12th_status || "Verified") === "Verified"
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-slate-200 text-slate-700"
                  }`}>
                    {student.marksheet_12th_status || (student.Qualification.includes("12th") ? "Verified" : "N/A")}
                  </span>
                </div>
                <div className="text-xs space-y-0.5">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Qualification Level</span>
                  <p className="font-bold text-slate-800">{student.Qualification}</p>
                </div>
              </div>

              {/* 4. Transfer Certificate (TC) */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-150 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText size={18} className="text-indigo-600" />
                    <h3 className="text-xs font-extrabold text-slate-800">Transfer Certificate (TC) / SLC</h3>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                    (student.tc_status || "Verified") === "Verified"
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-amber-100 text-amber-800"
                  }`}>
                    {student.tc_status || (student.id % 2 === 0 ? "Verified" : "Pending")}
                  </span>
                </div>
                <div className="text-xs space-y-0.5">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Institute Record Status</span>
                  <p className="font-bold text-slate-800">
                    {student.tc_status === "Pending" ? "Pending submission at counter" : "Archived in Student File"}
                  </p>
                </div>
              </div>
            </div>

            {/* Document Remarks */}
            <div className="p-3.5 rounded-2xl bg-indigo-50/50 border border-indigo-100 text-xs flex items-start gap-2.5">
              <AlertCircle size={16} className="text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-indigo-950 font-bold block">Verification Officer Remarks</strong>
                <p className="text-slate-600 mt-0.5">
                  {student.doc_remarks || "All primary KYC documents and educational marksheets have been verified and approved by the ITI Admission Office."}
                </p>
              </div>
            </div>
          </div>

          {/* Personal Information */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs">
            <h2 className="text-base font-extrabold text-slate-900 pb-4 border-b border-slate-100 mb-5">
              Personal Profile & Contact Details
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 text-xs">
              <div className="space-y-1">
                <span className="text-[10px] font-extrabold uppercase text-slate-400">Full Name</span>
                <p className="text-sm font-bold text-slate-800">{student.name}</p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-extrabold uppercase text-slate-400">Father's Name</span>
                <p className="text-sm font-bold text-slate-800">{student.fatherName}</p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-extrabold uppercase text-slate-400">Mother's Name</span>
                <p className="text-sm font-bold text-slate-800">{student.motherName || "Mrs. Sharma"}</p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-extrabold uppercase text-slate-400">Date of Birth</span>
                <p className="text-sm font-bold text-slate-800">{formatDate(student.DOB)}</p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-extrabold uppercase text-slate-400">Primary Contact Phone</span>
                <p className="text-sm font-bold text-slate-800">{student.phone}</p>
                {student.alt_phone && (
                  <span className="text-[11px] text-slate-500 block">Alt: {student.alt_phone}</span>
                )}
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-extrabold uppercase text-slate-400">Primary Email Address</span>
                <p className="text-sm font-bold text-slate-800">{student.email}</p>
                {student.alt_email && (
                  <span className="text-[11px] text-slate-500 block truncate">Alt: {student.alt_email}</span>
                )}
              </div>

              <div className="space-y-1 sm:col-span-2 md:col-span-3">
                <span className="text-[10px] font-extrabold uppercase text-slate-400">Permanent Address</span>
                <p className="text-sm font-bold text-slate-800">{student.Address}</p>
              </div>
            </div>
          </div>

          {/* Academic Enrollment Info */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs">
            <h2 className="text-base font-extrabold text-slate-900 pb-4 border-b border-slate-100 mb-5">
              Trade & Enrollment Record
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5 text-xs">
              <div className="space-y-1">
                <span className="text-[10px] font-extrabold uppercase text-slate-400">Enrolled Trade</span>
                <p className="text-sm font-bold text-indigo-600">{student.course}</p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-extrabold uppercase text-slate-400">Batch Session</span>
                <p className="text-sm font-bold text-slate-800">{student.batch || "2024-2026"}</p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-extrabold uppercase text-slate-400">Enrollment Date</span>
                <p className="text-sm font-bold text-slate-800">{formatDate(student.Enrollment_Date || "2024-07-10")}</p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-extrabold uppercase text-slate-400">Affiliation</span>
                <p className="text-sm font-bold text-slate-800">NCVT (DGT) Govt. of India</p>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Official Marksheet Modal */}
      {selectedMarksheet && (
        <MarksheetModal
          marksheet={selectedMarksheet}
          onClose={() => setSelectedMarksheet(null)}
          onAccept={handleAcceptMarksheet}
          accepting={acceptingId === selectedMarksheet.id}
        />
      )}
    </>
  );
}
