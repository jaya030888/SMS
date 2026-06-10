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

    // 3. Alter applicants table to add payment_status if it doesn't exist
    const [statusCols] = await connection.query(`
      SELECT COLUMN_NAME FROM information_schema.COLUMNS 
      WHERE TABLE_SCHEMA='Applications' AND TABLE_NAME='applicants' AND COLUMN_NAME='payment_status'
    `);
    if (statusCols.length === 0) {
      await connection.query(`
        ALTER TABLE applicants ADD COLUMN payment_status VARCHAR(20) DEFAULT 'Pending'
      `);
      console.log("Added column 'payment_status' to table 'applicants'.");
    } else {
      console.log("Column 'payment_status' already exists.");
    }

    // 4. Alter applicants table to add amount_paid if it doesn't exist
    const [paidCols] = await connection.query(`
      SELECT COLUMN_NAME FROM information_schema.COLUMNS 
      WHERE TABLE_SCHEMA='Applications' AND TABLE_NAME='applicants' AND COLUMN_NAME='amount_paid'
    `);
    if (paidCols.length === 0) {
      await connection.query(`
        ALTER TABLE applicants ADD COLUMN amount_paid INT DEFAULT 0
      `);
      console.log("Added column 'amount_paid' to table 'applicants'.");

      // Initialize existing students:
      // Electrician/Fitter get Paid (total_fee), COPA gets Pending (2000)
      console.log("Initializing payment data for existing students...");
      const [students] = await connection.query("SELECT id, course FROM applicants");
      for (let s of students) {
        const course = s.course.toLowerCase();
        let status = 'Pending';
        let paid = 2000; // paid registration
        if (course.includes('electrician')) {
          status = 'Paid';
          paid = 21000;
        } else if (course.includes('fitter')) {
          status = 'Paid';
          paid = 19500;
        } else if (course.includes('copa') || course.includes('computer')) {
          status = 'Pending';
          paid = 2000;
        } else {
          status = s.id % 2 === 0 ? 'Paid' : 'Pending';
          paid = status === 'Paid' ? 15000 : 2000;
        }

        await connection.query(`
          UPDATE applicants SET payment_status = ?, amount_paid = ? WHERE id = ?
        `, [status, paid, s.id]);
      }
      console.log("Existing students' payment info initialized successfully.");
    } else {
      console.log("Column 'amount_paid' already exists.");
    }

    console.log("Database setup successfully completed!");
  } catch (err) {
    console.error("Database setup failed:", err);
  } finally {
    if (connection) await connection.end();
  }
}

main();
