/**
 * Share links: `?v=<visualizer>&input=<raw>&step=<1-based>#try` reopens a run
 * at the exact moment someone was looking at. Step numbers match the "Step n
 * of m" label, so a link reads the same as the screen it came from.
 */
export type SharedRun = { input: string; stepIndex: number };

export function readSharedRun(search: string, visualizerId: string): SharedRun | null {
  const params = new URLSearchParams(search);
  const input = params.get("input");
  if (input === null) return null;
  const v = params.get("v");
  if (v !== null && v !== visualizerId) return null;
  const step = Number(params.get("step") ?? "1");
  return { input, stepIndex: Number.isInteger(step) && step > 0 ? step - 1 : 0 };
}

export function sharedRunUrl(href: string, visualizerId: string, raw: string, stepIndex: number): string {
  const url = new URL(href);
  url.search = "";
  url.searchParams.set("v", visualizerId);
  url.searchParams.set("input", raw);
  url.searchParams.set("step", String(stepIndex + 1));
  url.hash = "try";
  return url.toString();
}
