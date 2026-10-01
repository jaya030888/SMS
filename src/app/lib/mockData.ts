// src/app/lib/mockData.ts
// Comprehensive initial dataset and persistent mock store for ITI ERP System

export interface UserAccount {
  id: number;
  username: string;
  password_hash: string; // salt:scrypt or plaintext verification
  role: 'admin' | 'teacher' | 'student';
  student_id?: number;
  teacher_id?: number;
  name: string;
}

export interface Student {
  id: number;
  roll_no: string;
  name: string;
  fatherName: string;
  motherName?: string;
  email: string;
  alt_email?: string;
  DOB: string;
  phone: string;
  alt_phone?: string;
  Address: string;
  course: string;
  batch: string;
  Qualification: string;
  Enrollment_Date: string;
  profile_photo?: string;
  gender: string;
  blood_group?: string;
  status: 'Active' | 'Completed' | 'Suspended';
  // Document Verification Details
  aadhaar_no: string;
  aadhaar_status: 'Verified' | 'Submitted' | 'Pending' | 'Rejected';
  marksheet_10th_roll?: string;
  marksheet_10th_status: 'Verified' | 'Submitted' | 'Pending' | 'Rejected';
  marksheet_12th_status: 'Verified' | 'Submitted' | 'Pending' | 'Rejected' | 'N/A';
  tc_status: 'Verified' | 'Submitted' | 'Pending' | 'Rejected';
  category_cert_status: 'Verified' | 'Submitted' | 'Pending' | 'General';
  documents_status: 'Verified' | 'Pending Verification' | 'Documents Incomplete';
  doc_remarks?: string;
  amount_paid?: number;
  payment_status?: string;
  remaining_balance?: number;
}

export interface Teacher {
  id: number;
  employee_id: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  designation: string;
  qualification: string;
  experience: string;
  assigned_courses: string[];
  assigned_batches: string[];
  joining_date: string;
  status: 'Active' | 'On Leave' | 'Inactive';
  profile_photo?: string;
}

export interface CourseBatch {
  id: number;
  code: string;
  name: string;
  duration: string;
  seats: number;
  enrolled: number;
  hod: string;
  description: string;
  batches: string[];
  semesters: number;
}

export interface CourseFee {
  course: string;
  tuition_fee: number;
  lab_fee: number;
  library_fee: number;
  exam_fee: number;
  development_fee: number;
  total_fee: number;
}

export interface Payment {
  id: number;
  student_id: number;
  student_name?: string;
  student_course?: string;
  amount: number;
  payment_method: string;
  transaction_id: string;
  payment_mode: string;
  payment_status: 'Success' | 'Pending' | 'Failed';
  payment_date: string;
  remarks?: string;
}

export interface PublishedMarksheet {
  id: number;
  student_id: number;
  student_name: string;
  roll_no: string;
  course: string;
  batch: string;
  semester: string;
  exam_session: string;
  issue_date: string;
  certificate_no: string;
  total_marks: number;
  max_marks: number;
  percentage: number;
  grade: string;
  result: 'PASS' | 'DISTINCTION';
  subjects: Array<{
    code: string;
    name: string;
    max_marks: number;
    min_pass_marks: number;
    secured_marks: number;
    grade: string;
  }>;
  status: 'Published' | 'Accepted by Student';
  accepted_at?: string;
  admin_signature: string;
}

export interface LandingCMSData {
  hero: {
    eyebrow: string;
    title_1: string;
    title_2: string;
    desc: string;
    card_year: string;
    card_title: string;
    card_desc: string;
    badge_govt: string;
    badge_govt_desc: string;
    badge_alumni: string;
    badge_alumni_desc: string;
    badge_placement: string;
    badge_placement_desc: string;
  };
  about: {
    eyebrow: string;
    title: string;
    desc_1: string;
    desc_2: string;
    points: string[];
  };
  features: Array<{
    id: number;
    title: string;
    desc: string;
    icon: string;
  }>;
  gallery: Array<{
    id: number;
    title: string;
    category: string;
    imageUrl?: string;
    iconName?: string;
  }>;
  contact: {
    phone: string;
    email: string;
    phones?: string[];
    emails?: string[];
    address: string;
    officeHours: string;
    affiliation: string;
  };
}

