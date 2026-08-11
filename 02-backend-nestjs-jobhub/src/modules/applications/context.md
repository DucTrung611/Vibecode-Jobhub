# applications

## Owns
- `applications` table

## Public API
- `ApplicationsService`: `apply`, `findByIdOrThrow`, `findMyApplications`, `findForJob`, `updateStatus`, `enrich`, `count` — `dashboard` calls `count()` for stats, never queries the table directly.

## Endpoints
- `POST /jobs/:id/applications`, `GET /users/me/applications` — token required, no `@RequirePermission`.
- `GET /admin/jobs/:id/applications` — `@RequirePermission('applications.read')`.
- `PATCH /admin/applications/:id/status` — `@RequirePermission('applications.review')`.

## Key decisions
- `resume_url` is snapshotted server-side from `UsersService.findByIdOrThrow(userId).resumeUrl` at apply time (never accepts a client-supplied URL, matching `DATABASE.md`'s `NOT NULL` snapshot semantics). If the user has never uploaded a resume, `apply()` throws `400 VALIDATION_001` instead of writing an empty string.
- `cover_letter` (nullable TEXT) and `reviewed_at` (nullable DATETIME) columns are **not listed** in `DATABASE.md §2`'s applications table, but are required to satisfy `API_SPEC.md §7`'s documented request/response bodies (`coverLetter` in the apply request, `reviewedAt` in the status-update response) — added as a reasonable extension of the documented schema, same spirit as `companies.createdBy` being a plain FK.
- `apply()` rejects with `409 JOBS_002` when the job isn't `published` or its `expiresAt` has passed, and `409 APPLICATIONS_002` on a duplicate `(job_id, user_id)` pair (`uq_applications_job_user`) — checked in that order.
- `job_id`/`user_id`/`reviewed_by` are plain FK columns; `ApplicationsService` injects `JobsService` + `UsersService` only, never their repositories (`PROJECT-RULES.md` §3).
