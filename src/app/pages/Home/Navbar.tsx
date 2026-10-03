"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { GraduationCap, LogIn, Menu, X } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";

export function Navbar() {
  const { language, toggleLanguage, t } = useLanguage();
  const [session, setSession] = useState<{ authenticated: boolean; role?: string } | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

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
    <>
      <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md shadow-xs">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 sm:h-20 items-center justify-between gap-3 sm:gap-6">

            {/* Brand Logo & Name */}
            <Link href="/" className="flex items-center gap-2.5 sm:gap-3 shrink hover:opacity-90 transition-opacity min-w-0">
              <span className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-teal-600 text-white shadow-xs shrink-0">
                <GraduationCap size={22} strokeWidth={2.2} />
              </span>
              <span className="text-sm sm:text-lg lg:text-xl font-bold text-slate-900 tracking-tight truncate max-w-[170px] xs:max-w-[240px] sm:max-w-none">
                {t("brand_name")}
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden xl:flex items-center gap-7 text-xs font-bold text-slate-600">
              <Link href="/#home" className="hover:text-teal-600 transition-colors">{t("nav_home")}</Link>
              <Link href="/#about" className="hover:text-teal-600 transition-colors">{t("nav_about")}</Link>
              <Link href="/#courses" className="hover:text-teal-600 transition-colors">{t("nav_courses")}</Link>
              <Link href="/pages/Home/Addmission_Application_Form" className="hover:text-teal-600 transition-colors">{t("nav_admissions")}</Link>
              <Link href="/pages/Home/Fee_Structure" className="hover:text-teal-600 transition-colors">{t("nav_fee_structure")}</Link>
              <Link href="/#contact" className="hover:text-teal-600 transition-colors">{t("nav_contact")}</Link>
            </div>

            {/* Right Action Section */}
            <div className="hidden md:flex items-center gap-3.5 shrink-0">
              {session?.authenticated ? (
                <>
                  <Link 
                    href={session.role === "admin" ? "/pages/Admin/DashBoard" : "/pages/Student/DashBoard"} 
                    className="px-3.5 py-2 rounded-lg text-xs font-bold text-teal-700 bg-teal-50 hover:bg-teal-100/70 transition-colors"
                  >
                    {t("nav_dashboard")}
                  </Link>
                  <button 
                    onClick={handleLogout} 
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                    style={{ minHeight: "auto" }}
                  >
                    <LogIn size={15} style={{ transform: "rotate(180deg)" }} />
                    <span>{t("nav_logout")}</span>
                  </button>
                </>
              ) : (
                <Link 
                  href="/pages/Chose_Login" 
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold text-slate-700 hover:text-teal-600 hover:bg-teal-50/50 transition-colors"
                >
                  <LogIn size={15} />
                  <span>{t("nav_login")}</span>
                </Link>
              )}

              {/* Language Switcher */}
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

              {/* Apply Now Primary CTA */}
              <Link 
                href="/pages/Home/Addmission_Application_Form" 
                className="flex items-center justify-center px-4 py-2.5 rounded-lg text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 shadow-xs transition-colors cursor-pointer"
              >
                {t("nav_apply_now")}
              </Link>
            </div>

            {/* Mobile Hamburger Toggle Button */}
            <div className="flex items-center gap-2 xl:hidden">
              <button
                onClick={() => setMobileOpen(true)}
                className="rounded-lg p-2.5 text-slate-600 hover:bg-slate-100 focus:outline-none cursor-pointer transition-colors"
                aria-label="Open navigation menu"
              >
                <Menu size={24} />
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* Mobile Slide-Out Drawer */}
      {mobileOpen && (
        <>
          <div 
            className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs transition-opacity duration-300"
            onClick={() => setMobileOpen(false)}
          />

          <aside className="fixed inset-y-0 right-0 z-50 w-full max-w-xs bg-white shadow-2xl flex flex-col p-6 border-l border-slate-100">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5 text-teal-600 font-bold text-base">
                <GraduationCap size={22} />
                <span>Maa Gauri ITI</span>
              </div>
              <button
                onClick={() => setMobileOpen(false)}
                className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 focus:outline-none cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <nav className="flex flex-col space-y-2 mb-6">
              <Link onClick={() => setMobileOpen(false)} href="/#home" className="px-3 py-2 rounded-lg text-sm font-bold text-slate-700 hover:bg-teal-50 hover:text-teal-700">{t("nav_home")}</Link>
              <Link onClick={() => setMobileOpen(false)} href="/#about" className="px-3 py-2 rounded-lg text-sm font-bold text-slate-700 hover:bg-teal-50 hover:text-teal-700">{t("nav_about")}</Link>
              <Link onClick={() => setMobileOpen(false)} href="/#courses" className="px-3 py-2 rounded-lg text-sm font-bold text-slate-700 hover:bg-teal-50 hover:text-teal-700">{t("nav_courses")}</Link>
              <Link onClick={() => setMobileOpen(false)} href="/pages/Home/Addmission_Application_Form" className="px-3 py-2 rounded-lg text-sm font-bold text-slate-700 hover:bg-teal-50 hover:text-teal-700">{t("nav_admissions")}</Link>
              <Link onClick={() => setMobileOpen(false)} href="/pages/Home/Fee_Structure" className="px-3 py-2 rounded-lg text-sm font-bold text-slate-700 hover:bg-teal-50 hover:text-teal-700">{t("nav_fee_structure")}</Link>
              <Link onClick={() => setMobileOpen(false)} href="/#contact" className="px-3 py-2 rounded-lg text-sm font-bold text-slate-700 hover:bg-teal-50 hover:text-teal-700">{t("nav_contact")}</Link>
            </nav>

            <div className="mt-auto space-y-3 pt-4 border-t border-slate-100">
              {/* Mobile Language Switcher */}
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-xs font-bold text-slate-600">Language / भाषा:</span>
                <button 
                  onClick={toggleLanguage} 
                  className="lang-btn" 
                  type="button"
                  aria-label="Switch Language"
                >
                  <span className={`lang-label ${language === 'en' ? 'active' : ''}`}>EN</span>
                  <span className="lang-divider">|</span>
                  <span className={`lang-label ${language === 'hi' ? 'active' : ''}`}>हिं</span>
                </button>
              </div>

              {session?.authenticated ? (
                <Link
                  onClick={() => setMobileOpen(false)}
                  href={session.role === "admin" ? "/pages/Admin/DashBoard" : "/pages/Student/DashBoard"}
                  className="w-full flex items-center justify-center py-2.5 rounded-lg text-xs font-bold text-white bg-teal-600 hover:bg-teal-700"
                >
                  {t("nav_dashboard")}
                </Link>
              ) : (
                <Link
                  onClick={() => setMobileOpen(false)}
                  href="/pages/Chose_Login"
                  className="w-full flex items-center justify-center py-2.5 rounded-lg text-xs font-bold text-slate-700 bg-slate-100 hover:bg-teal-50 hover:text-teal-700"
                >
                  {t("nav_login")}
                </Link>
              )}

              <Link
                onClick={() => setMobileOpen(false)}
                href="/pages/Home/Addmission_Application_Form"
                className="w-full flex items-center justify-center py-2.5 rounded-lg text-xs font-bold text-white bg-teal-600 hover:bg-teal-700"
              >
                {t("nav_apply_now")}
              </Link>
            </div>
          </aside>
        </>
      )}
    </>
  );
}

