// src/app/api/teachers/route.ts
import { NextResponse } from "next/server";
import { erpStore } from "../../lib/mockData";
import { requireAuth, requireAdmin } from "../../lib/security";
import { isValidEmail, isValidId, isValidPhone, sanitizeText } from "../../lib/validate";

export async function GET(req: Request) {
  try {
    const auth = await requireAuth();
    if (auth.error) return auth.error;

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const department = searchParams.get("department");

    let teachers = erpStore.getTeachers();

    if (id) {
      if (!isValidId(id)) {
        return NextResponse.json({ error: "Invalid teacher ID parameter" }, { status: 400 });
      }
      const teacher = teachers.find(t => t.id === Number(id));
      if (!teacher) {
        return NextResponse.json({ error: "Teacher record not found" }, { status: 404 });
      }
      return NextResponse.json(teacher);
    }

    if (department) {
      const sanitizedDept = sanitizeText(department);
      teachers = teachers.filter(t => t.department.toLowerCase().includes(sanitizedDept.toLowerCase()));
    }

    return NextResponse.json(teachers);
  } catch (error: any) {
    console.error("GET Teachers Error:", error.message);
    return NextResponse.json({ error: "Failed to retrieve instructor directory." }, { status: 500 });
  }
}

// POST new teacher: strictly Admin only
export async function POST(req: Request) {
  try {
    const auth = await requireAdmin();
    if (auth.error) return auth.error;

    const body = await req.json();
    const { name, email, phone, department, designation, qualification, experience } = body;

    const sName = sanitizeText(name);
    const sDept = sanitizeText(department);
    const sDesig = sanitizeText(designation || "Senior Instructor");
    const sQual = sanitizeText(qualification || "B.Tech / Diploma");
    const sExp = sanitizeText(experience || "1 Year");

    if (!sName || !isValidEmail(email) || !sDept) {
      return NextResponse.json({ error: "Valid name, email, and department are required." }, { status: 400 });
    }

    if (phone && !isValidPhone(phone)) {
      return NextResponse.json({ error: "Invalid phone number format." }, { status: 400 });
    }

    const employee_id = `EMP-MG-${Math.floor(100 + Math.random() * 900)}`;
    const newTeacher = erpStore.addTeacher({
      employee_id,
      name: sName,
      email: email.trim().toLowerCase(),
      phone: phone ? String(phone).trim() : "",
      department: sDept,
      designation: sDesig,
      qualification: sQual,
      experience: sExp,
      assigned_courses: [sDept],
      assigned_batches: ["2024-2026"],
      joining_date: new Date().toISOString().split("T")[0],
      status: "Active"
    });

    return NextResponse.json({ success: true, teacher: newTeacher }, { status: 201 });
  } catch (error: any) {
    console.error("POST Teachers Error:", error.message);
    return NextResponse.json({ error: "Failed to onboard instructor." }, { status: 500 });
  }
}

// PUT update teacher: strictly Admin only
export async function PUT(req: Request) {
  try {
    const auth = await requireAdmin();
    if (auth.error) return auth.error;

    const body = await req.json();
    if (!body.id || !isValidId(body.id)) {
      return NextResponse.json({ error: "Valid Teacher ID is required" }, { status: 400 });
    }

    const updated = erpStore.updateTeacher(Number(body.id), {
      name: body.name ? sanitizeText(body.name) : undefined,
      phone: body.phone ? String(body.phone).trim() : undefined,
      department: body.department ? sanitizeText(body.department) : undefined,
      designation: body.designation ? sanitizeText(body.designation) : undefined,
      qualification: body.qualification ? sanitizeText(body.qualification) : undefined,
      experience: body.experience ? sanitizeText(body.experience) : undefined,
      status: body.status === "Inactive" ? "Inactive" : "Active"
    });

    if (!updated) {
      return NextResponse.json({ error: "Teacher record not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, teacher: updated });
  } catch (error: any) {
    console.error("PUT Teachers Error:", error.message);
    return NextResponse.json({ error: "Failed to update instructor record." }, { status: 500 });
  }
}

// DELETE teacher: strictly Admin only
export async function DELETE(req: Request) {
  try {
    const auth = await requireAdmin();
    if (auth.error) return auth.error;

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id || !isValidId(id)) {
      return NextResponse.json({ error: "Valid Teacher ID is required" }, { status: 400 });
    }

    erpStore.deleteTeacher(Number(id));
    return NextResponse.json({ success: true, message: "Instructor record removed successfully." });
  } catch (error: any) {
    console.error("DELETE Teachers Error:", error.message);
    return NextResponse.json({ error: "Failed to delete instructor record." }, { status: 500 });
  }
}
