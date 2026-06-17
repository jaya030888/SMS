"use client";

import { useState, useEffect } from "react";
import Card from "./Card";
import Course_wise_Card from "./Course_wise_Card";
import QuickActions from "./QuickActions";
import Applications from "./Applications";
import { CreditCard, Calendar, RefreshCw } from "lucide-react";

interface Applicant {
  id: number;
  name: string;
  fatherName: string;
  email: string;
  DOB: string;
  phone: string;
  Address: string;
  course: string;
  Qualification: string;
  payment_status: string;
  amount_paid: number;
  remaining_balance: number;
  Enrollment_Date: string;
}

interface CourseFee {
  course: string;
  tuition_fee: number;
  lab_fee: number;
  library_fee: number;
  exam_fee: number;
  development_fee: number;
  total_fee: number;
}

interface PaymentLog {
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

interface CourseDashboardProps {
  courseName: string;
}

export default function CourseDashboard({ courseName }: CourseDashboardProps) {
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [courses, setCourses] = useState<CourseFee[]>([]);
  const [recentPayments, setRecentPayments] = useState<PaymentLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const [resApplicants, resCourses, resStats] = await Promise.all([
        fetch("/api/applicants"),
        fetch("/api/course_fees"),
        fetch("/api/admin/fee_stats")
      ]);

      if (resApplicants.ok) {
        const data = await resApplicants.json();
        setApplicants(data);
      }
      if (resCourses.ok) {
        const data = await resCourses.json();
        setCourses(data);
      }
      if (resStats.ok) {
        const data = await resStats.json();
        setRecentPayments(data.recentPayments || []);
      }
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [courseName]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  if (loading) {
    return <div className="text-center py-12 text-slate-500 font-semibold">Loading dashboard layout...</div>;
  }

  // Filter students based on course selection
  const isAll = courseName === "All";
  const displayStudents = isAll
    ? applicants
    : applicants.filter((a) => a.course.toLowerCase() === courseName.toLowerCase());

  // Compute stats dynamically
  const totalStudents = displayStudents.length;
  
  // Dynamic collection calculations
  let totalCollected = 0;
  let totalPending = 0;
  let fullyPaidCount = 0;
  let pendingCount = 0;

  displayStudents.forEach((s) => {
    totalCollected += s.amount_paid || 0;
    totalPending += s.remaining_balance || 0;
    if (s.payment_status === "Paid") {
      fullyPaidCount++;
    } else {
      pendingCount++;
    }
  });

  // Calculate stats for course summary cards (used in "All" view)
  const getCourseStats = (cName: string) => {
    const list = applicants.filter((a) => a.course.toLowerCase() === cName.toLowerCase());
    const total = list.length;
    const paid = list.filter((a) => a.payment_status === "Paid").length;
    const pending = list.filter((a) => a.payment_status !== "Paid").length;
    return { total, paid, pending };
  };

  // Filter recent payments for the selected course
  const courseRecentPayments = isAll
    ? recentPayments.slice(0, 5)
    : recentPayments.filter((p) => p.student_course.toLowerCase() === courseName.toLowerCase()).slice(0, 5);

  return (
    <div className="space-y-8">
      {/* 4-KPI Grid row (fully responsive layout) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card label="Total Students" entry={String(totalStudents)} image="/file.svg" alter="Total Students" />
        <Card label="Total Collected" entry={formatCurrency(totalCollected)} image="/file.svg" alter="Total Collected" />
        <Card label="Pending Dues" entry={formatCurrency(totalPending)} image="/file.svg" alter="Pending Dues" />
        <Card label="Fully Paid Students" entry={String(fullyPaidCount)} image="/file.svg" alter="Fully Paid" />
      </div>

      {isAll ? (
        <>
          {/* Course Summaries Grid */}
          <div>
            <h2 className="text-xl font-extrabold text-slate-800 tracking-tight mb-4 flex items-center gap-1.5">Overview by Academic Trade</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {courses.map((c) => {
                const cStats = getCourseStats(c.course);
                return (
                  <Course_wise_Card
                    key={c.course}
                    image="/file.svg"
                    alter={c.course}
                    course={c.course}
                    totalStudents={String(cStats.total)}
                    feesPaid={String(cStats.paid)}
                    feesPending={String(cStats.pending)}
                  />
                );
              })}
            </div>
          </div>

          <QuickActions />

          {/* Recent Registrations & Payments Lists side-by-side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="panel bg-white border border-slate-100 p-6 rounded-2xl shadow-sm">
              <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-1.5">Recent Registrations</h2>
              <div className="space-y-3">
                {applicants.length === 0 ? (
                  <p className="text-sm text-slate-400 font-semibold py-4">No recent student registrations.</p>
                ) : (
                  applicants.slice(0, 5).map((app) => (
                    <Applications
                      key={app.id}
                      name={app.name}
                      course={app.course}
                      feeStatus={app.payment_status || "Pending"}
                    />
                  ))
                )}
              </div>
            </div>

            <div className="panel bg-white border border-slate-100 p-6 rounded-2xl shadow-sm">
              <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-1.5">Recent Payments</h2>
              <div className="space-y-3">
                {courseRecentPayments.length === 0 ? (
                  <p className="text-sm text-slate-400 font-semibold py-4">No recent payments logged.</p>
                ) : (
                  courseRecentPayments.map((p) => {
                    const formattedDate = new Date(p.payment_date).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short"
                    });
                    return (
                      <div key={p.id} className="flex justify-between items-center p-3 bg-slate-50 border border-slate-100 rounded-xl">
                        <div className="flex gap-2.5 items-center">
                          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                            <CreditCard size={15} />
                          </span>
                          <div>
                            <p className="text-xs font-bold text-slate-700">{p.student_name}</p>
                            <span className="text-[10px] text-slate-400 font-semibold">{p.student_course} • {formattedDate}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <strong className="text-xs font-black text-slate-800 block">{formatCurrency(p.amount)}</strong>
                          <span className="text-[9px] font-black uppercase text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full">{p.payment_method}</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          <QuickActions />

          {/* Student list filtered for this specific course */}
          <div className="panel bg-white border border-slate-100 p-6 rounded-2xl shadow-sm">
            <h2 className="text-xl font-bold text-slate-800 mb-4">{courseName} Student Directory</h2>
            
            {displayStudents.length === 0 ? (
              <p className="text-sm text-slate-400 font-semibold py-8 text-center">No students registered in this trade yet.</p>
            ) : (
              <div className="space-y-3">
                {displayStudents.map((student) => (
                  <div key={student.id} className="flex justify-between items-center p-3.5 bg-slate-50 border border-slate-150 rounded-xl">
                    <div>
                      <p className="text-sm font-extrabold text-slate-800 tracking-tight">{student.name}</p>
                      <span className="text-xs text-slate-450 font-semibold">ID: #{student.id} • Phone: {student.phone}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right hidden sm:block">
                        <span className="text-[10px] text-slate-400 font-black uppercase block">Outstanding Dues</span>
                        <strong className="text-xs font-black text-slate-700">{formatCurrency(student.remaining_balance)}</strong>
                      </div>
                      <span className={`status-pill ${student.payment_status === "Paid" ? "paid" : "pending"}`}>
                        {student.payment_status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
