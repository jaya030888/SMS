"use client";

import Info_Card from "@/src/app/components/Info_Card";
import Sidebar_Card from "@/src/app/components/Sidebar_Card";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

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

  const navItems =
    role === "admin"
      ? [
          { name: "Dashboard", href: "/pages/Admin/DashBoard" },
          { name: "Students", href: "/pages/Admin/Student" },
          { name: "Attendance", href: "/pages/Admin/Attendance" },
          { name: "Admissions", href: "/pages/Home/Addmission_Application_Form" },
        ]
      : [
          { name: "Dashboard", href: "/pages/Student/DashBoard" },
          { name: "My Profile", href: "/pages/Student/Profile" },
          { name: "Attendance", href: "/pages/Student/Attendance" },
          { name: "Fee Details", href: "/pages/Student/Fee_Details" },
        ];

  const sidebarItems = [
    ...navItems,
    { name: "Home", href: "/" },
    { name: "Logout", href: "/pages/Chose_Login" },
  ];

  return (
    <>
      <header className="app-header">
        <nav className="app-nav">
          <button
            onClick={() => setOpen(true)}
            className="icon-button"
            aria-label="Open navigation"
          >
            <Menu size={22} />
          </button>

          <h1>{props.name}</h1>
          <div className="app-nav-links">
            {navItems.map((item) => (
              <Link
                key={item.href}
                className={pathname === item.href ? "active" : ""}
                href={item.href}
              >
                {item.name}
              </Link>
            ))}
          </div>
          <span>Welcome, {userName}</span>
        </nav>
      </header>

      {open && (
        <>
          <div className="sidebar-overlay" onClick={() => setOpen(false)} />

          <aside className="app-sidebar">
            <button
              onClick={() => setOpen(false)}
              className="icon-button sidebar-close"
              aria-label="Close navigation"
            >
              <X size={20} />
            </button>

            <Info_Card
              image="/file.svg"
              alter={role}
              feild={role === "admin" ? "Admin Panel" : userName}
              entry={role === "admin" ? "Management access" : `ID: #${studentId}`}
            />

            <nav className="sidebar-nav">
              {sidebarItems.map((item) => (
                <Sidebar_Card
                  key={item.href}
                  image="/file.svg"
                  alter={item.name}
                  name={item.name}
                  href={item.href}
                  active={pathname === item.href}
                />
              ))}
            </nav>
          </aside>
        </>
      )}
    </>
  );
};

export default StuNav;
