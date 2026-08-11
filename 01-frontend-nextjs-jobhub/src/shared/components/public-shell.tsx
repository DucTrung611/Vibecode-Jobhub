import type { ReactNode } from "react";
import { Footer } from "./footer";
import { Navbar } from "./navbar";

/**
 * Wraps public-facing pages (Homepage, Job Search, Job Detail, Profile) with
 * the shared navbar + footer. NOT used by `/admin/*` (own sidebar layout)
 * or `/login` (own full-bleed split layout) — see each feature's context.md.
 */
export function PublicShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
