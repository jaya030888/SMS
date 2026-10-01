import React from 'react';
import { LucideIcon } from 'lucide-react';

type FeaturesCardProps = {
  icon: LucideIcon;
  feature: string;
  para: string;
};

const Features_Card = ({ icon: Icon, feature, para }: FeaturesCardProps) => {
  return (
    <article className="flex flex-col p-6 sm:p-7 bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:-translate-y-1 transition-all duration-200">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#EEF5FC] text-[#4285CD] mb-5">
        <Icon size={24} strokeWidth={2.2} />
      </div>

      <h3 className="text-lg font-bold text-[#06090C] mb-2 tracking-tight">
        {feature}
      </h3>
      <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
        {para}
      </p>
    </article>
  );
};

export default Features_Card;
