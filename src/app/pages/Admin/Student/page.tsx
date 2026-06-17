"use client";

import { useState, useEffect } from "react";
import StuNav from "@/src/app/components/StuNav";
import { 
  CheckCircle, 
  Eye, 
  Search, 
  PlusCircle, 
  Edit, 
  Trash2, 
  X, 
  User, 
  Phone, 
  Mail, 
  Calendar, 
  MapPin, 
  GraduationCap, 
  Filter,
  RefreshCw,
  Save
} from "lucide-react";

interface StudentData {
  id: number;
  name: string;
  fatherName: string;
  email: string;
  DOB: string;
  phone: string;
  Address: string;
  course: string;
  Qualification: string;
  payment_status?: string;
  amount_paid?: number;
  remaining_balance?: number;
  Enrollment_Date?: string;
}

export default function StudentManagementPage() {
  const [students, setStudents] = useState<StudentData[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Search and Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCourse, setFilterCourse] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");

  // Modals management
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentData | null>(null);
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Form fields
  const [name, setName] = useState("");
  const [fatherName, setFatherName] = useState("");
  const [email, setEmail] = useState("");
  const [dob, setDob] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [course, setCourse] = useState("");
  const [qualification, setQualification] = useState("");

  const fetchData = async () => {
    try {
      const [resStudents, resCourses] = await Promise.all([
        fetch("/api/applicants"),
        fetch("/api/course_fees")
      ]);
      if (resStudents.ok) {
        const data = await resStudents.json();
        setStudents(data);
      }
      if (resCourses.ok) {
        const data = await resCourses.json();
        setCourses(data);
      }
    } catch (err) {
      console.error("Error fetching student CRUD data:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const resetForm = () => {
    setName("");
    setFatherName("");
    setEmail("");
    setDob("");
    setPhone("");
    setAddress("");
    setCourse("");
    setQualification("");
    setSelectedStudent(null);
  };

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !fatherName.trim() || !email.trim() || !dob || !phone.trim() || !address.trim() || !course || !qualification) {
      alert("All fields are required.");
      return;
    }
    setFormSubmitting(true);
    try {
      const res = await fetch("/api/applicants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          fatherName: fatherName.trim(),
          email: email.trim(),
          DOB: dob,
          phone: phone.trim(),
          Address: address.trim(),
          course,
          Qualification: qualification,
          amount_paid: 2000, // standard admission registration fee
        }),
      });

      if (res.ok) {
        alert("Student registered successfully!");
        setShowAddModal(false);
        resetForm();
        fetchData();
      } else {
        const err = await res.json();
        alert(`Failed to save student: ${err.error || 'Server error'}`);
      }
    } catch (err) {
      console.error(err);
      alert("An unexpected error occurred.");
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleOpenEdit = (student: StudentData) => {
    setSelectedStudent(student);
    setName(student.name);
    setFatherName(student.fatherName);
    setEmail(student.email);
    // Format date string to YYYY-MM-DD for date input
    let formattedDob = "";
    if (student.DOB) {
      formattedDob = student.DOB.split("T")[0];
    }
    setDob(formattedDob);
    setPhone(String(student.phone));
    setAddress(student.Address);
    setCourse(student.course);
    setQualification(student.Qualification);
    setShowEditModal(true);
  };

  const handleEditStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;
    setFormSubmitting(true);
    try {
      const res = await fetch("/api/applicants", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedStudent.id,
          name: name.trim(),
          fatherName: fatherName.trim(),
          email: email.trim(),
          DOB: dob,
          phone: phone.trim(),
          Address: address.trim(),
          course,
          Qualification: qualification,
        }),
      });

      if (res.ok) {
        alert("Student details updated successfully!");
        setShowEditModal(false);
        resetForm();
        fetchData();
      } else {
        const err = await res.json();
        alert(`Failed to update student: ${err.error || 'Server error'}`);
      }
    } catch (err) {
      console.error(err);
      alert("An unexpected error occurred.");
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDeleteStudent = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete the student "${name}" (ID: #${id})? This will delete all payments and user credentials for this student.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/applicants?id=${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        alert("Student deleted successfully!");
        fetchData();
      } else {
        const err = await res.json();
        alert(`Failed to delete student: ${err.error || 'Server error'}`);
      }
    } catch (err) {
      console.error(err);
      alert("An unexpected error occurred.");
    }
  };

  const handleMarkPaid = (student: StudentData) => {
    if (!confirm(`Are you sure you want to mark student "${student.name}" as fully paid? This will record a cash transaction in the amount of ₹${student.remaining_balance}.`)) {
      return;
    }

    fetch("/api/applicants", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: student.id,
        payment_status: "Paid",
      }),
    })
      .then((res) => {
        if (res.ok) {
          alert("Student marked as fully paid successfully!");
          fetchData();
        } else {
          alert("Failed to update payment status.");
        }
      })
      .catch((err) => {
        console.error("Error marking paid:", err);
      });
  };

  const handleOpenView = (student: StudentData) => {
    setSelectedStudent(student);
    setShowViewModal(true);
  };

  // Filters logic
  const filteredStudents = students.filter((student) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = 
      student.name.toLowerCase().includes(query) ||
      (student.course && student.course.toLowerCase().includes(query)) ||
      String(student.phone).includes(query) ||
      String(student.id).includes(query);
      
    const matchesCourse = filterCourse === "All" || (student.course && student.course.toLowerCase().includes(filterCourse.toLowerCase()));
    const matchesStatus = filterStatus === "All" || (student.payment_status && student.payment_status.toLowerCase() === filterStatus.toLowerCase());

    return matchesSearch && matchesCourse && matchesStatus;
  });

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
    } catch {
      return dateStr;
    }
  };

  const formatCurrency = (val?: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  return (
    <>
      <StuNav name="Student Management" role="admin" />

      <main className="dashboard-page mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header Title Section */}
        <section className="section-title-row flex justify-between items-center mb-6">
          <div>
            <p className="eyebrow m-0 text-primary uppercase text-xs tracking-wider">Registrar Controls</p>
            <h1 className="m-0 text-slate-800 text-3xl font-extrabold tracking-tight">Student Database Management</h1>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleRefresh}
              className="button button-secondary flex items-center gap-1.5"
              disabled={refreshing}
            >
              <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
              Refresh
            </button>
            <button
              onClick={() => {
                resetForm();
                setShowAddModal(true);
              }}
              className="button button-primary flex items-center gap-1.5"
            >
              <PlusCircle size={16} />
              Register New Student
            </button>
          </div>
        </section>

        {/* Directory Controls and Search Filters */}
        <section className="panel bg-white border border-slate-100 p-6 rounded-2xl shadow-sm mb-6">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem" }}>
            {/* Search Box */}
            <div className="search-box" style={{ width: "100%", background: "var(--surface-soft)" }}>
              <Search size={18} />
              <input
                type="text"
                placeholder="Search by student name, phone, or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ border: 0, outline: "none", width: "100%", background: "transparent" }}
              />
            </div>

            {/* Course Filter */}
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-slate-400" />
              <select 
                value={filterCourse} 
                onChange={(e) => setFilterCourse(e.target.value)}
                style={{ minHeight: "52px", background: "var(--surface)", border: "1px solid var(--border)", width: "100%" }}
              >
                <option value="All">All Courses</option>
                {courses.map(c => (
                  <option key={c.course} value={c.course}>{c.course}</option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-slate-400" />
              <select 
                value={filterStatus} 
                onChange={(e) => setFilterStatus(e.target.value)}
                style={{ minHeight: "52px", background: "var(--surface)", border: "1px solid var(--border)", width: "100%" }}
              >
                <option value="All">All Fees Statuses</option>
                <option value="Paid">Paid</option>
                <option value="Pending">Pending</option>
              </select>
            </div>
          </div>
        </section>

        {/* Student Table List */}
        <section className="panel bg-white border border-slate-100 p-6 rounded-2xl shadow-sm">
          {loading ? (
            <div className="text-center py-12 text-slate-500 font-semibold">Loading students directory...</div>
          ) : filteredStudents.length === 0 ? (
            <div className="text-center py-16">
              <Search className="mx-auto text-slate-300 mb-3" size={48} />
              <h3 className="text-lg font-bold text-slate-700">No Records Found</h3>
              <p className="text-sm text-slate-400 mt-1">There are no student profiles matching your query or filter rules.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "900px" }}>
                <thead>
                  <tr style={{ background: "var(--surface-soft)", borderBottom: "1.5px solid var(--border)", color: "var(--ink)", textAlign: "left" }}>
                    <th style={{ padding: "1rem", fontSize: "0.85rem", fontWeight: 700 }}>ID</th>
                    <th style={{ padding: "1rem", fontSize: "0.85rem", fontWeight: 700 }}>Student Name</th>
                    <th style={{ padding: "1rem", fontSize: "0.85rem", fontWeight: 700 }}>Course / Trade</th>
                    <th style={{ padding: "1rem", fontSize: "0.85rem", fontWeight: 700 }}>Phone</th>
                    <th style={{ padding: "1rem", fontSize: "0.85rem", fontWeight: 700 }}>Fees Status</th>
                    <th style={{ padding: "1rem", fontSize: "0.85rem", fontWeight: 700 }}>Remaining Due</th>
                    <th style={{ padding: "1rem", fontSize: "0.85rem", fontWeight: 700, textAlign: "center" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((student) => {
                    const status = student.payment_status || "Pending";
                    return (
                      <tr key={student.id} style={{ borderBottom: "1px solid var(--border)" }}>
                        <td style={{ padding: "1.1rem 1rem", fontFamily: "monospace", color: "var(--muted)" }}>#{student.id}</td>
                        <td style={{ padding: "1.1rem 1rem", fontWeight: 600 }}>{student.name}</td>
                        <td style={{ padding: "1.1rem 1rem" }}>{student.course}</td>
                        <td style={{ padding: "1.1rem 1rem" }}>{student.phone}</td>
                        <td style={{ padding: "1.1rem 1rem" }}>
                          <span className={`status-pill ${status === "Paid" ? "paid" : "pending"}`}>
                            {status}
                          </span>
                        </td>
                        <td style={{ padding: "1.1rem 1rem", fontWeight: 700, color: student.remaining_balance && student.remaining_balance > 0 ? "var(--warning)" : "var(--muted)" }}>
                          {formatCurrency(student.remaining_balance)}
                        </td>
                        <td style={{ padding: "1.1rem 1rem", textAlign: "center" }}>
                          <div className="flex justify-center gap-1.5">
                            <button
                              onClick={() => handleOpenView(student)}
                              className="button button-secondary px-3 py-1.5 text-xs gap-1"
                              style={{ minHeight: "34px" }}
                              title="View details"
                            >
                              <Eye size={14} /> View
                            </button>
                            <button
                              onClick={() => handleOpenEdit(student)}
                              className="button button-secondary px-3 py-1.5 text-xs gap-1"
                              style={{ minHeight: "34px" }}
                              title="Edit profile"
                            >
                              <Edit size={14} /> Edit
                            </button>
                            {status === "Pending" && (
                              <button
                                onClick={() => handleMarkPaid(student)}
                                className="button button-secondary px-3 py-1.5 text-xs gap-1 text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                                style={{ minHeight: "34px" }}
                                title="Clear remaining dues"
                              >
                                <CheckCircle size={14} /> Mark Paid
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteStudent(student.id, student.name)}
                              className="button button-secondary px-3 py-1.5 text-xs gap-1 text-red-600 border-red-200 hover:bg-red-50"
                              style={{ minHeight: "34px" }}
                              title="Delete profile"
                            >
                              <Trash2 size={14} /> Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>

      {/* View Student Details Modal */}
      {showViewModal && selectedStudent && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto relative">
            <button
              onClick={() => setShowViewModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 rounded-lg p-1 hover:bg-slate-100"
            >
              <X size={18} />
            </button>

            <h3 className="text-slate-800 text-xl font-extrabold tracking-tight mb-6 flex items-center gap-1.5">
              <User size={20} className="text-primary" /> Student Profile Card
            </h3>

            <div className="space-y-6">
              {/* Main Info */}
              <div className="bg-slate-50 rounded-xl p-4 flex gap-4 items-center border border-slate-150">
                <div className="h-12 w-12 rounded-full bg-primary text-white flex items-center justify-center text-lg font-black">
                  {selectedStudent.name[0]}
                </div>
                <div>
                  <h4 className="text-base font-extrabold text-slate-850 tracking-tight">{selectedStudent.name}</h4>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-0.5">ID: #{selectedStudent.id} • Enrolled in {selectedStudent.course}</p>
                </div>
              </div>

              {/* Personal Details */}
              <div>
                <h4 className="text-xs font-black uppercase text-slate-450 tracking-wider mb-3">Personal Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex gap-2.5 items-center">
                    <User size={16} className="text-slate-400" />
                    <div>
                      <span className="block text-[10px] text-slate-400 uppercase font-black">Father's Name</span>
                      <strong className="text-slate-700">{selectedStudent.fatherName}</strong>
                    </div>
                  </div>
                  <div className="flex gap-2.5 items-center">
                    <Calendar size={16} className="text-slate-400" />
                    <div>
                      <span className="block text-[10px] text-slate-400 uppercase font-black">Date of Birth</span>
                      <strong className="text-slate-700">{formatDate(selectedStudent.DOB)}</strong>
                    </div>
                  </div>
                  <div className="flex gap-2.5 items-center">
                    <Phone size={16} className="text-slate-400" />
                    <div>
                      <span className="block text-[10px] text-slate-400 uppercase font-black">Phone Number</span>
                      <strong className="text-slate-700">{selectedStudent.phone}</strong>
                    </div>
                  </div>
                  <div className="flex gap-2.5 items-center">
                    <Mail size={16} className="text-slate-400" />
                    <div>
                      <span className="block text-[10px] text-slate-400 uppercase font-black">Email Address</span>
                      <strong className="text-slate-700 truncate block max-w-[180px]">{selectedStudent.email}</strong>
                    </div>
                  </div>
                  <div className="flex gap-2.5 items-center md:col-span-2">
                    <MapPin size={16} className="text-slate-400" />
                    <div>
                      <span className="block text-[10px] text-slate-400 uppercase font-black">Residential Address</span>
                      <strong className="text-slate-700">{selectedStudent.Address}</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Academic Details */}
              <div className="border-t border-slate-200 pt-4">
                <h4 className="text-xs font-black uppercase text-slate-450 tracking-wider mb-3">Academic & Admission</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex gap-2.5 items-center">
                    <GraduationCap size={16} className="text-slate-400" />
                    <div>
                      <span className="block text-[10px] text-slate-400 uppercase font-black">Previous Qualification</span>
                      <strong className="text-slate-700">{selectedStudent.Qualification}</strong>
                    </div>
                  </div>
                  <div className="flex gap-2.5 items-center">
                    <Calendar size={16} className="text-slate-400" />
                    <div>
                      <span className="block text-[10px] text-slate-400 uppercase font-black">Enrollment Date</span>
                      <strong className="text-slate-700">{formatDate(selectedStudent.Enrollment_Date || "2026-01-15")}</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Financial Summary */}
              <div className="border-t border-slate-200 pt-4 bg-slate-50/50 p-4 rounded-xl">
                <h4 className="text-xs font-black uppercase text-slate-450 tracking-wider mb-3">Financial Overview</h4>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="border-r border-slate-200">
                    <span className="block text-[10px] text-slate-400 uppercase font-black">Collected</span>
                    <strong className="text-emerald-700 text-base font-black">{formatCurrency(selectedStudent.amount_paid)}</strong>
                  </div>
                  <div className="border-r border-slate-200">
                    <span className="block text-[10px] text-slate-400 uppercase font-black">Dues Balance</span>
                    <strong className="text-amber-700 text-base font-black">{formatCurrency(selectedStudent.remaining_balance)}</strong>
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-400 uppercase font-black">Billing Status</span>
                    <span className={`status-pill ${selectedStudent.payment_status === "Paid" ? "paid" : "pending"} inline-block mt-0.5`}>
                      {selectedStudent.payment_status}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowViewModal(false)}
              className="button button-primary w-full mt-6"
            >
              Close Profile Card
            </button>
          </div>
        </div>
      )}

      {/* Add Student Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto relative">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 rounded-lg p-1 hover:bg-slate-100"
              disabled={formSubmitting}
            >
              <X size={18} />
            </button>

            <form onSubmit={handleAddStudent}>
              <h3 className="text-slate-800 text-xl font-extrabold tracking-tight mb-1 flex items-center gap-1.5">
                <PlusCircle size={20} className="text-primary" /> Register New Student
              </h3>
              <p className="text-xs text-slate-500 mb-6 font-semibold">Submit basic details. Credential username/password will auto-generate.</p>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Student Name *</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Rajesh Kumar"
                      className="block w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm text-slate-800 focus:border-primary focus:bg-white focus:outline-none transition-all"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Father's Name *</label>
                    <input
                      type="text"
                      required
                      value={fatherName}
                      onChange={(e) => setFatherName(e.target.value)}
                      placeholder="e.g. Suresh Kumar"
                      className="block w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm text-slate-800 focus:border-primary focus:bg-white focus:outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@domain.com"
                      className="block w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm text-slate-800 focus:border-primary focus:bg-white focus:outline-none transition-all"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Date of Birth *</label>
                    <input
                      type="date"
                      required
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      className="block w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm text-slate-800 focus:border-primary focus:bg-white focus:outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Phone Number *</label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="9876543210"
                      className="block w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm text-slate-800 focus:border-primary focus:bg-white focus:outline-none transition-all"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Qualification *</label>
                    <select
                      value={qualification}
                      onChange={(e) => setQualification(e.target.value)}
                      required
                      style={{ minHeight: "44px", border: "1px solid var(--border)", background: "var(--surface)" }}
                    >
                      <option value="">-- Choose Qualification --</option>
                      <option value="10th Pass">10th Pass</option>
                      <option value="12th Pass">12th Pass</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Assign Course / Trade *</label>
                  <select
                    value={course}
                    onChange={(e) => setCourse(e.target.value)}
                    required
                    style={{ minHeight: "44px", border: "1px solid var(--border)", background: "var(--surface)" }}
                  >
                    <option value="">-- Select Course --</option>
                    {courses.map(c => (
                      <option key={c.course} value={c.course}>{c.course} (Fee: {formatCurrency(c.total_fee)})</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Residential Address *</label>
                  <textarea
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Enter permanent address..."
                    rows={2}
                    className="block w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm text-slate-800 focus:border-primary focus:bg-white focus:outline-none transition-all"
                  />
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-4 flex justify-between items-center border border-slate-200 mt-4 text-xs font-bold text-slate-500">
                <span>Registration Admission Fee (Auto Paid)</span>
                <strong className="text-sm font-black text-primary">₹2,000.00</strong>
              </div>

              <button
                type="submit"
                disabled={formSubmitting}
                className="button button-primary w-full mt-6 flex gap-1.5 h-11"
              >
                <Save size={16} />
                {formSubmitting ? "Registering Student..." : "Register Student & Credentials"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Student Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto relative">
            <button
              onClick={() => setShowEditModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 rounded-lg p-1 hover:bg-slate-100"
              disabled={formSubmitting}
            >
              <X size={18} />
            </button>

            <form onSubmit={handleEditStudent}>
              <h3 className="text-slate-800 text-xl font-extrabold tracking-tight mb-1 flex items-center gap-1.5">
                <Edit size={20} className="text-primary" /> Edit Student Profile
              </h3>
              <p className="text-xs text-slate-500 mb-6 font-semibold">Modify student profile information (ID: #{selectedStudent?.id}).</p>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Student Name *</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Rajesh Kumar"
                      className="block w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm text-slate-800 focus:border-primary focus:bg-white focus:outline-none transition-all"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Father's Name *</label>
                    <input
                      type="text"
                      required
                      value={fatherName}
                      onChange={(e) => setFatherName(e.target.value)}
                      placeholder="e.g. Suresh Kumar"
                      className="block w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm text-slate-800 focus:border-primary focus:bg-white focus:outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@domain.com"
                      className="block w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm text-slate-800 focus:border-primary focus:bg-white focus:outline-none transition-all"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Date of Birth *</label>
                    <input
                      type="date"
                      required
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      className="block w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm text-slate-800 focus:border-primary focus:bg-white focus:outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Phone Number *</label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="9876543210"
                      className="block w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm text-slate-800 focus:border-primary focus:bg-white focus:outline-none transition-all"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Qualification *</label>
                    <select
                      value={qualification}
                      onChange={(e) => setQualification(e.target.value)}
                      required
                      style={{ minHeight: "44px", border: "1px solid var(--border)", background: "var(--surface)" }}
                    >
                      <option value="">-- Choose Qualification --</option>
                      <option value="10th Pass">10th Pass</option>
                      <option value="12th Pass">12th Pass</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Assign Course / Trade *</label>
                  <select
                    value={course}
                    onChange={(e) => setCourse(e.target.value)}
                    required
                    style={{ minHeight: "44px", border: "1px solid var(--border)", background: "var(--surface)" }}
                  >
                    <option value="">-- Select Course --</option>
                    {courses.map(c => (
                      <option key={c.course} value={c.course}>{c.course} (Fee: {formatCurrency(c.total_fee)})</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Residential Address *</label>
                  <textarea
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Enter permanent address..."
                    rows={2}
                    className="block w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm text-slate-800 focus:border-primary focus:bg-white focus:outline-none transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={formSubmitting}
                className="button button-primary w-full mt-6 flex gap-1.5 h-11"
              >
                <Save size={16} />
                {formSubmitting ? "Updating Student Profile..." : "Update Student Profile"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
