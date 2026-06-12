// setup-db.js
const mysql = require('mysql2/promise');

async function main() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "root",
      database: "Applications"
    });

    console.log("Connected to MySQL database 'Applications'.");

    // 1. Create course_fees table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS course_fees (
        course VARCHAR(50) PRIMARY KEY,
        tuition_fee INT NOT NULL,
        lab_fee INT NOT NULL,
        library_fee INT NOT NULL,
        exam_fee INT NOT NULL,
        development_fee INT NOT NULL,
        total_fee INT NOT NULL
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

    // 3. Create payments table with all dynamic fields
    await connection.query(`
      CREATE TABLE IF NOT EXISTS payments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        student_id INT NOT NULL,
        amount INT NOT NULL,
        payment_method VARCHAR(50) NOT NULL DEFAULT 'UPI',
        transaction_id VARCHAR(100) NULL,
        payment_mode VARCHAR(20) NOT NULL DEFAULT 'Online',
        payment_status VARCHAR(20) NOT NULL DEFAULT 'Success',
        payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        remarks TEXT NULL,
        FOREIGN KEY (student_id) REFERENCES applicants(id) ON DELETE CASCADE
      )
    `);
    console.log("Table 'payments' verified/created.");

    // Verify payments table columns and alter if needed (for legacy tables)
    const [paymentCols] = await connection.query(`
      SELECT COLUMN_NAME FROM information_schema.COLUMNS 
      WHERE TABLE_SCHEMA='Applications' AND TABLE_NAME='payments' AND COLUMN_NAME='payment_method'
    `);
    
    if (paymentCols.length === 0) {
      console.log("Upgrading 'payments' table columns...");
      await connection.query(`
        ALTER TABLE payments 
        ADD COLUMN payment_method VARCHAR(50) DEFAULT 'UPI',
        ADD COLUMN transaction_id VARCHAR(100) DEFAULT NULL,
        ADD COLUMN payment_mode VARCHAR(20) DEFAULT 'Online',
        ADD COLUMN payment_status VARCHAR(20) DEFAULT 'Success',
        ADD COLUMN remarks TEXT DEFAULT NULL
      `);
      console.log("'payments' table upgraded successfully.");
    }

    // 4. Check for legacy columns and migrate data
    const [statusCols] = await connection.query(`
      SELECT COLUMN_NAME FROM information_schema.COLUMNS 
      WHERE TABLE_SCHEMA='Applications' AND TABLE_NAME='applicants' AND COLUMN_NAME='payment_status'
    `);
    const [paidCols] = await connection.query(`
      SELECT COLUMN_NAME FROM information_schema.COLUMNS 
      WHERE TABLE_SCHEMA='Applications' AND TABLE_NAME='applicants' AND COLUMN_NAME='amount_paid'
    `);

    if (paidCols.length > 0) {
      console.log("Found legacy 'amount_paid' column. Migrating payment records to 'payments' table...");
      const [students] = await connection.query("SELECT id, amount_paid FROM applicants");
      for (let s of students) {
        const amount = Number(s.amount_paid);
        if (amount > 0) {
          // Verify if student already has a payment to avoid duplicate migration
          const [existing] = await connection.query("SELECT id FROM payments WHERE student_id = ?", [s.id]);
          if (existing.length === 0) {
            await connection.query("INSERT INTO payments (student_id, amount) VALUES (?, ?)", [s.id, amount]);
          }
        }
      }
      console.log("Payment migration completed successfully.");

      // Drop legacy columns from applicants
      await connection.query("ALTER TABLE applicants DROP COLUMN amount_paid");
      console.log("Dropped legacy column 'amount_paid' from table 'applicants'.");
    } else {
      console.log("Legacy column 'amount_paid' does not exist (already migrated).");
    }

    if (statusCols.length > 0) {
      await connection.query("ALTER TABLE applicants DROP COLUMN payment_status");
      console.log("Dropped legacy column 'payment_status' from table 'applicants'.");
    } else {
      console.log("Legacy column 'payment_status' does not exist (already migrated).");
    }

    console.log("Database setup successfully completed!");
  } catch (err) {
    console.error("Database setup failed:", err);
  } finally {
    if (connection) await connection.end();
  }
}

main();
