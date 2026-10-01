// src/app/lib/db.ts
import { Pool } from 'pg';
import { erpStore } from './mockData';

const connectionString = 
  process.env.DATABASE_URL || 
  process.env.POSTGRES_URL || 
  process.env.POSTGRES_PRISMA_URL || 
  process.env.POSTGRES_URL_NON_POOLING ||
  process.env.DATABASE_PRIVATE_URL;

function getSSLConfig(connStr?: string) {
  if (!connStr) return false;
  if (connStr.includes('localhost') || connStr.includes('127.0.0.1')) {
    return process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false;
  }
  return { rejectUnauthorized: false };
}

let pool: Pool | null = null;
if (connectionString) {
  try {
    pool = new Pool({
      connectionString,
      ssl: getSSLConfig(connectionString),
      connectionTimeoutMillis: 5000,
      idleTimeoutMillis: 30000,
      max: 10,
    });

    pool.on('error', (err) => {
      console.warn("PostgreSQL pool background client error:", err.message);
    });
  } catch (e) {
    console.warn("PostgreSQL pool initialization failed, using ERP in-memory fallback store.");
  }
}

import { hashPassword } from './auth';

// Built-in mock users for authentication fallback (passwords hashed using Scrypt)
const mockUsers = [
  { id: 1, username: "jayamyname19@gmail.com", password_hash: hashPassword("12345"), role: "admin", name: "Administrator" },
  { id: 2, username: "amit.sharma@mgiti.edu", password_hash: hashPassword("12345"), role: "teacher", teacher_id: 1, name: "Er. Amit Sharma" },
  { id: 3, username: "priya.verma@mgiti.edu", password_hash: hashPassword("12345"), role: "teacher", teacher_id: 2, name: "Prof. Priya Verma" },
  { id: 4, username: "rajesh.kumar@mgiti.edu", password_hash: hashPassword("12345"), role: "teacher", teacher_id: 3, name: "Er. Rajesh Kumar" },
  { id: 5, username: "1", password_hash: hashPassword("101"), role: "student", student_id: 1, name: "Aarav Sharma" },
  { id: 6, username: "2", password_hash: hashPassword("102"), role: "student", student_id: 2, name: "Sneha Patel" },
  { id: 7, username: "3", password_hash: hashPassword("103"), role: "student", student_id: 3, name: "Rohan Singh" },
  { id: 8, username: "4", password_hash: hashPassword("104"), role: "student", student_id: 4, name: "Pooja Gupta" },
];

// Helper to simulate basic SQL queries in fallback mode
function handleMockQuery(text: string, params: any[] = []): [any[], any[]] {
  const sql = text.trim();
  const lower = sql.toLowerCase();

  // 0. Health check
  if (lower.includes('select 1')) {
    return [[{ '?column?': 1 }], []];
  }

  // 1. Users Query (Authentication)
  if (lower.includes('from users')) {
    if (lower.includes('username =') || lower.includes('username=') || lower.includes('username')) {
      const username = String(params[0] ?? '').trim().toLowerCase();
      const role = String(params[1] ?? '').trim().toLowerCase();
      
      const found = mockUsers.filter(u => {
        const uMatch = u.username.toLowerCase() === username || (u.student_id && String(u.student_id) === username);
        const rMatch = !role || u.role.toLowerCase() === role;
        return uMatch && rMatch;
      });

      return [found, []];
    }
    return [mockUsers, []];
  }

  // 2. Applicants / Students Query
  if (lower.includes('from applicants') || lower.includes('from students')) {
    const students = erpStore.getStudents();
    const payments = erpStore.getPayments();
    const fees = erpStore.fees;

    if (lower.includes('where') && (lower.includes('a.id =') || lower.includes('id =') || lower.includes('id='))) {
      const id = Number(params[0]);
      const matched = students.filter(s => s.id === id);
      const enriched = matched.map(s => {
        const fee = fees.find(f => f.course.toLowerCase() === s.course.toLowerCase())?.total_fee || 15000;
        const paid = payments.filter(p => p.student_id === s.id && p.payment_status === 'Success').reduce((acc, c) => acc + (c.amount || 0), 0);
        return {
          ...s,
          amount_paid: paid,
          remaining_balance: fee - paid,
          payment_status: (fee - paid) <= 0 ? 'Paid' : 'Pending'
        };
      });
      return [enriched, []];
    }

    const enrichedAll = students.map(s => {
      const fee = fees.find(f => f.course.toLowerCase() === s.course.toLowerCase())?.total_fee || 15000;
      const paid = payments.filter(p => p.student_id === s.id && p.payment_status === 'Success').reduce((acc, c) => acc + (c.amount || 0), 0);
      return {
        ...s,
        amount_paid: paid,
        remaining_balance: fee - paid,
        payment_status: (fee - paid) <= 0 ? 'Paid' : 'Pending'
      };
    });
    return [enrichedAll, []];
  }

  // 3. Course Fees Query
  if (lower.includes('from course_fees')) {
    return [erpStore.fees, []];
  }

  // 4. Payments Query
  if (lower.includes('from payments')) {
    const payments = erpStore.getPayments();
    if (lower.includes('sum(amount)')) {
      const total = payments
        .filter(p => p.payment_status === 'Success')
        .reduce((acc, curr) => acc + (curr.amount || 0), 0);
      return [[{ total_collected: total }], []];
    }
    if (lower.includes('where student_id =') || lower.includes('where student_id=')) {
      const sid = Number(params[0]);
      return [payments.filter(p => p.student_id === sid), []];
    }
    return [payments, []];
  }

  // 4b. Student fee aggregates for fee_stats route
  if (lower.includes('from applicants a') && lower.includes('left join payments p')) {
    const students = erpStore.getStudents();
    const fees = erpStore.fees;
    const payments = erpStore.getPayments();

    const result = students.map(s => {
      const matchedFee = fees.find(f => f.course.toLowerCase() === s.course.toLowerCase());
      const total_fee = matchedFee ? matchedFee.total_fee : 15000;
      const total_paid = payments
        .filter(p => p.student_id === s.id && p.payment_status === 'Success')
        .reduce((acc, curr) => acc + (curr.amount || 0), 0);
      return {
        id: s.id,
        total_fee,
        total_paid
      };
    });

    return [result, []];
  }

  // 5. Teachers Query
  if (lower.includes('from teachers')) {
    return [erpStore.getTeachers(), []];
  }

  // 6. Courses Query
  if (lower.includes('from courses') || lower.includes('from course_batches')) {
    return [erpStore.getCourses(), []];
  }

  // Default fallback for any other select
  return [[], []];
}

