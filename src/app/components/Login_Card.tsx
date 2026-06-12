"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { GraduationCap, AlertCircle } from "lucide-react";

type LoginCardProps = {
  image: string;
  alter: string;
  role: "Student" | "Admin";
  para: string;
  label: string;
  type: "number" | "email";
  placeholder: string;
  dashboardPath: string;
};

const Login_Card = (props: LoginCardProps) => {
  const router = useRouter();

  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const validate = () => {
    if (!loginId.trim()) {
      return `${props.label} is required.`;
    }

    if (props.type === "number") {
      const value = Number(loginId);

      if (!Number.isInteger(value) || value <= 0) {
        return "Student ID must be a positive integer.";
      }
    }

    if (
      props.type === "email" &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginId)
    ) {
      return "Enter a valid email address.";
    }

    if (!password.trim()) {
      return "Password is required.";
    }

    if (password.length < 3) {
      return "Password must be at least 3 characters.";
    }

    return "";
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const message = validate();

    if (message) {
      setError(message);
      return;
    }

    setError("");

    try {
      if (props.role === "Student") {
        const res = await fetch("/api/applicants");

        if (!res.ok) {
          throw new Error("Failed to fetch applicants");
        }

        const applicants = await res.json();

        const applicant = applicants.find(
          (a: { id: number }) => a.id === Number(loginId)
        );

        if (!applicant) {
          setError("Student ID not found");
          return;
        }

        if (password !== "10" + String(applicant.id)) {
          setError("Invalid Password");
          return;
        }

        localStorage.setItem("currentStudentId", loginId);
        localStorage.setItem("currentRole", "student");

        router.push(props.dashboardPath);
      } else {
        if (loginId === "jayamyname19@gmail.com" && password === "12345") {
          localStorage.setItem("currentRole", "admin");
          router.push(props.dashboardPath);
        } else {
          setError("Invalid admin email or password");
        }
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred. Please try again.");
    }
  };

  return (
    <main className="flex min-h-screen flex-col justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-white shadow-md shadow-primary/20 mb-4">
          <GraduationCap size={28} />
        </span>
        <h2 className="text-3xl font-extrabold tracking-tight text-slate-800">
          {props.role} Login
        </h2>
        <p className="mt-1.5 text-sm font-semibold text-slate-500 max-w-xs mx-auto">
          {props.para}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 border border-slate-100 shadow-xl rounded-2xl sm:px-10">
          <form className="space-y-5" onSubmit={handleSubmit} noValidate>
            
            {/* Login ID Input Field */}
            <div className="space-y-1.5">
              <label 
                htmlFor="login-id" 
                className="block text-xs font-bold uppercase tracking-wider text-slate-500"
              >
                {props.label}
              </label>
              <input
                id="login-id"
                type={props.type}
                inputMode={props.type === "number" ? "numeric" : "email"}
                min={props.type === "number" ? 1 : undefined}
                placeholder={props.placeholder}
                value={loginId}
                onChange={(event) => setLoginId(event.target.value)}
                className="block w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-150"
                aria-invalid={Boolean(error)}
                aria-describedby={error ? "login-error" : undefined}
              />
            </div>

            {/* Password Input Field */}
            <div className="space-y-1.5">
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
                className="block w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:border-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-150"
              />
            </div>

            {/* Error Message Alert */}
            {error && (
              <div 
                className="flex items-center gap-2 text-xs font-bold text-red-600 bg-red-50 border border-red-100 px-4 py-3 rounded-xl"
                id="login-error"
                role="alert"
              >
                <AlertCircle size={16} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="flex w-full justify-center items-center rounded-xl bg-primary px-4 py-3 text-sm font-bold text-white shadow-md shadow-primary/25 hover:bg-primary-dark hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-primary/20 active:translate-y-0 transition-all duration-150 cursor-pointer"
            >
              Sign In
            </button>

            {/* Footer Form Links */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs font-bold">
              <Link 
                href="/pages/Chose_Login" 
                className="text-primary hover:text-primary-dark hover:underline transition-colors"
              >
                Back to roles
              </Link>
              <Link 
                href="/" 
                className="text-slate-500 hover:text-slate-800 hover:underline transition-colors"
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