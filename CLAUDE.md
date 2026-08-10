# Project: JobHub

## Overview
A job board platform. Companies post jobs through an admin-approval workflow (draft → pending review → published), users browse/search jobs, save listings, and apply with a resume; admins manage companies, jobs, roles/permissions, and application review via RBAC-gated endpoints.

## Tech Stack
  - Frontend: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4
  - Backend: NestJS v11, TypeScript, TypeORM
  - Database: MySQL 8.x

## Structure
```
├── 01-frontend-nextjs-jobhub/   → @01-frontend-nextjs-jobhub/CLAUDE.md
├── 02-backend-nestjs-jobhub/    → @02-backend-nestjs-jobhub/CLAUDE.md
├── 00-share-docs/               → Shared documentation
└── design_handoff_jobhub/       → Design handoff: high-fidelity HTML prototype, source of truth for all UI work (see @01-frontend-nextjs-jobhub/docs/DESIGN-SYSTEM.md)
```

## Shared Docs
- @00-share-docs/API_SPEC.md
- @00-share-docs/DATABASE.md

## Important
- Follow existing patterns in codebase
- Feature naming stays consistent across layers: frontend `features/<name>/`, backend `modules/<name>/`, and `API_SPEC.md` §6 groupings all use the same name (e.g. `jobs`, `applications`)
- Any new UI/screen must follow `design_handoff_jobhub/` (colors, typography, spacing, component patterns) — never invent new visual style; see `01-frontend-nextjs-jobhub/docs/DESIGN-SYSTEM.md` for the implementation-ready summary