function handleMockExecute(text: string, params: any[] = []): [{ insertId: number; affectedRows: number; id?: number }, any[]] {
  const lower = text.toLowerCase();

  // 1. Insert into applicants
  if (lower.includes('insert into applicants')) {
    const newStudent = erpStore.addStudent({
      name: String(params[0] || 'Student'),
      fatherName: String(params[1] || ''),
      email: String(params[2] || ''),
      DOB: String(params[3] || '2000-01-01'),
      phone: String(params[4] || ''),
      Address: String(params[5] || ''),
      course: String(params[6] || 'COPA'),
      batch: '2026-2027',
      Qualification: String(params[7] || ''),
      Enrollment_Date: String(params[8] || new Date().toISOString().split('T')[0]),
      profile_photo: params[9] || undefined,
      gender: 'Other',
      status: 'Active',
      aadhaar_no: String(params[10] || `5821-9043-${Math.floor(1000 + Math.random() * 9000)}`),
      aadhaar_status: 'Submitted',
      marksheet_10th_status: 'Submitted',
      marksheet_12th_status: 'Pending',
      tc_status: 'Pending',
      category_cert_status: 'General',
      documents_status: 'Pending Verification'
    });
    return [{ insertId: newStudent.id, affectedRows: 1, id: newStudent.id }, []];
  }

  // 2. Insert into payments
  if (lower.includes('insert into payments')) {
    const studentId = Number(params[0]);
    const amount = Number(params[1]);
    const pMethod = String(params[2] || 'Cash');
    const txnId = params[3] ? String(params[3]) : undefined;
    const pMode = String(params[4] || 'Offline');
    const pStatus = (params[5] || 'Success') as any;
    const remarks = params[6] ? String(params[6]) : '';

    const newPayment = erpStore.addPayment({
      student_id: studentId,
      amount,
      payment_method: pMethod,
      payment_mode: pMode,
      payment_status: pStatus,
      remarks
    });
    return [{ insertId: newPayment.id, affectedRows: 1, id: newPayment.id }, []];
  }

  // 3. Insert into teachers
  if (lower.includes('insert into teachers')) {
    const name = String(params[0]);
    const email = String(params[1]);
    const phone = String(params[2] || '');
    const dept = String(params[3] || 'COPA');
    const newTeacher = erpStore.addTeacher({
      employee_id: `EMP-${Math.floor(1000 + Math.random() * 9000)}`,
      name,
      email,
      phone,
      department: dept,
      designation: 'Lecturer',
      qualification: 'B.Tech',
      experience: '2 Years',
      assigned_courses: [dept],
      assigned_batches: ['Batch 1'],
      joining_date: new Date().toISOString().split('T')[0],
      status: 'Active'
    });
    return [{ insertId: newTeacher.id, affectedRows: 1, id: newTeacher.id }, []];
  }

  // 7. Insert into courses
  if (lower.includes('insert into courses')) {
    const name = String(params[0]);
    const code = String(params[1] || 'C-101');
    const duration = String(params[2] || '1 Year');
    const newCourse = erpStore.addCourse({
      name,
      code,
      duration,
      seats: 40,
      enrolled: 0,
      hod: 'Faculty Head',
      description: 'Course training curriculum',
      batches: ['2026-2027'],
      semesters: 2
    });
    return [{ insertId: newCourse.id, affectedRows: 1, id: newCourse.id }, []];
  }

  // 8. Updates
  if (lower.includes('update applicants') || lower.includes('update students')) {
    if (lower.includes('set profile_photo =') && params.length >= 2) {
      const photo = params[0];
      const id = Number(params[1]);
      erpStore.updateStudent(id, { profile_photo: photo });
      return [{ insertId: id, affectedRows: 1 }, []];
    }
    if (lower.includes('set documents_status =') || lower.includes('documents_status')) {
      // document status update
      const id = Number(params[params.length - 1]);
      if (id) {
        erpStore.updateStudent(id, {
          documents_status: params[0] as any,
          aadhaar_status: params[1] as any,
          marksheet_10th_status: params[2] as any,
          marksheet_12th_status: params[3] as any,
          tc_status: params[4] as any,
          doc_remarks: params[5]
        });
      }
      return [{ insertId: id, affectedRows: 1 }, []];
    }
    if (params.length >= 9) {
      const id = Number(params[8]);
      erpStore.updateStudent(id, {
        name: params[0],
        fatherName: params[1],
        email: params[2],
        DOB: params[3],
        phone: params[4],
        Address: params[5],
        course: params[6],
        Qualification: params[7]
      });
      return [{ insertId: id, affectedRows: 1 }, []];
    }
    return [{ insertId: 0, affectedRows: 1 }, []];
  }

  // 9. Deletes
  if (lower.includes('delete from applicants') || lower.includes('delete from students')) {
    const id = Number(params[0]);
    if (id) {
      erpStore.deleteStudent(id);
    }
    return [{ insertId: 0, affectedRows: 1 }, []];
  }

  return [{ insertId: Date.now(), affectedRows: 1 }, []];
}

