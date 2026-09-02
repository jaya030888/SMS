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

async function main() {
  let connection;
  try {
    const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;
    if (!connectionString) {
      throw new Error("DATABASE_URL is required. Add it locally in .env or attach the Render PostgreSQL database to this service.");
    }

    connection = new Client({
      connectionString,
      ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false
    });
    
    await connection.connect();

    console.log(`Connected to PostgreSQL database.`);

    // 1. Create course_fees table if it does not exist
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

    // 2. Populate course_fees
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

    // 3. Ensure applicants table has proper column sizes and keys
    console.log("Checking/creating 'applicants' table...");
    await connection.query(`
      CREATE TABLE IF NOT EXISTS applicants (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        fatherName VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL,
        DOB DATE NOT NULL,
        phone VARCHAR(15) NOT NULL,
        Address TEXT NOT NULL,
        course VARCHAR(50) NULL,
        Qualification VARCHAR(50) NOT NULL,
        Enrollment_Date DATE DEFAULT NULL
      )
    `);

    // Add profile_photo column if it does not exist
    try {
      await connection.query("ALTER TABLE applicants ADD COLUMN profile_photo TEXT NULL");
      console.log("Column 'profile_photo' verified/added.");
    } catch (e) {
      // Column already exists
    }

    // Add unique index on email if not exists
    try {
      await connection.query("CREATE UNIQUE INDEX idx_applicants_email ON applicants(email)");
      console.log("Unique index on email added to 'applicants'.");
    } catch (e) {
      // index already exists, safe to ignore
    }

    // Add index on name if not exists
    try {
      await connection.query("CREATE INDEX idx_applicants_name ON applicants(name)");
      console.log("Index on name added to 'applicants'.");
    } catch (e) {
      // index already exists
    }

    // Add FOREIGN KEY for course referencing course_fees
    try {
      await connection.query(`
        ALTER TABLE applicants
        ADD CONSTRAINT fk_applicants_course
        FOREIGN KEY (course) REFERENCES course_fees(course)
        ON UPDATE CASCADE ON DELETE SET NULL
      `);
      console.log("Foreign key constraint fk_applicants_course added.");
    } catch (e) {
      // constraint already exists
    }

    // 4. Create payments table if it does not exist
    await connection.query(`
      CREATE TABLE IF NOT EXISTS payments (
        id SERIAL PRIMARY KEY,
        student_id INT NOT NULL,
        amount INT NOT NULL,
        payment_method VARCHAR(50) NOT NULL DEFAULT 'UPI',
        transaction_id VARCHAR(100) NOT NULL,
        payment_mode VARCHAR(20) NOT NULL DEFAULT 'Online',
        payment_status VARCHAR(20) NOT NULL DEFAULT 'Success',
        payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        remarks TEXT NULL,
        CONSTRAINT fk_payments_student
          FOREIGN KEY (student_id) REFERENCES applicants(id) ON DELETE CASCADE
      )
    `);
    console.log("Table 'payments' verified/created.");

    // Ensure transaction_id is unique
    try {
      await connection.query("CREATE UNIQUE INDEX idx_payments_transaction ON payments(transaction_id)");
      console.log("Unique index on transaction_id added.");
    } catch (e) {}

    // Add index on payment_status and payment_date
    try {
      await connection.query("CREATE INDEX idx_payments_status ON payments(payment_status)");
      await connection.query("CREATE INDEX idx_payments_date ON payments(payment_date)");
      console.log("Indexes on payments status and date added.");
    } catch (e) {}

    // 5. Migrate any legacy columns if setup-db.js is run on old data
    const resStatus = await connection.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_catalog=current_database() AND table_name='applicants' AND column_name='payment_status'
    `);
    const resPaid = await connection.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_catalog=current_database() AND table_name='applicants' AND column_name='amount_paid'
    `);

    if (resPaid.rows.length > 0) {
      console.log("Found legacy 'amount_paid' column. Migrating payment records...");
      const resStudents = await connection.query("SELECT id, amount_paid FROM applicants");
      for (let s of resStudents.rows) {
        const amount = Number(s.amount_paid);
        if (amount > 0) {
          const resExisting = await connection.query("SELECT id FROM payments WHERE student_id = $1", [s.id]);
          if (resExisting.rows.length === 0) {
            const txnId = `TXN-REG-MIGRATED-${s.id}-${Date.now()}`;
            await connection.query(
              "INSERT INTO payments (student_id, amount, transaction_id, remarks) VALUES ($1, $2, $3, 'Migrated Registration Fee')", 
              [s.id, amount, txnId]
            );
          }
        }
      }
      await connection.query("ALTER TABLE applicants DROP COLUMN amount_paid");
      console.log("Dropped legacy 'amount_paid'.");
    }

    if (resStatus.rows.length > 0) {
      await connection.query("ALTER TABLE applicants DROP COLUMN payment_status");
      console.log("Dropped legacy 'payment_status'.");
    }

    // 6. Create users credentials table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(20) NOT NULL,
        student_id INT NULL,
        CONSTRAINT fk_users_student
          FOREIGN KEY (student_id) REFERENCES applicants(id) ON DELETE CASCADE
      )
    `);
    console.log("Table 'users' verified/created.");

    // Add index on username
    try {
      await connection.query("CREATE INDEX idx_users_username ON users(username)");
    } catch (e) {}

    // 7. Seed Admin User
    const adminEmail = "jayamyname19@gmail.com";
    const resAdmin = await connection.query("SELECT id FROM users WHERE username = $1", [adminEmail]);
    if (resAdmin.rows.length === 0) {
      const hashedAdminPassword = hashPassword("12345");
      await connection.query(
        "INSERT INTO users (username, password_hash, role) VALUES ($1, $2, 'admin')",
        [adminEmail, hashedAdminPassword]
      );
      console.log("Seeded admin user credentials successfully.");
    } else {
      console.log("Admin user credentials already seeded.");
    }

    // 8. Seed Student Users for all existing applicants
    const resApplicants = await connection.query("SELECT id FROM applicants");
    let seededStudentsCount = 0;
    for (let student of resApplicants.rows) {
      const username = String(student.id);
      const resUsers = await connection.query("SELECT id FROM users WHERE username = $1", [username]);
      if (resUsers.rows.length === 0) {
        const passwordText = "10" + username;
        const hashedStudentPassword = hashPassword(passwordText);
        await connection.query(
          "INSERT INTO users (username, password_hash, role, student_id) VALUES ($1, $2, 'student', $3)",
          [username, hashedStudentPassword, student.id]
        );
        seededStudentsCount++;
      }
    }
    if (seededStudentsCount > 0) {
      console.log(`Seeded user credentials for ${seededStudentsCount} existing students.`);
    } else {
      console.log("All existing students already have user credentials.");
    }

    console.log("Database schema migration successfully completed!");
  } catch (err) {
    console.error("Database schema migration failed:", err);
    process.exitCode = 1;
  } finally {
    if (connection) await connection.end();
  }
}

main();
