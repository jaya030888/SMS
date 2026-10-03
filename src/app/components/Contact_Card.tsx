import React from "react";
import { LucideIcon } from "lucide-react";

type ContactCardProps = {
  icon: LucideIcon;
  name: string;
  l1: string;
  l2?: string;
};

const Contact_Card = ({ icon: Icon, name, l1, l2 }: ContactCardProps) => {
  return (
    <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200/80 shadow-[0_4px_20px_-4px_rgba(20,184,166,0.06)] hover:shadow-[0_12px_32px_-4px_rgba(20,184,166,0.14)] hover:border-teal-400/40 transition-all duration-300">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-600 border border-teal-100 shrink-0 mt-0.5">
        <Icon size={18} strokeWidth={2.2} />
      </div>

      <div className="min-w-0">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">{name}</h4>
        <p className="text-xs sm:text-sm font-semibold text-slate-900 leading-snug">{l1}</p>
        {l2 && <p className="text-xs text-slate-500 mt-0.5">{l2}</p>}
      </div>
    </div>
  );
};

export default Contact_Card;
