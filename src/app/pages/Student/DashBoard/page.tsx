// src/app/pages/Student/DashBoard/page.tsx
"use client";

import { useState, useEffect } from "react";
import StuNav from "@/src/app/components/StuNav";
import Link from "next/link";
import { 
  User, 
  Phone, 
  Calendar, 
  MapPin, 
  GraduationCap, 
  CreditCard, 
  FileText, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ShieldCheck, 
  ArrowRight, 
  Printer, 
  BadgeCheck, 
  FileCheck2, 
  Receipt, 
  Sparkles,
  Award,
  Download
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
  DOB: string;
  phone: string;
  Address: string;
  course: string;
  batch?: string;
  Qualification: string;
  gender?: string;
  blood_group?: string;
  amount_paid?: number;
  payment_status?: string;
  remaining_balance?: number;
  profile_photo?: string;
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
};

export default function StudentDashboardPage() {
  const [student, setStudent] = useState<StudentData>(defaultStudent);
  const [courseFees, setCourseFees] = useState<{ course: string; total_fee: number; [key: string]: unknown }[]>([]);
  const [marksheets, setMarksheets] = useState<PublishedMarksheet[]>([]);
  const [selectedMarksheet, setSelectedMarksheet] = useState<PublishedMarksheet | null>(null);
  const [acceptingId, setAcceptingId] = useState<number | null>(null);
  const [successToast, setSuccessToast] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const resSession = await fetch("/api/auth/session");
        let studentId = 1;
        if (resSession.ok) {
          const session = await resSession.json();
          if (session.studentId) studentId = session.studentId;
        }

        const [resApplicant, resFees, resMarksheets] = await Promise.all([
          fetch(`/api/applicants?id=${studentId}`),
          fetch("/api/course_fees"),
          fetch(`/api/marksheets?student_id=${studentId}`)
        ]);

        if (resApplicant.ok) setStudent(await resApplicant.json());
        if (resFees.ok) setCourseFees(await resFees.json());
        if (resMarksheets.ok) setMarksheets(await resMarksheets.json());
      } catch (err) {
        console.error("Error fetching student details:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
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
        setSuccessToast("Marksheet accepted and digitally acknowledged successfully!");
        setTimeout(() => setSuccessToast(""), 4000);
      }
    } catch (e) {
      console.error("Failed to accept marksheet:", e);
    } finally {
      setAcceptingId(null);
    }
  };

  const getFeeDetails = () => {
    const courseName = student.course || "";
    const matchedFee = courseFees.find(
      (cf) => cf.course.toLowerCase() === courseName.toLowerCase() || 
              courseName.toLowerCase().includes(cf.course.toLowerCase())
    );

    const totalFee = matchedFee ? (matchedFee.total_fee as number) : 15000;
    const paidAmount = student.amount_paid !== undefined ? student.amount_paid : 13500;
    const balanceAmount = Math.max(0, totalFee - paidAmount);
    
    const dbStatus = student.payment_status || "Pending";
    const status = balanceAmount <= 0 || dbStatus === "Paid" ? "Paid" : "Pending";
    const percent = Math.min(100, Math.round((paidAmount / totalFee) * 100));

    return {
      status,
      total: totalFee,
      paid: paidAmount,
      balance: balanceAmount,
      percent
    };
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "N/A";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
    } catch {
      return dateStr;
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  if (loading) {
    return (
      <>
        <StuNav name="Student Dashboard" role="student" />
        <main className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="text-center space-y-3">
            <div className="h-10 w-10 border-4 border-[#4285CD] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-bold text-slate-500">Loading Student Dashboard...</p>
          </div>
        </main>
      </>
    );
  }

  const fee = getFeeDetails();
  const docStatus = student.documents_status || "Verified";

  const documentChecklist = [
    { name: "Government Aadhaar Card", status: student.aadhaar_status || "Verified", detail: student.aadhaar_no || "5821-XXXX-1290", icon: ShieldCheck },
    { name: "10th High School Marksheet", status: student.marksheet_10th_status || "Verified", detail: `Roll: ${student.marksheet_10th_roll || "BSEB-0941"}`, icon: FileCheck2 },
    { name: "12th / Intermediate Marksheet", status: student.marksheet_12th_status || "Verified", detail: "Science Stream", icon: FileCheck2 },
    { name: "Transfer Certificate (TC)", status: student.tc_status || "Verified", detail: "Original Submitted", icon: BadgeCheck },
    { name: "Category / Caste Certificate", status: student.category_cert_status || "General", detail: "General Quota", icon: FileText }
  ];

  return (
    <>
      <StuNav name="Student Portal" role="student" userName={student.name} />

      <main className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-6">

          {/* Success Toast Notification */}
          {successToast && (
            <div className="p-4 rounded-2xl bg-emerald-600 text-white font-bold text-xs flex items-center justify-between shadow-lg animate-in fade-in">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={18} />
                <span>{successToast}</span>
              </div>
              <button onClick={() => setSuccessToast("")} className="text-white/80 hover:text-white cursor-pointer font-extrabold">✕</button>
            </div>
          )}

          {/* Hero Student Banner - CLEAN LIGHT DESIGN */}
          <div className="bg-white rounded-xl p-5 sm:p-6 text-slate-900 shadow-xs border border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-teal-600 text-white flex items-center justify-center text-xl font-bold shrink-0 shadow-xs">
                  {((student.name || "Student").split(" ").filter(Boolean).map(n => n[0]).slice(0, 2).join("") || "S").toUpperCase()}
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded bg-teal-50 text-teal-700 border border-teal-200">
                      Roll: {student.roll_no || `MG-2024-${String(student.id || 1).padStart(3, "0")}`}
                    </span>
                    <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {student.course || "COPA"} Trade
                    </span>
                  </div>

                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">{student.name || "Student Name"}</h1>
                  <p className="text-xs sm:text-sm text-slate-500 mt-0.5 flex items-center gap-2">
                    <span>Father: <b className="text-slate-700 font-semibold">{student.fatherName || "Father's Name on record"}</b></span>
                    <span>•</span>
                    <span>Batch: {student.batch || "2024-2026"}</span>
                  </p>
                </div>
              </div>

              {/* Quick Links */}
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href="/pages/Student/Profile"
                  className="px-3.5 py-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs border border-slate-200 transition-all flex items-center gap-1.5"
                >
                  <FileText size={14} />
                  <span>My KYC & Profile</span>
                </Link>
                <Link
                  href="/pages/Student/Fee_Details"
                  className="px-3.5 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs transition-all flex items-center gap-1.5"
                >
                  <CreditCard size={14} />
                  <span>Fee Ledger & Receipts</span>
                </Link>
              </div>
            </div>
          </div>

          {/* OFFICIAL PUBLISHED MARKSHEETS SECTION */}
          <div className="bg-white rounded-xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
                  <Award size={18} />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Official Marksheets & Certificates</h2>
                  <p className="text-[11px] text-slate-500">NCVT / Institute examination marksheets published by Admin</p>
                </div>
              </div>
              <span className="text-xs font-semibold text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded border border-teal-100 self-start sm:self-auto">
                {marksheets.length} Marksheet(s) Available
              </span>
            </div>

            {marksheets.length === 0 ? (
              <div className="p-6 text-center bg-slate-50 rounded-lg border border-slate-200">
                <p className="text-xs font-semibold text-slate-500">No published marksheets found for your enrollment yet.</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Admin publishes marksheets after semester evaluations.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {marksheets.map((m) => {
                  const isAccepted = m.status === "Accepted by Student";
                  return (
                    <div key={m.id} className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-3 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="text-[10px] font-mono font-semibold text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                            {m.certificate_no}
                          </span>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded flex items-center gap-1 ${
                            isAccepted 
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200" 
                              : "bg-amber-50 text-amber-700 border border-amber-200"
                          }`}>
                            {isAccepted ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                            <span>{m.status}</span>
                          </span>
                        </div>

                        <h3 className="text-xs font-bold text-slate-900">{m.semester}</h3>
                        <p className="text-[11px] text-slate-500">{m.exam_session}</p>

                        <div className="grid grid-cols-3 gap-2 my-2.5 p-2.5 bg-white rounded-lg border border-slate-200 text-center text-xs">
                          <div>
                            <span className="text-[10px] text-slate-400 font-semibold block">Score</span>
                            <strong className="text-slate-800 font-bold font-mono">{m.total_marks}/{m.max_marks}</strong>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 font-semibold block">Percentage</span>
                            <strong className="text-teal-700 font-bold font-mono">{m.percentage}%</strong>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 font-semibold block">Grade</span>
                            <strong className="text-emerald-700 font-bold">{m.grade}</strong>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-2 border-t border-slate-200">
                        <button
                          onClick={() => setSelectedMarksheet(m)}
                          className="flex-1 py-1.5 px-3 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-medium text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Printer size={13} />
                          <span>View & Download</span>
                        </button>

                        {!isAccepted && (
                          <button
                            onClick={() => handleAcceptMarksheet(m.id)}
                            disabled={acceptingId === m.id}
                            className="flex-1 py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
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

          {/* Top Two Main Cards: Document Verification & Fee Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* 1. Document Details & Status Card */}
            <div className="bg-white rounded-xl p-5 sm:p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-150">
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
                      <BadgeCheck size={18} />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-slate-900">Student Document Details</h2>
                      <p className="text-[11px] text-slate-500">Official verification record with institute registry</p>
                    </div>
                  </div>

                  <span className={`px-2.5 py-0.5 rounded text-xs font-semibold uppercase tracking-wider flex items-center gap-1 ${
                    docStatus === "Verified" 
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-amber-50 text-amber-700 border border-amber-200"
                  }`}>
                    {docStatus === "Verified" ? <CheckCircle2 size={13} /> : <Clock size={13} />}
                    <span>{docStatus}</span>
                  </span>
                </div>

                {/* Checklist of individual documents */}
                <div className="space-y-2.5 pt-3.5">
                  {documentChecklist.map((doc, idx) => {
                    const Icon = doc.icon;
                    const isOk = doc.status === "Verified";
                    return (
                      <div key={idx} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <div className={`h-7 w-7 rounded-md flex items-center justify-center ${
                            isOk ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-600"
                          }`}>
                            <Icon size={14} />
                          </div>
                          <div>
                            <h4 className="text-xs font-semibold text-slate-800">{doc.name}</h4>
                            <p className="text-[10px] text-slate-500 font-mono">{doc.detail}</p>
                          </div>
                        </div>

                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                          isOk 
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200" 
                            : doc.status === "N/A"
                            ? "bg-slate-200 text-slate-600"
                            : "bg-amber-50 text-amber-700 border border-amber-200"
                        }`}>
                          {doc.status}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between">
                <p className="text-[11px] text-slate-500">
                  {docStatus === "Verified" ? "All documents verified by Admission Office" : "Submission pending for physical verification"}
                </p>
                <Link
                  href="/pages/Student/Profile"
                  className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1 cursor-pointer"
                >
                  <span>View Details</span>
                  <ArrowRight size={13} />
                </Link>
              </div>
            </div>

            {/* 2. Fee Details & Billing Card */}
            <div className="bg-white rounded-xl p-5 sm:p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-150">
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                      <CreditCard size={18} />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-slate-900">Tuition & Fee Status</h2>
                      <p className="text-[11px] text-slate-500">{student.course} Trade Fee Breakdown</p>
                    </div>
                  </div>

                  <span className={`px-2.5 py-0.5 rounded text-xs font-semibold uppercase tracking-wider ${
                    fee.status === "Paid" 
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200" 
                      : "bg-amber-50 text-amber-700 border border-amber-200"
                  }`}>
                    {fee.status === "Paid" ? "Fully Paid" : "Balance Due"}
                  </span>
                </div>

                {/* Amount grid */}
                <div className="grid grid-cols-3 gap-2.5 pt-3.5">
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-center">
                    <span className="text-[9px] uppercase font-bold text-slate-400 block mb-0.5">Total Fee</span>
                    <strong className="text-xs sm:text-sm font-bold text-slate-900">{formatCurrency(fee.total)}</strong>
                  </div>
                  <div className="p-3 rounded-lg bg-emerald-50/60 border border-emerald-100 text-center">
                    <span className="text-[9px] uppercase font-bold text-emerald-600 block mb-0.5">Paid</span>
                    <strong className="text-xs sm:text-sm font-bold text-emerald-800">{formatCurrency(fee.paid)}</strong>
                  </div>
                  <div className="p-3 rounded-lg bg-amber-50/60 border border-amber-100 text-center">
                    <span className="text-[9px] uppercase font-bold text-amber-600 block mb-0.5">Balance</span>
                    <strong className="text-xs sm:text-sm font-bold text-amber-800">{formatCurrency(fee.balance)}</strong>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-1 pt-3.5">
                  <div className="flex justify-between text-xs font-semibold text-slate-600">
                    <span>Payment Completion</span>
                    <span className="text-emerald-700 font-bold">{fee.percent}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                      style={{ width: `${fee.percent}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-3 border-t border-slate-100">
                <Link
                  href="/pages/Student/Fee_Details"
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs transition-all cursor-pointer"
                >
                  <Receipt size={14} />
                  <span>View Fee History & Pay Online</span>
                </Link>
              </div>
            </div>

          </div>

          {/* Personal & Registry Information Details */}
          <div className="bg-white rounded-xl p-5 sm:p-6 border border-slate-200 shadow-xs">
            <h2 className="text-base font-bold text-slate-900 pb-4 border-b border-slate-100 mb-5">
              Personal & Admission Details
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[10px] font-extrabold uppercase text-slate-500">Full Name</span>
                <p className="text-sm font-bold text-slate-800">{student.name}</p>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[10px] font-extrabold uppercase text-slate-500">Father's Name</span>
                <p className="text-sm font-bold text-slate-800">{student.fatherName}</p>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[10px] font-extrabold uppercase text-slate-500">Date of Birth</span>
                <p className="text-sm font-bold text-slate-800">{formatDate(student.DOB)}</p>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[10px] font-extrabold uppercase text-slate-500">Phone Number</span>
                <p className="text-sm font-bold text-slate-800">{student.phone}</p>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[10px] font-extrabold uppercase text-slate-500">Email Address</span>
                <p className="text-sm font-bold text-slate-800 truncate">{student.email}</p>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[10px] font-extrabold uppercase text-slate-500">Previous Qualification</span>
                <p className="text-sm font-bold text-slate-800">{student.Qualification}</p>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1 sm:col-span-2 md:col-span-3">
                <span className="text-[10px] font-extrabold uppercase text-slate-500">Residential Address</span>
                <p className="text-sm font-bold text-slate-800">{student.Address}</p>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Official Marksheet Print / Download Modal */}
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
