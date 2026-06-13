import Image from "next/image";
import Link from "next/link";
import { GraduationCap, ShieldCheck, User } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

type ChoseLoginCardProps = {
  image: string;
  alter: string;
  role: string;
  para: string;
  to: string;
};

const Chose_Login_Card = (props: ChoseLoginCardProps) => {
  const { t } = useLanguage();
  const isStudent = props.to.toLowerCase().includes("student");

  return (
    <article className="flex flex-col items-center text-center p-6 bg-white border border-slate-100 shadow-md rounded-2xl transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      {/* Dynamic Brand/Role Icon Badge */}
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-4 border border-primary/5">
        {isStudent ? <User size={28} /> : <ShieldCheck size={28} />}
      </div>

      <h3 className="text-xl font-bold text-slate-800 mb-2">
        {props.role} {t("nav_login")}
      </h3>
      <p className="text-sm font-medium text-slate-500 mb-6 leading-relaxed flex-1">
        {props.para}
      </p>

      <Link 
        className="w-full flex items-center justify-center py-3 px-4 rounded-xl text-sm font-bold text-white bg-primary hover:bg-primary-dark shadow-sm shadow-primary/25 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-150 cursor-pointer" 
        href={props.to}
      >
        {t("language") === "hi" ? `${props.role} के रूप में साइन इन करें` : `Sign In as ${props.role}`}
      </Link>
    </article>
  );
};

export default Chose_Login_Card;

