"use client";

import React from 'react'
import { useLanguage } from "../../context/LanguageContext";
import Contact_Card from '../../components/Contact_Card'
import { MapPin, Phone, Mail, Clock } from 'lucide-react'


const Contact = () => {
  const { t } = useLanguage();

  return (
    <section className="section contact-section" id="contact">
      <div className="section-inner">
        <div className="section-heading">
          <p className="eyebrow">{t("contact_eyebrow")}</p>
          <h1>{t("contact_title")}</h1>
          <p>{t("contact_desc")}</p>
        </div>

        <div className="contact-layout">
          <div className="contact-panel">
            <h2>{t("contact_panel_title")}</h2>

            <div className="contact-list">
              <Contact_Card icon={MapPin} name={t("contact_address")} l1={t("contact_address_l1")} l2={t("contact_address_l2")} />
              <Contact_Card icon={Phone} name={t("contact_phone")} l1="+91 98765 43210" l2="+91 98765 43389" />
              <Contact_Card icon={Mail} name={t("contact_email")} l1="info@itiinstitute.edu" l2="admissions@itiinstitute.edu" />
              <Contact_Card icon={Clock} name={t("contact_hours")} l1={t("contact_hours_l1")} l2={t("contact_hours_l2")} />
            </div>
          </div>

          <div className="map-panel" style={{ padding: 0, overflow: "hidden" }}>
            <iframe
              src="https://www.google.com/maps?q=Maa+Gauri+Pvt.+ITI&ll=25.3220341,84.8122683&z=17&output=embed"
              width="100%"
              height="100%"
              style={{ border: 0, display: "block" }}
              allowFullScreen={true}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Maa Gauri Private ITI Location Map"
            ></iframe>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Contact
