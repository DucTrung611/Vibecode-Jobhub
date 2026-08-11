"use client";

import { StatCard } from "../components/stat-card";
import { useDashboardStats } from "../hooks/use-dashboard-stats";

/**
 * The "Applications trend" bar chart from the prototype is intentionally
 * skipped — no time-series endpoint exists (`GET /admin/dashboard/stats`
 * returns plain totals only), decided out of scope upstream.
 */
export function DashboardPage() {
  const { data, isLoading, error } = useDashboardStats();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-2xl text-void">Admin Dashboard</h1>
      {isLoading && <p className="text-text-secondary">Loading stats...</p>}
      {error && <p className="text-[#D6394B]">Failed to load stats: {error.message}</p>}
      {data && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total Users" value={data.totalUsers} />
          <StatCard label="Companies" value={data.totalCompanies} />
          <StatCard label="Active Jobs" value={data.activeJobs} />
          <StatCard label="Applications" value={data.totalApplications} />
        </div>
      )}
    </div>
  );
}
