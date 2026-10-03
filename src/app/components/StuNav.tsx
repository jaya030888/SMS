// src/app/components/StuNav.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Menu,
  X,
  LayoutDashboard, 
  User, 
  Users, 
  CreditCard, 
  Home, 
  LogOut,
  GraduationCap,
  BookOpen,
  ClipboardList,
  Globe,
  ShieldCheck,
  FileCheck2,
  FileText,
  ChevronRight
} from "lucide-react";

type StuNavProps = {
  name: string;
  role?: "student" | "admin" | "teacher";
  userName?: string;
};

export default function StuNav(props: StuNavProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const pathname = usePathname();
  const [role, setRole] = useState<"student" | "admin" | "teacher">(props.role ?? "student");
  const [userName, setUserName] = useState(props.userName ?? "User");
  const [studentId, setStudentId] = useState("1");

  useEffect(() => {
    async function loadSession() {
      try {
        const res = await fetch("/api/auth/session");
        if (res.ok) {
          const session = await res.json();
          if (session.authenticated) {
            setRole(session.role);
            if (session.name) setUserName(session.name);
            else if (session.role === "admin") setUserName("Administrator");
            else if (session.role === "teacher") setUserName("Teacher");
            else setUserName("Student");

            if (session.studentId) setStudentId(String(session.studentId));
          }
        }
      } catch (e) {
        const storedRole = localStorage.getItem("currentRole") as any;
        if (storedRole) setRole(storedRole);
        const storedName = localStorage.getItem("currentStudentName");
        if (storedName) setUserName(storedName);
      }
    }
    loadSession();
  }, [props.role, props.userName]);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  // Drawer Modules per Role
  const drawerModules = role === "admin"
    ? [
        { name: "Executive Dashboard", href: "/pages/Admin/DashBoard", icon: LayoutDashboard, desc: "Document KYC & fee overview" },
        { name: "Student Document Verification", href: "/pages/Admin/Student", icon: ShieldCheck, desc: "Aadhaar & marksheet approvals" },
        { name: "Fee Management & Ledger", href: "/pages/Admin/fee-details", icon: CreditCard, desc: "Receipts & payment collection" },
        { name: "Landing Page CMS", href: "/pages/Admin/Landing_Page", icon: Globe, desc: "Multi-contact & website editor" },
        { name: "Vocational Trades & Batches", href: "/pages/Admin/Courses", icon: BookOpen, desc: "Curriculum & seat allocation" },
        { name: "Audit Reports", href: "/pages/Admin/Reports", icon: ClipboardList, desc: "Exportable registry logs" },
        { name: "Enroll New Student", href: "/pages/Home/Addmission_Application_Form", icon: FileText, desc: "Admission registration form" },
      ]
    : role === "teacher"
    ? [
        { name: "Instructor Dashboard", href: "/pages/Teacher/DashBoard", icon: User, desc: "Teacher profile & classes" },
        { name: "Students List", href: "/pages/Admin/Student", icon: Users, desc: "Class roster & details" },
      ]
    : [
        { name: "Student Dashboard", href: "/pages/Student/DashBoard", icon: LayoutDashboard, desc: "Academic overview & quick stats" },
        { name: "My Profile & KYC Documents", href: "/pages/Student/Profile", icon: User, desc: "Personal info & certificate status" },
        { name: "Fee Details & Receipts", href: "/pages/Student/Fee_Details", icon: CreditCard, desc: "Fee ledger & downloadable receipts" },
        { name: "Admission Application", href: "/pages/Home/Addmission_Application_Form", icon: FileText, desc: "Submit new documents" },
      ];

  // Direct top navbar items (shown on lg+ screens)
  const navItems = role === "admin"
    ? [
        { name: "Dashboard", href: "/pages/Admin/DashBoard", icon: LayoutDashboard },
        { name: "Verify Documents", href: "/pages/Admin/Student", icon: ShieldCheck },
        { name: "Fee Ledger", href: "/pages/Admin/fee-details", icon: CreditCard },
        { name: "Landing CMS", href: "/pages/Admin/Landing_Page", icon: Globe },
      ]
    : role === "teacher"
    ? [
        { name: "Instructor Profile", href: "/pages/Teacher/DashBoard", icon: User },
      ]
    : [
        { name: "Dashboard", href: "/pages/Student/DashBoard", icon: LayoutDashboard },
        { name: "My Documents & Profile", href: "/pages/Student/Profile", icon: User },
        { name: "Fee Details & Receipts", href: "/pages/Student/Fee_Details", icon: CreditCard },
      ];

  const getInitials = (name: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (err) {
      console.error("Logout API failed:", err);
    }
    localStorage.clear();
    window.location.href = "/pages/Chose_Login";
  };

  const getPortalLabel = () => {
    if (role === "admin") return "Admin Portal";
    if (role === "teacher") return "Teacher Portal";
    return userName;
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md shadow-xs">
        <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
          <div className="flex h-16 sm:h-18 items-center justify-between gap-2 sm:gap-4">
            
            {/* Left: Mobile Drawer Trigger + Brand Logo & Title */}
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 shrink">
              {/* Hamburger Button (visible on mobile / tablet < lg, opens complete navigation drawer) */}
              <button
                type="button"
                onClick={() => setDrawerOpen(true)}
                className="flex lg:hidden items-center justify-center h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-slate-100 hover:bg-slate-200 active:bg-slate-300 border border-slate-300 text-slate-900 transition-colors cursor-pointer shrink-0 shadow-xs"
                aria-label="Open Navigation Menu"
                title="Open Navigation Menu"
              >
                <div className="flex flex-col justify-center items-center gap-1 w-4 h-4">
                  <span className="w-4 h-0.5 bg-slate-900 rounded-full block"></span>
                  <span className="w-4 h-0.5 bg-slate-900 rounded-full block"></span>
                  <span className="w-4 h-0.5 bg-slate-900 rounded-full block"></span>
                </div>
              </button>

              {/* Admin Menu Drawer Trigger for Desktop (if admin) */}
              {role === "admin" && (
                <button
                  type="button"
                  onClick={() => setDrawerOpen(true)}
                  className="hidden lg:flex items-center justify-center h-10 w-10 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-900 transition-colors cursor-pointer shrink-0 shadow-xs"
                  aria-label="Admin Modules Menu"
                  title="All Admin Modules"
                >
                  <div className="flex flex-col justify-center items-center gap-1 w-4 h-4">
                    <span className="w-4 h-0.5 bg-slate-900 rounded-full block"></span>
                    <span className="w-4 h-0.5 bg-slate-900 rounded-full block"></span>
                    <span className="w-4 h-0.5 bg-slate-900 rounded-full block"></span>
                  </div>
                </button>
              )}

              {/* Brand Logo & Name */}
              <Link href="/" className="flex items-center gap-2 sm:gap-2.5 hover:opacity-90 transition-opacity min-w-0">
                <span className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg bg-teal-600 text-white shadow-xs shrink-0">
                  <GraduationCap size={19} strokeWidth={2.4} className="text-white" />
                </span>
                <div className="min-w-0">
                  <h1 className="text-xs sm:text-sm md:text-base font-bold text-slate-900 tracking-tight truncate max-w-[120px] xs:max-w-[180px] sm:max-w-[240px] md:max-w-none">
                    {props.name}
                  </h1>
                </div>
              </Link>
            </div>

            {/* Center: Desktop Navigation Tabs (Visible on lg+ screens) */}
            <nav className="hidden lg:flex items-center gap-1.5 shrink min-w-0">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-1.5 px-3 py-1.5 xl:px-3.5 xl:py-2 rounded-lg text-xs font-bold transition-colors whitespace-nowrap shrink-0 ${
                      isActive
                        ? "bg-teal-600 text-white shadow-xs"
                        : "text-slate-600 hover:bg-teal-50/50 hover:text-teal-600"
                    }`}
                  >
                    <Icon size={15} strokeWidth={2.2} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Right: User Profile, Home & Logout Buttons */}
            <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
              {/* User Avatar Badge (Compact on mobile, expanded on sm+) */}
              <button
                type="button"
                onClick={() => setDrawerOpen(true)}
                className="flex items-center gap-2 sm:px-3 sm:py-1.5 rounded-full sm:bg-slate-50 sm:border sm:border-slate-200/80 hover:bg-teal-50/40 hover:border-teal-200 transition-colors cursor-pointer shrink-0"
                title="View Profile & Navigation"
              >
                <span className="flex h-8 w-8 sm:h-7 sm:w-7 items-center justify-center rounded-full bg-teal-600 text-white text-[11px] sm:text-xs font-bold shadow-2xs shrink-0">
                  {getInitials(userName)}
                </span>
                <span className="hidden sm:inline text-xs font-bold text-slate-700 max-w-[110px] truncate">
                  {getPortalLabel()}
                </span>
              </button>

              {/* Homepage Link */}
              <Link 
                href="/"
                className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-slate-50 hover:bg-teal-50 text-slate-700 hover:text-teal-600 border border-slate-200 hover:border-teal-200 transition-colors shrink-0"
                title="Go to Homepage"
              >
                <Home size={16} strokeWidth={2.2} />
              </Link>

              {/* Logout Button (Icon only on mobile, expanded on sm+) */}
              <button 
                onClick={handleLogout}
                className="flex items-center justify-center gap-1.5 h-8 w-8 sm:h-auto sm:w-auto sm:px-3 sm:py-1.5 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs shadow-2xs transition-colors cursor-pointer shrink-0"
                title="Sign out of account"
              >
                <LogOut size={15} strokeWidth={2.2} className="text-rose-600 shrink-0" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* Universal Responsive Menu Drawer Overlay & Panel */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity duration-300"
            onClick={() => setDrawerOpen(false)}
          />

          {/* Drawer Sidebar */}
          <aside className="fixed inset-y-0 left-0 z-50 w-full max-w-xs sm:max-w-sm bg-white shadow-2xl flex flex-col p-5 sm:p-6 border-r border-slate-200 transition-transform duration-300 ease-out animate-in slide-in-from-left">
            
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-150">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-600 text-white shadow-xs shrink-0">
                  <GraduationCap size={20} />
                </span>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-slate-900 truncate">
                    {role === "admin" ? "Admin Control Center" : role === "teacher" ? "Teacher Portal" : "Student Portal"}
                  </h3>
                  <p className="text-[10px] text-slate-400 truncate">Maa Gauri Private ITI</p>
                </div>
              </div>
              <button
                onClick={() => setDrawerOpen(false)}
                className="h-8 w-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                aria-label="Close Menu"
              >
                <X size={16} />
              </button>
            </div>

            {/* User Info Card in Drawer */}
            <div className="mt-4 p-3.5 rounded-lg bg-teal-50/40 border border-teal-200/60 flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-teal-600 text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-2xs">
                {getInitials(userName)}
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-xs font-bold text-slate-900 truncate">{userName}</h4>
                <p className="text-[10px] text-slate-500 uppercase font-semibold tracking-wider">
                  Role: <span className="text-teal-700 font-bold">{role}</span>
                </p>
              </div>
            </div>

            {/* Modules Navigation Links */}
            <div className="flex-1 overflow-y-auto py-4 space-y-1.5 pr-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">
                Navigation Menu
              </p>
              {drawerModules.map((m) => {
                const isActive = pathname === m.href;
                const Icon = m.icon;
                return (
                  <Link
                    key={m.name}
                    href={m.href}
                    onClick={() => setDrawerOpen(false)}
                    className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${
                      isActive 
                        ? "bg-teal-600 text-white shadow-xs" 
                        : "hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <div className={`p-2 rounded-lg mt-0.5 shrink-0 ${
                      isActive ? "bg-white/20 text-white" : "bg-teal-50 text-teal-600"
                    }`}>
                      <Icon size={16} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <strong className="text-xs font-bold block truncate">{m.name}</strong>
                      <span className={`text-[11px] block truncate ${
                        isActive ? "text-teal-100" : "text-slate-400"
                      }`}>
                        {m.desc}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Drawer Footer Actions */}
            <div className="pt-4 border-t border-slate-150 space-y-2">
              <Link
                href="/"
                onClick={() => setDrawerOpen(false)}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
              >
                <Home size={14} />
                <span>Visit Public Website</span>
              </Link>
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs transition-colors cursor-pointer border border-rose-200"
              >
                <LogOut size={14} />
                <span>Sign Out</span>
              </button>
            </div>

          </aside>
        </div>
      )}
    </>
  );
}
