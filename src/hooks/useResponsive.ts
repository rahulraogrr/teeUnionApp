import { useWindowDimensions } from 'react-native';

/**
 * Returns responsive helpers based on current window dimensions.
 * isTablet  → width >= 768 (iPad, large Android tablets)
 * isLandscape → width > height
 * contentWidth → max content width (capped at 720 on tablet, full width on phone)
 * hPad → horizontal padding (wider on tablet)
 */
export function useResponsive() {
  const { width, height } = useWindowDimensions();
  const isTablet = width >= 768;
  const isLandscape = width > height;
  // Use 92% of screen width on tablet (wide feel), cap at 1200 for very large displays
  const contentWidth = isTablet ? Math.min(Math.floor(width * 0.92), 1200) : width;
  const hPad = isTablet ? 28 : 16;
  // 2-column cards when we have enough room (tablet portrait ≥ 768, always on landscape)
  const twoColCards = isTablet;
  return { isTablet, isLandscape, contentWidth, hPad, twoColCards, width, height };
}
