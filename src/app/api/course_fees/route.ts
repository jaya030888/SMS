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

// GET all courses
export async function GET() {
  try {
    const [rows] = await db.query("SELECT * FROM course_fees ORDER BY course ASC");
    return NextResponse.json(rows);
  } catch (error: any) {
    console.error("GET course-fees Error:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

// POST create a new course structure
export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const {
      course,
      tuition_fee,
      lab_fee,
      library_fee,
      exam_fee,
      development_fee,
    } = await req.json();

    if (!course) {
      return NextResponse.json(
        { error: "Course name is required." },
        { status: 400 }
      );
    }

    const tFee = Number(tuition_fee) || 0;
    const lFee = Number(lab_fee) || 0;
    const libFee = Number(library_fee) || 0;
    const exFee = Number(exam_fee) || 0;
    const devFee = Number(development_fee) || 0;
    const totalFee = tFee + lFee + libFee + exFee + devFee;

    await db.execute(
      `INSERT INTO course_fees 
       (course, tuition_fee, lab_fee, library_fee, exam_fee, development_fee, total_fee) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [course.trim(), tFee, lFee, libFee, exFee, devFee, totalFee]
    );

    return NextResponse.json({
      success: true,
      message: "Course created successfully.",
      course: { course, tuition_fee: tFee, lab_fee: lFee, library_fee: libFee, exam_fee: exFee, development_fee: devFee, total_fee: totalFee }
    });
  } catch (error: any) {
    console.error("POST course-fees Error:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

// PATCH update course fees
export async function PATCH(req: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const {
      course,
      tuition_fee,
      lab_fee,
      library_fee,
      exam_fee,
      development_fee,
    } = await req.json();

    if (!course) {
      return NextResponse.json(
        { error: "Course name is required." },
        { status: 400 }
      );
    }

    const tFee = Number(tuition_fee) || 0;
    const lFee = Number(lab_fee) || 0;
    const libFee = Number(library_fee) || 0;
    const exFee = Number(exam_fee) || 0;
    const devFee = Number(development_fee) || 0;
    const totalFee = tFee + lFee + libFee + exFee + devFee;

    await db.execute(
      `UPDATE course_fees 
       SET tuition_fee = ?, lab_fee = ?, library_fee = ?, exam_fee = ?, development_fee = ?, total_fee = ?
       WHERE course = ?`,
      [tFee, lFee, libFee, exFee, devFee, totalFee, course]
    );

    return NextResponse.json({
      success: true,
      message: "Course fees updated successfully.",
    });
  } catch (error: any) {
    console.error("PATCH course-fees Error:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

// DELETE a course
export async function DELETE(req: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const course = searchParams.get("course");

    if (!course) {
      return NextResponse.json(
        { error: "Course name is required." },
        { status: 400 }
      );
    }

    await db.execute("DELETE FROM course_fees WHERE course = ?", [course]);

    return NextResponse.json({
      success: true,
      message: "Course deleted successfully.",
    });
  } catch (error: any) {
    console.error("DELETE course-fees Error:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
