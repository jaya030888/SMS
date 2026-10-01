import React from 'react';
import { LucideIcon } from 'lucide-react';

type GalleryCardProps = {
  icon: LucideIcon;
  alter?: string;
  text: string;
};

const Gallery_card = ({ icon: Icon, text }: GalleryCardProps) => {
  return (
    <article className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:-translate-y-1 transition-all duration-200 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#EEF5FC] text-[#4285CD] mb-3.5">
        <Icon size={24} strokeWidth={2.2} />
      </div>
      <span className="text-xs sm:text-sm font-bold text-[#06090C] tracking-tight">
        {text}
      </span>
    </article>
  );
};

export default Gallery_card;
