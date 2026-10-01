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
    <div className="flex items-start gap-4 p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EEF5FC] text-[#4285CD] shrink-0 mt-0.5">
        <Icon size={18} strokeWidth={2.2} />
      </div>

      <div className="min-w-0">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">{name}</h4>
        <p className="text-xs sm:text-sm font-semibold text-[#06090C] leading-snug">{l1}</p>
        {l2 && <p className="text-xs text-slate-500 mt-0.5">{l2}</p>}
      </div>
    </div>
  );
};

export default Contact_Card;
