"use client";

import { useState, useEffect } from "react";
import { Navbar } from "../Navbar";
import Footer from "../../../components/Footer";

interface Applicants {
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

export default function Page() {
  const [applicants, setApplicants] = useState<Applicants[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    fatherName: "",
    email: "",
    DOB: "",
    phone: "",
    Address: "",
    course: "",
    Qualification: ""
  });
  const [notification, setNotification] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  // Fetch students on mount
  useEffect(() => {
    fetchApplicants();
  }, []);

  async function fetchApplicants() {
    try {
      setLoading(true);
      const res = await fetch("/api/applicants");
      if (res.ok) {
        const data = await res.json();
        setApplicants(data);
      } else {
        console.error("Failed to fetch students");
      }
    } catch (err) {
      console.error("Error fetching students:", err);
    } finally {
      setLoading(false);
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.name.trim()) {
      showNotification("error", "Student Name is required!");
      return;
    }

    try {
      setSubmitting(true);
      setNotification({ type: null, message: "" });

      const res = await fetch("/api/applicants", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          fatherName: formData.fatherName,
          email: formData.email,
          DOB: formData.DOB,
          phone: formData.phone,
          Address: formData.Address,
          course: formData.course,
          Qualification: formData.Qualification,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        showNotification("success", "Student record saved successfully!");
        setFormData({
          name: "",
          fatherName: "",
          email: "",
          DOB: "",
          phone: "",
          Address: "",
          course: "",
          Qualification: ""
        });

        // Refresh the list
        fetchApplicants();
      } else {
        showNotification("error", data.error || "Failed to save student details.");
      }
    } catch (err) {
      showNotification("error", "An error occurred while saving. Please try again.");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  }

  function showNotification(type: "success" | "error", message: string) {
    setNotification({ type, message });
    // Auto-clear notification after 4 seconds
    setTimeout(() => {
      setNotification((prev) =>
        prev.message === message ? { type: null, message: "" } : prev
      );
    }, 4000);
  }

  return (
    <>
      <Navbar />

      <main className="form-page">
        <div className="section-inner" style={{ padding: "1rem 0" }}>
          {/* Notification Alert */}
          {notification.type && (
            <div
              className="form-error"
              style={{
                marginBottom: "2rem",
                borderColor: notification.type === "success" ? "rgba(47, 125, 105, 0.4)" : "rgba(194, 65, 74, 0.4)",
                background: notification.type === "success" ? "rgba(231, 247, 241, 0.9)" : "rgba(254, 226, 226, 0.9)",
                color: notification.type === "success" ? "var(--success)" : "var(--danger)",
              }}
            >
              <strong>{notification.type === "success" ? "Success! " : "Error: "}</strong>
              {notification.message}
            </div>
          )}

          <div className="dashboard-grid two">
            {/* Form Section */}
            <section className="panel">
              <div className="section-heading compact">
                <p className="eyebrow">Admissions</p>
                <h1>Register Student</h1>
                <p>Enter student details below to save directly to the database.</p>
              </div>

              <form onSubmit={handleSubmit} className="admission-form">
                <div className="form-grid">
                  <div className="field">
                    <label htmlFor="name">Full Name <span className="text-rose-500" style={{ color: "#dc2626" }}>*</span></label>
                    <input
                      type="text"
                      name="name"
                      id="name"
                      required
                      placeholder="Jaya Sharma"
                      value={formData.name}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="field">
                    <label htmlFor="fatherName">Father&apos;s Name <span className="text-rose-500" style={{ color: "#dc2626" }}>*</span></label>
                    <input
                      type="text"
                      name="fatherName"
                      id="fatherName"
                      required
                      placeholder="Suresh Sharma"
                      value={formData.fatherName}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="field">
                    <label htmlFor="email">Email Address <span className="text-rose-500" style={{ color: "#dc2626" }}>*</span></label>
                    <input
                      type="email"
                      name="email"
                      id="email"
                      required
                      placeholder="name@domain.com"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="field">
                    <label htmlFor="DOB">Date of Birth <span className="text-rose-500" style={{ color: "#dc2626" }}>*</span></label>
                    <input
                      type="date"
                      name="DOB"
                      id="DOB"
                      required
                      value={formData.DOB}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="field">
                    <label htmlFor="phone">Phone Number <span className="text-rose-500" style={{ color: "#dc2626" }}>*</span></label>
                    <input
                      type="tel"
                      name="phone"
                      id="phone"
                      required
                      placeholder="9876543210"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="field">
                    <label htmlFor="Address">Address <span className="text-rose-500" style={{ color: "#dc2626" }}>*</span></label>
                    <input
                      type="text"
                      name="Address"
                      id="Address"
                      required
                      placeholder="City, State"
                      value={formData.Address}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="field">
                    <label htmlFor="course">Course <span className="text-rose-500" style={{ color: "#dc2626" }}>*</span></label>
                    <input
                      type="text"
                      name="course"
                      id="course"
                      required
                      placeholder="Electrician"
                      value={formData.course}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="field">
                    <label htmlFor="Qualification">Qualification <span className="text-rose-500" style={{ color: "#dc2626" }}>*</span></label>
                    <input
                      type="text"
                      name="Qualification"
                      id="Qualification"
                      required
                      placeholder="10th Pass"
                      value={formData.Qualification}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="button button-primary"
                  style={{ width: "100%", marginTop: "1rem" }}
                >
                  {submitting ? "Saving..." : "Save Student Details"}
                </button>
              </form>
            </section>

            {/* Directory Section */}
            <section className="panel" style={{ display: "flex", flexDirection: "column" }}>
              <div className="section-title-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                <h2>Registered Students</h2>
                <button
                  onClick={fetchApplicants}
                  className="button button-secondary"
                  style={{ minHeight: "36px", padding: "0.5rem 1rem" }}
                >
                  Refresh
                </button>
              </div>
              <p style={{ color: "var(--muted)", margin: "0 0 1.5rem" }}>
                Real-time database sync directory
              </p>

              {/* List */}
              <div style={{ flex: 1, overflowY: "auto", maxHeight: "480px", display: "grid", gap: "0.75rem" }}>
                {loading ? (
                  <div style={{ textAlign: "center", padding: "2rem" }}>Loading directory...</div>
                ) : applicants.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "3rem 1rem" }}>
                    <h3 style={{ margin: 0 }}>No Student Records Found</h3>
                    <p style={{ color: "var(--muted)", marginTop: "0.5rem" }}>
                      The database table is empty. Add a student using the form.
                    </p>
                  </div>
                ) : (
                  applicants.map((applicant) => (
                    <div
                      key={applicant.id}
                      className="application-row"
                      style={{ padding: "0.95rem 1rem" }}
                    >
                      <div>
                        <p style={{ margin: 0, fontWeight: 800 }}>{applicant.name}</p>
                        <span style={{ color: "var(--muted)", fontSize: "0.82rem" }}>
                          {applicant.course} | {applicant.email}
                        </span>
                      </div>
                      <span className="status-pill paid" style={{ flexShrink: 0 }}>
                        ID: #{applicant.id}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
