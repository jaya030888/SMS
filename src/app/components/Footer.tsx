"use client";

import Link from "next/link"
import { useLanguage } from "../context/LanguageContext";
import { Phone, Mail, MapPin } from "lucide-react";

const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="footer">
      <div className="footer-inner">
        <div>
          <h2>{t("footer_contact_info")}</h2>

          <div className="footer-item">
            <Phone size={18} className="text-white opacity-80" />
            <span>+91 98765 43210</span>
          </div>

          <div className="footer-item">
            <Mail size={18} className="text-white opacity-80" />
            <span>info@itiinstitute.edu</span>
          </div>

          <div className="footer-item">
            <MapPin size={18} className="text-white opacity-80" />
            <span>{t("contact_address_l1")}, {t("contact_address_l2")}</span>
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

