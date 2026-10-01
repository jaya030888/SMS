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
  CalendarCheck, 
  CreditCard, 
  FileText, 
  Home, 
  LogOut,
  GraduationCap,
  BookOpen,
  ClipboardList,
  Award,
  Bell,
  Clock,
  UserCheck,
  Building2,
  Globe,
  LayoutGrid
} from "lucide-react";

type StuNavProps = {
  name: string;
  role?: "student" | "admin" | "teacher";
  userName?: string;
};

const StuNav = (props: StuNavProps) => {
  const [open, setOpen] = useState(false);
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
        // fallback to localStorage
        const storedRole = localStorage.getItem("currentRole") as any;
        if (storedRole) setRole(storedRole);
        const storedName = localStorage.getItem("currentStudentName");
        if (storedName) setUserName(storedName);
      }
    }
    loadSession();
  }, [props.role, props.userName]);

  // Define navigation items per role (focused on Student Documents & Fee Management)
  const navItems = role === "admin"
    ? [
        { name: "Dashboard", href: "/pages/Admin/DashBoard", icon: LayoutDashboard },
        { name: "Students & Documents", href: "/pages/Admin/Student", icon: Users },
        { name: "Fee Management", href: "/pages/Admin/fee-details", icon: CreditCard },
        { name: "Courses", href: "/pages/Admin/Courses", icon: BookOpen },
        { name: "Reports", href: "/pages/Admin/Reports", icon: ClipboardList },
        { name: "Admissions", href: "/pages/Home/Addmission_Application_Form", icon: FileText },
        { name: "Website CMS", href: "/pages/Admin/Landing_Page", icon: Globe },
      ]
    : role === "teacher"
    ? [
        { name: "Dashboard", href: "/pages/Teacher/DashBoard", icon: LayoutDashboard },
        { name: "Student Roster", href: "/pages/Teacher/Students", icon: Users },
      ]
    : [
        { name: "Dashboard", href: "/pages/Student/DashBoard", icon: LayoutDashboard },
        { name: "My Documents & Profile", href: "/pages/Student/Profile", icon: User },
        { name: "Fee Details & Receipts", href: "/pages/Student/Fee_Details", icon: CreditCard },
      ];

  const sidebarItems = [
    ...navItems,
    { name: "Home", href: "/", icon: Home },
    { name: "Logout", href: "#", icon: LogOut },
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

  // 4 primary tabs to display directly in the top header
  const primaryTabs = navItems.slice(0, 4);

  return (
    <>
      {/* Sticky Modern Top Header */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md shadow-xs transition-all duration-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between gap-6">
            
            {/* Left side: Hamburger Toggle + Branding Title */}
            <div className="flex items-center gap-3.5 min-w-0 shrink-0">
              <button
                onClick={() => setOpen(true)}
                className="flex items-center gap-1.5 rounded-xl p-2.5 text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus:outline-none cursor-pointer transition-colors"
                aria-label="Open navigation menu"
                title="All Modules"
              >
                <Menu size={22} />
              </button>

              <Link href="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity min-w-0">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow-xs shrink-0">
                  <GraduationCap size={22} />
                </span>
                <div className="min-w-0">
                  <h1 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight truncate">
                    {props.name}
                  </h1>
                </div>
              </Link>
            </div>

            {/* Middle side: Spacious Primary Nav Links + All Modules Button */}
            <nav className="hidden lg:flex items-center gap-2.5">
              {primaryTabs.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-150 ${
                      isActive
                        ? "bg-[#4285CD] text-white shadow-xs"
                        : "text-slate-600 hover:bg-slate-100 hover:text-[#4285CD]"
                    }`}
                  >
                    <Icon size={16} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}

              <button
                onClick={() => setOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
                title="View all system modules"
              >
                <LayoutGrid size={15} className="text-[#4285CD]" />
                <span>All Modules</span>
              </button>
            </nav>

            {/* Right side: Welcome badge & User Profile Pill */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-full bg-slate-50 border border-slate-200/80">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white text-xs font-bold shadow-xs">
                  {getInitials(userName)}
                </span>
                <span className="hidden sm:inline text-xs font-bold text-slate-700">
                  {getPortalLabel()}
                </span>
              </div>
              <Link 
                href="/"
                className="hidden sm:flex h-9 w-9 items-center justify-center rounded-full bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-primary border border-slate-200/80 transition-colors"
                title="Go to Homepage"
                style={{ minHeight: "auto" }}
              >
                <Home size={16} />
              </Link>
              <button 
                onClick={handleLogout}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-50 hover:bg-red-50 text-slate-500 hover:text-red-600 border border-slate-200/80 transition-colors cursor-pointer"
                title="Logout"
                style={{ minHeight: "auto", padding: 0 }}
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Sidebar Overlay & Sidebar Panel */}
      {open && (
        <>
          <div 
            className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300" 
            onClick={() => setOpen(false)} 
          />

          <aside className="fixed inset-y-0 left-0 z-50 w-full max-w-xs bg-white shadow-2xl flex flex-col p-6 border-r border-slate-100 transition-transform duration-300 ease-out transform">
            {/* Sidebar Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-primary font-bold text-base">
                <GraduationCap size={22} />
                <span>Maa Gauri ITI ERP</span>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700 focus:outline-none cursor-pointer"
                aria-label="Close navigation"
              >
                <X size={18} />
              </button>
            </div>

            {/* Profile Widget Card */}
            <div className="bg-slate-50 border border-slate-150 p-3.5 rounded-xl mb-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm shadow-sm shadow-primary/20">
                {getInitials(userName)}
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-xs font-bold text-slate-800 truncate">{userName}</h4>
                <p className="text-[11px] font-semibold text-primary uppercase tracking-wider">
                  {role === "admin" ? "Administrator" : role === "teacher" ? "Instructor / Trainer" : `Student ID: #${studentId}`}
                </p>
              </div>
            </div>

            {/* Navigation List */}
            <nav className="flex-1 space-y-1 overflow-y-auto pr-1">
              {sidebarItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                const isLogout = item.name === "Logout";
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={(e) => {
                      setOpen(false);
                      if (isLogout) handleLogout(e);
                    }}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-bold transition-all duration-150 ${
                      isActive
                        ? "bg-primary text-white shadow-sm shadow-primary/20"
                        : "text-slate-600 hover:bg-slate-50 hover:text-primary"
                    }`}
                  >
                    <Icon size={16} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Footer Sign-off */}
            <div className="mt-auto border-t border-slate-100 pt-3 text-center">
              <p className="text-xs font-semibold text-slate-400">Maa Gauri Pvt ITI Portal</p>
              <p className="text-[10px] text-slate-400 mt-0.5">NCVT Affiliated • ERP v2.5</p>
            </div>
          </aside>
        </>
      )}
    </>
  );
};

export default StuNav;
