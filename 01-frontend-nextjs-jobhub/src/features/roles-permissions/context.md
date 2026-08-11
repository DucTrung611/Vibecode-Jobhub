# roles-permissions

## Owns
- Calls to `/admin/roles`, `/admin/permissions` (`services/roles-permissions.service.ts`)
- Roles & Permissions screen (#9 in `design_handoff_jobhub`) — role list (left) + permission grid (right)

## Public API (via `index.ts`)
- `RolesPermissionsPage`, `useRoles`, `usePermissions`, `rolesPermissionsService`

## Key decisions
- The prototype's permission grid is a **hardcoded** 4x4 matrix (Users/Jobs/Companies/Applications × View/Create/Edit/Delete) with mock data. Real permissions come from the backend as endpoint-shaped names (`jobs.approve`, `jobs.reject`, `admins.delete`, ...) that don't map cleanly to 4 uniform actions. `PermissionGrid` groups the real permissions returned by `GET /admin/permissions` by their `module.` prefix instead, rendering one card per module with a checkbox per real permission — same visual language (card, checkbox, pill) as the design, but data-driven instead of a fixed matrix.
- `selectedRoleId` in `roles-permissions.page.tsx` is derived (`explicitRoleId ?? roles[0]?.id ?? null`) rather than synced via a `useEffect` + `setState` — avoids an unnecessary render/effect for what's really just a fallback default.
- No admin-management UI — see `02-backend-nestjs-jobhub/src/modules/admins/context.md`.
