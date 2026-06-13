"use client";

import { useState, useEffect } from "react";
import { Navbar } from "../Navbar";
import Footer from "../../../components/Footer";
import { useLanguage } from "../../../context/LanguageContext";

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
  const { t } = useLanguage();
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

  // Payment states
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [upiId, setUpiId] = useState("");
  const [cardNum, setCardNum] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

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

      const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
      ) => {
        setFormData({
          ...formData,
          [e.target.name]: e.target.value,
        });
      };

  function handleProceedToPayment(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.name.trim()) {
      showNotification("error", "Student Name is required!");
      return;
    }
    if (!formData.course) {
      showNotification("error", "Course selection is required!");
      return;
    }
    // Show payment modal
    setShowPaymentModal(true);
  }

  async function handleConfirmPayment() {
    try {
      setPaymentLoading(true);
      // Simulate payment processing delay
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setPaymentLoading(false);
      setPaymentSuccess(true);
      
      // Keep success state visible for 1 second
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      setShowPaymentModal(false);
      setPaymentSuccess(false);
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
          payment_status: "Pending", // Tuition fees are pending
          amount_paid: 2000, // Registration fee of 2000 is paid
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        showNotification(
          "success",
          "Student registration and ₹2,000 fee payment completed successfully!"
        );
        setFormData({
          name: "",
          fatherName: "",
          email: "",
          DOB: "",
          phone: "",
          Address: "",
          course: "",
          Qualification: "",
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
      setPaymentLoading(false);
      setPaymentSuccess(false);
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
                <p className="eyebrow">{t("nav_admissions")}</p>
                <h1>{t("admissions_form_title")}</h1>
                <p>{t("admissions_form_desc")}</p>
              </div>

              <form onSubmit={handleProceedToPayment} className="admission-form">
                <div className="form-grid">
                  <div className="field">
                    <label htmlFor="name">{t("lbl_fullname")} <span className="text-rose-500" style={{ color: "#dc2626" }}>*</span></label>
                    <input
                      type="text"
                      name="name"
                      id="name"
                      required
                      placeholder="e.g. Jaya Sharma"
                      value={formData.name}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="field">
                    <label htmlFor="fatherName">{t("lbl_fathername")} <span className="text-rose-500" style={{ color: "#dc2626" }}>*</span></label>
                    <input
                      type="text"
                      name="fatherName"
                      id="fatherName"
                      required
                      placeholder="e.g. Suresh Sharma"
                      value={formData.fatherName}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="field">
                    <label htmlFor="email">{t("lbl_email")} <span className="text-rose-500" style={{ color: "#dc2626" }}>*</span></label>
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
                    <label htmlFor="DOB">{t("lbl_dob")} <span className="text-rose-500" style={{ color: "#dc2626" }}>*</span></label>
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
                    <label htmlFor="phone">{t("lbl_phone")} <span className="text-rose-500" style={{ color: "#dc2626" }}>*</span></label>
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
                    <label htmlFor="Address">{t("lbl_address")} <span className="text-rose-500" style={{ color: "#dc2626" }}>*</span></label>
                    <input
                      type="text"
                      name="Address"
                      id="Address"
                      required
                      placeholder="e.g. Bhopal, MP"
                      value={formData.Address}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="course">
                      {t("lbl_course")}
                      <span
                        className="text-rose-500"
                        style={{ color: "#dc2626" }}
                      >
                        *
                      </span>
                    </label>
                  
                    <select
                      name="course"
                      id="course"
                      required
                      value={formData.course}
                      onChange={handleChange}
                    >
                      <option value="">{t("opt_select_course")}</option>
                      <option value="COPA">COPA</option>
                      <option value="Electrician">Electrician</option>
                      <option value="Fitter">Fitter</option>
                    </select>
                  </div>
                  
                  <div className="field">
                    <label htmlFor="Qualification">
                      {t("lbl_qualification")}
                      <span
                        className="text-rose-500"
                        style={{ color: "#dc2626" }}
                      >
                        *
                      </span>
                    </label>
                  
                    <select
                      name="Qualification"
                      id="Qualification"
                      required
                      value={formData.Qualification}
                      onChange={handleChange}
                    >
                      <option value="">{t("opt_select_qual")}</option>
                      <option value="10th Pass">10th Pass</option>
                      <option value="12th Pass">12th Pass</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="button button-primary"
                  style={{ width: "100%", marginTop: "1rem" }}
                >
                  {submitting ? t("btn_registering") : t("btn_pay_register")}
                </button>
              </form>
            </section>

            {/* Directory Section */}
            <section className="panel" style={{ display: "flex", flexDirection: "column" }}>
              <div className="section-title-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                <h2>{t("admissions_list_title")}</h2>
                <button
                  onClick={fetchApplicants}
                  className="button button-secondary"
                  style={{ minHeight: "36px", padding: "0.5rem 1rem" }}
                >
                  {t("lbl_refresh")}
                </button>
              </div>
              <p style={{ color: "var(--muted)", margin: "0 0 1.5rem" }}>
                {t("admissions_list_subtitle")}
              </p>

              {/* List */}
              <div style={{ flex: 1, overflowY: "auto", maxHeight: "480px", display: "grid", gap: "0.75rem" }}>
                {loading ? (
                  <div style={{ textAlign: "center", padding: "2rem" }}>{t("lbl_loading_dir")}</div>
                ) : applicants.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "3rem 1rem" }}>
                    <h3 style={{ margin: 0 }}>{t("lbl_no_records")}</h3>
                    <p style={{ color: "var(--muted)", marginTop: "0.5rem" }}>
                      {t("lbl_table_empty")}
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

      {/* Mock Payment Gateway Modal */}
      {showPaymentModal && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(17, 17, 79, 0.6)",
          backdropFilter: "blur(8px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9999,
          padding: "1rem"
        }}>
          <div className="panel" style={{
            width: "100%",
            maxWidth: "460px",
            background: "var(--surface)",
            borderRadius: "16px",
            boxShadow: "var(--shadow-hard)",
            padding: "2rem",
            position: "relative",
            border: "1px solid var(--border)",
            textAlign: "center"
          }}>
            {paymentLoading ? (
              <div style={{ padding: "2rem 0" }}>
                <div style={{
                  border: "4px solid rgba(25, 25, 112, 0.1)",
                  borderTop: "4px solid var(--primary)",
                  borderRadius: "50%",
                  width: "50px",
                  height: "50px",
                  animation: "spin 1s linear infinite",
                  margin: "0 auto 1.5rem"
                }}></div>
                <h3>Processing Payment...</h3>
                <p style={{ color: "var(--muted)" }}>Verifying transaction with your bank.</p>
                <style>{`
                  @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                  }
                `}</style>
              </div>
            ) : paymentSuccess ? (
              <div style={{ padding: "2rem 0" }}>
                <div style={{
                  background: "var(--accent-soft)",
                  color: "var(--success)",
                  borderRadius: "50%",
                  width: "60px",
                  height: "60px",
                  display: "grid",
                  placeItems: "center",
                  fontSize: "2rem",
                  margin: "0 auto 1.5rem"
                }}>
                  ✓
                </div>
                <h3>Payment Successful!</h3>
                <p style={{ color: "var(--muted)" }}>Transaction ID: TXN-{Math.floor(10000000 + Math.random() * 90000000)}</p>
              </div>
            ) : (
              <div>
                <h2 style={{ fontSize: "1.45rem", marginBottom: "0.25rem", marginTop: 0 }}>Registration Payment</h2>
                <p style={{ color: "var(--muted)", fontSize: "0.95rem" }}>Maa Gauri Private ITI Admission</p>
                
                <div style={{
                  background: "var(--surface-soft)",
                  borderRadius: "8px",
                  padding: "1rem",
                  margin: "1.25rem 0",
                  border: "1px solid var(--border)"
                }}>
                  <span style={{ fontSize: "0.85rem", color: "var(--muted)" }}>Registration Fee Amount</span>
                  <div style={{ fontSize: "1.8rem", fontWeight: 700, color: "var(--primary)", marginTop: "0.25rem" }}>₹2,000.00</div>
                </div>

                <div className="segment-control" style={{ width: "100%", display: "grid", gridTemplateColumns: "1fr 1fr", marginBottom: "1.25rem" }}>
                  <button
                    type="button"
                    className={paymentMethod === "upi" ? "active" : ""}
                    onClick={() => setPaymentMethod("upi")}
                    style={{ minHeight: "36px", padding: "0.4rem" }}
                  >
                    UPI / QR
                  </button>
                  <button
                    type="button"
                    className={paymentMethod === "card" ? "active" : ""}
                    onClick={() => setPaymentMethod("card")}
                    style={{ minHeight: "36px", padding: "0.4rem" }}
                  >
                    Card
                  </button>
                </div>

                {paymentMethod === "upi" ? (
                  <div style={{ textAlign: "left", marginBottom: "1.5rem" }}>
                    <label style={{ display: "block", marginBottom: "0.4rem", fontSize: "0.88rem" }}>Enter UPI ID</label>
                    <input
                      type="text"
                      placeholder="e.g. name@okhdfcbank"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      style={{ padding: "0.6rem" }}
                    />
                    <div style={{ fontSize: "0.75rem", color: "var(--muted)", marginTop: "0.5rem", textAlign: "center" }}>
                      Or scan any UPI QR code at the desk
                    </div>
                  </div>
                ) : (
                  <div style={{ textAlign: "left", display: "grid", gap: "0.75rem", marginBottom: "1.5rem" }}>
                    <div>
                      <label style={{ display: "block", marginBottom: "0.3rem", fontSize: "0.88rem" }}>Card Number</label>
                      <input
                        type="text"
                        placeholder="1234 5678 9101 1121"
                        maxLength={19}
                        value={cardNum}
                        onChange={(e) => setCardNum(e.target.value)}
                        style={{ padding: "0.6rem" }}
                      />
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                      <div>
                        <label style={{ display: "block", marginBottom: "0.3rem", fontSize: "0.88rem" }}>Expiry Date</label>
                        <input
                          type="text"
                          placeholder="MM/YY"
                          maxLength={5}
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          style={{ padding: "0.6rem" }}
                        />
                      </div>
                      <div>
                        <label style={{ display: "block", marginBottom: "0.3rem", fontSize: "0.88rem" }}>CVV</label>
                        <input
                          type="password"
                          placeholder="***"
                          maxLength={3}
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value)}
                          style={{ padding: "0.6rem" }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div style={{ display: "flex", gap: "0.75rem", marginTop: "1rem" }}>
                  <button
                    type="button"
                    className="button button-secondary"
                    onClick={() => setShowPaymentModal(false)}
                    style={{ flex: 1, minHeight: "44px" }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="button button-primary"
                    onClick={handleConfirmPayment}
                    style={{ flex: 1, minHeight: "44px" }}
                    disabled={paymentMethod === "upi" ? !upiId : !cardNum}
                  >
                    Pay ₹2,000
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}
