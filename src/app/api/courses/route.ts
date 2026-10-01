// src/app/api/courses/route.ts
import { NextResponse } from "next/server";
import { erpStore } from "../../lib/mockData";
import { requireAdmin } from "../../lib/security";
import { sanitizeText } from "../../lib/validate";

export async function GET() {
  try {
    const courses = erpStore.getCourses();
    return NextResponse.json(courses);
  } catch (error: any) {
    console.error("GET Courses Error:", error.message);
    return NextResponse.json({ error: "Failed to fetch courses" }, { status: 500 });
  }
}

// POST create course: strictly Admin only
export async function POST(req: Request) {
  try {
    const auth = await requireAdmin();
    if (auth.error) return auth.error;

    const body = await req.json();
    const { name, code, duration, seats, hod, description } = body;

    const sName = sanitizeText(name);
    const sCode = sanitizeText(code);

    if (!sName || !sCode) {
      return NextResponse.json({ error: "Course name and course code are required." }, { status: 400 });
    }

    const newCourse = erpStore.addCourse({
      code: sCode.toUpperCase(),
      name: sName,
      duration: sanitizeText(duration || "2 Years / 4 Semesters"),
      seats: Math.max(1, Math.min(500, Number(seats) || 40)),
      enrolled: 0,
      hod: sanitizeText(hod || "Senior Instructor"),
      description: sanitizeText(description || ""),
      batches: ["2024-2026"],
      semesters: 4
    });

    return NextResponse.json({ success: true, course: newCourse }, { status: 201 });
  } catch (error: any) {
    console.error("POST Courses Error:", error.message);
    return NextResponse.json({ error: "Failed to create trade course structure." }, { status: 500 });
  }
}
