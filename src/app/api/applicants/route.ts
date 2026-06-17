import { NextResponse } from "next/server";
import { db } from "../../lib/db";
import { hashPassword } from "../../lib/auth";
import { cookies } from "next/headers";
import { verifyJWT } from "../../lib/auth-jwt";

// Helper to check authorization and return session payload
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

// GET all or specific applicant with dynamic fee calculation
export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    // Students can only query their own data
    if (session.role === "student" && String(session.studentId) !== String(id)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

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
        a.Enrollment_Date,
        CAST(COALESCE(SUM(p.amount), 0) AS SIGNED) AS amount_paid,
        CAST(COALESCE(cf.total_fee, 0) - COALESCE(SUM(p.amount), 0) AS SIGNED) AS remaining_balance,
        CASE
          WHEN (COALESCE(cf.total_fee, 0) - COALESCE(SUM(p.amount), 0)) <= 0 THEN 'Paid'
          ELSE 'Pending'
        END AS payment_status
      FROM applicants a
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
    console.error("GET Applicants Error:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

// INSERT applicant, generate credentials, and record registration payment
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

    if (!name || !fatherName || !email || !DOB || !phone || !Address || !course || !Qualification) {
      return NextResponse.json(
        { error: "Required fields are missing" },
        { status: 400 }
      );
    }

    connection = await db.getConnection();
    await connection.beginTransaction();

    // 1. Insert into applicants
    const [insertResult]: any = await connection.execute(
      `
      INSERT INTO applicants
      (name, fatherName, email, DOB, phone, Address, course, Qualification, Enrollment_Date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_DATE)
      `,
      [name, fatherName, email, DOB, phone, Address, course, Qualification]
    );

    const studentId = insertResult.insertId;

    // 2. Generate and hash default credentials for student (username: ID, password: "10" + ID)
    const username = String(studentId);
    const passwordText = "10" + username;
    const hashedStudentPassword = hashPassword(passwordText);

    await connection.execute(
      `
      INSERT INTO users (username, password_hash, role, student_id)
      VALUES (?, ?, 'student', ?)
      `,
      [username, hashedStudentPassword, studentId]
    );

    // 3. Record registration payment of 2000 (or amount_paid if specified)
    const amountPaidValue = amount_paid !== undefined ? Number(amount_paid) : 2000;
    const transactionId = `TXN-REG-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    if (amountPaidValue > 0) {
      await connection.execute(
        `
        INSERT INTO payments (student_id, amount, payment_method, transaction_id, payment_mode, payment_status, remarks)
        VALUES (?, ?, 'UPI', ?, 'Online', 'Success', 'Registration Fee')
        `,
        [studentId, amountPaidValue, transactionId]
      );
    }

    await connection.commit();

    return NextResponse.json({
      success: true,
      applicant: {
        id: studentId,
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
    console.error("POST Applicants Error:", error);
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

// PATCH / UPDATE applicant (either editing fields OR marking as paid)
export async function PATCH(req: Request) {
  let connection;
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Student ID is required" },
        { status: 400 }
      );
    }

    connection = await db.getConnection();
    await connection.beginTransaction();

    // Check if student exists
    const [studentRows]: any = await connection.query(
      "SELECT course FROM applicants WHERE id = ?",
      [id]
    );

    if (studentRows.length === 0) {
      await connection.rollback();
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    // Determine if it is a Profile Edit OR a Mark Paid operation
    if (body.payment_status === "Paid") {
      // Mark Paid operation
      const course = studentRows[0].course;

      // Find course total fee
      const [feeRows]: any = await connection.query(
        "SELECT total_fee FROM course_fees WHERE LOWER(course) = LOWER(?)",
        [course]
      );
      const totalFee = feeRows.length > 0 ? feeRows[0].total_fee : 15000;

      // Find current total paid amount
      const [paymentRows]: any = await connection.query(
        "SELECT COALESCE(SUM(amount), 0) AS total_paid FROM payments WHERE student_id = ? AND payment_status = 'Success'",
        [id]
      );
      const totalPaid = Number(paymentRows[0].total_paid);
      const remainingBalance = totalFee - totalPaid;
      const transactionId = `TXN-ADM-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

      if (remainingBalance > 0) {
        await connection.execute(
          `INSERT INTO payments (student_id, amount, payment_method, transaction_id, payment_mode, payment_status, remarks) 
           VALUES (?, ?, 'Cash', ?, 'Offline', 'Success', 'Marked fully paid by admin')`,
          [id, remainingBalance, transactionId]
        );
      }
    } else {
      // Profile edit operation
      const { name, fatherName, email, DOB, phone, Address, course, Qualification } = body;

      if (!name || !fatherName || !email || !DOB || !phone || !Address || !course || !Qualification) {
        await connection.rollback();
        return NextResponse.json({ error: "All profile fields are required for updates" }, { status: 400 });
      }

      await connection.execute(
        `
        UPDATE applicants
        SET name = ?, fatherName = ?, email = ?, DOB = ?, phone = ?, Address = ?, course = ?, Qualification = ?
        WHERE id = ?
        `,
        [name, fatherName, email, DOB, phone, Address, course, Qualification, id]
      );
    }

    await connection.commit();

    return NextResponse.json({
      success: true,
      message: "Student record updated successfully.",
    });
  } catch (error: any) {
    console.error("PATCH Applicants Error:", error);
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
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Student ID is required" },
        { status: 400 }
      );
    }

    await db.execute("DELETE FROM applicants WHERE id = ?", [id]);

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