export const meta = {
  id: "network-delay-time",
  title: "Network Delay Time",
  shortTitle: "Dijkstra",
  presets: ["5 | 0>1:1 1>2:2 0>2:4 2>3:1 3>4:3 2>4:7", "4 | 0>1:5 0>2:1 2>1:1 1>3:1", "4 | 0>1:2 1>0:2 2>3:1"],
  inputLabel: "n | roads =",
  inputHint: "2–6 nodes, then | and roads like 0>1:4 (0 to 1 takes 4). Up to 10. Starts at node 0.",
  inputMaxLength: 70,
} as const;
