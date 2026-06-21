"use client";

import { useEffect, useState } from "react";
import Info2liner_Card from "@/src/app/components/Info2liner_Card";
import Month_Card from "@/src/app/components/Month_Card";
import ProgressCircle from "@/src/app/components/ProgressCircle";
import StuNav from "@/src/app/components/StuNav";
import { Sparkles, CalendarX } from "lucide-react";

interface AttendanceLog {
  id: number;
  status: "Present" | "Absent";
  date: string;
  remarks: string | null;
}

interface AttendanceSummary {
  total: number;
  present: number;
  absent: number;
  rate: number | null;
}

interface GroupedMonth {
  month: string;
  year: string;
  days: [string, string, string][];
}

export default function Page() {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<AttendanceSummary>({ total: 0, present: 0, absent: 0, rate: null });
  const [groupedMonths, setGroupedMonths] = useState<GroupedMonth[]>([]);

  useEffect(() => {
    fetch("/api/auth/session")
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error("No session");
      })
      .then((session) => {
        const studentId = session.studentId;
        return fetch(`/api/attendance?student_id=${studentId}`);
      })
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error("Failed to fetch attendance");
      })
      .then((data) => {
        if (data.summary) {
          setSummary(data.summary);
        }

        const logs = data.logs || [];
        const monthGroups: { [key: string]: { month: string; year: string; days: [string, string, string][] } } = {};

        logs.forEach((log: AttendanceLog) => {
          const d = new Date(log.date);
          const monthName = d.toLocaleDateString("en-US", { month: "long" });
          const yearVal = String(d.getFullYear());
          const dayOfMonth = String(d.getDate());
          const dayOfWeek = d.toLocaleDateString("en-US", { weekday: "short" });
          const status = log.status === "Present" ? "P" : "A";

          const groupKey = `${monthName} ${yearVal}`;
          if (!monthGroups[groupKey]) {
            monthGroups[groupKey] = {
              month: monthName,
              year: yearVal,
              days: [],
            };
          }
          monthGroups[groupKey].days.push([dayOfMonth, dayOfWeek, status]);
        });

        // Convert grouped object to array and sort days chronologically within each month
        const formattedGroups = Object.values(monthGroups).map((group) => {
          group.days.sort((a, b) => Number(a[0]) - Number(b[0]));
          return group;
        });

        setGroupedMonths(formattedGroups);
      })
      .catch((err) => {
        console.error("Error fetching attendance details:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <>
        <StuNav name="My Attendance" />
        <main className="dashboard-page" style={{ textAlign: "center", padding: "6rem 2rem" }}>
          <div style={{
            border: "4px solid rgba(25, 25, 112, 0.1)",
            borderTop: "4px solid var(--primary)",
            borderRadius: "50%",
            width: "50px",
            height: "50px",
            animation: "spin 1s linear infinite",
            margin: "0 auto 1.5rem"
          }}></div>
          <h2>Loading Attendance Records...</h2>
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        </main>
      </>
    );
  }

  const attendanceRate = summary.rate !== null ? summary.rate : 100;
  const isEligible = attendanceRate >= 75 ? "Yes" : "No";
  
  // Days buffer calculation: if rate >= 75%, how many extra days can they miss?
  const bufferDays = summary.total > 0 && attendanceRate >= 75
    ? Math.max(0, Math.floor((summary.present - 0.75 * summary.total) / 0.75))
    : 0;

  return (
    <>
      <StuNav name="My Attendance" />

      <main className="dashboard-page">
        <section className="dashboard-grid two">
          <div className="panel attendance-summary">
            <h2>Overall Attendance</h2>
            <ProgressCircle percentage={attendanceRate} label={attendanceRate >= 75 ? "Safe" : "Warning"} />
            <div className="mini-stats">
              <Info2liner_Card label={String(summary.present)} entry="Present" />
              <Info2liner_Card label={String(summary.absent)} entry="Absent" />
            </div>
          </div>

          <div className="panel notice-panel">
            <div className="panel-heading">
              <Sparkles className="text-primary" size={18} />
              <h2>{attendanceRate >= 75 ? "You are on track" : "Attention Required"}</h2>
            </div>
            <p>
              {attendanceRate >= 75
                ? `Your attendance is ${attendanceRate}%, safely above the 75% minimum required for examination eligibility.`
                : `Your attendance is ${attendanceRate}%, which is below the 75% minimum limit. Please attend regularly.`}
            </p>
            <div className="mini-stats">
              <Info2liner_Card label={String(summary.total)} entry="Total Days" />
              <Info2liner_Card label={String(bufferDays)} entry="Days Buffer" />
              <Info2liner_Card label={isEligible} entry="Exam Eligible" />
            </div>
          </div>
        </section>

        {groupedMonths.length === 0 ? (
          <section className="panel" style={{ textAlign: "center", padding: "3rem 1rem", color: "var(--muted)" }}>
            <CalendarX size={40} style={{ margin: "0 auto 1rem", opacity: 0.5 }} />
            <p>No attendance records logged for your account yet.</p>
          </section>
        ) : (
          groupedMonths.map((group) => (
            <Month_Card
              key={`${group.month}-${group.year}`}
              month={group.month}
              year={group.year}
              days={group.days}
            />
          ))
        )}
      </main>
    </>
  );
}
