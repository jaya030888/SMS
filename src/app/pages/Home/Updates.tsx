"use client";

import React from 'react';
import { useLanguage } from "../../context/LanguageContext";
import Updates_Card from '../../components/Updates_Card';
import { BellRing } from 'lucide-react';

const Updates = () => {
  const { t } = useLanguage();

  return (
    <section className="section bg-[#F8FAFC]" id="updates">
      <div className="section-inner max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-600 border border-teal-100 mb-3 shadow-2xs">
            <BellRing size={20} />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {t("updates_title")}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Latest circulars, examination alerts, and academic notifications
          </p>
        </div>

        <div className="space-y-3.5">
          <Updates_Card date={t("update_1_date")} update={t("update_1_title")} para={t("update_1_desc")} />
          <Updates_Card date={t("update_2_date")} update={t("update_2_title")} para={t("update_2_desc")} />
          <Updates_Card date={t("update_3_date")} update={t("update_3_title")} para={t("update_3_desc")} />
        </div>
      </div>
    </section>
  );
};

export default Updates;
