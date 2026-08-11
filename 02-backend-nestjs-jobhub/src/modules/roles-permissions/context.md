# roles-permissions

## Owns
- `roles`, `permissions`, `role_permissions` tables

## Public API
- `RolesPermissionsService`: `findAllRoles`, `createRole`, `findAllPermissions`, `assignPermissions`, `roleHasPermission`, `roleExistsOrThrow`
- `roleExistsOrThrow` is used by `admins.service.ts` to validate `role_id` on admin create/update.
- `roleHasPermission` is used by `core/auth/authorization.service.ts` (not by `admins` directly — see below).

## Endpoints
- `GET/POST /admin/roles`, `PATCH /admin/roles/:id/permissions`, `GET /admin/permissions` — all guarded via `@RequirePermission()`, enforced by the global `RolesGuard` (`shared/guards/roles.guard.ts`).

## Key decisions
- **No dependency on `AdminsModule`.** Checking "does admin X have permission Y" needs both this feature's role→permission data AND the admin's `role_id` (owned by `admins`). Rather than importing `AdminsModule` here (which would create a cycle, since `AdminsModule` already imports this module to validate `role_id`), that composition lives in `core/auth/authorization.service.ts` — it injects both `AdminsService` and `RolesPermissionsService`. `core/auth` is infra the whole app depends on, not a peer feature, so it's allowed to know about two features without violating the "no feature imports another feature's internals" rule (`PROJECT-RULES.md` §3).
- **Permission naming**: `permissions.name` is unique per row, one row per `API_SPEC.md` §6 Admin-auth endpoint (18 total, seeded even for features not built yet — see migration `*-seed-permissions.ts`). Endpoints that share an "Auth" label in the spec table but are different routes (`POST /admin/jobs/:id/approve` and `.../reject`, both labelled `jobs.approve` in the doc) get **distinct** permission names (`jobs.approve`, `jobs.reject`) since the schema's `uq_permissions_name` forbids duplicates — reading "1:1 to a permissions row (method + route)" literally.
- `super_admin` (seeded Phase 1) is granted all 18 permissions via `*-grant-super-admin-all-permissions.ts` so the existing seed admin doesn't lose access when RBAC goes live.
- Additional error code beyond `API_SPEC.md`: `RP_002` (409, role name already exists) — same pattern as `USERS_002`/`COMPANIES_002`.

## Gotcha worth knowing for future features
- mysql2 returns `BIGINT` columns as JS **strings** at runtime (TS still types them `number` — TypeORM doesn't lie about the SQL type, but doesn't narrow the runtime type either). Two places this bit us here:
  1. `RolePermissionsRepository.findPermissionNamesForRoleIds` originally keyed a `Map<number, ...>` by a value that was actually a string at runtime — lookups silently never matched. Fixed by keying with `String(roleId)` explicitly (see the repository's docstring).
  2. `AssignPermissionsDto.permissionIds` — the frontend round-trips permission ids it got from a previous GET (strings) back into this PATCH body; `@IsInt()` rejected them. Fixed with a `@Transform(({value}) => value.map(Number))` on the DTO field.
  Any new endpoint accepting an array of ids coming from a prior API response (not a URL param, which `ParseIntPipe` already normalizes) should do the same defensive `@Transform`.
