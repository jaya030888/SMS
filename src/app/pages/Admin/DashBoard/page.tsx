"use client";

import All from "@/src/app/components/All";
import COPA from "@/src/app/components/COPA";
import Electrician from "@/src/app/components/Electrician";
import Fitter from "@/src/app/components/Fitter";
import StuNav from "@/src/app/components/StuNav";
import { useState } from "react";
import { Filter } from "lucide-react";

const Page = () => {
  const [course, setCourse] = useState("All");

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
            {["All", "Electrician", "COPA", "Fitter"].map((item) => (
              <button
                key={item}
                onClick={() => setCourse(item)}
                className={`px-4 py-2 rounded-lg text-xs font-bold tracking-wide uppercase transition-all duration-150 cursor-pointer ${
                  course === item 
                    ? "bg-white text-primary shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </section>

        {/* Dynamic Course-Specific Dashboard Content */}
        <section className="space-y-8">
          {course === "All" && <All />}
          {course === "Electrician" && <Electrician />}
          {course === "COPA" && <COPA />}
          {course === "Fitter" && <Fitter />}
        </section>
      </main>
    </>
  );
};

export default Page;
