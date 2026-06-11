# Feature: Home Page Theme Toggle (Light/Dark)

## Overview
Add a sun/moon toggle button in the Navbar that switches the home page (`/`) between light and dark themes. Dashboard and all other routes stay dark always. Preference persisted in `localStorage` under key `home_theme` (default: `"dark"`).

## Scope
**In scope:** Toggle button in Navbar; light/dark switch for Hero, ProblemSolution, HowToUse, FAQ, CTA, Navbar (on `/`), Footer (on `/`); localStorage persistence; `.light-theme` body class; React Context for home page components.

**Out of scope:** Dashboard theming, system `prefers-color-scheme` detection, widget theming.

## Assumptions
- Current page has mixed appearance (Hero/CTA dark, ProblemSolution/HowToUse/FAQ light). Toggle makes all sections consistently dark or light.
- Navbar/Footer live in `layout.tsx` outside `{children}` — they consume context via provider moved to wrap everything in layout.
- No SSR of theme state needed; client-only.
- Tailwind class pattern preserved (`bg-neutral-900` dark, `bg-white` light).

---

## Codebase Context

| File | Relevance |
|------|-----------|
| `src/app/page.tsx` | Wrap with `HomeThemeProvider` |
| `src/app/layout.tsx` | Move `HomeThemeProvider` here to wrap Navbar + children + Footer |
| `src/app/globals.css` | Add `.light-theme` overrides |
| `src/components/common/Navbar.tsx` | Add toggle button; make bg/text theme-aware on `/` |
| `src/components/common/Footer.tsx` | Make theme-aware on `/` |
| `src/components/common/CTA.tsx` | Themed |
| `src/components/home/Hero.tsx` | Themed |
| `src/components/home/ProblemSolution.tsx` | Themed |
| `src/components/home/HowToUse.tsx` | Themed |
| `src/components/home/FAQ.tsx` | Themed |

**New files:** `src/components/providers/HomeThemeProvider.tsx`, `src/components/ui/ThemeIcons.tsx`

---

## Implementation Plan

### 1. HomeThemeProvider (`src/components/providers/HomeThemeProvider.tsx`)
- `"use client"`; uses `usePathname()` from `next/navigation`.
- Exposes `{ theme: "dark"|"light", toggleTheme, isHomePage: boolean }` via React context + `useHomeTheme()` hook.
- `theme` initialized from `localStorage.getItem("home_theme")` in a `useEffect` (default `"dark"`).
- `toggleTheme` flips value, writes to localStorage, sets/removes `.light-theme` on `document.body`.
- `isHomePage` = `pathname === "/"`.

### 2. Root Layout (`layout.tsx`)
Wrap all children + Navbar + Footer inside `<HomeThemeProvider>` in the `<body>`.

### 3. Navbar Theme Toggle Button
Insert after existing nav items, before Login/Logout. Rendered only when `isHomePage === true`:
```tsx
<button onClick={toggleTheme} className={theme === "light" ? "text-amber-500" : "text-amber-400"} aria-label="Toggle theme">
  {theme === "dark" ? <SunIcon /> : <MoonIcon />}
</button>
```
Navbar bg/text logic extended with `theme` param:

| State | Dark bg | Light bg | Dark text | Light text |
|-------|---------|----------|-----------|------------|
| Home, not scrolled | `bg-neutral-900/60` | `bg-white/80` | `text-white` | `text-neutral-900` |
| Home, scrolled | `bg-white/80` | `bg-white/80` | `text-neutral-900` | `text-neutral-900` |
| Dashboard | `bg-neutral-900/80` | — | `text-white` | — |

### 4. Home Components — Theme Conditional Logic
Every component imports `useHomeTheme()`. The `theme` value drives ternary Tailwind class selection.

| Component | Dark (current) | Light | CSS scope class |
|-----------|---------------|-------|-----------------|
| **Hero** | `mesh-gradient`, `text-primary` | `bg-gradient-to-br from-blue-50 via-white to-blue-50`, `text-gray-900`, avatar border `border-gray-200` | `.home-hero` |
| **ProblemSolution** | `bg-neutral-950`, heading `text-white`, body `text-neutral-300`, labels `text-neutral-400`/`text-red-400`/`text-blue-400` | Current defaults (`bg-white`, `text-neutral-900`) | `.home-problem-solution` |
| **HowToUse** | section `bg-neutral-950`, heading `text-white`, subtitle `text-neutral-300`, cards `bg-neutral-900 border-neutral-800`, card title `text-white`, desc `text-neutral-400`, icon bg `bg-*-900/30` | Current defaults (`bg-white`, `text-neutral-900`, `bg-*-100` icons) | `.home-how-to-use` |
| **FAQ** | section `bg-neutral-950`, badge `bg-blue-900/30 text-blue-300`, heading `text-white`, subtext `text-neutral-300`, cards `bg-neutral-900 border-neutral-800 text-white`, icon circle `bg-blue-900/30 text-blue-300` | Current defaults (`bg-slate-50`, `text-slate-950`, `bg-white` cards) | `.home-faq` |
| **CTA** | `bg-neutral-950`, `text-white`, `text-white/50`, `border-white/20` | `bg-gradient-to-r from-blue-600 to-blue-700`, `text-white`, `text-white/70` | `.home-cta` |

### 5. Footer Theme Logic
Convert to `"use client"`. When `isHomePage && theme === "light"`: `bg-white`, `text-gray-700`, link hover `text-blue-600`, icon bg `bg-blue-600`, border `border-gray-200`. Otherwise keep current dark styling.

### 6. ThemeIcons (`src/components/ui/ThemeIcons.tsx`)
Exports `SunIcon` and `MoonIcon` as inline SVG components (standard Feather-style icons, ~8 lines each).

### 7. CSS Overrides (`globals.css`)
```css
/* Light theme — override mesh-gradient */
.light-theme .mesh-gradient {
  background-color: #f8faff;
}
.light-theme .mesh-gradient::before {
  opacity: 0.3;
}
```

---

## Edge Cases & Error Handling

| Scenario | Behavior |
|----------|----------|
| First visit (no localStorage) | Default `"dark"` |
| Refresh on `/` | `useEffect` reads localStorage, re-applies theme |
| Navigate `/` → `/dashboard` → `/` | Theme restored from localStorage on re-mount |
| Fast toggling | `useState` batching — each click flips once, no debounce needed |
| localStorage unavailable | try/catch wraps `getItem`/`setItem`; falls back to `"dark"` |
| Toggle visible on dashboard? | No — `isHomePage` is `false`, button hidden |

---

## Testing Requirements

**Unit:** HomeThemeProvider initial state & toggle; localStorage read/write; body class add/remove.

**Integration:** Home page renders dark by default; toggle switches all sections; dashboard has no toggle; navigating back to `/` restores theme.

**E2E:** Landing → toggle → refresh → persists → navigate to dashboard (dark, no toggle) → navigate back (theme restored).

---

## Definition of Done

- [ ] `HomeThemeProvider` wraps Navbar + children + Footer in `layout.tsx`
- [ ] Toggle button renders in Navbar only when `pathname === "/"`
- [ ] Clicking toggle flips theme, persists to localStorage, updates all home components
- [ ] Hero, ProblemSolution, HowToUse, FAQ, CTA render correct light/dark variants
- [ ] Navbar bg/text adapts to theme on `/`; stays dark on dashboard
- [ ] Footer adapts when `isHomePage === true`; stays dark otherwise
- [ ] `/dashboard` shows no toggle and is always dark
- [ ] Refresh on `/` preserves theme; refresh on dashboard has no effect on home theme
- [ ] No TypeScript errors; works in local dev environment
