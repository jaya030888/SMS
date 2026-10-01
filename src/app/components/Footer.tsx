"use client";

import Link from "next/link";
import { useLanguage } from "../context/LanguageContext";
import { useCMS } from "../context/CMSContext";
import { Phone, Mail, MapPin } from "lucide-react";

const Footer = () => {
  const { t } = useLanguage();
  const { cms } = useCMS();

  // Extract multiple phones and emails from CMS
  const phones: string[] = cms?.contact?.phones && cms.contact.phones.length > 0
    ? cms.contact.phones
    : cms?.contact?.phone
    ? cms.contact.phone.split(",").map((p: string) => p.trim()).filter(Boolean)
    : ["+91 94310 12345", "+91 98765 43210"];

  const emails: string[] = cms?.contact?.emails && cms.contact.emails.length > 0
    ? cms.contact.emails
    : cms?.contact?.email
    ? cms.contact.email.split(",").map((e: string) => e.trim()).filter(Boolean)
    : ["info@mgiti.edu.in", "admissions@mgiti.edu.in"];

  const address = cms?.contact?.address || `${t("contact_address_l1")}, ${t("contact_address_l2")}`;

  return (
    <footer className="footer">
      <div className="footer-inner">
        <div>
          <h2>{t("footer_contact_info")}</h2>

          {/* Render all phone numbers */}
          {phones.map((phoneNum, idx) => (
            <div className="footer-item" key={`phone-${idx}`}>
              <Phone size={18} className="text-white opacity-80 shrink-0" />
              <a href={`tel:${phoneNum.replace(/\s+/g, '')}`} className="hover:underline text-white">
                {phoneNum}
              </a>
            </div>
          ))}

          {/* Render all email addresses */}
          {emails.map((emailAddr, idx) => (
            <div className="footer-item" key={`email-${idx}`}>
              <Mail size={18} className="text-white opacity-80 shrink-0" />
              <a href={`mailto:${emailAddr}`} className="hover:underline text-white">
                {emailAddr}
              </a>
            </div>
          ))}

          <div className="footer-item">
            <MapPin size={18} className="text-white opacity-80 shrink-0" />
            <span>{address}</span>
          </div>
        </div>

        <div>
          <h2>{t("footer_quick_links")}</h2>

          <p><Link href="/#about">{t("nav_about")}</Link></p>
          <p><Link href="/#courses">{t("nav_courses")}</Link></p>
          <p><Link href="/pages/Home/Addmission_Application_Form">{t("nav_admissions")}</Link></p>
          <p><Link href="/#contact">{t("nav_contact")}</Link></p>
        </div>

        <div>
          <h2>{t("footer_office_hours")}</h2>

          <p>{t("contact_hours_l1")}</p>
          <p>{t("contact_hours_l2")}</p>
          <p>{t("footer_sunday_closed")}</p>
        </div>
      </div>

      <p className="copyright">{t("footer_copyright")}</p>
    </footer>
  )
}

export default Footer

