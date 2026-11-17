import { act, fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { getProblems } from "@/content";
import { resetProgress, toggleSolved } from "@/lib/progress/store";
import { ProgressDashboard } from "./ProgressDashboard";

const [first] = getProblems();

describe("ProgressDashboard reset confirm", () => {
  beforeEach(() => {
    window.localStorage.clear();
    resetProgress();
  });

  it("moves focus to the safe choice when the confirm opens", () => {
    render(<ProgressDashboard />);
    fireEvent.click(screen.getByRole("button", { name: "Reset…" }));
    expect(screen.getByRole("button", { name: "Keep my progress" })).toHaveFocus();
  });

  it("closes on Escape and returns focus to Reset…", () => {
    render(<ProgressDashboard />);
    fireEvent.click(screen.getByRole("button", { name: "Reset…" }));
    fireEvent.keyDown(screen.getByRole("button", { name: "Keep my progress" }), { key: "Escape" });
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Reset…" })).toHaveFocus();
  });

  it("clears solved problems on Yes, reset", () => {
    act(() => {
      toggleSolved(first.slug);
    });
    render(<ProgressDashboard />);
    expect(screen.getByText("Problems solved").nextSibling).toHaveTextContent(/^1/);
    fireEvent.click(screen.getByRole("button", { name: "Reset…" }));
    fireEvent.click(screen.getByRole("button", { name: "Yes, reset" }));
    expect(screen.getByText("Problems solved").nextSibling).toHaveTextContent(/^0/);
  });
});
