# MaaSAI Brand Refresh — Design

**Date:** 2026-06-16
**Scope:** React frontend (port 3000) + simulator-studio Streamlit app (port 3001)
**Source of truth:** https://template.maasai-srv.cigip.upv.es/home/Brand

## Goal

Replace the current teal/green + amber visual identity with the official MaaSAI
brand: navy/orange/sand palette, the **Outfit** typeface, the MaaSAI wordmark
logo, and the square brand favicon.

## Brand tokens (canonical)

| Token | Hex | Role per brand guide |
|---|---|---|
| `--brand-navy` | `#223F61` | Headers, primary surfaces, sidebars, UI accents |
| `--brand-orange` | `#E78C3A` | CTAs, highlights, key actions, focus rings |
| `--brand-sand` | `#D8D1BE` | Section dividers, neutral cards, supportive backgrounds |
| `--brand-bg` | `#F3F2EE` | Page background, large neutral areas |
| `--brand-ink` | `#262626` | Body copy, headings, line icons |

Typeface: **Outfit** (Google Fonts), weights 300–800.

## Assets (provided by user, in `~/Downloads/`)

- `MaaSAI_colour_main_letters.png` (2089×502) — wordmark → `frontend/src/assets/`
- `favicon.ico` (180×180 navy/orange triangle mark) → `frontend/public/`

## Frontend changes (`frontend/`)

### Typography
- Add dependency `@fontsource-variable/outfit` (matches existing
  `@fontsource-variable/geist` self-hosted pattern).
- Import it in `styles.css`; set `:root` `font-family: "Outfit Variable", ...`
  with a sensible sans-serif fallback stack.

### Color migration (`src/styles.css`)
Add the five `--brand-*` variables to `:root`, then remap existing semantic
variables and hardcoded colors. The current single teal accent splits into two
brand roles:

| UI element | Current | New |
|---|---|---|
| Page background gradient | teal+amber+sand | off-white `#F3F2EE` w/ subtle navy + orange radial tints |
| Body ink (`--ink`) | `#172426` | `#262626` |
| Primary CTA buttons (`.primary-button`) | teal gradient | **orange** gradient (`#E78C3A` → darker shade) |
| Focus rings / `outline` / input focus | teal `#0f766e` | **orange** `#E78C3A` |
| Active nav, hover borders, card accents, `--accent-soft`, chips, stage chips | teal `rgba(15,118,110,*)` | **navy** `rgba(34,63,97,*)` |
| Progress fills, sparkline line | teal gradient | **navy → orange** gradient |
| `--accent` | teal | navy `#223F61` |

**Kept unchanged (intentionally):**
- Semantic status colors — alert severity (critical red / high amber / medium
  blue / low green) and milestone states (completed/progress/pending/overdue).
  These communicate state, not brand.
- Pilot identity chips (factor=orange, tasowheel=teal, e4m=blue) — categorical
  identity colors. Note: tasowheel's teal no longer matches the brand accent but
  remains a distinct category marker; acceptable, revisit later if desired.

### Logo
- Render the wordmark in the dashboard sidebar header (`DashboardLayout.tsx`)
  and on the auth/login screen (`AuthProvider.tsx` login state).
- Reference `favicon.ico` via `<link rel="icon">` in `index.html`; update the
  `<title>` to remain "MaaSAI Dashboard".

## Simulator-studio changes (`simulator-studio/`)

Update `.streamlit/config.toml` `[theme]`:
- `primaryColor = "#E78C3A"`
- `backgroundColor = "#F3F2EE"`
- `secondaryBackgroundColor = "#E9E5DA"` (sand-tinted neutral)
- `textColor = "#262626"`

Streamlit cannot load a custom webfont via `config.toml` alone, so inject an
Outfit `@import` + minimal CSS override via `st.markdown(..., unsafe_allow_html=True)`
at app startup in `app.py` so the demo matches the frontend typeface.

## Out of scope

- Keycloak login page theme (separate custom-theme effort).
- Backend, mock-sensors.
- Re-coloring categorical pilot identity colors.

## Testing / verification

- `pnpm test` (vitest) and `npx eslint .` pass in `frontend/`.
- Manual visual check: load frontend at :3000 — sidebar logo, orange CTAs,
  navy accents, Outfit font, off-white background, favicon in tab.
- `simulator-studio` tests pass; visual check at :3001 for theme + font.
