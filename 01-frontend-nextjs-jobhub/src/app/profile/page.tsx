"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { ProfilePage } from "@/features/applications";
import { PublicShell } from "@/shared/components/public-shell";
import { useAuth } from "@/shared/context/auth.context";

export default function Profile() {
  const { isLoggedIn, isAuthReady } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Wait for cookie hydration (isAuthReady) before redirecting — otherwise
    // this fires on every hard reload while isLoggedIn is still the default
    // `false`, even for an actually-logged-in session (see auth.context.tsx).
    if (isAuthReady && !isLoggedIn) router.replace("/login");
  }, [isAuthReady, isLoggedIn, router]);

  if (!isLoggedIn) return null;

  return (
    <PublicShell>
      <ProfilePage />
    </PublicShell>
  );
}
