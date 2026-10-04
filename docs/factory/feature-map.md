# Feature map

What exists in this repo and what proves it works. Agents read this before changing anything and update it when they add, move or remove a feature.

| Feature | Where (route, screen or module) | Source | Proof (test, command or route to screenshot) |
|---|---|---|---|
| Home | `/` | `app/page.tsx`, `components/Home/` | screenshot `/` |
| Pattern list | `/patterns` | `app/patterns/page.tsx`, `components/Patterns/` | screenshot `/patterns` |
| Lesson page (idea, watch, try it, solve) | `/patterns/[slug]` | `app/patterns/[slug]/page.tsx`, `components/Lesson/` | screenshot `/patterns/sliding-window` |
| Explainer videos | Lesson "Watch" section | `components/Lesson/LessonWatch/` (Remotion Player) | screenshot a lesson |
| Step-through visualizers | Lesson "Try it" section, home card | `visualizers/` | `npm test` (trace tests), screenshot a lesson |
| Problem list and solved checkboxes | `/problems`, lesson "Solve" section | `components/Problems/`, `components/Lesson/SolveSection/`, `lib/progress/` | screenshot `/problems` |
| Progress dashboard, export/import/reset | `/progress` | `components/Progress/`, `lib/progress/` | `npm test`, screenshot `/progress` |
| About | `/about` | `app/about/page.tsx` | screenshot `/about` |
| Search palette (`/` or ⌘K) | overlay on every page | `components/Search/`, `lib/search/` | open with `/` in the browser |
| Theme (light/dark/system) | header toggle | `lib/theme.ts`, `components/ThemeToggle/` | `npm test` (`lib/theme.test.ts`) |
| Content data | 15 patterns, 75 problems | `content/` | `npm test` (`content/data.test.ts`) |

## Out of bounds

Paths agents leave alone unless an issue asks explicitly: see `protect` in `factory.json`.
