# PROJECT-RULES.md — Backend (Feature-based)

## Tech Stack
- Language: TypeScript
- Framework: NestJS
- ORM: TypeORM

---

## 1. Feature Structure

```
src/modules/jobs/
├── jobs.controller.ts
├── jobs.service.ts
├── jobs.repository.ts
├── dto/
│   ├── create-job.dto.ts
│   └── update-job.dto.ts
├── entities/
│   └── job.entity.ts
├── types/
│   └── jobs.types.ts
├── jobs.module.ts
├── tests/
│   └── jobs.service.spec.ts
└── context.md          # what this feature owns, its public API, key decisions
```

---

## 2. Naming Conventions

| Item | Convention | Example |
|---|---|---|
| Feature folder | kebab-case, plural | `modules/roles-permissions/` |
| Files | kebab-case + role suffix | `jobs.controller.ts`, `create-job.dto.ts` |
| Classes | PascalCase + suffix | `JobsService`, `CreateJobDto`, `JobEntity` |
| Functions/methods | camelCase, verb-first | `findActiveJobs()`, `approveJob()` |
| Variables/constants | camelCase / SCREAMING_SNAKE_CASE | `jobId`, `MAX_UPLOAD_SIZE_MB` |
| Interfaces/types | PascalCase, no `I` prefix | `JobFilter`, `PaginatedResult<T>` |
| Enums | PascalCase name, snake_case values | `enum JobStatus { Draft = 'draft' }` |

---

## 3. Feature Rules

- Each feature is self-contained: owns its controller, service, repository, entities.
- **No direct imports** between features' internal files (services, repositories, entities).
- Cross-feature communication only via:
  - **Exported providers** through the feature's `Module` (`exports: [JobsService]`)
  - **Events** for side effects (`@nestjs/event-emitter`) when the caller doesn't need a return value
  - Never inject another feature's `Repository` directly
- Shared code → `src/shared/` (`shared/guards`, `shared/decorators`, `shared/filters`, `shared/utils`, `shared/database`)

```ts
// DO — applications feature calls jobs' public service
constructor(private readonly jobsService: JobsService) {}
await this.jobsService.findById(jobId);

// DON'T — reaching into another feature's repository/entity
import { JobRepository } from '../jobs/jobs.repository'; // ❌
```

---

## 4. Code Patterns (MUST follow)

**Error handling** — throw Nest built-in exceptions in the service layer; a global filter formats the response.
```ts
if (!job) throw new NotFoundException('Job not found');
```

**Validation** — `class-validator` DTOs + global `ValidationPipe` (`whitelist: true, forbidNonWhitelisted: true`). Never validate manually in controllers.

**Logging** — inject Nest `Logger` per class, scoped to the class name.
```ts
private readonly logger = new Logger(JobsService.name);
this.logger.warn(`Job ${id} rejected by admin ${adminId}`);
```

**Response format** — every endpoint returns a consistent envelope via a global interceptor:
```json
{ "success": true, "data": { }, "meta": { "page": 1 } }
```

---

## 5. Anti-patterns (MUST NOT do)

| ❌ Don't | ✅ Do instead |
|---|---|
| `import { JobEntity } from '../jobs/entities/job.entity'` in `applications` | Depend on `JobsService` public methods only |
| Circular imports (`jobs` ↔ `applications`) | Break the cycle with events or a shared interface in `shared/` |
| Business logic in `@Controller` methods | Controller only maps HTTP → DTO → service call |
| Raw SQL / `Repository` queries inside `Service` or `Controller` | All queries live in `*.repository.ts` |
| Hardcoded config (`'mysql://localhost...'`) | `ConfigService` + `.env`, validated via `@nestjs/config` schema |

---

## 6. Git Workflow

- **Branch**: `feature/jobs-approval-flow`, `fix/applications-duplicate-apply`, `chore/update-typeorm`
- **Commit** (Conventional Commits): `feat(jobs): add approve endpoint`, `fix(auth): refresh token expiry check`
- **PR requirements**: linked issue, passing CI (lint + test + build), no cross-feature internal imports (checked by lint rule §3), at least 1 reviewer approval, `context.md` updated if public API of the feature changed

---

## 7. Testing

- **Location**: co-located `modules/<feature>/tests/`
- **Naming**: `*.service.spec.ts`, `*.controller.spec.ts`, `*.e2e-spec.ts` (e2e in root `test/`)
- **Structure**: AAA pattern — Arrange / Act / Assert, one `describe` per method
```ts
describe('JobsService.approveJob', () => {
  it('sets status to published when admin has permission', async () => { ... });
});
```
- **Coverage**: ≥ 80% for `service` and `repository` layers; controllers covered via e2e, not required to hit the same threshold

---

## NestJS-Specific Additions

- **Guards**: `RolesGuard` (in `shared/guards`) reads `@RequirePermission('jobs.approve')` decorator, checks it against `role_permissions` — applied at controller-method level, never inline in service
- **Pipes**: `ValidationPipe` global; feature-specific transforms via custom `PipeTransform` in `shared/pipes` if reused across features
- **Interceptors**: `ResponseInterceptor` (envelope), `LoggingInterceptor` — registered globally in `main.ts`, not per-module
- **Module boundaries**: every feature has one `*.module.ts`; only `exports` array is the feature's public surface — anything not exported is private to that module
- **DTO ↔ Entity**: never return TypeORM entities directly from controllers; map to a `ResponseDto` to avoid leaking DB columns (e.g. `password_hash`)
