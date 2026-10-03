import React from 'react';
import { Calendar, Bell } from 'lucide-react';

type UpdatesCardProps = {
  date: string;
  update: string;
  para: string;
};

const Updates_Card = (props: UpdatesCardProps) => {
  return (
    <article className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/80 shadow-[0_4px_20px_-4px_rgba(20,184,166,0.06)] hover:shadow-[0_12px_32px_-4px_rgba(20,184,166,0.14)] hover:border-teal-400/40 transition-all duration-300">
      <div className="flex items-start gap-3.5 min-w-0">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-600 border border-teal-100 shrink-0 mt-0.5">
          <Bell size={18} />
        </div>
        <div className="min-w-0">
          <h3 className="text-sm sm:text-base font-bold text-slate-900 mb-1">
            {props.update}
          </h3>
          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
            {props.para}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 bg-slate-50 border border-slate-200/80 px-3 py-1.5 rounded-xl shrink-0 self-start sm:self-auto">
        <Calendar size={13} className="text-teal-600" />
        <span>{props.date}</span>
      </div>
    </article>
  );
};

export default Updates_Card;
