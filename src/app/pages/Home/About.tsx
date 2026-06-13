"use client";

import React from 'react'
import { useLanguage } from "../../context/LanguageContext";

const About = () => {
  const { t } = useLanguage();

  return (
    <section className="section about-section" id="about">
      <div className="section-inner about-layout">
        <div>
          <p className="eyebrow">{t("about_eyebrow")}</p>
          <h1>{t("about_title")}</h1>
          <p>{t("about_desc")}</p>
        </div>
        <div className="about-stats">
          <div><strong>4+</strong><span>{t("about_stat_programs")}</span></div>
          <div><strong>12+</strong><span>{t("about_stat_labs")}</span></div>
          <div><strong>1:1</strong><span>{t("about_stat_guidance")}</span></div>
        </div>
      </div>
    </section>
  )
}

export default About
