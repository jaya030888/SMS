"use client";

import React from 'react';
import { useLanguage } from "../../context/LanguageContext";
import { useCMS } from "../../context/CMSContext";
import { CheckCircle2, ShieldCheck, Award, Building2 } from "lucide-react";

const About = () => {
  const { t, language } = useLanguage();
  const { cms } = useCMS();

  const isHindi = language === "hi";

  const eyebrow = isHindi ? t("about_eyebrow") : (cms?.about?.eyebrow || t("about_eyebrow"));
  const title = isHindi ? t("about_title") : (cms?.about?.title || t("about_title"));
  const desc = isHindi ? t("about_desc") : (cms?.about?.desc_1 ? `${cms.about.desc_1} ${cms.about.desc_2}` : t("about_desc"));

  const highlights = [
    { title: "NCVT & DGT Affiliated", desc: "Recognized nationwide by Govt. of India" },
    { title: "Expert Instructors", desc: "Industry-certified trade trainers" },
    { title: "Modern Campus Labs", desc: "High-voltage & computer simulation labs" },
    { title: "Placement Assurance", desc: "Direct campus recruitment cell" },
  ];

  return (
    <section className="section bg-[#F8FAFC]" id="about">
      <div className="section-inner grid grid-cols-1 lg:grid-cols-12 gap-10 sm:gap-14 items-center">
        
        {/* Left Column: Narrative */}
        <div className="lg:col-span-7">
          <p className="eyebrow">{eyebrow}</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#06090C] tracking-tight mb-4 leading-tight">
            {title}
          </h2>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl mb-6">
            {desc}
          </p>

          <div className="flex items-center gap-6 pt-4 border-t border-slate-200">
            <div>
              <div className="text-2xl font-extrabold text-[#4285CD]">2018</div>
              <div className="text-xs text-slate-500 font-semibold">Established Year</div>
            </div>
            <div className="h-8 w-[1px] bg-slate-200" />
            <div>
              <div className="text-2xl font-extrabold text-[#4285CD]">1500+</div>
              <div className="text-xs text-slate-500 font-semibold">Trained Students</div>
            </div>
            <div className="h-8 w-[1px] bg-slate-200" />
            <div>
              <div className="text-2xl font-extrabold text-[#4285CD]">100%</div>
              <div className="text-xs text-slate-500 font-semibold">Trade Practical Focus</div>
            </div>
          </div>
        </div>

        {/* Right Column: Clean Feature Points Card */}
        <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-[#06090C] mb-2">
            Why Choose Maa Gauri ITI?
          </h3>
          {highlights.map((item, idx) => (
            <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#EEF5FC] text-[#4285CD] shrink-0 mt-0.5">
                <CheckCircle2 size={16} />
              </div>
              <div>
                <div className="text-xs sm:text-sm font-bold text-[#06090C]">{item.title}</div>
                <div className="text-[11px] sm:text-xs text-slate-500">{item.desc}</div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default About;
