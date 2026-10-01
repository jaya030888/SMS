"use client";

import React from 'react';
import { useLanguage } from "../../context/LanguageContext";
import { useCMS } from "../../context/CMSContext";
import Contact_Card from '../../components/Contact_Card';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';

const Contact = () => {
  const { t, language } = useLanguage();
  const { cms } = useCMS();

  const isHindi = language === "hi";

  const phonesList: string[] = cms?.contact?.phones && cms.contact.phones.length > 0
    ? cms.contact.phones
    : (cms?.contact?.phone ? cms.contact.phone.split(",").map(p => p.trim()).filter(Boolean) : ["+91 94310 12345", "+91 98765 43210"]);

  const emailsList: string[] = cms?.contact?.emails && cms.contact.emails.length > 0
    ? cms.contact.emails
    : (cms?.contact?.email ? cms.contact.email.split(",").map(e => e.trim()).filter(Boolean) : ["info@mgiti.edu.in", "admissions@mgiti.edu.in"]);

  const phoneL1 = phonesList[0] || "+91 94310 12345";
  const phoneL2 = phonesList.slice(1).join(" • ");

  const emailL1 = emailsList[0] || "info@mgiti.edu.in";
  const emailL2 = emailsList.slice(1).join(" • ");

  const address = cms?.contact?.address || (t("contact_address_l1") + " " + t("contact_address_l2"));
  const hours = cms?.contact?.officeHours || t("contact_hours_l1");

  return (
    <section className="section bg-white" id="contact">
      <div className="section-inner">
        <div className="section-heading text-center mx-auto mb-12">
          <p className="eyebrow">{t("contact_eyebrow")}</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#06090C] tracking-tight mb-3">
            {t("contact_title")}
          </h2>
          <p className="text-sm sm:text-base text-slate-500 max-w-2xl mx-auto leading-relaxed">
            {t("contact_desc")}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
            <Contact_Card 
              icon={MapPin} 
              name={t("contact_address")} 
              l1={isHindi ? t("contact_address_l1") : address} 
              l2={isHindi ? t("contact_address_l2") : (cms?.contact?.affiliation || "NCVT Affiliated")} 
            />
            <Contact_Card 
              icon={Phone} 
              name={t("contact_phone")} 
              l1={phoneL1} 
              l2={phoneL2 || undefined} 
            />
            <Contact_Card 
              icon={Mail} 
              name={t("contact_email")} 
              l1={emailL1} 
              l2={emailL2 || undefined} 
            />
            <Contact_Card 
              icon={Clock} 
              name={t("contact_hours")} 
              l1={isHindi ? t("contact_hours_l1") : hours} 
              l2={isHindi ? t("contact_hours_l2") : "Closed on Sundays"} 
            />
          </div>

          <div className="lg:col-span-7 rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs min-h-[340px]">
            <iframe
              src="https://www.google.com/maps?q=Maa+Gauri+Pvt.+ITI&ll=25.3220341,84.8122683&z=17&output=embed"
              width="100%"
              height="100%"
              style={{ border: 0, display: "block", minHeight: "340px" }}
              allowFullScreen={true}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Maa Gauri Private ITI Location Map"
            ></iframe>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;


