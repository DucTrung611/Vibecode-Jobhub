# jobs

## Owns
- Calls to `/jobs`, `/jobs/:slug`, `/jobs/categories`, `/jobs/:id/save`, `/users/me/saved-jobs` (public + user-auth), and `/admin/jobs*` (admin CRUD + approve/reject)
- Job Search Results (#2), Job Detail (#3), Job Management (#7) screens

## Public API (via `index.ts`)
- Pages: `JobSearchPage`, `JobDetailPage`, `JobManagementPage`
- Components: `JobCard`, `JobFilterBar`, `JobForm`, `JobTable`
- Hooks: `useJobs`, `useJob`, `useSavedJobs`, `useAdminJobs`
- `jobsService`, format utils (`formatSalary`, `formatEmploymentType`, `formatDate`)
- Types: `Job`, `Category`, `EmploymentType`, `JobStatus`, `JobFilters`, `AdminJobFilters`, `CreateJobPayload`, `UpdateJobPayload`

## Key decisions
- **Numeric ID coercion**: `companyId`/`categoryId`/`approvedBy` come back as numbers already in `JobResponseDto` (backend DTO declares them `number`, unlike `Company.createdBy` which historically needed coercion) — verified against `job-response.dto.ts`; no `Number()` coercion needed in the FE `Job` type. `salaryMin`/`salaryMax` stay `string | null` (DECIMAL serialization) and are only parsed to `Number` inside `formatSalary`.
- **Keyword search is client-side only**: `GET /jobs` has no `keyword`/`q` query param in `API_SPEC.md`. `JobFilterBar` writes `keyword` to the URL like the other filters, but `jobs.service.ts#toParams` strips it before calling the API — `JobSearchPage` applies it as a local `.filter()` on the fetched page instead. Documented here so a future dev doesn't assume the backend supports it.
- **"Submit for review" is a status PATCH, not a new endpoint** — `submitForReview()` calls `updateJob(id, { status: 'pending_review' })` per `API_SPEC.md`/`update-job.dto.ts`, matching the backend's `UPDATABLE_STATUSES` restriction (only `pending_review` is settable this way; `published`/`rejected` only via approve/reject).
- **Status pill on Job Management is action buttons, not a click-to-cycle pill** — the design doc says "status pill cycles draft → open → closed on click," but the backend has three distinct guarded transitions (submit-for-review, approve, reject) each requiring a different permission and only valid from specific states, so `JobTable` renders explicit contextual action buttons (Submit for review / Approve / Reject) instead of one ambiguous click target — safer against invalid-transition 409s.
- **`JobForm`** composes `companies` as a prop (fetched in `JobManagementPage` via `companiesService` from the `companies` feature's barrel) rather than owning a companies fetch itself, to avoid `jobs` importing `companies` internals directly (only the barrel).
- **`JobDetailPage`** imports `ApplyButton` from `features/applications`'s barrel — the one sanctioned cross-feature import per `ARCHITECTURE-FRONTEND.md` §5 ("a page composing two features imports both via their index.ts barrels only").
