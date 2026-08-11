# dashboard

## Owns
- Calls to `GET /admin/dashboard/stats`
- Admin Dashboard screen (#6) at `/admin`

## Public API (via `index.ts`)
- `DashboardPage`, `useDashboardStats`, `dashboardService`, `DashboardStats` type

## Key decisions
- Built as its own tiny feature (rather than folded into `jobs`/`applications`) since the stats endpoint spans four unrelated domains (users, companies, jobs, applications) and doesn't belong to any single one — mirrors the backend's own `modules/dashboard` module.
- **"Applications trend" bar chart intentionally omitted** — `GET /admin/dashboard/stats` returns only plain totals (`totalUsers`, `totalCompanies`, `activeJobs`, `totalApplications`), no time-series data exists on the backend for this phase. Decided out of scope upstream; only the 4 `StatCard` tiles ship.
- `StatCard` composes the shared `NotchedCard` (bg/notch styling) with a `font-mono` number per `DESIGN-SYSTEM.md` §3 (utility/data font for stat numbers).
