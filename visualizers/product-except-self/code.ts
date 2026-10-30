export const code: string[] = [
  "function productExceptSelf(nums: number[]): number[] {", // 0
  "  const out = new Array(nums.length).fill(1);", // 1
  "  let left = 1;", // 2
  "  for (let i = 0; i < nums.length; i++) {", // 3
  "    out[i] = left;", // 4
  "    left *= nums[i];", // 5
  "  }", // 6
  "  let right = 1;", // 7
  "  for (let i = nums.length - 1; i >= 0; i--) {", // 8
  "    out[i] *= right;", // 9
  "    right *= nums[i];", // 10
  "  }", // 11
  "  return out;", // 12
  "}", // 13
];
