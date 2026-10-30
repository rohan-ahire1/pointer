import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getPattern, getProblems } from "@/content";
import { DRILL_ROUND_SIZE } from "@/lib/drill";
import { PatternDrill } from "./PatternDrill";

function currentProblem() {
  const problem = getProblems().find((item) => screen.queryByRole("heading", { name: item.prompt }));
  if (!problem) throw new Error("no question on screen");
  return problem;
}

describe("PatternDrill", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("starts with no question so the server and client render match", () => {
    render(<PatternDrill />);
    expect(screen.getByRole("heading", { name: "Which patterns?" })).toBeInTheDocument();
  });

  it("marks a right answer, moves focus to Next and scores the round", () => {
    render(<PatternDrill />);
    fireEvent.click(screen.getByRole("button", { name: /start 10 questions/i }));

    for (let i = 0; i < DRILL_ROUND_SIZE; i++) {
      const name = getPattern(currentProblem().pattern)?.name ?? "";
      fireEvent.click(screen.getByRole("button", { name }));
      expect(screen.getByRole("status")).toHaveTextContent("Right.");
      fireEvent.click(document.activeElement as HTMLElement);
    }

    expect(screen.getByRole("heading", { name: "10 of 10" })).toBeInTheDocument();
    expect(screen.getByText("Your best: 10 of 10")).toBeInTheDocument();
  });

  it("answers with number keys and offers the misses again", () => {
    render(<PatternDrill />);
    fireEvent.click(screen.getByRole("button", { name: /start 10 questions/i }));
    const drill = screen.getByRole("group", { name: "Pattern drill" });

    for (let i = 0; i < DRILL_ROUND_SIZE; i++) {
      const problem = currentProblem();
      const names = screen.getAllByRole("button").map((button) => button.textContent ?? "");
      const wrong = names.findIndex((text) => !text.includes(getPattern(problem.pattern)?.name ?? ""));
      act(() => {
        fireEvent.keyDown(drill, { key: String(wrong + 1) });
      });
      expect(screen.getByRole("status")).toHaveTextContent("It's");
      fireEvent.keyDown(drill, { key: "ArrowRight" });
    }

    expect(screen.getByRole("heading", { name: "0 of 10" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Retry the 10 you missed" })).toBeInTheDocument();
  });
});