// Initial Data Seed
export const initialTeachers: Teacher[] = [
  {
    id: 1,
    employee_id: "EMP-MG-101",
    name: "Er. Amit Sharma",
    email: "amit.sharma@mgiti.edu",
    phone: "9876543210",
    department: "Computer Operator & Programming Assistant",
    designation: "Senior Instructor & HOD",
    qualification: "B.Tech (CSE), MCA, CITS Certified",
    experience: "8 Years",
    assigned_courses: ["COPA"],
    assigned_batches: ["2024-2026", "2025-2027"],
    joining_date: "2018-06-15",
    status: "Active"
  },
  {
    id: 2,
    employee_id: "EMP-MG-102",
    name: "Prof. Priya Verma",
    email: "priya.verma@mgiti.edu",
    phone: "9876543211",
    department: "Electrician Trade",
    designation: "Master Technical Trainer",
    qualification: "B.Tech (Electrical), NCVT Master Certified",
    experience: "10 Years",
    assigned_courses: ["Electrician"],
    assigned_batches: ["2024-2026", "2025-2027"],
    joining_date: "2016-08-01",
    status: "Active"
  },
  {
    id: 3,
    employee_id: "EMP-MG-103",
    name: "Er. Rajesh Kumar",
    email: "rajesh.kumar@mgiti.edu",
    phone: "9876543212",
    department: "Fitter Trade",
    designation: "Workshop Superintendent",
    qualification: "Diploma (Mechanical Engg), CITS Certified",
    experience: "12 Years",
    assigned_courses: ["Fitter"],
    assigned_batches: ["2024-2026", "2025-2027"],
    joining_date: "2015-02-20",
    status: "Active"
  }
];

export const initialStudents: Student[] = [
  {
    id: 1,
    roll_no: "MG-2024-001",
    name: "Aarav Sharma",
    fatherName: "Mr. Suresh Sharma",
    motherName: "Mrs. Geeta Sharma",
    email: "aarav.sharma@gmail.com",
    alt_email: "aarav.personal@gmail.com",
    DOB: "2004-05-12",
    phone: "9812345670",
    alt_phone: "9812345679 (Parent)",
    Address: "Ward No. 4, Madhubani, Bihar - 847211",
    course: "COPA",
    batch: "2024-2026",
    Qualification: "12th Pass (Science)",
    Enrollment_Date: "2024-07-10",
    gender: "Male",
    blood_group: "O+",
    status: "Active",
    aadhaar_no: "5821-9043-1290",
    aadhaar_status: "Verified",
    marksheet_10th_roll: "BSEB-2022-0941",
    marksheet_10th_status: "Verified",
    marksheet_12th_status: "Verified",
    tc_status: "Verified",
    category_cert_status: "General",
    documents_status: "Verified",
    doc_remarks: "All original documents submitted and verified by Admin on 12-Jul-2024"
  },
  {
    id: 2,
    roll_no: "MG-2024-002",
    name: "Sneha Patel",
    fatherName: "Mr. Vinod Patel",
    motherName: "Mrs. Shashi Patel",
    email: "sneha.patel@gmail.com",
    alt_email: "patel.sneha@yahoo.com",
    DOB: "2003-11-20",
    phone: "9812345671",
    alt_phone: "9812345678 (Father)",
    Address: "Station Road, Darbhanga, Bihar - 846004",
    course: "Electrician",
    batch: "2024-2026",
    Qualification: "10th Pass",
    Enrollment_Date: "2024-07-12",
    gender: "Female",
    blood_group: "B+",
    status: "Active",
    aadhaar_no: "7820-4419-8320",
    aadhaar_status: "Verified",
    marksheet_10th_roll: "CBSE-2022-7719",
    marksheet_10th_status: "Verified",
    marksheet_12th_status: "N/A",
    tc_status: "Verified",
    category_cert_status: "Verified",
    documents_status: "Verified",
    doc_remarks: "OBC certificate & 10th marksheet verified."
  },
  {
    id: 3,
    roll_no: "MG-2024-003",
    name: "Rohan Singh",
    fatherName: "Mr. Dharmendra Singh",
    motherName: "Mrs. Anita Singh",
    email: "rohan.singh@gmail.com",
    DOB: "2004-02-18",
    phone: "9812345672",
    Address: "Gandhi Nagar, Samastipur, Bihar - 848101",
    course: "Fitter",
    batch: "2024-2026",
    Qualification: "10th Pass",
    Enrollment_Date: "2024-07-15",
    gender: "Male",
    blood_group: "AB+",
    status: "Active",
    aadhaar_no: "3491-8820-1948",
    aadhaar_status: "Submitted",
    marksheet_10th_roll: "BSEB-2022-5501",
    marksheet_10th_status: "Verified",
    marksheet_12th_status: "N/A",
    tc_status: "Pending",
    category_cert_status: "General",
    documents_status: "Pending Verification",
    doc_remarks: "Original School Leaving Certificate / TC pending from student."
  },
  {
    id: 4,
    roll_no: "MG-2025-004",
    name: "Pooja Gupta",
    fatherName: "Mr. Rajendra Gupta",
    motherName: "Mrs. Meena Gupta",
    email: "pooja.gupta@gmail.com",
    DOB: "2005-09-08",
    phone: "9812345673",
    Address: "College Road, Sakri, Madhubani - 847239",
    course: "COPA",
    batch: "2025-2027",
    Qualification: "12th Pass (Arts)",
    Enrollment_Date: "2025-06-20",
    gender: "Female",
    blood_group: "A+",
    status: "Active",
    aadhaar_no: "9041-3312-8847",
    aadhaar_status: "Submitted",
    marksheet_10th_roll: "CBSE-2023-1029",
    marksheet_10th_status: "Submitted",
    marksheet_12th_status: "Pending",
    tc_status: "Pending",
    category_cert_status: "Pending",
    documents_status: "Documents Incomplete",
    doc_remarks: "12th marksheet copy and Caste certificate upload pending."
  }
];

