"use client";

import { useEffect, useState } from "react";
import StuNav from "@/src/app/components/StuNav";
import { PlusCircle, Edit, Trash2, X, BookOpen, Landmark, Save, RefreshCw } from "lucide-react";

interface CourseFee {
  course: string;
  tuition_fee: number;
  lab_fee: number;
  library_fee: number;
  exam_fee: number;
  development_fee: number;
  total_fee: number;
}

export default function CourseManagementPage() {
  const [courses, setCourses] = useState<CourseFee[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Modals management
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Form states
  const [courseName, setCourseName] = useState("");
  const [tuitionFee, setTuitionFee] = useState("");
  const [labFee, setLabFee] = useState("");
  const [libraryFee, setLibraryFee] = useState("");
  const [examFee, setExamFee] = useState("");
  const [developmentFee, setDevelopmentFee] = useState("");

  const [selectedCourse, setSelectedCourse] = useState<CourseFee | null>(null);

  const fetchCourses = async () => {
    try {
      const res = await fetch("/api/course_fees");
      if (res.ok) {
        const data = await res.json();
        setCourses(data);
      }
    } catch (err) {
      console.error("Error fetching courses:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchCourses();
  };

  const getLiveTotal = () => {
    const t = Number(tuitionFee) || 0;
    const l = Number(labFee) || 0;
    const lib = Number(libraryFee) || 0;
    const ex = Number(examFee) || 0;
    const dev = Number(developmentFee) || 0;
    return t + l + lib + ex + dev;
  };

  const resetForm = () => {
    setCourseName("");
    setTuitionFee("");
    setLabFee("");
    setLibraryFee("");
    setExamFee("");
    setDevelopmentFee("");
    setSelectedCourse(null);
  };

  const handleAddCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseName.trim()) {
      alert("Course name is required.");
      return;
    }
    setFormSubmitting(true);
    try {
      const res = await fetch("/api/course_fees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          course: courseName.trim(),
          tuition_fee: Number(tuitionFee) || 0,
          lab_fee: Number(labFee) || 0,
          library_fee: Number(libraryFee) || 0,
          exam_fee: Number(examFee) || 0,
          development_fee: Number(developmentFee) || 0,
        }),
      });

      if (res.ok) {
        alert("Course structure created successfully!");
        setShowAddModal(false);
        resetForm();
        fetchCourses();
      } else {
        const err = await res.json();
        alert(`Failed to save course: ${err.error || 'Server error'}`);
      }
    } catch (err) {
      console.error(err);
      alert("An unexpected error occurred.");
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleOpenEdit = (course: CourseFee) => {
    setSelectedCourse(course);
    setCourseName(course.course);
    setTuitionFee(String(course.tuition_fee));
    setLabFee(String(course.lab_fee));
    setLibraryFee(String(course.library_fee));
    setExamFee(String(course.exam_fee));
    setDevelopmentFee(String(course.development_fee));
    setShowEditModal(true);
  };

  const handleEditCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitting(true);
    try {
      const res = await fetch("/api/course_fees", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          course: courseName,
          tuition_fee: Number(tuitionFee) || 0,
          lab_fee: Number(labFee) || 0,
          library_fee: Number(libraryFee) || 0,
          exam_fee: Number(examFee) || 0,
          development_fee: Number(developmentFee) || 0,
        }),
      });

      if (res.ok) {
        alert("Course structure updated successfully!");
        setShowEditModal(false);
        resetForm();
        fetchCourses();
      } else {
        const err = await res.json();
        alert(`Failed to update course: ${err.error || 'Server error'}`);
      }
    } catch (err) {
      console.error(err);
      alert("An unexpected error occurred.");
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDeleteCourse = async (courseName: string) => {
    if (!confirm(`Are you sure you want to delete the course "${courseName}"? Existing students will lose this assigned course fee link.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/course_fees?course=${encodeURIComponent(courseName)}`, {
        method: "DELETE",
      });

      if (res.ok) {
        alert("Course deleted successfully!");
        fetchCourses();
      } else {
        const err = await res.json();
        alert(`Failed to delete course: ${err.error || 'Server error'}`);
      }
    } catch (err) {
      console.error(err);
      alert("An unexpected error occurred.");
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <>
      <StuNav name="Course Management" role="admin" />

      <main className="dashboard-page mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Title and Top Header */}
        <section className="section-title-row flex justify-between items-center mb-6">
          <div>
            <p className="eyebrow m-0 text-primary uppercase text-xs tracking-wider">Academic ERP Configuration</p>
            <h1 className="m-0 text-slate-800 text-3xl font-extrabold tracking-tight">Course & Fees Management</h1>
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
              Configure New Course
            </button>
          </div>
        </section>

        {/* Courses Listing Panel */}
        <section className="panel bg-white border border-slate-100 p-6 rounded-2xl shadow-sm">
          <div className="flex items-center gap-2 text-primary font-bold mb-6 text-lg">
            <BookOpen size={20} />
            <h2>Active Institution Trades / Courses</h2>
          </div>

          {loading ? (
            <div className="text-center py-12 text-slate-500 font-medium">Loading courses list...</div>
          ) : courses.length === 0 ? (
            <div className="text-center py-16">
              <BookOpen size={48} className="mx-auto text-slate-300 mb-3" />
              <h3 className="text-lg font-bold text-slate-700">No Courses Configured</h3>
              <p className="text-sm text-slate-400 mt-1">Add a new academic course structure to configure dynamic fee itemizations.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((c) => (
                <div key={c.course} className="bg-slate-50 border border-slate-200/50 rounded-xl p-5 hover:shadow-md transition-all duration-200 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start border-b border-slate-200 pb-3 mb-4">
                      <h3 className="text-lg font-extrabold text-slate-800 tracking-tight">{c.course}</h3>
                      <span className="text-xs font-black px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700">Active</span>
                    </div>

                    <div className="space-y-2 text-xs font-semibold text-slate-500">
                      <div className="flex justify-between">
                        <span>Tuition Fee</span>
                        <span className="text-slate-800">{formatCurrency(c.tuition_fee)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Lab / Practical Fee</span>
                        <span className="text-slate-800">{formatCurrency(c.lab_fee)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Library Resource Fee</span>
                        <span className="text-slate-800">{formatCurrency(c.library_fee)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Examination Fee</span>
                        <span className="text-slate-800">{formatCurrency(c.exam_fee)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Development Fee</span>
                        <span className="text-slate-800">{formatCurrency(c.development_fee)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 pt-4 border-t border-slate-200">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Course Cost</span>
                      <strong className="text-lg font-black text-primary">{formatCurrency(c.total_fee)}</strong>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleOpenEdit(c)}
                        className="button button-secondary flex-1 py-2 text-xs gap-1"
                        style={{ minHeight: "36px" }}
                      >
                        <Edit size={13} /> Edit Fees
                      </button>
                      <button
                        onClick={() => handleDeleteCourse(c.course)}
                        className="button button-secondary text-red-600 hover:text-red-700 border-red-200 hover:border-red-400 flex-1 py-2 text-xs gap-1"
                        style={{ minHeight: "36px" }}
                      >
                        <Trash2 size={13} /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Add Course Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto relative">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 rounded-lg p-1 hover:bg-slate-100"
              disabled={formSubmitting}
            >
              <X size={18} />
            </button>

            <form onSubmit={handleAddCourse}>
              <h3 className="text-slate-800 text-xl font-extrabold tracking-tight mb-1 flex items-center gap-1.5">
                <Landmark size={20} className="text-primary" /> Configure New Course
              </h3>
              <p className="text-xs text-slate-500 mb-6 font-semibold">Set up course naming and individual fee components.</p>

              <div className="space-y-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Course / Trade Name *</label>
                  <input
                    type="text"
                    required
                    value={courseName}
                    onChange={(e) => setCourseName(e.target.value)}
                    placeholder="e.g. Welder, Machinist"
                    className="block w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm text-slate-800 focus:border-primary focus:bg-white focus:outline-none transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Tuition Fee (₹)</label>
                    <input
                      type="number"
                      min="0"
                      value={tuitionFee}
                      onChange={(e) => setTuitionFee(e.target.value)}
                      placeholder="0"
                      className="block w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm text-slate-800 focus:border-primary focus:bg-white focus:outline-none transition-all"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Lab / Practical Fee (₹)</label>
                    <input
                      type="number"
                      min="0"
                      value={labFee}
                      onChange={(e) => setLabFee(e.target.value)}
                      placeholder="0"
                      className="block w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm text-slate-800 focus:border-primary focus:bg-white focus:outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Library Fee (₹)</label>
                    <input
                      type="number"
                      min="0"
                      value={libraryFee}
                      onChange={(e) => setLibraryFee(e.target.value)}
                      placeholder="0"
                      className="block w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm text-slate-800 focus:border-primary focus:bg-white focus:outline-none transition-all"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Internal Exam Fee (₹)</label>
                    <input
                      type="number"
                      min="0"
                      value={examFee}
                      onChange={(e) => setExamFee(e.target.value)}
                      placeholder="0"
                      className="block w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm text-slate-800 focus:border-primary focus:bg-white focus:outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Development Fee (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={developmentFee}
                    onChange={(e) => setDevelopmentFee(e.target.value)}
                    placeholder="0"
                    className="block w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm text-slate-800 focus:border-primary focus:bg-white focus:outline-none transition-all"
                  />
                </div>

                <div className="bg-slate-50 rounded-xl p-4 flex justify-between items-center border border-slate-200 mt-4">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Live Total Billed Cost</span>
                  <strong className="text-lg font-black text-primary">{formatCurrency(getLiveTotal())}</strong>
                </div>
              </div>

              <button
                type="submit"
                disabled={formSubmitting}
                className="button button-primary w-full mt-6 flex gap-1.5 h-11"
              >
                <Save size={16} />
                {formSubmitting ? "Saving Configuration..." : "Create Course & Fees"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Course Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto relative">
            <button
              onClick={() => setShowEditModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 rounded-lg p-1 hover:bg-slate-100"
              disabled={formSubmitting}
            >
              <X size={18} />
            </button>

            <form onSubmit={handleEditCourse}>
              <h3 className="text-slate-800 text-xl font-extrabold tracking-tight mb-1 flex items-center gap-1.5">
                <Landmark size={20} className="text-primary" /> Edit Course Dues
              </h3>
              <p className="text-xs text-slate-500 mb-6 font-semibold">Update individual fee items for course: {courseName}.</p>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Tuition Fee (₹)</label>
                    <input
                      type="number"
                      min="0"
                      value={tuitionFee}
                      onChange={(e) => setTuitionFee(e.target.value)}
                      placeholder="0"
                      className="block w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm text-slate-800 focus:border-primary focus:bg-white focus:outline-none transition-all"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Lab / Practical Fee (₹)</label>
                    <input
                      type="number"
                      min="0"
                      value={labFee}
                      onChange={(e) => setLabFee(e.target.value)}
                      placeholder="0"
                      className="block w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm text-slate-800 focus:border-primary focus:bg-white focus:outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Library Fee (₹)</label>
                    <input
                      type="number"
                      min="0"
                      value={libraryFee}
                      onChange={(e) => setLibraryFee(e.target.value)}
                      placeholder="0"
                      className="block w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm text-slate-800 focus:border-primary focus:bg-white focus:outline-none transition-all"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Internal Exam Fee (₹)</label>
                    <input
                      type="number"
                      min="0"
                      value={examFee}
                      onChange={(e) => setExamFee(e.target.value)}
                      placeholder="0"
                      className="block w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm text-slate-800 focus:border-primary focus:bg-white focus:outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Development Fee (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={developmentFee}
                    onChange={(e) => setDevelopmentFee(e.target.value)}
                    placeholder="0"
                    className="block w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm text-slate-800 focus:border-primary focus:bg-white focus:outline-none transition-all"
                  />
                </div>

                <div className="bg-slate-50 rounded-xl p-4 flex justify-between items-center border border-slate-200 mt-4">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Live Total Billed Cost</span>
                  <strong className="text-lg font-black text-primary">{formatCurrency(getLiveTotal())}</strong>
                </div>
              </div>

              <button
                type="submit"
                disabled={formSubmitting}
                className="button button-primary w-full mt-6 flex gap-1.5 h-11"
              >
                <Save size={16} />
                {formSubmitting ? "Updating Configuration..." : "Save Course Dues"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
