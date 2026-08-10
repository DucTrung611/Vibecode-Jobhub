# API_SPEC.md — JobHub

> REST API for the JobHub NestJS monolith. Endpoints are grouped by feature per `ARCHITECTURE.md`; entity fields reference `DATABASE.md`.

## 1. Overview

- **Base URL**: `https://api.jobhub.com/api/v1` (local: `http://localhost:3000/api/v1`)
- **Versioning**: URI-based, `/api/v{n}`, set via Nest global prefix + `VersioningType.URI`. Breaking changes ship as `/api/v2`; non-breaking additions stay in `v1`.
- **Content-Type**: `application/json` for all requests/responses, except file uploads (`multipart/form-data`)

---

## 2. Authentication

- **Method**: JWT (access + refresh), `Bearer` scheme. Two separate token audiences: `user` and `admin` (matches separate `users`/`admins` tables in `DATABASE.md`).
- **Header**: `Authorization: Bearer <access_token>`
- **Token flow**:
  1. `POST /auth/login` → `access_token` (15 min TTL) + `refresh_token` (7 days TTL, stored hashed in `refresh_tokens` table)
  2. Client sends `access_token` on every request
  3. On `401 TOKEN_EXPIRED` → `POST /auth/refresh` with `refresh_token` → new token pair (rotation: old refresh token is revoked)
  4. `POST /auth/logout` → revokes the refresh token (`revoked_at` set)
- **Auth error handling**: missing/invalid/expired token → `401` with `error.code` from `AUTH_` range (see §5); insufficient permission (RBAC) → `403 AUTH_003`

---

## 3. Request Conventions

**Pagination** (query params, applied to all list endpoints):
```
GET /jobs?page=1&limit=20
```
| Param | Default | Notes |
|---|---|---|
| `page` | 1 | 1-indexed |
| `limit` | 20 | max 100 |

**Sorting**:
```
GET /jobs?sort=created_at:desc
```
Format: `<field>:<asc|desc>`, multiple via comma (`sort=status:asc,created_at:desc`)

**Filtering**: plain query params matched to whitelisted fields per endpoint
```
GET /jobs?status=published&category_id=3&employment_type=full_time
```

**Request body**: JSON, validated via DTO (`class-validator`); unknown fields rejected (`whitelist: true`)

**File upload**: `multipart/form-data`, field name documented per endpoint, e.g.:
```
POST /users/me/resume
Content-Type: multipart/form-data
file: <binary>
```
Accepted: PDF/DOC/DOCX, max 5MB — validated in a shared `FileValidationPipe`, stored to object storage, URL saved to `resume_url`.

---

## 4. Response Format

**Success**:
```json
{
  "success": true,
  "data": { "id": 12, "title": "Backend Engineer" },
  "meta": { "page": 1, "limit": 20, "total": 57 }
}
```
`meta` present only on paginated list endpoints; omitted on single-resource responses.

**Error**:
```json
{
  "success": false,
  "error": {
    "code": "JOBS_002",
    "message": "Job not found",
    "details": null
  }
}
```
`details` carries field-level validation errors when applicable:
```json
"details": [{ "field": "salaryMin", "message": "must not be less than 0" }]
```

Both shapes are produced globally by `ResponseInterceptor` (success) and `HttpExceptionFilter` (error) — no feature manually builds this envelope.

---

## 5. Error Codes

**Format**: `[FEATURE]_[NUMBER]`, feature prefix matches the module name (`AUTH`, `USERS`, `ADMINS`, `RP` for roles-permissions, `COMPANIES`, `JOBS`, `APPLICATIONS`). `000` reserved per feature for "generic/unexpected".

**Common codes**:
| Code | HTTP | Meaning |
|---|---|---|
| `AUTH_001` | 401 | Invalid credentials |
| `AUTH_002` | 401 | Token expired |
| `AUTH_003` | 403 | Permission denied (RBAC) |
| `VALIDATION_001` | 400 | Request body/query validation failed |
| `USERS_001` | 404 | User not found |
| `USERS_002` | 409 | Email already registered |
| `ADMINS_001` | 404 | Admin not found |
| `RP_001` | 404 | Role or permission not found |
| `COMPANIES_001` | 404 | Company not found |
| `COMPANIES_002` | 409 | Slug already exists |
| `JOBS_001` | 404 | Job not found |
| `JOBS_002` | 409 | Job not in a valid state for this action |
| `APPLICATIONS_001` | 404 | Application not found |
| `APPLICATIONS_002` | 409 | Already applied to this job |
| `*_000` | 500 | Unexpected server error |

**HTTP status usage**: `200` (GET/PATCH success), `201` (POST created), `204` (DELETE success, no body), `400` (validation), `401` (auth), `403` (RBAC), `404` (not found), `409` (conflict/state), `500` (unhandled)

---

## 6. Endpoints by Feature

### auth
| Method | Path | Description | Auth |
|---|---|---|---|
| POST | `/auth/register` | Register new user | Public |
| POST | `/auth/login` | User/admin login | Public |
| POST | `/auth/refresh` | Refresh token pair | Public (valid refresh token) |
| POST | `/auth/logout` | Revoke refresh token | User/Admin |

### users
| Method | Path | Description | Auth |
|---|---|---|---|
| GET | `/users/me` | Current user profile | User |
| PATCH | `/users/me` | Update profile | User |
| POST | `/users/me/resume` | Upload resume | User |
| DELETE | `/users/me` | Deactivate account | User |

