# roles-permissions

## Owns
- `roles` table (Phase 1 — minimal, just enough to satisfy `admins.role_id` FK)

## Not yet owned (Phase 2)
- `permissions`, `role_permissions` tables
- `RolesGuard`, `@RequirePermission` decorator wiring
- `/admin/roles`, `/admin/permissions` endpoints

## Public API
- `TypeOrmModule.forFeature([Role])` re-exported so `AdminsModule` can resolve `role_id` FK when creating/reading admins.

## Key decisions
- Phase 1 seeds a single default role `super_admin` (see migration `*-seed-default-role.ts`) so the first admin account can be created before the full RBAC feature exists.
