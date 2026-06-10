"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

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
        return "Student ID must be a positive number.";
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

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
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
          (a: { id: number }) =>
            a.id === Number(loginId)
        );

        if (!applicant) {
          setError("Student ID not found");
          return;
        }

        if (password !== "10" + String(applicant.id)) {
          setError("Invalid Password");
          return;
        }

        localStorage.setItem(
          "currentStudentId",
          loginId
        );
        localStorage.setItem(
          "currentRole",
          "student"
        );

        router.push(props.dashboardPath);
      } else {
        if (
          loginId === "jayamyname19@gmail.com" &&
          password === "12345"
        ) {
          localStorage.setItem(
            "currentRole",
            "admin"
          );

          router.push(props.dashboardPath);
        } else {
          setError("You are not an Admin");
        }
      }
    } catch (err) {
      console.error(err);
      setError("Something went wrong");
    }
  };

  return (
    <main className="auth-page">
      <form
        className="auth-card card"
        onSubmit={handleSubmit}
        noValidate
      >
        <Image
          src={props.image}
          alt={props.alter}
          height={48}
          width={48}
        />

        <h2>{props.role} Login</h2>
        <p>{props.para}</p>

        <div className="field">
          <label htmlFor="login-id">
            {props.label}
          </label>

          <input
            id="login-id"
            type={props.type}
            inputMode={
              props.type === "number"
                ? "numeric"
                : "email"
            }
            min={
              props.type === "number"
                ? 1
                : undefined
            }
            placeholder={props.placeholder}
            value={loginId}
            onChange={(event) =>
              setLoginId(event.target.value)
            }
            aria-invalid={Boolean(error)}
            aria-describedby={
              error ? "login-error" : undefined
            }
          />
        </div>

        <div className="field">
          <label htmlFor="login-password">
            Password
          </label>

          <input
            id="login-password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(event) =>
              setPassword(event.target.value)
            }
          />
        </div>

        {error && (
          <p
            className="form-error"
            id="login-error"
            role="alert"
          >
            {error}
          </p>
        )}

        <button
          className="button button-primary"
          type="submit"
        >
          Login
        </button>

        <div className="auth-links">
          <Link href="/pages/Chose_Login">
            Back to login options
          </Link>

          <Link href="/">Home</Link>
        </div>
      </form>
    </main>
  );
};

export default Login_Card;