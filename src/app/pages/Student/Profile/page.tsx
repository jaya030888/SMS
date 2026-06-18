"use client";

import { useState, useEffect } from "react";
import Info2liner_Card from "@/src/app/components/Info2liner_Card";
import StuNav from "@/src/app/components/StuNav";
import Link from "next/link";
import { User } from "lucide-react";

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
  profile_photo?: string;
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
    fetch("/api/auth/session")
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error("No session");
      })
      .then((session) => {
        const studentId = session.studentId;
        return fetch(`/api/applicants?id=${studentId}`);
      })
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error("Failed to fetch student profile");
      })
      .then((data: StudentData) => {
        setStudent(data);
      })
      .catch((err) => {
        console.error("Error fetching student profile:", err);
      })
      .finally(() => {
        setLoading(false);
      });
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
        <section className="profile-hero panel" style={{ display: "flex", alignItems: "center", gap: "1.5rem", flexWrap: "wrap" }}>
          {student.profile_photo ? (
            <img
              src={student.profile_photo}
              alt={student.name}
              style={{ width: "90px", height: "90px", borderRadius: "50%", objectFit: "cover", border: "3px solid var(--border)" }}
            />
          ) : (
            <div className="avatar" style={{ width: "90px", height: "90px", borderRadius: "50%", background: "var(--surface-soft)", display: "grid", placeItems: "center", padding: 0 }}>
              <User size={42} className="text-primary" />
            </div>
          )}

          <div style={{ flex: 1, minWidth: "200px" }}>
            <h2 style={{ fontSize: "1.75rem", margin: 0, fontWeight: 800 }}>{student.name}</h2>
            <p style={{ color: "var(--muted)", margin: "0.25rem 0", fontWeight: 600 }}>Student ID: #{student.id}</p>
            <span style={{ color: "var(--primary)", fontWeight: 800, fontSize: "0.95rem" }}>{student.course}</span>
          </div>

          <div>
            <label className="button button-primary flex items-center gap-1.5 cursor-pointer text-xs" style={{ margin: 0, padding: "0.5rem 1rem", minHeight: "38px" }}>
              Upload New Photo
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    if (file.size > 1.5 * 1024 * 1024) {
                      alert("Image size must be less than 1.5MB.");
                      return;
                    }
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      const base64 = reader.result as string;
                      fetch("/api/applicants", {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          id: student.id,
                          profile_photo: base64
                        })
                      })
                      .then((res) => {
                        if (res.ok) {
                          alert("Profile photo updated successfully!");
                          setStudent({ ...student, profile_photo: base64 });
                        } else {
                          alert("Failed to update profile photo.");
                        }
                      })
                      .catch(() => alert("Failed to update profile photo."));
                    };
                    reader.readAsDataURL(file);
                  }
                }}
                style={{ display: "none" }}
              />
            </label>
          </div>
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
