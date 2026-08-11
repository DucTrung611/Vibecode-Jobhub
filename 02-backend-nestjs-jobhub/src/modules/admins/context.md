# admins

## Owns
- `admins` table

## Public API (Phase 1)
- `AdminsService`: `findByEmail`, `findByIdOrThrow` — used by `auth` feature for admin login.

## Not yet owned (Phase 2, needs RolesGuard)
- `admins.controller.ts` — `/admin/admins` list/create/update/delete endpoints (`admins.read/create/update/delete` permissions)

## Key decisions
- `role_id` is a plain FK column, not a TypeORM `@ManyToOne` relation to `Role` — cross-feature entity imports are forbidden (`PROJECT-RULES.md` §3/§5). Resolve role details via a future `RolesPermissionsService` call, not a join.
