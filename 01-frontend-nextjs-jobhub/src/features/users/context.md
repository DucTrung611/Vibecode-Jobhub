# users

## Owns
- Calls to `/users/me` (GET/PATCH/DELETE), `/users/me/resume` (`services/users.service.ts`)

## Public API (via `index.ts`)
- `useCurrentUser`, `usersService`

## Key decisions
- Phase 1 only ships the hook — no Profile modal UI yet (screen #5), that lands with the applications/saved-jobs work later in the roadmap. `useCurrentUser` exists now so `AuthContext` consumers (e.g. a future navbar) can fetch fresh profile data beyond what's cached in the session cookie.
