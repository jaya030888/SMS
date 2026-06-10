"use client";

import { useState, useEffect } from "react";
import Applications from "./Applications";
import Card from "./Card";
import QuickActions from "./QuickActions";

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
}

const COPA = () => {
  const [students, setStudents] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/applicants")
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error("Failed to fetch");
      })
      .then((data: Applicant[]) => {
        const filtered = data.filter((a) => a.course.toLowerCase().includes("copa") || a.course.toLowerCase().includes("computer"));
        setStudents(filtered);
      })
      .catch((err) => {
        console.error("Error fetching COPA students:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const totalStudents = students.length;
  const feesPaid = students.filter((s) => s.payment_status === "Paid").length;
  const feesPending = students.filter((s) => s.payment_status !== "Paid").length;

  if (loading) {
    return <div style={{ padding: "2rem", textAlign: "center" }}>Loading COPA trade data...</div>;
  }

  return (
    <>
      <Card label="Total Students" entry={String(totalStudents)} image="/file.svg" alter="Total Students" />
      <Card label="Fees Paid" entry={String(feesPaid)} image="/file.svg" alter="Fees Paid" />
      <Card label="Fees Pending" entry={String(feesPending)} image="/file.svg" alter="Fees Pending" />

      <QuickActions />

      <div>
        <h2>COPA Students</h2>
      </div>

      <div className="space-y-5" style={{ display: "grid", gap: "0.75rem" }}>
        {students.length === 0 ? (
          <p style={{ color: "var(--muted)" }}>No COPA students registered yet.</p>
        ) : (
          students.map((student) => (
            <Applications
              key={student.id}
              name={student.name}
              course={student.course}
              feeStatus={student.payment_status || "Pending"}
            />
          ))
        )}
      </div>
    </>
  );
};

export default COPA;
