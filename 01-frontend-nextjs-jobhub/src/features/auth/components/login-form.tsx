"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useLogin } from "../hooks/use-login";
import { loginSchema, type LoginFormValues } from "../utils/auth-form.schema";

interface LoginFormProps {
  onSuccess?: () => void;
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const { submit, isLoading, error } = useLogin();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(values: LoginFormValues) {
    const ok = await submit(values);
    if (ok) onSuccess?.();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="login-email" className="text-sm font-medium text-text-body">
          Email
        </label>
        <input
          id="login-email"
          type="email"
          autoComplete="email"
          className="rounded-[10px] border border-mist bg-white px-4 py-3 text-sm text-text-body outline-none"
          {...register("email")}
        />
        {errors.email && (
          <p className="text-xs text-[#D6394B]">{errors.email.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="login-password" className="text-sm font-medium text-text-body">
          Password
        </label>
        <input
          id="login-password"
          type="password"
          autoComplete="current-password"
          className="rounded-[10px] border border-mist bg-white px-4 py-3 text-sm text-text-body outline-none"
          {...register("password")}
        />
        {errors.password && (
          <p className="text-xs text-[#D6394B]">{errors.password.message}</p>
        )}
      </div>

      {error && <p className="text-sm text-[#D6394B]">{error.message}</p>}

      <button
        type="submit"
        disabled={isLoading}
        className="mt-2 rounded-full bg-signal px-6 py-3 text-sm font-semibold text-white disabled:opacity-60"
      >
        {isLoading ? "Signing in..." : "Sign In"}
      </button>
    </form>
  );
}