export const initialCourses: CourseBatch[] = [
  {
    id: 1,
    code: "COPA-101",
    name: "COPA",
    duration: "1 Year / 2 Semesters",
    seats: 48,
    enrolled: 42,
    hod: "Er. Amit Sharma",
    description: "Computer Operator & Programming Assistant - Covers programming fundamentals, web development, office tools, database management & IT skills.",
    batches: ["2024-2025", "2024-2026", "2025-2027"],
    semesters: 2
  },
  {
    id: 2,
    code: "ELEC-201",
    name: "Electrician",
    duration: "2 Years / 4 Semesters",
    seats: 40,
    enrolled: 38,
    hod: "Prof. Priya Verma",
    description: "Electrician Engineering Trade - Comprehensive training in domestic & industrial wiring, AC/DC machines, transformers, renewable energy, and panel building.",
    batches: ["2023-2025", "2024-2026", "2025-2027"],
    semesters: 4
  },
  {
    id: 3,
    code: "FITT-301",
    name: "Fitter",
    duration: "2 Years / 4 Semesters",
    seats: 40,
    enrolled: 35,
    hod: "Er. Rajesh Kumar",
    description: "Fitter Mechanical Trade - High precision fitting, lathe machine operation, welding, precision measuring instruments, pipe fitting, and hydraulics.",
    batches: ["2023-2025", "2024-2026", "2025-2027"],
    semesters: 4
  }
];

export const initialFees: CourseFee[] = [
  { course: 'COPA', tuition_fee: 10000, lab_fee: 1500, library_fee: 500, exam_fee: 1000, development_fee: 500, total_fee: 13500 },
  { course: 'Electrician', tuition_fee: 15000, lab_fee: 2500, library_fee: 1000, exam_fee: 1500, development_fee: 1000, total_fee: 21000 },
  { course: 'Fitter', tuition_fee: 14000, lab_fee: 2000, library_fee: 1000, exam_fee: 1500, development_fee: 1000, total_fee: 19500 }
];

