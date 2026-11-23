import type { Difficulty } from "@/content";

export type DifficultyFilter = "all" | Difficulty;
export type StatusFilter = "all" | "todo" | "done";

export type ProblemFilters = {
  query: string;
  difficulty: DifficultyFilter;
  status: StatusFilter;
};

export const DEFAULT_FILTERS: ProblemFilters = {
  query: "",
  difficulty: "all",
  status: "all",
};

const DIFFICULTIES: readonly DifficultyFilter[] = ["all", "easy", "medium", "hard"];
const STATUSES: readonly StatusFilter[] = ["all", "todo", "done"];

/** Reads the filters from a query string. Missing or invalid values fall back to the defaults. */
export function readFilters(search: string): ProblemFilters {
  const params = new URLSearchParams(search);
  const difficulty = params.get("difficulty");
  const status = params.get("status");
  return {
    query: params.get("q") ?? DEFAULT_FILTERS.query,
    difficulty: DIFFICULTIES.find((value) => value === difficulty) ?? DEFAULT_FILTERS.difficulty,
    status: STATUSES.find((value) => value === status) ?? DEFAULT_FILTERS.status,
  };
}

/**
 * Turns the filters into a query string ("?q=...&difficulty=...&status=..." or ""),
 * leaving out values that are still the default. Other params in `base` are kept.
 */
export function filtersToSearch(filters: ProblemFilters, base = ""): string {
  const params = new URLSearchParams(base);
  params.delete("q");
  params.delete("difficulty");
  params.delete("status");
  if (filters.query !== DEFAULT_FILTERS.query) params.set("q", filters.query);
  if (filters.difficulty !== DEFAULT_FILTERS.difficulty) params.set("difficulty", filters.difficulty);
  if (filters.status !== DEFAULT_FILTERS.status) params.set("status", filters.status);
  const text = params.toString();
  return text ? `?${text}` : "";
}
