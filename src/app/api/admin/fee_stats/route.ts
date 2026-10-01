// src/app/api/admin/fee_stats/route.ts
import { NextResponse } from "next/server";
import { db } from "../../../lib/db";
import { requireAdmin } from "../../../lib/security";

export async function GET() {
  try {
    const auth = await requireAdmin();
    if (auth.error) return auth.error;

    // 1. Total fees collected (successful payments)
    const [collectedRows]: any = await db.query(
      "SELECT COALESCE(SUM(amount), 0) AS total_collected FROM payments WHERE payment_status = 'Success'"
    );
    const totalCollected = collectedRows && collectedRows[0] ? Number(collectedRows[0].total_collected) : 0;

    // 2. Fetch all student fees to calculate total pending and status counts
    const [studentFees]: any = await db.query(`
      SELECT 
        a.id,
        COALESCE(cf.total_fee, 15000) AS total_fee,
        COALESCE(SUM(p.amount), 0) AS total_paid
      FROM applicants a
      LEFT JOIN payments p ON a.id = p.student_id AND p.payment_status = 'Success'
      LEFT JOIN course_fees cf ON LOWER(a.course) = LOWER(cf.course)
      GROUP BY a.id, cf.total_fee
    `);

    let totalFeesBilled = 0;
    let fullyPaidCount = 0;
    let pendingCount = 0;

    if (Array.isArray(studentFees)) {
      for (const s of studentFees) {
        const fee = Number(s.total_fee) || 15000;
        const paid = Number(s.total_paid) || 0;
        totalFeesBilled += fee;
        const remaining = fee - paid;
        if (remaining <= 0) {
          fullyPaidCount++;
        } else {
          pendingCount++;
        }
      }
    }

    const totalPending = Math.max(0, (totalFeesBilled || 0) - (totalCollected || 0));

    // 3. Recent payments with student details
    const [recentPayments]: any = await db.query(`
      SELECT 
        p.id,
        p.student_id,
        p.amount,
        p.payment_method,
        p.transaction_id,
        p.payment_mode,
        p.payment_status,
        p.payment_date,
        p.remarks,
        a.name AS student_name,
        a.course AS student_course
      FROM payments p
      JOIN applicants a ON p.student_id = a.id
      ORDER BY p.payment_date DESC
      LIMIT 100
    `);

    return NextResponse.json({
      totalCollected,
      totalPending,
      fullyPaidCount,
      pendingCount,
      recentPayments: recentPayments || []
    });
  } catch (error: any) {
    console.error("GET Admin Fee Stats Error:", error.message);
    return NextResponse.json(
      { error: "Failed to load financial statistics." },
      { status: 500 }
    );
  }
}
