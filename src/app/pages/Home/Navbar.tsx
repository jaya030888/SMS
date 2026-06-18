"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { GraduationCap, LogIn } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";

export function Navbar() {
  const { language, toggleLanguage, t } = useLanguage();
  const [session, setSession] = useState<{ authenticated: boolean; role?: string } | null>(null);

  useEffect(() => {
    async function checkSession() {
      try {
        const res = await fetch("/api/auth/session");
        if (res.ok) {
          const data = await res.json();
          setSession(data);
        } else {
          setSession({ authenticated: false });
        }
      } catch (e) {
        setSession({ authenticated: false });
      }
    }
    checkSession();
  }, []);

  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (err) {
      console.error("Logout API failed:", err);
    }
    localStorage.clear();
    setSession({ authenticated: false });
    window.location.href = "/";
  };

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
          
          {session?.authenticated ? (
            <>
              <Link 
                href={session.role === "admin" ? "/pages/Admin/DashBoard" : "/pages/Student/DashBoard"} 
                className="dashboard-link"
              >
                {t("nav_dashboard")}
              </Link>
              <button 
                onClick={handleLogout} 
                className="login-link hover:text-red-600"
                style={{ background: "transparent", border: 0, padding: 0, minHeight: "auto", fontWeight: 500, display: "inline-flex", gap: "0.35rem", cursor: "pointer", transition: "color 0.3s ease" }}
              >
                <LogIn size={16} style={{ transform: "rotate(180deg)" }} /> {t("nav_logout")}
              </button>
            </>
          ) : (
            <Link href="/pages/Chose_Login" className="login-link"><LogIn size={16} /> {t("nav_login")}</Link>
          )}
          
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
