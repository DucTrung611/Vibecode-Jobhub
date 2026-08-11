"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { JobCard, jobsService, type Category, type Job } from "@/features/jobs";
import { PublicShell } from "@/shared/components/public-shell";

const CATEGORY_TILE_STYLES = [
  "bg-void text-white",
  "bg-meridian text-white",
  "bg-momentum text-void",
];

export default function Home() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    jobsService
      .getJobs({ limit: 3 })
      .then((res) => setJobs(res.data))
      .catch(() => setJobs([]));
    jobsService
      .getCategories()
      .then((cats) => setCategories(cats.slice(0, 4)))
      .catch(() => setCategories([]));
  }, []);

  return (
    <PublicShell>
      <section className="bg-void px-6 py-24 text-white md:px-10">
        <div className="mx-auto flex max-w-4xl flex-col items-start gap-6">
          <h1 className="font-display text-4xl leading-tight md:text-5xl">
            Your next chapter starts at the waypoint.
          </h1>
          <p className="max-w-lg text-text-secondary text-white/70">
            Browse curated openings from companies that are hiring now, save the
            ones you like, and apply in a click.
          </p>
          <Link
            href="/jobs"
            className="rounded-full bg-signal px-6 py-3 text-sm font-semibold text-white"
          >
            Browse jobs
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16 md:px-10">
        <h2 className="mb-6 font-display text-2xl text-void">Featured openings</h2>
        {jobs.length === 0 ? (
          <p className="text-text-secondary">No published jobs yet — check back soon.</p>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        )}
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-20 md:px-10">
        <h2 className="mb-6 font-display text-2xl text-void">Trending categories</h2>
        {categories.length === 0 ? (
          <p className="text-text-secondary">No categories yet.</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((cat, i) => (
              <Link
                key={cat.id}
                href={`/jobs?categoryId=${cat.id}`}
                className={`rounded-[14px] p-6 transition hover:opacity-90 ${
                  CATEGORY_TILE_STYLES[i % CATEGORY_TILE_STYLES.length]
                }`}
              >
                <p className="font-display text-lg">{cat.name}</p>
                <p className="font-mono text-sm opacity-70">{cat.jobCount} open roles</p>
              </Link>
            ))}
          </div>
        )}
      </section>
    </PublicShell>
  );
}
