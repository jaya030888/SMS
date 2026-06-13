"use client";

import React from 'react'
import Link from 'next/link'
import { useLanguage } from "../../context/LanguageContext";

const Hero = () => {
  const { t } = useLanguage();

  return (
    <section className="hero section" id="home">
      <div className="section-inner hero-inner">
        <div className="hero-content">
          <p className="eyebrow">{t("hero_eyebrow")}</p>
          <h1>{t("hero_title_1")} <span>{t("hero_title_2")}</span></h1>

          <p>{t("hero_desc")}</p>

          <div className="hero-actions">
            <Link href="/pages/Home/Addmission_Application_Form" className="button button-primary">
              {t("hero_btn_apply")}
            </Link>

            <Link href="#courses" className="button button-secondary">
              {t("hero_btn_explore")}
            </Link>
          </div>
        </div>

        <div className="hero-visual" aria-label="Institute highlights">
          <div className="hero-card">
            <div className="hero-card-top">
              <span>{t("hero_card_tag")}</span>
              <strong>{t("hero_card_year")}</strong>
            </div>
            <h2>{t("hero_card_title")}</h2>
            <p>{t("hero_card_desc")}</p>

            <div className="hero-badges">
              <div>
                <strong>{t("hero_badge_govt")}</strong>
                <span>{t("hero_badge_govt_desc")}</span>
              </div>
              <div>
                <strong>{t("hero_badge_alumni")}</strong>
                <span>{t("hero_badge_alumni_desc")}</span>
              </div>
              <div>
                <strong>{t("hero_badge_placement")}</strong>
                <span>{t("hero_badge_placement_desc")}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero
