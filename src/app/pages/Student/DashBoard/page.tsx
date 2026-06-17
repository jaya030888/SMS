"use client";

import { useState, useEffect } from "react";
import Info_Card from "@/src/app/components/Info_Card";
import Info_sameliner from "@/src/app/components/Info_sameliner";
import StuNav from "@/src/app/components/StuNav";
import Link from "next/link";
import { 
  User, 
  Phone, 
  Calendar, 
  MapPin, 
  GraduationCap, 
  BookOpen, 
  Book, 
  LineChart, 
  Activity, 
  FileText, 
  ClipboardList, 
  Bell,
  Wrench
} from "lucide-react";

interface StudentData {
  id: number;
  name: string;
  fatherName: string;
  email: string;
  DOB: string;
  phone: string;
  Address: string;
  course: string;
  Qualification: string;
  amount_paid?: number;
  payment_status?: string;
}

const defaultStudent: StudentData = {
  id: 1,
  name: "Rajesh Kumar",
  fatherName: "Suresh Kumar",
  email: "rajesh@institute.edu",
  DOB: "2005-03-15",
  phone: "9876543210",
  Address: "123 Main Street, City, State - 123456",
  course: "Electrician",
  Qualification: "10th Pass",
};

export default function Page() {
  const [student, setStudent] = useState<StudentData>(defaultStudent);
  const [courseFees, setCourseFees] = useState<any[]>([]);
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
            throw new Error("Failed to fetch applicant details");
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

  const getSubjects = (courseName: string) => {
    const name = courseName.toLowerCase();
    if (name.includes("electrician")) {
      return ["Workshop Practice", "Electrical Theory", "Safety Practices", "Technical Drawing"];
    } else if (name.includes("copa") || name.includes("computer")) {
      return ["Computer Fundamentals", "HTML & CSS", "JavaScript", "Database Management"];
    } else if (name.includes("fitter")) {
      return ["Fitting Theory", "Workshop Calculation", "Engineering Drawing", "Practical Fitting"];
    } else {
      return ["General Workshop", "Trade Theory", "Safety & Health", "Technical Skills"];
    }
  };

  const getFeeDetails = () => {
    const courseName = student.course || "";
    const matchedFee = courseFees.find(
      (cf) => cf.course.toLowerCase() === courseName.toLowerCase() || 
              courseName.toLowerCase().includes(cf.course.toLowerCase())
    );

    const totalFee = matchedFee ? matchedFee.total_fee : 15000;
    const paidAmount = (student as any).amount_paid !== undefined ? (student as any).amount_paid : 2000;
    const balanceAmount = Math.max(0, totalFee - paidAmount);
    
    const dbStatus = (student as any).payment_status || "Pending";
    const status = balanceAmount <= 0 || dbStatus === "Paid" ? "Paid" : "Pending";
    const color = status === "Paid" ? "var(--success)" : "var(--warning)";

    return {
      status,
      total: `Rs. ${totalFee.toLocaleString("en-IN")}`,
      paid: `Rs. ${paidAmount.toLocaleString("en-IN")}`,
      balance: `Rs. ${balanceAmount.toLocaleString("en-IN")}`,
      color,
      percent: Math.round((paidAmount / totalFee) * 100)
    };
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
    } catch {
      return dateStr;
    }
  };

  const subjects = getSubjects(student.course);
  const fees = getFeeDetails();

  if (loading) {
    return (
      <>
        <StuNav name="Dashboard" />
        <main className="dashboard-page" style={{ textAlign: "center", padding: "4rem" }}>
          <h2>Loading Dashboard...</h2>
        </main>
      </>
    );
  }

  return (
    <>
      <StuNav name="Dashboard" />

      <main className="dashboard-page">
        <section className="dashboard-hero">
          <div className="course-badge">
            <GraduationCap size={22} className="text-primary" />
          </div>
          <div>
            <p className="eyebrow" style={{ color: "rgba(255, 255, 255, 0.78)" }}>Your enrolled course</p>
            <h2 style={{ color: "white" }}>{student.course}</h2>
            <p style={{ color: "rgba(255, 255, 255, 0.78)" }}>Track subjects, attendance, fees, and institute updates from one place.</p>
          </div>
        </section>

        <section className="panel">
          <div className="panel-heading">
            <BookOpen size={18} className="text-primary" />
            <h2>Course Subjects</h2>
          </div>
          <div className="chip-grid">
            {subjects.map((subject) => (
              <div className="subject-chip" key={subject}>
                <Book size={16} className="text-primary" />
                <p style={{ margin: 0 }}>{subject}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="dashboard-grid">
          <div className="panel progress-panel">
            <div className="panel-heading">
              <LineChart size={18} className="text-primary" />
              <h2>Course Progress</h2>
            </div>
            <p>Overall Completion</p>
            <progress value={fees.percent} max="100" />
            <div className="rank-pill">Current Rank: {student.id % 3 === 0 ? "1st" : student.id % 2 === 0 ? "2nd" : "3rd"} in batch</div>
          </div>

          <div className="stats-grid">
            <div className="stat-card">
              <span>Attendance</span>
              <strong>{student.id % 2 === 0 ? "92%" : "87%"}</strong>
              <p>{student.id % 2 === 0 ? "24/26" : "23/26"} days present</p>
            </div>
            <div className="stat-card">
              <span>Average Score</span>
              <strong>{student.id % 2 === 0 ? "84%" : "78%"}</strong>
              <p>Grade: {student.id % 2 === 0 ? "A++" : "A+"}</p>
            </div>
            <div className="stat-card">
              <span>Fee Status</span>
              <strong style={{ color: fees.color }}>{fees.status}</strong>
              <p>{fees.status === "Paid" ? "Fully paid" : "Balance due"}</p>
            </div>
          </div>
        </section>

        <section className="dashboard-grid two">
          <div className="panel">
            <h2>Personal Information</h2>
            <div className="stack-list">
              <Info_Card icon={User} feild="Full Name" entry={student.name} />
              <Info_Card icon={User} feild="Father's Name" entry={student.fatherName} />
              <Info_Card icon={Phone} feild="Phone Number" entry={String(student.phone)} />
              <Info_Card icon={Calendar} feild="Date of Birth" entry={formatDate(student.DOB)} />
              <Info_Card icon={MapPin} feild="Address" entry={student.Address} />
              <Info_Card icon={GraduationCap} feild="Previous Qualification" entry={student.Qualification} />
            </div>
          </div>

          <div className="panel">
            <h2>Fee Details</h2>
            <Info_sameliner label="Total Fee" entry={fees.total} />
            <Info_sameliner label="Paid Amount" entry={fees.paid} entryColor={fees.color} />
            <Info_sameliner label="Balance" entry={fees.balance} entryColor={fees.status === "Paid" ? "var(--muted)" : "var(--warning)"} />
            <Link href="/pages/Student/Fee_Details" className="button button-primary" style={{ width: "100%", marginTop: "1rem" }}>
              Pay Fees & View History
            </Link>

            <h2 className="panel-subtitle">{student.course} Updates</h2>
            <div className="stack-list">
              <Info_Card icon={Wrench} feild="Practical Test" entry="Workshop assessment on June 10" />
              <Info_Card icon={FileText} feild="Theory Exam" entry="Final exams start from June 15" />
              <Info_Card icon={Bell} feild="Holiday Notice" entry="Institute closed on June 7" />
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
