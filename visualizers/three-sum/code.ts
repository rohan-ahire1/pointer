export const code: string[] = [
  "function threeSum(nums: number[]): number[][] {", // 0
  "  nums.sort((a, b) => a - b);", // 1
  "  const out: number[][] = [];", // 2
  "  for (let i = 0; i < nums.length - 2; i++) {", // 3
  "    if (i > 0 && nums[i] === nums[i - 1]) continue;", // 4
  "    let l = i + 1, r = nums.length - 1;", // 5
  "    while (l < r) {", // 6
  "      const sum = nums[i] + nums[l] + nums[r];", // 7
  "      if (sum < 0) l++;", // 8
  "      else if (sum > 0) r--;", // 9
  "      else {", // 10
  "        out.push([nums[i], nums[l], nums[r]]);", // 11
  "        l++; r--;", // 12
  "        while (l < r && nums[l] === nums[l - 1]) l++;", // 13
  "      }", // 14
  "    }", // 15
  "  }", // 16
  "  return out;", // 17
  "}", // 18
];
