import { NextResponse } from "next/server";
import { db } from "../../lib/db";

export async function GET() {
  try {
    const [rows] = await db.query("SELECT * FROM course_fees");
    return NextResponse.json(rows);
  } catch (error: any) {
    console.error("GET course-fees Error:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
