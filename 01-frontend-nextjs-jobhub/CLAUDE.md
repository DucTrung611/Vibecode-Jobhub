# Frontend: vibecode-jobhub

## Tech Stack
  - Next.js 16 (App Router) + React 19: file-based routing, Server Components, SSR/ISR for read-heavy job listing pages
  - TypeScript: type safety, better DX, catch errors early
  - React Context (+ local `useState`/`useReducer`): app-wide state limited to auth/session, no external store lib needed at current team size
  - Native `fetch`: works identically in Server and Client Components, pairs with Next.js caching (`next: { revalidate }`)
  - Tailwind CSS v4: utility-first, fast styling, consistent design

## Documentation

### Must Read
- @docs/PROJECT-RULES-FRONTEND.md - Conventions, patterns, MUST/MUST NOT
- @docs/ARCHITECTURE-FRONTEND.md - Folder structure, components, state
- @docs/DESIGN-SYSTEM.md - Design tokens, screens→routes map, MUST follow for all UI work

### Reference
- @../00-share-docs/API_SPEC.md - API contract to consume
- @../00-share-docs/DATABASE.md - Data model reference
- @../design_handoff_jobhub/README.md - Full screen-by-screen design spec
- `../design_handoff_jobhub/JobHub.dc.html` - Interactive prototype (open in browser to inspect exact styles)

## Quick Reference

### Feature Location
`src/features/[name]/` - Each feature owns its components, hooks, services, types, context
`src/app/` - Route files only (`page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`), no business logic

### Public Exports
Always via `index.ts` file (barrel export)
