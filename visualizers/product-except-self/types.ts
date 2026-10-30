export type ProductInput = number[];

export type ProductState = {
  nums: number[];
  out: number[];
  i: number;
  left: number;
  right: number;
  phase: "setup" | "left" | "right" | "done";
};
