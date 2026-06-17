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
  BookOpen
} from "lucide-react";

type StuNavProps = {
  name: string;
  role?: "student" | "admin";
  userName?: string;
};

const StuNav = (props: StuNavProps) => {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const role = props.role ?? "student";
  const [userName, setUserName] = useState(props.userName ?? (role === "admin" ? "Admin" : "Rajesh"));
  const [studentId, setStudentId] = useState("1");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedRole = localStorage.getItem("currentRole");
      const actualRole = props.role ?? (storedRole === "admin" ? "admin" : "student");
      
      if (actualRole === "admin") {
        setUserName("Admin");
      } else {
        const storedId = localStorage.getItem("currentStudentId") || "1";
        setStudentId(storedId);
        
        fetch("/api/applicants")
          .then((res) => {
            if (res.ok) return res.json();
            throw new Error();
          })
          .then((applicants) => {
            const currentStudent = applicants.find((a: any) => String(a.id) === String(storedId));
            if (currentStudent) {
              setUserName(currentStudent.name);
              localStorage.setItem("currentStudentName", currentStudent.name);
            } else {
              setUserName("Rajesh Kumar");
            }
          })
          .catch(() => {
            setUserName("Rajesh Kumar");
          });
      }
    }
  }, [props.userName, role, props.role]);

  // Define navigation items with Lucide icons
  const navItems = role === "admin"
    ? [
        { name: "Dashboard", href: "/pages/Admin/DashBoard", icon: LayoutDashboard },
        { name: "Students", href: "/pages/Admin/Student", icon: Users },
        { name: "Courses", href: "/pages/Admin/Courses", icon: BookOpen },
        { name: "Attendance", href: "/pages/Admin/Attendance", icon: CalendarCheck },
        { name: "Fee Management", href: "/pages/Admin/FeeDetails", icon: CreditCard },
        { name: "Admissions", href: "/pages/Home/Addmission_Application_Form", icon: FileText },
      ]
    : [
        { name: "Dashboard", href: "/pages/Student/DashBoard", icon: LayoutDashboard },
        { name: "My Profile", href: "/pages/Student/Profile", icon: User },
        { name: "Attendance", href: "/pages/Student/Attendance", icon: CalendarCheck },
        { name: "Fee Details", href: "/pages/Student/Fee_Details", icon: CreditCard },
      ];

  const sidebarItems = [
    ...navItems,
    { name: "Home", href: "/", icon: Home },
    { name: "Logout", href: "#", icon: LogOut },
  ];

  // Get user initials for avatar
  const getInitials = (name: string) => {
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

  return (
    <>
      {/* Sticky Modern Top Header */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md shadow-sm transition-all duration-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Left side: Hamburger (mobile) + Branding Title */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setOpen(true)}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 focus:outline-none md:hidden"
                aria-label="Open navigation"
              >
                <Menu size={20} />
              </button>

              <div className="flex items-center gap-2">
                <span className="hidden sm:flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-white shadow-sm shadow-primary/20">
                  <GraduationCap size={20} />
                </span>
                <h1 className="text-lg font-bold text-slate-800 tracking-tight sm:text-xl">
                  {props.name}
                </h1>
              </div>
            </div>

            {/* Middle side: Desktop Nav Links */}
            <nav className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-150 ${
                      isActive
                        ? "bg-primary text-white shadow-sm shadow-primary/25"
                        : "text-slate-600 hover:bg-slate-50 hover:text-primary"
                    }`}
                  >
                    <Icon size={16} />
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            {/* Right side: Welcome badge & User Profile Pill */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-100">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                  {getInitials(userName)}
                </span>
                <span className="hidden sm:inline text-xs font-bold text-slate-600">
                  {role === "admin" ? "Admin Portal" : userName}
                </span>
              </div>
              <button 
                onClick={handleLogout}
                className="hidden md:flex h-9 w-9 items-center justify-center rounded-full bg-slate-50 hover:bg-red-50 text-slate-500 hover:text-red-600 border border-slate-200 transition-colors cursor-pointer"
                title="Logout"
                style={{ minHeight: "auto", padding: 0 }}
              >
                <LogOut size={15} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Drawer Sidebar Overlay & Sidebar Panel */}
      {open && (
        <>
          {/* Backdrop Overlay */}
          <div 
            className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300" 
            onClick={() => setOpen(false)} 
          />

          {/* Sliding Panel */}
          <aside className="fixed inset-y-0 left-0 z-50 w-full max-w-xs bg-white shadow-2xl flex flex-col p-6 border-r border-slate-100 transition-transform duration-300 ease-out transform">
            {/* Sidebar Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2 text-primary font-bold text-lg">
                <GraduationCap size={24} />
                <span>Maa Gauri ITI</span>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700 focus:outline-none"
                aria-label="Close navigation"
              >
                <X size={20} />
              </button>
            </div>

            {/* Profile Widget Card */}
            <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl mb-6 flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm shadow-sm shadow-primary/20">
                {getInitials(userName)}
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-bold text-slate-800 truncate">{userName}</h4>
                <p className="text-xs font-semibold text-slate-500 truncate">
                  {role === "admin" ? "Administrator" : `ID: #${studentId}`}
                </p>
              </div>
            </div>

            {/* Navigation List */}
            <nav className="flex-1 space-y-1">
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
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-bold transition-all duration-150 ${
                      isActive
                        ? "bg-primary/10 text-primary border-l-4 border-primary pl-2.5"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <Icon size={18} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Footer Sign-off */}
            <div className="mt-auto border-t border-slate-100 pt-4 text-center">
              <p className="text-xs font-medium text-slate-400">Maa Gauri Private ITI</p>
              <p className="text-[10px] text-slate-400 mt-0.5">ERP Portal v2.0</p>
            </div>
          </aside>
        </>
      )}
    </>
  );
};

export default StuNav;
