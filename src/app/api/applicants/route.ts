import { NextResponse } from "next/server";
import { db } from "../../lib/db";

// GET all or specific applicant with dynamic fee calculation
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    let query = `
      SELECT
        a.id,
        a.name,
        a.fatherName,
        a.email,
        a.DOB,
        a.phone,
        a.Address,
        a.course,
        a.Qualification,
        CAST(COALESCE(SUM(p.amount), 0) AS SIGNED) AS amount_paid,
        CAST(COALESCE(cf.total_fee, 15000) - COALESCE(SUM(p.amount), 0) AS SIGNED) AS remaining_balance,
        CASE
          WHEN (COALESCE(cf.total_fee, 15000) - COALESCE(SUM(p.amount), 0)) <= 0 THEN 'Paid'
          ELSE 'Pending'
        END AS payment_status
      FROM Applicants a
      LEFT JOIN payments p ON a.id = p.student_id AND p.payment_status = 'Success'
      LEFT JOIN course_fees cf ON LOWER(a.course) = LOWER(cf.course)
    `;

    const params: any[] = [];
    if (id) {
      query += ` WHERE a.id = ?`;
      params.push(id);
    }

    query += ` GROUP BY a.id, cf.total_fee ORDER BY a.id DESC`;

    const [rows]: any = await db.query(query, params);

    if (id) {
      if (rows.length === 0) {
        return NextResponse.json({ error: "Student not found" }, { status: 404 });
      }
      return NextResponse.json(rows[0]);
    }

    return NextResponse.json(rows);
  } catch (error: any) {
    console.error("GET Error:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

// INSERT applicant and record registration payment
export async function POST(req: Request) {
  let connection;
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
      amount_paid,
    } = await req.json();

    if (!name || !fatherName || !email) {
      return NextResponse.json(
        { error: "Required fields are missing" },
        { status: 400 }
      );
    }

    connection = await db.getConnection();
    await connection.beginTransaction();

    const [idRows]: any = await connection.query(
      "SELECT COALESCE(MAX(id),0) + 1 AS nextId FROM Applicants"
    );

    const nextId = idRows[0].nextId;
    const amountPaidValue = amount_paid !== undefined ? Number(amount_paid) : 2000;
    const transactionId = `TXN-REG-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    await connection.execute(
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
        Qualification
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
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
      ]
    );

    if (amountPaidValue > 0) {
      await connection.execute(
        `
        INSERT INTO payments (student_id, amount, payment_method, transaction_id, payment_mode, payment_status, remarks)
        VALUES (?, ?, 'UPI', ?, 'Online', 'Success', 'Registration Fee')
        `,
        [nextId, amountPaidValue, transactionId]
      );
    }

    await connection.commit();

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
        payment_status: "Pending",
        amount_paid: amountPaidValue,
      },
    });
  } catch (error: any) {
    console.error("POST Error:", error);
    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackErr) {
        console.error("Rollback failed:", rollbackErr);
      }
    }
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

// PATCH/UPDATE applicant - record remaining balance payment to mark as Paid
export async function PATCH(req: Request) {
  let connection;
  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json(
        { error: "Applicant ID is required" },
        { status: 400 }
      );
    }

    connection = await db.getConnection();
    await connection.beginTransaction();

    // 1. Get the student's course
    const [studentRows]: any = await connection.query(
      "SELECT course FROM Applicants WHERE id = ?",
      [id]
    );

    if (studentRows.length === 0) {
      await connection.rollback();
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }
    const course = studentRows[0].course;

    // 2. Find course total fee
    const [feeRows]: any = await connection.query(
      "SELECT total_fee FROM course_fees WHERE LOWER(course) = LOWER(?)",
      [course]
    );
    const totalFee = feeRows.length > 0 ? feeRows[0].total_fee : 15000;

    // 3. Find current total paid amount
    const [paymentRows]: any = await connection.query(
      "SELECT COALESCE(SUM(amount), 0) AS total_paid FROM payments WHERE student_id = ? AND payment_status = 'Success'",
      [id]
    );
    const totalPaid = Number(paymentRows[0].total_paid);
    const remainingBalance = totalFee - totalPaid;
    const transactionId = `TXN-ADM-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    // 4. Record a new payment for the remaining balance
    if (remainingBalance > 0) {
      await connection.execute(
        `INSERT INTO payments (student_id, amount, payment_method, transaction_id, payment_mode, payment_status, remarks) 
         VALUES (?, ?, 'Cash', ?, 'Offline', 'Success', 'Marked fully paid by admin')`,
        [id, remainingBalance, transactionId]
      );
    }

    await connection.commit();

    return NextResponse.json({
      success: true,
      message: "Student marked as Paid and remaining balance recorded successfully.",
    });
  } catch (error: any) {
    console.error("PATCH Error:", error);
    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackErr) {
        console.error("Rollback failed:", rollbackErr);
      }
    }
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

// DELETE applicant
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Student ID is required" },
        { status: 400 }
      );
    }

    await db.execute("DELETE FROM Applicants WHERE id = ?", [id]);

    return NextResponse.json({
      success: true,
      message: "Student deleted successfully.",
    });
  } catch (error: any) {
    console.error("DELETE Student Error:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
