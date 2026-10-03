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

const StuNav = (props: StuNavProps) => {
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

  // Admin modules for 3-line menu drawer
  const adminDrawerModules = [
    { name: "Executive Dashboard", href: "/pages/Admin/DashBoard", icon: LayoutDashboard, desc: "Document KYC & fee overview" },
    { name: "Student Document Verification", href: "/pages/Admin/Student", icon: ShieldCheck, desc: "Aadhaar & marksheet approvals" },
    { name: "Fee Management & Ledger", href: "/pages/Admin/fee-details", icon: CreditCard, desc: "Receipts & payment collection" },
    { name: "Landing Page CMS", href: "/pages/Admin/Landing_Page", icon: Globe, desc: "Multi-contact & website editor" },
    { name: "Vocational Trades & Batches", href: "/pages/Admin/Courses", icon: BookOpen, desc: "Curriculum & seat allocation" },
    { name: "Audit Reports", href: "/pages/Admin/Reports", icon: ClipboardList, desc: "Exportable registry logs" },
    { name: "Enroll New Student", href: "/pages/Home/Addmission_Application_Form", icon: FileText, desc: "Admission registration form" },
  ];

  // Direct top navbar items per role
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

  // Get initials
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
          
          <div className="flex h-16 sm:h-20 items-center justify-between gap-3 sm:gap-4">
            
            {/* Left: Hamburger (for Admin) + Brand Title */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0 min-w-0">
              {role === "admin" && (
                <button
                  type="button"
                  onClick={() => setDrawerOpen(true)}
                  className="flex items-center justify-center h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 transition-colors cursor-pointer shrink-0 shadow-2xs"
                  aria-label="Open Admin Menu"
                  title="Admin Modules Menu"
                >
                  <Menu size={19} className="text-slate-700" />
                </button>
              )}

              <Link href="/" className="flex items-center gap-2.5 sm:gap-3 hover:opacity-90 transition-opacity min-w-0">
                <span className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-[#4285CD] text-white shadow-xs shrink-0">
                  <GraduationCap size={20} className="sm:w-[22px] sm:h-[22px]" />
                </span>
                <div className="min-w-0">
                  <h1 className="text-xs sm:text-base font-extrabold text-slate-900 tracking-tight truncate max-w-[140px] sm:max-w-[200px] lg:max-w-none">
                    {props.name}
                  </h1>
                </div>
              </Link>
            </div>

            {/* Center: Top Navigation Tabs (Visible on xl+ desktop) */}
            <nav className="hidden xl:flex items-center gap-1.5 shrink min-w-0">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
                      isActive
                        ? "bg-[#4285CD] text-white shadow-xs"
                        : "text-slate-600 hover:bg-slate-100 hover:text-[#4285CD]"
                    }`}
                  >
                    <Icon size={14} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Right: User Profile Pill, Home & ALWAYS-VISIBLE LOGOUT BUTTON */}
            <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
              <div className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200/80 shrink-0">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#4285CD] text-white text-[11px] sm:text-xs font-bold shadow-xs shrink-0">
                  {getInitials(userName)}
                </span>
                <span className="text-xs font-bold text-slate-700 max-w-[110px] truncate">
                  {getPortalLabel()}
                </span>
              </div>

              <Link 
                href="/"
                className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-[#4285CD] border border-slate-200/80 transition-colors shrink-0"
                title="Go to Homepage"
              >
                <Home size={15} />
              </Link>

              {/* Prominent, high-contrast Logout button */}
              <button 
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs shadow-2xs transition-all cursor-pointer shrink-0"
                title="Sign out of account"
              >
                <LogOut size={14} className="text-rose-600 shrink-0" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>

          </div>

          {/* Responsive Horizontal Scrollable Tabs (< 1280px) */}
          <div className="xl:hidden border-t border-slate-100 py-2 overflow-x-auto no-scrollbar">
            <nav className="flex items-center gap-1.5 px-1 min-w-max">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                      isActive
                        ? "bg-[#4285CD] text-white shadow-2xs"
                        : "text-slate-600 bg-slate-50 hover:bg-slate-100 hover:text-[#4285CD]"
                    }`}
                  >
                    <Icon size={13} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
              {role === "admin" && (
                <button
                  onClick={() => setDrawerOpen(true)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-[#4285CD] bg-indigo-50 hover:bg-indigo-100 cursor-pointer"
                >
                  <Menu size={13} />
                  <span>All Modules</span>
                </button>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Admin 3-Line Menu Drawer Overlay & Panel */}
      {drawerOpen && (
        <>
          <div 
            className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs transition-opacity duration-300"
            onClick={() => setDrawerOpen(false)}
          />

          <aside className="fixed inset-y-0 left-0 z-50 w-full max-w-sm bg-white shadow-2xl flex flex-col p-6 border-r border-slate-200 transition-transform duration-300 ease-out animate-in slide-in-from-left">
            
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-150">
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#4285CD] text-white shadow-xs">
                  <GraduationCap size={20} />
                </span>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">Admin Control Center</h3>
                  <p className="text-[10px] text-slate-400">Maa Gauri ITI Governance</p>
                </div>
              </div>
              <button
                onClick={() => setDrawerOpen(false)}
                className="h-8 w-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Admin Modules Navigation */}
            <div className="flex-1 overflow-y-auto py-4 space-y-1.5 pr-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">
                Institutional Modules
              </p>
              {adminDrawerModules.map((m) => {
                const isActive = pathname === m.href;
                const Icon = m.icon;
                return (
                  <Link
                    key={m.name}
                    href={m.href}
                    onClick={() => setDrawerOpen(false)}
                    className={`flex items-start gap-3 p-3 rounded-2xl transition-all ${
                      isActive 
                        ? "bg-[#4285CD] text-white shadow-sm" 
                        : "hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <div className={`p-2 rounded-xl mt-0.5 ${
                      isActive ? "bg-white/20 text-white" : "bg-slate-100 text-[#4285CD]"
                    }`}>
                      <Icon size={16} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <strong className="text-xs font-extrabold block truncate">{m.name}</strong>
                      <span className={`text-[11px] block truncate ${
                        isActive ? "text-indigo-100" : "text-slate-400"
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
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
              >
                <Home size={14} />
                <span>Visit Public Website</span>
              </Link>
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs transition-colors cursor-pointer border border-rose-200"
              >
                <LogOut size={14} />
                <span>Sign Out from Admin</span>
              </button>
            </div>

          </aside>
        </>
      )}
    </>
  );
};

export default StuNav;
