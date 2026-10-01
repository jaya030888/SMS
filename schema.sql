-- ============================================================================
-- INSTITUTIONAL STUDENT DOCUMENT REGISTRY & FEE MANAGEMENT SCHEMA (PostgreSQL)
-- Maa Gauri Private Industrial Training Institute (ITI)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. DROP OBSOLETE TABLES & DEPENDENCIES
-- (Attendance, Marks/Exams, Notices, Timetable completely removed)
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS attendance CASCADE;
DROP TABLE IF EXISTS marks CASCADE;
DROP TABLE IF EXISTS notices CASCADE;
DROP TABLE IF EXISTS timetable CASCADE;
DROP TABLE IF EXISTS schedule CASCADE;

-- ----------------------------------------------------------------------------
-- 2. COURSE FEES STRUCTURE TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS course_fees (
    course VARCHAR(50) PRIMARY KEY,
    tuition_fee INT NOT NULL DEFAULT 0,
    lab_fee INT NOT NULL DEFAULT 0,
    library_fee INT NOT NULL DEFAULT 0,
    exam_fee INT NOT NULL DEFAULT 0,
    development_fee INT NOT NULL DEFAULT 0,
    total_fee INT NOT NULL DEFAULT 0
);

-- ----------------------------------------------------------------------------
-- 3. COURSES & TRADES TABLE
-- ----------------------------------------------------------------------------
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
);

-- ----------------------------------------------------------------------------
-- 4. TEACHERS & INSTRUCTORS TABLE
-- ----------------------------------------------------------------------------
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
);

-- ----------------------------------------------------------------------------
-- 5. STUDENTS / APPLICANTS TABLE
-- Focused on Document Verification Details and Multi-Contact Communication
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS applicants (
    id SERIAL PRIMARY KEY,
    roll_no VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    "fatherName" VARCHAR(100) NOT NULL,
    "motherName" VARCHAR(100) NULL,
    email VARCHAR(100) NOT NULL,
    alt_email VARCHAR(100) NULL,
    "DOB" DATE NOT NULL,
    phone VARCHAR(20) NOT NULL,
    alt_phone VARCHAR(50) NULL,
    "Address" TEXT NOT NULL,
    course VARCHAR(50) NOT NULL,
    batch VARCHAR(50) DEFAULT '2024-2026',
    "Qualification" VARCHAR(50) NOT NULL,
    "Enrollment_Date" DATE DEFAULT CURRENT_DATE,
    profile_photo TEXT NULL,
    gender VARCHAR(20) DEFAULT 'Male',
    blood_group VARCHAR(10) DEFAULT 'O+',
    status VARCHAR(20) DEFAULT 'Active',
    
    -- Student KYC & Document Verification Fields
    aadhaar_no VARCHAR(50) NULL,
    aadhaar_status VARCHAR(30) DEFAULT 'Submitted',          -- 'Verified' | 'Submitted' | 'Pending' | 'Rejected'
    marksheet_10th_roll VARCHAR(50) NULL,
    marksheet_10th_status VARCHAR(30) DEFAULT 'Submitted',   -- 'Verified' | 'Submitted' | 'Pending' | 'Rejected'
    marksheet_12th_status VARCHAR(30) DEFAULT 'Pending',     -- 'Verified' | 'Submitted' | 'Pending' | 'Rejected' | 'N/A'
    tc_status VARCHAR(30) DEFAULT 'Pending',                 -- 'Verified' | 'Submitted' | 'Pending' | 'Rejected'
    category_cert_status VARCHAR(30) DEFAULT 'General',      -- 'Verified' | 'Submitted' | 'Pending' | 'General'
    documents_status VARCHAR(40) DEFAULT 'Pending Verification', -- 'Verified' | 'Pending Verification' | 'Documents Incomplete'
    doc_remarks TEXT NULL
);

CREATE INDEX IF NOT EXISTS idx_applicants_course ON applicants(course);
CREATE INDEX IF NOT EXISTS idx_applicants_documents_status ON applicants(documents_status);
CREATE INDEX IF NOT EXISTS idx_applicants_email ON applicants(email);

-- ----------------------------------------------------------------------------
-- 6. PAYMENTS & FEE LEDGER TABLE
-- ----------------------------------------------------------------------------
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
);

CREATE INDEX IF NOT EXISTS idx_payments_student_id ON payments(student_id);
CREATE INDEX IF NOT EXISTS idx_payments_transaction_id ON payments(transaction_id);

-- ----------------------------------------------------------------------------
-- 7. USERS & CREDENTIALS TABLE (RBAC)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL,                               -- 'admin' | 'teacher' | 'student'
    name VARCHAR(100) NULL,
    student_id INT NULL,
    teacher_id INT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_users_student
        FOREIGN KEY (student_id) REFERENCES applicants(id) ON DELETE SET NULL,
    CONSTRAINT fk_users_teacher
        FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- ----------------------------------------------------------------------------
