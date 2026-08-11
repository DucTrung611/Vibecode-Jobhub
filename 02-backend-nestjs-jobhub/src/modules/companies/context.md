# companies

## Owns
- `companies` table

## Public API
- `CompaniesService`: `findAll`, `findBySlugOrThrow`, `findByIdOrThrow`, `create`, `update`, `deactivate` — `jobs` (Phase 4) will call this for company lookups when rendering job listings/detail, not query the table directly.

## Endpoints
- `GET /companies`, `GET /companies/:slug` — `@Public()`.
- `POST/PATCH/DELETE /admin/companies*` — `@RequirePermission('companies.create'|'update'|'delete')`, permissions already seeded in Phase 2's `*-seed-permissions.ts`, no new migration needed for RBAC.

## Key decisions
- Slug is auto-generated from `name` via `shared/utils/slugify.util.ts` at creation and **never changes** on update (`UpdateCompanyDto` has no `slug` field) — keeps company URLs stable.
- `created_by` is a plain FK column (not a TypeORM relation) to `admins.id`, same pattern as `admins.roleId` — cross-feature entity imports are forbidden.
- No frontend UI for public company browsing yet — `design_handoff_jobhub`'s 10 screens don't include a standalone company profile page; companies only appear publicly via Job Detail's sidebar and Homepage trending categories, both owned by `jobs` (Phase 4). Only the admin Company Management screen (#8) is built now.
