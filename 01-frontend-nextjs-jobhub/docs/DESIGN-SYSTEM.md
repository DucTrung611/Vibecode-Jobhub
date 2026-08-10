# DESIGN-SYSTEM.md — Frontend

> Source of truth: `../../design_handoff_jobhub/JobHub.dc.html` (interactive HTML/React prototype, high-fidelity — colors/typography/spacing/copy are final) + `../../design_handoff_jobhub/README.md` (full screen-by-screen spec). This file is the **distilled, implementation-facing summary** for building in Next.js — when in doubt, open the prototype in a browser and inspect computed styles; this doc is not a substitute for it.

**Recreate, don't port.** The prototype is inline-styled HTML, not production code. Translate its tokens into this project's system (Tailwind config / CSS variables below) and build idiomatic Next.js components — don't copy inline `style={{...}}` or raw hex/px into components.

---

## 1. Signature Element

**"Waypoint" mark + notched card** — the recurring brand motif:
- **Waypoint mark**: circular dark badge with a right-pointing chevron. Used in the logo and as a bullet/accent throughout.
- **Notched card**: diagonal-cut top-right corner holding a small chevron icon.
  ```css
  clip-path: polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 0 100%);
  ```
  Applied to job cards, stat cards, and company cards. Implement as a reusable `NotchedCard` in `shared/components/` — every job/stat/company card composes it rather than re-declaring the clip-path.

---

## 2. Color Tokens

Add these to `tailwind.config.ts` theme extension (or CSS variables in `globals.css`) — never hardcode these hex values in feature components.

| Token | Hex | Usage |
|---|---|---|
| `void` | `#150F2E` | Primary dark surface (navbars, hero, footer, admin sidebar), primary text |
| `paper` | `#F6F4FC` | Page background (cool lavender-white) |
| `signal` | `#FF5630` | Primary CTA / brand accent (coral-orange) |
| `meridian` | `#5B4CFB` | Secondary accent — tag chips, links, admin highlights |
| `momentum` | `#FFB800` | Tertiary accent — logo glyph on dark, ratings/callouts |
| `mist` | `#E4E1F0` | Borders, dividers, neutral chip backgrounds |
| `text-secondary` | `#6E6889` | Secondary text |
| `text-body` | `#3A3557` | Body copy |
| `hairline` | `#F0EEF7` | Hairline dividers |

### Status colors (use consistently — map directly to backend enums)
| Status | Background | Foreground | Maps to |
|---|---|---|---|
| Draft | `#EDEBF5` | `#6E6889` | `jobs.status = 'draft'` |
| Open / Active / Interview | `#E9F7F1` | `#1F9D6B` | `jobs.status = 'published'`, `applications.status = 'shortlisted'`/interview stage |
| Closed / Rejected | `#FBEAEC` | `#D6394B` | `jobs.status = 'closed'`, `applications.status = 'rejected'` |
| Pending | `#FFF6E0` | `#B27700` | `jobs.status = 'pending_review'`, `applications.status = 'pending'` |
| Reviewing | `#EEEBFE` | `#5B4CFB` | `applications.status = 'reviewed'` |

Build one `StatusBadge` component (`shared/components/status-badge.tsx`) mapping a status string → these bg/fg pairs — don't inline badge colors per feature.

---

## 3. Typography

| Role | Font | Weights | Usage |
|---|---|---|---|
| Display | Bricolage Grotesque | 700 | All headings, logo wordmark |
| Body/UI | Plus Jakarta Sans | 400/500/600/700 | Body copy, nav, buttons, forms |
| Utility/data | IBM Plex Mono | 500/600 | Salaries, stat numbers, dates, table figures |

Load via `next/font/google` in the root layout (not the raw Google Fonts `<link>` from the prototype) and expose as CSS variables / Tailwind font families (`font-display`, `font-body`, `font-mono`).

---

## 4. Layout & Tokens

