# users

## Owns
- `users` table

## Public API
- `UsersService`: `findByEmail`, `findByIdOrThrow`, `register`, `updateMe`, `updateResumeUrl`, `deactivate` — used by `auth` feature for register/login lookups.

## Endpoints
- `GET/PATCH/DELETE /users/me`, `POST /users/me/resume` — no `@Public()`/`@RequirePermission()`, so the global `RolesGuard` (Phase 2) just requires a valid token (any principal type).

## Key decisions / simplifications
- Resume upload (Phase 1) stores to local disk (`uploads/resumes/`), not real object storage — `resumeUrl` is a local path (`/uploads/resumes/<file>`), not served publicly yet. Swap for S3/GCS-backed storage before this is production-ready.
- `deactivate()` uses soft delete (`deleted_at`) via TypeORM `softDelete`, matching `DATABASE.md` conventions.
