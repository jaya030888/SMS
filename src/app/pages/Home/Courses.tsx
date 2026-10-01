"use client";

import React from 'react';
import { useLanguage } from "../../context/LanguageContext";
import Course_Card from '../../components/Course_Card';

const Courses = () => {
  const { t } = useLanguage();

  return (
    <section className="section bg-white" id="courses">
      <div className="section-inner">
        <div className="section-heading text-center mx-auto mb-12">
          <p className="eyebrow">{t("courses_eyebrow")}</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#06090C] tracking-tight mb-3">
            {t("courses_title")}
          </h2>
          <p className="text-sm sm:text-base text-slate-500 max-w-2xl mx-auto leading-relaxed">
            {t("courses_desc")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Course_Card 
            trade="Electrician" 
            duration={t("trade_electrician_duration")} 
            para={t("trade_electrician_desc")} 
          />
          <Course_Card 
            trade="Fitter" 
            duration={t("trade_fitter_duration")} 
            para={t("trade_fitter_desc")} 
          />
          <Course_Card 
            trade="COPA" 
            duration={t("trade_copa_duration")} 
            para={t("trade_copa_desc")} 
          />
        </div>
      </div>
    </section>
  );
};

export default Courses;
