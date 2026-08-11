# admins

## Owns
- `admins` table

## Public API
- `AdminsService`: `findByEmail`, `findByIdOrThrow`, `findAll`, `create`, `update`, `deactivate` — the first two are used by `auth` for admin login.

## Endpoints
- `GET/POST /admin/admins` (`admins.read`/`admins.create`), `PATCH/DELETE /admin/admins/:id` (`admins.update`/`admins.delete`) — gated by the global `RolesGuard` + `@RequirePermission()`.
- **No frontend UI for this** — `design_handoff_jobhub` has no "Admin Management" screen among its 10 screens, so per `CLAUDE.md` ("never invent new visual style") only the backend contract from `API_SPEC.md` is implemented.

## Key decisions
- `role_id` is a plain FK column, not a TypeORM `@ManyToOne` relation to `Role` — cross-feature entity imports are forbidden (`PROJECT-RULES.md` §3/§5). `create`/`update` validate `roleId` via `RolesPermissionsService.roleExistsOrThrow()` (a normal cross-feature *service* call, not a repository/entity import — allowed).
- Additional error code beyond `API_SPEC.md`: `ADMINS_002` (409, email already registered) — same pattern as `USERS_002`.
