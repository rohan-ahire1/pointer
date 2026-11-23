import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { getProblemGroups } from "@/content";
import { resetProgress } from "@/lib/progress/store";
import { ProblemsBrowser } from "./ProblemsBrowser";

describe("ProblemsBrowser URL filters", () => {
  beforeEach(() => {
    window.localStorage.clear();
    resetProgress();
  });

  afterEach(() => {
    window.history.replaceState(null, "", "/");
  });

  it("starts from ?difficulty=hard and shows only hard problems", () => {
    window.history.replaceState(null, "", "/problems?difficulty=hard");
    const groups = getProblemGroups();
    const all = groups.flatMap((group) => group.problems);
    const hard = all.filter((p) => p.difficulty === "hard");
    const other = all.find((p) => p.difficulty !== "hard");
    expect(hard.length).toBeGreaterThan(0);
    expect(other).toBeDefined();

    render(<ProblemsBrowser groups={groups} />);

    expect(screen.getByText(`${hard.length} of ${all.length} shown`)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Hard" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.queryByText(other!.title)).not.toBeInTheDocument();
    expect(window.location.search).toBe("?difficulty=hard");
  });
});