-- 8. LANDING PAGE CMS CONTENT TABLE (with JSONB support for multi-contact)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS landing_cms (
    id INT PRIMARY KEY DEFAULT 1,
    hero JSONB NOT NULL,
    about JSONB NOT NULL,
    features JSONB NOT NULL,
    gallery JSONB NOT NULL,
    contact JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- SEED INITIAL INSTITUTIONAL DATA
-- ============================================================================

-- Fee Structure Seed
INSERT INTO course_fees (course, tuition_fee, lab_fee, library_fee, exam_fee, development_fee, total_fee)
VALUES 
  ('COPA', 10000, 1500, 500, 1000, 500, 13500),
  ('Electrician', 15000, 2500, 1000, 1500, 1000, 21000),
  ('Fitter', 14000, 2000, 1000, 1500, 1000, 19500)
ON CONFLICT (course) DO UPDATE SET
  tuition_fee = EXCLUDED.tuition_fee,
  lab_fee = EXCLUDED.lab_fee,
  library_fee = EXCLUDED.library_fee,
  exam_fee = EXCLUDED.exam_fee,
  development_fee = EXCLUDED.development_fee,
  total_fee = EXCLUDED.total_fee;

-- Courses Seed
INSERT INTO courses (code, name, duration, seats, enrolled, hod, description, batches, semesters)
VALUES
  ('COPA-101', 'COPA', '1 Year / 2 Semesters', 48, 42, 'Er. Amit Sharma', 'Computer Operator & Programming Assistant - Software, web, and office automation.', ARRAY['2024-2025', '2024-2026', '2025-2027'], 2),
  ('ELEC-201', 'Electrician', '2 Years / 4 Semesters', 40, 38, 'Prof. Priya Verma', 'Electrician Engineering Trade - Domestic & industrial wiring, AC/DC machines, transformers.', ARRAY['2023-2025', '2024-2026', '2025-2027'], 4),
  ('FITT-301', 'Fitter', '2 Years / 4 Semesters', 40, 35, 'Er. Rajesh Kumar', 'Fitter Mechanical Trade - High precision fitting, lathe, milling, welding and fabrication.', ARRAY['2023-2025', '2024-2026', '2025-2027'], 4)
ON CONFLICT (code) DO NOTHING;

-- Teachers Seed
INSERT INTO teachers (employee_id, name, email, phone, department, designation, qualification, experience, assigned_courses, assigned_batches)
VALUES
  ('EMP-MG-101', 'Er. Amit Sharma', 'amit.sharma@mgiti.edu', '9876543210', 'Computer Operator & Programming Assistant', 'Senior Instructor & HOD', 'B.Tech (CSE), MCA, CITS Certified', '8 Years', ARRAY['COPA'], ARRAY['2024-2026', '2025-2027']),
  ('EMP-MG-102', 'Prof. Priya Verma', 'priya.verma@mgiti.edu', '9876543211', 'Electrician Trade', 'Master Technical Trainer', 'B.Tech (Electrical), NCVT Master Certified', '10 Years', ARRAY['Electrician'], ARRAY['2024-2026', '2025-2027']),
  ('EMP-MG-103', 'Er. Rajesh Kumar', 'rajesh.kumar@mgiti.edu', '9876543212', 'Fitter Trade', 'Workshop Superintendent & Senior Instructor', 'Diploma (Mech Engg), CITS Certified', '12 Years', ARRAY['Fitter'], ARRAY['2024-2026', '2025-2027'])
ON CONFLICT (employee_id) DO NOTHING;

-- Students Seed (Document details + multiple contacts)
INSERT INTO applicants (
  id, roll_no, name, "fatherName", "motherName", email, alt_email, "DOB", phone, alt_phone, "Address",
  course, batch, "Qualification", "Enrollment_Date", gender, blood_group, status,
  aadhaar_no, aadhaar_status, marksheet_10th_roll, marksheet_10th_status, marksheet_12th_status, tc_status, category_cert_status, documents_status, doc_remarks
) VALUES
  (
    1, 'MG-2024-001', 'Aarav Sharma', 'Mr. Suresh Sharma', 'Mrs. Geeta Sharma',
    'aarav.sharma@gmail.com', 'aarav.personal@gmail.com', '2004-05-12', '9812345670', '9812345679 (Parent)',
    'Ward No. 4, Madhubani, Bihar - 847211', 'COPA', '2024-2026', '12th Pass (Science)', '2024-07-10', 'Male', 'O+', 'Active',
    '5821-9043-1290', 'Verified', 'BSEB-2022-0941', 'Verified', 'Verified', 'Verified', 'General', 'Verified',
    'All original documents submitted and verified by Admin'
  ),
  (
    2, 'MG-2024-002', 'Sneha Patel', 'Mr. Vinod Patel', 'Mrs. Shashi Patel',
    'sneha.patel@gmail.com', 'patel.sneha@yahoo.com', '2003-11-20', '9812345671', '9812345678 (Father)',
    'Station Road, Darbhanga, Bihar - 846004', 'Electrician', '2024-2026', '10th Pass', '2024-07-12', 'Female', 'B+', 'Active',
    '7820-4419-8320', 'Verified', 'CBSE-2022-7719', 'Verified', 'N/A', 'Verified', 'General', 'Verified',
    'Aadhaar and Class 10th marksheet verified'
  ),
  (
    3, 'MG-2024-003', 'Rohan Singh', 'Mr. Dharmendra Singh', 'Mrs. Malti Devi',
    'rohan.singh@gmail.com', 'rohan.tech@gmail.com', '2004-02-18', '9812345672', '9812345677 (Guardian)',
    'Gandhi Nagar, Samastipur, Bihar - 848101', 'Fitter', '2024-2026', '10th Pass (Maths)', '2024-07-15', 'Male', 'A+', 'Active',
    '3391-0028-4411', 'Verified', 'BSEB-2022-3301', 'Verified', 'N/A', 'Submitted', 'Submitted', 'Pending Verification',
    'Transfer Certificate and Category Certificate awaiting verification'
  ),
  (
    4, 'MG-2024-004', 'Pooja Gupta', 'Mr. Rajendra Gupta', 'Mrs. Sunita Devi',
    'pooja.gupta@gmail.com', 'guptapooja.dev@gmail.com', '2005-09-08', '9812345673', '9812345676 (Mother)',
    'College Road, Sakri, Madhubani - 847239', 'COPA', '2024-2026', '12th Pass (Commerce)', '2024-07-18', 'Female', 'AB+', 'Active',
    '9910-3849-1120', 'Pending', 'BSEB-2023-8821', 'Pending', 'Pending', 'Pending', 'General', 'Documents Incomplete',
    'Physical verification required: Aadhaar card copy and Marksheets pending'
  )
ON CONFLICT (id) DO UPDATE SET
  roll_no = EXCLUDED.roll_no,
  name = EXCLUDED.name,
  "fatherName" = EXCLUDED."fatherName",
  "motherName" = EXCLUDED."motherName",
  email = EXCLUDED.email,
  alt_email = EXCLUDED.alt_email,
  phone = EXCLUDED.phone,
  alt_phone = EXCLUDED.alt_phone,
  aadhaar_no = EXCLUDED.aadhaar_no,
  aadhaar_status = EXCLUDED.aadhaar_status,
  marksheet_10th_roll = EXCLUDED.marksheet_10th_roll,
  marksheet_10th_status = EXCLUDED.marksheet_10th_status,
  marksheet_12th_status = EXCLUDED.marksheet_12th_status,
  tc_status = EXCLUDED.tc_status,
  category_cert_status = EXCLUDED.category_cert_status,
  documents_status = EXCLUDED.documents_status,
  doc_remarks = EXCLUDED.doc_remarks;

SELECT setval('applicants_id_seq', (SELECT MAX(id) FROM applicants));

-- Payments Seed
INSERT INTO payments (id, student_id, student_name, student_course, amount, payment_method, transaction_id, payment_mode, payment_status, payment_date, remarks)
VALUES
  (1, 1, 'Aarav Sharma', 'COPA', 13500, 'UPI (Google Pay)', 'TXN-UPI-9928172635', 'Online', 'Success', '2024-07-10 11:30:00+00', 'Full Course Fee Paid (Admission & Tuition)'),
  (2, 2, 'Sneha Patel', 'Electrician', 12000, 'Net Banking', 'TXN-NB-8837192019', 'Online', 'Success', '2024-07-12 14:15:00+00', '1st Installment Paid'),
  (3, 3, 'Rohan Singh', 'Fitter', 10000, 'Cash at Desk', 'TXN-CSH-1029384756', 'Offline', 'Success', '2024-07-15 09:45:00+00', 'Registration & Term 1 Fee'),
  (4, 4, 'Pooja Gupta', 'COPA', 5000, 'UPI (PhonePe)', 'TXN-UPI-7746192834', 'Online', 'Success', '2024-07-18 16:00:00+00', 'Initial Admission Booking Fee')
ON CONFLICT (id) DO NOTHING;

SELECT setval('payments_id_seq', (SELECT MAX(id) FROM payments));