- **Concept**: asymmetric/editorial grids over rigid card grids; dark `Void` sections punctuate light `Paper` sections; diagonal notch motif breaks up rectangular cards.
- **Radius**: 8/10/12/14/16px for containers; 100px (pill) for buttons, tags, nav toggles.
- **Shadows**: soft, large-blur, low-opacity (`0 30px 60px -20px rgba(0,0,0,0.4-0.5)`) — reserved for hero search bar, modal, dropdown only. Everything else flat, no shadow.
- **Spacing scale**: 8/10/12/14/16/18/22/24/28/32/40/44px; desktop page gutters 40px.
- **Motion**: restrained — only a 300–500ms fade/rise-in on section mount. No page-transition animations.
- **Focus states**: visible 2px `signal` outline, 2px offset, on all interactive elements (buttons, inputs, links) — required for a11y, not optional polish.

---

## 5. Screens → Route Map

Each screen in the prototype maps to a feature + App Router route. Build against `ARCHITECTURE-FRONTEND.md`'s feature-based structure — one prototype screen is not necessarily one file.

| # | Screen | Route | Feature(s) |
|---|---|---|---|
| 1 | Homepage | `/` | `jobs` (featured), `companies` (trending categories via job counts) |
| 2 | Job Search Results | `/jobs` | `jobs` |
| 3 | Job Detail | `/jobs/[slug]` | `jobs`, `companies` |
| 4 | Login / Register | `/login`, `/register` (or tab-switched at one route) | `auth` |
| 5 | User Profile | modal, not a route — opened from navbar avatar | `users`, `jobs` (saved), `applications` |
| 6 | Admin Dashboard | `/admin` | cross-feature stats |
| 7 | Job Management | `/admin/jobs` | `jobs` (admin) |
| 8 | Company Management | `/admin/companies` | `companies` (admin) |
| 9 | Roles & Permissions | `/admin/roles` | `roles-permissions` |
| 10 | Applications Review | `/admin/applications` | `applications` (admin) |

Full per-screen component breakdown (navbar contents, sidebar filters, table columns, modal tabs, etc.) is in `../../design_handoff_jobhub/README.md` §Screens — read the relevant section before building that screen.

---

## 6. Interaction Rules (from prototype, must carry over)

- Admin tables: live client-side search/filter/sort.
- Job Management status pill cycles `draft → open → closed` on click (backend: `POST /admin/jobs/:id/approve` / reject / close — don't just mutate local state, call the real endpoint per `API_SPEC.md`).
- Applications Review status buttons update the selected candidate immediately, no page reload (`PATCH /admin/applications/:id/status`).
- Save/bookmark toggle on job cards flips filled/outline without navigating (`POST`/`DELETE /jobs/:id/save`).
- Profile modal closes on backdrop click or ✕; opening a saved job from inside it closes the modal and navigates to Job Detail.

---

## 7. Assets

No external images/photos. All icons are inline SVG (search, location pin, chevron, bookmark, checkmark) — recreate as small components in `shared/components/icons/`, not an icon font/library. Avatars (user + company) are colored initial badges, not images — build one `InitialsAvatar` component.

---

## 8. State → Real Data

The prototype uses in-file mock arrays (`JOBS`, `COMPANIES`, `MY_APPLICATIONS`, `ADMIN_APPLICATIONS`, `ROLES`). Per `ARCHITECTURE-FRONTEND.md` §7/§8, these become real data via each feature's `services/*.service.ts` + `use-*.ts` hook (or Server Component fetch) against the endpoints in `API_SPEC.md` §6 — infer field shapes from `DATABASE.md` §2 entities, not from the mock object literals (mocks may drop fields like `deleted_at`, `resume_url` snapshotting, etc. that the real API includes).

Suggested client state (Context, per `PROJECT-RULES-FRONTEND.md` — no external store lib):
- `AuthContext`: `{ isLoggedIn, isAdminAccount, user }`
- `search filters` (jobs feature, prefer URL params over Context): keyword, location, category, job types[], levels[], min salary, sort
- `savedJobIds`: per-user, backed by `/users/me/saved-jobs`, not just local state
- `profileModal`: open/closed + active tab (feature-local Context or `useState` lifted to the navbar)
- Admin: per-table search/filter/sort state, selected role id, selected application id + job filter — local to each admin page