export const db = {
  query: async (text: string, params: any[] = []) => {
    if (pool) {
      try {
        let index = 1;
        const pgQuery = text.replace(/\?/g, () => `$${index++}`);
        const result = await pool.query(pgQuery, params);
        return [result.rows, result.fields];
      } catch (err) {
        return handleMockQuery(text, params);
      }
    }
    return handleMockQuery(text, params);
  },

  execute: async (text: string, params: any[] = []) => {
    if (pool) {
      try {
        let index = 1;
        const pgQuery = text.replace(/\?/g, () => `$${index++}`);
        const result = await pool.query(pgQuery, params);
        const insertId = result.rows.length > 0 ? (result.rows[0].id || 0) : 0;
        return [{ insertId, affectedRows: result.rowCount }, result.fields];
      } catch (err) {
        return handleMockExecute(text, params);
      }
    }
    return handleMockExecute(text, params);
  },

  getConnection: async () => {
    if (pool) {
      try {
        const client = await pool.connect();
        return {
          query: async (text: string, params: any[] = []) => {
            let index = 1;
            const pgQuery = text.replace(/\?/g, () => `$${index++}`);
            const result = await client.query(pgQuery, params);
            return [result.rows, result.fields];
          },
          execute: async (text: string, params: any[] = []) => {
            let index = 1;
            const pgQuery = text.replace(/\?/g, () => `$${index++}`);
            const result = await client.query(pgQuery, params);
            const insertId = result.rows.length > 0 ? (result.rows[0].id || 0) : 0;
            return [{ insertId, affectedRows: result.rowCount }, result.fields];
          },
          beginTransaction: async () => await client.query("BEGIN"),
          commit: async () => await client.query("COMMIT"),
          rollback: async () => await client.query("ROLLBACK"),
          release: () => client.release(),
        };
      } catch (err) {
        // Fallback
      }
    }
    
    // In-memory mock connection with state persistence
    return {
      query: async (text: string, params: any[] = []) => handleMockQuery(text, params),
      execute: async (text: string, params: any[] = []) => handleMockExecute(text, params),
      beginTransaction: async () => {},
      commit: async () => {},
      rollback: async () => {},
      release: () => {},
    };
  }
};