export const initialPayments: Payment[] = [
  {
    id: 1,
    student_id: 1,
    student_name: "Aarav Sharma",
    student_course: "COPA",
    amount: 13500,
    payment_method: "UPI (Google Pay)",
    transaction_id: "TXN-UPI-9928172635",
    payment_mode: "Online",
    payment_status: "Success",
    payment_date: "2024-07-10T11:30:00Z",
    remarks: "Full Course Fee Paid (Admission & Tuition)"
  },
  {
    id: 2,
    student_id: 2,
    student_name: "Sneha Patel",
    student_course: "Electrician",
    amount: 12000,
    payment_method: "Net Banking",
    transaction_id: "TXN-NB-8837192019",
    payment_mode: "Online",
    payment_status: "Success",
    payment_date: "2024-07-12T14:15:00Z",
    remarks: "1st Installment Paid"
  },
  {
    id: 3,
    student_id: 3,
    student_name: "Rohan Singh",
    student_course: "Fitter",
    amount: 10000,
    payment_method: "Cash at Desk",
    transaction_id: "TXN-CSH-1029384756",
    payment_mode: "Offline",
    payment_status: "Success",
    payment_date: "2024-07-15T09:45:00Z",
    remarks: "Registration & Term 1 Fee"
  },
  {
    id: 4,
    student_id: 4,
    student_name: "Pooja Gupta",
    student_course: "COPA",
    amount: 2000,
    payment_method: "UPI",
    transaction_id: "TXN-UPI-7746281920",
    payment_mode: "Online",
    payment_status: "Success",
    payment_date: "2025-06-20T10:00:00Z",
    remarks: "Admission Registration Fee"
  }
];

export const initialPublishedMarksheets: PublishedMarksheet[] = [
  {
    id: 1,
    student_id: 1,
    student_name: "Aarav Sharma",
    roll_no: "MG-2024-001",
    course: "COPA",
    batch: "2024-2026",
    semester: "Semester 1 (Annual AITT Exam)",
    exam_session: "NCVT All India Trade Test - July 2025",
    issue_date: "2025-08-10",
    certificate_no: "NCVT-AITT-2025-COPA-0091",
    total_marks: 556,
    max_marks: 600,
    percentage: 92.6,
    grade: "A+",
    result: "DISTINCTION",
    subjects: [
      { code: "TT-101", name: "Trade Theory & Computer Fundamentals", max_marks: 100, min_pass_marks: 33, secured_marks: 88, grade: "A+" },
      { code: "TP-102", name: "Trade Practical (HTML/JS/Database Lab)", max_marks: 250, min_pass_marks: 150, secured_marks: 232, grade: "O" },
      { code: "ES-103", name: "Employability & Workplace Skills", max_marks: 50, min_pass_marks: 17, secured_marks: 46, grade: "A+" },
      { code: "FA-104", name: "Formative Assessment & Sessional Work", max_marks: 200, min_pass_marks: 120, secured_marks: 190, grade: "O" }
    ],
    status: "Published",
    admin_signature: "Controller of Examinations & Principal, Maa Gauri ITI"
  },
  {
    id: 2,
    student_id: 2,
    student_name: "Sneha Patel",
    roll_no: "MG-2024-002",
    course: "Electrician",
    batch: "2024-2026",
    semester: "Semester 1 (AITT Mid-Term Exam)",
    exam_session: "NCVT All India Trade Test - July 2025",
    issue_date: "2025-08-10",
    certificate_no: "NCVT-AITT-2025-ELEC-0118",
    total_marks: 391,
    max_marks: 450,
    percentage: 86.8,
    grade: "A+",
    result: "PASS",
    subjects: [
      { code: "TT-201", name: "Trade Theory (AC/DC Machines & Wiring)", max_marks: 100, min_pass_marks: 33, secured_marks: 82, grade: "A" },
      { code: "TP-202", name: "Trade Practical (Electrical Machines Lab)", max_marks: 250, min_pass_marks: 150, secured_marks: 220, grade: "A+" },
      { code: "WS-203", name: "Workshop Calculation & Science", max_marks: 50, min_pass_marks: 17, secured_marks: 44, grade: "A+" },
      { code: "ED-204", name: "Engineering Drawing (Circuits)", max_marks: 50, min_pass_marks: 17, secured_marks: 45, grade: "A+" }
    ],
    status: "Accepted by Student",
    accepted_at: "2025-08-14T15:20:00Z",
    admin_signature: "Controller of Examinations & Principal, Maa Gauri ITI"
  }
];

