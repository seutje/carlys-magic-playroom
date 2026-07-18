export type BasicColor = "red" | "blue" | "yellow";

export const BASIC_COLORS = ["red", "blue", "yellow"] as const satisfies readonly BasicColor[];

export const COLOR_HEX: Readonly<Record<BasicColor, string>> = {
  red: "#e95f63",
  blue: "#4f8fc5",
  yellow: "#f2c94c",
};
