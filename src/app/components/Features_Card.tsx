import React from 'react';
import { LucideIcon } from 'lucide-react';

type FeaturesCardProps = {
  icon: LucideIcon;
  feature: string;
  para: string;
};

const Features_Card = ({ icon: Icon, feature, para }: FeaturesCardProps) => {
  return (
    <article className="flex flex-col p-6 sm:p-7 bg-white rounded-xl border border-slate-200 shadow-xs hover:border-teal-500/50 hover:shadow-sm transition-all">
      <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-teal-50 text-teal-600 border border-teal-100 mb-5">
        <Icon size={22} strokeWidth={2.2} />
      </div>

      <h3 className="text-lg font-bold text-slate-900 mb-2 tracking-tight">
        {feature}
      </h3>
      <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
        {para}
      </p>
    </article>
  );
};

export default Features_Card;
