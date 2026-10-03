// src/app/components/Login_Card.tsx
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { GraduationCap, AlertCircle, ShieldCheck, User, UserCheck, KeyRound } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

type LoginCardProps = {
  image: string;
  alter: string;
  role: "Student" | "Admin" | "Teacher";
  para: string;
  label: string;
  type: "number" | "email";
  placeholder: string;
  dashboardPath: string;
};

const Login_Card = (props: LoginCardProps) => {
  const { t } = useLanguage();
  const router = useRouter();

  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const fillDemo = () => {
    if (props.role === "Admin") {
      setLoginId("jayamyname19@gmail.com");
      setPassword("12345");
    } else if (props.role === "Teacher") {
      setLoginId("amit.sharma@mgiti.edu");
      setPassword("12345");
    } else {
      setLoginId("1");
      setPassword("101");
    }
    setError("");
  };

  const validate = () => {
    if (!loginId.trim()) {
      const fieldName = props.role === "Student" ? t("login_student_id") : `${props.role} Email`;
      return `${fieldName} is required.`;
    }

    if (props.type === "number") {
      const value = Number(loginId);
      if (!Number.isInteger(value) || value <= 0) {
        return "Student ID must be a positive number.";
      }
    }

    if (props.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginId)) {
      return "Enter a valid email address.";
    }

    if (!password.trim()) {
      return "Password is required.";
    }

    return "";
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validationError = validate();

    if (validationError) {
      setError(validationError);
      return;
    }

    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: loginId.trim(),
          password: password.trim(),
          role: props.role.toLowerCase(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Authentication failed. Please check credentials.");
        setLoading(false);
        return;
      }

      // Store in localStorage for client-side state
      if (typeof window !== "undefined") {
        localStorage.setItem("currentRole", props.role.toLowerCase());
        if (data.studentId) localStorage.setItem("currentStudentId", String(data.studentId));
        if (data.teacherId) localStorage.setItem("currentTeacherId", String(data.teacherId));
        if (data.name) localStorage.setItem("currentStudentName", data.name);
      }

      router.push(props.dashboardPath);
      router.refresh();
    } catch (err) {
      setError("An unexpected network error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const isStudent = props.role === "Student";
  const isTeacher = props.role === "Teacher";

  return (
    <main className="flex min-h-screen flex-col justify-center items-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        {/* Modern Card Container */}
        <div className="bg-white border border-slate-200 shadow-xs rounded-xl p-7 sm:p-8 transition-all">
          {/* Header branding */}
          <div className="text-center mb-6">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-teal-50 text-teal-600 mb-3 border border-teal-100">
              {isStudent ? <User size={24} /> : isTeacher ? <UserCheck size={24} /> : <ShieldCheck size={24} />}
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
              {props.role} Sign In
            </h2>
            <p className="mt-1 text-xs font-semibold text-slate-500">
              {props.para}
            </p>
          </div>

          {/* Quick Demo Credentials Autofill Banner */}
          <div className="mb-6 p-3 bg-teal-50/50 border border-teal-200/60 rounded-lg flex items-center justify-between">
            <div className="text-[11px] text-slate-900 font-medium">
              <span>Demo Login: </span>
              <b className="text-teal-700">
                {props.role === "Admin" ? "jayamyname19@gmail.com / 12345" : props.role === "Teacher" ? "amit.sharma@mgiti.edu / 12345" : "ID: 1 / Pwd: 101"}
              </b>
            </div>
            <button
              type="button"
              onClick={fillDemo}
              className="text-[11px] font-bold text-teal-700 bg-white border border-teal-200 px-2 py-1 rounded hover:bg-teal-50 shadow-xs cursor-pointer"
            >
              Fill Demo
            </button>
          </div>

          {/* Login Form */}
          <form className="space-y-4" onSubmit={handleSubmit} noValidate>
            {/* ID / Email Input Field */}
            <div className="space-y-1">
              <label 
                htmlFor="login-id" 
                className="block text-xs font-bold uppercase tracking-wider text-slate-500"
              >
                {props.label}
              </label>
              <input
                id="login-id"
                type={props.type}
                placeholder={props.placeholder}
                value={loginId}
                onChange={(event) => setLoginId(event.target.value)}
                className="block w-full rounded-lg border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-teal-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-all duration-150"
                aria-invalid={Boolean(error)}
              />
            </div>

            {/* Password Input Field */}
            <div className="space-y-1">
              <label 
                htmlFor="login-password" 
                className="block text-xs font-bold uppercase tracking-wider text-slate-500"
              >
                Password
              </label>
              <input
                id="login-password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="block w-full rounded-lg border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-teal-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-all duration-150"
              />
            </div>

            {/* Error Message Alert */}
            {error && (
              <div 
                className="flex items-center gap-2 text-xs font-bold text-red-600 bg-red-50 border border-red-100 px-3.5 py-2.5 rounded-lg"
                role="alert"
              >
                <AlertCircle size={16} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="flex w-full justify-center items-center rounded-lg bg-teal-600 hover:bg-teal-700 px-4 py-3 text-sm font-bold text-white shadow-xs focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-colors cursor-pointer disabled:opacity-50"
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>

            {/* Footer Form Links */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs font-bold">
              <Link 
                href="/pages/Chose_Login" 
                className="text-teal-600 hover:text-teal-700 hover:underline transition-colors"
              >
                &larr; Switch Role
              </Link>
              <Link 
                href="/" 
                className="text-slate-500 hover:text-slate-900 hover:underline transition-colors"
              >
                Go to Homepage
              </Link>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
};

export default Login_Card;