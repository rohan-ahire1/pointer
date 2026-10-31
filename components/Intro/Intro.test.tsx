import { fireEvent, render, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { INTRO_ATTRIBUTE, INTRO_STORAGE_KEY } from "@/lib/intro-script";
import { Intro } from "./Intro";

function renderWithLogo() {
  return render(
    <>
      <header>
        <span data-logo>
          <span>↑</span>pointer
        </span>
      </header>
      <Intro />
    </>,
  );
}

describe("Intro", () => {
  beforeEach(() => {
    let now = 0;
    vi.stubGlobal("requestAnimationFrame", (paint: FrameRequestCallback) =>
      setTimeout(() => paint((now += 500))),
    );
    Object.defineProperty(document, "fonts", { configurable: true, value: { ready: Promise.resolve() } });
    Range.prototype.getBoundingClientRect = () => new DOMRect(40, 20, 90, 24);
    window.localStorage.clear();
    document.documentElement.setAttribute(INTRO_ATTRIBUTE, "");
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    document.documentElement.removeAttribute(INTRO_ATTRIBUTE);
  });

  it("plays to the end, uncovers the page and remembers it", async () => {
    const { container } = renderWithLogo();
    await waitFor(() => expect(window.localStorage.getItem(INTRO_STORAGE_KEY)).toBe("seen"));
    await waitFor(() => expect(container.querySelector<HTMLElement>('[data-part="code"]')?.textContent).toBeTruthy());
    await waitFor(() => expect(document.documentElement.hasAttribute(INTRO_ATTRIBUTE)).toBe(false));
  });

  it("skips on any key", () => {
    renderWithLogo();
    fireEvent.keyDown(window, { key: "Escape" });
    expect(document.documentElement.hasAttribute(INTRO_ATTRIBUTE)).toBe(false);
  });

  it("leaves the page alone when the head script didn't ask for it", async () => {
    document.documentElement.removeAttribute(INTRO_ATTRIBUTE);
    renderWithLogo();
    await Promise.resolve();
    expect(window.localStorage.getItem(INTRO_STORAGE_KEY)).toBeNull();
  });
});
