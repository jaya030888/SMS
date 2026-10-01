// src/app/components/StuNav.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
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
  FileCheck2
} from "lucide-react";

type StuNavProps = {
  name: string;
  role?: "student" | "admin" | "teacher";
  userName?: string;
};

const StuNav = (props: StuNavProps) => {
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

  // Direct navigation items per role
  const navItems = role === "admin"
    ? [
        { name: "Dashboard", href: "/pages/Admin/DashBoard", icon: LayoutDashboard },
        { name: "Verify Documents", href: "/pages/Admin/Student", icon: ShieldCheck },
        { name: "Fee Ledger", href: "/pages/Admin/fee-details", icon: CreditCard },
        { name: "Landing CMS", href: "/pages/Admin/Landing_Page", icon: Globe },
        { name: "Courses", href: "/pages/Admin/Courses", icon: BookOpen },
        { name: "Reports", href: "/pages/Admin/Reports", icon: ClipboardList },
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
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md shadow-xs transition-all">
      <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
        
        {/* Desktop Single-Row & Mobile Top Row */}
        <div className="flex h-16 sm:h-20 items-center justify-between gap-3 sm:gap-6">
          
          {/* Left: Branding & Page Name */}
          <Link href="/" className="flex items-center gap-2.5 sm:gap-3 hover:opacity-90 transition-opacity min-w-0 shrink-0">
            <span className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-[#4285CD] text-white shadow-xs shrink-0">
              <GraduationCap size={20} className="sm:w-[22px] sm:h-[22px]" />
            </span>
            <div className="min-w-0">
              <h1 className="text-xs sm:text-base font-extrabold text-slate-900 tracking-tight truncate max-w-[140px] sm:max-w-none">
                {props.name}
              </h1>
            </div>
          </Link>

          {/* Desktop Navigation Tabs (Inline) */}
          <nav className="hidden md:flex items-center gap-1.5 sm:gap-2 overflow-x-auto py-1 px-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-3.5 py-2 sm:py-2.5 rounded-xl text-xs font-bold transition-all duration-150 whitespace-nowrap shrink-0 ${
                    isActive
                      ? "bg-[#4285CD] text-white shadow-xs"
                      : "text-slate-600 hover:bg-slate-100 hover:text-[#4285CD]"
                  }`}
                >
                  <Icon size={15} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right: User Profile Pill & Actions */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div className="flex items-center gap-2 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-full bg-slate-50 border border-slate-200/80">
              <span className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-[#4285CD] text-white text-[11px] sm:text-xs font-bold shadow-xs">
                {getInitials(userName)}
              </span>
              <span className="hidden sm:inline text-xs font-bold text-slate-700 max-w-[100px] sm:max-w-[140px] truncate">
                {getPortalLabel()}
              </span>
            </div>

            <Link 
              href="/"
              className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-[#4285CD] border border-slate-200/80 transition-colors"
              title="Homepage"
            >
              <Home size={15} />
            </Link>

            <button 
              onClick={handleLogout}
              className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-slate-50 hover:bg-rose-50 text-slate-500 hover:text-rose-600 border border-slate-200/80 transition-colors cursor-pointer"
              title="Logout"
            >
              <LogOut size={15} />
            </button>
          </div>

        </div>

        {/* Mobile Horizontal Scrollable Tabs Row (< 768px) */}
        <div className="md:hidden border-t border-slate-100 py-2 overflow-x-auto no-scrollbar">
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
          </nav>
        </div>

      </div>
    </header>
  );
};

export default StuNav;
