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
    <article className="flex flex-col justify-between p-6 sm:p-7 bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:-translate-y-1 transition-all duration-200">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#EEF5FC] text-[#4285CD]">
            <Icon size={24} strokeWidth={2.2} />
          </div>
          <span className="text-[11px] font-bold text-[#4285CD] bg-[#EEF5FC] px-3 py-1 rounded-full">
            {props.duration}
          </span>
        </div>

        <h3 className="text-xl font-bold text-[#06090C] mb-2 tracking-tight">
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
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#4285CD] hover:text-[#2F8AD4] transition-colors"
        >
          <span>Apply Now</span>
          <ArrowRight size={13} />
        </Link>
      </div>
    </article>
  );
};

export default Course_Card;
