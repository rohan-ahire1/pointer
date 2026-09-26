# Design reference

These are the approved Pointer mockups (Toybox v2), exported from the design canvas. Open any `.dc.html` in a text editor to read layout, copy and states; the markup uses inline styles plus a tiny templating runtime, so it will not render as a normal web page. The live, clickable versions are on Rohan's design canvas ("Pointer · Final" page).

| File | Screen |
|---|---|
| `mocks/C2-Home.dc.html` | Home (returning visitor, with "Welcome back" banner) |
| `mocks/C2-Pattern.dc.html` | Lesson — Sliding Window (live): lesson bar, pattern switcher, idea, watch, visualizer, problems, up next |
| `mocks/C2-Soon.dc.html` | Lesson — coming soon state (Stack) |
| `mocks/C2-Patterns.dc.html` | All patterns, grouped, with filter |
| `mocks/C2-Problems.dc.html` | Blind 75 problems, filters, solved checkboxes |
| `mocks/C2-Search.dc.html` | Search palette (overlay) |
| `mocks/C2-Progress.dc.html` | Progress page with export / import / reset |
| `mocks/C2-About.dc.html` | About, accessibility statement, FAQ, credits |
| `mocks/C2-404.dc.html` | Not found |
| `mocks/C2-Home-Dark.dc.html`, `mocks/C2-Pattern-Dark.dc.html` | Dark theme reference |
| `mocks/C2-Phone.dc.html` | Phone — home |
| `mocks/C2-PhoneMenu.dc.html` | Phone — menu with theme switch |
| `mocks/C2-PhonePatterns.dc.html` | Phone — patterns |
| `mocks/C2-PhoneLessonTop.dc.html` | Phone — lesson: idea + watch |
| `mocks/C2-PhoneLesson.dc.html` | Phone — lesson: try it, sticky controls |
| `mocks/C2-PhoneProblems.dc.html` | Phone — problems |
| `mocks/C2-PhoneSearch.dc.html` | Phone — search |
| `mocks/C2-System.dc.html` | Design system sheet: tokens, type, components, motion and accessibility rules |
| `mocks/C2-OG.dc.html` | Link preview image, 1200×630 |

Reading tips:
- `var(--name)` values map to `tokens.css`.
- `{{name}}` is a value computed in the `Component` class at the bottom of the file. That class also shows the intended behaviour (filters, toggles, keyboard handling).
- Class `soft` means the display font (Unbounded). `tilt` marks decorative rotations that must be removed under reduced motion.
