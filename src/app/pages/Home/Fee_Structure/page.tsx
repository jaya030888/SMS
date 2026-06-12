"use client";

import { useEffect, useState } from "react";
import { Navbar } from "../Navbar";
import Footer from "../../../components/Footer";
import { CheckCircle2, FileText, Landmark } from "lucide-react";

interface CourseFee {
  course: string;
  tuition_fee: number;
  lab_fee: number;
  library_fee: number;
  exam_fee: number;
  development_fee: number;
  total_fee: number;
}

export default function FeeStructurePage() {
  const [fees, setFees] = useState<CourseFee[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/course_fees")
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error("Failed to fetch fee structures");
      })
      .then((data) => {
        setFees(data);
      })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <>
      <Navbar />

      <main className="form-page" style={{ display: "block", minHeight: "calc(100vh - 150px)", padding: "4rem 0" }}>
        <div className="section-inner">
          <div className="section-heading compact" style={{ textAlign: "center", margin: "0 auto 3rem" }}>
            <p className="eyebrow">Finance</p>
            <h1>Fee Structure</h1>
            <p>Transparent fee structures for all our technical ITI programs, fetched in real-time from the database.</p>
          </div>

          <div style={{ display: "grid", gap: "2rem" }}>
            <div className="panel" style={{ overflowX: "auto", border: "1px solid var(--border)", borderRadius: "12px" }}>
              {loading ? (
                <div style={{ padding: "4rem", textAlign: "center" }}>
                  <p>Loading dynamic fee schedules...</p>
                </div>
              ) : (
                <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "700px" }}>
                  <thead>
                    <tr style={{ background: "var(--surface-soft)", borderBottom: "2px solid var(--border)", textAlign: "left" }}>
                      <th style={{ padding: "1.2rem 1rem", fontWeight: 700 }}>Course / Trade</th>
                      <th style={{ padding: "1.2rem 1rem", fontWeight: 700 }}>Tuition Fee (Annual)</th>
                      <th style={{ padding: "1.2rem 1rem", fontWeight: 700 }}>Lab Fee</th>
                      <th style={{ padding: "1.2rem 1rem", fontWeight: 700 }}>Library Fee</th>
                      <th style={{ padding: "1.2rem 1rem", fontWeight: 700 }}>Exam Fee</th>
                      <th style={{ padding: "1.2rem 1rem", fontWeight: 700 }}>Development Fee</th>
                      <th style={{ padding: "1.2rem 1rem", fontWeight: 700, color: "var(--primary)" }}>Total Course Fee</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fees.map((fee) => (
                      <tr key={fee.course} style={{ borderBottom: "1px solid var(--border)" }}>
                        <td style={{ padding: "1.2rem 1rem", fontWeight: 600 }}>{fee.course}</td>
                        <td style={{ padding: "1.2rem 1rem" }}>{formatCurrency(fee.tuition_fee)}</td>
                        <td style={{ padding: "1.2rem 1rem" }}>{formatCurrency(fee.lab_fee)}</td>
                        <td style={{ padding: "1.2rem 1rem" }}>{formatCurrency(fee.library_fee)}</td>
                        <td style={{ padding: "1.2rem 1rem" }}>{formatCurrency(fee.exam_fee)}</td>
                        <td style={{ padding: "1.2rem 1rem" }}>{formatCurrency(fee.development_fee)}</td>
                        <td style={{ padding: "1.2rem 1rem", fontWeight: 700, color: "var(--secondary)" }}>
                          {formatCurrency(fee.total_fee)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.25rem" }}>
              <div className="panel" style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
                <span style={{ background: "var(--accent-soft)", color: "var(--primary)", padding: "0.75rem", borderRadius: "8px" }}>
                  <CheckCircle2 size={24} />
                </span>
                <div>
                  <h3 style={{ margin: "0 0 0.5rem", fontSize: "1.15rem" }}>Registration Payment</h3>
                  <p style={{ margin: 0, color: "var(--muted)", fontSize: "0.95rem" }}>
                    A one-time registration fee of ₹2,000 is required upon submitting the admission application form.
                  </p>
                </div>
              </div>

              <div className="panel" style={{ display: "flex", gap: "1rem", alignItems: "flex-start" }}>
                <span style={{ background: "var(--accent-soft)", color: "var(--primary)", padding: "0.75rem", borderRadius: "8px" }}>
                  <Landmark size={24} />
                </span>
                <div>
                  <h3 style={{ margin: "0 0 0.5rem", fontSize: "1.15rem" }}>Payment Options</h3>
                  <p style={{ margin: 0, color: "var(--muted)", fontSize: "0.95rem" }}>
                    Tuition fees can be paid in installments, online via Credit/Debit card, UPI, Net Banking or in cash at the administration desk.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
