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

          <div className="lg:col-span-7 rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs relative min-h-[380px] bg-slate-100 flex flex-col">
            {/* Embedded Interactive Map */}
            <iframe
              src="https://www.google.com/maps?q=Maa+Gauri+Pvt.+ITI&ll=25.3220341,84.8122683&z=17&output=embed"
              width="100%"
              height="100%"
              className="w-full h-full min-h-[380px] border-0"
              allowFullScreen={true}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Maa Gauri Private ITI Campus Location"
            />

            {/* Bottom Floating Directions Overlay */}
            <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 bg-white/95 backdrop-blur-md p-3.5 rounded-2xl shadow-lg border border-slate-200/80 flex items-center justify-between gap-4 z-10">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-[#4285CD] shrink-0">
                  <MapPin size={18} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Maa Gauri ITI Campus</h4>
                  <p className="text-[11px] text-slate-500 max-w-[200px] truncate">{address}</p>
                </div>
              </div>
              <a
                href="https://www.google.com/maps/search/?api=1&query=Maa+Gauri+Pvt.+ITI+Paliganj+Patna"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#4285CD] hover:bg-[#2F8AD4] text-white text-xs font-bold transition-all shadow-xs shrink-0 cursor-pointer"
              >
                <span>Get Directions</span>
                <span className="text-[10px]">↗</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;


