import { describe, expect, it } from "vitest";
import { readSharedRun, sharedRunUrl } from "./share";

const PAGE = "https://pointer.rohanahire.com/patterns/two-pointers/?old=1#solve";

describe("share links", () => {
  it("round-trips a run, including characters a URL has to escape", () => {
    const url = new URL(sharedRunUrl(PAGE, "three-sum", "-1 0 1 | 2", 4));
    expect(url.pathname).toBe("/patterns/two-pointers/");
    expect(url.hash).toBe("#try");
    expect(readSharedRun(url.search, "three-sum")).toEqual({ input: "-1 0 1 | 2", stepIndex: 4 });
  });

  it("ignores a link meant for another visualizer", () => {
    expect(readSharedRun("?v=other&input=abc&step=3", "three-sum")).toBeNull();
  });

  it("needs an input", () => {
    expect(readSharedRun("?v=three-sum&step=3", "three-sum")).toBeNull();
    expect(readSharedRun("", "three-sum")).toBeNull();
  });

  it("treats a bad step as the first one", () => {
    expect(readSharedRun("?input=abc&step=lots", "x")).toEqual({ input: "abc", stepIndex: 0 });
    expect(readSharedRun("?input=abc&step=-2", "x")).toEqual({ input: "abc", stepIndex: 0 });
  });
});
