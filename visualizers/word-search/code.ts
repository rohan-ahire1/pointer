export const code: string[] = [
  "function exist(board: string[][], word: string): boolean {", // 0
  "  const dfs = (r: number, c: number, i: number): boolean => {", // 1
  "    if (i === word.length) return true;", // 2
  "    if (board[r]?.[c] !== word[i]) return false;", // 3
  "    const saved = board[r][c];", // 4
  "    board[r][c] = \"#\";", // 5
  "    const found = dfs(r + 1, c, i + 1) || dfs(r - 1, c, i + 1)", // 6
  "      || dfs(r, c + 1, i + 1) || dfs(r, c - 1, i + 1);", // 7
  "    board[r][c] = saved;", // 8
  "    return found;", // 9
  "  };", // 10
  "  for (let r = 0; r < board.length; r++) {", // 11
  "    for (let c = 0; c < board[0].length; c++) {", // 12
  "      if (dfs(r, c, 0)) return true;", // 13
  "    }", // 14
  "  }", // 15
  "  return false;", // 16
  "}", // 17
];
