# companies

## Owns
- Calls to `/companies` (public list, used for the admin table too — there's no separate `/admin/companies` GET endpoint per `API_SPEC.md`), `/admin/companies/*` (create/update/delete)
- Company Management screen (#8 in `design_handoff_jobhub`)

## Public API (via `index.ts`)
- `CompanyManagementPage`, `useCompanies`, `companiesService`

## Key decisions
- The prototype's table shows "Industry" and "Open Jobs" columns — neither exists in `DATABASE.md`'s `companies` schema. `CompanyTable` shows `size` (the real DB field) instead of Industry, and "Open Jobs" renders as `—` until `jobs` (Phase 4) exists to compute a real count.
- No public company browsing UI — see `02-backend-nestjs-jobhub/src/modules/companies/context.md`; companies only appear publicly via `jobs` (Homepage trending categories, Job Detail sidebar), not their own screen.
- Reuses `shared/components/initials-avatar.tsx` (new, generic — first company/user avatar per `DESIGN-SYSTEM.md` §7) rather than a company-local component, since `jobs`/`applications` will need the same avatar pattern later.

## Bug found & fixed while building this feature
- `shared/services/api-client.ts` unconditionally called `res.json()`, which throws on a `204 No Content` response body (empty string isn't valid JSON). `deleteCompany` was the first caller to actually hit a `204` from the browser (Phase 1/2 never exercised a DELETE button in the UI). Fixed generically in `api-client.ts` — any future feature's delete/204 endpoint benefits automatically, not just this one.
