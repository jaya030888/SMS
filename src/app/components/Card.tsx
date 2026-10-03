import { Users, CheckCircle2, Clock, Landmark } from "lucide-react";

type CardProps = {
  label: string;
  entry: string;
  image: string; // fallback
  alter: string;
};

const Card = ({ label, entry, image, alter }: CardProps) => {
  const getIcon = (title: string) => {
    const t = title.toLowerCase();
    if (t.includes("student")) {
      return (
        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-50 text-teal-600 border border-teal-100">
          <Users size={22} />
        </span>
      );
    }
    if (t.includes("paid") || t.includes("collect")) {
      return (
        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
          <CheckCircle2 size={22} />
        </span>
      );
    }
    if (t.includes("pending") || t.includes("due") || t.includes("outstanding")) {
      return (
        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600 border border-amber-100">
          <Clock size={22} />
        </span>
      );
    }
    return (
      <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50 text-slate-600 border border-slate-200">
        <Landmark size={22} />
      </span>
    );
  };

  return (
    <div className="flex items-center justify-between p-6 bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl sm:rounded-3xl shadow-[0_4px_20px_-4px_rgba(20,184,166,0.06)] hover:shadow-[0_12px_32px_-4px_rgba(20,184,166,0.14)] hover:border-teal-400/40 hover:-translate-y-0.5 transition-all duration-300">
      <div className="space-y-1">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
          {label}
        </p>
        <strong className="text-2xl font-black text-slate-800 tracking-tight">
          {entry}
        </strong>
      </div>
      {getIcon(label)}
    </div>
  );
};

export default Card;
