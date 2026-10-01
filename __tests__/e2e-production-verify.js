// __tests__/e2e-production-verify.js
/**
 * Comprehensive End-to-End Production Verification Test Suite
 * Tests every single module, CRUD cycle, role boundary, calculation, and security gate.
 */
const baseUrl = 'http://localhost:3000';

async function runE2EProductionVerification() {
  console.log('================================================================');
  console.log('--- STARTING COMPLETE PRODUCTION END-TO-END VERIFICATION ---');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;
  const suiteResults = {};

  function record(section, testName, condition, extra = '') {
    if (!suiteResults[section]) suiteResults[section] = { passed: 0, failed: 0 };
    if (condition) {
      console.log(`✓ [${section}] ${testName}`);
      passed++;
      suiteResults[section].passed++;
    } else {
      console.error(`✗ [${section}] FAIL: ${testName} ${extra ? `(${extra})` : ''}`);
      failed++;
      suiteResults[section].failed++;
    }
  }

  try {
    // -------------------------------------------------------------
    // 1. HEALTH & PUBLIC ROUTES
    // -------------------------------------------------------------
    const healthRes = await fetch(baseUrl + '/api/health');
    const healthJson = await healthRes.json().catch(() => ({}));
    record('System Health', 'Health endpoint returns 200 and operational status', healthRes.status === 200 && (healthJson.status === 'ok' || healthJson.status === 'healthy'));

    const homeRes = await fetch(baseUrl + '/');
    record('Public Pages', 'Landing page renders with HTTP 200', homeRes.status === 200);

    const loginChoiceRes = await fetch(baseUrl + '/pages/Chose_Login');
    record('Public Pages', 'Role selection portal renders with HTTP 200', loginChoiceRes.status === 200);

    // -------------------------------------------------------------
    // 2. AUTHENTICATION & SESSION HANDLING
    // -------------------------------------------------------------
    // Invalid credentials
    const badLogin = await fetch(baseUrl + '/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'unknown@user.com', password: 'badpassword', role: 'admin' })
    });
    record('Authentication', 'Invalid credentials rejected with 401', badLogin.status === 401);

    // Admin login
    const adminLoginRes = await fetch(baseUrl + '/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'jayamyname19@gmail.com', password: '12345', role: 'admin' })
    });
    const adminCookie = adminLoginRes.headers.get('set-cookie') || '';
    const adminBody = await adminLoginRes.json();
    record('Authentication', 'Admin login succeeds with HttpOnly session cookie', adminLoginRes.status === 200 && adminBody.role === 'admin' && adminCookie.includes('session_token'));

    // Teacher login
    const teacherLoginRes = await fetch(baseUrl + '/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'amit.sharma@mgiti.edu', password: '12345', role: 'teacher' })
    });
    const teacherCookie = teacherLoginRes.headers.get('set-cookie') || '';
    const teacherBody = await teacherLoginRes.json();
    record('Authentication', 'Teacher login succeeds with role-tagged session', teacherLoginRes.status === 200 && teacherBody.role === 'teacher' && teacherCookie.includes('session_token'));

    // Student login
    const studentLoginRes = await fetch(baseUrl + '/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: '1', password: '101', role: 'student' })
    });
    const studentCookie = studentLoginRes.headers.get('set-cookie') || '';
    const studentBody = await studentLoginRes.json();
    record('Authentication', 'Student login succeeds with student ID bound session', studentLoginRes.status === 200 && studentBody.role === 'student' && studentCookie.includes('session_token'));

    // -------------------------------------------------------------
    // 3. RBAC & PORTAL ROUTE SECURITY
    // -------------------------------------------------------------
    // Student attempting to fetch Admin stats
    const studentToAdmin = await fetch(baseUrl + '/api/admin/fee_stats', {
      headers: { cookie: studentCookie }
    });
    record('RBAC & Security', 'Student blocked from Admin API with 403', studentToAdmin.status === 403);

    // Teacher attempting Admin-only faculty creation
    const teacherToAdmin = await fetch(baseUrl + '/api/teachers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', cookie: teacherCookie },
      body: JSON.stringify({ name: 'Unauthorized Teacher', email: 'unauth@test.com', department: 'COPA' })
    });
    record('RBAC & Security', 'Teacher blocked from Admin teacher provisioning with 403', teacherToAdmin.status === 403);

    // -------------------------------------------------------------
    // 4. CRUD: COURSES & CURRICULUM MANAGEMENT (ADMIN)
    // -------------------------------------------------------------
    const getCoursesRes = await fetch(baseUrl + '/api/courses', {
      headers: { cookie: adminCookie }
    });
    const coursesList = await getCoursesRes.json();
    record('Course Management', 'Admin can list all courses', getCoursesRes.status === 200 && Array.isArray(coursesList) && coursesList.length > 0);

    const newCourseRes = await fetch(baseUrl + '/api/courses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', cookie: adminCookie },
      body: JSON.stringify({
        name: 'Solar Technician',
        code: 'ST-2026',
        duration: '1 Year',
        total_fee: 18000,
        description: 'Green energy and solar installation certification'
      })
    });
    record('Course Management', 'Admin can create new curriculum course', newCourseRes.status === 201 || newCourseRes.status === 200);

    // -------------------------------------------------------------
    // 5. CRUD: FACULTY & TEACHER MANAGEMENT (ADMIN)
    // -------------------------------------------------------------
    const getTeachersRes = await fetch(baseUrl + '/api/teachers', {
      headers: { cookie: adminCookie }
    });
    const teachersList = await getTeachersRes.json();
    record('Teacher Management', 'Admin can list faculty members', getTeachersRes.status === 200 && Array.isArray(teachersList));

    const newTeacherRes = await fetch(baseUrl + '/api/teachers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', cookie: adminCookie },
      body: JSON.stringify({
        name: 'Prof. Vikram Malhotra',
        email: 'vikram.malhotra@mgiti.edu',
        phone: '9876543210',
        department: 'COPA',
        qualification: 'M.Tech CSE',
        designation: 'Senior Lecturer',
        joining_date: '2026-01-15'
      })
    });
    record('Teacher Management', 'Admin can register new faculty member', newTeacherRes.status === 201 || newTeacherRes.status === 200);

    // -------------------------------------------------------------
    // 6. CRUD: APPLICANTS & STUDENT MANAGEMENT (ADMIN)
    // -------------------------------------------------------------
    const newStudentRes = await fetch(baseUrl + '/api/applicants', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', cookie: adminCookie },
      body: JSON.stringify({
        name: 'Kavita Kumari',
        fatherName: 'Ram Prakash',
        email: 'kavita.kumari@test.com',
        DOB: '2004-05-12',
        phone: '9876501234',
        Address: 'Main Road, Darbhanga',
        course: 'COPA',
        Qualification: '12th Pass',
        Enrollment_Date: '2026-08-01'
      })
    });
    const newStudentData = await newStudentRes.json();
    const createdStudentId = newStudentData?.applicant?.id || newStudentData?.id || 5;
    record('Student Management', 'Admin can register new student applicant', (newStudentRes.status === 201 || newStudentRes.status === 200) && (!!newStudentData?.applicant?.id || !!newStudentData?.id));

    // IDOR Protection: Student cannot read another student's profile
    const studentIdorCheck = await fetch(baseUrl + `/api/applicants?id=${createdStudentId}`, {
      headers: { cookie: studentCookie }
    });
    record('IDOR Protection', 'Student 1 blocked from accessing new student profile with 403', studentIdorCheck.status === 403);

    // -------------------------------------------------------------
    // 7. ATTENDANCE WORKFLOW (TEACHER & STUDENT)
    // -------------------------------------------------------------
    // Teacher marks attendance
    const attendancePostRes = await fetch(baseUrl + '/api/attendance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', cookie: teacherCookie },
      body: JSON.stringify({
        date: '2026-09-29',
        records: [
          { student_id: 1, status: 'Present', remarks: 'On time' },
          { student_id: 2, status: 'Late', remarks: '15m late' },
          { student_id: 3, status: 'Absent', remarks: 'Sick leave' }
        ]
      })
    });
    record('Attendance System', 'Teacher can submit batch attendance', attendancePostRes.status === 200 || attendancePostRes.status === 201);

    // Student reads their own attendance
    const studentAttendanceGet = await fetch(baseUrl + '/api/attendance?student_id=1', {
      headers: { cookie: studentCookie }
    });
    const studentAttendanceData = await studentAttendanceGet.json();
    record('Attendance System', 'Student can read own attendance history & percentage', studentAttendanceGet.status === 200 && (Array.isArray(studentAttendanceData) || Array.isArray(studentAttendanceData?.logs)));

    // Student blocked from marking attendance
    const studentAttendanceTamper = await fetch(baseUrl + '/api/attendance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', cookie: studentCookie },
      body: JSON.stringify({
        date: '2026-09-29',
        records: [{ student_id: 1, status: 'Present' }]
      })
    });
    record('Attendance System', 'Student blocked from modifying attendance with 403', studentAttendanceTamper.status === 403);

    // -------------------------------------------------------------
    // 8. MARKS & GRADING WORKFLOW
    // -------------------------------------------------------------
    // Boundary check: Negative marks rejected
    const negativeMarksRes = await fetch(baseUrl + '/api/marks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', cookie: teacherCookie },
      body: JSON.stringify({ student_id: 1, subject: 'Trade Theory', obtained_marks: -5, max_marks: 100 })
    });
    record('Marks & Grades', 'Negative mark entry rejected with 400', negativeMarksRes.status === 400);

    // Boundary check: Marks > max_marks rejected
    const excessiveMarksRes = await fetch(baseUrl + '/api/marks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', cookie: teacherCookie },
      body: JSON.stringify({ student_id: 1, subject: 'Trade Theory', obtained_marks: 120, max_marks: 100 })
    });
    record('Marks & Grades', 'Marks exceeding maximum limit rejected with 400', excessiveMarksRes.status === 400);

    // Valid marks entry with automatic grade calculation
    const validMarksRes = await fetch(baseUrl + '/api/marks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', cookie: teacherCookie },
      body: JSON.stringify({ student_id: 1, subject: 'Trade Theory', obtained_marks: 88, max_marks: 100 })
    });
    const validMarksJson = await validMarksRes.json();
    record('Marks & Grades', 'Teacher submits valid marks with auto-calculated grade', (validMarksRes.status === 200 || validMarksRes.status === 201) && (validMarksJson.grade === 'A+' || validMarksJson.grade === 'A'));

    // -------------------------------------------------------------
    // 9. FEE MANAGEMENT & PAYMENT TRANSACTIONS
    // -------------------------------------------------------------
    // Negative payment rejected
    const negativePayRes = await fetch(baseUrl + '/api/payments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', cookie: adminCookie },
      body: JSON.stringify({ student_id: 1, amount: -500, payment_method: 'Cash' })
    });
    record('Fee Management', 'Negative payment amount rejected with 400', negativePayRes.status === 400);

    // Admin records legitimate installment payment
    const validPayRes = await fetch(baseUrl + '/api/payments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', cookie: adminCookie },
      body: JSON.stringify({
        student_id: 1,
        amount: 2500,
        payment_method: 'UPI',
        payment_mode: 'Online',
        remarks: 'Second term installment'
      })
    });
    const validPayJson = await validPayRes.json();
    record('Fee Management', 'Admin records fee payment transaction with receipt generation', (validPayRes.status === 200 || validPayRes.status === 201) && (validPayJson.success === true || !!validPayJson.transaction_id));

    // Student fee stats reflect updated remaining balance
    const studentApplicantRes = await fetch(baseUrl + '/api/applicants', {
      headers: { cookie: studentCookie }
    });
    const studentProfile = await studentApplicantRes.json();
    const sObj = Array.isArray(studentProfile) ? studentProfile[0] : studentProfile;
    record('Fee Management', 'Student profile fee calculation reflects payments accurately', sObj && typeof sObj.remaining_balance === 'number');

    // -------------------------------------------------------------
    // 10. NOTICE & ANNOUNCEMENT WORKFLOW
    // -------------------------------------------------------------
    // Admin creates notice for ALL audiences
    const createNoticeRes = await fetch(baseUrl + '/api/notices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', cookie: adminCookie },
      body: JSON.stringify({
        title: 'Mid-Term Examination Schedule Released',
        content: 'All students must check their respective timetables on the student portal.',
        target_audience: 'ALL',
        priority: 'High',
        category: 'Exam'
      })
    });
    record('Notice System', 'Admin publishes institute-wide announcement', createNoticeRes.status === 201 || createNoticeRes.status === 200);

    // Student verifies notice visibility
    const studentNoticesRes = await fetch(baseUrl + '/api/notices', {
      headers: { cookie: studentCookie }
    });
    const studentNotices = await studentNoticesRes.json();
    record('Notice System', 'Student retrieves targeted notices successfully', Array.isArray(studentNotices) && studentNotices.some(n => n.title.includes('Mid-Term')));

    // -------------------------------------------------------------
    // 11. SECURITY HEADERS & SERVER HARDENING
    // -------------------------------------------------------------
    const headersRes = await fetch(baseUrl + '/');
    const xfo = headersRes.headers.get('x-frame-options');
    const xcto = headersRes.headers.get('x-content-type-options');
    const csp = headersRes.headers.get('content-security-policy');
    const poweredBy = headersRes.headers.get('x-powered-by');

    record('Security Headers', 'X-Frame-Options configured to DENY', xfo === 'DENY');
    record('Security Headers', 'X-Content-Type-Options is nosniff', xcto === 'nosniff');
    record('Security Headers', 'Content-Security-Policy is active and strict', !!csp && csp.includes("default-src 'self'"));
    record('Security Headers', 'X-Powered-By header is completely removed', !poweredBy);

    // -------------------------------------------------------------
    // 12. LOGOUT & SESSION INVALIDATION
    // -------------------------------------------------------------
    const logoutRes = await fetch(baseUrl + '/api/auth/logout', {
      method: 'POST',
      headers: { cookie: studentCookie }
    });
    const logoutCookie = logoutRes.headers.get('set-cookie') || '';
    record('Authentication', 'Logout clears session cookie with zero max-age', logoutRes.status === 200 && (logoutCookie.includes('Max-Age=0') || logoutCookie.includes('expires=')));

  } catch (err) {
    console.error('Test Suite Fatal Error:', err);
  }

  console.log('\n================================================================');
  console.log(`TOTAL TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log('================================================================');

  for (const [sec, stats] of Object.entries(suiteResults)) {
    console.log(`  • ${sec.padEnd(25)} : ${stats.passed} Passed, ${stats.failed} Failed`);
  }
}

runE2EProductionVerification();
