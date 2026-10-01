"use client";

import React from 'react';
import { useLanguage } from "../../context/LanguageContext";
import { useCMS } from "../../context/CMSContext";
import Features_Card from '../../components/Features_Card';
import { 
  Award, 
  Wrench, 
  ShieldCheck, 
  Briefcase, 
  Lightbulb, 
  Zap, 
  Building 
} from 'lucide-react';

const iconMap: Record<string, any> = {
  Award,
  Wrench,
  ShieldCheck,
  Briefcase,
  Lightbulb,
  Zap,
  Building,
};

const Features = () => {
  const { t, language } = useLanguage();
  const { cms } = useCMS();

  const isHindi = language === "hi";

  const defaultCards = [
    { id: 1, icon: Award, feature: t("feature_faculty_title"), para: t("feature_faculty_desc") },
    { id: 2, icon: Wrench, feature: t("feature_practical_title"), para: t("feature_practical_desc") },
    { id: 3, icon: ShieldCheck, feature: t("feature_ncvt_title"), para: t("feature_ncvt_desc") },
    { id: 4, icon: Briefcase, feature: t("feature_industry_title"), para: t("feature_industry_desc") },
  ];

  const featuresToRender = (!isHindi && cms?.features && cms.features.length > 0)
    ? cms.features.map(f => ({
        id: f.id,
        icon: iconMap[f.icon] || Award,
        feature: f.title,
        para: f.desc,
      }))
    : defaultCards;

  return (
    <section className="section features-section">
      <div className="section-inner">
        <h1>{t("features_title")}</h1>
        <div className="card-grid features-grid">
          {featuresToRender.map(item => (
            <Features_Card 
              key={item.id} 
              icon={item.icon} 
              feature={item.feature} 
              para={item.para} 
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
