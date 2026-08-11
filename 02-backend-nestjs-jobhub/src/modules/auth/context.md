# auth

## Owns
- `refresh_tokens` table (polymorphic `owner_id` + `owner_type`)

## Public API
- `AuthService`: `register`, `login`, `refresh`, `logout`

## Endpoints
- `POST /auth/register`, `/auth/login`, `/auth/refresh` — `@Public()`
- `POST /auth/logout` — guarded (`JwtAuthGuard`)

## Key decisions
- Login checks `users` table first, then `admins` — single endpoint serves both audiences per `API_SPEC.md`.
- Access token: JWT (`JwtService`, wired globally via `core/auth/jwt-core.module.ts`), payload `{ sub, type: 'user'|'admin' }`.
- Refresh token: opaque random string (not a JWT) — raw value returned to client once, only its SHA-256 hash is persisted (`refresh_tokens.token_hash`). SHA-256 (not bcrypt) is used here because the token itself is high-entropy random data, so a deterministic hash is safe and allows direct DB lookup by hash — bcrypt's salted/slow design is reserved for low-entropy user passwords (`users`/`admins` `password_hash`).
- Refresh rotation: `refresh()` always revokes the presented token and issues a new pair, even on success.
- `JwtAuthGuard` (in `shared/guards/`) is a plain auth-only guard for Phase 1 — NOT the `RolesGuard` described in `ARCHITECTURE.md`'s global middleware chain (that one also checks permissions and needs Phase 2's roles-permissions feature). Applied explicitly per-controller until Phase 2 replaces it with the real global `RolesGuard`.
