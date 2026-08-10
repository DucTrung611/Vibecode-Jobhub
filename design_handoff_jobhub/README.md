# Handoff: JobHub — Job Recruitment Platform

## Overview
Complete visual identity + interactive prototype for JobHub, a job recruitment platform with two roles: Job Seeker (user) and Admin. Covers 10 screens: homepage, job search results, job detail, login/register, user profile (modal), admin dashboard, job management, company management, roles & permissions, and applications review.

## About the Design Files
The bundled file (`JobHub.dc.html`) is a **design reference built in HTML/React** — a working prototype showing intended look, layout, and interaction behavior. It is not production code to copy directly. The task is to **recreate this design in Next.js** (App Router recommended), using idiomatic Next.js/React patterns, your own component structure, and your existing libraries — not to port the HTML/inline-style markup wholesale. If no design-system/component library exists yet in the target repo, build one using the tokens below (e.g. with Tailwind config or CSS variables) as you implement each screen.

## Fidelity
**High-fidelity.** Colors, typography, spacing, and copy are final. Recreate pixel-close using Next.js + your styling approach of choice (Tailwind, CSS Modules, styled-components, etc.), translating the inline styles into your system's tokens/classes rather than inlining raw hex/px everywhere.

## Design System

### Signature element
"Waypoint" mark + notched card: a circular dark badge with a right-pointing chevron (the brand mark, used in the logo and as a bullet/accent throughout), paired with cards that have a diagonal-cut top-right corner (`clip-path: polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 0 100%)`) holding a small chevron — evokes forward motion / the transition of a job search. Applied to job cards, stat cards, and company cards.

### Colors
- Void `#150F2E` — primary dark surface (navbars, hero, footer, sidebar), primary text
- Paper `#F6F4FC` — page background (cool lavender-white, not cream)
- Signal `#FF5630` — primary CTA / brand accent (coral-orange)
- Meridian `#5B4CFB` — secondary accent, tag chips, links, admin highlights
- Momentum `#FFB800` — tertiary accent (logo glyph on dark, ratings/callouts)
- Mist `#E4E1F0` — borders, dividers, neutral chip backgrounds
- Secondary text: `#6E6889`; body copy: `#3A3557`; hairline dividers: `#F0EEF7`

### Status colors (used consistently everywhere)
- Draft → neutral `bg:#EDEBF5 fg:#6E6889`
- Open / Active / Interview → success `bg:#E9F7F1 fg:#1F9D6B`
- Closed / Rejected → danger `bg:#FBEAEC fg:#D6394B`
- Pending → amber `bg:#FFF6E0 fg:#B27700`
- Reviewing → violet `bg:#EEEBFE fg:#5B4CFB`

### Typography
- Display: **Bricolage Grotesque** (700 weight) — all headings, logo wordmark
- Body/UI: **Plus Jakarta Sans** (400/500/600/700) — body copy, nav, buttons, forms
- Utility/data: **IBM Plex Mono** (500/600) — salaries, stat numbers, dates, table figures
- Google Fonts URL used: `https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400..800&family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,500&family=IBM+Plex+Mono:wght@400;500;600&display=swap`

### Layout concept
Asymmetric, editorial grids over rigid card grids; dark hero/CTA sections punctuate light `Paper` sections; diagonal notch motif breaks up otherwise rectangular cards. Border radius scale: 8–16px on most containers; pill (100px) on buttons, tags, nav toggles.

## Screens

### 1. Homepage
- Sticky navbar: logo (waypoint mark + "JobHub" wordmark) left, Home/Find Jobs nav pills, Sign In button (or avatar dropdown when logged in) right.
- Dark hero (`Void` bg, radial gradient blobs in Meridian/Signal at low opacity): eyebrow pill, H1 "Your next chapter starts at the waypoint.", subhead, search bar card (keyword, location, category select, Search button) floating on top, trending chips below.
- "Featured openings" section: 3-column grid of notched job cards (company avatar, title, type/level chips, salary in mono, posted date).
- "Trending categories" section: 3 colored tiles (Tech/Software = Void, Design/Creative = Meridian, Finance = Momentum) with chevron icon, name, open-role count.
- Dark footer with logo + tagline.

### 2. Job Search Results
- Top search bar (keyword + location inputs).
- Left sidebar (260px, sticky): Job type checkboxes (Full-time/Part-time/Contract/Remote), Experience level checkboxes (Entry/Mid/Senior), salary range slider, "Clear all" link.
- Right: results count + sort dropdown (relevance/recent/salary), list of notched job rows (avatar, title + status badge, company/location, type/level/category chips, salary, posted date, save-bookmark toggle), pagination (5 per page).

