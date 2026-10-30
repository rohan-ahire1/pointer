/**
 * Lets a problem card further down a lesson bring its visualizer up without a
 * navigation, which would throw away the reader's place. Same seam as
 * search-palette-events.ts: the card and the picker are siblings on a Server
 * Component page, so a DOM event is simpler than a context just for this.
 */
export const SHOW_VISUALIZER_EVENT = "pointer:show-visualizer";

export function dispatchShowVisualizer(id: string): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<string>(SHOW_VISUALIZER_EVENT, { detail: id }));
}
