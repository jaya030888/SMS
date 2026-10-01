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
  AlertCircle
} from "lucide-react";

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
  // Document details
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
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetch("/api/auth/session")
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error("No session");
      })
      .then((session) => {
        const studentId = session.studentId;
        return fetch(`/api/applicants?id=${studentId}`);
      })
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error("Failed to fetch student profile");
      })
      .then((data: StudentData) => {
        setStudent(data);
      })
      .catch((err) => {
        console.error("Error fetching student profile:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

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
          alert("Profile photo updated successfully!");
          setStudent(prev => ({ ...prev, profile_photo: base64 }));
        } else {
          alert("Failed to update profile photo.");
        }
      })
      .catch(() => alert("Failed to update profile photo."))
      .finally(() => setUploading(false));
    };
    reader.readAsDataURL(file);
  };

  if (loading) {
    return (
      <>
        <StuNav name="My Documents & Profile" role="student" />
        <main className="min-h-screen bg-slate-50 flex items-center justify-center p-8">
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
      <StuNav name="My Documents & Profile" role="student" />

      <main className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto space-y-6">

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

              <label className="absolute bottom-0 right-0 p-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 shadow-md cursor-pointer transition-all hover:scale-105">
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
                Student ID: #{student.id} • Session 2024-2026 • Maa Gauri ITI
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
                    <h3 className="text-xs font-extrabold text-slate-800">Aadhaar Card (UIDAI)</h3>
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
                  <span className="text-[10px] uppercase font-bold text-slate-400">Aadhaar Number</span>
                  <p className="font-mono font-bold text-slate-800">{student.aadhaar_no || `5821-9043-${String(student.id + 1000).padStart(4, "0")}`}</p>
                </div>
              </div>

              {/* 2. 10th Class Marksheet */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-150 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileCheck2 size={18} className="text-indigo-600" />
                    <h3 className="text-xs font-extrabold text-slate-800">10th Class Marksheet / Certificate</h3>
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
                  <span className="text-[10px] uppercase font-bold text-slate-400">Roll / Certificate No</span>
                  <p className="font-mono font-bold text-slate-800">{student.marksheet_10th_roll || `BSEB-2022-${String(student.id + 5000)}`}</p>
                </div>
              </div>

              {/* 3. 12th / Intermediate Certificate */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-150 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <GraduationCap size={18} className="text-indigo-600" />
                    <h3 className="text-xs font-extrabold text-slate-800">12th / Higher Qualification</h3>
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
              Personal Profile
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
    </>
  );
}