export const initialLandingCMS: LandingCMSData = {
  hero: {
    eyebrow: "Govt. Recognized Vocational Training",
    title_1: "Technical Skills for a",
    title_2: "Brighter Career",
    desc: "Maa Gauri Private ITI is a premier vocational training institute affiliated with NCVT (DGT), Govt. of India, empowering youth with industry-ready skills, modern workshops, and 100% placement assistance.",
    card_year: "Est. 2018",
    card_title: "Vocational Excellence",
    card_desc: "Industry-aligned trades with modern equipment and hands-on practical sessions.",
    badge_govt: "100%",
    badge_govt_desc: "NCVT Affiliated",
    badge_alumni: "1500+",
    badge_alumni_desc: "Certified Alumni",
    badge_placement: "94%",
    badge_placement_desc: "Placement Rate"
  },
  about: {
    eyebrow: "About Our Institute",
    title: "Dedicated to Technical & Industrial Excellence",
    desc_1: "Maa Gauri Private Industrial Training Institute (ITI) was established with a vision to impart quality vocational and technical education to aspiring youth in rural and urban areas.",
    desc_2: "Affiliated with the National Council for Vocational Training (NCVT), Directorate General of Training (DGT), Ministry of Skill Development & Entrepreneurship, Govt. of India, our campus delivers industry-standard curriculum.",
    points: [
      "NCVT Affiliated and DGT Compliant Curriculum",
      "Certified and Experienced Trade Instructors",
      "Fully Equipped Computer & Electrical Labs",
      "Robust Industry Tie-ups and Campus Placements"
    ]
  },
  features: [
    {
      id: 1,
      title: "Experienced Faculty",
      desc: "Learn from industry-certified trainers with decades of technical experience.",
      icon: "Award"
    },
    {
      id: 2,
      title: "Modern Workshops",
      desc: "Equipped with modern machinery, testing equipment, and safety gear.",
      icon: "Wrench"
    },
    {
      id: 3,
      title: "100% NCVT Certified",
      desc: "Nationally and internationally recognized trade certification on completion.",
      icon: "ShieldCheck"
    },
    {
      id: 4,
      title: "Placement Assistance",
      desc: "Dedicated placement cell connecting graduates with top industrial employers.",
      icon: "Briefcase"
    }
  ],
  gallery: [
    { id: 1, title: "Workshop Machinery", category: "Mechanical", iconName: "Wrench" },
    { id: 2, title: "Computer Lab", category: "COPA", iconName: "Monitor" },
    { id: 3, title: "Practical Electrical Lab", category: "Electrician", iconName: "BookOpen" },
    { id: 4, title: "Tool & Equipment Zone", category: "Fitter", iconName: "Settings" },
    { id: 5, title: "Campus Infrastructure", category: "Campus", iconName: "Building" },
    { id: 6, title: "Hands-on Practical Training", category: "Workshops", iconName: "Lightbulb" }
  ],
  contact: {
    phone: "+91 94310 12345",
    email: "info@mgiti.edu.in",
    phones: ["+91 94310 12345", "+91 98765 43210"],
    emails: ["info@mgiti.edu.in", "admissions@mgiti.edu.in"],
    address: "Maa Gauri ITI Campus, Main Road, Madhubani, Bihar - 847211",
    officeHours: "Monday – Saturday: 08:30 AM – 04:30 PM",
    affiliation: "Affiliation Code: DGT-6/24/18/2018-TC"
  }
};

// In-Memory Global Store with full mutation helper functions
class ERPStore {
  teachers: Teacher[] = [...initialTeachers];
  students: Student[] = [...initialStudents];
  courses: CourseBatch[] = [...initialCourses];
  fees: CourseFee[] = [...initialFees];
  payments: Payment[] = [...initialPayments];
  marksheets: PublishedMarksheet[] = [...initialPublishedMarksheets];
  landingCMS: LandingCMSData = JSON.parse(JSON.stringify(initialLandingCMS));

  constructor() {}

  // Teacher methods
  getTeachers() { return this.teachers; }
  addTeacher(t: Omit<Teacher, 'id'>) {
    const newId = this.teachers.length > 0 ? Math.max(...this.teachers.map(x => x.id)) + 1 : 1;
    const newTeacher: Teacher = { ...t, id: newId };
    this.teachers.push(newTeacher);
    return newTeacher;
  }
  updateTeacher(id: number, updates: Partial<Teacher>) {
    const idx = this.teachers.findIndex(t => t.id === id);
    if (idx !== -1) {
      this.teachers[idx] = { ...this.teachers[idx], ...updates };
      return this.teachers[idx];
    }
    return null;
  }
  deleteTeacher(id: number) {
    this.teachers = this.teachers.filter(t => t.id !== id);
    return true;
  }

