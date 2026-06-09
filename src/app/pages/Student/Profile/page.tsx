"use client";

import { useState, useEffect } from "react";
import Info2liner_Card from "@/src/app/components/Info2liner_Card";
import StuNav from "@/src/app/components/StuNav";
import Image from "next/image";
import Link from "next/link";

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
  Enrollment_Date?: string;
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
  Enrollment_Date: "2026-01-15",
};

export default function Page() {
  const [student, setStudent] = useState<StudentData>(defaultStudent);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedId = localStorage.getItem("currentStudentId") || "1";

      fetch("/api/applicants")
        .then((res) => {
          if (res.ok) return res.json();
          throw new Error("Failed to fetch");
        })
        .then((applicants: StudentData[]) => {
          const matched = applicants.find((a) => String(a.id) === String(storedId));
          if (matched) {
            setStudent(matched);
          } else if (applicants.length > 0) {
            setStudent(applicants[applicants.length - 1]);
          }
        })
        .catch((err) => {
          console.error("Error fetching student profile:", err);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, []);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
    } catch (e) {
      return dateStr;
    }
  };

  if (loading) {
    return (
      <>
        <StuNav name="My Profile" />
        <main className="dashboard-page" style={{ textAlign: "center", padding: "4rem" }}>
          <h2>Loading Profile...</h2>
        </main>
      </>
    );
  }

  return (
    <>
      <StuNav name="My Profile" />

      <main className="dashboard-page">
        <section className="profile-hero panel">
          <div className="avatar">
            <Image src="/file.svg" alt="Student" width={34} height={34} />
          </div>

          <div>
            <h2>{student.name}</h2>
            <p>Student ID: #{student.id}</p>
            <span style={{ color: "var(--secondary)", fontWeight: 900 }}>{student.course}</span>
          </div>

          <Link className="button button-primary" href="#">
            Edit Profile
          </Link>
        </section>

        <section className="dashboard-grid two">
          <div className="panel">
            <h2>Personal Information</h2>
            <div className="detail-grid">
              <Info2liner_Card label="Full Name" entry={student.name} />
              <Info2liner_Card label="Father's Name" entry={student.fatherName} />
              <Info2liner_Card label="Date of Birth" entry={formatDate(student.DOB)} />
              <Info2liner_Card label="Phone Number" entry={String(student.phone)} />
              <Info2liner_Card label="Email Address" entry={student.email} />
              <Info2liner_Card label="Address" entry={student.Address} />
            </div>
          </div>

          <div className="panel">
            <h2>Academic Information</h2>
            <div className="detail-grid">
              <Info2liner_Card label="Course Enrolled" entry={student.course} />
              <Info2liner_Card label="Previous Qualification" entry={student.Qualification} />
              <Info2liner_Card label="Enrollment Date" entry={formatDate(student.Enrollment_Date || "2026-01-15")} />
              <Info2liner_Card label="Academic Year" entry="2026-2028" />
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
