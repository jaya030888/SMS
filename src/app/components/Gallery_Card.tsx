import React from 'react';
import { LucideIcon } from 'lucide-react';

type GalleryCardProps = {
  icon: LucideIcon;
  alter?: string;
  text: string;
};

const Gallery_card = ({ icon: Icon, text }: GalleryCardProps) => {
  return (
    <article className="flex flex-col items-center justify-center p-6 bg-white rounded-xl border border-slate-200 shadow-xs hover:border-teal-500/50 hover:shadow-sm transition-all text-center">
      <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-teal-50 text-teal-600 border border-teal-100 mb-3.5">
        <Icon size={22} strokeWidth={2.2} />
      </div>
      <span className="text-xs sm:text-sm font-bold text-slate-900 tracking-tight">
        {text}
      </span>
    </article>
  );
};

export default Gallery_card;
