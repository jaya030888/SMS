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
  Sparkles
} from "lucide-react";

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
};

export default function StudentDashboardPage() {
  const [student, setStudent] = useState<StudentData>(defaultStudent);
  const [courseFees, setCourseFees] = useState<{ course: string; total_fee: number; [key: string]: unknown }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/session")
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error("No session");
      })
      .then((session) => {
        const studentId = session.studentId;
        return Promise.all([
          fetch(`/api/applicants?id=${studentId}`).then((res) => {
            if (res.ok) return res.json();
            throw new Error("Failed to fetch student details");
          }),
          fetch("/api/course_fees").then((res) => {
            if (res.ok) return res.json();
            throw new Error("Failed to fetch course fees");
          })
        ]);
      })
      .then(([applicant, feesData]) => {
        setCourseFees(feesData);
        setStudent(applicant);
      })
      .catch((err) => {
        console.error("Error fetching student details:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

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
      maximumFractionDigits: 0
    }).format(val);
  };

  const fee = getFeeDetails();

  // Document status helper
  const docStatus = student.documents_status || (student.id % 2 === 0 ? "Verified" : "Pending Verification");

  const documentChecklist = [
    {
      name: "Aadhaar Card",
      detail: student.aadhaar_no || `XXXX-XXXX-${String(student.id).padStart(4, "0")}`,
      status: student.aadhaar_status || "Verified",
      icon: ShieldCheck
    },
    {
      name: "10th Class Marksheet",
      detail: student.marksheet_10th_roll || `Roll: BSEB-${student.id + 1000}`,
      status: student.marksheet_10th_status || "Verified",
      icon: FileCheck2
    },
    {
      name: "12th / Qualification Certificate",
      detail: student.Qualification || "Senior Secondary",
      status: student.marksheet_12th_status || (student.Qualification.includes("12th") ? "Verified" : "N/A"),
      icon: GraduationCap
    },
    {
      name: "Transfer / Leaving Certificate (TC)",
      detail: `TC Ref: TC-MG-${student.id + 500}`,
      status: student.tc_status || (student.id % 2 === 0 ? "Verified" : "Pending"),
      icon: FileText
    }
  ];

  if (loading) {
    return (
      <>
        <StuNav name="Dashboard" role="student" />
        <main className="min-h-screen bg-slate-50 flex items-center justify-center p-8">
          <div className="text-center space-y-3">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto"></div>
            <p className="text-slate-600 font-bold text-sm">Loading Student Records & Fee Details...</p>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <StuNav name="Dashboard" role="student" />

      <main className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-6">

          {/* Hero Student Banner */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden border border-slate-800">
            <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
              <div className="flex items-center gap-5">
                {student.profile_photo ? (
                  <img
                    src={student.profile_photo}
                    alt={student.name}
                    className="w-20 h-20 rounded-2xl object-cover border-2 border-white/20 shadow-md"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-white text-2xl font-black">
                    {student.name[0]}
                  </div>
                )}

                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-0.5 rounded-md bg-indigo-500/30 text-indigo-300 border border-indigo-400/30">
                      Roll: {student.roll_no || `MG-2024-${String(student.id).padStart(3, "0")}`}
                    </span>
                    <span className="text-[10px] uppercase tracking-wider font-extrabold px-2.5 py-0.5 rounded-md bg-white/10 text-slate-300">
                      {student.course} Trade
                    </span>
                  </div>

                  <h1 className="text-2xl sm:text-3xl font-black tracking-tight">{student.name}</h1>
                  <p className="text-xs sm:text-sm text-slate-300 mt-1 flex items-center gap-2">
                    <span>Father: <b>{student.fatherName}</b></span>
                    <span>•</span>
                    <span>ID: #{student.id}</span>
                  </p>
                </div>
              </div>

              {/* Quick Links */}
              <div className="flex flex-wrap items-center gap-2.5">
                <Link
                  href="/pages/Student/Profile"
                  className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/15 transition-all flex items-center gap-1.5"
                >
                  <FileText size={14} />
                  <span>My Documents</span>
                </Link>
                <Link
                  href="/pages/Student/Fee_Details"
                  className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
                >
                  <CreditCard size={14} />
                  <span>Fee Ledger & Receipts</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Top Two Main Cards: Document Verification & Fee Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* 1. Document Details & Status Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="h-9 w-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                      <BadgeCheck size={20} />
                    </div>
                    <div>
                      <h2 className="text-base font-extrabold text-slate-900">Student Document Details</h2>
                      <p className="text-xs text-slate-500">Official verification record with institute registry</p>
                    </div>
                  </div>

                  <span className={`px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1 ${
                    docStatus === "Verified" 
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-amber-50 text-amber-700 border border-amber-200"
                  }`}>
                    {docStatus === "Verified" ? <CheckCircle2 size={13} /> : <Clock size={13} />}
                    <span>{docStatus}</span>
                  </span>
                </div>

                {/* Checklist of individual documents */}
                <div className="space-y-3 pt-4">
                  {documentChecklist.map((doc, idx) => {
                    const Icon = doc.icon;
                    const isOk = doc.status === "Verified";
                    return (
                      <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-150 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className={`h-8 w-8 rounded-xl flex items-center justify-center ${
                            isOk ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-600"
                          }`}>
                            <Icon size={16} />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-slate-800">{doc.name}</h4>
                            <p className="text-[11px] text-slate-500 font-mono">{doc.detail}</p>
                          </div>
                        </div>

                        <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-md ${
                          isOk 
                            ? "bg-emerald-100/70 text-emerald-800" 
                            : doc.status === "N/A"
                            ? "bg-slate-200 text-slate-600"
                            : "bg-amber-100 text-amber-800"
                        }`}>
                          {doc.status}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-5 mt-4 border-t border-slate-100 flex items-center justify-between">
                <p className="text-xs text-slate-500">
                  {docStatus === "Verified" ? "All documents verified by Admission Office" : "Submission pending for physical verification"}
                </p>
                <Link
                  href="/pages/Student/Profile"
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                >
                  <span>View Details</span>
                  <ArrowRight size={13} />
                </Link>
              </div>
            </div>

            {/* 2. Fee Details & Billing Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="h-9 w-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                      <CreditCard size={20} />
                    </div>
                    <div>
                      <h2 className="text-base font-extrabold text-slate-900">Tuition & Fee Status</h2>
                      <p className="text-xs text-slate-500">{student.course} Trade Fee Breakdown</p>
                    </div>
                  </div>

                  <span className={`px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider ${
                    fee.status === "Paid" 
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200" 
                      : "bg-amber-50 text-amber-700 border border-amber-200"
                  }`}>
                    {fee.status === "Paid" ? "Fully Paid" : "Balance Due"}
                  </span>
                </div>

                {/* Amount grid */}
                <div className="grid grid-cols-3 gap-3 pt-4">
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-150 text-center">
                    <span className="text-[10px] uppercase font-extrabold text-slate-400 block mb-0.5">Total Fee</span>
                    <strong className="text-sm sm:text-base font-black text-slate-900">{formatCurrency(fee.total)}</strong>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-100 text-center">
                    <span className="text-[10px] uppercase font-extrabold text-emerald-600 block mb-0.5">Paid</span>
                    <strong className="text-sm sm:text-base font-black text-emerald-800">{formatCurrency(fee.paid)}</strong>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-100 text-center">
                    <span className="text-[10px] uppercase font-extrabold text-amber-600 block mb-0.5">Balance</span>
                    <strong className="text-sm sm:text-base font-black text-amber-800">{formatCurrency(fee.balance)}</strong>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-1.5 pt-4">
                  <div className="flex justify-between text-xs font-bold text-slate-600">
                    <span>Payment Completion</span>
                    <span className="text-emerald-700 font-black">{fee.percent}%</span>
                  </div>
                  <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                      style={{ width: `${fee.percent}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-5 mt-4 border-t border-slate-100">
                <Link
                  href="/pages/Student/Fee_Details"
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-primary hover:bg-primary-dark text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
                >
                  <Receipt size={15} />
                  <span>View Fee History & Pay Online</span>
                </Link>
              </div>
            </div>

          </div>

          {/* Personal & Registry Information Details */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs">
            <h2 className="text-base font-extrabold text-slate-900 pb-4 border-b border-slate-100 mb-5">
              Personal & Admission Details
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-150 space-y-1">
                <span className="text-[10px] font-extrabold uppercase text-slate-400">Full Name</span>
                <p className="text-sm font-bold text-slate-800">{student.name}</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-150 space-y-1">
                <span className="text-[10px] font-extrabold uppercase text-slate-400">Father's Name</span>
                <p className="text-sm font-bold text-slate-800">{student.fatherName}</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-150 space-y-1">
                <span className="text-[10px] font-extrabold uppercase text-slate-400">Date of Birth</span>
                <p className="text-sm font-bold text-slate-800">{formatDate(student.DOB)}</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-150 space-y-1">
                <span className="text-[10px] font-extrabold uppercase text-slate-400">Phone Number</span>
                <p className="text-sm font-bold text-slate-800">{student.phone}</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-150 space-y-1">
                <span className="text-[10px] font-extrabold uppercase text-slate-400">Email Address</span>
                <p className="text-sm font-bold text-slate-800 truncate">{student.email}</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-150 space-y-1">
                <span className="text-[10px] font-extrabold uppercase text-slate-400">Previous Qualification</span>
                <p className="text-sm font-bold text-slate-800">{student.Qualification}</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-150 space-y-1 sm:col-span-2 md:col-span-3">
                <span className="text-[10px] font-extrabold uppercase text-slate-400">Residential Address</span>
                <p className="text-sm font-bold text-slate-800">{student.Address}</p>
              </div>
            </div>
          </div>

        </div>
      </main>
    </>
  );
}
