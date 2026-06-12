"use client";

import { useState, useEffect } from "react";
import StuNav from "@/src/app/components/StuNav";
import { CheckCircle, Eye, Search } from "lucide-react";

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
  payment_status?: string;
  amount_paid?: number;
}

export default function Page() {
  const [students, setStudents] = useState<StudentData[]>([]);
  const [courseFees, setCourseFees] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudents();
    fetchCourseFees();
  }, []);

  const fetchStudents = () => {
    setLoading(true);
    fetch("/api/applicants")
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error("Failed to fetch");
      })
      .then((data: StudentData[]) => {
        setStudents(data);
      })
      .catch((err) => {
        console.error("Error fetching students:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const fetchCourseFees = () => {
    fetch("/api/course_fees")
      .then((res) => res.json())
      .then((data) => setCourseFees(data))
      .catch((err) => console.error("Error fetching course fees:", err));
  };

  const handleMarkPaid = (student: StudentData) => {
    const courseName = student.course || "";
    const matchedFee = courseFees.find(
      (cf) => cf.course.toLowerCase() === courseName.toLowerCase() ||
              courseName.toLowerCase().includes(cf.course.toLowerCase())
    );
    const totalFee = matchedFee ? matchedFee.total_fee : 15000;

    fetch("/api/applicants", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: student.id,
        payment_status: "Paid",
        amount_paid: totalFee,
      }),
    })
      .then((res) => {
        if (res.ok) {
          // Update local state
          setStudents((prev) =>
            prev.map((s) =>
              s.id === student.id
                ? { ...s, payment_status: "Paid", amount_paid: totalFee }
                : s
            )
          );
        } else {
          alert("Failed to update payment status.");
        }
      })
      .catch((err) => {
        console.error("Error marking paid:", err);
      });
  };

  const filteredStudents = students.filter((student) => {
    const query = searchQuery.toLowerCase();
    return (
      student.name.toLowerCase().includes(query) ||
      student.course.toLowerCase().includes(query) ||
      String(student.phone).includes(query) ||
      String(student.id).includes(query)
    );
  });

  return (
    <>
      <StuNav name="Student Management" role="admin" />

      <main className="dashboard-page">
        <section className="panel">
          <div className="section-heading compact">
            <p className="eyebrow">Admin</p>
            <h1>Student Management</h1>
          </div>

          <div className="search-box">
            <Search size={20} />
            <input
              type="text"
              placeholder="Search by name, course, phone, or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ border: 0, outline: "none", width: "100%", background: "transparent" }}
            />
          </div>

          <div className="student-table" style={{ marginTop: "1.5rem" }}>
            <div className="student-row table-head">
              <p>Name</p>
              <p>Course</p>
              <p>Phone</p>
              <p>Fees Status</p>
              <p>Actions</p>
            </div>

            {loading ? (
              <div style={{ padding: "2rem", textAlign: "center" }}>Loading students list...</div>
            ) : filteredStudents.length === 0 ? (
              <div style={{ padding: "3rem 1rem", textAlign: "center" }}>
                <h3>No Students Found</h3>
                <p style={{ color: "var(--muted)" }}>
                  {searchQuery ? "No results match your search." : "No records in database."}
                </p>
              </div>
            ) : (
              filteredStudents.map((student) => {
                const status = student.payment_status || "Pending";
                return (
                  <div key={student.id} className="student-row">
                    <h2>{student.name}</h2>
                    <p>{student.course}</p>
                    <p>{student.phone}</p>
                    <div>
                      <span className={`status-pill ${status === "Paid" ? "paid" : "pending"}`}>
                        {status}
                      </span>
                    </div>
                    <div className="row-actions">
                      <button className="button button-secondary" style={{ display: "flex", gap: "0.4rem", alignItems: "center" }}>
                        <Eye size={16} />
                        View
                      </button>
                      {status === "Pending" && (
                        <button
                          onClick={() => handleMarkPaid(student)}
                          className="button button-secondary"
                          style={{ display: "flex", gap: "0.4rem", alignItems: "center" }}
                        >
                          <CheckCircle size={16} />
                          Mark Paid
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>
      </main>
    </>
  );
}
