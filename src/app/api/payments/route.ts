import { NextResponse } from "next/server";
import { db } from "../../lib/db";

// GET payment history for a student
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get("student_id");

    if (!studentId) {
      return NextResponse.json(
        { error: "student_id query parameter is required" },
        { status: 400 }
      );
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

    if (Number(amount) <= 0) {
      return NextResponse.json(
        { error: "Payment amount must be greater than zero" },
        { status: 400 }
      );
    }

    const method = payment_method || 'UPI';
    const mode = payment_mode || 'Online';
    const status = payment_status || 'Success';
    const txnId = transaction_id || `TXN-${mode === 'Online' ? 'ON' : 'OFF'}-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const note = remarks || (mode === 'Online' ? 'Fees paid online by student' : 'Offline payment recorded');

    await db.execute(
      `INSERT INTO payments 
       (student_id, amount, payment_method, transaction_id, payment_mode, payment_status, remarks) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [student_id, Number(amount), method, txnId, mode, status, note]
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

