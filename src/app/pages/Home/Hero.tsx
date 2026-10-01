"use client";

import React from 'react';
import Link from 'next/link';
import { useLanguage } from "../../context/LanguageContext";
import { useCMS } from "../../context/CMSContext";
import StackedCards from "../../components/StackedCards";

const Hero = () => {
  const { t, language } = useLanguage();
  const { cms } = useCMS();

  const isHindi = language === "hi";

  // Use CMS values or localized fallback
  const eyebrow = isHindi ? t("hero_eyebrow") : (cms?.hero?.eyebrow || t("hero_eyebrow"));
  const title1 = isHindi ? t("hero_title_1") : (cms?.hero?.title_1 || t("hero_title_1"));
  const title2 = isHindi ? t("hero_title_2") : (cms?.hero?.title_2 || t("hero_title_2"));
  const desc = isHindi ? t("hero_desc") : (cms?.hero?.desc || t("hero_desc"));

  return (
    <section className="hero section" id="home">
      <div className="section-inner hero-inner">
        <div className="hero-content">
          <p className="eyebrow">{eyebrow}</p>
          <h1>{title1} <span>{title2}</span></h1>

          <p className="hero-description">{desc}</p>

          <div className="hero-actions">
            <Link href="/pages/Home/Addmission_Application_Form" className="button button-primary">
              {t("hero_btn_apply")}
            </Link>

            <Link href="#courses" className="button button-secondary">
              {t("hero_btn_explore")}
            </Link>
          </div>
        </div>

        {/* Right Side: Interactive 3D Stacked Cards Deck */}
        <div className="hero-visual" aria-label="Institute highlights deck">
          <StackedCards />
        </div>
      </div>
    </section>
  );
};

export default Hero;
