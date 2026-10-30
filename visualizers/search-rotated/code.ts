export const code: string[] = [
  "function search(nums: number[], target: number): number {", // 0
  "  let lo = 0, hi = nums.length - 1;", // 1
  "  while (lo <= hi) {", // 2
  "    const mid = Math.floor((lo + hi) / 2);", // 3
  "    if (nums[mid] === target) return mid;", // 4
  "    if (nums[lo] <= nums[mid]) { // left half is in order", // 5
  "      if (nums[lo] <= target && target < nums[mid]) hi = mid - 1;", // 6
  "      else lo = mid + 1;", // 7
  "    } else { // right half is in order", // 8
  "      if (nums[mid] < target && target <= nums[hi]) lo = mid + 1;", // 9
  "      else hi = mid - 1;", // 10
  "    }", // 11
  "  }", // 12
  "  return -1;", // 13
  "}", // 14
];
