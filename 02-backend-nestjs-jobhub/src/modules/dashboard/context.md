# dashboard

## Owns
- No table — read-only aggregation over `users`, `companies`, `jobs`, `applications` via their exported services.

## Endpoints
- `GET /admin/dashboard/stats` — any valid admin token, no `@RequirePermission` (same pattern as `/users/me` needing "any signed-in principal", not a specific permission).

## Key decisions
- Not in `API_SPEC.md` — added for admin Dashboard screen (#6)'s 4 stat cards (Total Users, Companies, Active Jobs, Applications). "Applications trend" chart is out of scope (needs time-series data, no endpoint/UI built).
- `activeJobs` counts `status = 'published'` via `JobsService.countActive()`. Counts are fetched in parallel via each feature's public service (`UsersService.count`, `CompaniesService.count`, `JobsService.countActive`, `ApplicationsService.count`) — no repository is touched directly, matching `PROJECT-RULES.md` §3.
