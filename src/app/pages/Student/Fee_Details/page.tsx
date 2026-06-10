"use client";

import { useEffect, useState } from "react";
import Info_Card from "@/src/app/components/Info_Card";
import Info_sameliner from "@/src/app/components/Info_sameliner";
import StuNav from "@/src/app/components/StuNav";
import { Download } from "lucide-react";

interface StudentData {
  id: number;
  name: string;
  course: string;
  amount_paid: number;
  payment_status: string;
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

const Page = () => {
  const [student, setStudent] = useState<StudentData | null>(null);
  const [feeStructure, setFeeStructure] = useState<CourseFee | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedId = localStorage.getItem("currentStudentId") || "1";
      
      Promise.all([
        fetch("/api/applicants").then(res => res.json()),
        fetch("/api/course-fees").then(res => res.json())
      ])
      .then(([applicants, feesData]) => {
        const matchedStudent = applicants.find((a: any) => String(a.id) === String(storedId)) || applicants[0];
        if (matchedStudent) {
          setStudent(matchedStudent);
          
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
    }
  }, []);

  if (loading) {
    return (
      <>
        <StuNav name="Fee Details" />
        <main className="dashboard-page" style={{ textAlign: "center", padding: "4rem" }}>
          <h2>Loading Fee Breakdown...</h2>
        </main>
      </>
    );
  }

  if (!student || !feeStructure) {
    return (
      <>
        <StuNav name="Fee Details" />
        <main className="dashboard-page" style={{ textAlign: "center", padding: "4rem" }}>
          <h2>No Fee Records Found</h2>
        </main>
      </>
    );
  }

  const totalFee = feeStructure.total_fee;
  const paidAmount = student.amount_paid !== undefined ? student.amount_paid : 2000;
  const balanceAmount = Math.max(0, totalFee - paidAmount);
  const isPaid = balanceAmount <= 0 || student.payment_status === "Paid";

  const formatCurrency = (val: number) => {
    return `Rs. ${val.toLocaleString("en-IN")}`;
  };

  return (
    <>
      <StuNav name="Fee Details" />

      <main className="dashboard-page">
        {isPaid ? (
          <Info_Card
            className="info-card success-card"
            image="/file.svg"
            alter=""
            feild="Fee Payment Complete"
            entry="Your fees have been paid in full. Thank you!"
          />
        ) : (
          <Info_Card
            className="info-card warning-card"
            image="/file.svg"
            alter=""
            feild="Fee Payment Pending"
            entry={`You have a pending balance of ${formatCurrency(balanceAmount)}. Please pay before final examinations.`}
          />
        )}

        <section className="dashboard-grid two">
          <div className="panel">
            <h2>Fee Breakdown ({student.course})</h2>
            <Info_sameliner label="Tuition Fee" entry={formatCurrency(feeStructure.tuition_fee)} />
            <Info_sameliner label="Lab Fee" entry={formatCurrency(feeStructure.lab_fee)} />
            <Info_sameliner label="Library Fee" entry={formatCurrency(feeStructure.library_fee)} />
            <Info_sameliner label="Examination Fee" entry={formatCurrency(feeStructure.exam_fee)} />
            <Info_sameliner label="Development Fee" entry={formatCurrency(feeStructure.development_fee)} />
            <div className="total-row">
              <h3>Total Fee</h3>
              <h3>{formatCurrency(totalFee)}</h3>
            </div>
          </div>

          <div className="panel">
            <h2>Payment Summary</h2>
            <Info_sameliner label="Total Fee" entry={formatCurrency(totalFee)} />
            <Info_sameliner label="Paid Amount" entry={formatCurrency(paidAmount)} entryColor="var(--success)" />
            <Info_sameliner label="Balance" entry={formatCurrency(balanceAmount)} entryColor={isPaid ? "var(--muted)" : "var(--warning)"} />
            <button className="button receipt-button" onClick={() => alert("Receipt download started...")}>
              <Download size={18} />
              Download Receipt
            </button>
          </div>
        </section>

        <section className="panel">
          <h2>Payment History</h2>
          <div className="payment-row">
            <div>
              <strong>{formatCurrency(paidAmount)}</strong>
              <p>{paidAmount > 2000 ? "Payment Recorded" : "At the time of Registration"}</p>
              <p>Receipt: RCP00{student.id}</p>
            </div>
            <div>
              <span className={`status-pill ${isPaid ? "paid" : "pending"}`}>{isPaid ? "Paid" : "Partially Paid"}</span>
              <button className="button button-secondary" onClick={() => alert("Receipt download started...")}>Download</button>
            </div>
          </div>
        </section>
      </main>
    </>
  );
};

export default Page;
