export const getHeatmapColor = (score: number): string => {
  if (score < 0) score = 0;
  if (score > 100) score = 100;

  // Luminous "Nebula Glow" scale:
  // 0 = Soft Magenta
  // 50 = Bright Pink
  // 100 = Glowing Cyan
  
  const magenta = [216, 180, 254]; // #d8b4fe
  const pink = [244, 114, 182];    // #f472b6
  const cyan = [103, 232, 249];    // #67e8f9

  let r, g, b;

  if (score < 50) {
    // Interpolate between magenta and pink
    const t = score / 50.0;
    r = magenta[0] + t * (pink[0] - magenta[0]);
    g = magenta[1] + t * (pink[1] - magenta[1]);
    b = magenta[2] + t * (pink[2] - magenta[2]);
  } else {
    // Interpolate between pink and cyan
    const t = (score - 50) / 50.0;
    r = pink[0] + t * (cyan[0] - pink[0]);
    g = pink[1] + t * (cyan[1] - pink[1]);
    b = pink[2] + t * (cyan[2] - pink[2]);
  }
  
  return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
};