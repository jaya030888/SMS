// src/app/api/marksheets/route.ts
import { NextResponse } from "next/server";
import { requireAuth, canAccessStudentData } from "@/src/app/lib/security";
import { erpStore } from "@/src/app/lib/mockData";

export async function GET(req: Request) {
  try {
    const auth = await requireAuth();
    if (auth.error) return auth.error;

    const { searchParams } = new URL(req.url);
    const studentIdParam = searchParams.get("student_id");

    let targetStudentId: number | undefined;

    if (auth.user.role === "student") {
      targetStudentId = auth.user.studentId || 1;
    } else if (studentIdParam) {
      targetStudentId = Number(studentIdParam);
    }

    if (targetStudentId && !canAccessStudentData(auth.user, targetStudentId)) {
      return NextResponse.json({ error: "Access denied to marksheet." }, { status: 403 });
    }

    const marksheets = erpStore.getMarksheets(targetStudentId);
    return NextResponse.json(marksheets);
  } catch (error) {
    console.error("GET /api/marksheets error:", error);
    return NextResponse.json({ error: "Failed to fetch published marksheets." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const auth = await requireAuth();
    if (auth.error) return auth.error;

    const body = await req.json();
    const { action, marksheet_id } = body;

    // Student accepts published marksheet
    if (action === "accept") {
      const studentId = auth.user.role === "student" ? (auth.user.studentId || 1) : Number(body.student_id || 1);
      const updated = erpStore.acceptMarksheet(Number(marksheet_id), studentId);
      if (!updated) {
        return NextResponse.json({ error: "Marksheet not found or not eligible for acceptance." }, { status: 404 });
      }
      return NextResponse.json({ success: true, marksheet: updated });
    }

    // Admin publishes a marksheet
    if (action === "publish") {
      if (auth.user.role !== "admin") {
        return NextResponse.json({ error: "Only administrators can publish marksheets." }, { status: 403 });
      }
      const newM = erpStore.publishMarksheet(body.marksheet);
      return NextResponse.json({ success: true, marksheet: newM }, { status: 201 });
    }

    return NextResponse.json({ error: "Invalid action." }, { status: 400 });
  } catch (error) {
    console.error("POST /api/marksheets error:", error);
    return NextResponse.json({ error: "Failed to process marksheet action." }, { status: 500 });
  }
}
