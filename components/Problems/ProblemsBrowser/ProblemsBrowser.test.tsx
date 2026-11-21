import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { getProblemGroups, getProblems, type Difficulty } from "@/content";
import { resetProgress, toggleSolved } from "@/lib/progress/store";
import { ProblemsBrowser } from "./ProblemsBrowser";

const groups = getProblemGroups();
const problems = getProblems();
const total = problems.length;

function countOf(difficulty: Difficulty): number {
  return problems.filter((p) => p.difficulty === difficulty).length;
}

/** The "x / y" text of the Easy, Medium and Hard stat tiles, in that order. */
function tileValues(): string[] {
  return screen.getAllByText(/^\d+ \/ \d+$/).map((el) => el.textContent ?? "");
}

function rowCheckboxes(): HTMLElement[] {
  return screen.queryAllByRole("checkbox");
}

/** The expand/collapse button in a group's heading, or null if the group isn't rendered. */
function groupButton(label: string): HTMLElement | null {
  const heading = screen
    .queryAllByRole("heading", { level: 2 })
    .find((h) => h.querySelector('span[class*="label"]')?.textContent === label);
  return heading?.querySelector("button") ?? null;
}

function clickFilter(groupName: string, optionName: string) {
  fireEvent.click(within(screen.getByRole("group", { name: groupName })).getByRole("button", { name: optionName }));
}

function typeQuery(value: string) {
  fireEvent.change(screen.getByLabelText("Filter problems by name"), { target: { value } });
}

describe("ProblemsBrowser", () => {
  beforeEach(() => {
    window.localStorage.clear();
    resetProgress();
  });

  it("shows every problem and matching difficulty totals with no filters", () => {
    render(<ProblemsBrowser groups={groups} />);
    expect(screen.getByText(`${total} of ${total} shown`)).toBeInTheDocument();
    expect(rowCheckboxes()).toHaveLength(total);

    const totals = tileValues().map((text) => Number(text.split(" / ")[1]));
    expect(totals).toEqual([countOf("easy"), countOf("medium"), countOf("hard")]);
    expect(totals.reduce((a, b) => a + b, 0)).toBe(total);
  });

  it("filters by name against the title or the group label", () => {
    render(<ProblemsBrowser groups={groups} />);
    typeQuery("window");

    const expected = groups.flatMap((group) =>
      group.problems.filter(
        (p) => p.title.toLowerCase().includes("window") || group.label.toLowerCase().includes("window"),
      ),
    );
    expect(expected.length).toBeGreaterThan(0);
    expect(expected.length).toBeLessThan(total);
    expect(rowCheckboxes()).toHaveLength(expected.length);
    expect(screen.getByText(`${expected.length} of ${total} shown`)).toBeInTheDocument();
    for (const problem of expected) {
      expect(screen.getByRole("checkbox", { name: `Mark solved: ${problem.title}` })).toBeInTheDocument();
    }
  });

  it("shows only hard problems with the Hard filter", () => {
    render(<ProblemsBrowser groups={groups} />);
    clickFilter("Difficulty", "Hard");

    const hard = problems.filter((p) => p.difficulty === "hard");
    expect(rowCheckboxes()).toHaveLength(hard.length);
    expect(screen.getByText(`${hard.length} of ${total} shown`)).toBeInTheDocument();
    for (const problem of hard) {
      expect(screen.getByRole("checkbox", { name: `Mark solved: ${problem.title}` })).toBeInTheDocument();
    }
  });

  it("splits solved and to-do problems with the status filter and updates the tile", () => {
    const solved = problems.find((p) => p.difficulty === "hard");
    if (!solved) throw new Error("expected at least one hard problem");
    act(() => toggleSolved(solved.slug));

    render(<ProblemsBrowser groups={groups} />);
      expect(tileValues()[2]).toBe(`1 / ${countOf("hard")}`);

    clickFilter("Status", "Solved");
    expect(rowCheckboxes()).toHaveLength(1);
    expect(screen.getByRole("checkbox", { name: `Mark not solved: ${solved.title}` })).toBeInTheDocument();
    expect(screen.getByText(`1 of ${total} shown`)).toBeInTheDocument();

    clickFilter("Status", "To do");
    expect(rowCheckboxes()).toHaveLength(total - 1);
    expect(screen.queryByRole("checkbox", { name: `Mark not solved: ${solved.title}` })).not.toBeInTheDocument();
    expect(screen.queryByRole("checkbox", { name: `Mark solved: ${solved.title}` })).not.toBeInTheDocument();
    expect(screen.getByText(`${total - 1} of ${total} shown`)).toBeInTheDocument();
  });

  it("opens groups with matches and collapses groups without while filtering", () => {
    render(<ProblemsBrowser groups={groups} />);
    // Every group starts open.
    for (const group of groups) {
      expect(groupButton(group.label)).toHaveAttribute("aria-expanded", "true");
    }

    clickFilter("Difficulty", "Hard");
    const withHard = groups.filter((g) => g.problems.some((p) => p.difficulty === "hard"));
    const withoutHard = groups.filter((g) => !g.problems.some((p) => p.difficulty === "hard"));
    expect(withHard.length).toBeGreaterThan(0);
    expect(withoutHard.length).toBeGreaterThan(0);

    for (const group of withHard) {
      expect(groupButton(group.label)).toHaveAttribute("aria-expanded", "true");
    }
    for (const group of withoutHard) {
      expect(groupButton(group.label)).toBeNull();
    }
  });
});
