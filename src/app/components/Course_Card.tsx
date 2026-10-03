import React from 'react';
import Link from 'next/link';
import { Cog, Monitor, Zap, ArrowRight, CheckCircle2 } from 'lucide-react';

type CourseCardProps = {
  image?: string;
  trade: string;
  duration: string;
  para: string;
};

const Course_Card = (props: CourseCardProps) => {
  const tradeName = props.trade.toLowerCase();
  const Icon = tradeName.includes("electrician") ? Zap : tradeName.includes("fitter") ? Cog : Monitor;

  return (
    <article className="flex flex-col justify-between p-6 sm:p-7 bg-white rounded-xl border border-slate-200 shadow-xs hover:border-teal-500/50 hover:shadow-sm transition-all">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-teal-50 text-teal-600 border border-teal-100">
            <Icon size={22} strokeWidth={2.2} />
          </div>
          <span className="text-[11px] font-bold text-teal-700 bg-teal-50 border border-teal-200/60 px-2.5 py-0.5 rounded-md">
            {props.duration}
          </span>
        </div>

        <h3 className="text-xl font-bold text-slate-900 mb-2 tracking-tight">
          {props.trade}
        </h3>

        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed mb-6">
          {props.para}
        </p>
      </div>

      <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
        <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
          <CheckCircle2 size={13} />
          <span>NCVT Approved</span>
        </span>

        <Link
          href="/pages/Home/Addmission_Application_Form"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-600 hover:text-teal-700 transition-colors"
        >
          <span>Apply Now</span>
          <ArrowRight size={13} />
        </Link>
      </div>
    </article>
  );
};

export default Course_Card;
