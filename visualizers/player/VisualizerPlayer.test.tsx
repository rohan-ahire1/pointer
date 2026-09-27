import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { slidingWindowVisualizer } from "../sliding-window";
import { VisualizerPlayer } from "./VisualizerPlayer";

function renderPlayer() {
  render(<VisualizerPlayer visualizer={slidingWindowVisualizer} />);
  return screen.getByRole("group", { name: /visualizer\. use left and right arrow keys/i });
}

/** The visible "Step n of m" label — distinct from the sr-only summary, which also contains that text. */
function stepLabel(re: RegExp) {
  return screen.getByText(re, { selector: ":not(.sr-only)" });
}

describe("VisualizerPlayer", () => {
  it("renders the first step for the default preset", () => {
    renderPlayer();
    expect(stepLabel(/step 1 of 25/i)).toBeInTheDocument();
  });

  it("steps forward and back with the arrow keys", () => {
    const region = renderPlayer();

    fireEvent.keyDown(region, { key: "ArrowRight" });
    expect(stepLabel(/step 2 of 25/i)).toBeInTheDocument();

    fireEvent.keyDown(region, { key: "ArrowRight" });
    expect(stepLabel(/step 3 of 25/i)).toBeInTheDocument();

    fireEvent.keyDown(region, { key: "ArrowLeft" });
    expect(stepLabel(/step 2 of 25/i)).toBeInTheDocument();
  });

  it("does not step when arrow keys land on the input field", () => {
    renderPlayer();
    const input = screen.getByLabelText("s =");

    fireEvent.keyDown(input, { key: "ArrowRight" });
    expect(stepLabel(/step 1 of 25/i)).toBeInTheDocument();
  });

  it("resets to step 1 with R", () => {
    const region = renderPlayer();

    fireEvent.keyDown(region, { key: "ArrowRight" });
    fireEvent.keyDown(region, { key: "ArrowRight" });
    expect(stepLabel(/step 3 of 25/i)).toBeInTheDocument();

    fireEvent.keyDown(region, { key: "r" });
    expect(stepLabel(/step 1 of 25/i)).toBeInTheDocument();
  });

  it("resets to step 1 with the Reset button", () => {
    const region = renderPlayer();

    fireEvent.keyDown(region, { key: "ArrowRight" });
    expect(stepLabel(/step 2 of 25/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Reset to the first step" }));
    expect(stepLabel(/step 1 of 25/i)).toBeInTheDocument();
  });

  it("does not go past the last step or before the first", () => {
    const region = renderPlayer();

    fireEvent.keyDown(region, { key: "ArrowLeft" });
    expect(stepLabel(/step 1 of 25/i)).toBeInTheDocument();

    for (let i = 0; i < 30; i++) {
      fireEvent.keyDown(region, { key: "ArrowRight" });
    }
    expect(stepLabel(/step 25 of 25/i)).toBeInTheDocument();
  });

  it("loads a preset and restarts at step 1", () => {
    const region = renderPlayer();

    fireEvent.keyDown(region, { key: "ArrowRight" });
    fireEvent.keyDown(region, { key: "ArrowRight" });

    fireEvent.click(screen.getByRole("button", { name: "Load example bbbbb" }));
    expect(stepLabel(/step 1 of 16/i)).toBeInTheDocument();
  });

  it("shows a validation message for input that strips to nothing", () => {
    renderPlayer();
    const input = screen.getByLabelText("s =") as HTMLInputElement;

    fireEvent.change(input, { target: { value: "123" } });
    expect(screen.getByRole("alert")).toHaveTextContent(/enter at least one lowercase letter/i);
  });
});

describe("VisualizerPlayer autoplay + aria-live", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("switches the narration region to aria-live=off while playing, and back to polite when paused", () => {
    const region = renderPlayer();
    const narration = screen.getByText(/what.s happening/i).closest("[aria-live]");
    expect(narration).toHaveAttribute("aria-live", "polite");

    fireEvent.keyDown(region, { key: " " });
    expect(narration).toHaveAttribute("aria-live", "off");

    fireEvent.keyDown(region, { key: " " });
    expect(narration).toHaveAttribute("aria-live", "polite");
  });

  it("advances one step per interval tick at the default (1x) speed", () => {
    const region = renderPlayer();

    fireEvent.keyDown(region, { key: " " }); // play
    expect(stepLabel(/step 1 of 25/i)).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(900);
    });
    expect(stepLabel(/step 2 of 25/i)).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(900);
    });
    expect(stepLabel(/step 3 of 25/i)).toBeInTheDocument();
  });

  it("stops autoplay and flips the Play button back once it reaches the last step", () => {
    const region = renderPlayer();

    fireEvent.keyDown(region, { key: " " }); // play
    act(() => {
      vi.advanceTimersByTime(900 * 30); // far more than the 25 steps needed
    });

    expect(stepLabel(/step 25 of 25/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Play ▶" })).toBeInTheDocument();
  });

  it("ignores Space when it lands on a button (native activation only)", () => {
    renderPlayer();
    const playButton = screen.getByRole("button", { name: "Play ▶" });

    fireEvent.keyDown(playButton, { key: " " });
    // The player's own shortcut handler should have ignored this — no
    // autoplay should have started, so advancing time changes nothing.
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(stepLabel(/step 1 of 25/i)).toBeInTheDocument();
  });

  it("marks itself in view only while the IntersectionObserver reports it on screen", () => {
    let report: ((entries: Array<{ isIntersecting: boolean }>) => void) | undefined;
    const disconnect = vi.fn();
    vi.stubGlobal(
      "IntersectionObserver",
      class {
        constructor(callback: (entries: Array<{ isIntersecting: boolean }>) => void) {
          report = callback;
        }
        observe() {}
        disconnect = disconnect;
      },
    );

    try {
      const region = renderPlayer();
      expect(region).toHaveAttribute("data-in-view", "false");

      act(() => report?.([{ isIntersecting: true }]));
      expect(region).toHaveAttribute("data-in-view", "true");

      act(() => report?.([{ isIntersecting: false }]));
      expect(region).toHaveAttribute("data-in-view", "false");
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
