"use client";

import Login_Card from "../../components/Chose_Login_Card";
import { GraduationCap } from "lucide-react";

const Page = () => {
  return (
    <main className="flex min-h-screen flex-col justify-center items-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-2xl">
        {/* Page Header branding */}
        <div className="text-center mb-8">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-white shadow-md shadow-primary/20 mb-4">
            <GraduationCap size={28} />
          </span>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-800 sm:text-4xl">
            Choose your login type
          </h2>
          <p className="mt-2 text-sm font-semibold text-slate-500 max-w-sm mx-auto">
            Access your personalized student or administrator dashboard workspace.
          </p>
        </div>

        {/* Roles Selection Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 mt-8">
          <Login_Card
            image="/file.svg"
            alter="Student"
            role="Student"
            para="Access your customized dashboard, course modules, attendance logs, and pay fees online."
            to="/pages/Login_Page/Student_Login"
          />

          <Login_Card
            image="/file.svg"
            alter="Admin"
            role="Admin"
            para="Control admissions, review applicant entries, manage fee transactions, and log student attendance."
            to="/pages/Login_Page/Admin_Login"
          />
        </div>
      </div>
    </main>
  );
};

export default Page;
