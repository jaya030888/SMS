// setup-db.js
const { Client } = require('pg');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env if it exists
if (fs.existsSync('.env')) {
  const envConfig = fs.readFileSync('.env', 'utf-8');
  envConfig.split('\n').forEach(line => {
    const parts = line.split('=');
    if (parts.length > 1) {
      const key = parts[0].trim();
      const val = parts.slice(1).join('=').trim().replace(/^['"]|['"]$/g, '');
      process.env[key] = val;
    }
  });
}

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

function getSSLConfig(connStr) {
  if (!connStr) return false;
  if (connStr.includes('localhost') || connStr.includes('127.0.0.1')) {
    return process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false;
  }
  return { rejectUnauthorized: false };
}

async function main() {
  let connection;
  try {
    const connectionString = 
      process.env.DATABASE_URL || 
      process.env.POSTGRES_URL || 
      process.env.POSTGRES_PRISMA_URL || 
      process.env.POSTGRES_URL_NON_POOLING ||
      process.env.DATABASE_PRIVATE_URL;

    if (!connectionString) {
      console.warn("⚠️ No DATABASE_URL or POSTGRES_URL configured. Skipping database migration. Application will run in in-memory fallback mode.");
      return;
    }

    connection = new Client({
      connectionString,
      ssl: getSSLConfig(connectionString),
      connectionTimeoutMillis: 8000
    });
    
    await connection.connect();

    console.log("Connected to PostgreSQL database successfully.");

    // 0. DROP OBSOLETE TABLES (attendance, marks, notices, timetable)
    await connection.query(`
      DROP TABLE IF EXISTS attendance CASCADE;
      DROP TABLE IF EXISTS marks CASCADE;
      DROP TABLE IF EXISTS notices CASCADE;
      DROP TABLE IF EXISTS timetable CASCADE;
      DROP TABLE IF EXISTS schedule CASCADE;
    `);
    console.log("Dropped obsolete tables (attendance, marks, notices, timetable) and related constraints.");

    // 1. Create course_fees table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS course_fees (
        course VARCHAR(50) PRIMARY KEY,
        tuition_fee INT NOT NULL DEFAULT 0,
        lab_fee INT NOT NULL DEFAULT 0,
        library_fee INT NOT NULL DEFAULT 0,
        exam_fee INT NOT NULL DEFAULT 0,
        development_fee INT NOT NULL DEFAULT 0,
        total_fee INT NOT NULL DEFAULT 0
      )
    `);
    console.log("Table 'course_fees' verified/created.");

    // Seed course fees
    const feeStructures = [
      { course: 'COPA', tuition_fee: 10000, lab_fee: 1500, library_fee: 500, exam_fee: 1000, development_fee: 500, total_fee: 13500 },
      { course: 'Electrician', tuition_fee: 15000, lab_fee: 2500, library_fee: 1000, exam_fee: 1500, development_fee: 1000, total_fee: 21000 },
      { course: 'Fitter', tuition_fee: 14000, lab_fee: 2000, library_fee: 1000, exam_fee: 1500, development_fee: 1000, total_fee: 19500 }
    ];

    for (let f of feeStructures) {
      await connection.query(`
        INSERT INTO course_fees (course, tuition_fee, lab_fee, library_fee, exam_fee, development_fee, total_fee)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (course) DO UPDATE SET
          tuition_fee = EXCLUDED.tuition_fee,
          lab_fee = EXCLUDED.lab_fee,
          library_fee = EXCLUDED.library_fee,
          exam_fee = EXCLUDED.exam_fee,
          development_fee = EXCLUDED.development_fee,
          total_fee = EXCLUDED.total_fee
      `, [f.course, f.tuition_fee, f.lab_fee, f.library_fee, f.exam_fee, f.development_fee, f.total_fee]);
    }
    console.log("Course fees seeded successfully.");

    // 2. Courses Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS courses (
        id SERIAL PRIMARY KEY,
        code VARCHAR(50) UNIQUE NOT NULL,
        name VARCHAR(100) NOT NULL,
        duration VARCHAR(50) NOT NULL,
        seats INT NOT NULL DEFAULT 40,
        enrolled INT NOT NULL DEFAULT 0,
        hod VARCHAR(100) NOT NULL,
        description TEXT,
        batches TEXT[] DEFAULT ARRAY['2024-2026']::TEXT[],
        semesters INT NOT NULL DEFAULT 2
      )
    `);
    console.log("Table 'courses' verified/created.");

    // 3. Teachers Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS teachers (
        id SERIAL PRIMARY KEY,
        employee_id VARCHAR(50) UNIQUE NOT NULL,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        phone VARCHAR(20) NOT NULL,
        department VARCHAR(100) NOT NULL,
        designation VARCHAR(100) NOT NULL,
        qualification VARCHAR(100) NOT NULL,
        experience VARCHAR(50) NOT NULL,
        assigned_courses TEXT[] DEFAULT ARRAY[]::TEXT[],
        assigned_batches TEXT[] DEFAULT ARRAY[]::TEXT[],
        joining_date DATE DEFAULT CURRENT_DATE,
        status VARCHAR(20) DEFAULT 'Active'
      )
    `);
    console.log("Table 'teachers' verified/created.");

    // 4. Applicants / Students Table (with document verification + multi-contact support)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS applicants (
        id SERIAL PRIMARY KEY,
        roll_no VARCHAR(50) UNIQUE,
        name VARCHAR(100) NOT NULL,
        "fatherName" VARCHAR(100) NOT NULL,
        "motherName" VARCHAR(100) NULL,
        email VARCHAR(100) NOT NULL,
        alt_email VARCHAR(100) NULL,
        "DOB" DATE NOT NULL,
        phone VARCHAR(20) NOT NULL,
        alt_phone VARCHAR(50) NULL,
        "Address" TEXT NOT NULL,
        course VARCHAR(50) NULL,
        batch VARCHAR(50) DEFAULT '2024-2026',
        "Qualification" VARCHAR(50) NOT NULL,
        "Enrollment_Date" DATE DEFAULT CURRENT_DATE,
        profile_photo TEXT NULL,
        gender VARCHAR(20) DEFAULT 'Male',
        blood_group VARCHAR(10) DEFAULT 'O+',
        status VARCHAR(20) DEFAULT 'Active',
        aadhaar_no VARCHAR(50) NULL,
        aadhaar_status VARCHAR(30) DEFAULT 'Submitted',
        marksheet_10th_roll VARCHAR(50) NULL,
        marksheet_10th_status VARCHAR(30) DEFAULT 'Submitted',
        marksheet_12th_status VARCHAR(30) DEFAULT 'Pending',
        tc_status VARCHAR(30) DEFAULT 'Pending',
        category_cert_status VARCHAR(30) DEFAULT 'General',
        documents_status VARCHAR(40) DEFAULT 'Pending Verification',
        doc_remarks TEXT NULL
      )
    `);
    console.log("Table 'applicants' verified/created with document tracking & multi-contact columns.");

    // Ensure indexes exist
    try {
      await connection.query("CREATE UNIQUE INDEX IF NOT EXISTS idx_applicants_email ON applicants(email)");
      await connection.query("CREATE INDEX IF NOT EXISTS idx_applicants_course ON applicants(course)");
      await connection.query("CREATE INDEX IF NOT EXISTS idx_applicants_documents_status ON applicants(documents_status)");
    } catch (e) {}

    // 5. Payments Table (Fee Ledger)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS payments (
        id SERIAL PRIMARY KEY,
        student_id INT NOT NULL,
        student_name VARCHAR(100) NULL,
        student_course VARCHAR(50) NULL,
        amount INT NOT NULL,
        payment_method VARCHAR(50) NOT NULL DEFAULT 'UPI',
        transaction_id VARCHAR(100) UNIQUE NOT NULL,
        payment_mode VARCHAR(20) NOT NULL DEFAULT 'Online',
        payment_status VARCHAR(20) NOT NULL DEFAULT 'Success',
        payment_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        remarks TEXT NULL,
        CONSTRAINT fk_payments_student
          FOREIGN KEY (student_id) REFERENCES applicants(id) ON DELETE CASCADE
      )
    `);
    console.log("Table 'payments' verified/created.");

    // 6. Users Credentials Table (RBAC)
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(20) NOT NULL,
        name VARCHAR(100) NULL,
        student_id INT NULL,
        teacher_id INT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_users_student FOREIGN KEY (student_id) REFERENCES applicants(id) ON DELETE SET NULL,
        CONSTRAINT fk_users_teacher FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE SET NULL
      )
    `);
    console.log("Table 'users' verified/created.");

    // 7. Landing CMS Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS landing_cms (
        id INT PRIMARY KEY DEFAULT 1,
        hero JSONB NOT NULL,
        about JSONB NOT NULL,
        features JSONB NOT NULL,
        gallery JSONB NOT NULL,
        contact JSONB NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("Table 'landing_cms' verified/created.");

    // 8. Seed Admin User
    const adminEmail = "jayamyname19@gmail.com";
    const resAdmin = await connection.query("SELECT id FROM users WHERE username = $1", [adminEmail]);
    if (resAdmin.rows.length === 0) {
      const hashedAdminPassword = hashPassword("12345");
      await connection.query(
        "INSERT INTO users (username, password_hash, role, name) VALUES ($1, $2, 'admin', 'Administrator')",
        [adminEmail, hashedAdminPassword]
      );
      console.log("Seeded admin user credentials successfully.");
    }

    // 9. Seed Teachers
    const defaultTeachers = [
      { emp_id: "EMP-MG-101", name: "Er. Amit Sharma", email: "amit.sharma@mgiti.edu", phone: "9876543210", dept: "Computer Operator & Programming Assistant", desig: "Senior Instructor & HOD", qual: "B.Tech (CSE), MCA, CITS Certified", exp: "8 Years", courses: ['COPA'], batches: ['2024-2026', '2025-2027'] },
      { emp_id: "EMP-MG-102", name: "Prof. Priya Verma", email: "priya.verma@mgiti.edu", phone: "9876543211", dept: "Electrician Trade", desig: "Master Technical Trainer", qual: "B.Tech (Electrical), NCVT Master", exp: "10 Years", courses: ['Electrician'], batches: ['2024-2026', '2025-2027'] },
      { emp_id: "EMP-MG-103", name: "Er. Rajesh Kumar", email: "rajesh.kumar@mgiti.edu", phone: "9876543212", dept: "Fitter Trade", desig: "Workshop Superintendent", qual: "Diploma (Mech Engg), CITS", exp: "12 Years", courses: ['Fitter'], batches: ['2024-2026', '2025-2027'] },
    ];

    for (let t of defaultTeachers) {
      const resT = await connection.query("SELECT id FROM teachers WHERE email = $1", [t.email]);
      let teacherId;
      if (resT.rows.length === 0) {
        const ins = await connection.query(
          "INSERT INTO teachers (employee_id, name, email, phone, department, designation, qualification, experience, assigned_courses, assigned_batches) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id",
          [t.emp_id, t.name, t.email, t.phone, t.dept, t.desig, t.qual, t.exp, t.courses, t.batches]
        );
        teacherId = ins.rows[0].id;
      } else {
        teacherId = resT.rows[0].id;
      }

      const resU = await connection.query("SELECT id FROM users WHERE username = $1", [t.email]);
      if (resU.rows.length === 0) {
        const hashedT = hashPassword("12345");
        await connection.query(
          "INSERT INTO users (username, password_hash, role, name, teacher_id) VALUES ($1, $2, 'teacher', $3, $4)",
          [t.email, hashedT, t.name, teacherId]
        );
      }
    }
    console.log("Teachers and credentials seeded successfully.");

    // 10. Seed Students
    const defaultStudents = [
      { roll_no: "MG-2024-001", name: "Aarav Sharma", father: "Mr. Suresh Sharma", email: "aarav.sharma@gmail.com", alt_email: "aarav.personal@gmail.com", dob: "2004-05-12", phone: "9812345670", alt_phone: "9812345679 (Parent)", addr: "Ward No. 4, Madhubani, Bihar - 847211", course: "COPA", qual: "12th Pass (Science)", aadhaar: "5821-9043-1290", a_status: "Verified", m10_roll: "BSEB-2022-0941", m10_status: "Verified", m12_status: "Verified", tc_status: "Verified", cat_status: "General", doc_status: "Verified", remarks: "All original documents submitted and verified by Admin" },
      { roll_no: "MG-2024-002", name: "Sneha Patel", father: "Mr. Vinod Patel", email: "sneha.patel@gmail.com", alt_email: "patel.sneha@yahoo.com", dob: "2003-11-20", phone: "9812345671", alt_phone: "9812345678 (Father)", addr: "Station Road, Darbhanga, Bihar - 846004", course: "Electrician", qual: "10th Pass", aadhaar: "7820-4419-8320", a_status: "Verified", m10_roll: "CBSE-2022-7719", m10_status: "Verified", m12_status: "N/A", tc_status: "Verified", cat_status: "General", doc_status: "Verified", remarks: "Aadhaar and Class 10th marksheet verified" },
      { roll_no: "MG-2024-003", name: "Rohan Singh", father: "Mr. Dharmendra Singh", email: "rohan.singh@gmail.com", alt_email: "rohan.tech@gmail.com", dob: "2004-02-18", phone: "9812345672", alt_phone: "9812345677 (Guardian)", addr: "Gandhi Nagar, Samastipur, Bihar - 848101", course: "Fitter", qual: "10th Pass (Maths)", aadhaar: "3391-0028-4411", a_status: "Verified", m10_roll: "BSEB-2022-3301", m10_status: "Verified", m12_status: "N/A", tc_status: "Submitted", cat_status: "Submitted", doc_status: "Pending Verification", remarks: "Transfer Certificate and Category Certificate awaiting verification" },
      { roll_no: "MG-2024-004", name: "Pooja Gupta", father: "Mr. Rajendra Gupta", email: "pooja.gupta@gmail.com", alt_email: "guptapooja.dev@gmail.com", dob: "2005-09-08", phone: "9812345673", alt_phone: "9812345676 (Mother)", addr: "College Road, Sakri, Madhubani - 847239", course: "COPA", qual: "12th Pass (Commerce)", aadhaar: "9910-3849-1120", a_status: "Pending", m10_roll: "BSEB-2023-8821", m10_status: "Pending", m12_status: "Pending", tc_status: "Pending", cat_status: "General", doc_status: "Documents Incomplete", remarks: "Physical verification required: Aadhaar card copy and Marksheets pending" },
    ];

    for (let s of defaultStudents) {
      const resS = await connection.query("SELECT id FROM applicants WHERE email = $1", [s.email]);
      let studentId;
      if (resS.rows.length === 0) {
        const ins = await connection.query(
          `INSERT INTO applicants (
            roll_no, name, "fatherName", email, alt_email, "DOB", phone, alt_phone, "Address", course, "Qualification",
            aadhaar_no, aadhaar_status, marksheet_10th_roll, marksheet_10th_status, marksheet_12th_status, tc_status, category_cert_status, documents_status, doc_remarks
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20) RETURNING id`,
          [
            s.roll_no, s.name, s.father, s.email, s.alt_email, s.dob, s.phone, s.alt_phone, s.addr, s.course, s.qual,
            s.aadhaar, s.a_status, s.m10_roll, s.m10_status, s.m12_status, s.tc_status, s.cat_status, s.doc_status, s.remarks
          ]
        );
        studentId = ins.rows[0].id;
      } else {
        studentId = resS.rows[0].id;
      }

      // Ensure user credential exists for student
      const resU = await connection.query("SELECT id FROM users WHERE student_id = $1", [studentId]);
      if (resU.rows.length === 0) {
        const defaultPin = String(100 + studentId);
        const hashedS = hashPassword(defaultPin);
        await connection.query(
          "INSERT INTO users (username, password_hash, role, name, student_id) VALUES ($1, $2, 'student', $3, $4)",
          [String(studentId), hashedS, s.name, studentId]
        );
      }
    }
    console.log("Students and credentials seeded successfully.");

    console.log("✨ New clean database schema migration successfully completed!");
  } catch (err) {
    console.warn("⚠️ Database schema migration could not complete:", err.message || err);
    console.warn("ℹ️ The application server will start normally using the ERP fallback store until the database is accessible.");
  } finally {
    if (connection) {
      try {
        await connection.end();
      } catch (e) {}
    }
  }
}

main();
