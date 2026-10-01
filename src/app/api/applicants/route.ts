// src/app/api/applicants/route.ts
import { NextResponse } from "next/server";
import { db } from "../../lib/db";
import { hashPassword } from "../../lib/auth";
import { requireAuth, requireAdmin, canAccessStudentData } from "../../lib/security";
import { 
  sanitizeText, 
  isValidEmail, 
  isValidPhone, 
  isValidId, 
  isValidDate, 
  isValidImageData 
} from "../../lib/validate";

// GET all or specific applicant with dynamic fee calculation & IDOR protection
export async function GET(req: Request) {
  try {
    const auth = await requireAuth();
    if (auth.error) return auth.error;
    const session = auth.user;

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    // IDOR Protection: Students can only query their own record
    if (session.role === "student") {
      const studentId = id || String(session.studentId);
      if (String(session.studentId) !== String(studentId)) {
        return NextResponse.json({ error: "Forbidden. Cannot access other student profiles." }, { status: 403 });
      }
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
        a.profile_photo,
        CAST(COALESCE(SUM(p.amount), 0) AS INTEGER) AS amount_paid,
        CAST(COALESCE(cf.total_fee, 15000) - COALESCE(SUM(p.amount), 0) AS INTEGER) AS remaining_balance,
        CASE
          WHEN (COALESCE(cf.total_fee, 15000) - COALESCE(SUM(p.amount), 0)) <= 0 THEN 'Paid'
          ELSE 'Pending'
        END AS payment_status
      FROM applicants a
      LEFT JOIN payments p ON a.id = p.student_id AND p.payment_status = 'Success'
      LEFT JOIN course_fees cf ON LOWER(a.course) = LOWER(cf.course)
    `;

    const params: any[] = [];
    const targetId = session.role === "student" ? session.studentId : id;

    if (targetId) {
      if (!isValidId(targetId)) {
        return NextResponse.json({ error: "Invalid student ID parameter" }, { status: 400 });
      }
      query += ` WHERE a.id = ?`;
      params.push(Number(targetId));
    }

    query += ` GROUP BY a.id, a.profile_photo, cf.total_fee ORDER BY a.id DESC LIMIT 500`;

    const [rows]: any = await db.query(query, params);

    if (targetId) {
      if (!rows || rows.length === 0) {
        return NextResponse.json({ error: "Student record not found" }, { status: 404 });
      }
      return NextResponse.json(rows[0]);
    }

    return NextResponse.json(rows);
  } catch (error: any) {
    console.error("GET Applicants Error:", error.message);
    return NextResponse.json(
      { error: "Failed to retrieve student records." },
      { status: 500 }
    );
  }
}

// INSERT applicant, generate credentials, and record registration payment
export async function POST(req: Request) {
  let connection;
  try {
    const auth = await requireAuth();
    // Allow admins or instructors to register students
    if (auth.error) {
      // If unauthenticated admission form submission
    }

    const body = await req.json();
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
      profile_photo,
    } = body;

    // Strict Input Validation & Sanitization
    const sanitizedName = sanitizeText(name);
    const sanitizedFather = sanitizeText(fatherName);
    const sanitizedAddress = sanitizeText(Address);
    const sanitizedCourse = sanitizeText(course);
    const sanitizedQual = sanitizeText(Qualification);

    if (!sanitizedName || !sanitizedFather || !email || !DOB || !phone || !sanitizedAddress || !sanitizedCourse || !sanitizedQual) {
      return NextResponse.json({ error: "All required registration fields must be provided." }, { status: 400 });
    }

    if (!isValidEmail(email)) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    }

    if (!isValidPhone(phone)) {
      return NextResponse.json({ error: "Please enter a valid phone number (10-15 digits)." }, { status: 400 });
    }

    if (!isValidDate(DOB)) {
      return NextResponse.json({ error: "Invalid date of birth format." }, { status: 400 });
    }

    if (profile_photo && !isValidImageData(profile_photo)) {
      return NextResponse.json({ error: "Invalid profile photo data or image exceeds 2MB limit." }, { status: 400 });
    }

    connection = await db.getConnection();
    await connection.beginTransaction();

    // 1. Insert into applicants table
    const [insertResult]: any = await connection.execute(
      `
      INSERT INTO applicants
      (name, fatherName, email, DOB, phone, Address, course, Qualification, Enrollment_Date, profile_photo)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_DATE, ?) RETURNING id
      `,
      [sanitizedName, sanitizedFather, email.trim().toLowerCase(), DOB, String(phone).trim(), sanitizedAddress, sanitizedCourse, sanitizedQual, profile_photo || null]
    );

    const studentId = insertResult.insertId;

    // 2. Generate and hash default credentials for student
    const username = String(studentId);
    const defaultPin = String(100 + Number(studentId));
    const hashedStudentPassword = hashPassword(defaultPin);

    await connection.execute(
      `
      INSERT INTO users (username, password_hash, role, student_id, name)
      VALUES (?, ?, 'student', ?, ?)
      `,
      [username, hashedStudentPassword, studentId, sanitizedName]
    );

    // 3. Record registration fee payment
    const amountPaidValue = amount_paid !== undefined ? Math.max(0, Number(amount_paid)) : 2000;
    const transactionId = `TXN-REG-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    if (amountPaidValue > 0) {
      await connection.execute(
        `
        INSERT INTO payments (student_id, amount, payment_method, transaction_id, payment_mode, payment_status, remarks)
        VALUES (?, ?, 'UPI', ?, 'Online', 'Success', 'Registration Admission Fee')
        `,
        [studentId, amountPaidValue, transactionId]
      );
    }

    await connection.commit();

    return NextResponse.json({
      success: true,
      applicant: {
        id: studentId,
        name: sanitizedName,
        fatherName: sanitizedFather,
        email: email.trim().toLowerCase(),
        DOB,
        phone: String(phone).trim(),
        Address: sanitizedAddress,
        course: sanitizedCourse,
        Qualification: sanitizedQual,
        payment_status: "Pending",
        amount_paid: amountPaidValue,
      },
    }, { status: 201 });
  } catch (error: any) {
    console.error("POST Applicants Error:", error.message);
    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackErr) {
        console.error("Rollback failed:", rollbackErr);
      }
    }
    return NextResponse.json(
      { error: "Failed to register student record." },
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
    const auth = await requireAuth();
    if (auth.error) return auth.error;
    const session = auth.user;

    const body = await req.json();
    const { id, profile_photo, payment_status } = body;

    if (!id || !isValidId(id)) {
      return NextResponse.json({ error: "Valid Student ID is required" }, { status: 400 });
    }

    // Authorization: Students can ONLY update their own profile photo
    if (session.role === "student") {
      if (String(session.studentId) !== String(id)) {
        return NextResponse.json({ error: "Forbidden. Cannot modify another student's profile." }, { status: 403 });
      }
      if (payment_status !== undefined) {
        return NextResponse.json({ error: "Forbidden. Students cannot modify payment status." }, { status: 403 });
      }
    } else if (session.role !== "admin") {
      return NextResponse.json({ error: "Forbidden. Administrative access required." }, { status: 403 });
    }

    connection = await db.getConnection();
    await connection.beginTransaction();

    // Check if student exists
    const [studentRows]: any = await connection.query(
      "SELECT course FROM applicants WHERE id = ?",
      [Number(id)]
    );

    if (!studentRows || studentRows.length === 0) {
      await connection.rollback();
      return NextResponse.json({ error: "Student record not found" }, { status: 404 });
    }

    // Determine if it is a Mark Paid operation (Admin only)
    if (payment_status === "Paid" && session.role === "admin") {
      const course = studentRows[0].course;

      const [feeRows]: any = await connection.query(
        "SELECT total_fee FROM course_fees WHERE LOWER(course) = LOWER(?)",
        [course]
      );
      const totalFee = feeRows && feeRows.length > 0 ? Number(feeRows[0].total_fee) : 15000;

      const [paymentRows]: any = await connection.query(
        "SELECT COALESCE(SUM(amount), 0) AS total_paid FROM payments WHERE student_id = ? AND payment_status = 'Success'",
        [Number(id)]
      );
      const totalPaid = paymentRows && paymentRows.length > 0 ? Number(paymentRows[0].total_paid) : 0;
      const remainingBalance = totalFee - totalPaid;
      const transactionId = `TXN-ADM-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

      if (remainingBalance > 0) {
        await connection.execute(
          `INSERT INTO payments (student_id, amount, payment_method, transaction_id, payment_mode, payment_status, remarks) 
           VALUES (?, ?, 'Cash', ?, 'Offline', 'Success', 'Marked fully paid by admin')`,
          [Number(id), remainingBalance, transactionId]
        );
      }
    } else if (profile_photo !== undefined) {
      // Profile photo update
      if (!isValidImageData(profile_photo)) {
        await connection.rollback();
        return NextResponse.json({ error: "Invalid photo format or file exceeds 2MB limit." }, { status: 400 });
      }
      await connection.execute(
        "UPDATE applicants SET profile_photo = ? WHERE id = ?",
        [profile_photo, Number(id)]
      );
    } else if (body.documents_status !== undefined || body.aadhaar_status !== undefined || body.verify_all === true) {
      // Document Verification & Status Update (Admin only)
      if (session.role !== "admin") {
        await connection.rollback();
        return NextResponse.json({ error: "Forbidden. Admin verification required." }, { status: 403 });
      }

      const {
        documents_status,
        aadhaar_status,
        marksheet_10th_status,
        marksheet_12th_status,
        tc_status,
        category_cert_status,
        doc_remarks,
        aadhaar_no,
        marksheet_10th_roll
      } = body;

      const docStatus = documents_status || "Verified";
      const aadhStatus = aadhaar_status || "Verified";
      const m10Status = marksheet_10th_status || "Verified";
      const m12Status = marksheet_12th_status || "Verified";
      const tcStatus = tc_status || "Verified";
      const remarks = doc_remarks ? sanitizeText(doc_remarks) : "Documents verified by Admin";

      await connection.execute(
        `UPDATE applicants 
         SET documents_status = ?, aadhaar_status = ?, marksheet_10th_status = ?, marksheet_12th_status = ?, tc_status = ?, doc_remarks = ?
         WHERE id = ?`,
        [docStatus, aadhStatus, m10Status, m12Status, tcStatus, remarks, Number(id)]
      );
    } else {
      // Profile detail edits (Admin only)
      if (session.role !== "admin") {
        await connection.rollback();
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }

      const { name, fatherName, email, DOB, phone, Address, course, Qualification, aadhaar_no, blood_group, gender } = body;
      const sName = sanitizeText(name);
      const sFather = sanitizeText(fatherName);
      const sAddr = sanitizeText(Address);
      const sCourse = sanitizeText(course);
      const sQual = sanitizeText(Qualification);

      if (!sName || !sFather || !isValidEmail(email) || !isValidDate(DOB) || !isValidPhone(phone)) {
        await connection.rollback();
        return NextResponse.json({ error: "Invalid profile data provided." }, { status: 400 });
      }

      await connection.execute(
        `
        UPDATE applicants
        SET name = ?, fatherName = ?, email = ?, DOB = ?, phone = ?, Address = ?, course = ?, Qualification = ?
        WHERE id = ?
        `,
        [sName, sFather, email.trim().toLowerCase(), DOB, String(phone).trim(), sAddr, sCourse, sQual, Number(id)]
      );
    }

    await connection.commit();

    return NextResponse.json({
      success: true,
      message: "Student record updated successfully.",
    });
  } catch (error: any) {
    console.error("PATCH Applicants Error:", error.message);
    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackErr) {
        console.error("Rollback failed:", rollbackErr);
      }
    }
    return NextResponse.json(
      { error: "Failed to update student record." },
      { status: 500 }
    );
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

// DELETE applicant (Admin only)
export async function DELETE(req: Request) {
  try {
    const auth = await requireAdmin();
    if (auth.error) return auth.error;

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id || !isValidId(id)) {
      return NextResponse.json({ error: "Valid Student ID is required" }, { status: 400 });
    }

    await db.execute("DELETE FROM applicants WHERE id = ?", [Number(id)]);

    return NextResponse.json({
      success: true,
      message: "Student profile and credentials deleted successfully.",
    });
  } catch (error: any) {
    console.error("DELETE Student Error:", error.message);
    return NextResponse.json(
      { error: "Failed to delete student record." },
      { status: 500 }
    );
  }
}