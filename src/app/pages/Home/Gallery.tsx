"use client";

import { useLanguage } from "../../context/LanguageContext";
import Gallery_card from "../../components/Gallery_Card"
import { Wrench, Monitor, BookOpen, Settings, Building, Lightbulb } from 'lucide-react'

const Gallery = () => {
  const { t } = useLanguage();

  return (
    <section className="section gallery-section">
      <div className="section-inner">
        <div className="section-heading">
          <p className="eyebrow">{t("gallery_eyebrow")}</p>
          <h1>{t("gallery_title")}</h1>
          <p>{t("gallery_desc")}</p>
        </div>
        <div className="card-grid gallery-grid">
          <Gallery_card icon={Wrench} alter={t("gallery_img_workshop")} text={t("gallery_img_workshop")} />
          <Gallery_card icon={Monitor} alter={t("gallery_img_computer")} text={t("gallery_img_computer")} />
          <Gallery_card icon={BookOpen} alter={t("gallery_img_practical")} text={t("gallery_img_practical")} />
          <Gallery_card icon={Settings} alter={t("gallery_img_equipment")} text={t("gallery_img_equipment")} />
          <Gallery_card icon={Building} alter={t("gallery_img_infrastructure")} text={t("gallery_img_infrastructure")} />
          <Gallery_card icon={Lightbulb} alter={t("gallery_img_hands_on")} text={t("gallery_img_hands_on")} />
        </div>
      </div>
    </section>
  )
}

export default Gallery
