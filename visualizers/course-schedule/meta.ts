export const meta = {
  id: "course-schedule",
  title: "Course Schedule",
  presets: ["4 | 0>1 0>2 1>3 2>3", "2 | 0>1 1>0", "5 | 0>1 1>2 3>4"],
  inputLabel: "n | links =",
  inputHint: "2–6 courses, then | and links like 0>1 (take 0 before 1). Up to 9.",
  inputMaxLength: 50,
} as const;
