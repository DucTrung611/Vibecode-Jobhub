"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRegister } from "../hooks/use-register";
import { registerSchema, type RegisterFormValues } from "../utils/auth-form.schema";

interface RegisterFormProps {
  onSuccess?: () => void;
}

export function RegisterForm({ onSuccess }: RegisterFormProps) {
  const { submit, isLoading, error } = useRegister();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({ resolver: zodResolver(registerSchema) });

  async function onSubmit(values: RegisterFormValues) {
    const ok = await submit(values);
    if (ok) onSuccess?.();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="register-full-name" className="text-sm font-medium text-text-body">
          Full name
        </label>
        <input
          id="register-full-name"
          type="text"
          autoComplete="name"
          className="rounded-[10px] border border-mist bg-white px-4 py-3 text-sm text-text-body outline-none"
          {...register("fullName")}
        />
        {errors.fullName && (
          <p className="text-xs text-[#D6394B]">{errors.fullName.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="register-email" className="text-sm font-medium text-text-body">
          Email
        </label>
        <input
          id="register-email"
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
        <label htmlFor="register-password" className="text-sm font-medium text-text-body">
          Password
        </label>
        <input
          id="register-password"
          type="password"
          autoComplete="new-password"
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
        {isLoading ? "Creating account..." : "Register"}
      </button>
    </form>
  );
}
