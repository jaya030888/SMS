// src/app/pages/Chose_Login/page.tsx
"use client";

import Link from "next/link";
import Chose_Login_Card from "../../components/Chose_Login_Card";
import { GraduationCap, ArrowLeft } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";

export default function Page() {
  const { t } = useLanguage();

  return (
    <main className="min-h-screen md:h-screen flex flex-col justify-center items-center bg-[#F8FAFC] p-4 sm:p-6 overflow-y-auto md:overflow-hidden">
      <div className="w-full max-w-4xl flex flex-col justify-center my-auto">
        
        {/* Compact Header */}
        <div className="text-center mb-6">
          <div className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-teal-600 text-white shadow-xs mb-2.5">
            <GraduationCap size={24} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            {t("login_choose_role")}
          </h1>
          <p className="mt-1 text-xs text-slate-500 max-w-md mx-auto">
            Select your portal to access student document registry, fee payment ledgers, and institute governance.
          </p>
        </div>

        {/* 3 Role Selection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5 mb-5">
          <Chose_Login_Card
            role={t("login_role_student")}
            roleType="student"
            para="Access KYC documents verification, fee status, payment history, and instant receipts."
            to="/pages/Login_Page/Student_Login"
            demoCreds={{ id: "1", pass: "101" }}
          />

          <Chose_Login_Card
            role="Teacher"
            roleType="teacher"
            para="Access assigned trade instructor profile, batch curriculum, and departmental details."
            to="/pages/Login_Page/Teacher_Login"
            demoCreds={{ id: "amit.sharma@mgiti.edu", pass: "12345" }}
          />

          <Chose_Login_Card
            role={t("login_role_admin")}
            roleType="admin"
            para="Complete institute governance: student document verification, fee ledger, and admissions."
            to="/pages/Login_Page/Admin_Login"
            demoCreds={{ id: "jayamyname19@gmail.com", pass: "12345" }}
          />
        </div>

        {/* Footer Navigation Link */}
        <div className="text-center">
          <Link 
            href="/" 
            className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-600 hover:text-teal-700 hover:underline transition-colors"
          >
            <ArrowLeft size={14} />
            <span>{t("login_btn_home")}</span>
          </Link>
        </div>

      </div>
    </main>
  );
}
