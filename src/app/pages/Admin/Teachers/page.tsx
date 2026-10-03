// src/app/pages/Admin/Teachers/page.tsx
"use client";

import { useEffect, useState } from "react";
import StuNav from "@/src/app/components/StuNav";
import { 
  UserCheck, 
  Plus, 
  Search, 
  Mail, 
  Phone, 
  Award, 
  BookOpen, 
  Trash2, 
  Edit3, 
  Download, 
  X,
  CheckCircle2,
  AlertCircle
} from "lucide-react";

interface Teacher {
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
}

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [deptFilter, setDeptFilter] = useState("All");
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    department: "COPA",
    designation: "Senior Instructor",
    qualification: "B.Tech / Diploma",
    experience: "3 Years",
    status: "Active" as 'Active' | 'On Leave' | 'Inactive'
  });
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchTeachers = async () => {
    try {
      const res = await fetch("/api/teachers");
      if (res.ok) {
        const data = await res.json();
        setTeachers(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      setFeedback({ type: 'error', message: 'Name and email are required.' });
      return;
    }

    try {
      if (editingTeacher) {
        // Update
        const res = await fetch("/api/teachers", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingTeacher.id, ...formData }),
        });
        if (res.ok) {
          setFeedback({ type: 'success', message: 'Teacher details updated successfully!' });
          setEditingTeacher(null);
          fetchTeachers();
        }
      } else {
        // Create
        const res = await fetch("/api/teachers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        if (res.ok) {
          setFeedback({ type: 'success', message: 'New teacher onboarded successfully!' });
          setShowAddModal(false);
          setFormData({
            name: "",
            email: "",
            phone: "",
            department: "COPA",
            designation: "Senior Instructor",
            qualification: "B.Tech / Diploma",
            experience: "3 Years",
            status: "Active"
          });
          fetchTeachers();
        }
      }
    } catch (e) {
      setFeedback({ type: 'error', message: 'An error occurred while saving.' });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to remove this faculty member?")) return;
    try {
      const res = await fetch(`/api/teachers?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setFeedback({ type: 'success', message: 'Teacher removed.' });
        fetchTeachers();
      }
    } catch (e) {
      setFeedback({ type: 'error', message: 'Failed to delete.' });
    }
  };

  const exportCSV = () => {
    const headers = ["Employee ID,Name,Department,Designation,Qualification,Experience,Phone,Email,Status\n"];
    const rows = filteredTeachers.map(t => 
      `"${t.employee_id}","${t.name}","${t.department}","${t.designation}","${t.qualification}","${t.experience}","${t.phone}","${t.email}","${t.status}"`
    ).join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Faculty_Directory_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  const filteredTeachers = teachers.filter((t) => {
    const matchesSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          t.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          t.employee_id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = deptFilter === "All" || t.department.toLowerCase().includes(deptFilter.toLowerCase());
    return matchesSearch && matchesDept;
  });

  return (
    <>
      <StuNav name="Faculty & Teachers" role="admin" />

      <main className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-6">
          
          {/* Header Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-150 shadow-xs">
            <div>
              <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider mb-1">
                <UserCheck size={16} />
                <span>Academic Staff Management</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">
                Teachers & Instructors Directory
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Manage ITI instructors, workshop superintendents, and department assignments.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={exportCSV}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-700 transition-all cursor-pointer shadow-xs"
              >
                <Download size={15} />
                <span>Export CSV</span>
              </button>

              <button
                onClick={() => {
                  setEditingTeacher(null);
                  setShowAddModal(true);
                }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#4285CD] hover:bg-[#2F8AD4] text-xs font-bold text-white transition-all shadow-xs cursor-pointer"
              >
                <Plus size={16} />
                <span>Add Teacher</span>
              </button>
            </div>
          </div>

          {/* Feedback Alert */}
          {feedback && (
            <div className={`p-4 rounded-2xl flex items-center justify-between text-xs font-bold ${
              feedback.type === 'success' ? 'bg-[#EEF5FC] text-[#4285CD] border border-[#85B6E9]/40' : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              <div className="flex items-center gap-2">
                {feedback.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                <span>{feedback.message}</span>
              </div>
              <button onClick={() => setFeedback(null)} className="cursor-pointer opacity-70 hover:opacity-100">
                <X size={14} />
              </button>
            </div>
          )}

          {/* Search and Filters Bar */}
          <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-4 rounded-2xl border border-slate-150 shadow-xs">
            <div className="relative flex-1 w-full">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10" />
              <input
                type="text"
                placeholder="Search teacher by name, employee ID, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-brand-teal focus:bg-white transition-all"
                style={{ paddingLeft: "2.75rem" }}
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <label className="text-xs font-bold text-slate-500 whitespace-nowrap">Department:</label>
              <select
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 focus:outline-none focus:border-brand-teal"
              >
                <option value="All">All Departments</option>
                <option value="COPA">COPA</option>
                <option value="Electrician">Electrician</option>
                <option value="Fitter">Fitter</option>
              </select>
            </div>
          </div>

          {/* Teachers Card Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {loading ? (
              <div className="col-span-full py-16 text-center text-slate-400 font-semibold">
                Loading faculty records...
              </div>
            ) : filteredTeachers.length === 0 ? (
              <div className="col-span-full py-16 text-center text-slate-400 font-semibold bg-white rounded-3xl border border-slate-150">
                No faculty members found matching your search.
              </div>
            ) : (
              filteredTeachers.map((teacher) => (
                <div 
                  key={teacher.id}
                  className="bg-white rounded-3xl border border-slate-150 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Top Row: Avatar & Status */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-2xl bg-[#4285CD] text-white flex items-center justify-center font-bold text-base shadow-xs">
                          {teacher.name.split(" ").map(n => n[0]).slice(0, 2).join("")}
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-[#06090C]">{teacher.name}</h3>
                          <span className="text-[10px] font-bold text-[#4285CD] uppercase tracking-wider">
                            {teacher.employee_id}
                          </span>
                        </div>
                      </div>

                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                        teacher.status === 'Active' ? 'bg-teal-50 text-teal-700 border border-teal-100' : 'bg-amber-50 text-amber-700 border border-amber-100'
                      }`}>
                        {teacher.status}
                      </span>
                    </div>

                    {/* Details */}
                    <div className="space-y-2 text-xs py-2 border-y border-slate-100 my-2">
                      <div className="flex items-center justify-between text-slate-600">
                        <span className="text-slate-400">Department:</span>
                        <b className="text-slate-800">{teacher.department}</b>
                      </div>
                      <div className="flex items-center justify-between text-slate-600">
                        <span className="text-slate-400">Designation:</span>
                        <span className="font-semibold text-slate-700">{teacher.designation}</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-600">
                        <span className="text-slate-400">Qualification:</span>
                        <span className="font-semibold text-slate-700">{teacher.qualification}</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-600">
                        <span className="text-slate-400">Experience:</span>
                        <span className="font-bold text-teal-700">{teacher.experience}</span>
                      </div>
                    </div>

                    {/* Contact Links */}
                    <div className="space-y-1.5 text-xs text-slate-500 pt-1">
                      <div className="flex items-center gap-2 truncate">
                        <Mail size={13} className="text-slate-400 shrink-0" />
                        <span className="truncate">{teacher.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone size={13} className="text-slate-400 shrink-0" />
                        <span>{teacher.phone || "Not configured"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-end gap-2 pt-4 mt-3 border-t border-slate-100">
                    <button
                      onClick={() => {
                        setEditingTeacher(teacher);
                        setFormData({
                          name: teacher.name,
                          email: teacher.email,
                          phone: teacher.phone,
                          department: teacher.department,
                          designation: teacher.designation,
                          qualification: teacher.qualification,
                          experience: teacher.experience,
                          status: teacher.status
                        });
                        setShowAddModal(true);
                      }}
                      className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-primary transition-colors cursor-pointer"
                      title="Edit Teacher"
                    >
                      <Edit3 size={15} />
                    </button>
                    <button
                      onClick={() => handleDelete(teacher.id)}
                      className="p-2 rounded-xl bg-slate-50 hover:bg-red-50 text-slate-600 hover:text-red-600 transition-colors cursor-pointer"
                      title="Delete Teacher"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

        </div>
      </main>

      {/* Add / Edit Teacher Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-2xl border border-slate-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-800">
                {editingTeacher ? "Edit Teacher Details" : "Add New Faculty Instructor"}
              </h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-600">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Er. Amit Sharma"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:bg-white focus:border-brand-teal focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-600">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="amit.sharma@mgiti.edu"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:bg-white focus:border-brand-teal focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-600">Phone Number</label>
                  <input
                    type="tel"
                    placeholder="9876543210"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:bg-white focus:border-brand-teal focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-600">Department *</label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:bg-white focus:border-brand-teal focus:outline-none font-semibold"
                  >
                    <option value="COPA">COPA</option>
                    <option value="Electrician">Electrician</option>
                    <option value="Fitter">Fitter</option>
                    <option value="General Engineering">General Engineering</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-600">Designation</label>
                  <input
                    type="text"
                    placeholder="Senior Instructor / HOD"
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:bg-white focus:border-brand-teal focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-600">Qualification</label>
                  <input
                    type="text"
                    placeholder="B.Tech, MCA, CITS"
                    value={formData.qualification}
                    onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:bg-white focus:border-brand-teal focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-600">Experience</label>
                  <input
                    type="text"
                    placeholder="5 Years"
                    value={formData.experience}
                    onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:bg-white focus:border-brand-teal focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-600">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 focus:bg-white focus:border-brand-teal focus:outline-none font-semibold"
                >
                  <option value="Active">Active</option>
                  <option value="On Leave">On Leave</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#4285CD] hover:bg-[#2F8AD4] text-white font-bold shadow-xs cursor-pointer"
                >
                  {editingTeacher ? "Update Teacher" : "Save Teacher"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
