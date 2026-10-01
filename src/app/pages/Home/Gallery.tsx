"use client";

import { useLanguage } from "../../context/LanguageContext";
import { useCMS } from "../../context/CMSContext";
import Gallery_card from "../../components/Gallery_Card";
import { Wrench, Monitor, BookOpen, Settings, Building, Lightbulb } from 'lucide-react';

const iconMap: Record<string, any> = {
  Wrench,
  Monitor,
  BookOpen,
  Settings,
  Building,
  Lightbulb,
};

const Gallery = () => {
  const { t, language } = useLanguage();
  const { cms } = useCMS();

  const isHindi = language === "hi";

  const defaultItems = [
    { id: 1, icon: Wrench, text: t("gallery_img_workshop") },
    { id: 2, icon: Monitor, text: t("gallery_img_computer") },
    { id: 3, icon: BookOpen, text: t("gallery_img_practical") },
    { id: 4, icon: Settings, text: t("gallery_img_equipment") },
    { id: 5, icon: Building, text: t("gallery_img_infrastructure") },
    { id: 6, icon: Lightbulb, text: t("gallery_img_hands_on") },
  ];

  const galleryToRender = (!isHindi && cms?.gallery && cms.gallery.length > 0)
    ? cms.gallery.map(g => ({
        id: g.id,
        icon: iconMap[g.iconName || ""] || Building,
        text: g.title,
      }))
    : defaultItems;

  return (
    <section className="section gallery-section">
      <div className="section-inner">
        <div className="section-heading">
          <p className="eyebrow">{t("gallery_eyebrow")}</p>
          <h1>{t("gallery_title")}</h1>
          <p>{t("gallery_desc")}</p>
        </div>
        <div className="card-grid gallery-grid">
          {galleryToRender.map(item => (
            <Gallery_card 
              key={item.id} 
              icon={item.icon} 
              alter={item.text} 
              text={item.text} 
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Gallery;
