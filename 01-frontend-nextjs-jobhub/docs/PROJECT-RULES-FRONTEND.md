# PROJECT-RULES.md — Frontend (Feature-based)

## Tech Stack
- Framework: Next.js (App Router) + TypeScript
- State management: React Context (+ local `useState`/`useReducer`)
- Styling: Tailwind CSS
- HTTP client: native `fetch`

---

## 1. Feature Structure

```
features/jobs/
├── components/
│   ├── job-card.tsx
│   └── job-filter-bar.tsx
├── hooks/
│   ├── use-jobs.ts          # fetch + local state wrapper
│   └── use-job-filters.ts
├── services/
│   └── jobs.service.ts      # fetch calls only
├── context/
│   └── job-filters.context.tsx  # only if state must span multiple components in the feature
├── types/
│   └── job.types.ts
├── utils/
│   └── format-salary.ts
├── index.ts                 # public barrel export
└── context.md
```

---

## 2. Naming Conventions

| Item | Convention | Example |
|---|---|---|
| Feature folder | kebab-case, plural | `features/roles-permissions/` |
| Components | PascalCase file & export | `JobCard.tsx` → `export function JobCard()` |
| Hooks | camelCase, `use` prefix | `useJobs.ts`, `useApplyToJob.ts` |
| Services | camelCase + `.service.ts` | `jobs.service.ts` |
| Context | PascalCase + `Context`/`Provider` | `JobFiltersContext`, `JobFiltersProvider` |
| Types | PascalCase, no `I` prefix | `Job`, `JobFilters`, `CreateJobPayload` |

---

## 3. Feature Rules

- Self-contained: a feature owns its components, hooks, services, types, context.
- **Export only through `index.ts`** — anything not re-exported there is private to the feature.
- **No direct imports** of another feature's internal files (`features/jobs/components/...` from `features/applications/`).
- Cross-feature communication via:
  - **Global Context** (`shared/context/`) — only for truly cross-cutting state (auth user/session, current role); not a dumping ground for feature state
  - **Events**: browser `CustomEvent` or a small event-emitter util in `shared/` for decoupled side effects
  - **URL params/route state** — preferred over Context for filters, pagination, tab selection
- Shared components → `shared/components/` (e.g. `Button`, `Modal`, `Pagination`) — generic, no feature-specific logic

```ts
// DO
import { JobCard } from '@/features/jobs';        // via barrel

// DON'T
import { JobCard } from '@/features/jobs/components/job-card'; // ❌ bypasses barrel
```

---

## 4. Component Rules

- One component per file, file name matches export name
- Co-locate: component + its own hook (if single-use) + test in the same feature folder; Tailwind classes live in the component, no separate global stylesheet per component
- Props always typed via an explicit `interface`/`type`, never inferred from usage
- Max **~150 lines** per component — extract sub-components or a hook when exceeded

```tsx
// DO
interface JobCardProps {
  job: Job;
  onSave?: (jobId: number) => void;
}
export function JobCard({ job, onSave }: JobCardProps) { ... }

// DON'T
export function JobCard(props: any) { ... } // ❌ untyped
```

---

## 5. Code Patterns (MUST follow)

- **API calls**: only inside `services/*.service.ts`, using a shared `fetch` wrapper (`shared/lib/api-client.ts`) that sets base URL, `Authorization` header, and normalizes error responses — never call `fetch` directly in a component
- **State**: local `useState`/`useReducer` first; lift to a feature-local Context only if shared across 2+ components in the feature; global Context (`shared/context/`) only if shared across features
- **Error handling**: route-level `error.tsx` boundary (Next.js App Router) for unexpected errors + toast notifications (`shared/lib/toast.ts`) for expected/handled errors (e.g. failed mutation)
- **Loading states**: skeleton components for initial page/list loads, inline spinner for button/mutation-in-flight states; each `use-*.ts` data hook exposes `{ data, isLoading, error }`
- **Forms**: `react-hook-form` + `zod` schema per form, colocated in the feature (`features/jobs/utils/job-form.schema.ts`)

```ts
// services/jobs.service.ts
export async function fetchJobs(filters: JobFilters): Promise<Job[]> {
  const res = await apiClient.get<Job[]>('/jobs', { params: filters });
  return res.data;
}

// hooks/use-jobs.ts
export function useJobs(filters: JobFilters) {
  const [data, setData] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  useEffect(() => {
    setIsLoading(true);
    fetchJobs(filters)
      .then(setData)
      .catch(setError)
      .finally(() => setIsLoading(false));
  }, [JSON.stringify(filters)]);

  return { data, isLoading, error };
}
```

---

## 6. Anti-patterns (MUST NOT do)

| ❌ Don't | ✅ Do instead |
|---|---|
| `import { jobsService } from '../jobs/services/jobs.service'` from `applications` | Depend on data via props/route or call your own feature's service |
| `fetch(...)` directly inside a component's `useEffect` | Use a `useJobs()` hook backed by `services/jobs.service.ts` |
| Validation/business logic inside a component body | Move to `utils/` or the Zod schema |
| Prop drilling through 3+ levels | Use composition (`children`) or a feature-local Context |
| `any` type on props, API responses, or Context value | Define explicit types in `types/`, derive from shared API types |
| Inline `style={{ color: 'red' }}` | Tailwind utility classes; arbitrary values (`text-[#ff0000]`) only when no token fits |
| One Context re-rendering the whole app on every change | Split Context by concern (auth vs. feature filters), memoize provider value |

---

## 7. Git Workflow

- **Branch**: `feature/jobs-listing-page`, `fix/applications-form-validation`
- **Commit** (Conventional Commits): `feat(jobs): add job filter bar`, `fix(auth): persist token on refresh`
- **PR scope**: one feature folder per PR where possible; no PR touches internal files of two unrelated features without a documented reason in the description

---

## 8. Testing

- **Location**: co-located `features/<feature>/components/*.test.tsx`, `hooks/*.test.ts`
- **What to test**: component render + user interaction (React Testing Library), hook logic (mocked `services/*.service.ts`), Zod schema validation — not implementation details or Tailwind classes
- **Coverage focus**: hooks and utils (pure logic) prioritized over components; critical flows (apply to job, admin approve job) need at least one integration test per flow

---

## Next.js-Specific Additions

- **Routing**: App Router — `app/` contains only route files (`page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`) that import from `features/*`; no business logic lives in `app/`
- **Server vs Client Components**: default to Server Components for data-fetching pages (`page.tsx` calls the feature's service directly, server-side, via native `fetch` with Next.js caching options — `cache`/`next: { revalidate }`); mark interactive pieces `'use client'` at the leaf level, not the whole page
- **Data fetching**: Server Components fetch server-side using the same `services/*.service.ts` functions (they run fine in both environments since they're plain `fetch` calls); Client Components use the feature's `use-*.ts` hook — never fetch the same resource both ways on one page
- **Context placement**: feature-local Context providers wrap only the route segment that needs them (e.g. in that feature's `layout.tsx`); global providers (auth/session) wrap the root `app/layout.tsx` only
- **Tailwind**: shared design tokens in `tailwind.config.ts`; no ad-hoc color/spacing values in feature components — extend the theme instead
