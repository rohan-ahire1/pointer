import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { SearchPalette } from "./SearchPalette";

const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

function getInput(): HTMLInputElement {
  return screen.getByRole("combobox") as HTMLInputElement;
}

describe("SearchPalette", () => {
  it("shows a hint and no results when the query is empty", () => {
    render(<SearchPalette open onClose={() => {}} />);
    expect(screen.getByText(/start typing to search/i)).toBeInTheDocument();
    expect(getInput()).toHaveAttribute("aria-expanded", "false");
  });

  it("filters results as you type and marks the first match active", () => {
    render(<SearchPalette open onClose={() => {}} />);
    fireEvent.change(getInput(), { target: { value: "sliding window" } });
    expect(screen.getByText("Sliding Window")).toBeInTheDocument();
    expect(getInput()).toHaveAttribute("aria-expanded", "true");
    const activeId = getInput().getAttribute("aria-activedescendant");
    expect(activeId).toBeTruthy();
    expect(document.getElementById(activeId!)).toHaveAttribute("aria-selected", "true");
  });

  it("shows a no-matches message for a query with no hits", () => {
    render(<SearchPalette open onClose={() => {}} />);
    fireEvent.change(getInput(), { target: { value: "zzzznotarealthing" } });
    expect(screen.getByText(/no matches for/i)).toBeInTheDocument();
  });

  it("moves the active option with ArrowDown/ArrowUp and announces a result count", () => {
    render(<SearchPalette open onClose={() => {}} />);
    fireEvent.change(getInput(), { target: { value: "e" } });
    const firstActive = getInput().getAttribute("aria-activedescendant");

    fireEvent.keyDown(getInput(), { key: "ArrowDown" });
    const secondActive = getInput().getAttribute("aria-activedescendant");
    expect(secondActive).not.toBe(firstActive);

    fireEvent.keyDown(getInput(), { key: "ArrowUp" });
    expect(getInput().getAttribute("aria-activedescendant")).toBe(firstActive);
  });

  it("navigates to the active item's href on Enter", () => {
    render(<SearchPalette open onClose={() => {}} />);
    fireEvent.change(getInput(), { target: { value: "sliding window" } });
    fireEvent.keyDown(getInput(), { key: "Enter" });
    expect(push).toHaveBeenCalledWith("/patterns/sliding-window");
  });

  it("navigates to a clicked option's href", () => {
    render(<SearchPalette open onClose={() => {}} />);
    fireEvent.change(getInput(), { target: { value: "progress" } });
    fireEvent.click(screen.getByText("Your progress"));
    expect(push).toHaveBeenCalledWith("/progress");
  });
});
