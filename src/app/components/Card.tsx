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
        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Users size={22} />
        </span>
      );
    }
    if (t.includes("paid") || t.includes("collect")) {
      return (
        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
          <CheckCircle2 size={22} />
        </span>
      );
    }
    if (t.includes("pending") || t.includes("due") || t.includes("outstanding")) {
      return (
        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
          <Clock size={22} />
        </span>
      );
    }
    return (
      <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50 text-slate-600">
        <Landmark size={22} />
      </span>
    );
  };

  return (
    <div className="flex items-center justify-between p-6 bg-white border border-slate-100 rounded-2xl shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
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
