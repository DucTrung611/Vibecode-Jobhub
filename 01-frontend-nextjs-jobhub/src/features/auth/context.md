# auth

## Owns
- Calls to `/auth/register`, `/auth/login`, `/auth/refresh`, `/auth/logout` (`services/auth.service.ts`)
- Login/register forms and the split-screen auth page (screen #4 in `design_handoff_jobhub`)

## Public API (via `index.ts`)
- `LoginPage`, `LoginForm`, `RegisterForm`, `useLogin`, `useRegister`, `authService`

## Key decisions
- Session **state** (cookies, `isLoggedIn`/`isAdminAccount`/`user`) lives in `shared/context/auth.context.tsx`, not here — `shared` must stay feature-agnostic, so this feature only calls the API and hands the result to `useAuth().setSession()`. The context never calls the API itself.
- `AuthResponseDto` from the backend doesn't include an explicit `type` field on `user`; the account type (`user`/`admin`) is read by decoding the JWT payload client-side (`shared/utils/jwt.util.ts`) right after login/register — display-only, not used for authorization (the backend re-validates on every request).
- One route (`/login?tab=register`) hosts both Sign In and Register via a tab switcher, matching `design_handoff_jobhub/README.md` §4 ("tab-switched at one route").
