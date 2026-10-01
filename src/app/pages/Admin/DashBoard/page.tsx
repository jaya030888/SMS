// src/app/pages/Admin/DashBoard/page.tsx
"use client";

import { useEffect, useState } from "react";
import StuNav from "@/src/app/components/StuNav";
import { StatCard } from "@/src/app/components/ui/StatCard";
import { ChartCard } from "@/src/app/components/ui/ChartCard";
import { Badge } from "@/src/app/components/ui/Badge";
import { ReceiptModal } from "@/src/app/components/ui/ReceiptModal";
import Link from "next/link";
import { 
  Users, 
  CreditCard, 
  FileText, 
  Plus, 
  ArrowUpRight, 
  Printer,
  ChevronRight,
  Sparkles,
  ShieldCheck,
  BadgeCheck,
  Clock,
  AlertCircle,
  FileCheck2,
  DollarSign,
  CheckCircle2
} from "lucide-react";

export default function AdminDashboardPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [fees, setFees] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Receipt Modal State
  const [selectedReceipt, setSelectedReceipt] = useState<any | null>(null);

  useEffect(() => {
    async function loadAllData() {
      try {
        const [resS, resC, resF, resP] = await Promise.all([
          fetch("/api/applicants"),
          fetch("/api/courses"),
          fetch("/api/course_fees"),
          fetch("/api/payments")
        ]);

        if (resS.ok) setStudents(await resS.json());
        if (resC.ok) setCourses(await resC.json());
        if (resF.ok) setFees(await resF.json());
        if (resP.ok) setPayments(await resP.json());
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadAllData();
  }, []);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Calculations
  const totalStudents = students.length;
  
  // Document status counts
  const verifiedDocsCount = students.filter(s => (s.documents_status || "Verified") === "Verified").length;
  const pendingDocsCount = students.filter(s => s.documents_status === "Pending Verification").length;
  const incompleteDocsCount = students.filter(s => s.documents_status === "Documents Incomplete").length;
  const docVerificationRate = totalStudents > 0 ? Math.round((verifiedDocsCount / totalStudents) * 100) : 100;

  // Fee metrics
  const totalCollected = payments.reduce((acc, p) => acc + (p.amount || 0), 0);
  const totalExpected = students.reduce((acc, s) => {
    const feeObj = fees.find(f => (f.course || "").toLowerCase() === (s.course || "").toLowerCase());
    return acc + (feeObj ? feeObj.total_fee : 15000);
  }, 0);
  const totalPending = Math.max(0, totalExpected - totalCollected);
  const collectionRate = totalExpected > 0 ? Math.round((totalCollected / totalExpected) * 100) : 85;

  return (
    <>
      <StuNav name="Institute ERP Dashboard" role="admin" />

      <main className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-8">

          {/* Top Hero Banner */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-wider mb-1">
                <Sparkles size={16} />
                <span>Executive Management Overview</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Student Document Registry & Fee Control
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
                Real-time operational monitoring for student document verification (Aadhaar & Marksheets) and institutional fee collections.
              </p>
            </div>

            {/* Quick Action Shortcuts */}
            <div className="flex flex-wrap items-center gap-2.5">
              <Link
                href="/pages/Home/Addmission_Application_Form"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-xs shadow-xs hover:-translate-y-0.5 transition-all cursor-pointer"
              >
                <Plus size={15} />
                <span>Enroll Student</span>
              </Link>
              <Link
                href="/pages/Admin/Student"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-xs transition-all cursor-pointer"
              >
                <ShieldCheck size={15} />
                <span>Verify Documents</span>
              </Link>
              <Link
                href="/pages/Admin/fee-details"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-xs transition-all cursor-pointer"
              >
                <CreditCard size={15} />
                <span>Fee Ledger</span>
              </Link>
            </div>
          </div>

          {/* KPI StatCards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            <StatCard
              label="Total Enrolled Students"
              value={totalStudents}
              icon={Users}
              variant="primary"
              description="Active in 3 trades"
              trend={{ value: "+18% YoY", isPositive: true }}
            />
            <StatCard
              label="Verified Documents"
              value={`${verifiedDocsCount} / ${totalStudents}`}
              icon={BadgeCheck}
              variant="success"
              description={`${docVerificationRate}% complete`}
              trend={{ value: "Approved", isPositive: true }}
            />
            <StatCard
              label="Pending Verification"
              value={pendingDocsCount + incompleteDocsCount}
              icon={Clock}
              variant="warning"
              description="Awaiting scrutiny"
            />
            <StatCard
              label="Total Expected Fees"
              value={formatCurrency(totalExpected)}
              icon={DollarSign}
              variant="primary"
              description="Current Academic Year"
            />
            <StatCard
              label="Fees Collected"
              value={formatCurrency(totalCollected)}
              icon={CreditCard}
              variant="success"
              description={`${collectionRate}% collected`}
              trend={{ value: "On Track", isPositive: true }}
            />
            <StatCard
              label="Pending Dues"
              value={formatCurrency(totalPending)}
              icon={AlertCircle}
              variant="warning"
              description="Installments due"
            />
          </div>

          {/* Charts & Analytics Matrix */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Left 2 Cols: Monthly Admissions & Document Status */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Document Status Breakdown Matrix */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                
                {/* Document Verification Status */}
                <ChartCard 
                  title="Document Verification Status" 
                  subtitle="Aadhaar, 10th & 12th certificate audits"
                >
                  <div className="space-y-4 pt-1">
                    <div>
                      <div className="flex justify-between text-xs font-bold mb-1">
                        <span className="text-slate-700">Verified & Approved</span>
                        <span className="text-emerald-600">{verifiedDocsCount} Students ({docVerificationRate}%)</span>
                      </div>
                      <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${docVerificationRate}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-bold mb-1">
                        <span className="text-slate-700">Pending Physical Verification</span>
                        <span className="text-amber-600">{pendingDocsCount} Students</span>
                      </div>
                      <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-500 rounded-full" style={{ width: `${Math.round((pendingDocsCount / Math.max(1, totalStudents)) * 100)}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-bold mb-1">
                        <span className="text-slate-700">Incomplete Document Files</span>
                        <span className="text-rose-600">{incompleteDocsCount} Students</span>
                      </div>
                      <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-rose-500 rounded-full" style={{ width: `${Math.round((incompleteDocsCount / Math.max(1, totalStudents)) * 100)}%` }} />
                      </div>
                    </div>
                  </div>
                </ChartCard>

                {/* Trade Wise Seat & Document Compliance */}
                <ChartCard 
                  title="Trade-wise Student Strength" 
                  subtitle="Enrollment breakdown across trades"
                >
                  <div className="space-y-3 pt-1 text-xs">
                    {courses.map((c, i) => {
                      const courseName = c.name || c.course || "";
                      const count = students.filter(s => (s.course || "").toLowerCase() === courseName.toLowerCase()).length;
                      const feeObj = fees.find(f => (f.course || "").toLowerCase() === courseName.toLowerCase());
                      const totalFee = feeObj ? feeObj.total_fee : (c.total_fee || 15000);
                      return (
                        <div key={i} className="p-3 rounded-xl bg-slate-50 border border-slate-150 flex items-center justify-between">
                          <div>
                            <strong className="text-slate-800 block">{courseName} Trade</strong>
                            <span className="text-[10px] text-slate-500">Tuition & Exam: {formatCurrency(totalFee)}</span>
                          </div>
                          <span className="font-extrabold text-indigo-700 bg-indigo-100/70 px-2.5 py-1 rounded-lg">
                            {count} Students
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </ChartCard>

              </div>
            </div>

            {/* Right 1 Col: Fee Breakdown & Document Actions */}
            <div className="space-y-6">
              
              {/* Fee Collection Progress Card */}
              <ChartCard 
                title="Fee Collection vs Pending" 
                subtitle="Institutional financial ledger"
              >
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-150 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500 font-bold">Total Collection Progress</span>
                      <b className="text-emerald-700 font-black">{collectionRate}%</b>
                    </div>
                    <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${collectionRate}%` }} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-white border border-slate-200">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Collected</span>
                      <strong className="text-sm font-black text-emerald-700">{formatCurrency(totalCollected)}</strong>
                    </div>
                    <div className="p-3 rounded-xl bg-white border border-slate-200">
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Pending</span>
                      <strong className="text-sm font-black text-amber-600">{formatCurrency(totalPending)}</strong>
                    </div>
                  </div>

                  <Link
                    href="/pages/Admin/fee-details"
                    className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors shadow-xs"
                  >
                    <span>Manage Full Fee Ledger</span>
                    <ArrowUpRight size={14} />
                  </Link>
                </div>
              </ChartCard>

              {/* Document Review Shortcut Card */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={18} className="text-indigo-600" />
                    <h3 className="text-sm font-bold text-slate-800">Pending Document Verifications</h3>
                  </div>
                  <Link href="/pages/Admin/Student" className="text-xs font-bold text-indigo-600 hover:underline">
                    View All
                  </Link>
                </div>

                <div className="space-y-3">
                  {students.slice(0, 3).map((s) => (
                    <div key={s.id} className="p-3 rounded-xl bg-slate-50 border border-slate-150 flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-slate-800">{s.name}</h4>
                        <p className="text-[10px] text-slate-500 font-mono">Aadhaar: {s.aadhaar_no || "Pending"}</p>
                      </div>
                      <Link
                        href="/pages/Admin/Student"
                        className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-[11px] font-bold transition-all"
                      >
                        Inspect
                      </Link>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>

          {/* Recent Payments Log Table */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-slate-800">Recent Fee Transactions</h3>
                <p className="text-xs text-slate-500">Live electronic payment receipts logged across all trades</p>
              </div>

              <Link
                href="/pages/Admin/fee-details"
                className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1 self-start sm:self-auto"
              >
                <span>View Full Transactions</span>
                <ChevronRight size={14} />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-150 text-slate-600 font-bold uppercase tracking-wider">
                    <th className="py-3 px-6">Transaction ID</th>
                    <th className="py-3 px-6">Student Name</th>
                    <th className="py-3 px-6">Trade</th>
                    <th className="py-3 px-6">Amount Paid</th>
                    <th className="py-3 px-6">Payment Method</th>
                    <th className="py-3 px-6">Date</th>
                    <th className="py-3 px-6 text-right">Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {payments.slice(0, 5).map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3.5 px-6 font-mono font-bold text-indigo-600">{p.transaction_id}</td>
                      <td className="py-3.5 px-6 font-bold text-slate-800">{p.student_name || "Enrolled Student"}</td>
                      <td className="py-3.5 px-6">
                        <Badge variant="info" size="sm">{p.student_course || "Trade"}</Badge>
                      </td>
                      <td className="py-3.5 px-6 font-black text-slate-900">{formatCurrency(p.amount)}</td>
                      <td className="py-3.5 px-6 font-semibold text-slate-600">{p.payment_method}</td>
                      <td className="py-3.5 px-6 text-slate-500">
                        {new Date(p.payment_date).toLocaleDateString("en-IN", { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="py-3.5 px-6 text-right">
                        <button
                          onClick={() => setSelectedReceipt({
                            receiptNo: `RCP-${p.id + 1000}`,
                            transactionId: p.transaction_id,
                            date: p.payment_date,
                            studentName: p.student_name || "Enrolled Student",
                            studentId: p.student_id,
                            rollNo: `MG-2024-${String(p.student_id).padStart(3, '0')}`,
                            course: p.student_course || "COPA",
                            batch: "2024-2026",
                            amount: p.amount,
                            paymentMethod: p.payment_method,
                            paymentMode: p.payment_mode || "Online",
                            remarks: p.remarks
                          })}
                          className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 text-slate-700 font-bold transition-all shadow-xs cursor-pointer inline-flex items-center gap-1"
                        >
                          <Printer size={13} />
                          <span>Receipt</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </main>

      {/* Printable Receipt Modal */}
      <ReceiptModal
        isOpen={Boolean(selectedReceipt)}
        onClose={() => setSelectedReceipt(null)}
        receipt={selectedReceipt}
      />
    </>
  );
}
