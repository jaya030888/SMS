// __tests__/security-audit.js
const baseUrl = 'http://localhost:3000';

async function runSecurityTests() {
  console.log('--- STARTING COMPREHENSIVE SECURITY AUDIT TESTS ---\n');
  let passed = 0;
  let failed = 0;

  function assert(condition, message, extra = '') {
    if (condition) {
      console.log('✓ PASS:', message);
      passed++;
    } else {
      console.error('✗ FAIL:', message, extra ? `(Received: ${extra})` : '');
      failed++;
    }
  }

  try {
    // 1. Unauthenticated checks
    const unauthStats = await fetch(baseUrl + '/api/admin/fee_stats');
    assert(unauthStats.status === 401, 'Unauthenticated access to /api/admin/fee_stats returns 401');

    const unauthApplicants = await fetch(baseUrl + '/api/applicants');
    assert(unauthApplicants.status === 401, 'Unauthenticated access to /api/applicants returns 401');

    const unauthPayments = await fetch(baseUrl + '/api/payments');
    assert(unauthPayments.status === 401, 'Unauthenticated access to /api/payments returns 401');

    const unauthAttendance = await fetch(baseUrl + '/api/attendance');
    assert(unauthAttendance.status === 401, 'Unauthenticated access to /api/attendance returns 401');

    // 2. Authentication with wrong password
    const wrongPass = await fetch(baseUrl + '/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'jayamyname19@gmail.com', password: 'wrongpassword123', role: 'admin' })
    });
    assert(wrongPass.status === 401, 'Login with incorrect password returns generic 401');

    // 3. Valid Logins
    const adminLogin = await fetch(baseUrl + '/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'jayamyname19@gmail.com', password: '12345', role: 'admin' })
    });
    const adminCookie = adminLogin.headers.get('set-cookie') || '';
    assert(adminLogin.status === 200 && adminCookie.includes('session_token'), 'Admin login succeeds and issues HttpOnly session token');

    const studentLogin = await fetch(baseUrl + '/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: '1', password: '101', role: 'student' })
    });
    const studentCookie = studentLogin.headers.get('set-cookie') || '';
    assert(studentLogin.status === 200 && studentCookie.includes('session_token'), 'Student login succeeds with JWT session');

    // 4. RBAC checks: Student attempting Admin APIs
    const studentAccessingAdminStats = await fetch(baseUrl + '/api/admin/fee_stats', {
      headers: { cookie: studentCookie }
    });
    assert(studentAccessingAdminStats.status === 403, 'Student calling /api/admin/fee_stats is blocked with 403 Forbidden');

    const studentCreatingTeacher = await fetch(baseUrl + '/api/teachers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', cookie: studentCookie },
      body: JSON.stringify({ name: 'Fake Teacher', email: 'fake@teacher.com', department: 'COPA' })
    });
    assert(studentCreatingTeacher.status === 403, 'Student calling POST /api/teachers is blocked with 403 Forbidden');

    const studentCreatingNotice = await fetch(baseUrl + '/api/notices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', cookie: studentCookie },
      body: JSON.stringify({ title: 'Fake Notice', content: 'Hack attempt' })
    });
    assert(studentCreatingNotice.status === 403, 'Student calling POST /api/notices is blocked with 403 Forbidden');

    const studentMarkingAttendance = await fetch(baseUrl + '/api/attendance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', cookie: studentCookie },
      body: JSON.stringify({ date: '2026-09-29', records: [{ student_id: 1, status: 'Present' }] })
    });
    assert(studentMarkingAttendance.status === 403, 'Student calling POST /api/attendance is blocked with 403 Forbidden');

    const studentEnteringMarks = await fetch(baseUrl + '/api/marks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', cookie: studentCookie },
      body: JSON.stringify({ student_id: 1, subject: 'Trade Theory', obtained_marks: 100, max_marks: 100 })
    });
    assert(studentEnteringMarks.status === 403, 'Student calling POST /api/marks is blocked with 403 Forbidden');

    // 5. IDOR checks: Student 1 accessing Student 2 data
    const student1ReadingStudent2 = await fetch(baseUrl + '/api/applicants?id=2', {
      headers: { cookie: studentCookie }
    });
    assert(student1ReadingStudent2.status === 403, 'IDOR: Student 1 reading Student 2 profile is blocked with 403 Forbidden');

    const student1ReadingStudent2Payments = await fetch(baseUrl + '/api/payments?student_id=2', {
      headers: { cookie: studentCookie }
    });
    assert(student1ReadingStudent2Payments.status === 403, 'IDOR: Student 1 reading Student 2 payments is blocked with 403 Forbidden');

    const student1PayingForStudent2 = await fetch(baseUrl + '/api/payments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', cookie: studentCookie },
      body: JSON.stringify({ student_id: 2, amount: 1000 })
    });
    assert(student1PayingForStudent2.status === 403, 'IDOR: Student 1 submitting payments for Student 2 is blocked with 403 Forbidden');

    // 6. Business Logic Validation & Abuse
    const negativePayment = await fetch(baseUrl + '/api/payments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', cookie: studentCookie },
      body: JSON.stringify({ student_id: 1, amount: -500 })
    });
    assert(negativePayment.status === 400, 'Negative payment amount rejected with 400 Bad Request');

    const negativeMarks = await fetch(baseUrl + '/api/marks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', cookie: adminCookie },
      body: JSON.stringify({ student_id: 1, subject: 'Theory', obtained_marks: -20, max_marks: 100 })
    });
    assert(negativeMarks.status === 400, 'Negative mark value rejected with 400 Bad Request');

    const excessiveMarks = await fetch(baseUrl + '/api/marks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', cookie: adminCookie },
      body: JSON.stringify({ student_id: 1, subject: 'Theory', obtained_marks: 150, max_marks: 100 })
    });
    assert(excessiveMarks.status === 400, 'Marks exceeding maximum limit rejected with 400 Bad Request');

    // 7. Security Headers check
    const headersRes = await fetch(baseUrl + '/');
    const h = headersRes.headers;
    assert(h.get('x-frame-options') === 'DENY', 'Security Header: X-Frame-Options is DENY');
    assert(h.get('x-content-type-options') === 'nosniff', 'Security Header: X-Content-Type-Options is nosniff');
    assert(!!h.get('content-security-policy'), 'Security Header: Content-Security-Policy is active');
    assert(!h.get('x-powered-by'), 'Security: X-Powered-By header is removed');

    console.log('\n========================================');
    console.log(`AUDIT TEST RESULTS: ${passed} PASSED, ${failed} FAILED.`);
    console.log('========================================');
  } catch (err) {
    console.error('Test error:', err);
  }
}

runSecurityTests();
