"use client";
import Link from "next/link";
import { GraduationCap, LogIn } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";


export function Navbar() {
  const { language, toggleLanguage, t } = useLanguage();

  return (
    <header className="site-header">
      <nav className="navbar">

        <Link href="/" className="brand" aria-label="Maa Gauri PVT ITI home">
          <span className="brand-mark"><GraduationCap size={22} strokeWidth={2} /></span>
          <span className="brand-name">{t("brand_name")}</span>
        </Link>

        <div className="nav-links">
          <Link href="/#home">{t("nav_home")}</Link>
          <Link href="/#about">{t("nav_about")}</Link>
          <Link href="/#courses">{t("nav_courses")}</Link>
          <Link href="/pages/Home/Addmission_Application_Form">{t("nav_admissions")}</Link>
          <Link href="/pages/Home/Fee_Structure">{t("nav_fee_structure")}</Link>
          <Link href="/#contact">{t("nav_contact")}</Link>
          <Link href="/pages/Chose_Login" className="login-link"><LogIn size={16} /> {t("nav_login")}</Link>
          
          <div className="lang-toggle-container">
            <button 
              onClick={toggleLanguage} 
              className="lang-btn" 
              type="button"
              aria-label="Switch Language / भाषा बदलें"
            >
              <span className={`lang-label ${language === 'en' ? 'active' : ''}`}>EN</span>
              <span className="lang-divider">|</span>
              <span className={`lang-label ${language === 'hi' ? 'active' : ''}`}>हिं</span>
            </button>
          </div>

          <Link href="/pages/Home/Addmission_Application_Form" className="button button-primary">
            {t("nav_apply_now")}
          </Link>
        </div>

      </nav>
    </header>
  );
}
