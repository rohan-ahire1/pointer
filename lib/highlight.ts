import type { CodeLang } from "@/lib/code-lang";

export type TokenKind = "comment" | "string" | "number" | "keyword" | "function";

/** A run of code. No `kind` means plain text, shown in the block's normal colour. */
export type CodeToken = { text: string; kind?: TokenKind };

const KEYWORDS: Record<CodeLang, Set<string>> = {
  ts: new Set(
    "break const continue else false for function if let new null number of return string true undefined while".split(" "),
  ),
  py: new Set("False None True and break class continue def elif else for if in lambda not or return while".split(" ")),
};

/** Comment, string, number, then any word. Python's `//` is division, so only `#` starts a comment there. */
const SYNTAX: Record<CodeLang, RegExp> = {
  ts: /(\/\/.*)|("[^"\n]*"|'[^'\n]*'|`[^`]*`)|\b(\d+)\b|\b[A-Za-z_]\w*\b/g,
  py: /(#.*)|("[^"\n]*"|'[^'\n]*')|\b(\d+)\b|\b[A-Za-z_]\w*\b/g,
};

/** Calls and capitalised names (types, classes) share a colour. */
function wordKind(word: string, next: string | undefined, lang: CodeLang): TokenKind | undefined {
  if (KEYWORDS[lang].has(word)) return "keyword";
  if (next === "(" || /^[A-Z]/.test(word)) return "function";
  return undefined;
}

/**
 * Splits a template into coloured runs. The templates are short and written by
 * hand in two languages, so this small scanner is enough, and the site doesn't
 * need a full highlighter's download. Joining every `text` gives `code` back.
 */
export function tokenize(code: string, lang: CodeLang): CodeToken[] {
  const tokens: CodeToken[] = [];
  let end = 0;
  for (const match of code.matchAll(SYNTAX[lang])) {
    const [text, comment, string, number] = match;
    if (match.index > end) tokens.push({ text: code.slice(end, match.index) });
    end = match.index + text.length;
    const kind = comment
      ? "comment"
      : string
        ? "string"
        : number
          ? "number"
          : wordKind(text, code[end], lang);
    tokens.push(kind ? { text, kind } : { text });
  }
  if (end < code.length) tokens.push({ text: code.slice(end) });
  return tokens;
}
