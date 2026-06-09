"use client";

import { useState, useEffect } from "react";
import Applications from "./Applications";
import Card from "./Card";
import Course_wise_Card from "./Course_wise_Card";
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
}

const All = () => {
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/applicants")
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error("Failed to fetch");
      })
      .then((data: Applicant[]) => {
        setApplicants(data);
      })
      .catch((err) => {
        console.error("Error fetching applicants:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const getFeeStatus = (id: number, courseName: string) => {
    const name = courseName.toLowerCase();
    if (name.includes("electrician") || name.includes("fitter")) {
      return "Paid";
    } else if (name.includes("copa") || name.includes("computer")) {
      return "Pending";
    } else {
      return id % 2 === 0 ? "Paid" : "Pending";
    }
  };

  // Compute stats
  const totalStudents = applicants.length;
  const feesPaid = applicants.filter((a) => getFeeStatus(a.id, a.course) === "Paid").length;
  const feesPending = applicants.filter((a) => getFeeStatus(a.id, a.course) === "Pending").length;

  // Course-specific calculations
  const getCourseStats = (courseFilter: string) => {
    const list = applicants.filter((a) => a.course.toLowerCase().includes(courseFilter));
    const total = list.length;
    const paid = list.filter((a) => getFeeStatus(a.id, a.course) === "Paid").length;
    const pending = list.filter((a) => getFeeStatus(a.id, a.course) === "Pending").length;
    return { total, paid, pending };
  };

  const elecStats = getCourseStats("electrician");
  const copaStats = getCourseStats("copa");
  const fitterStats = getCourseStats("fitter");

  if (loading) {
    return <div style={{ padding: "2rem", textAlign: "center" }}>Loading dashboard overview...</div>;
  }

  return (
    <>
      <Card label="Total Students" entry={String(totalStudents)} image="/file.svg" alter="Total Students" />
      <Card label="Fees Paid" entry={String(feesPaid)} image="/file.svg" alter="Fees Paid" />
      <Card label="Fees Pending" entry={String(feesPending)} image="/file.svg" alter="Fees Pending" />

      <Course_wise_Card
        image="/file.svg"
        alter="Electrician"
        course="Electrician"
        totalStudents={String(elecStats.total)}
        feesPaid={String(elecStats.paid)}
        feesPending={String(elecStats.pending)}
      />

      <Course_wise_Card
        image="/file.svg"
        alter="COPA"
        course="COPA"
        totalStudents={String(copaStats.total)}
        feesPaid={String(copaStats.paid)}
        feesPending={String(copaStats.pending)}
      />

      <Course_wise_Card
        image="/file.svg"
        alter="Fitter"
        course="Fitter"
        totalStudents={String(fitterStats.total)}
        feesPaid={String(fitterStats.paid)}
        feesPending={String(fitterStats.pending)}
      />

      <QuickActions />

      <div>
        <h2>Recent Applications</h2>
      </div>

      <div className="space-y-5" style={{ display: "grid", gap: "0.75rem" }}>
        {applicants.length === 0 ? (
          <p style={{ color: "var(--muted)" }}>No recent applications found.</p>
        ) : (
          applicants.slice(0, 5).map((app) => (
            <Applications
              key={app.id}
              name={app.name}
              course={app.course}
              feeStatus={getFeeStatus(app.id, app.course)}
            />
          ))
        )}
      </div>
    </>
  );
};

export default All;