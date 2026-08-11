"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/shared/context/auth.context";
import { InitialsAvatar } from "./initials-avatar";

export function Navbar() {
  const { isLoggedIn, isAdminAccount, user, clearSession } = useAuth();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  function handleSignOut() {
    clearSession();
    setMenuOpen(false);
    router.push("/");
  }

  return (
    <header className="sticky top-0 z-40 border-b border-hairline bg-void text-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 md:px-10">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-signal font-display text-sm">
            &gt;
          </span>
          <span className="font-display text-lg">JobHub</span>
        </Link>

        <nav className="hidden items-center gap-2 rounded-full bg-white/10 p-1 md:flex">
          <Link href="/" className="rounded-full px-4 py-2 text-sm font-medium hover:bg-white/10">
            Home
          </Link>
          <Link href="/jobs" className="rounded-full px-4 py-2 text-sm font-medium hover:bg-white/10">
            Find Jobs
          </Link>
        </nav>

        {isLoggedIn && user ? (
          <div className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              className="flex items-center gap-2 rounded-full bg-white/10 py-1 pl-1 pr-3"
            >
              <InitialsAvatar name={user.fullName} size={32} />
              <span className="hidden text-sm font-medium sm:inline">{user.fullName}</span>
            </button>
            {menuOpen && (
              <>
                <button
                  type="button"
                  aria-label="Close menu"
                  className="fixed inset-0 z-40 cursor-default"
                  onClick={() => setMenuOpen(false)}
                />
                <div className="absolute right-0 z-50 mt-2 w-56 rounded-[14px] border border-hairline bg-white p-2 text-text-body shadow-[0_30px_60px_-20px_rgba(0,0,0,0.4)]">
                  <Link
                    href="/profile"
                    onClick={() => setMenuOpen(false)}
                    className="block rounded-[10px] px-3 py-2 text-sm font-medium hover:bg-paper"
                  >
                    My Applications &amp; Saved Jobs
                  </Link>
                  {isAdminAccount && (
                    <Link
                      href="/admin"
                      onClick={() => setMenuOpen(false)}
                      className="block rounded-[10px] px-3 py-2 text-sm font-medium hover:bg-paper"
                    >
                      Admin view
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="block w-full rounded-[10px] px-3 py-2 text-left text-sm font-medium text-[#D6394B] hover:bg-paper"
                  >
                    Sign out
                  </button>
                </div>
              </>
            )}
          </div>
        ) : (
          <Link
            href="/login"
            className="rounded-full bg-signal px-5 py-2.5 text-sm font-semibold text-white"
          >
            Sign In
          </Link>
        )}
      </div>
    </header>
  );
}
