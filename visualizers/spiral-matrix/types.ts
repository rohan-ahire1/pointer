export type SpiralInput = number[][];

export type Side = "top" | "right" | "bottom" | "left";

export type SpiralState = {
  grid: number[][];
  top: number;
  bottom: number;
  left: number;
  right: number;
  /** Cells read so far, in order, as [row, col]. */
  read: [number, number][];
  current: [number, number] | null;
  side: Side | null;
  phase: "setup" | "read" | "wall" | "skip" | "done";
};
