"use client";

import React from 'react'
import { useLanguage } from "../../context/LanguageContext";
import Course_Card from '../../components/Course_Card'

const Courses = () => {
  const { t } = useLanguage();

  return (
    <section className="section courses-section" id="courses">
      <div className="section-inner">
        <div className="section-heading">
          <p className="eyebrow">{t("courses_eyebrow")}</p>
          <h1>{t("courses_title")}</h1>
          <p>{t("courses_desc")}</p>
        </div>
        <div className="card-grid courses-grid">
          <Course_Card image="/file.svg" trade="Electrician" duration={t("trade_electrician_duration")} para={t("trade_electrician_desc")} />
          <Course_Card image="/file.svg" trade="Fitter" duration={t("trade_fitter_duration")} para={t("trade_fitter_desc")} />
          <Course_Card image="/file.svg" trade="COPA" duration={t("trade_copa_duration")} para={t("trade_copa_desc")} />
        </div>
      </div>
    </section>
  )
}

export default Courses
