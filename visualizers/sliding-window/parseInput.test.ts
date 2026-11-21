import { describe, expect, it } from "vitest";
import { expectWellFormed, mustParse } from "../kit/test-helpers";
import { code } from "./code";
import { slidingWindowVisualizer } from "./index";
import { parseInput } from "./parseInput";
import { trace } from "./trace";

describe("parseInput", () => {
  it.each([
    ["abcabcbb", "abcabcbb"],
    ["ABCabc", "abcabc"],
    ["a b-c_1d!", "abcd"],
    ["abcdefghijklmno", "abcdefghij"],
  ])("%j -> %j", (raw, expected) => {
    expect(parseInput(raw)).toBe(expected);
  });

  it.each([[""], ["   "], ["123 !?"]])("%j -> error about lowercase letters", (raw) => {
    const result = parseInput(raw);
    expect(result).toEqual({ error: expect.stringMatching(/lowercase letter/i) });
  });
});

describe("sliding-window presets", () => {
  it.each(slidingWindowVisualizer.presets)("%s parses and traces cleanly", (preset) => {
    const parsed = mustParse(parseInput, preset);
    const steps = trace(parsed);
    // SWState has no `phase` field, so supply the setup/run/done phases the helper expects.
    const withPhase = steps.map((step, i) => ({
      ...step,
      state: { ...step.state, phase: i === 0 ? "setup" : i === steps.length - 1 ? "done" : "run" },
    }));
    expectWellFormed(withPhase, code);
  });
});
