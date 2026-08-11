"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { LoginForm } from "../components/login-form";
import { RegisterForm } from "../components/register-form";

type Tab = "login" | "register";

export function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab: Tab = searchParams.get("tab") === "register" ? "register" : "login";
  const [tab, setTab] = useState<Tab>(initialTab);

  function handleSuccess() {
    router.push("/");
  }

  return (
    <div className="grid min-h-screen grid-cols-1 md:grid-cols-2">
      <div className="flex flex-col justify-center gap-6 bg-void px-10 py-16 text-white md:px-16">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-signal font-display text-lg">
          &gt;
        </span>
        <h1 className="font-display text-4xl leading-tight">
          Your next chapter starts at the waypoint.
        </h1>
        <p className="max-w-sm text-text-secondary">
          Sign in to save jobs, track applications, and apply in a click — or
          create an account to get started.
        </p>
      </div>

      <div className="flex flex-col items-center justify-center bg-paper px-10 py-16 md:px-16">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex rounded-full bg-mist p-1">
            <button
              type="button"
              onClick={() => setTab("login")}
              className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold transition ${
                tab === "login" ? "bg-void text-white" : "text-text-secondary"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setTab("register")}
              className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold transition ${
                tab === "register" ? "bg-void text-white" : "text-text-secondary"
              }`}
            >
              Register
            </button>
          </div>

          {tab === "login" ? (
            <LoginForm onSuccess={handleSuccess} />
          ) : (
            <RegisterForm onSuccess={handleSuccess} />
          )}
        </div>
      </div>
    </div>
  );
}
