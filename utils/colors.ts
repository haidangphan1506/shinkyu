export interface Rgb {
  r: number;
  g: number;
  b: number;
}

/** Parses `#rgb` or `#rrggbb`. Returns null for anything else. */
export function hexToRgb(hex: string): Rgb | null {
  const match = /^#?([\da-f]{3}|[\da-f]{6})$/i.exec(hex.trim());
  if (!match) return null;
  const digits = match[1].length === 3 ? [...match[1]].map((c) => c + c).join('') : match[1];
  const value = Number.parseInt(digits, 16);
  return { r: (value >> 16) & 255, g: (value >> 8) & 255, b: value & 255 };
}

export function withAlpha(hex: string, alpha: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  const a = Math.min(1, Math.max(0, alpha));
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${a})`;
}

/** Black or white, whichever reads better on `background` (WCAG relative luminance). */
export function getContrastText(background: string): '#000000' | '#ffffff' {
  const rgb = hexToRgb(background);
  if (!rgb) return '#000000';
  const [r, g, b] = [rgb.r, rgb.g, rgb.b].map((channel) => {
    const c = channel / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return luminance > 0.179 ? '#000000' : '#ffffff';
}