### 3. Job Detail
- Dark header card: company avatar, title + status badge, company/location, Save + Apply buttons, stat row (salary, type, level, posted, applicants).
- Two-column body: About/Requirements (bulleted with chevron icons) left; sticky "About the company" card right (industry, size, founded, open roles, Apply button).

### 4. Login / Register
- Split screen: left dark panel with waypoint mark + headline + supporting copy; right white panel with pill tab switcher (Sign In / Register) and the respective form. Successful submit sets logged-in state and returns to Home; the navbar then shows an avatar button.

### 5. User Profile (rendered as a **modal popup**, not a page)
Triggered from the navbar avatar dropdown → "My Profile" (dropdown also has "Admin view" for admin accounts, and "Sign out"). Modal: centered card over a dark backdrop, close (✕) button, tabs — Personal Info (editable fields), CV (upload/preview a PDF placeholder), Saved Jobs (list), Applications (status-badged list: pending/reviewing/interview/rejected).

### 6. Admin Dashboard
- Dark left sidebar nav (Dashboard/Jobs/Companies/Roles & Permissions/Applications, active = Signal-filled pill) + "Back to job seeker view".
- 4 notched stat cards (Total Users, Companies, Active Jobs, Applications) with mono figures + trend deltas.
- Applications trend bar chart (12 bars, Meridian→Void gradient).

### 7. Job Management
- Header + "New Job" button, search + status filter + sort dropdown row.
- Data table: Title, Company, Status (clickable pill that cycles draft→open→closed), Deadline, Applications, Edit/Delete actions.

### 8. Company Management
- Header + "New Company" button, search box.
- Data table: logo initials + name, Industry, Open Jobs count, Edit/Delete.

### 9. Roles & Permissions
- Left list of roles (Admin/Recruiter/Moderator/Viewer, click to select, "+ Create new role").
- Right panel: permission grid — modules (Users/Jobs/Companies/Applications) × actions (View/Create/Edit/Delete) as checkboxes, Save button.

### 10. Applications Review
- Job picker dropdown + status filter.
- Left: candidate list table (name, applied date, status pill), row click selects.
- Right: candidate detail card (avatar, name, email, applied-to job, CV file row with Preview button, status-update button group).

## Interactions & Behavior
- All admin tables support live search/filter/sort (client-side).
- Job status pill in Job Management cycles draft → open → closed on click.
- Applications Review status buttons update the selected candidate's status immediately (no page reload).
- Save/bookmark icon toggles filled/outline state on job cards without navigating.
- Profile modal closes on backdrop click or ✕; opening a saved job from inside it closes the modal and navigates to Job Detail.
- No page transitions/animations beyond a subtle 300–500ms fade/rise-in on section mount; keep motion restrained.
- Focus states: visible 2px Signal outline with 2px offset on all interactive elements (buttons, inputs, links).

## State Management (for the Next.js rebuild)
Suggested state shape:
- `session`: `{ isLoggedIn, isAdminAccount, user }`
- `route`/page state per role (or actual Next.js routes: `/`, `/jobs`, `/jobs/[id]`, `/login`, `/admin`, `/admin/jobs`, `/admin/companies`, `/admin/roles`, `/admin/applications`)
- `search filters`: keyword, location, category, job types[], levels[], min salary, sort
- `savedJobIds`: Set/array, persisted per user
- `profileModal`: open/closed + active tab
- Admin: per-table search/filter/sort state; selected role id; selected application id + job filter
- Real data fetching would replace the in-file mock arrays (`JOBS`, `COMPANIES`, `MY_APPLICATIONS`, `ADMIN_APPLICATIONS`, `ROLES`) with API/DB calls — schemas can be inferred directly from those object shapes in the source file.

## Design Tokens (summary — see Colors/Typography above for full values)
- Radius: 8, 10, 12, 14, 16px containers; 100px (pill) for buttons/tags/toggles
- Shadows: soft, large-blur, low-opacity (e.g. `0 30px 60px -20px rgba(0,0,0,0.4-0.5)`) only on the hero search bar, modal, and dropdown — flat elsewhere
- Spacing: 8/10/12/14/16/18/22/24/28/32/40/44px used throughout; page gutters 40px desktop

## Assets
No external images/photos — all iconography is minimal inline SVG (search, location pin, chevron, bookmark, checkmark). Company/user avatars are colored initial badges, not images. No brand/photo assets to source.

## Files
- `JobHub.dc.html` — the full interactive prototype (single file, all 10 screens + the Design System). Open directly in a browser; use browser dev tools to inspect exact computed styles per element if needed beyond this README.
