import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-auto bg-void text-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-12 md:flex-row md:items-center md:justify-between md:px-10">
        <div className="flex items-center gap-2.5">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-signal font-display text-sm">
            &gt;
          </span>
          <span className="font-display text-lg">JobHub</span>
        </div>
        <p className="max-w-sm text-sm text-white/60">
          Your next chapter starts at the waypoint. Job listings, applications, and
          company profiles all in one place.
        </p>
        <nav className="flex gap-6 text-sm text-white/70">
          <Link href="/jobs" className="hover:text-white">
            Find Jobs
          </Link>
          <Link href="/login" className="hover:text-white">
            Sign In
          </Link>
        </nav>
      </div>
      <div className="border-t border-white/10 px-6 py-4 text-center text-xs text-white/40 md:px-10">
        &copy; {new Date().getFullYear()} JobHub. All rights reserved.
      </div>
    </footer>
  );
}
