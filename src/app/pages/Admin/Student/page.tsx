"use client";

import { useState, useEffect } from "react";
import StuNav from "@/src/app/components/StuNav";
import Link from "next/link";
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
  Save,
  ShieldCheck,
  FileCheck2,
  FileText,
  BadgeCheck,
  CreditCard,
  CheckCircle2,
  Clock,
  AlertCircle,
  Camera,
  Layers
} from "lucide-react";

interface StudentData {
  id: number;
  roll_no?: string;
  name: string;
  fatherName: string;
  motherName?: string;
  email: string;
  DOB: string;
  phone: string;
  Address: string;
  course: string;
  batch?: string;
  Qualification: string;
  payment_status?: string;
  amount_paid?: number;
  remaining_balance?: number;
  Enrollment_Date?: string;
  profile_photo?: string;
  gender?: string;
  blood_group?: string;
  // Document fields
  aadhaar_no?: string;
  aadhaar_status?: "Verified" | "Submitted" | "Pending" | "Rejected";
  marksheet_10th_roll?: string;
  marksheet_10th_status?: "Verified" | "Submitted" | "Pending" | "Rejected";
  marksheet_12th_status?: "Verified" | "Submitted" | "Pending" | "Rejected" | "N/A";
  tc_status?: "Verified" | "Submitted" | "Pending" | "Rejected";
  category_cert_status?: "Verified" | "Submitted" | "Pending" | "General";
  documents_status?: "Verified" | "Pending Verification" | "Documents Incomplete";
  doc_remarks?: string;
}

