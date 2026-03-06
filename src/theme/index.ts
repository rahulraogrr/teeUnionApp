import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';

// ─── Colors extracted from TEE 1104 Union logo ───────────────────────────────
// Logo outer ring + emblem: Deep crimson red  → primary
// Logo text around ring:    Navy blue          → secondary
// Background:               Warm off-white

export const UnionColors = {
  // Reds (logo emblem / outer ring)
  red: '#C62828',
  redDark: '#8E0000',
  redLight: '#FF5F52',
  redContainer: '#FFCDD2',

  // Navies (logo text)
  navy: '#1A237E',
  navyDark: '#000051',
  navyLight: '#534BAE',
  navyContainer: '#C5CAE9',

  white: '#FFFFFF',
  background: '#FFF8F7',   // warm off-white, complements the red
};

export const AppLightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,

    // Primary — Union Red
    primary: UnionColors.red,
    onPrimary: UnionColors.white,
    primaryContainer: UnionColors.redContainer,
    onPrimaryContainer: UnionColors.redDark,

    // Secondary — Union Navy
    secondary: UnionColors.navy,
    onSecondary: UnionColors.white,
    secondaryContainer: UnionColors.navyContainer,
    onSecondaryContainer: UnionColors.navyDark,

    // Tertiary
    tertiary: UnionColors.navyLight,
    onTertiary: UnionColors.white,
    tertiaryContainer: UnionColors.navyContainer,

    // Surfaces
    background: UnionColors.background,
    onBackground: '#212121',
    surface: UnionColors.white,
    onSurface: '#212121',
    surfaceVariant: '#F5F5F5',
    onSurfaceVariant: '#757575',
    outline: '#BDBDBD',
    outlineVariant: '#E0E0E0',

    // Error
    error: '#B00020',
    onError: UnionColors.white,
  },
};

export const AppDarkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#EF9A9A',
    onPrimary: UnionColors.redDark,
    primaryContainer: UnionColors.red,
    onPrimaryContainer: UnionColors.redContainer,
    secondary: '#9FA8DA',
    onSecondary: UnionColors.navyDark,
    secondaryContainer: UnionColors.navy,
    onSecondaryContainer: UnionColors.navyContainer,
    background: '#121212',
    onBackground: '#E6E1E5',
    surface: '#1E1E1E',
    onSurface: '#E6E1E5',
    surfaceVariant: '#2C2C2C',
    onSurfaceVariant: '#AEAAAE',
  },
};

export type AppTheme = typeof AppLightTheme;
