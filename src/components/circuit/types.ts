export type PlacedPart = {
  id: string;
  type: string;
  x: number;
  y: number;
  rotation: number;
  props: Record<string, string>;
};

export type WireEnd = { partId: string; pinId: string };

export type Wire = {
  id: string;
  from: WireEnd;
  to: WireEnd;
  color: string;
};

export type Design = {
  name: string;
  parts: PlacedPart[];
  wires: Wire[];
};

export const WIRE_COLORS = [
  "#f5a524",
  "#ff5d5d",
  "#4dd6c1",
  "#6aa9ff",
  "#8bd450",
  "#e7e7e7",
  "#1f2933",
];

export const emptyDesign = (): Design => ({ name: "Untitled circuit", parts: [], wires: [] });
