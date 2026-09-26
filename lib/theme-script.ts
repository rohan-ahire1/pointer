import { THEME_STORAGE_KEY } from "./theme";

/**
 * Tiny blocking script injected into <head> (see app/layout.tsx) so a
 * manual theme choice is applied to <html> before first paint — no flash of
 * the wrong theme. It runs before any bundle loads, so it's deliberately
 * dependency-free rather than importing from theme.ts, and every storage
 * access is wrapped in try/catch: if storage is blocked, the page just
 * renders with no data-theme attribute, which is exactly the "system"
 * default that tokens.css's prefers-color-scheme query already handles.
 */
export const THEME_INIT_SCRIPT = `(function(){try{var t=window.localStorage.getItem(${JSON.stringify(
  THEME_STORAGE_KEY,
)});if(t==="light"||t==="dark"){document.documentElement.setAttribute("data-theme",t);}}catch(e){}})();`;
