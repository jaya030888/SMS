import { NextResponse } from "next/server";
import { db } from "../../lib/db";

// GET all applicants
export async function GET() {
  try {
    const [rows] = await db.query(`
      SELECT
        id,
        name,
        fatherName,
        email,
        DOB,
        phone,
        Address,
        course,
        Qualification
      FROM Applicants
      ORDER BY id DESC
    `);

    return NextResponse.json(rows);
  } catch (error: any) {
    console.error("GET Error:", error);

    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

// INSERT applicant
export async function POST(req: Request) {
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
    } = await req.json();

    if (!name || !fatherName || !email) {
      return NextResponse.json(
        { error: "Required fields are missing" },
        { status: 400 }
      );
    }

    const [idRows]: any = await db.query(
      "SELECT COALESCE(MAX(id),0) + 1 AS nextId FROM Applicants"
    );

    const nextId = idRows[0].nextId;

    await db.execute(
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
      },
    });
  } catch (error: any) {
    console.error("POST Error:", error);

    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}