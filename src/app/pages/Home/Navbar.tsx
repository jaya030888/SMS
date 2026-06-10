"use client";
import Link from "next/link";
import { GraduationCap, LogIn } from "lucide-react";


export function Navbar() {

  return (
    <header className="site-header">
      <nav className="navbar">

        <Link href="/" className="brand" aria-label="Maa Gauri PVT ITI home">
          <span className="brand-mark"><GraduationCap size={22} strokeWidth={2} /></span>
          <span className="brand-name">Maa Gauri Private ITI</span>
        </Link>

        <div className="nav-links">
          <Link href="/#home">Home</Link>
          <Link href="/#about">About Us</Link>
          <Link href="/#courses">Courses</Link>
          <Link href="/pages/Home/Addmission_Application_Form">Admissions</Link>
          <Link href="/pages/Home/Fee_Structure">Fee Structure</Link>
          <Link href="/#contact">Contact</Link>
          <Link href="/pages/Chose_Login" className="login-link"><LogIn size={16} /> Login</Link>
          
          <Link href="/pages/Home/Addmission_Application_Form" className="button button-primary">
            Apply Now
          </Link>
        </div>

      </nav>
    </header>
  );
}
