"use client";

import React from 'react'
import { useLanguage } from "../../context/LanguageContext";
import Features_Card from '../../components/Features_Card'
import { Award, Wrench, ShieldCheck, Briefcase } from 'lucide-react'

const Features = () => {
  const { t } = useLanguage();

  return (
    <section className="section features-section">
      <div className="section-inner">
        <h1>{t("features_title")}</h1>
        <div className="card-grid features-grid">
          <Features_Card icon={Award} feature={t("feature_faculty_title")} para={t("feature_faculty_desc")}/>
          <Features_Card icon={Wrench} feature={t("feature_practical_title")} para={t("feature_practical_desc")}/>
          <Features_Card icon={ShieldCheck} feature={t("feature_ncvt_title")} para={t("feature_ncvt_desc")}/>
          <Features_Card icon={Briefcase} feature={t("feature_industry_title")} para={t("feature_industry_desc")}/>
        </div>
      </div>
    </section>
  )
}

export default Features
