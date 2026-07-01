"use client";

import Link from "next/link";
import Login_Card from "../../components/Chose_Login_Card";
import { GraduationCap } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";

export default function Page() {
  const { t } = useLanguage();

  return (
    <main className="flex min-h-screen flex-col justify-center items-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-2xl">
        {/* Page Header branding */}
        <div className="text-center mb-8">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-white shadow-md shadow-primary/20 mb-4">
            <GraduationCap size={28} />
          </span>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-800 sm:text-4xl">
            {t("login_choose_role")}
          </h2>
          <p className="mt-2 text-sm font-semibold text-slate-500 max-w-sm mx-auto">
            {t("login_choose_subtitle")}
          </p>
        </div>

        {/* Roles Selection Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 mt-8">
          <Login_Card
            image="/file.svg"
            alter="Student"
            role={t("login_role_student")}
            para={t("login_student_desc")}
            to="/pages/Login_Page/Student_Login"
          />

          <Login_Card
            image="/file.svg"
            alter="Admin"
            role={t("login_role_admin")}
            para={t("login_admin_desc")}
            to="/pages/Login_Page/Admin_Login"
          />
        </div>

        {/* Back to Homepage Link */}
        <div className="text-center mt-8">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:text-primary-dark hover:underline transition-colors"
          >
            &larr; {t("login_btn_home")}
          </Link>
        </div>
      </div>
    </main>
  );
}

