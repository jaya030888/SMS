// src/app/api/course_fees/route.ts
import { NextResponse } from "next/server";
import { db } from "../../lib/db";
import { requireAdmin } from "../../lib/security";
import { sanitizeText, isValidAmount } from "../../lib/validate";

// GET all courses fee structures
export async function GET() {
  try {
    const [rows]: any = await db.query("SELECT * FROM course_fees ORDER BY course ASC");
    return NextResponse.json(rows);
  } catch (error: any) {
    console.error("GET course-fees Error:", error.message);
    return NextResponse.json(
      { error: "Failed to retrieve course fee breakdown." },
      { status: 500 }
    );
  }
}

// POST create a new course fee structure (Admin only)
export async function POST(req: Request) {
  try {
    const auth = await requireAdmin();
    if (auth.error) return auth.error;

    const {
      course,
      tuition_fee,
      lab_fee,
      library_fee,
      exam_fee,
      development_fee,
    } = await req.json();

    const sCourse = sanitizeText(course);
    if (!sCourse) {
      return NextResponse.json({ error: "Course name is required." }, { status: 400 });
    }

    const tFee = Math.max(0, Number(tuition_fee) || 0);
    const lFee = Math.max(0, Number(lab_fee) || 0);
    const libFee = Math.max(0, Number(library_fee) || 0);
    const exFee = Math.max(0, Number(exam_fee) || 0);
    const devFee = Math.max(0, Number(development_fee) || 0);
    const totalFee = tFee + lFee + libFee + exFee + devFee;

    await db.execute(
      `INSERT INTO course_fees 
       (course, tuition_fee, lab_fee, library_fee, exam_fee, development_fee, total_fee) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [sCourse, tFee, lFee, libFee, exFee, devFee, totalFee]
    );

    return NextResponse.json({
      success: true,
      message: "Course fee structure created successfully.",
      course: { course: sCourse, tuition_fee: tFee, lab_fee: lFee, library_fee: libFee, exam_fee: exFee, development_fee: devFee, total_fee: totalFee }
    }, { status: 201 });
  } catch (error: any) {
    console.error("POST course-fees Error:", error.message);
    return NextResponse.json(
      { error: "Failed to save course fee structure." },
      { status: 500 }
    );
  }
}

// PATCH update course fees (Admin only)
export async function PATCH(req: Request) {
  try {
    const auth = await requireAdmin();
    if (auth.error) return auth.error;

    const {
      course,
      tuition_fee,
      lab_fee,
      library_fee,
      exam_fee,
      development_fee,
    } = await req.json();

    const sCourse = sanitizeText(course);
    if (!sCourse) {
      return NextResponse.json({ error: "Course name is required." }, { status: 400 });
    }

    const tFee = Math.max(0, Number(tuition_fee) || 0);
    const lFee = Math.max(0, Number(lab_fee) || 0);
    const libFee = Math.max(0, Number(library_fee) || 0);
    const exFee = Math.max(0, Number(exam_fee) || 0);
    const devFee = Math.max(0, Number(development_fee) || 0);
    const totalFee = tFee + lFee + libFee + exFee + devFee;

    await db.execute(
      `UPDATE course_fees 
       SET tuition_fee = ?, lab_fee = ?, library_fee = ?, exam_fee = ?, development_fee = ?, total_fee = ?
       WHERE course = ?`,
      [tFee, lFee, libFee, exFee, devFee, totalFee, sCourse]
    );

    return NextResponse.json({
      success: true,
      message: "Course fee structure updated successfully.",
    });
  } catch (error: any) {
    console.error("PATCH course-fees Error:", error.message);
    return NextResponse.json(
      { error: "Failed to update course fee structure." },
      { status: 500 }
    );
  }
}

// DELETE a course fee structure (Admin only)
export async function DELETE(req: Request) {
  try {
    const auth = await requireAdmin();
    if (auth.error) return auth.error;

    const { searchParams } = new URL(req.url);
    const course = searchParams.get("course");

    if (!course) {
      return NextResponse.json({ error: "Course name is required." }, { status: 400 });
    }

    const sCourse = sanitizeText(course);
    await db.execute("DELETE FROM course_fees WHERE course = ?", [sCourse]);

    return NextResponse.json({
      success: true,
      message: "Course fee structure deleted successfully.",
    });
  } catch (error: any) {
    console.error("DELETE course-fees Error:", error.message);
    return NextResponse.json(
      { error: "Failed to delete course fee structure." },
      { status: 500 }
    );
  }
}
