import { describe, expect, it } from "vitest";
import { PATTERN_GUIDES } from "@/content/guides";
import { tokenize, type TokenKind } from "./highlight";

function kindOf(code: string, lang: "ts" | "py", text: string): TokenKind | undefined {
  return tokenize(code, lang).find((token) => token.text === text)?.kind;
}

describe("tokenize", () => {
  it("gives back every template exactly, so nothing shown differs from what Copy copies", () => {
    for (const { template } of Object.values(PATTERN_GUIDES)) {
      expect(tokenize(template.ts, "ts").map((token) => token.text).join("")).toBe(template.ts);
      expect(tokenize(template.py, "py").map((token) => token.text).join("")).toBe(template.py);
    }
  });

  it("colours keywords, calls, types and numbers", () => {
    const code = "const seen = new Map<number, number>();\nvalid(0);";
    expect(kindOf(code, "ts", "const")).toBe("keyword");
    expect(kindOf(code, "ts", "seen")).toBeUndefined();
    expect(kindOf(code, "ts", "Map")).toBe("function");
    expect(kindOf(code, "ts", "valid")).toBe("function");
    expect(kindOf(code, "ts", "0")).toBe("number");
  });

  it("keeps a comment whole, even with an apostrophe or a keyword in it", () => {
    const comment = "// Store it so it can't match if it's here.";
    expect(tokenize(`${comment}\nlet x = 1;`, "ts")[0]).toEqual({ text: comment, kind: "comment" });
    const inline = "x = 1  # it's for now";
    expect(tokenize(inline, "py").at(-1)).toEqual({ text: "# it's for now", kind: "comment" });
  });

  it("colours strings as one run", () => {
    expect(kindOf('x = "if 1"', "py", '"if 1"')).toBe("string");
    expect(kindOf("const y = `a`;", "ts", "`a`")).toBe("string");
  });

  it("reads // as division in Python and # as plain text in TypeScript", () => {
    expect(kindOf("mid = (lo + hi) // 2", "py", "2")).toBe("number");
    expect(tokenize("a #b", "ts").some((token) => token.kind === "comment")).toBe(false);
  });

  it("uses each language's own keywords", () => {
    expect(kindOf("True", "py", "True")).toBe("keyword");
    expect(kindOf("def f", "py", "def")).toBe("keyword");
    expect(kindOf("def f", "ts", "def")).toBeUndefined();
  });
});
