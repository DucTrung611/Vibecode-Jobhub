# applications

## Owns
- Calls to `/jobs/:id/applications`, `/users/me/applications`, `/admin/jobs/:id/applications`, `/admin/applications/:id/status`
- Applications Review screen (#10), and a reduced Profile area at `/profile` (see below)

## Public API (via `index.ts`)
- Pages: `ApplicationsReviewPage`, `ProfilePage`
- Components: `ApplyButton`, `ApplicationStatusBadge`
- Hooks: `useMyApplications`, `useJobApplications`, `useApply`
- `applicationsService`
- Types: `Application`, `ApplicationStatus`, `ApplyPayload`

## Key decisions
- **Profile modal → Profile page, reduced scope (explicit upstream decision, not a gap I hit and improvised around)**: `DESIGN-SYSTEM.md` §5 lists screen #5 "User Profile" as a modal with Personal Info/CV tabs, opened from the navbar avatar. Per the task brief this phase, that's explicitly out of scope — only a minimal `/profile` **page** (not modal) ships, with exactly two sections: "My Applications" (job title + `ApplicationStatusBadge` + applied date) and "Saved Jobs" (reuses `features/jobs`'s `JobCard` + `useSavedJobs`). No Personal Info form, no resume upload UI here (upload already exists at `/users/me/resume` from Phase 1, unchanged). Navbar links to it as "My Applications & Saved Jobs" instead of "My Profile" to set the right expectation.
- **`ApplyButton` surfaces both documented failure modes inline**, not via toast/crash: `VALIDATION_001` ("Upload a resume before applying to a job" from the backend) renders as "Upload a resume in your profile before applying to a job"; `APPLICATIONS_002` (409, duplicate apply) renders as "You've already applied to this job." Both checked via `ApiError.code` off the `useApply` hook's `error`, matching `ARCHITECTURE-FRONTEND.md` §8's example.
- **`ApplicationsReviewPage`** fetches the admin job list itself (via `jobsService` from `features/jobs`'s barrel) purely to populate the job-picker dropdown required by screen #10 — no separate "list all applications" endpoint exists, applications are always scoped to a job (`GET /admin/jobs/:id/applications`), so a job must be selected first.
- Status-update buttons in `ApplicationsReviewTable` call `PATCH /admin/applications/:id/status` immediately and refetch — no page reload, no optimistic local-only mutation, per `DESIGN-SYSTEM.md` §6.
