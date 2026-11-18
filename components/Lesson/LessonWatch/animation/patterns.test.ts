import { describe, expect, it } from "vitest";
import { CONFIG, PATTERNS } from "./patterns";

// The on-screen headlines live here, apart from the transcripts in content/patterns.json.
// These checks stop the two from drifting apart. Sliding Window has its own standalone video.
const withHeadlines = PATTERNS.filter((pattern) => pattern.status === "live" && pattern.slug !== "sliding-window");
const plain = (headline: string) => headline.replaceAll("*", "");

describe("video headlines", () => {
  it("every live video has four headlines and four transcript beats", () => {
    for (const pattern of withHeadlines) {
      expect(CONFIG[pattern.slug]?.headlines, pattern.slug).toHaveLength(4);
      expect(pattern.video.transcript, pattern.slug).toHaveLength(4);
    }
  });

  it("a cost in a headline is the lesson's time or space cost", () => {
    for (const pattern of withHeadlines) {
      for (const headline of CONFIG[pattern.slug].headlines) {
        for (const cost of plain(headline).match(/O\([^)]*\)/g) ?? []) {
          expect([pattern.complexity, pattern.space], `${pattern.slug}: ${headline}`).toContain(cost);
        }
      }
    }
  });

  it("an example number in a headline is said in the same beat", () => {
    for (const pattern of withHeadlines) {
      CONFIG[pattern.slug].headlines.forEach((headline, beat) => {
        // Highlighted numbers (*9*) and long ones (172) are example values; "1 bits" is not.
        const numbers = [...headline.matchAll(/\*(\d+)\*|(?<![\w(])(\d{2,})(?![\w)])/g)].map((m) => m[1] ?? m[2]);
        const said = pattern.video.transcript[beat].text;
        for (const number of numbers) {
          expect(said, `${pattern.slug} beat ${beat + 1}: ${headline}`).toMatch(new RegExp(`(?<!\\d)${number}(?!\\d)`));
        }
      });
    }
  });
});
