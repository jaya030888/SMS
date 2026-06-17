"use client";

import { useEffect, useState } from "react";
import StuNav from "@/src/app/components/StuNav";
import CourseDashboard from "@/src/app/components/CourseDashboard";
import { Filter } from "lucide-react";

export default function AdminDashboardPage() {
  const [course, setCourse] = useState("All");
  const [courseTabs, setCourseTabs] = useState<string[]>(["All"]);

  useEffect(() => {
    // Fetch courses dynamically to populate filter buttons
    fetch("/api/course_fees")
      .then((res) => {
        if (res.ok) return res.json();
        return [];
      })
      .then((data) => {
        const list = ["All", ...data.map((c: any) => c.course)];
        setCourseTabs(list);
      })
      .catch((err) => console.error("Error loading dashboard tabs:", err));
  }, []);

  return (
    <>
      <StuNav name="Admin Dashboard" role="admin" />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Course Filter Card */}
        <section className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm mb-8 transition-all duration-200">
          <div className="flex items-center gap-2 text-slate-800 font-bold mb-4 text-base tracking-tight">
            <Filter size={18} className="text-primary" />
            <h2>Filter Overview by Trade/Course</h2>
          </div>

          <div className="inline-flex flex-wrap gap-1.5 p-1 bg-slate-100/70 border border-slate-200/40 rounded-xl">
            {courseTabs.map((item) => (
              <button
                key={item}
                onClick={() => setCourse(item)}
                className={`px-4 py-2 rounded-lg text-xs font-bold tracking-wide uppercase transition-all duration-150 cursor-pointer ${
                  course.toLowerCase() === item.toLowerCase() 
                    ? "bg-white text-primary shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </section>

        {/* Dynamic Consolidated Dashboard Content */}
        <section className="space-y-8">
          <CourseDashboard courseName={course} />
        </section>
      </main>
    </>
  );
}
