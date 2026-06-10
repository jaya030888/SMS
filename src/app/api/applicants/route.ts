import { NextResponse } from "next/server";
import { db } from "../../lib/db";

// GET all applicants
export async function GET() {
  try {
    const [rows] = await db.query(`
      SELECT
        id,
        name,
        fatherName,
        email,
        DOB,
        phone,
        Address,
        course,
        Qualification,
        payment_status,
        amount_paid
      FROM Applicants
      ORDER BY id DESC
    `);

    return NextResponse.json(rows);
  } catch (error: any) {
    console.error("GET Error:", error);

    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

// INSERT applicant
export async function POST(req: Request) {
  try {
    const {
      name,
      fatherName,
      email,
      DOB,
      phone,
      Address,
      course,
      Qualification,
      payment_status,
      amount_paid,
    } = await req.json();

    if (!name || !fatherName || !email) {
      return NextResponse.json(
        { error: "Required fields are missing" },
        { status: 400 }
      );
    }

    const [idRows]: any = await db.query(
      "SELECT COALESCE(MAX(id),0) + 1 AS nextId FROM Applicants"
    );

    const nextId = idRows[0].nextId;

    const statusValue = payment_status || "Pending";
    const amountPaidValue = amount_paid !== undefined ? amount_paid : 2000;

    await db.execute(
      `
      INSERT INTO Applicants
      (
        id,
        name,
        fatherName,
        email,
        DOB,
        phone,
        Address,
        course,
        Qualification,
        payment_status,
        amount_paid
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        nextId,
        name,
        fatherName,
        email,
        DOB,
        phone,
        Address,
        course,
        Qualification,
        statusValue,
        amountPaidValue,
      ]
    );

    return NextResponse.json({
      success: true,
      applicant: {
        id: nextId,
        name,
        fatherName,
        email,
        DOB,
        phone,
        Address,
        course,
        Qualification,
        payment_status: statusValue,
        amount_paid: amountPaidValue,
      },
    });
  } catch (error: any) {
    console.error("POST Error:", error);

    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

// PATCH/UPDATE applicant (e.g. for markings fees paid)
export async function PATCH(req: Request) {
  try {
    const { id, payment_status, amount_paid } = await req.json();

    if (!id) {
      return NextResponse.json(
        { error: "Applicant ID is required" },
        { status: 400 }
      );
    }

    const updates: string[] = [];
    const values: any[] = [];

    if (payment_status !== undefined) {
      updates.push("payment_status = ?");
      values.push(payment_status);
    }

    if (amount_paid !== undefined) {
      updates.push("amount_paid = ?");
      values.push(amount_paid);
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { error: "No fields to update" },
        { status: 400 }
      );
    }

    values.push(id);

    await db.execute(
      `UPDATE Applicants SET ${updates.join(", ")} WHERE id = ?`,
      values
    );

    return NextResponse.json({
      success: true,
      message: "Student records updated successfully.",
    });
  } catch (error: any) {
    console.error("PATCH Error:", error);

    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}