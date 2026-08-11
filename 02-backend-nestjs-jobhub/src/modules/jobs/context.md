# jobs

## Owns
- `categories`, `jobs`, `saved_jobs` tables

## Public API
- `JobsService`: `findPublished`, `findAllForAdmin`, `findBySlugOrThrow`, `findByIdOrThrow`, `create`, `update`, `approve`, `reject`, `deactivate`, `saveForUser`, `unsaveForUser`, `findSavedByUser`, `findCategoriesWithCounts`, `findLatestPublished`, `countActive`, `enrich` — `applications` (Phase 5) and `dashboard` call this, never query the table directly.

## Endpoints
- `GET /jobs`, `GET /jobs/:slug`, `GET /jobs/categories` — `@Public()`, published-only.
- `POST/DELETE /jobs/:id/save`, `GET /users/me/saved-jobs` — token required, no `@RequirePermission`.
- `GET/POST/PATCH/DELETE /admin/jobs*`, `POST /admin/jobs/:id/approve|reject` — `@RequirePermission('jobs.read'|'create'|'update'|'approve'|'delete')`.

## Key decisions
- `GET /admin/jobs` + `jobs.read` permission are **not in API_SPEC.md** — added because admin Job Management (#7) needs to list jobs of every status, while public `GET /jobs` only returns `published`. Seeded in `seed-jobs-permission` migration, granted to `super_admin`, following the same pattern as `admins.read`/`roles.read`.
- No dedicated "submit for review" route: `PATCH /admin/jobs/:id` accepts an optional `status: 'pending_review'` field; the service only allows that transition from `draft`. `published`/`rejected` are set exclusively by `approve()`/`reject()`, and only from `pending_review` (else `409 JOBS_002`). `closed` is out of scope this phase.
- `categories` has no CRUD endpoints — seeded once via `seed-categories` migration (6 fixed rows), same pattern as `permissions` seeding in Phase 2.
- `company_id`/`category_id`/`approved_by` are plain FK columns (no `@ManyToOne`) — cross-feature entity imports are forbidden. `JobsService.enrich()` calls `CompaniesService.findByIdOrThrow` (own module's `CategoriesRepository` for category, since categories belong to this feature) to fill `companyName`/`companyLogoUrl`/`categoryName` on `JobResponseDto`, mirroring `AdminsService` → `RolesPermissionsService`.
- Job slugs auto-generate from `title` at creation via `slugify()` with a numeric-suffix collision fallback (`-2`, `-3`, ...); slug never changes on update.
- `salaryMin`/`salaryMax` are stored/returned as strings (TypeORM `decimal` columns serialize as strings) to avoid float-precision loss.
