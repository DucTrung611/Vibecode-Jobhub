"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/shared/context/auth.context";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/admin" },
  { label: "Jobs", href: "/admin/jobs" },
  { label: "Companies", href: "/admin/companies" },
  { label: "Roles & Permissions", href: "/admin/roles" },
  { label: "Applications", href: "/admin/applications" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isLoggedIn, isAdminAccount } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoggedIn && !isAdminAccount) {
      router.replace("/login");
    }
  }, [isLoggedIn, isAdminAccount, router]);

  if (!isAdminAccount) return null;

  return (
    <div className="grid min-h-screen grid-cols-1 md:grid-cols-[240px_1fr]">
      <aside className="flex flex-col gap-1 bg-void px-4 py-8 text-white">
        <span className="mb-6 px-3 font-display text-lg">JobHub Admin</span>
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-full px-4 py-2.5 text-sm font-medium text-white/80 hover:bg-white/10 aria-[current=page]:bg-signal aria-[current=page]:text-white"
          >
            {item.label}
          </Link>
        ))}
        <Link
          href="/"
          className="mt-6 px-4 py-2.5 text-sm font-medium text-text-secondary"
        >
          ← Back to job seeker view
        </Link>
      </aside>
      <main className="bg-paper p-8">{children}</main>
    </div>
  );
}
