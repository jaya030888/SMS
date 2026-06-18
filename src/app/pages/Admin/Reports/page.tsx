"use client";

import { useEffect, useState } from "react";
import StuNav from "@/src/app/components/StuNav";
import { Search, Filter, Download, FileText, Calendar, RefreshCw, Printer, AlertCircle, ChevronDown, CheckCircle, Clock } from "lucide-react";

interface StudentRecord {
  id: number;
  name: string;
  fatherName: string;
  email: string;
  DOB: string;
  phone: string;
  Address: string;
  course: string;
  Qualification: string;
  Enrollment_Date: string;
  amount_paid: number;
  remaining_balance: number;
  payment_status: string;
}

interface PaymentRecord {
  id: number;
  student_id: number;
  amount: number;
  payment_method: string;
  transaction_id: string;
  payment_mode: string;
  payment_status: string;
  payment_date: string;
  remarks: string;
  student_name: string;
  student_course: string;
}

interface CourseFee {
  course: string;
  total_fee: number;
}

export default function ReportsPage() {
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [courses, setCourses] = useState<CourseFee[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Report configurations
  const [reportType, setReportType] = useState<"students" | "fees" | "payments">("students");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCourse, setFilterCourse] = useState("All");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");

  const fetchData = async () => {
    try {
      const [resStudents, resCourses, resStats] = await Promise.all([
        fetch("/api/applicants"),
        fetch("/api/course_fees"),
        fetch("/api/admin/fee_stats")
      ]);

      if (resStudents.ok) {
        const data = await resStudents.json();
        setStudents(data);
      }
      if (resCourses.ok) {
        const data = await resCourses.json();
        setCourses(data);
      }
      if (resStats.ok) {
        const data = await resStats.json();
        setPayments(data.recentPayments || []);
      }
    } catch (err) {
      console.error("Error fetching report data:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
    } catch {
      return dateStr;
    }
  };

  // ---------------------------------
  // Filter logics
  // ---------------------------------
  const getFilteredStudents = () => {
    return students.filter((s) => {
      const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            String(s.id).includes(searchQuery) ||
                            s.phone.includes(searchQuery);
      
      const matchesCourse = filterCourse === "All" || s.course.toLowerCase() === filterCourse.toLowerCase();
      
      const matchesStatus = filterStatus === "All" || 
                            (filterStatus === "Paid" && s.payment_status === "Paid") ||
                            (filterStatus === "Pending" && s.payment_status !== "Paid");

      let matchesDate = true;
      if (startDate || endDate) {
        const enrolled = new Date(s.Enrollment_Date || "2026-01-15");
        if (startDate) {
          const start = new Date(startDate);
          start.setHours(0,0,0,0);
          if (enrolled < start) matchesDate = false;
        }
        if (endDate) {
          const end = new Date(endDate);
          end.setHours(23,59,59,999);
          if (enrolled > end) matchesDate = false;
        }
      }

      return matchesSearch && matchesCourse && matchesStatus && matchesDate;
    });
  };

  const getFilteredPayments = () => {
    return payments.filter((p) => {
      const matchesSearch = p.student_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            p.transaction_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            String(p.student_id).includes(searchQuery);

      const matchesCourse = filterCourse === "All" || p.student_course.toLowerCase() === filterCourse.toLowerCase();

      const matchesStatus = filterStatus === "All" || p.payment_status.toLowerCase() === filterStatus.toLowerCase();

      let matchesDate = true;
      if (startDate || endDate) {
        const payDate = new Date(p.payment_date);
        if (startDate) {
          const start = new Date(startDate);
          start.setHours(0,0,0,0);
          if (payDate < start) matchesDate = false;
        }
        if (endDate) {
          const end = new Date(endDate);
          end.setHours(23,59,59,999);
          if (payDate > end) matchesDate = false;
        }
      }

      return matchesSearch && matchesCourse && matchesStatus && matchesDate;
    });
  };

  // ---------------------------------
  // Excel / CSV Export Trigger
  // ---------------------------------
  const handleExportCSV = () => {
    let headers: string[] = [];
    let rows: string[][] = [];
    let filename = "";

    if (reportType === "students") {
      headers = ["Student ID", "Student Name", "Father's Name", "Email Address", "Phone", "DOB", "Enrolled Course", "Qualification", "Enrollment Date", "Fees Status"];
      rows = getFilteredStudents().map(s => [
        String(s.id),
        `"${s.name.replace(/"/g, '""')}"`,
        `"${s.fatherName.replace(/"/g, '""')}"`,
        s.email,
        s.phone,
        s.DOB ? s.DOB.split("T")[0] : "",
        s.course,
        s.Qualification,
        s.Enrollment_Date ? s.Enrollment_Date.split("T")[0] : "",
        s.payment_status
      ]);
      filename = `students_directory_report_${Date.now()}.csv`;
    } else if (reportType === "fees") {
      headers = ["Student ID", "Student Name", "Trade/Course", "Billed Fee Amount (₹)", "Total Paid Amount (₹)", "Outstanding Dues (₹)", "Billing Status"];
      rows = getFilteredStudents().map(s => {
        const matchedCourse = courses.find(c => c.course.toLowerCase() === s.course.toLowerCase());
        const totalFee = matchedCourse ? matchedCourse.total_fee : 15000;
        return [
          String(s.id),
          `"${s.name.replace(/"/g, '""')}"`,
          s.course,
          String(totalFee),
          String(s.amount_paid),
          String(s.remaining_balance),
          s.payment_status
        ];
      });
      filename = `fees_ledger_report_${Date.now()}.csv`;
    } else {
      headers = ["Transaction Date", "Student ID", "Student Name", "Trade/Course", "Transaction ID", "Payment Mode", "Payment Method", "Amount Paid (₹)", "Remarks", "Status"];
      rows = getFilteredPayments().map(p => [
        p.payment_date ? p.payment_date.split("T")[0] : "",
        String(p.student_id),
        `"${p.student_name.replace(/"/g, '""')}"`,
        p.student_course,
        p.transaction_id,
        p.payment_mode,
        p.payment_method,
        String(p.amount),
        `"${(p.remarks || "").replace(/"/g, '""')}"`,
        p.payment_status
      ]);
      filename = `payments_journal_report_${Date.now()}.csv`;
    }

    if (rows.length === 0) {
      alert("No data available to export with current filters.");
      return;
    }

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + [
      headers.join(","),
      ...rows.map(e => e.join(","))
    ].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ---------------------------------
  // Print / PDF Trigger
  // ---------------------------------
  const handlePrint = () => {
    window.print();
  };

  const studentList = getFilteredStudents();
  const paymentList = getFilteredPayments();

  return (
    <>
      <StuNav name="ERP Reporting Console" role="admin" />

      {/* Screen only layout controls */}
      <main className="dashboard-page mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 print:p-0 print:m-0">
        
        {/* Header section (hidden on print) */}
        <section className="section-title-row flex justify-between items-center mb-6 print:hidden">
          <div>
            <p className="eyebrow m-0 text-primary uppercase text-xs tracking-wider">Reports & Audits Ledger</p>
            <h1 className="m-0 text-slate-800 text-3xl font-extrabold tracking-tight">Institutional Reports Dashboard</h1>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleRefresh}
              className="button button-secondary flex items-center gap-1.5"
              disabled={refreshing}
            >
              <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
              Refresh
            </button>
            <button
              onClick={handlePrint}
              className="button button-secondary flex items-center gap-1.5 border-slate-300 text-slate-700 hover:bg-slate-50"
            >
              <Printer size={16} />
              Export PDF / Print
            </button>
            <button
              onClick={handleExportCSV}
              className="button button-primary flex items-center gap-1.5"
            >
              <Download size={16} />
              Export to Excel (CSV)
            </button>
          </div>
        </section>

        {/* Report configuration selector tabs (hidden on print) */}
        <section className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm mb-6 print:hidden">
          <div className="flex items-center gap-2 text-slate-800 font-bold mb-4">
            <FileText size={18} className="text-primary" />
            <h2>Choose Report Type</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {(["students", "fees", "payments"] as const).map((type) => (
              <button
                key={type}
                onClick={() => {
                  setReportType(type);
                  setSearchQuery("");
                  setFilterStatus("All");
                  setStartDate("");
                  setEndDate("");
                }}
                className={`px-5 py-2.5 rounded-xl text-sm font-bold tracking-wide uppercase transition-all duration-150 ${
                  reportType === type
                    ? "bg-primary text-white shadow-md shadow-primary/20"
                    : "bg-slate-100 hover:bg-slate-200/70 text-slate-600 hover:text-slate-800"
                }`}
              >
                {type === "students" && "Student Directory"}
                {type === "fees" && "Fee & Dues Ledger"}
                {type === "payments" && "Payments Log Journal"}
              </button>
            ))}
          </div>
        </section>

        {/* Filters configuration section (hidden on print) */}
        <section className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm mb-6 print:hidden">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
            
            {/* Search Box */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Search Query</label>
              <div className="search-box w-full" style={{ background: "var(--surface-soft)" }}>
                <Search size={16} />
                <input
                  type="text"
                  placeholder={
                    reportType === "payments" 
                      ? "Search by student name or Txn ID..." 
                      : "Search by student name, ID or phone..."
                  }
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ border: 0, outline: "none", width: "100%", background: "transparent" }}
                />
              </div>
            </div>

            {/* Course Filter */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Academic Trade/Course</label>
              <select 
                value={filterCourse} 
                onChange={(e) => setFilterCourse(e.target.value)}
                style={{ minHeight: "52px", background: "var(--surface)", border: "1px solid var(--border)", width: "100%" }}
              >
                <option value="All">All Courses</option>
                {courses.map(c => (
                  <option key={c.course} value={c.course}>{c.course}</option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                {reportType === "payments" ? "Payment Status" : "Billing Status"}
              </label>
              <select 
                value={filterStatus} 
                onChange={(e) => setFilterStatus(e.target.value)}
                style={{ minHeight: "52px", background: "var(--surface)", border: "1px solid var(--border)", width: "100%" }}
              >
                <option value="All">All Statuses</option>
                {reportType === "payments" ? (
                  <>
                    <option value="Success">Success</option>
                    <option value="Pending">Pending Verification</option>
                  </>
                ) : (
                  <>
                    <option value="Paid">Fully Paid</option>
                    <option value="Pending">Pending Dues</option>
                  </>
                )}
              </select>
            </div>

            {/* Start Date */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Start Date</label>
              <input 
                type="date" 
                value={startDate} 
                onChange={(e) => setStartDate(e.target.value)}
                style={{ minHeight: "52px", background: "var(--surface)", border: "1px solid var(--border)", width: "100%", borderRadius: "12px", padding: "0 1rem" }}
              />
            </div>

            {/* End Date */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">End Date</label>
              <input 
                type="date" 
                value={endDate} 
                onChange={(e) => setEndDate(e.target.value)}
                style={{ minHeight: "52px", background: "var(--surface)", border: "1px solid var(--border)", width: "100%", borderRadius: "12px", padding: "0 1rem" }}
              />
            </div>

          </div>
        </section>

        {/* PRINT ONLY: Professional Institutional Letterhead Header */}
        <div className="hidden print:block mb-8 p-6 border-b-2 border-primary">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-black text-primary tracking-tight m-0">MAA GAURI PRIVATE ITI</h1>
              <p className="text-xs text-slate-500 font-semibold m-0 mt-1">Affiliated to NCVT, Govt. of India • Code: GR090011</p>
              <p className="text-xs text-slate-400 font-medium m-0">Campus: City Center Main Road, District, State</p>
            </div>
            <div className="text-right">
              <h2 className="text-lg font-black text-slate-800 uppercase tracking-wider m-0">
                {reportType === "students" && "STUDENT DIRECTORY REPORT"}
                {reportType === "fees" && "FEE ACCOUNT SUMMARY REPORT"}
                {reportType === "payments" && "PAYMENT TRANSACTION JOURNAL"}
              </h2>
              <p className="text-xs text-slate-400 font-bold m-0 mt-1">Date Generated: {new Date().toLocaleDateString("en-IN")}</p>
              <p className="text-xs text-slate-400 font-semibold m-0">Generated by: Institutional Admin Console</p>
            </div>
          </div>
        </div>

        {/* Dynamic Interactive Reports Table */}
        <section className="panel bg-white border border-slate-100 p-6 rounded-2xl shadow-sm print:shadow-none print:border-none print:p-0">
          
          <div className="hidden print:block text-sm text-slate-500 font-bold mb-4">
            Showing filtered ledger summaries. Filters applied: Course = {filterCourse}, Status = {filterStatus} 
            {startDate ? ` from ${startDate}` : ""} {endDate ? ` to ${endDate}` : ""}.
          </div>

          {loading ? (
            <div className="text-center py-12 text-slate-500 font-semibold">Generating report records...</div>
          ) : (
            <>
              {/* Case 1: Student Registry Report */}
              {reportType === "students" && (
                <>
                  {studentList.length === 0 ? (
                    <div className="text-center py-12 text-slate-400 font-semibold">No students directory matches the filters.</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200 text-slate-800 text-left font-bold text-xs uppercase tracking-wider">
                            <th style={{ padding: "0.8rem" }}>ID</th>
                            <th style={{ padding: "0.8rem" }}>Student Name</th>
                            <th style={{ padding: "0.8rem" }}>Father's Name</th>
                            <th style={{ padding: "0.8rem" }}>Enrolled Course</th>
                            <th style={{ padding: "0.8rem" }}>Phone</th>
                            <th style={{ padding: "0.8rem" }}>Email Address</th>
                            <th style={{ padding: "0.8rem" }}>Enrollment Date</th>
                            <th style={{ padding: "0.8rem" }}>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {studentList.map(s => (
                            <tr key={s.id} className="border-b border-slate-100 text-sm hover:bg-slate-50/50">
                              <td style={{ padding: "0.9rem 0.8rem", fontFamily: "monospace" }}>#{s.id}</td>
                              <td style={{ padding: "0.9rem 0.8rem", fontWeight: 600 }}>{s.name}</td>
                              <td style={{ padding: "0.9rem 0.8rem" }}>{s.fatherName}</td>
                              <td style={{ padding: "0.9rem 0.8rem" }}>{s.course}</td>
                              <td style={{ padding: "0.9rem 0.8rem" }}>{s.phone}</td>
                              <td style={{ padding: "0.9rem 0.8rem", color: "var(--muted)" }}>{s.email}</td>
                              <td style={{ padding: "0.9rem 0.8rem" }}>{formatDate(s.Enrollment_Date)}</td>
                              <td style={{ padding: "0.9rem 0.8rem" }}>
                                <span className={`status-pill ${s.payment_status === "Paid" ? "paid" : "pending"} text-xs font-bold`}>
                                  {s.payment_status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </>
              )}

              {/* Case 2: Fee Ledger Report */}
              {reportType === "fees" && (
                <>
                  {studentList.length === 0 ? (
                    <div className="text-center py-12 text-slate-400 font-semibold">No students directory matches the filters.</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200 text-slate-800 text-left font-bold text-xs uppercase tracking-wider">
                            <th style={{ padding: "0.8rem" }}>ID</th>
                            <th style={{ padding: "0.8rem" }}>Student Name</th>
                            <th style={{ padding: "0.8rem" }}>Trade/Course</th>
                            <th style={{ padding: "0.8rem" }}>Billed Fees Amount</th>
                            <th style={{ padding: "0.8rem" }}>Fees Paid Amount</th>
                            <th style={{ padding: "0.8rem" }}>Outstanding Balance</th>
                            <th style={{ padding: "0.8rem" }}>Billing Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {studentList.map(s => {
                            const matchedCourse = courses.find(c => c.course.toLowerCase() === s.course.toLowerCase());
                            const totalFee = matchedCourse ? matchedCourse.total_fee : 15000;
                            return (
                              <tr key={s.id} className="border-b border-slate-100 text-sm hover:bg-slate-50/50">
                                <td style={{ padding: "0.9rem 0.8rem", fontFamily: "monospace" }}>#{s.id}</td>
                                <td style={{ padding: "0.9rem 0.8rem", fontWeight: 600 }}>{s.name}</td>
                                <td style={{ padding: "0.9rem 0.8rem" }}>{s.course}</td>
                                <td style={{ padding: "0.9rem 0.8rem", fontWeight: 700 }}>{formatCurrency(totalFee)}</td>
                                <td style={{ padding: "0.9rem 0.8rem", fontWeight: 700, color: "var(--success)" }}>{formatCurrency(s.amount_paid)}</td>
                                <td style={{ padding: "0.9rem 0.8rem", fontWeight: 700, color: s.remaining_balance > 0 ? "var(--warning)" : "var(--muted)" }}>
                                  {formatCurrency(s.remaining_balance)}
                                </td>
                                <td style={{ padding: "0.9rem 0.8rem" }}>
                                  <span className={`status-pill ${s.payment_status === "Paid" ? "paid" : "pending"} text-xs font-bold`}>
                                    {s.payment_status}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </>
              )}

              {/* Case 3: Payments Log Journal */}
              {reportType === "payments" && (
                <>
                  {paymentList.length === 0 ? (
                    <div className="text-center py-12 text-slate-400 font-semibold">No payment transactions match the filters.</div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200 text-slate-800 text-left font-bold text-xs uppercase tracking-wider">
                            <th style={{ padding: "0.8rem" }}>Txn Date</th>
                            <th style={{ padding: "0.8rem" }}>Student Name</th>
                            <th style={{ padding: "0.8rem" }}>Trade/Course</th>
                            <th style={{ padding: "0.8rem" }}>Transaction ID</th>
                            <th style={{ padding: "0.8rem" }}>Mode (Method)</th>
                            <th style={{ padding: "0.8rem" }}>Remarks / Notes</th>
                            <th style={{ padding: "0.8rem" }}>Amount</th>
                            <th style={{ padding: "0.8rem" }}>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {paymentList.map(p => (
                            <tr key={p.id} className="border-b border-slate-100 text-sm hover:bg-slate-50/50">
                              <td style={{ padding: "0.9rem 0.8rem" }}>{formatDate(p.payment_date)}</td>
                              <td style={{ padding: "0.9rem 0.8rem", fontWeight: 600 }}>{p.student_name}</td>
                              <td style={{ padding: "0.9rem 0.8rem" }}>{p.student_course}</td>
                              <td style={{ padding: "0.9rem 0.8rem", fontFamily: "monospace", fontSize: "0.82rem", color: "var(--muted)" }}>{p.transaction_id}</td>
                              <td style={{ padding: "0.9rem 0.8rem" }}>
                                <strong>{p.payment_mode}</strong> ({p.payment_method})
                              </td>
                              <td style={{ padding: "0.9rem 0.8rem", color: "var(--muted)" }}>{p.remarks || "Semester dues cleared"}</td>
                              <td style={{ padding: "0.9rem 0.8rem", fontWeight: 700, color: "var(--primary)" }}>{formatCurrency(p.amount)}</td>
                              <td style={{ padding: "0.9rem 0.8rem" }}>
                                <span className={`status-pill ${p.payment_status.toLowerCase() === "success" ? "paid" : "pending"} text-xs font-bold`}>
                                  {p.payment_status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </>
              )}
            </>
          )}

          {/* Report Generation Footer (Print only) */}
          <div className="hidden print:block mt-12 text-center text-xs text-slate-400 font-bold border-t border-slate-100 pt-6">
            Maa Gauri ITI Educational ERP Portal • City Campus Office • cityoffice@maagauriiti.edu.in
            <p className="mt-1">&copy; {new Date().getFullYear()} Maa Gauri ITI. All rights reserved.</p>
          </div>

        </section>

      </main>
    </>
  );
}
