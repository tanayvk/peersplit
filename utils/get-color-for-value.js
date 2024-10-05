export const getColorForValue = (val) => {
  if (val > 0) return "color-positive";
  if (val < 0) return "color-negative";
  return "color-neutral";
};
