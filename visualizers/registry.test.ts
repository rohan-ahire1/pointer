import { describe, expect, it } from "vitest";
import { getPatterns, getProblems } from "@/content";
import { getVisualizer, visualizers } from "./index";

const patterns = getPatterns();
const problems = getProblems();

describe("visualizer registry", () => {
  it("has every visualizer a lesson asks for", () => {
    for (const pattern of patterns) {
      if (pattern.status !== "live") continue;
      for (const id of [pattern.visualizer, ...(pattern.moreVisualizers ?? [])]) {
        expect(getVisualizer(id), `${pattern.slug}: ${id}`).toBeDefined();
      }
    }
  });

  it("only links a problem to a visualizer its lesson shows", () => {
    for (const problem of problems) {
      if (!problem.visualizer) continue;
      const pattern = patterns.find((p) => p.slug === problem.pattern);
      expect(pattern?.status, problem.slug).toBe("live");
      if (pattern?.status !== "live") continue;
      expect([pattern.visualizer, ...(pattern.moreVisualizers ?? [])], problem.slug).toContain(problem.visualizer);
    }
  });

  it("gives every visualizer a Python version that lines up", () => {
    for (const visualizer of Object.values(visualizers)) {
      const { python, code, id } = visualizer;
      expect(python, id).toBeDefined();
      if (!python) continue;
      expect(python.lines.length, id).toBe(code.length);
      for (const line of python.lines) {
        expect(line, id).toBeGreaterThanOrEqual(-1);
        expect(line, id).toBeLessThan(python.code.length);
      }
    }
  });

  it("highlights something in Python on every preset step", () => {
    for (const visualizer of Object.values(visualizers)) {
      const { python, id } = visualizer;
      if (!python) continue;
      for (const preset of visualizer.presets) {
        const input = visualizer.parseInput(preset);
        expect(input, `${id}: ${preset}`).not.toHaveProperty("error");
        visualizer.trace(input as never).forEach((step, index) => {
          const mapped = step.lines.map((line) => python.lines[line]).filter((line) => line >= 0);
          expect(mapped.length, `${id} "${preset}" step ${index}`).toBeGreaterThan(0);
        });
      }
    }
  });
});
