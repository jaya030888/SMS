// src/app/components/Chose_Login_Card.tsx
import Link from "next/link";
import { ShieldCheck, User, UserCheck, ArrowRight, Key } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

type ChoseLoginCardProps = {
  role: string;
  roleType: "student" | "teacher" | "admin";
  para: string;
  to: string;
  demoCreds: { id: string; pass: string };
};

const Chose_Login_Card = ({ role, roleType, para, to, demoCreds }: ChoseLoginCardProps) => {
  const { t } = useLanguage();
  const isStudent = roleType === "student";
  const isTeacher = roleType === "teacher";

  return (
    <article className="flex flex-col justify-between p-5 bg-white border border-slate-200 shadow-xs hover:border-teal-500/50 hover:shadow-sm rounded-xl transition-all duration-200">
      <div>
        {/* Role Icon Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-50 text-teal-600 border border-teal-100">
            {isStudent ? <User size={20} /> : isTeacher ? <UserCheck size={20} /> : <ShieldCheck size={20} />}
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
            {roleType}
          </span>
        </div>

        <h3 className="text-base font-bold text-slate-900 mb-1">
          {role} {t("nav_login")}
        </h3>
        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-4">
          {para}
        </p>
      </div>

      <div>
        {/* Quick Demo Credential Pill */}
        <div className="mb-3.5 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[11px] flex items-center justify-between text-slate-600">
          <div className="flex items-center gap-1.5 truncate">
            <Key size={13} className="text-teal-600 shrink-0" />
            <span className="truncate"><b>{demoCreds.id}</b> / {demoCreds.pass}</span>
          </div>
          <span className="text-[10px] text-teal-700 font-semibold shrink-0 bg-teal-50 px-1.5 py-0.5 rounded">Demo</span>
        </div>

        <Link 
          className="w-full flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-lg text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 shadow-xs transition-colors cursor-pointer" 
          href={to}
        >
          <span>{t("language") === "hi" ? `${role} साइन इन` : `Sign In as ${role}`}</span>
          <ArrowRight size={14} />
        </Link>
      </div>
    </article>
  );
};

export default Chose_Login_Card;