### admins
| Method | Path | Description | Auth |
|---|---|---|---|
| GET | `/admin/admins` | List admins | Admin (`admins.read`) |
| POST | `/admin/admins` | Create admin | Admin (`admins.create`) |
| PATCH | `/admin/admins/:id` | Update admin (incl. role) | Admin (`admins.update`) |
| DELETE | `/admin/admins/:id` | Deactivate admin | Admin (`admins.delete`) |

### roles-permissions
| Method | Path | Description | Auth |
|---|---|---|---|
| GET | `/admin/roles` | List roles | Admin (`roles.read`) |
| POST | `/admin/roles` | Create role | Admin (`roles.create`) |
| PATCH | `/admin/roles/:id/permissions` | Assign/replace permissions for role | Admin (`roles.update`) |
| GET | `/admin/permissions` | List all permissions | Admin (`permissions.read`) |

### companies
| Method | Path | Description | Auth |
|---|---|---|---|
| GET | `/companies` | List companies (public directory) | Public |
| GET | `/companies/:slug` | Company detail | Public |
| POST | `/admin/companies` | Create company | Admin (`companies.create`) |
| PATCH | `/admin/companies/:id` | Update company | Admin (`companies.update`) |
| DELETE | `/admin/companies/:id` | Soft-delete company | Admin (`companies.delete`) |

### jobs
| Method | Path | Description | Auth |
|---|---|---|---|
| GET | `/jobs` | List published jobs (filter/sort/paginate) | Public |
| GET | `/jobs/:slug` | Job detail | Public |
| POST | `/admin/jobs` | Create job (draft) | Admin (`jobs.create`) |
| PATCH | `/admin/jobs/:id` | Update job | Admin (`jobs.update`) |
| POST | `/admin/jobs/:id/approve` | Approve & publish job | Admin (`jobs.approve`) |
| POST | `/admin/jobs/:id/reject` | Reject job | Admin (`jobs.approve`) |
| DELETE | `/admin/jobs/:id` | Soft-delete job | Admin (`jobs.delete`) |
| POST | `/jobs/:id/save` | Save job to bookmarks | User |
| DELETE | `/jobs/:id/save` | Remove saved job | User |
| GET | `/users/me/saved-jobs` | List current user's saved jobs | User |

### applications
| Method | Path | Description | Auth |
|---|---|---|---|
| POST | `/jobs/:id/applications` | Apply to a job | User |
| GET | `/users/me/applications` | List current user's applications | User |
| GET | `/admin/jobs/:id/applications` | List applications for a job | Admin (`applications.read`) |
| PATCH | `/admin/applications/:id/status` | Update application status | Admin (`applications.review`) |

---

## 7. Endpoint Details (complex endpoints)

### `POST /auth/login`
**Request**:
```json
{ "email": "jane@example.com", "password": "••••••••" }
```
**Response** `200`:
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOi...",
    "refreshToken": "8f2c1a...",
    "expiresIn": 900,
    "user": { "id": 12, "fullName": "Jane Doe", "email": "jane@example.com" }
  }
}
```
**Errors**: `401 AUTH_001` (bad credentials), `400 VALIDATION_001` (missing fields)

---

### `POST /jobs/:id/applications`
**Request**:
```json
{ "coverLetter": "I'm excited to apply because..." }
```
(`resumeUrl` snapshot is taken server-side from the user's current `resume_url` unless a new file is uploaded via `multipart/form-data` with field `resume`.)

**Response** `201`:
```json
{
  "success": true,
  "data": { "id": 501, "jobId": 12, "status": "pending", "createdAt": "2026-08-10T09:00:00Z" }
}
```
**Errors**:
- `404 JOBS_001` — job not found or not published
- `409 APPLICATIONS_002` — user already applied (`uq_applications_job_user`)
- `409 JOBS_002` — job is closed/expired

---

### `POST /admin/jobs/:id/approve`
**Request**: no body required
**Response** `200`:
```json
{
  "success": true,
  "data": { "id": 12, "status": "published", "approvedBy": 3, "expiresAt": "2026-09-10T00:00:00Z" }
}
```
**Errors**:
- `403 AUTH_003` — admin's role lacks `jobs.approve` permission (checked against `role_permissions` for `method=POST, route=/admin/jobs/:id/approve`)
- `409 JOBS_002` — job not in `pending_review` state
- `404 JOBS_001` — job not found

---

### `PATCH /admin/applications/:id/status`
**Request**:
```json
{ "status": "shortlisted" }
```
**Response** `200`:
```json
{
  "success": true,
  "data": { "id": 501, "status": "shortlisted", "reviewedBy": 3, "reviewedAt": "2026-08-10T09:10:00Z" }
}
```
**Errors**: `400 VALIDATION_001` (invalid status value/transition), `404 APPLICATIONS_001`

---

## [TECH-SPECIFIC ADDITIONS]

- **Protocol**: REST only — no GraphQL, WebSocket, or gRPC in scope for v1. If real-time application-status updates are needed later, the addition would be a `notifications` feature emitting over WebSocket (`@nestjs/platform-ws` or Socket.IO gateway), reusing the same JWT auth via a handshake guard — not documented here until planned.
- **RBAC enforcement**: every `Admin`-auth row above corresponds 1:1 to a `permissions` row (`method` + `route`) in `DATABASE.md` §2; `RolesGuard` (see `ARCHITECTURE.md` §"NestJS-Specific Additions") resolves this at runtime — the endpoint table above is the source of truth for seeding the `permissions` table.
- **OpenAPI**: generated via `@nestjs/swagger` from DTOs + decorators, served at `/api/docs` in non-production environments; this file is the human-readable companion, not a replacement.