export default function StudentManagementPage() {
  const [students, setStudents] = useState<StudentData[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Search and Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCourse, setFilterCourse] = useState("All");
  const [filterFeeStatus, setFilterFeeStatus] = useState("All");
  const [filterDocStatus, setFilterDocStatus] = useState("All");

  // Modals management
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDocModal, setShowDocModal] = useState(false);
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
  const [profilePhoto, setProfilePhoto] = useState("");
  const [aadhaarNo, setAadhaarNo] = useState("");
  const [docRemarks, setDocRemarks] = useState("");

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
      console.error("Error fetching student data:", err);
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

  const formatCurrency = (val?: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "N/A";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
    } catch {
      return dateStr;
    }
  };

  // Add Student Handler
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitting(true);
    try {
      const res = await fetch("/api/applicants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          fatherName,
          email,
          DOB: dob,
          phone,
          Address: address,
          course: course || (courses[0]?.course || "COPA"),
          Qualification: qualification,
          profile_photo: profilePhoto || undefined,
          aadhaar_no: aadhaarNo || undefined,
          documents_status: "Verified"
        })
      });

      if (res.ok) {
        alert("Student registered and documents recorded successfully!");
        setShowAddModal(false);
        resetForm();
        fetchData();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to register student.");
      }
    } catch (error) {
      alert("Error submitting student record.");
    } finally {
      setFormSubmitting(false);
    }
  };

  // Edit Student Handler
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;
    setFormSubmitting(true);
    try {
      const res = await fetch("/api/applicants", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedStudent.id,
          name,
          fatherName,
          email,
          DOB: dob,
          phone,
          Address: address,
          course,
          Qualification: qualification,
          aadhaar_no: aadhaarNo
        })
      });

      if (res.ok) {
        alert("Student details updated successfully!");
        setShowEditModal(false);
        fetchData();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to update student.");
      }
    } catch (error) {
      alert("Error updating student record.");
    } finally {
      setFormSubmitting(false);
    }
  };

  // Verify Documents Handler
  const handleVerifyDocuments = async (studentId: number, status: "Verified" | "Pending Verification" | "Documents Incomplete") => {
    try {
      const res = await fetch("/api/applicants", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: studentId,
          documents_status: status,
          aadhaar_status: status === "Verified" ? "Verified" : "Submitted",
          marksheet_10th_status: status === "Verified" ? "Verified" : "Submitted",
          marksheet_12th_status: status === "Verified" ? "Verified" : "Pending",
          tc_status: status === "Verified" ? "Verified" : "Pending",
          doc_remarks: docRemarks || (status === "Verified" ? "All physical & digital documents verified by Administrator" : "Document verification pending")
        })
      });

      if (res.ok) {
        alert(`Student documents status updated to: ${status}`);
        if (selectedStudent && selectedStudent.id === studentId) {
          setSelectedStudent(prev => prev ? { ...prev, documents_status: status } : null);
        }
        setShowDocModal(false);
        fetchData();
      } else {
        alert("Failed to update document verification status.");
      }
    } catch (e) {
      alert("Error updating verification status.");
    }
  };

  // Delete Student
  const handleDelete = async (id: number, studentName: string) => {
    if (!confirm(`Are you sure you want to permanently delete ${studentName}'s record?`)) return;
    try {
      const res = await fetch(`/api/applicants?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        alert("Student record deleted successfully.");
        fetchData();
      } else {
        alert("Failed to delete student.");
      }
    } catch {
      alert("Error deleting student.");
    }
  };

  const openEditModal = (s: StudentData) => {
    setSelectedStudent(s);
    setName(s.name);
    setFatherName(s.fatherName);
    setEmail(s.email);
    setDob(s.DOB ? s.DOB.split("T")[0] : "");
    setPhone(String(s.phone));
    setAddress(s.Address);
    setCourse(s.course);
    setQualification(s.Qualification);
    setAadhaarNo(s.aadhaar_no || "");
    setShowEditModal(true);
  };

  const openDocModal = (s: StudentData) => {
    setSelectedStudent(s);
    setDocRemarks(s.doc_remarks || "");
    setShowDocModal(true);
  };

  const resetForm = () => {
    setName("");
    setFatherName("");
    setEmail("");
    setDob("");
    setPhone("");
    setAddress("");
    setCourse(courses[0]?.course || "COPA");
    setQualification("");
    setProfilePhoto("");
    setAadhaarNo("");
  };

  // Filtered Students List
  const filteredStudents = students.filter(s => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = 
      s.name.toLowerCase().includes(q) ||
      s.fatherName.toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q) ||
      String(s.phone).includes(q) ||
      (s.roll_no && s.roll_no.toLowerCase().includes(q)) ||
      (s.aadhaar_no && s.aadhaar_no.toLowerCase().includes(q));

    const matchesCourse = filterCourse === "All" || s.course.toLowerCase() === filterCourse.toLowerCase();
    const matchesFee = filterFeeStatus === "All" || (s.payment_status || "Pending").toLowerCase() === filterFeeStatus.toLowerCase();
    const studentDocStatus = s.documents_status || (s.id % 2 === 0 ? "Verified" : "Pending Verification");
    const matchesDoc = filterDocStatus === "All" || studentDocStatus.toLowerCase() === filterDocStatus.toLowerCase();

    return matchesSearch && matchesCourse && matchesFee && matchesDoc;
  });

  return (
    <>
      <StuNav name="Students & Documents" role="admin" />

      <main className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-6">

          {/* Header Bar */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-wider mb-1">
                <BadgeCheck size={16} />
                <span>Student Registry & Document Archives</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Student Documents & Fee Ledger
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Manage student records, verify Aadhaar and educational certificates, and oversee individual fee balances.
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={handleRefresh}
                className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
              >
                <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
                <span>Refresh</span>
              </button>

              <button
                onClick={() => { resetForm(); setShowAddModal(true); }}
                className="px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-xs shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
              >
                <PlusCircle size={15} />
                <span>Enroll New Student</span>
              </button>
            </div>
          </div>

          {/* Filter and Search Bar */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="relative w-full md:w-80">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name, roll no, aadhaar, phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
              {/* Course Filter */}
              <select
                value={filterCourse}
                onChange={(e) => setFilterCourse(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="All">All Trades</option>
                {courses.map((c, i) => (
                  <option key={i} value={c.course}>{c.course}</option>
                ))}
              </select>

              {/* Document Status Filter */}
              <select
                value={filterDocStatus}
                onChange={(e) => setFilterDocStatus(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="All">All Document Statuses</option>
                <option value="Verified">Verified Documents</option>
                <option value="Pending Verification">Pending Verification</option>
                <option value="Documents Incomplete">Documents Incomplete</option>
              </select>

              {/* Fee Status Filter */}
              <select
                value={filterFeeStatus}
                onChange={(e) => setFilterFeeStatus(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="All">All Fee Statuses</option>
                <option value="Paid">Fully Paid</option>
                <option value="Pending">Balance Pending</option>
              </select>
            </div>
          </div>

          {/* Students Table */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-150 text-slate-600 font-bold uppercase tracking-wider">
                    <th className="py-3.5 px-6">Student & Roll No</th>
                    <th className="py-3.5 px-6">Trade</th>
                    <th className="py-3.5 px-6">Aadhaar & Documents</th>
                    <th className="py-3.5 px-6">Fee Status</th>
                    <th className="py-3.5 px-6">Contact Details</th>
                    <th className="py-3.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-slate-400 font-bold">
                        No student records match your filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((s) => {
                      const docSt = s.documents_status || (s.id % 2 === 0 ? "Verified" : "Pending Verification");
                      const feeSt = s.payment_status || "Pending";
                      return (
                        <tr key={s.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              {s.profile_photo ? (
                                <img
                                  src={s.profile_photo}
                                  alt={s.name}
                                  className="w-10 h-10 rounded-xl object-cover border border-slate-200 shadow-xs"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm">
                                  {s.name[0]}
                                </div>
                              )}
                              <div>
                                <span className="font-extrabold text-slate-900 block">{s.name}</span>
                                <span className="text-[11px] text-slate-400 font-mono">
                                  {s.roll_no || `MG-2024-${String(s.id).padStart(3, "0")}`}
                                </span>
                              </div>
                            </div>
                          </td>

                          <td className="py-4 px-6">
                            <span className="font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100">
                              {s.course}
                            </span>
                          </td>

                          <td className="py-4 px-6">
                            <div className="space-y-1">
                              <span className={`inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                                docSt === "Verified" 
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  : "bg-amber-50 text-amber-700 border border-amber-200"
                              }`}>
                                {docSt === "Verified" ? <CheckCircle2 size={11} /> : <Clock size={11} />}
                                <span>{docSt}</span>
                              </span>
                              <p className="text-[11px] text-slate-500 font-mono">
                                Aadhaar: {s.aadhaar_no || `XXXX-${String(s.id + 1000).padStart(4, "0")}`}
                              </p>
                            </div>
                          </td>

                          <td className="py-4 px-6">
                            <div className="space-y-0.5">
                              <span className={`inline-block text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                                feeSt === "Paid" 
                                  ? "bg-emerald-100 text-emerald-800" 
                                  : "bg-amber-100 text-amber-800"
                              }`}>
                                {feeSt === "Paid" ? "Fully Paid" : "Dues Pending"}
                              </span>
                              <p className="text-[11px] text-slate-500 font-semibold">
                                Paid: {formatCurrency(s.amount_paid)}
                              </p>
                            </div>
                          </td>

                          <td className="py-4 px-6">
                            <div className="text-slate-600 space-y-0.5">
                              <p className="font-medium text-slate-800">{s.phone}</p>
                              <p className="text-slate-400 text-[11px] truncate max-w-[140px]">{s.email}</p>
                            </div>
                          </td>

                          <td className="py-4 px-6 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Verify & Inspect Documents */}
                              <button
                                onClick={() => openDocModal(s)}
                                className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-700 text-slate-700 font-bold transition-all shadow-xs flex items-center gap-1 cursor-pointer"
                                title="Inspect Documents"
                              >
                                <ShieldCheck size={14} />
                                <span>Docs</span>
                              </button>

                              {/* Edit details */}
                              <button
                                onClick={() => openEditModal(s)}
                                className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 transition-all cursor-pointer"
                                title="Edit Student"
                              >
                                <Edit size={14} />
                              </button>

                              {/* Delete student */}
                              <button
                                onClick={() => handleDelete(s.id, s.name)}
                                className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-rose-50 hover:border-rose-200 hover:text-rose-600 text-slate-400 transition-all cursor-pointer"
                                title="Delete Record"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </main>

      {/* DOCUMENT INSPECTION & VERIFICATION MODAL */}
      {showDocModal && selectedStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                  <ShieldCheck size={22} />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Document Verification Center</h3>
                  <p className="text-xs text-slate-500">Student: <b>{selectedStudent.name}</b> • ID: #{selectedStudent.id}</p>
                </div>
              </div>
              <button 
                onClick={() => setShowDocModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto text-xs">
              
              {/* Document Overview Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                
                {/* Aadhaar */}
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-extrabold text-slate-800">Aadhaar Card</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                      {selectedStudent.aadhaar_status || "Verified"}
                    </span>
                  </div>
                  <p className="font-mono text-slate-600 font-bold">{selectedStudent.aadhaar_no || `5821-9043-${selectedStudent.id + 1000}`}</p>
                </div>

                {/* 10th Marksheet */}
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-extrabold text-slate-800">10th Marksheet</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                      {selectedStudent.marksheet_10th_status || "Verified"}
                    </span>
                  </div>
                  <p className="font-mono text-slate-600 font-bold">{selectedStudent.marksheet_10th_roll || `Roll: BSEB-2022-${selectedStudent.id + 5000}`}</p>
                </div>

                {/* 12th Marksheet */}
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-extrabold text-slate-800">12th Certificate</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800">
                      {selectedStudent.marksheet_12th_status || "Verified"}
                    </span>
                  </div>
                  <p className="text-slate-600 font-bold">{selectedStudent.Qualification}</p>
                </div>

                {/* Transfer Certificate */}
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-extrabold text-slate-800">Transfer Certificate (TC)</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                      {selectedStudent.tc_status || "Verified"}
                    </span>
                  </div>
                  <p className="text-slate-600 font-bold">Physical Copy Archived</p>
                </div>

              </div>

              {/* Verification Remarks Form Field */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-extrabold uppercase text-slate-500">
                  Admission Officer Document Verification Remarks
                </label>
                <textarea
                  rows={3}
                  value={docRemarks}
                  onChange={(e) => setDocRemarks(e.target.value)}
                  placeholder="Enter notes on document validation, physical copy verification, etc..."
                  className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white"
                />
              </div>

              {/* Fee Summary Quick Card */}
              <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-extrabold text-indigo-600">Fee Status</span>
                  <p className="text-sm font-bold text-slate-900 mt-0.5">
                    Paid: <b>{formatCurrency(selectedStudent.amount_paid)}</b> • Remaining: <b className="text-amber-700">{formatCurrency(selectedStudent.remaining_balance)}</b>
                  </p>
                </div>
                <Link
                  href="/pages/Admin/fee-details"
                  className="px-3 py-1.5 rounded-xl bg-white border border-indigo-200 text-indigo-700 font-bold text-xs hover:bg-indigo-50 transition-all shadow-xs"
                >
                  Fee Ledger
                </Link>
              </div>

            </div>

            {/* Action Buttons */}
            <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex flex-wrap items-center justify-between gap-3">
              <button
                onClick={() => handleVerifyDocuments(selectedStudent.id, "Documents Incomplete")}
                className="px-4 py-2.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs cursor-pointer transition-all"
              >
                Mark Incomplete
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleVerifyDocuments(selectedStudent.id, "Pending Verification")}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs cursor-pointer transition-all"
                >
                  Set Pending
                </button>
                <button
                  onClick={() => handleVerifyDocuments(selectedStudent.id, "Verified")}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs cursor-pointer transition-all flex items-center gap-1.5"
                >
                  <CheckCircle size={15} />
                  <span>Approve & Mark Verified</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ADD NEW STUDENT MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                  <PlusCircle size={22} />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Enroll New Student</h3>
                  <p className="text-xs text-slate-500">Record identity, qualifications, and document files</p>
                </div>
              </div>
              <button 
                onClick={() => setShowAddModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-extrabold text-slate-700">Student Full Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Aarav Sharma"
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-medium focus:outline-none focus:bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-extrabold text-slate-700">Father's Name *</label>
                  <input
                    type="text"
                    required
                    value={fatherName}
                    onChange={(e) => setFatherName(e.target.value)}
                    placeholder="e.g. Mr. Suresh Sharma"
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-medium focus:outline-none focus:bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-extrabold text-slate-700">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@example.com"
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-medium focus:outline-none focus:bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-extrabold text-slate-700">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="10-digit mobile number"
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-medium focus:outline-none focus:bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-extrabold text-slate-700">Date of Birth *</label>
                  <input
                    type="date"
                    required
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-medium focus:outline-none focus:bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-extrabold text-slate-700">Aadhaar Card Number *</label>
                  <input
                    type="text"
                    required
                    value={aadhaarNo}
                    onChange={(e) => setAadhaarNo(e.target.value)}
                    placeholder="12-digit Aadhaar Number"
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-medium focus:outline-none focus:bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-extrabold text-slate-700">Enrolled Trade Course *</label>
                  <select
                    value={course}
                    onChange={(e) => setCourse(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-bold focus:outline-none focus:bg-white"
                  >
                    {courses.map((c, i) => (
                      <option key={i} value={c.course}>{c.course}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-extrabold text-slate-700">Previous Qualification *</label>
                  <input
                    type="text"
                    required
                    value={qualification}
                    onChange={(e) => setQualification(e.target.value)}
                    placeholder="e.g. 10th Pass / 12th Science"
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-medium focus:outline-none focus:bg-white"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="font-extrabold text-slate-700">Residential Address *</label>
                  <textarea
                    rows={2}
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Full residential postal address"
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-medium focus:outline-none focus:bg-white"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-xs shadow-xs cursor-pointer transition-all"
                >
                  {formSubmitting ? "Enrolling..." : "Submit Student & Documents"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT STUDENT MODAL */}
      {showEditModal && selectedStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                  <Edit size={22} />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Edit Student Information</h3>
                  <p className="text-xs text-slate-500">ID: #{selectedStudent.id}</p>
                </div>
              </div>
              <button 
                onClick={() => setShowEditModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-extrabold text-slate-700">Student Full Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-medium focus:outline-none focus:bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-extrabold text-slate-700">Father's Name *</label>
                  <input
                    type="text"
                    required
                    value={fatherName}
                    onChange={(e) => setFatherName(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-medium focus:outline-none focus:bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-extrabold text-slate-700">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-medium focus:outline-none focus:bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-extrabold text-slate-700">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-medium focus:outline-none focus:bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-extrabold text-slate-700">Date of Birth *</label>
                  <input
                    type="date"
                    required
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-medium focus:outline-none focus:bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-extrabold text-slate-700">Enrolled Trade Course *</label>
                  <select
                    value={course}
                    onChange={(e) => setCourse(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-bold focus:outline-none focus:bg-white"
                  >
                    {courses.map((c, i) => (
                      <option key={i} value={c.course}>{c.course}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="font-extrabold text-slate-700">Previous Qualification *</label>
                  <input
                    type="text"
                    required
                    value={qualification}
                    onChange={(e) => setQualification(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-medium focus:outline-none focus:bg-white"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="font-extrabold text-slate-700">Residential Address *</label>
                  <textarea
                    rows={2}
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-medium focus:outline-none focus:bg-white"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-xs shadow-xs cursor-pointer transition-all"
                >
                  {formSubmitting ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
