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

      <main className="min-h-screen bg-slate-50 py-5 sm:py-8 px-3.5 sm:px-6 lg:px-8 w-full max-w-full overflow-x-hidden">
        <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8 w-full min-w-0">

          {/* Top Hero Banner */}
          <div className="bg-white rounded-xl p-5 sm:p-7 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4 sm:gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-teal-50 border border-teal-200 text-teal-700 font-bold text-[11px] sm:text-xs uppercase tracking-wider mb-2.5 shadow-2xs">
                <span className="relative flex h-2 w-2 shrink-0">
                  <span className="absolute inline-flex h-2 w-2 animate-ping rounded-full bg-teal-500 opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-teal-500"></span>
                </span>
                <span>Executive Management Overview</span>
              </div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight">
                Student Document Registry & Fee Control
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
                Real-time operational monitoring for student document verification (Aadhaar & Marksheets) and institutional fee collections.
              </p>
            </div>

            {/* Quick Action Shortcuts */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 w-full sm:w-auto">
              <Link
                href="/pages/Home/Addmission_Application_Form"
                className="flex items-center justify-center gap-2 flex-1 sm:flex-initial px-4 py-2.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
              >
                <Plus size={15} />
                <span>Enroll Student</span>
              </Link>
              <Link
                href="/pages/Admin/Student"
                className="flex items-center justify-center gap-2 flex-1 sm:flex-initial px-4 py-2.5 rounded-lg border border-teal-200 bg-teal-50/50 hover:bg-teal-100 text-teal-800 font-bold text-xs shadow-xs transition-colors cursor-pointer"
              >
                <ShieldCheck size={15} />
                <span>Verify Docs</span>
              </Link>
              <Link
                href="/pages/Admin/fee-details"
                className="flex items-center justify-center gap-2 flex-1 sm:flex-initial px-4 py-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-xs transition-colors cursor-pointer"
              >
                <CreditCard size={15} />
                <span>Fee Ledger</span>
              </Link>
            </div>
          </div>

          {/* KPI StatCards Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4 w-full">
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

          {/* Row 1: 3-Column Analytics & Compliance Matrix */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

            {/* Card 1: Document Verification Status */}
            <ChartCard 
              title="Document Verification Status" 
              subtitle="Aadhaar, 10th & 12th certificate audits"
            >
              <div className="space-y-4 pt-1">
                <div>
                  <div className="flex justify-between text-xs font-bold mb-1.5">
                    <span className="text-slate-700">Verified & Approved</span>
                    <span className="text-emerald-600 font-extrabold">{verifiedDocsCount} Students ({docVerificationRate}%)</span>
                  </div>
                  <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${docVerificationRate}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold mb-1.5">
                    <span className="text-slate-700">Pending Physical Verification</span>
                    <span className="text-amber-600 font-extrabold">{pendingDocsCount} Students</span>
                  </div>
                  <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full transition-all duration-500" style={{ width: `${Math.round((pendingDocsCount / Math.max(1, totalStudents)) * 100)}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold mb-1.5">
                    <span className="text-slate-700">Incomplete Document Files</span>
                    <span className="text-rose-600 font-extrabold">{incompleteDocsCount} Students</span>
                  </div>
                  <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-rose-500 rounded-full transition-all duration-500" style={{ width: `${Math.round((incompleteDocsCount / Math.max(1, totalStudents)) * 100)}%` }} />
                  </div>
                </div>
              </div>
            </ChartCard>

            {/* Card 2: Trade-wise Student Strength */}
            <ChartCard 
              title="Trade-wise Student Strength" 
              subtitle="Enrollment breakdown across trades"
            >
              <div className="space-y-2.5 pt-1 text-xs">
                {courses.map((c, i) => {
                  const courseName = c.name || c.course || "";
                  const count = students.filter(s => (s.course || "").toLowerCase() === courseName.toLowerCase()).length;
                  const feeObj = fees.find(f => (f.course || "").toLowerCase() === courseName.toLowerCase());
                  const totalFee = feeObj ? feeObj.total_fee : (c.total_fee || 15000);
                  return (
                    <div key={i} className="p-3 rounded-xl bg-slate-50/80 hover:bg-teal-50/40 border border-slate-200/80 hover:border-teal-400/40 hover:shadow-xs transition-all duration-200 flex items-center justify-between">
                      <div>
                        <strong className="text-slate-900 block font-bold">{courseName} Trade</strong>
                        <span className="text-[11px] text-slate-500">Tuition & Exam: {formatCurrency(totalFee)}</span>
                      </div>
                      <span className="font-extrabold text-teal-700 bg-teal-50 border border-teal-200/70 px-3 py-1 rounded-lg">
                        {count} Students
                      </span>
                    </div>
                  );
                })}
              </div>
            </ChartCard>

            {/* Card 3: Fee Collection vs Pending */}
            <ChartCard 
              title="Fee Collection vs Pending" 
              subtitle="Institutional financial ledger"
            >
              <div className="space-y-4">
                <div className="p-3.5 rounded-lg bg-teal-50/40 border border-teal-100 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-600 font-bold">Total Collection Progress</span>
                    <b className="text-teal-700 font-bold">{collectionRate}%</b>
                  </div>
                  <div className="h-2.5 w-full bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-teal-600 rounded-full transition-all duration-500" style={{ width: `${collectionRate}%` }} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-lg bg-emerald-50/40 border border-emerald-100">
                    <span className="text-[10px] text-emerald-700 font-bold uppercase block tracking-wider">Collected</span>
                    <strong className="text-sm font-bold text-emerald-700">{formatCurrency(totalCollected)}</strong>
                  </div>
                  <div className="p-3 rounded-lg bg-amber-50/40 border border-amber-100">
                    <span className="text-[10px] text-amber-700 font-bold uppercase block tracking-wider">Pending</span>
                    <strong className="text-sm font-bold text-amber-700">{formatCurrency(totalPending)}</strong>
                  </div>
                </div>

                <Link
                  href="/pages/Admin/fee-details"
                  className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-lg border border-teal-200 bg-teal-50/60 hover:bg-teal-100/60 text-xs font-bold text-teal-800 transition-colors shadow-2xs"
                >
                  <span>Manage Full Fee Ledger</span>
                  <ArrowUpRight size={14} className="text-teal-700" />
                </Link>
              </div>
            </ChartCard>

          </div>

          {/* Row 2: Document Verification Scrutiny Queue & Fast Operations */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

            {/* Left 7 Cols: Pending Document Verification Queue */}
            <div className="lg:col-span-7 bg-white rounded-xl p-5 sm:p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-slate-150">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center border border-teal-200/60 shadow-2xs">
                      <ShieldCheck size={18} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">Pending Document Verifications</h3>
                      <p className="text-[11px] text-slate-500">Aadhaar, 10th marksheet & photo scrutiny queue</p>
                    </div>
                  </div>
                  <Link 
                    href="/pages/Admin/Student" 
                    className="text-xs font-bold text-teal-600 hover:text-teal-700 flex items-center gap-1 transition-colors"
                  >
                    <span>View All</span>
                    <ChevronRight size={14} />
                  </Link>
                </div>

                <div className="space-y-3 pt-4">
                  {students.slice(0, 4).map((s) => (
                    <div 
                      key={s.id} 
                      className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 hover:border-teal-400 hover:bg-teal-50/20 transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-teal-600 text-white font-bold text-xs flex items-center justify-center shadow-2xs">
                          {s.name ? s.name.charAt(0).toUpperCase() : "S"}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-bold text-slate-900">{s.name}</h4>
                            <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider border ${
                              (s.documents_status || "Verified") === "Verified"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : "bg-amber-50 text-amber-700 border-amber-200"
                            }`}>
                              {s.documents_status || "Pending Verification"}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Trade: <span className="font-semibold text-slate-700">{s.course || "COPA"}</span> • Aadhaar: <span className="font-mono text-slate-700">{s.aadhaar_no || "Pending"}</span>
                          </p>
                        </div>
                      </div>

                      <Link
                        href={`/pages/Admin/Student`}
                        className="px-3 py-1.5 rounded-lg bg-white border border-teal-200 text-teal-700 hover:bg-teal-50 hover:text-teal-800 text-xs font-bold transition-all shadow-2xs inline-flex items-center justify-center gap-1 self-end sm:self-auto"
                      >
                        <span>Inspect</span>
                        <ArrowUpRight size={13} />
                      </Link>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 mt-2 border-t border-slate-150 flex items-center justify-between text-[11px] text-slate-500">
                <span>Showing {Math.min(4, totalStudents)} of {totalStudents} applicants</span>
                <span className="font-medium text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 size={13} />
                  KYC Verification Active
                </span>
              </div>
            </div>

            {/* Right 5 Cols: Quick Administrative Actions */}
            <div className="lg:col-span-5 bg-white rounded-xl p-5 sm:p-6 border border-slate-200 shadow-xs flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-slate-150">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center border border-teal-200/60 shadow-2xs">
                      <Sparkles size={18} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">Administrative Operations</h3>
                      <p className="text-[11px] text-slate-500">Institute fast workflows & services</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2.5 pt-4">
                  <Link
                    href="/pages/Home/Addmission_Application_Form"
                    className="p-3 rounded-lg bg-slate-50 hover:bg-teal-50/50 border border-slate-200 hover:border-teal-400 transition-all duration-200 flex items-center justify-between group/item cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center font-bold shadow-2xs">
                        <Plus size={16} />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 group-hover/item:text-teal-700 transition-colors">Enroll New Student</div>
                        <div className="text-[10px] text-slate-500">Direct admission & KYC creation</div>
                      </div>
                    </div>
                    <ChevronRight size={15} className="text-slate-400 group-hover/item:text-teal-600 group-hover/item:translate-x-0.5 transition-all" />
                  </Link>

                  <Link
                    href="/pages/Admin/fee-details"
                    className="p-3 rounded-lg bg-slate-50 hover:bg-teal-50/50 border border-slate-200 hover:border-teal-400 transition-all duration-200 flex items-center justify-between group/item cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center font-bold shadow-2xs">
                        <CreditCard size={16} />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 group-hover/item:text-teal-700 transition-colors">Fee Ledger & Receipts</div>
                        <div className="text-[10px] text-slate-500">Collect installment & print invoices</div>
                      </div>
                    </div>
                    <ChevronRight size={15} className="text-slate-400 group-hover/item:text-teal-600 group-hover/item:translate-x-0.5 transition-all" />
                  </Link>

                  <Link
                    href="/pages/Admin/Student"
                    className="p-3 rounded-lg bg-slate-50 hover:bg-teal-50/50 border border-slate-200 hover:border-teal-400 transition-all duration-200 flex items-center justify-between group/item cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center font-bold shadow-2xs">
                        <FileCheck2 size={16} />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 group-hover/item:text-teal-700 transition-colors">Document Verification Hub</div>
                        <div className="text-[10px] text-slate-500">Audit marksheets & Aadhaar cards</div>
                      </div>
                    </div>
                    <ChevronRight size={15} className="text-slate-400 group-hover/item:text-teal-600 group-hover/item:translate-x-0.5 transition-all" />
                  </Link>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-150 flex items-center justify-between text-[11px] text-slate-500">
                <span className="font-semibold text-slate-600">Affiliation: NCVT / DGET</span>
                <span className="font-mono text-slate-500">PR10001113</span>
              </div>
            </div>

          </div>

          {/* Recent Payments Log Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs w-full">

            <div className="p-4 sm:p-6 border-b border-slate-150 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Recent Fee Transactions</h3>
                <p className="text-xs text-slate-500">Live electronic payment receipts logged across all trades</p>
              </div>

              <Link
                href="/pages/Admin/fee-details"
                className="text-xs font-bold text-teal-600 hover:text-teal-700 flex items-center gap-1 self-start sm:self-auto transition-colors"
              >
                <span>View Full Transactions</span>
                <ChevronRight size={14} />
              </Link>
            </div>

            <div className="w-full overflow-x-auto touch-pan-x">
              <table className="w-full min-w-[620px] text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200/80 text-slate-600 font-bold uppercase tracking-wider">
                    <th className="py-3.5 px-4 sm:px-6">Transaction ID</th>
                    <th className="py-3.5 px-4 sm:px-6">Student Name</th>
                    <th className="py-3.5 px-4 sm:px-6">Trade</th>
                    <th className="py-3.5 px-4 sm:px-6">Amount Paid</th>
                    <th className="py-3.5 px-4 sm:px-6">Payment Method</th>
                    <th className="py-3.5 px-4 sm:px-6">Date</th>
                    <th className="py-3.5 px-4 sm:px-6 text-right">Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {payments.slice(0, 5).map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-6 font-mono font-bold text-slate-900">{p.transaction_id}</td>
                      <td className="py-3.5 px-6 font-bold text-slate-900">{p.student_name || "Enrolled Student"}</td>
                      <td className="py-3.5 px-6">
                        <span className="px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
                          {p.student_course || "Trade"}
                        </span>
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
                          className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-800 font-bold transition-all shadow-2xs cursor-pointer inline-flex items-center gap-1"
                        >
                          <Printer size={13} className="text-slate-500" />
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
