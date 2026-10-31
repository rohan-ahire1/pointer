export const INTRO_STORAGE_KEY = "pointer:intro";
export const INTRO_ATTRIBUTE = "data-intro";

/**
 * Tiny blocking script injected into <head> (see app/layout.tsx). It marks
 * <html> before first paint when the intro should play, so the homepage never
 * flashes behind it: first visit, on the homepage, with motion allowed. If
 * storage is blocked it throws and the intro is skipped, since we couldn't
 * remember having shown it. The timer clears the mark if the bundle never
 * loads, so the page can't stay covered.
 */
export const INTRO_INIT_SCRIPT = `(function(){try{var r=document.documentElement;if(location.pathname==="/"&&!window.localStorage.getItem(${JSON.stringify(
  INTRO_STORAGE_KEY,
)})&&!window.matchMedia("(prefers-reduced-motion: reduce)").matches){r.setAttribute(${JSON.stringify(
  INTRO_ATTRIBUTE,
)},"");setTimeout(function(){r.removeAttribute(${JSON.stringify(INTRO_ATTRIBUTE)});},8000);}}catch(e){}})();`;
