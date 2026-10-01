// src/app/api/payments/route.ts
import { NextResponse } from "next/server";
import { db } from "../../lib/db";
import { requireAuth, requireAdmin } from "../../lib/security";
import { isValidId, isValidAmount, sanitizeText } from "../../lib/validate";

// GET payment history for a student
export async function GET(req: Request) {
  try {
    const auth = await requireAuth();
    if (auth.error) return auth.error;
    const session = auth.user;

    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get("student_id");

    if (studentId) {
      if (!isValidId(studentId)) {
        return NextResponse.json({ error: "Valid student_id is required" }, { status: 400 });
      }

      // Role checks: Students can only fetch their own payment history
      if (session.role === "student" && String(session.studentId) !== String(studentId)) {
        return NextResponse.json({ error: "Forbidden. Cannot view other students' billing logs." }, { status: 403 });
      }

      const [rows]: any = await db.query(
        `SELECT id, student_id, amount, payment_method, transaction_id, payment_mode, payment_status, payment_date, remarks 
         FROM payments 
         WHERE student_id = ? 
         ORDER BY payment_date DESC LIMIT 100`,
        [Number(studentId)]
      );

      return NextResponse.json(rows);
    }

    // If student_id is omitted, only Admins/Staff can list all payments
    if (session.role === "student") {
      const [rows]: any = await db.query(
        `SELECT id, student_id, amount, payment_method, transaction_id, payment_mode, payment_status, payment_date, remarks 
         FROM payments 
         WHERE student_id = ? 
         ORDER BY payment_date DESC LIMIT 100`,
        [Number(session.studentId)]
      );
      return NextResponse.json(rows);
    }

    const [rows]: any = await db.query(
      `SELECT p.id, p.student_id, p.amount, p.payment_method, p.transaction_id, p.payment_mode, p.payment_status, p.payment_date, p.remarks,
              a.name AS student_name, a.course AS student_course
       FROM payments p
       LEFT JOIN applicants a ON p.student_id = a.id
       ORDER BY p.payment_date DESC LIMIT 200`
    );

    return NextResponse.json(rows);
  } catch (error: any) {
    console.error("GET payments Error:", error.message);
    return NextResponse.json(
      { error: "Failed to retrieve billing records." },
      { status: 500 }
    );
  }
}

// POST a new payment record (Student self-pay OR Admin ledger logging)
export async function POST(req: Request) {
  try {
    const auth = await requireAuth();
    if (auth.error) return auth.error;
    const session = auth.user;

    const body = await req.json();
    const { 
      student_id, 
      amount, 
      payment_method, 
      transaction_id, 
      payment_mode, 
      payment_status, 
      remarks 
    } = body;

    if (!student_id || !isValidId(student_id) || amount === undefined) {
      return NextResponse.json({ error: "Valid student_id and payment amount are required" }, { status: 400 });
    }

    // Role check: Student can only make payments on their own ID
    if (session.role === "student" && String(session.studentId) !== String(student_id)) {
      return NextResponse.json({ error: "Forbidden. Cannot submit payments for other students." }, { status: 403 });
    }

    const paymentAmount = Number(amount);
    if (!isValidAmount(paymentAmount, 500000)) {
      return NextResponse.json({ error: "Payment amount must be a positive number up to ₹5,00,000." }, { status: 400 });
    }

    // --- Balance Verification Check ---
    const [studentRows]: any = await db.query(
      "SELECT course FROM applicants WHERE id = ?",
      [Number(student_id)]
    );
    if (!studentRows || studentRows.length === 0) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }
    const course = studentRows[0].course;

    const [feeRows]: any = await db.query(
      "SELECT total_fee FROM course_fees WHERE LOWER(course) = LOWER(?)",
      [course]
    );
    const totalFee = feeRows && feeRows.length > 0 ? Number(feeRows[0].total_fee) : 15000;

    const [paidRows]: any = await db.query(
      "SELECT COALESCE(SUM(amount), 0) AS total_paid FROM payments WHERE student_id = ? AND payment_status = 'Success'",
      [Number(student_id)]
    );
    const totalPaid = paidRows && paidRows.length > 0 ? Number(paidRows[0].total_paid) : 0;
    const remainingBalance = totalFee - totalPaid;

    if (paymentAmount > remainingBalance) {
      return NextResponse.json(
        { error: `Payment amount cannot exceed outstanding balance of ₹${remainingBalance}` },
        { status: 400 }
      );
    }

    const validMethods = new Set(["UPI", "Card", "NetBanking", "Cash", "Cheque", "Bank Transfer"]);
    const method = validMethods.has(payment_method) ? payment_method : "UPI";
    const mode = session.role === "admin" ? (payment_mode === "Online" ? "Online" : "Offline") : "Online";
    const status = session.role === "admin" ? (payment_status === "Pending" ? "Pending" : "Success") : "Success";
    const txnId = transaction_id ? sanitizeText(transaction_id) : `TXN-${mode === 'Online' ? 'ON' : 'OFF'}-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const note = sanitizeText(remarks || (mode === 'Online' ? 'Fees paid online by student' : 'Offline payment recorded'));

    await db.execute(
      `INSERT INTO payments 
       (student_id, amount, payment_method, transaction_id, payment_mode, payment_status, remarks) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [Number(student_id), paymentAmount, method, txnId, mode, status, note]
    );

    return NextResponse.json({
      success: true,
      message: "Payment recorded successfully.",
      transaction_id: txnId
    }, { status: 201 });
  } catch (error: any) {
    console.error("POST payments Error:", error.message);
    return NextResponse.json(
      { error: "Failed to record payment transaction." },
      { status: 500 }
    );
  }
}

// DELETE a payment record (Admin only)
export async function DELETE(req: Request) {
  try {
    const auth = await requireAdmin();
    if (auth.error) return auth.error;

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id || !isValidId(id)) {
      return NextResponse.json({ error: "Valid Payment ID is required" }, { status: 400 });
    }

    await db.execute("DELETE FROM payments WHERE id = ?", [Number(id)]);

    return NextResponse.json({
      success: true,
      message: "Payment transaction deleted/refunded successfully.",
    });
  } catch (error: any) {
    console.error("DELETE payments Error:", error.message);
    return NextResponse.json(
      { error: "Failed to delete payment transaction." },
      { status: 500 }
    );
  }
}

// PATCH to update payment status (Admin only)
export async function PATCH(req: Request) {
  try {
    const auth = await requireAdmin();
    if (auth.error) return auth.error;

    const { id, payment_status } = await req.json();

    if (!id || !isValidId(id)) {
      return NextResponse.json({ error: "Valid payment ID is required" }, { status: 400 });
    }

    const validStatuses = new Set(["Success", "Pending", "Failed"]);
    if (!payment_status || !validStatuses.has(payment_status)) {
      return NextResponse.json({ error: "Valid payment status (Success, Pending, Failed) is required" }, { status: 400 });
    }

    const [result]: any = await db.execute(
      "UPDATE payments SET payment_status = ? WHERE id = ?",
      [payment_status, Number(id)]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: "Payment record not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: `Payment status updated to ${payment_status} successfully.`
    });
  } catch (error: any) {
    console.error("PATCH payments Error:", error.message);
    return NextResponse.json(
      { error: "Failed to update payment status." },
      { status: 500 }
    );
  }
}
