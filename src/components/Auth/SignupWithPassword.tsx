"use client";

import { EmailIcon, PasswordIcon } from "@/assets/icons";
import Link from "next/link";
import React, { useState } from "react";
import InputGroup from "../FormElements/InputGroup";
import { Checkbox } from "../FormElements/checkbox";
import { useRouter } from "next/navigation";
import { useAlertContext } from "@/providers/alert-provider";

export default function SignupWithPassword() {
  const router = useRouter();
  const alert = useAlertContext();
  
  const [data, setData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setData({
      ...data,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Validation
    if (!data.name || !data.email || !data.password || !data.confirmPassword) {
      alert.error("Validation Error", "Please fill in all fields");
      return;
    }

    if (data.password !== data.confirmPassword) {
      alert.error("Password Mismatch", "Passwords do not match");
      return;
    }

    if (data.password.length < 8) {
      alert.error("Weak Password", "Password must be at least 8 characters");
      return;
    }

    if (!data.agreeToTerms) {
      alert.error("Terms Required", "You must agree to the terms and conditions");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Registration failed");
      }

      alert.success(
        "Registration Successful!",
        "Your account has been created. Redirecting to dashboard..."
      );

      // Redirect to dashboard after successful registration
      setTimeout(() => {
        router.push("/");
      }, 1500);
    } catch (error: any) {
      alert.error(
        "Registration Failed",
        error.message || "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <InputGroup
        type="text"
        label="Full Name"
        className="mb-4 [&_input]:py-[15px]"
        placeholder="Enter your full name"
        name="name"
        handleChange={handleChange}
        value={data.name}
        icon={
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        }
      />

      <InputGroup
        type="email"
        label="Email"
        className="mb-4 [&_input]:py-[15px]"
        placeholder="Enter your email"
        name="email"
        handleChange={handleChange}
        value={data.email}
        icon={<EmailIcon />}
      />

      <InputGroup
        type="password"
        label="Password"
        className="mb-4 [&_input]:py-[15px]"
        placeholder="Enter your password"
        name="password"
        handleChange={handleChange}
        value={data.password}
        icon={<PasswordIcon />}
      />

      <InputGroup
        type="password"
        label="Confirm Password"
        className="mb-5 [&_input]:py-[15px]"
        placeholder="Confirm your password"
        name="confirmPassword"
        handleChange={handleChange}
        value={data.confirmPassword}
        icon={<PasswordIcon />}
      />

      <div className="mb-6 py-2">
        <Checkbox
          label="I agree to the Terms and Conditions"
          name="agreeToTerms"
          withIcon="check"
          minimal
          radius="md"
          onChange={(e) =>
            setData({
              ...data,
              agreeToTerms: e.target.checked,
            })
          }
        />
      </div>

      <div className="mb-4.5">
        <button
          type="submit"
          disabled={loading}
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary p-4 font-medium text-white transition hover:bg-opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
        >
          Create Account
          {loading && (
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-white border-t-transparent dark:border-primary dark:border-t-transparent" />
          )}
        </button>
      </div>
    </form>
  );
}
