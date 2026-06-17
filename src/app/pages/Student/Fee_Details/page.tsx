"use client";

import { useEffect, useState } from "react";
import Info_Card from "@/src/app/components/Info_Card";
import Info_sameliner from "@/src/app/components/Info_sameliner";
import StuNav from "@/src/app/components/StuNav";
import { Download, CreditCard, CheckCircle, Clock, Printer, X, ShieldCheck, Wallet, ArrowRight, Receipt } from "lucide-react";

interface StudentData {
  id: number;
  name: string;
  course: string;
  amount_paid: number;
  payment_status: string;
  remaining_balance: number;
}

interface CourseFee {
  course: string;
  tuition_fee: number;
  lab_fee: number;
  library_fee: number;
  exam_fee: number;
  development_fee: number;
  total_fee: number;
}

interface PaymentRecord {
  id: number;
  student_id: number;
  amount: number;
  payment_method: string;
  transaction_id: string;
  payment_mode: string;
  payment_status: string;
  payment_date: string;
  remarks: string;
}

const Page = () => {
  const [student, setStudent] = useState<StudentData | null>(null);
  const [feeStructure, setFeeStructure] = useState<CourseFee | null>(null);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Payment portal modal states
  const [showPayModal, setShowPayModal] = useState(false);
  const [payAmount, setPayAmount] = useState("");
  const [payMethod, setPayMethod] = useState("UPI"); // UPI, Card, NetBanking
  const [payRemarks, setPayRemarks] = useState("");
  const [paymentStep, setPaymentStep] = useState(1); // 1: Setup, 2: Gateway Details, 3: Processing, 4: Success

  // Gateway Simulation Fields
  const [upiId, setUpiId] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [selectedBank, setSelectedBank] = useState("SBI");
  const [simulatedTxnId, setSimulatedTxnId] = useState("");

  const loadFeeDetails = (storedId: string) => {
    Promise.all([
      fetch(`/api/applicants?id=${storedId}`).then(res => {
        if (res.ok) return res.json();
        return fetch("/api/applicants").then(r => r.json()).then(data => {
          return data.find((a: any) => String(a.id) === String(storedId)) || data[0];
        });
      }),
      fetch("/api/course_fees").then(res => res.json()),
      fetch(`/api/payments?student_id=${storedId}`).then(res => res.json())
    ])
    .then(([matchedStudent, feesData, paymentsData]) => {
      if (matchedStudent) {
        setStudent(matchedStudent);
        setPayments(paymentsData || []);
        
        const matchedFee = feesData.find(
          (cf: any) => cf.course.toLowerCase() === matchedStudent.course.toLowerCase() || 
                       matchedStudent.course.toLowerCase().includes(cf.course.toLowerCase())
        );
        if (matchedFee) {
          setFeeStructure(matchedFee);
        }
      }
    })
    .catch((err) => {
      console.error("Error loading fee details:", err);
    })
    .finally(() => {
      setLoading(false);
    });
  };

  useEffect(() => {
    fetch("/api/auth/session")
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error("No session");
      })
      .then((session) => {
        const studentId = session.studentId;
        loadFeeDetails(String(studentId));
      })
      .catch((err) => {
        console.error("Session fetch failed on fee portal page:", err);
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

  // Launch Invoice Printable Window
  const handlePrintReceipt = (payment: PaymentRecord) => {
    if (!student) return;
    
    const printWindow = window.open("", "_blank", "width=850,height=750");
    if (!printWindow) return;

    const formattedDate = new Date(payment.payment_date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });

    printWindow.document.write(`
      <html>
        <head>
          <title>Maa Gauri ITI - Receipt #${payment.id}</title>
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #1e293b; padding: 2.5rem; margin: 0; background-color: #f8fafc; }
            .receipt-card { max-width: 760px; margin: auto; border: 1px solid #e2e8f0; padding: 3rem; border-radius: 16px; background-color: #ffffff; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05); }
            .header-row { display: flex; justify-content: space-between; align-items: start; border-bottom: 2.5px solid #191970; padding-bottom: 1.5rem; margin-bottom: 2rem; }
            .header-left h1 { color: #191970; margin: 0; font-size: 2.1rem; font-weight: 800; letter-spacing: -0.025em; }
            .header-left p { margin: 0.35rem 0 0; color: #64748b; font-size: 0.95rem; }
            .badge-success { display: inline-block; padding: 0.5rem 1.15rem; background: #dcfce7; color: #166534; font-weight: 700; border-radius: 9999px; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.05em; }
            .info-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.75rem; margin-bottom: 2.5rem; }
            .info-item h4 { margin: 0 0 0.35rem 0; color: #94a3b8; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.05em; }
            .info-item p { margin: 0; font-size: 1.1rem; font-weight: 600; color: #0f172a; }
            .receipt-table { width: 100%; border-collapse: collapse; margin-bottom: 2.5rem; }
            .receipt-table th { padding: 1rem 1.25rem; text-align: left; border-bottom: 2px solid #e2e8f0; background-color: #f8fafc; font-weight: 700; color: #475569; text-transform: uppercase; font-size: 0.8rem; }
            .receipt-table td { padding: 1.25rem; text-align: left; border-bottom: 1px solid #e2e8f0; font-size: 1.05rem; line-height: 1.5; }
            .total-section { display: flex; justify-content: flex-end; align-items: center; gap: 2rem; padding-top: 1.5rem; border-top: 2px solid #e2e8f0; }
            .total-label { font-size: 1.15rem; color: #64748b; font-weight: 600; }
            .total-val { margin: 0; color: #191970; font-size: 1.85rem; font-weight: 800; }
            .receipt-footer { text-align: center; margin-top: 3.5rem; font-size: 0.88rem; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 1.5rem; }
            .print-action { background: #191970; color: #ffffff; padding: 0.65rem 1.25rem; border: none; border-radius: 8px; font-weight: 700; cursor: pointer; display: inline-flex; align-items: center; gap: 0.5rem; margin-bottom: 2rem; transition: background 0.2s; }
            .print-action:hover { background: #11114f; }
            @media print {
              .print-action { display: none; }
              body { padding: 0; background-color: #ffffff; }
              .receipt-card { border: none; box-shadow: none; padding: 0; max-width: 100%; }
            }
          </style>
        </head>
        <body>
          <div class="receipt-card">
            <button class="print-action" onclick="window.print()">Print / Export PDF</button>
            
            <div class="header-row">
              <div class="header-left">
                <h1>MAA GAURI PRIVATE ITI</h1>
                <p>Affiliated to NCVT (Govt. of India) • Code: GR090011</p>
                <p>Campus: City Center Main Road, District Office, State</p>
              </div>
              <div>
                <span class="badge-success">Success</span>
              </div>
            </div>

            <div class="info-grid">
              <div class="info-item">
                <h4>Student Name</h4>
                <p>${student.name}</p>
              </div>
              <div class="info-item">
                <h4>Receipt ID</h4>
                <p>RCP-FEE-${payment.id}-${payment.student_id}</p>
              </div>
              <div class="info-item">
                <h4>Course / Trade</h4>
                <p>${student.course}</p>
              </div>
              <div class="info-item">
                <h4>Transaction Date</h4>
                <p>${formattedDate}</p>
              </div>
              <div class="info-item">
                <h4>Transaction ID</h4>
                <p>${payment.transaction_id}</p>
              </div>
              <div class="info-item">
                <h4>Payment Method</h4>
                <p>${payment.payment_mode} (${payment.payment_method})</p>
              </div>
            </div>

            <table class="receipt-table">
              <thead>
                <tr>
                  <th>Description</th>
                  <th style="text-align: right;">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    Academic Tuition & Fee installment payment
                    <div style="font-size: 0.88rem; color: #64748b; margin-top: 0.25rem;">
                      Remarks: ${payment.remarks || 'Standard Semester Installment'}
                    </div>
                  </td>
                  <td style="text-align: right; font-weight: 700; color: #0f172a;">₹${payment.amount.toLocaleString("en-IN")}</td>
                </tr>
              </tbody>
            </table>

            <div class="total-section">
              <span class="total-label">Total Amount Paid:</span>
              <h3 class="total-val">₹${payment.amount.toLocaleString("en-IN")}</h3>
            </div>

            <div class="receipt-footer">
              <p>This is an officially verified computer-generated record of payment. No physical signature is required.</p>
              <p>For any queries, contact accounts@maagauriiti.edu.in</p>
              <p style="margin-top: 0.5rem; font-weight: 600;">&copy; ${new Date().getFullYear()} Maa Gauri Private ITI. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Start payment flow
  const handleOpenPayment = () => {
    if (!student) return;
    setPayAmount(String(student.remaining_balance));
    setPayRemarks("Installment payment");
    setPaymentStep(1);
    setShowPayModal(true);
  };

  // Move from Setup (Step 1) to Gateway Input (Step 2)
  const handleProceedToGateway = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = Number(payAmount);
    if (!payAmount || isNaN(parsedAmount) || parsedAmount <= 0) {
      alert("Please enter a valid payment amount.");
      return;
    }
    if (student && parsedAmount > student.remaining_balance) {
      alert(`Entered amount exceeds remaining balance of ${formatCurrency(student.remaining_balance)}.`);
      return;
    }
    
    // Prefill fields
    setUpiId(`${student?.name.toLowerCase().replace(/\s+/g, "")}@okaxis`);
    setCardNumber("4321 9876 5432 1098");
    setCardExpiry("12/29");
    setCardCvv("999");
    setPaymentStep(2);
  };

  // Submit payment record
  const handleSimulatePayment = async () => {
    if (!student) return;
    
    // Move to step 3 (loader animation)
    setPaymentStep(3);
    
    const generatedTxn = `TXN-ON-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    setSimulatedTxnId(generatedTxn);

    try {
      // Delay to simulate validation & bank processing (1.8s)
      await new Promise(resolve => setTimeout(resolve, 1800));

      const payload = {
        student_id: student.id,
        amount: Number(payAmount),
        payment_method: payMethod,
        transaction_id: generatedTxn,
        payment_mode: "Online",
        payment_status: "Success",
        remarks: payRemarks || "Online fee portal payment"
      };

      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        // Success step
        setPaymentStep(4);
        // Re-load data dynamically to update summary cards instantly
        loadFeeDetails(String(student.id));
      } else {
        const errData = await res.json();
        alert(`Payment recording failed: ${errData.error || 'Server error'}`);
        setPaymentStep(1);
      }
    } catch (err) {
      console.error(err);
      alert("An unexpected error occurred during simulated transaction.");
      setPaymentStep(1);
    }
  };

  if (loading) {
    return (
      <>
        <StuNav name="Fee Portal" />
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
          <h2>Loading College ERP Fee Breakdown...</h2>
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        </main>
      </>
    );
  }

  if (!student || !feeStructure) {
    return (
      <>
        <StuNav name="Fee Portal" />
        <main className="dashboard-page" style={{ textAlign: "center", padding: "6rem 2rem" }}>
          <h2>No Academic Fee Records Found</h2>
          <p style={{ color: "var(--muted)", marginTop: "1rem" }}>Please contact the institute administrator to seed your fee profile.</p>
        </main>
      </>
    );
  }

  const totalFee = feeStructure.total_fee;
  const paidAmount = student.amount_paid;
  const balanceAmount = student.remaining_balance;
  const isPaid = balanceAmount <= 0;

  return (
    <>
      <StuNav name="Fee Details" />

      <main className="dashboard-page">
        {/* Top ERP Summary Panel */}
        <section className="dashboard-hero" style={{ background: "linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)", borderRadius: "16px" }}>
          <div className="course-badge" style={{ padding: "0.8rem", borderRadius: "12px", background: "rgba(255, 255, 255, 0.12)", color: "#fff" }}>
            <Wallet size={36} />
          </div>
          <div>
            <p className="eyebrow" style={{ color: "rgba(255, 255, 255, 0.8)", fontSize: "0.8rem", letterSpacing: "0.15em" }}>COLLEGE ERP FINANCIAL PORTAL</p>
            <h2 style={{ fontSize: "2.1rem", fontWeight: 800, color: "white" }}>Fee Payment Portal</h2>
            <p style={{ color: "rgba(255, 255, 255, 0.9)", margin: "0.25rem 0 0", fontSize: "0.95rem" }}>
              Enrolled Course: <strong>{student.course}</strong> • Welcome, <strong>{student.name}</strong>
            </p>
          </div>
        </section>

        {/* Dynamic Financial KPI Cards */}
        <section className="stats-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.25rem" }}>
          <div className="stat-card panel" style={{ borderLeft: "5px solid var(--primary)", background: "var(--surface)", borderRadius: "12px" }}>
            <span style={{ fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--muted)" }}>Billed Course Fee</span>
            <strong>{formatCurrency(totalFee)}</strong>
            <p style={{ fontSize: "0.88rem", color: "var(--muted)" }}>Total annual academic cost structure</p>
          </div>
          <div className="stat-card panel" style={{ borderLeft: "5px solid var(--success)", background: "var(--surface)", borderRadius: "12px" }}>
            <span style={{ fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--muted)" }}>Total Fee Cleared</span>
            <strong style={{ color: "var(--success)" }}>{formatCurrency(paidAmount)}</strong>
            <p style={{ fontSize: "0.88rem", color: "var(--muted)" }}>Installments successfully recorded in database</p>
          </div>
          <div className="stat-card panel" style={{ borderLeft: `5px solid ${isPaid ? "var(--muted)" : "var(--warning)"}`, background: "var(--surface)", borderRadius: "12px" }}>
            <span style={{ fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--muted)" }}>Remaining Balance Due</span>
            <strong style={{ color: isPaid ? "var(--muted)" : "var(--warning)" }}>{formatCurrency(balanceAmount)}</strong>
            <p style={{ fontSize: "0.88rem", color: "var(--muted)" }}>Pending clearance before examinations</p>
          </div>
        </section>

        {/* Detailed Breakdown and Payment Action Portal */}
        <section className="dashboard-grid two" style={{ gap: "1.5rem" }}>
          {/* Fee Itemization Table */}
          <div className="panel" style={{ borderRadius: "12px" }}>
            <h3 style={{ borderBottom: "1.5px solid var(--border)", paddingBottom: "0.75rem", marginBottom: "1.25rem", color: "var(--primary)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <ShieldCheck size={20} /> Academic Fee Breakdown
            </h3>
            <div style={{ display: "grid", gap: "0.25rem" }}>
              <Info_sameliner label="Tuition Fee (Annual)" entry={formatCurrency(feeStructure.tuition_fee)} />
              <Info_sameliner label="Workshop / Lab Fee" entry={formatCurrency(feeStructure.lab_fee)} />
              <Info_sameliner label="Library Resource Access" entry={formatCurrency(feeStructure.library_fee)} />
              <Info_sameliner label="Internal Examination Fee" entry={formatCurrency(feeStructure.exam_fee)} />
              <Info_sameliner label="Development & Infrastructure" entry={formatCurrency(feeStructure.development_fee)} />
              <div className="total-row" style={{ marginTop: "1rem", paddingTop: "1rem", borderTop: "2.5px solid var(--border)" }}>
                <h3 style={{ fontSize: "1.2rem", fontWeight: 700 }}>Total Billed</h3>
                <h3 style={{ fontSize: "1.2rem", fontWeight: 800, color: "var(--primary)" }}>{formatCurrency(totalFee)}</h3>
              </div>
            </div>
          </div>

          {/* Pay Installment Card */}
          <div className="panel" style={{ borderRadius: "12px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <h3 style={{ borderBottom: "1.5px solid var(--border)", paddingBottom: "0.75rem", marginBottom: "1.25rem", color: "var(--primary)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <CreditCard size={20} /> Self-Service Payment Portal
              </h3>
              <p style={{ color: "var(--muted)", margin: "0 0 1.5rem", fontSize: "0.95rem" }}>
                Our institute allows flexible installment options. You can pay the remaining balance in full, or pay in custom chunks to clear your pending dues.
              </p>
              
              {isPaid ? (
                <div style={{
                  background: "#EAF7F3",
                  border: "1px solid rgba(22, 115, 91, 0.24)",
                  borderRadius: "8px",
                  padding: "1rem",
                  color: "var(--success)",
                  fontWeight: 600,
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem"
                }}>
                  <CheckCircle size={20} />
                  Your academic fees are fully cleared. No balance due.
                </div>
              ) : (
                <div style={{
                  background: "#FFF7E8",
                  border: "1px solid rgba(161, 98, 7, 0.2)",
                  borderRadius: "8px",
                  padding: "1rem",
                  color: "var(--warning)",
                  fontSize: "0.95rem",
                  fontWeight: 500,
                  marginBottom: "1rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem"
                }}>
                  <Clock size={20} />
                  Pending balance: {formatCurrency(balanceAmount)}. Please pay now.
                </div>
              )}
            </div>

            {!isPaid && (
              <button 
                onClick={handleOpenPayment}
                className="button button-primary" 
                style={{ width: "100%", height: "52px", borderRadius: "8px", fontSize: "1.05rem", fontWeight: 700, gap: "0.5rem", marginTop: "1rem" }}
              >
                Pay Outstanding Fees <ArrowRight size={18} />
              </button>
            )}
          </div>
        </section>

        {/* Dynamic Payment Transaction Logs */}
        <section className="panel" style={{ borderRadius: "12px" }}>
          <h3 style={{ borderBottom: "1.5px solid var(--border)", paddingBottom: "0.75rem", marginBottom: "1.25rem", color: "var(--primary)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Receipt size={20} /> Complete Payment History Log
          </h3>

          {payments.length === 0 ? (
            <div style={{ textAlign: "center", padding: "3rem 1rem", color: "var(--muted)" }}>
              <Clock size={40} style={{ margin: "0 auto 1rem", opacity: 0.5 }} />
              <p>No fee transactions registered for your student ID yet.</p>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "800px" }}>
                <thead>
                  <tr style={{ background: "var(--surface-soft)", borderBottom: "1.5px solid var(--border)", color: "var(--ink)", textAlign: "left" }}>
                    <th style={{ padding: "1rem", fontSize: "0.85rem", fontWeight: 700 }}>Payment Date</th>
                    <th style={{ padding: "1rem", fontSize: "0.85rem", fontWeight: 700 }}>Transaction ID</th>
                    <th style={{ padding: "1rem", fontSize: "0.85rem", fontWeight: 700 }}>Mode / Method</th>
                    <th style={{ padding: "1rem", fontSize: "0.85rem", fontWeight: 700 }}>Remarks</th>
                    <th style={{ padding: "1rem", fontSize: "0.85rem", fontWeight: 700 }}>Amount</th>
                    <th style={{ padding: "1rem", fontSize: "0.85rem", fontWeight: 700 }}>Status</th>
                    <th style={{ padding: "1rem", fontSize: "0.85rem", fontWeight: 700, textAlign: "center" }}>Receipt</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p) => {
                    const formattedDate = new Date(p.payment_date).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric"
                    });
                    return (
                      <tr key={p.id} style={{ borderBottom: "1px solid var(--border)" }}>
                        <td style={{ padding: "1.1rem 1rem", fontWeight: 500 }}>{formattedDate}</td>
                        <td style={{ padding: "1.1rem 1rem", fontFamily: "monospace", fontSize: "0.9rem", color: "var(--muted)" }}>{p.transaction_id || 'N/A'}</td>
                        <td style={{ padding: "1.1rem 1rem" }}>
                          <span style={{ fontSize: "0.88rem", fontWeight: 600 }}>{p.payment_mode}</span>
                          <span style={{ display: "block", fontSize: "0.75rem", color: "var(--muted)" }}>{p.payment_method}</span>
                        </td>
                        <td style={{ padding: "1.1rem 1rem", color: "var(--muted)", fontSize: "0.9rem" }}>{p.remarks || "Semester installment"}</td>
                        <td style={{ padding: "1.1rem 1rem", fontWeight: 700, color: "var(--primary)" }}>{formatCurrency(p.amount)}</td>
                        <td style={{ padding: "1.1rem 1rem" }}>
                          <span className={`status-pill ${p.payment_status.toLowerCase() === 'success' ? 'paid' : 'pending'}`} style={{ fontWeight: 700 }}>
                            {p.payment_status}
                          </span>
                        </td>
                        <td style={{ padding: "1.1rem 1rem", textAlign: "center" }}>
                          <button 
                            onClick={() => handlePrintReceipt(p)}
                            className="button button-secondary"
                            style={{ minHeight: "34px", padding: "0.4rem 0.8rem", borderRadius: "6px", fontSize: "0.85rem", gap: "0.35rem" }}
                          >
                            <Printer size={14} /> Receipt
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>

      {/* Simulated Online Payment Modal Gate */}
      {showPayModal && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(17, 17, 79, 0.52)",
          backdropFilter: "blur(8px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9999,
          padding: "1rem"
        }}>
          <div className="panel" style={{
            width: "100%",
            maxWidth: "480px",
            background: "var(--surface)",
            borderRadius: "16px",
            boxShadow: "var(--shadow-hard)",
            padding: "2rem",
            position: "relative",
            border: "1px solid var(--border)"
          }}>
            {/* Close button (only visible during setup/success, not loader) */}
            {paymentStep !== 3 && (
              <button 
                onClick={() => setShowPayModal(false)}
                className="icon-button"
                style={{ position: "absolute", top: "1rem", right: "1rem", minHeight: "32px", width: "32px", borderRadius: "50%", padding: 0 }}
                aria-label="Close"
              >
                <X size={16} />
              </button>
            )}

            {/* Step 1: Input Setup */}
            {paymentStep === 1 && (
              <form onSubmit={handleProceedToGateway}>
                <h3 style={{ color: "var(--primary)", fontSize: "1.35rem", fontWeight: 700, margin: "0 0 0.25rem" }}>Institute Fee Payment</h3>
                <p style={{ color: "var(--muted)", fontSize: "0.88rem", margin: "0 0 1.5rem" }}>Pay outstanding dues securely via simulated payment gateway.</p>
                
                <div style={{ display: "grid", gap: "1rem" }}>
                  <div className="field">
                    <label>Installment Amount (₹) *</label>
                    <input 
                      type="number"
                      required
                      min="1"
                      max={student.remaining_balance}
                      value={payAmount}
                      onChange={(e) => setPayAmount(e.target.value)}
                      placeholder="e.g. 5000"
                    />
                    <span style={{ fontSize: "0.8rem", color: "var(--muted)" }}>Max payable balance: {formatCurrency(student.remaining_balance)}</span>
                  </div>

                  <div className="field">
                    <label>Select Online Payment Mode *</label>
                    <div className="segment-control" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", padding: "0.25rem", width: "100%" }}>
                      {["UPI", "Card", "NetBanking"].map((m) => (
                        <button
                          type="button"
                          key={m}
                          className={payMethod === m ? "active" : ""}
                          onClick={() => setPayMethod(m)}
                          style={{ minHeight: "36px", padding: 0, fontSize: "0.88rem" }}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="field">
                    <label>Remarks / Remarks *</label>
                    <input 
                      type="text"
                      required
                      value={payRemarks}
                      onChange={(e) => setPayRemarks(e.target.value)}
                      placeholder="e.g. Semester installment, Exam fees"
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="button button-primary"
                  style={{ width: "100%", marginTop: "1.75rem", height: "46px", gap: "0.5rem" }}
                >
                  Proceed to Secure Gateway <ArrowRight size={16} />
                </button>
              </form>
            )}

            {/* Step 2: Simulated Bank Interface */}
            {paymentStep === 2 && (
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: "var(--surface-soft)", padding: "0.75rem 1rem", borderRadius: "8px", marginBottom: "1.5rem" }}>
                  <ShieldCheck size={20} style={{ color: "var(--success)" }} />
                  <span style={{ fontSize: "0.88rem", fontWeight: 600 }}>Simulated Secure Bank Gateway</span>
                </div>

                <div style={{ marginBottom: "1.5rem", textAlign: "center" }}>
                  <span style={{ fontSize: "0.9rem", color: "var(--muted)", textTransform: "uppercase" }}>Transaction Amount</span>
                  <div style={{ fontSize: "2rem", fontWeight: 800, color: "var(--primary)", marginTop: "0.25rem" }}>{formatCurrency(Number(payAmount))}</div>
                </div>

                {payMethod === "UPI" && (
                  <div style={{ display: "grid", gap: "1rem" }}>
                    <div className="field">
                      <label>Enter Virtual Payment Address (VPA) / UPI ID</label>
                      <input 
                        type="text" 
                        value={upiId} 
                        onChange={(e) => setUpiId(e.target.value)}
                        placeholder="e.g. studentname@upi"
                      />
                    </div>
                  </div>
                )}

                {payMethod === "Card" && (
                  <div style={{ display: "grid", gap: "1rem" }}>
                    <div className="field">
                      <label>Credit / Debit Card Number</label>
                      <input 
                        type="text" 
                        value={cardNumber} 
                        maxLength={19}
                        onChange={(e) => setCardNumber(e.target.value)}
                        placeholder="4321 9876 5432 1098"
                      />
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                      <div className="field">
                        <label>Expiry Date</label>
                        <input 
                          type="text" 
                          value={cardExpiry} 
                          maxLength={5}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          placeholder="MM/YY"
                        />
                      </div>
                      <div className="field">
                        <label>CVV</label>
                        <input 
                          type="password" 
                          value={cardCvv} 
                          maxLength={3}
                          onChange={(e) => setCardCvv(e.target.value)}
                          placeholder="***"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {payMethod === "NetBanking" && (
                  <div className="field">
                    <label>Select Retail NetBanking Bank</label>
                    <select value={selectedBank} onChange={(e) => setSelectedBank(e.target.value)}>
                      <option value="SBI">State Bank of India (SBI)</option>
                      <option value="HDFC">HDFC Bank</option>
                      <option value="ICICI">ICICI Bank Ltd.</option>
                      <option value="AXIS">Axis Bank</option>
                      <option value="PNB">Punjab National Bank</option>
                    </select>
                  </div>
                )}

                <div style={{ display: "flex", gap: "0.75rem", marginTop: "2rem" }}>
                  <button 
                    onClick={() => setPaymentStep(1)} 
                    className="button button-secondary"
                    style={{ flex: 1, height: "46px" }}
                  >
                    Back
                  </button>
                  <button 
                    onClick={handleSimulatePayment} 
                    className="button button-primary"
                    style={{ flex: 1, height: "46px" }}
                  >
                    Confirm Payment
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Bank Loader Animation */}
            {paymentStep === 3 && (
              <div style={{ textAlign: "center", padding: "2.5rem 0" }}>
                <div style={{
                  border: "4px solid rgba(25, 25, 112, 0.1)",
                  borderTop: "4px solid var(--primary)",
                  borderRadius: "50%",
                  width: "50px",
                  height: "50px",
                  animation: "spin 1s linear infinite",
                  margin: "0 auto 1.5rem"
                }}></div>
                <h3>Verifying Transaction...</h3>
                <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>Contacting your bank securely. Do not close this browser tab.</p>
              </div>
            )}

            {/* Step 4: Success Message */}
            {paymentStep === 4 && (
              <div style={{ textAlign: "center", padding: "1rem 0" }}>
                <div style={{
                  width: "64px",
                  height: "64px",
                  borderRadius: "50%",
                  background: "#EAF7F3",
                  color: "var(--success)",
                  display: "grid",
                  placeItems: "center",
                  fontSize: "1.8rem",
                  margin: "0 auto 1.25rem",
                  border: "1px solid rgba(22, 115, 91, 0.2)"
                }}>
                  ✓
                </div>
                <h3 style={{ fontSize: "1.35rem", fontWeight: 700, color: "var(--success)" }}>Transaction Successful!</h3>
                <p style={{ color: "var(--muted)", fontSize: "0.9rem", margin: "0.5rem 0 1.5rem" }}>
                  Your payment of {formatCurrency(Number(payAmount))} has been recorded in the database.
                </p>
                
                <div style={{
                  background: "var(--surface-soft)",
                  borderRadius: "8px",
                  padding: "0.85rem 1rem",
                  textAlign: "left",
                  fontSize: "0.85rem",
                  marginBottom: "1.75rem",
                  border: "1px solid var(--border)"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", margin: "0.25rem 0" }}>
                    <span style={{ color: "var(--muted)" }}>Transaction ID:</span>
                    <strong style={{ fontFamily: "monospace" }}>{simulatedTxnId}</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", margin: "0.25rem 0" }}>
                    <span style={{ color: "var(--muted)" }}>Method / Mode:</span>
                    <strong>{payMethod} / Online</strong>
                  </div>
                </div>

                <button 
                  onClick={() => setShowPayModal(false)} 
                  className="button button-primary"
                  style={{ width: "100%", height: "46px" }}
                >
                  Return to Dashboard
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default Page;
