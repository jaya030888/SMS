"use client";

import { useEffect, useState } from "react";
import StuNav from "../../../components/StuNav";
import { Search, Filter, Download, PlusCircle, CheckCircle, Clock, Trash2, Landmark, RefreshCw, X, Receipt, DollarSign, Printer } from "lucide-react";

interface PaymentLog {
  id: number;
  student_id: number;
  amount: number;
  payment_method: string;
  transaction_id: string;
  payment_mode: string;
  payment_status: string;
  payment_date: string;
  remarks: string;
  student_name: string;
  student_course: string;
}

interface StudentFeeSummary {
  id: number;
  name: string;
  course: string;
  amount_paid: number;
  remaining_balance: number;
  payment_status: string;
  phone: string;
}

export default function Page() {
  const [stats, setStats] = useState({
    totalCollected: 0,
    totalPending: 0,
    fullyPaidCount: 0,
    pendingCount: 0,
    recentPayments: [] as PaymentLog[]
  });
  const [students, setStudents] = useState<StudentFeeSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Search & Filtering States
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCourse, setFilterCourse] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");

  // Payment Form States
  const [showOfflineModal, setShowOfflineModal] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<number | "">("");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMode, setPaymentMode] = useState<"Online" | "Offline">("Offline");
  const [paymentMethod, setPaymentMethod] = useState("Cash"); // Offline: Cash, Cheque, Bank Transfer | Online: UPI, Card, NetBanking
  const [paymentRemarks, setPaymentRemarks] = useState("");
  const [formSubmitting, setFormSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      const [statsRes, applicantsRes] = await Promise.all([
        fetch("/api/admin/fee_stats"),
        fetch("/api/applicants")
      ]);

      if (statsRes.ok && applicantsRes.ok) {
        const statsData = await statsRes.json();
        const applicantsData = await applicantsRes.json();
        setStats(statsData);
        setStudents(applicantsData);
      }
    } catch (err) {
      console.error("Error fetching admin fee data:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Handle Admin Payment Submission (Support both Online/Offline)
  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId || !paymentAmount) {
      alert("Please select a student and enter the payment amount.");
      return;
    }

    const matchedStudent = students.find(s => s.id === Number(selectedStudentId));
    if (matchedStudent && Number(paymentAmount) > matchedStudent.remaining_balance) {
      alert(`Entered amount exceeds student's remaining balance of ${formatCurrency(matchedStudent.remaining_balance)}.`);
      return;
    }

    setFormSubmitting(true);

    try {
      const isOnline = paymentMode === "Online";
      const generatedTxn = isOnline
        ? `TXN-ON-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`
        : `TXN-OFF-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
      
      const payload = {
        student_id: Number(selectedStudentId),
        amount: Number(paymentAmount),
        payment_method: paymentMethod,
        transaction_id: generatedTxn,
        payment_mode: paymentMode,
        payment_status: "Success", // Admin-logged payments are immediately success
        remarks: paymentRemarks || `${paymentMode} payment recorded by admin`
      };

      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        alert("Payment recorded successfully!");
        setShowOfflineModal(false);
        setSelectedStudentId("");
        setPaymentAmount("");
        setPaymentRemarks("");
        // Reload dashboard state
        fetchData();
      } else {
        const err = await res.json();
        alert(`Failed to save payment: ${err.error || 'Server error'}`);
      }
    } catch (err) {
      console.error(err);
      alert("An unexpected error occurred.");
    } finally {
      setFormSubmitting(false);
    }
  };

  // Approve a pending transaction
  const handleApprovePayment = async (paymentId: number) => {
    if (!confirm("Are you sure you want to approve this payment transaction? This will clear the student's dues accordingly.")) {
      return;
    }

    try {
      const res = await fetch("/api/payments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: paymentId,
          payment_status: "Success"
        })
      });

      if (res.ok) {
        alert("Payment approved successfully!");
        fetchData();
      } else {
        const err = await res.json();
        alert(`Approval failed: ${err.error || 'Server error'}`);
      }
    } catch (err) {
      console.error("Approve payment error:", err);
      alert("An unexpected error occurred.");
    }
  };

  // Reject/Delete a payment transaction
  const handleRejectOrDeletePayment = async (paymentId: number, isPending: boolean) => {
    const message = isPending
      ? "Are you sure you want to reject this pending payment? This will delete the request."
      : "Are you sure you want to refund/delete this successful transaction? This will re-add outstanding dues to the student.";
      
    if (!confirm(message)) {
      return;
    }

    try {
      const res = await fetch(`/api/payments?id=${paymentId}`, {
        method: "DELETE"
      });

      if (res.ok) {
        alert(isPending ? "Pending payment rejected." : "Transaction deleted successfully.");
        fetchData();
      } else {
        const err = await res.json();
        alert(`Deletion failed: ${err.error || 'Server error'}`);
      }
    } catch (err) {
      console.error("Delete payment error:", err);
      alert("An unexpected error occurred.");
    }
  };

  // Export Fee Records to CSV
  const handleExportCSV = () => {
    if (students.length === 0) return;

    const headers = ["Student ID", "Student Name", "Course/Trade", "Amount Paid (₹)", "Remaining Balance (₹)", "Payment Status"];
    const csvRows = [
      headers.join(","),
      ...students.map(s => [
        s.id,
        `"${s.name.replace(/"/g, '""')}"`,
        s.course,
        s.amount_paid,
        s.remaining_balance,
        s.payment_status
      ].join(","))
    ];

    const csvContent = "data:text/csv;charset=utf-8," + csvRows.join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `institute_fee_report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Open printable receipt window for a payment log
  const handlePrintReceipt = (p: PaymentLog) => {
    const printWindow = window.open("", "_blank", "width=850,height=750");
    if (!printWindow) return;

    const formattedDate = new Date(p.payment_date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });

    printWindow.document.write(`
      <html>
        <head>
          <title>Maa Gauri ITI - Receipt #${p.id}</title>
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
                <p>${p.student_name}</p>
              </div>
              <div class="info-item">
                <h4>Receipt ID</h4>
                <p>RCP-FEE-${p.id}-${p.student_id}</p>
              </div>
              <div class="info-item">
                <h4>Course / Trade</h4>
                <p>${p.student_course}</p>
              </div>
              <div class="info-item">
                <h4>Transaction Date</h4>
                <p>${formattedDate}</p>
              </div>
              <div class="info-item">
                <h4>Transaction ID</h4>
                <p>${p.transaction_id}</p>
              </div>
              <div class="info-item">
                <h4>Payment Method</h4>
                <p>${p.payment_mode} (${p.payment_method})</p>
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
                      Remarks: ${p.remarks || 'Offline Receipt Recorded by Admin'}
                    </div>
                  </td>
                  <td style="text-align: right; font-weight: 700; color: #0f172a;">₹${p.amount.toLocaleString("en-IN")}</td>
                </tr>
              </tbody>
            </table>

            <div class="total-section">
              <span class="total-label">Total Amount Paid:</span>
              <h3 class="total-val">₹${p.amount.toLocaleString("en-IN")}</h3>
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

  // Filter students based on search and selected options
  const filteredStudents = students.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          String(s.id).includes(searchQuery) ||
                          (s.phone && String(s.phone).includes(searchQuery));
    const matchesCourse = filterCourse === "All" || s.course.toLowerCase().includes(filterCourse.toLowerCase());
    const matchesStatus = filterStatus === "All" || s.payment_status.toLowerCase() === filterStatus.toLowerCase();

    return matchesSearch && matchesCourse && matchesStatus;
  });

  if (loading) {
    return (
      <>
        <StuNav name="Fee Management" role="admin" />
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
          <h2>Loading Institutional Accounts Module...</h2>
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        </main>
      </>
    );
  }

  return (
    <>
      <StuNav name="Fee Management" role="admin" />

      <main className="dashboard-page">
        {/* Header Block */}
        <section className="section-title-row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <div>
            <p className="eyebrow" style={{ margin: 0 }}>FINANCE & ACCOUNTS CONTROL</p>
            <h1 style={{ margin: 0, color: "var(--primary)" }}>Fee Management Dashboard</h1>
          </div>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button 
              onClick={handleRefresh} 
              className="button button-secondary"
              style={{ minHeight: "44px", padding: "0 1rem", borderRadius: "8px", gap: "0.4rem" }}
              disabled={refreshing}
            >
              <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
              {refreshing ? "Refreshing..." : "Refresh"}
            </button>
            <button 
              onClick={() => setShowOfflineModal(true)}
              className="button button-primary"
              style={{ minHeight: "44px", padding: "0 1.2rem", borderRadius: "8px", gap: "0.4rem" }}
            >
              <PlusCircle size={16} />
              Record Offline Payment
            </button>
          </div>
        </section>

        {/* Executive Billing KPIs Grid */}
        <section className="stats-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1.25rem" }}>
          <div className="stat-card panel" style={{ borderLeft: "5px solid var(--success)", padding: "1.25rem", borderRadius: "12px" }}>
            <span style={{ fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--muted)", display: "flex", alignItems: "center", gap: "0.35rem" }}>
              <DollarSign size={16} style={{ color: "var(--success)" }} /> Total Fees Collected
            </span>
            <strong style={{ color: "var(--success)" }}>{formatCurrency(stats.totalCollected)}</strong>
            <p style={{ fontSize: "0.82rem", color: "var(--muted)" }}>Cleared transaction chunks in database</p>
          </div>
          
          <div className="stat-card panel" style={{ borderLeft: "5px solid var(--danger)", padding: "1.25rem", borderRadius: "12px" }}>
            <span style={{ fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--muted)", display: "flex", alignItems: "center", gap: "0.35rem" }}>
              <Clock size={16} style={{ color: "var(--danger)" }} /> Outstanding Dues
            </span>
            <strong style={{ color: "var(--danger)" }}>{formatCurrency(stats.totalPending)}</strong>
            <p style={{ fontSize: "0.82rem", color: "var(--muted)" }}>Remaining balance across students</p>
          </div>

          <div className="stat-card panel" style={{ borderLeft: "5px solid var(--primary)", padding: "1.25rem", borderRadius: "12px" }}>
            <span style={{ fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--muted)", display: "flex", alignItems: "center", gap: "0.35rem" }}>
              <CheckCircle size={16} style={{ color: "var(--primary)" }} /> Fully Paid Students
            </span>
            <strong>{stats.fullyPaidCount}</strong>
            <p style={{ fontSize: "0.82rem", color: "var(--muted)" }}>Students with zero balance dues</p>
          </div>

          <div className="stat-card panel" style={{ borderLeft: "5px solid var(--warning)", padding: "1.25rem", borderRadius: "12px" }}>
            <span style={{ fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--muted)", display: "flex", alignItems: "center", gap: "0.35rem" }}>
              <Clock size={16} style={{ color: "var(--warning)" }} /> Pending Dues Students
            </span>
            <strong style={{ color: "var(--warning)" }}>{stats.pendingCount}</strong>
            <p style={{ fontSize: "0.82rem", color: "var(--muted)" }}>Students with positive balances due</p>
          </div>
        </section>

        {/* Directory Controls and Search Filters */}
        <section className="panel" style={{ borderRadius: "12px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem", borderBottom: "1.5px solid var(--border)", paddingBottom: "1rem", marginBottom: "1.5rem" }}>
            <h3 style={{ margin: 0, color: "var(--primary)" }}>Student Fee Directory</h3>
            <button 
              onClick={handleExportCSV} 
              className="button button-secondary"
              style={{ minHeight: "38px", padding: "0 1rem", borderRadius: "6px", fontSize: "0.9rem", gap: "0.4rem" }}
            >
              <Download size={14} /> Export Report (CSV)
            </button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
            {/* Search Box */}
            <div className="search-box" style={{ width: "100%", background: "var(--surface-soft)" }}>
              <Search size={18} />
              <input
                type="text"
                placeholder="Search by student name or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ border: 0, outline: "none", width: "100%", background: "transparent" }}
              />
            </div>

            {/* Course Filter */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Filter size={16} style={{ color: "var(--muted)" }} />
              <select 
                value={filterCourse} 
                onChange={(e) => setFilterCourse(e.target.value)}
                style={{ minHeight: "52px", background: "var(--surface)", border: "1px solid var(--border)" }}
              >
                <option value="All">All Courses</option>
                <option value="COPA">COPA</option>
                <option value="Electrician">Electrician</option>
                <option value="Fitter">Fitter</option>
              </select>
            </div>

            {/* Status Filter */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Filter size={16} style={{ color: "var(--muted)" }} />
              <select 
                value={filterStatus} 
                onChange={(e) => setFilterStatus(e.target.value)}
                style={{ minHeight: "52px", background: "var(--surface)", border: "1px solid var(--border)" }}
              >
                <option value="All">All Statuses</option>
                <option value="Paid">Fully Paid</option>
                <option value="Pending">Pending Dues</option>
              </select>
            </div>
          </div>

          {/* Student Grid Table */}
          {filteredStudents.length === 0 ? (
            <div style={{ textAlign: "center", padding: "4rem 1rem", color: "var(--muted)" }}>
              <h3>No student records match filters</h3>
              <p>Try resetting the search terms or dropdown filters.</p>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "900px" }}>
                <thead>
                  <tr style={{ background: "var(--surface-soft)", borderBottom: "1.5px solid var(--border)", color: "var(--ink)", textAlign: "left" }}>
                    <th style={{ padding: "1rem", fontSize: "0.85rem", fontWeight: 700 }}>ID</th>
                    <th style={{ padding: "1rem", fontSize: "0.85rem", fontWeight: 700 }}>Student Name</th>
                    <th style={{ padding: "1rem", fontSize: "0.85rem", fontWeight: 700 }}>Course / Trade</th>
                    <th style={{ padding: "1rem", fontSize: "0.85rem", fontWeight: 700 }}>Total Collected</th>
                    <th style={{ padding: "1rem", fontSize: "0.85rem", fontWeight: 700 }}>Outstanding Balance</th>
                    <th style={{ padding: "1rem", fontSize: "0.85rem", fontWeight: 700 }}>Status</th>
                    <th style={{ padding: "1rem", fontSize: "0.85rem", fontWeight: 700, textAlign: "center" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((s) => (
                    <tr key={s.id} style={{ borderBottom: "1px solid var(--border)" }}>
                      <td style={{ padding: "1.1rem 1rem", fontFamily: "monospace", color: "var(--muted)" }}>#{s.id}</td>
                      <td style={{ padding: "1.1rem 1rem", fontWeight: 600 }}>{s.name}</td>
                      <td style={{ padding: "1.1rem 1rem" }}>{s.course}</td>
                      <td style={{ padding: "1.1rem 1rem", fontWeight: 700, color: "var(--success)" }}>{formatCurrency(s.amount_paid)}</td>
                      <td style={{ padding: "1.1rem 1rem", fontWeight: 700, color: s.remaining_balance > 0 ? "var(--warning)" : "var(--muted)" }}>
                        {formatCurrency(s.remaining_balance)}
                      </td>
                      <td style={{ padding: "1.1rem 1rem" }}>
                        <span className={`status-pill ${s.payment_status.toLowerCase() === 'paid' ? 'paid' : 'pending'}`}>
                          {s.payment_status}
                        </span>
                      </td>
                      <td style={{ padding: "1.1rem 1rem", textAlign: "center" }}>
                        {s.remaining_balance > 0 ? (
                          <button
                            onClick={() => {
                              setSelectedStudentId(s.id);
                              setPaymentAmount(String(s.remaining_balance));
                              setPaymentRemarks("Cash fee payment");
                              setPaymentMethod("Cash");
                              setShowOfflineModal(true);
                            }}
                            className="button button-primary"
                            style={{ minHeight: "34px", padding: "0.4rem 0.8rem", borderRadius: "6px", fontSize: "0.85rem", gap: "0.35rem" }}
                          >
                            Record Offline
                          </button>
                        ) : (
                          <span style={{ fontSize: "0.85rem", color: "var(--muted)", fontWeight: 600 }}>Fees Cleared ✓</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Global Recent Transaction History log */}
        <section className="panel" style={{ borderRadius: "12px" }}>
          <h3 style={{ borderBottom: "1.5px solid var(--border)", paddingBottom: "0.75rem", marginBottom: "1.25rem", color: "var(--primary)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Receipt size={20} /> Institutional Transactions Log (Recent 50)
          </h3>

          {stats.recentPayments.length === 0 ? (
            <div style={{ textAlign: "center", padding: "3rem 1rem", color: "var(--muted)" }}>
              <Clock size={40} style={{ margin: "0 auto 1rem", opacity: 0.5 }} />
              <p>No payments recorded across the institute yet.</p>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "900px" }}>
                <thead>
                  <tr style={{ background: "var(--surface-soft)", borderBottom: "1.5px solid var(--border)", color: "var(--ink)", textAlign: "left" }}>
                    <th style={{ padding: "1rem", fontSize: "0.85rem", fontWeight: 700 }}>Date</th>
                    <th style={{ padding: "1rem", fontSize: "0.85rem", fontWeight: 700 }}>Student Name</th>
                    <th style={{ padding: "1rem", fontSize: "0.85rem", fontWeight: 700 }}>Course</th>
                    <th style={{ padding: "1rem", fontSize: "0.85rem", fontWeight: 700 }}>Txn ID</th>
                    <th style={{ padding: "1rem", fontSize: "0.85rem", fontWeight: 700 }}>Mode (Method)</th>
                    <th style={{ padding: "1rem", fontSize: "0.85rem", fontWeight: 700 }}>Amount</th>
                    <th style={{ padding: "1rem", fontSize: "0.85rem", fontWeight: 700 }}>Status</th>
                    <th style={{ padding: "1rem", fontSize: "0.85rem", fontWeight: 700, textAlign: "center" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentPayments.map((p) => {
                    const formattedDate = new Date(p.payment_date).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric"
                    });
                    return (
                      <tr key={p.id} style={{ borderBottom: "1px solid var(--border)" }}>
                        <td style={{ padding: "1rem" }}>{formattedDate}</td>
                        <td style={{ padding: "1rem", fontWeight: 600 }}>{p.student_name}</td>
                        <td style={{ padding: "1rem" }}>{p.student_course}</td>
                        <td style={{ padding: "1rem", fontFamily: "monospace", fontSize: "0.85rem", color: "var(--muted)" }}>{p.transaction_id || 'N/A'}</td>
                        <td style={{ padding: "1rem" }}>
                          <strong>{p.payment_mode}</strong> ({p.payment_method})
                        </td>
                        <td style={{ padding: "1rem", fontWeight: 700, color: "var(--primary)" }}>{formatCurrency(p.amount)}</td>
                        <td style={{ padding: "1rem" }}>
                          <span className={`status-pill ${p.payment_status.toLowerCase() === 'success' ? 'paid' : p.payment_status.toLowerCase() === 'pending' ? 'pending' : 'failed'}`}>
                            {p.payment_status}
                          </span>
                        </td>
                        <td style={{ padding: "1rem", textAlign: "center" }}>
                          <div style={{ display: "flex", justifyContent: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                            <button 
                              onClick={() => handlePrintReceipt(p)}
                              className="button button-secondary"
                              style={{ minHeight: "32px", padding: "0.35rem 0.75rem", borderRadius: "6px", fontSize: "0.8rem", gap: "0.35rem" }}
                            >
                              <Printer size={12} /> Receipt
                            </button>
                            {p.payment_status === "Pending" ? (
                              <>
                                <button 
                                  onClick={() => handleApprovePayment(p.id)}
                                  className="button button-primary"
                                  style={{ minHeight: "32px", padding: "0.35rem 0.75rem", borderRadius: "6px", fontSize: "0.8rem", background: "var(--success)", borderColor: "var(--success)" }}
                                >
                                  Approve
                                </button>
                                <button 
                                  onClick={() => handleRejectOrDeletePayment(p.id, true)}
                                  className="button button-secondary"
                                  style={{ minHeight: "32px", padding: "0.35rem 0.75rem", borderRadius: "6px", fontSize: "0.8rem", color: "var(--danger)", borderColor: "var(--danger)" }}
                                >
                                  Reject
                                </button>
                              </>
                            ) : (
                              <button 
                                onClick={() => handleRejectOrDeletePayment(p.id, false)}
                                className="button button-secondary"
                                style={{ minHeight: "32px", padding: "0.35rem 0.75rem", borderRadius: "6px", fontSize: "0.8rem", color: "var(--danger)", borderColor: "var(--danger)" }}
                                title="Refund / Delete transaction"
                              >
                                <Trash2 size={12} /> Delete
                              </button>
                            )}
                          </div>
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

      {/* Record Payment Modal */}
      {showOfflineModal && (
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
            maxWidth: "460px",
            background: "var(--surface)",
            borderRadius: "16px",
            boxShadow: "var(--shadow-hard)",
            padding: "2rem",
            position: "relative",
            border: "1px solid var(--border)",
            color: "var(--ink)"
          }}>
            <button 
              onClick={() => {
                setShowOfflineModal(false);
                setSelectedStudentId("");
                setPaymentAmount("");
                setPaymentRemarks("");
              }}
              className="icon-button"
              style={{ position: "absolute", top: "1rem", right: "1rem", minHeight: "32px", width: "32px", borderRadius: "50%", padding: 0 }}
              aria-label="Close"
              disabled={formSubmitting}
            >
              <X size={16} />
            </button>

            <form onSubmit={handleRecordPayment}>
              <h3 style={{ color: "var(--primary)", fontSize: "1.35rem", fontWeight: 700, margin: "0 0 0.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Landmark size={22} /> Record Student Payment
              </h3>
              <p style={{ color: "var(--muted)", fontSize: "0.88rem", margin: "0 0 1.5rem" }}>Record a manual online or offline payment collection from a student.</p>

              <div style={{ display: "grid", gap: "1rem" }}>
                <div className="field">
                  <label>Select Enrolled Student *</label>
                  <select 
                    required 
                    value={selectedStudentId} 
                    onChange={(e) => {
                      const val = e.target.value;
                      setSelectedStudentId(val === "" ? "" : Number(val));
                      if (val !== "") {
                        const matched = students.find(s => s.id === Number(val));
                        if (matched) {
                          setPaymentAmount(String(matched.remaining_balance));
                        }
                      }
                    }}
                  >
                    <option value="">-- Choose Student --</option>
                    {students.map(s => (
                      <option key={s.id} value={s.id} disabled={s.remaining_balance <= 0}>
                        {s.name} (ID: #{s.id}) - Balance: {formatCurrency(s.remaining_balance)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="field">
                  <label>Amount Received (₹) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    placeholder="e.g. 15000"
                  />
                  {selectedStudentId !== "" && (
                    <span style={{ fontSize: "0.8rem", color: "var(--muted)" }}>
                      Max payable: {formatCurrency(students.find(s => s.id === Number(selectedStudentId))?.remaining_balance || 0)}
                    </span>
                  )}
                </div>

                <div className="field">
                  <label>Select Payment Mode *</label>
                  <div className="segment-control" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", padding: "0.25rem", width: "100%", marginBottom: "0.25rem" }}>
                    {(["Online", "Offline"] as const).map((mode) => (
                      <button
                        type="button"
                        key={mode}
                        className={paymentMode === mode ? "active" : ""}
                        onClick={() => {
                          setPaymentMode(mode);
                          setPaymentMethod(mode === "Online" ? "UPI" : "Cash");
                        }}
                        style={{ minHeight: "36px", padding: 0, fontSize: "0.88rem" }}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="field">
                  <label>Payment Method *</label>
                  <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                    {paymentMode === "Online" ? (
                      <>
                        <option value="UPI">UPI Desk QR</option>
                        <option value="Card">Credit/Debit Card</option>
                        <option value="NetBanking">NetBanking / Gateway</option>
                      </>
                    ) : (
                      <>
                        <option value="Cash">Cash</option>
                        <option value="Cheque">Cheque / Demand Draft</option>
                        <option value="Bank Transfer">Direct Bank Transfer (IMPS/NEFT)</option>
                      </>
                    )}
                  </select>
                </div>

                <div className="field">
                  <label>Remarks / Notes</label>
                  <input
                    type="text"
                    value={paymentRemarks}
                    onChange={(e) => setPaymentRemarks(e.target.value)}
                    placeholder="e.g. Cleared semester dues"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="button button-primary"
                style={{ width: "100%", marginTop: "1.75rem", height: "46px" }}
                disabled={formSubmitting}
              >
                {formSubmitting ? "Saving Transaction..." : "Save Payment Receipt"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
