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
    <article className="flex flex-col justify-between p-5 bg-white border border-slate-200/80 shadow-xs hover:shadow-md rounded-2xl transition-all duration-200 hover:-translate-y-1">
      <div>
        {/* Role Icon Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#EEF5FC] text-[#4285CD] border border-[#85B6E9]/30">
            {isStudent ? <User size={22} /> : isTeacher ? <UserCheck size={22} /> : <ShieldCheck size={22} />}
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-100 px-2.5 py-0.5 rounded-md">
            {roleType}
          </span>
        </div>

        <h3 className="text-base font-bold text-[#06090C] mb-1">
          {role} {t("nav_login")}
        </h3>
        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-4">
          {para}
        </p>
      </div>

      <div>
        {/* Quick Demo Credential Pill */}
        <div className="mb-3.5 px-3 py-2 bg-[#F4F8FB] border border-slate-200/70 rounded-xl text-[11px] flex items-center justify-between text-slate-600">
          <div className="flex items-center gap-1.5 truncate">
            <Key size={13} className="text-[#4285CD] shrink-0" />
            <span className="truncate"><b>{demoCreds.id}</b> / {demoCreds.pass}</span>
          </div>
          <span className="text-[10px] text-slate-400 font-semibold shrink-0">Demo</span>
        </div>

        <Link 
          className="w-full flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-[#4285CD] hover:bg-[#2F8AD4] shadow-xs active:translate-y-0 transition-all cursor-pointer" 
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
