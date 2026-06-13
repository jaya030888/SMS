"use client";

import React from 'react'
import { useLanguage } from "../../context/LanguageContext";
import Updates_Card from '../../components/Updates_Card'
import { BellRing } from 'lucide-react'

const Updates = () => {
  const { t } = useLanguage();

  return (
    <section className="section updates-section" id="updates">
      <div className="section-inner">
        <div className="section-title-row">
          <BellRing className="text-primary" size={24} />
          <h1>{t("updates_title")}</h1>
        </div>

        <div className="updates-list">
          <Updates_Card date={t("update_1_date")} update={t("update_1_title")} para={t("update_1_desc")} />
          <Updates_Card date={t("update_2_date")} update={t("update_2_title")} para={t("update_2_desc")} />
          <Updates_Card date={t("update_3_date")} update={t("update_3_title")} para={t("update_3_desc")} />
        </div>
      </div>
    </section>
  )
}

export default Updates
