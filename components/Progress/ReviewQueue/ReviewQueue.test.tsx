import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { getProblems } from "@/content";
import { addDays, localDay } from "@/lib/progress/review";
import { resetProgress, toggleSolved, reviewProblem } from "@/lib/progress/store";
import { ReviewQueue } from "./ReviewQueue";

const [first, second] = getProblems();

describe("ReviewQueue", () => {
  beforeEach(() => {
    window.localStorage.clear();
    resetProgress();
  });

  it("stays out of the way until something is solved", () => {
    const { container } = render(<ReviewQueue />);
    expect(container).toBeEmptyDOMElement();
  });

  it("says when the next review is once the queue is clear", () => {
    toggleSolved(first.slug);
    render(<ReviewQueue />);
    expect(screen.getByRole("status")).toHaveTextContent("Nothing due today.");
  });

  it("works down due problems one at a time", () => {
    toggleSolved(first.slug);
    toggleSolved(second.slug);
    const stored = JSON.parse(window.localStorage.getItem("pointer:v1") ?? "{}");
    const yesterday = addDays(localDay(), -1);
    stored.reviews[first.slug].due = yesterday;
    stored.reviews[second.slug].due = yesterday;
    window.dispatchEvent(new StorageEvent("storage", { key: "pointer:v1", newValue: JSON.stringify(stored) }));

    render(<ReviewQueue />);
    expect(screen.getByText("2 due")).toBeInTheDocument();

    const gotIt = screen.getByRole("button", { name: /got it, ask me in 3 days/i });
    fireEvent.click(gotIt);
    expect(screen.getByText("1 due")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /got it, ask me in 3 days/i })).toBe(gotIt);

    fireEvent.click(gotIt);
    expect(screen.getByRole("status")).toHaveTextContent("Nothing due today.");
  });

  it("keeps a forgotten problem coming back tomorrow", () => {
    toggleSolved(first.slug);
    reviewProblem(first.slug, false);
    render(<ReviewQueue />);
    expect(screen.getByRole("status")).toHaveTextContent("Nothing due today.");
  });
});