  // Student methods
  getStudents() { return this.students; }
  getStudentById(id: number) { return this.students.find(s => s.id === id); }
  addStudent(s: Omit<Student, 'id' | 'roll_no'>) {
    const newId = this.students.length > 0 ? Math.max(...this.students.map(x => x.id)) + 1 : 1;
    const year = new Date().getFullYear();
    const roll_no = `MG-${year}-${String(newId).padStart(3, '0')}`;
    const newStudent: Student = { 
      ...s, 
      id: newId, 
      roll_no,
      aadhaar_no: s.aadhaar_no || `XXXX-XXXX-${Math.floor(1000 + Math.random() * 9000)}`,
      aadhaar_status: s.aadhaar_status || 'Submitted',
      marksheet_10th_status: s.marksheet_10th_status || 'Submitted',
      marksheet_12th_status: s.marksheet_12th_status || 'Pending',
      tc_status: s.tc_status || 'Pending',
      category_cert_status: s.category_cert_status || 'General',
      documents_status: s.documents_status || 'Pending Verification'
    };
    this.students.push(newStudent);
    return newStudent;
  }
  updateStudent(id: number, updates: Partial<Student>) {
    const idx = this.students.findIndex(s => s.id === id);
    if (idx !== -1) {
      this.students[idx] = { ...this.students[idx], ...updates };
      return this.students[idx];
    }
    return null;
  }
  deleteStudent(id: number) {
    this.students = this.students.filter(s => s.id !== id);
    return true;
  }

  // Course methods
  getCourses() { return this.courses; }
  addCourse(c: Omit<CourseBatch, 'id'>) {
    const newId = this.courses.length > 0 ? Math.max(...this.courses.map(x => x.id)) + 1 : 1;
    const newCourse: CourseBatch = { ...c, id: newId };
    this.courses.push(newCourse);
    return newCourse;
  }

  // Payments methods
  getPayments(student_id?: number) {
    if (student_id) return this.payments.filter(p => p.student_id === student_id);
    return this.payments;
  }
  addPayment(p: Omit<Payment, 'id' | 'payment_date' | 'transaction_id'>) {
    const newId = this.payments.length > 0 ? Math.max(...this.payments.map(x => x.id)) + 1 : 1;
    const transaction_id = `TXN-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    const payment_date = new Date().toISOString();
    const newPayment: Payment = { ...p, id: newId, transaction_id, payment_date };
    this.payments.unshift(newPayment);
    return newPayment;
  }

  // Marksheets methods
  getMarksheets(student_id?: number): PublishedMarksheet[] {
    if (student_id) {
      return this.marksheets.filter(m => m.student_id === student_id);
    }
    return this.marksheets;
  }

  acceptMarksheet(id: number, student_id: number): PublishedMarksheet | null {
    const idx = this.marksheets.findIndex(m => m.id === id && m.student_id === student_id);
    if (idx !== -1) {
      this.marksheets[idx] = {
        ...this.marksheets[idx],
        status: 'Accepted by Student',
        accepted_at: new Date().toISOString()
      };
      return this.marksheets[idx];
    }
    return null;
  }

  publishMarksheet(m: Omit<PublishedMarksheet, 'id'>): PublishedMarksheet {
    const newId = this.marksheets.length > 0 ? Math.max(...this.marksheets.map(x => x.id)) + 1 : 1;
    const newMarksheet: PublishedMarksheet = { ...m, id: newId };
    this.marksheets.unshift(newMarksheet);
    return newMarksheet;
  }

  // Landing CMS methods
  getLandingCMS(): LandingCMSData {
    return this.landingCMS;
  }

  updateLandingCMS(data: Partial<LandingCMSData>): LandingCMSData {
    this.landingCMS = {
      hero: data.hero ? { ...this.landingCMS.hero, ...data.hero } : this.landingCMS.hero,
      about: data.about ? { ...this.landingCMS.about, ...data.about } : this.landingCMS.about,
      features: data.features ? [...data.features] : this.landingCMS.features,
      gallery: data.gallery ? [...data.gallery] : this.landingCMS.gallery,
      contact: data.contact ? { ...this.landingCMS.contact, ...data.contact } : this.landingCMS.contact,
    };
    return this.landingCMS;
  }

  resetLandingCMS(): LandingCMSData {
    this.landingCMS = JSON.parse(JSON.stringify(initialLandingCMS));
    return this.landingCMS;
  }
}

// Global Singleton Store Instance
export const erpStore = new ERPStore();
