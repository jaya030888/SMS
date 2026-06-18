import { NextResponse } from "next/server";
import { db } from "../../lib/db";
import { cookies } from "next/headers";
import { verifyJWT } from "../../lib/auth-jwt";

// Helper to get session from cookies
async function getSession() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session_token")?.value;
    if (!token) return null;
    return await verifyJWT(token);
  } catch {
    return null;
  }
}

// GET payment history for a student
export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get("student_id");

    if (!studentId) {
      return NextResponse.json(
        { error: "student_id query parameter is required" },
        { status: 400 }
      );
    }

    // Role checks: Students can only fetch their own payment history
    if (session.role === "student" && String(session.studentId) !== String(studentId)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const [rows] = await db.query(
      `SELECT id, student_id, amount, payment_method, transaction_id, payment_mode, payment_status, payment_date, remarks 
       FROM payments 
       WHERE student_id = ? 
       ORDER BY payment_date DESC`,
      [studentId]
    );

    return NextResponse.json(rows);
  } catch (error: any) {
    console.error("GET payments Error:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

// POST a new payment record
export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { 
      student_id, 
      amount, 
      payment_method, 
      transaction_id, 
      payment_mode, 
      payment_status, 
      remarks 
    } = await req.json();

    if (!student_id || amount === undefined) {
      return NextResponse.json(
        { error: "student_id and amount are required" },
        { status: 400 }
      );
    }

    // Role check: Student can only make payments on their own ID
    if (session.role === "student" && String(session.studentId) !== String(student_id)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const paymentAmount = Number(amount);
    if (paymentAmount <= 0) {
      return NextResponse.json(
        { error: "Payment amount must be greater than zero" },
        { status: 400 }
      );
    }

    // --- Balance Verification Check ---
    // 1. Fetch student's course
    const [studentRows]: any = await db.query(
      "SELECT course FROM applicants WHERE id = ?",
      [student_id]
    );
    if (studentRows.length === 0) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }
    const course = studentRows[0].course;

    // 2. Fetch course total fee
    const [feeRows]: any = await db.query(
      "SELECT total_fee FROM course_fees WHERE LOWER(course) = LOWER(?)",
      [course]
    );
    const totalFee = feeRows.length > 0 ? Number(feeRows[0].total_fee) : 0;

    // 3. Fetch current payments sum
    const [paidRows]: any = await db.query(
      "SELECT COALESCE(SUM(amount), 0) AS total_paid FROM payments WHERE student_id = ? AND payment_status = 'Success'",
      [student_id]
    );
    const totalPaid = Number(paidRows[0].total_paid);
    const remainingBalance = totalFee - totalPaid;

    if (paymentAmount > remainingBalance) {
      return NextResponse.json(
        { error: `Payment amount exceeding remaining balance of ₹${remainingBalance}` },
        { status: 400 }
      );
    }
    // ---------------------------------

    const method = payment_method || 'UPI';
    const mode = payment_mode || 'Online';
    const status = payment_status || 'Success';
    const txnId = transaction_id || `TXN-${mode === 'Online' ? 'ON' : 'OFF'}-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const note = remarks || (mode === 'Online' ? 'Fees paid online by student' : 'Offline payment recorded');

    await db.execute(
      `INSERT INTO payments 
       (student_id, amount, payment_method, transaction_id, payment_mode, payment_status, remarks) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [student_id, paymentAmount, method, txnId, mode, status, note]
    );

    return NextResponse.json({
      success: true,
      message: "Payment recorded successfully.",
      transaction_id: txnId
    });
  } catch (error: any) {
    console.error("POST payments Error:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

// DELETE a payment record (deduct fee)
export async function DELETE(req: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Payment ID is required" },
        { status: 400 }
      );
    }

    await db.execute("DELETE FROM payments WHERE id = ?", [id]);

    return NextResponse.json({
      success: true,
      message: "Payment transaction deleted/refunded successfully.",
    });
  } catch (error: any) {
    console.error("DELETE payments Error:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

// PATCH to update payment status (admin only)
export async function PATCH(req: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id, payment_status } = await req.json();

    if (!id || !payment_status) {
      return NextResponse.json(
        { error: "id and payment_status are required" },
        { status: 400 }
      );
    }

    // Update the status of the payment
    const [result]: any = await db.execute(
      "UPDATE payments SET payment_status = ? WHERE id = ?",
      [payment_status, id]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: "Payment record not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: `Payment status updated to ${payment_status} successfully.`
    });
  } catch (error: any) {
    console.error("PATCH payments Error:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

