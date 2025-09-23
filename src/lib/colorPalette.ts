/**
 * Aether Art Space Color Palette Configuration
 *
 * This file provides a centralized way to manage the website's color palette.
 * Admin users can easily update colors by modifying the HEX values below.
 *
 * The system automatically converts HEX to HSL and applies the colors throughout the site.
 */

export interface ColorPalette {
  white: string;
  lightBlue: string;
  mediumBlue: string;
  darkNavy: string;
}

// Minimal 2-color palette - dark blue (close to black) and white only
export const defaultPalette: ColorPalette = {
  white: "#FFFFFF", // Pure white - for text on dark backgrounds and light elements
  lightBlue: "#1A1A2E", // Dark blue (close to black) - for backgrounds and dark text
  mediumBlue: "#1A1A2E", // Same dark blue - for consistency
  darkNavy: "#1A1A2E", // Same dark blue - for backgrounds and dark text
};

/**
 * Convert HEX color to HSL format
 * @param hex - HEX color string (e.g., "#3F72AF")
 * @returns HSL string (e.g., "220 47% 47%")
 */
export function hexToHsl(hex: string): string {
  // Remove # if present
  hex = hex.replace("#", "");

  // Parse RGB values
  const r = parseInt(hex.substr(0, 2), 16) / 255;
  const g = parseInt(hex.substr(2, 2), 16) / 255;
  const b = parseInt(hex.substr(4, 2), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h: number, s: number;
  const l = (max + min) / 2;

  if (max === min) {
    h = s = 0; // achromatic
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
      default:
        h = 0;
    }
    h /= 6;
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(
    l * 100
  )}%`;
}

/**
 * Apply color palette to CSS custom properties
 * @param palette - Color palette object
 */
export function applyColorPalette(palette: ColorPalette): void {
  const root = document.documentElement;

  root.style.setProperty("--palette-white", hexToHsl(palette.white));
  root.style.setProperty("--palette-light-blue", hexToHsl(palette.lightBlue));
  root.style.setProperty("--palette-medium-blue", hexToHsl(palette.mediumBlue));
  root.style.setProperty("--palette-dark-navy", hexToHsl(palette.darkNavy));
}

/**
 * Get current color palette from CSS custom properties
 * @returns Current color palette
 */
export function getCurrentPalette(): ColorPalette {
  const root = document.documentElement;
  const computedStyle = getComputedStyle(root);

  return {
    white: computedStyle.getPropertyValue("--palette-white").trim(),
    lightBlue: computedStyle.getPropertyValue("--palette-light-blue").trim(),
    mediumBlue: computedStyle.getPropertyValue("--palette-medium-blue").trim(),
    darkNavy: computedStyle.getPropertyValue("--palette-dark-navy").trim(),
  };
}

/**
 * Initialize the color palette on app startup
 */
export function initializeColorPalette(): void {
  // Apply default palette on startup
  applyColorPalette(defaultPalette);

  // In a real app, you would load the palette from your database/API here
  // Example:
  // loadPaletteFromDatabase().then(applyColorPalette);
}

// Export for easy admin panel integration
export const colorPaletteUtils = {
  applyColorPalette,
  getCurrentPalette,
  hexToHsl,
  defaultPalette,
};
