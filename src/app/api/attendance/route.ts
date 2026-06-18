import { NextResponse } from "next/server";
import { db } from "../../lib/db";

// Ensure table exists on initialization
async function ensureAttendanceTable() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS attendance (
      id INT AUTO_INCREMENT PRIMARY KEY,
      student_id INT NOT NULL,
      status VARCHAR(10) NOT NULL, -- 'Present' or 'Absent'
      date DATE NOT NULL,
      remarks VARCHAR(255) NULL,
      FOREIGN KEY (student_id) REFERENCES applicants(id) ON DELETE CASCADE,
      UNIQUE KEY uniq_student_date (student_id, date)
    )
  `);
}

// GET attendance records
export async function GET(req: Request) {
  try {
    await ensureAttendanceTable();
    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get("student_id");
    const date = searchParams.get("date");
    const course = searchParams.get("course");

    // Case 1: Get logs for a specific student
    if (studentId) {
      const [rows]: any = await db.query(
        "SELECT id, status, DATE_FORMAT(date, '%Y-%m-%d') as date, remarks FROM attendance WHERE student_id = ? ORDER BY date DESC",
        [studentId]
      );
      
      const total = rows.length;
      const present = rows.filter((r: any) => r.status === "Present").length;
      const absent = total - present;
      const rate = total > 0 ? Math.round((present / total) * 100) : null;

      return NextResponse.json({
        logs: rows,
        summary: {
          total,
          present,
          absent,
          rate
        }
      });
    }

    // Case 2: Get logs for admin portal (date + course)
    if (date && course) {
      // Get all students enrolled in the course
      const [students]: any = await db.query(
        "SELECT id, name FROM applicants WHERE LOWER(course) = LOWER(?) ORDER BY name ASC",
        [course]
      );

      // Get logged attendance for that date
      const [attendanceRows]: any = await db.query(
        "SELECT student_id, status FROM attendance WHERE date = ?",
        [date]
      );

      // Map logged status to student records
      const attendanceMap = new Map();
      attendanceRows.forEach((r: any) => {
        attendanceMap.set(r.student_id, r.status);
      });

      const records = students.map((s: any) => ({
        student_id: s.id,
        name: s.name,
        status: attendanceMap.get(s.id) || "Present" // Default to Present if not logged yet
      }));

      return NextResponse.json(records);
    }

    return NextResponse.json(
      { error: "Missing parameters. Provide student_id OR (date and course)" },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("GET Attendance Error:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

// POST/Save bulk attendance records
export async function POST(req: Request) {
  try {
    await ensureAttendanceTable();
    const { date, attendance } = await req.json();

    if (!date || !attendance || !Array.isArray(attendance)) {
      return NextResponse.json(
        { error: "Required fields 'date' and 'attendance' array are missing." },
        { status: 400 }
      );
    }

    // Insert or update attendance records
    for (const record of attendance) {
      const { student_id, status } = record;
      if (!student_id || !status) continue;

      await db.execute(
        `INSERT INTO attendance (student_id, status, date)
         VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE status = VALUES(status)`,
        [student_id, status, date]
      );
    }

    return NextResponse.json({
      success: true,
      message: "Attendance recorded successfully."
    });
  } catch (error: any) {
    console.error("POST Attendance Error:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
