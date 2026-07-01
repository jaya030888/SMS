// setup-db.js
const mysql = require('mysql2/promise');
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
    const dbName = process.env.MYSQL_DATABASE || "Applications";
    const host = process.env.MYSQL_HOST || "localhost";
    const isLocal = host === "localhost" || host === "127.0.0.1";
    connection = await mysql.createConnection({
      host,
      port: Number(process.env.MYSQL_PORT) || 3306,
      user: process.env.MYSQL_USER || "root",
      password: process.env.MYSQL_PASSWORD || "root",
      database: dbName,
      ssl: isLocal ? undefined : { rejectUnauthorized: false }
    });

    console.log(`Connected to MySQL database '${dbName}'.`);

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
        VALUES (?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          tuition_fee = VALUES(tuition_fee),
          lab_fee = VALUES(lab_fee),
          library_fee = VALUES(library_fee),
          exam_fee = VALUES(exam_fee),
          development_fee = VALUES(development_fee),
          total_fee = VALUES(total_fee)
      `, [f.course, f.tuition_fee, f.lab_fee, f.library_fee, f.exam_fee, f.development_fee, f.total_fee]);
    }
    console.log("Course fees seeded successfully.");

    // 3. Ensure applicants table has proper column sizes and keys
    console.log("Checking/creating 'applicants' table...");
    await connection.query(`
      CREATE TABLE IF NOT EXISTS applicants (
        id INT AUTO_INCREMENT PRIMARY KEY,
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

    console.log("Adjusting 'applicants' table columns...");
    await connection.query("ALTER TABLE applicants MODIFY COLUMN name VARCHAR(100) NOT NULL");
    await connection.query("ALTER TABLE applicants MODIFY COLUMN fatherName VARCHAR(100) NOT NULL");
    await connection.query("ALTER TABLE applicants MODIFY COLUMN email VARCHAR(100) NOT NULL");
    await connection.query("ALTER TABLE applicants MODIFY COLUMN phone VARCHAR(15) NOT NULL");
    await connection.query("ALTER TABLE applicants MODIFY COLUMN course VARCHAR(50) NULL");

    // Add profile_photo column if it does not exist
    try {
      await connection.query("ALTER TABLE applicants ADD COLUMN profile_photo LONGTEXT NULL");
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
        id INT AUTO_INCREMENT PRIMARY KEY,
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
    const [statusCols] = await connection.query(`
      SELECT COLUMN_NAME FROM information_schema.COLUMNS 
      WHERE TABLE_SCHEMA=? AND TABLE_NAME='applicants' AND COLUMN_NAME='payment_status'
    `, [dbName]);
    const [paidCols] = await connection.query(`
      SELECT COLUMN_NAME FROM information_schema.COLUMNS 
      WHERE TABLE_SCHEMA=? AND TABLE_NAME='applicants' AND COLUMN_NAME='amount_paid'
    `, [dbName]);

    if (paidCols.length > 0) {
      console.log("Found legacy 'amount_paid' column. Migrating payment records...");
      const [students] = await connection.query("SELECT id, amount_paid FROM applicants");
      for (let s of students) {
        const amount = Number(s.amount_paid);
        if (amount > 0) {
          const [existing] = await connection.query("SELECT id FROM payments WHERE student_id = ?", [s.id]);
          if (existing.length === 0) {
            const txnId = `TXN-REG-MIGRATED-${s.id}-${Date.now()}`;
            await connection.query(
              "INSERT INTO payments (student_id, amount, transaction_id, remarks) VALUES (?, ?, ?, 'Migrated Registration Fee')", 
              [s.id, amount, txnId]
            );
          }
        }
      }
      await connection.query("ALTER TABLE applicants DROP COLUMN amount_paid");
      console.log("Dropped legacy 'amount_paid'.");
    }

    if (statusCols.length > 0) {
      await connection.query("ALTER TABLE applicants DROP COLUMN payment_status");
      console.log("Dropped legacy 'payment_status'.");
    }

    // 6. Create users credentials table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
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
    const [adminRows] = await connection.query("SELECT id FROM users WHERE username = ?", [adminEmail]);
    if (adminRows.length === 0) {
      const hashedAdminPassword = hashPassword("12345");
      await connection.query(
        "INSERT INTO users (username, password_hash, role) VALUES (?, ?, 'admin')",
        [adminEmail, hashedAdminPassword]
      );
      console.log("Seeded admin user credentials successfully.");
    } else {
      console.log("Admin user credentials already seeded.");
    }

    // 8. Seed Student Users for all existing applicants
    const [applicants] = await connection.query("SELECT id FROM applicants");
    let seededStudentsCount = 0;
    for (let student of applicants) {
      const username = String(student.id);
      const [userRows] = await connection.query("SELECT id FROM users WHERE username = ?", [username]);
      if (userRows.length === 0) {
        const passwordText = "10" + username;
        const hashedStudentPassword = hashPassword(passwordText);
        await connection.query(
          "INSERT INTO users (username, password_hash, role, student_id) VALUES (?, ?, 'student', ?)",
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
  } finally {
    if (connection) await connection.end();
  }
}

main();
