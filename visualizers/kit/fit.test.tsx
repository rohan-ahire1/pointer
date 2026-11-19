import { readFileSync } from "node:fs";
import { join } from "node:path";
import { createElement } from "react";
import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { visualizers } from "../index";

describe("Fit rows", () => {
  it("lays loose cells out as a row, so a view can't stack them in one column", () => {
    const css = readFileSync(join(process.cwd(), "visualizers/kit/ViewRoot.module.css"), "utf8");
    const cells = css.slice(css.indexOf(".cells {"), css.indexOf("}", css.indexOf(".cells {")));
    expect(cells).toMatch(/display:\s*flex/);
  });

  it("gets one row, grid or chart wrapper in every view, never bare cells", () => {
    for (const visualizer of Object.values(visualizers)) {
      const input = visualizer.parseInput(visualizer.presets[0]);
      const steps = visualizer.trace(input as never);
      for (const index of [0, Math.floor(steps.length / 2), steps.length - 1]) {
        const { container, unmount } = render(createElement(visualizer.View, { step: steps[index], input }));
        container.querySelectorAll("[data-fit]").forEach((fit) => {
          expect(fit.children.length, `${visualizer.id} step ${index}`).toBe(1);
        });
        unmount();
      }
    }
  });
});
