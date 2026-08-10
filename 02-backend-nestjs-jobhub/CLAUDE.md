# Backend: vibecode-jobhub

## Tech Stack
- Language: TypeScript
- Framework: NestJS v11
- ORM: TypeORM
- Database: MySQL 8.x

## Documentation

### Must Read
- @docs/PROJECT-RULES.md - Conventions, patterns, MUST/MUST NOT
- @docs/ARCHITECTURE.md - Folder structure, layers, feature anatomy

### Reference
- @../00-share-docs/API_SPEC.md - API contract
- @../00-share-docs/DATABASE.md - Schema

## Quick Reference

### Feature Location
`src/modules/[name]/` - Each feature owns its controller, service, entities, DTOs

### Error Code Prefix
`[FEATURE]_[NUMBER]` - e.g., AUTH_001, JOBS_001, APPLICATIONS_001
