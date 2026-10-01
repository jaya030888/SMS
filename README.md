# 🏛️ Institute Management & Student ERP Platform

A SaaS-style **Institute Management & Student ERP Platform** built with **Next.js 15**, **Tailwind CSS v4**, and **PostgreSQL**. Engineered with multi-role access control for **Administrators**, **Faculty/Teachers**, and **Students**.

---

## ✨ Features by Role

### 👑 Admin Portal
- **Executive Analytics Dashboard:** Real-time KPI summaries, visual enrollment charts, batch distribution breakdown, fee collection status, and institutional activity log.
- **Student Management:** Full CRUD operations, registration workflow with photo upload, multi-field search, batch filtering, fee summary, and profile cards.
- **Faculty & Teacher Management:** Instructor onboarding, department and designation tracking, assigned trade mapping, and directory.
- **Course & Fee Configuration:** Itemized billing configuration (Tuition, Lab/Practical, Library, Internal Exam, Development fees).
- **Attendance Console:** Daily roll-call with bulk "Mark All Present/Absent" toggles, batch filtering, cumulative analytics, and `<75%` low-attendance warning flags.
- **Marks & Grading System:** Theory/Practical mark evaluation, automatic Grade (`O, A+, A, B+, B, C, F`) and GPA calculation.
- **Finance & Fee Ledger:** Outstanding balance tracking, offline/online payment recording, instant printable tax receipts, and CSV exports.
- **Institutional Notices:** Targeted announcement publishing (Everyone, Teachers, Students) with priority tagging (`Urgent`, `High`, `Normal`).
- **Reports & Audits:** Printable official letterhead records and CSV exports for Student Directory, Fee Ledger, and Payments Journal.

### 👨‍🏫 Teacher Portal
- **Instructor Dashboard:** Assigned courses, quick actions, schedule overview, and class roster stats.
- **Class Roster:** Student list with search and batch breakdown.
- **Attendance Marking:** Fast daily attendance marking per assigned class.
- **Marks Entry:** Grade sheets with max mark validation and automatic calculations.
- **Staff Notices & Weekly Timetable:** Access official notifications and lecture schedules.

### 🎓 Student Portal
- **Student Dashboard:** Visual progress indicators, enrolled subjects, attendance percentage, batch ranking, and fee overview.
- **Profile Card:** Personal & academic information with profile photo upload.
- **Attendance Tracker:** Monthly attendance calendar, exam eligibility indicator, and safety buffer calculations.
- **Marks & Results:** Subject-wise marks breakdown, semester GPA, and performance cards.
- **Self-Service Fee Portal:** Integrated payment modal supporting UPI QR, Credit/Debit Card, NetBanking, and Instant Printable PDF Invoices.
- **Timetable & Notices:** Live class schedules and institutional notices.

---

## 🔐 Default Demo Accounts

| Role | Username / Email | Password | Direct Portal Route |
| :--- | :--- | :--- | :--- |
| **Administrator** | `jayamyname19@gmail.com` | `12345` | `/pages/Admin/DashBoard` |
| **Teacher / Faculty** | `amit.sharma@mgiti.edu` | `12345` | `/pages/Teacher/DashBoard` |
| **Student** | `1` *(or Aarav Sharma)* | `101` | `/pages/Student/DashBoard` |

---

## 🛠️ Technology Stack

- **Frontend:** Next.js 15 (App Router, Turbopack), React 19, Tailwind CSS v4, Lucide Icons
- **Backend:** Next.js Route Handlers (Node.js runtime), JWT HttpOnly Session Authentication
- **Database:** PostgreSQL (with built-in zero-config ERP in-memory store for local testing)
- **Security:** Scrypt password hashing, JWT session authorization, parameterized SQL injection prevention

---

## 🚀 Getting Started Locally

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/your-repo/sms.git
cd sms
npm install
```

### 2. Environment Setup
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
*(Note: If `DATABASE_URL` is omitted, the application will automatically run using the built-in resilient in-memory ERP fallback store!)*

### 3. Database Migration (Optional for Postgres)
If connecting to a live PostgreSQL database:
```bash
node setup-db.js
```

### 4. Start Development Server
```bash
npm run dev
```
Open **`http://localhost:3000`** in your browser.

---

## 📦 Deployment Guide

### Deploying to Vercel
1. Push your repository to GitHub / GitLab.
2. Import project into [Vercel](https://vercel.com).
3. Set the following Environment Variables in the Vercel Project Settings:
   - `DATABASE_URL`: Your PostgreSQL connection string (Neon, Supabase, AWS RDS, etc.)
   - `JWT_SECRET`: A secure 32+ character random string
   - `NODE_ENV`: `production`
4. Run deployment.

### Deploying to Render / Railway / VPS
1. Set the build command: `npm run build`
2. Set the start command: `npm run start`
3. Configure environment variables in dashboard (`DATABASE_URL`, `JWT_SECRET`, `PORT`).
4. Run `node setup-db.js` before first start to seed initial admin credentials and course tables.

---

## 📄 License
Commercial License &copy; 2026 Maa Gauri Private ITI / Educational ERP. All rights reserved.
