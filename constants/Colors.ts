const tintColorLight = '#0D5C2E';
const tintColorDark = '#2E7D4A';

// iOS-style design tokens (HIG-friendly)
export const DesignTokens = {
  // Golf / primary
  primary: '#0D5C2E',
  primaryLight: '#2E7D4A',
  primaryMuted: 'rgba(13, 92, 46, 0.12)',
  // Surfaces
  cardLight: '#FFFFFF',
  cardDark: 'rgba(255, 255, 255, 0.08)',
  cardBorderLight: 'rgba(0, 0, 0, 0.06)',
  cardBorderDark: 'rgba(255, 255, 255, 0.08)',
  // Text hierarchy
  textSecondary: 'rgba(0, 0, 0, 0.6)',
  textSecondaryDark: 'rgba(255, 255, 255, 0.7)',
  // iOS shadows (opacity)
  shadowOpacity: 0.08,
  shadowOpacityDark: 0.3,
  // Radius (HIG: generous rounding)
  radiusCard: 16,
  radiusButton: 14,
  radiusSmall: 12,
  // Spacing
  spacingScreen: 20,
  spacingSection: 24,
  spacingCard: 16,
  minTouchTarget: 44,
} as const;

// Premium dark theme — sportsbook / fintech feel (DraftKings / Robinhood / Whoop).
// Charcoal surfaces, one confident accent, crisp type, real depth.
export const FuturisticTheme = {
  // Backgrounds (near-black charcoal, layered)
  bgDeep: '#0A0C10',
  bgMid: '#0E1116',
  bgCard: '#161A21', // solid elevated surface (was translucent glass)
  bgCardHover: '#1C212A',
  surface: '#161A21',
  surfaceElevated: '#1C212A',
  // Accent — single confident electric green (refined, not neon)
  accent: '#1ED77B',
  accentPressed: '#17B768',
  accentSoft: 'rgba(30, 215, 123, 0.14)',
  accentDim: 'rgba(30, 215, 123, 0.14)',
  // Secondary highlight (used sparingly)
  accentTeal: '#2DD4BF',
  accentBlue: '#5B9DFF',
  // Status
  danger: '#FF5C5C',
  // Gradients (for LinearGradient colors array)
  gradientStart: '#1ED77B',
  gradientMid: '#16B866',
  gradientEnd: '#0E9E5A',
  gradientHero: ['#0A0C10', '#0C1410', '#0A0C10'] as const,
  gradientCta: ['#1ED77B', '#16B866'] as const,
  // Borders / dividers
  glassBorder: 'rgba(255, 255, 255, 0.07)',
  glassHighlight: 'rgba(255, 255, 255, 0.03)',
  border: 'rgba(255, 255, 255, 0.07)',
  borderStrong: 'rgba(255, 255, 255, 0.12)',
  divider: 'rgba(255, 255, 255, 0.06)',
  // Text
  textPrimary: '#F4F6F8',
  textSecondary: '#98A2B3',
  textMuted: '#5E6672',
} as const;

// Shared elevation + scales for a consistent premium look.
export const Shadow = {
  card: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 18,
    elevation: 8,
  },
  accent: {
    shadowColor: '#1ED77B',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 18,
    elevation: 8,
  },
} as const;

export const Radius = { sm: 12, md: 16, lg: 20, xl: 24, pill: 999 } as const;

export default {
  light: {
    text: '#000',
    background: '#F2F2F7',
    tint: tintColorLight,
    tabIconDefault: '#8E8E93',
    tabIconSelected: tintColorLight,
    ...DesignTokens,
  },
  dark: {
    text: '#fff',
    background: '#000',
    tint: tintColorDark,
    tabIconDefault: '#8E8E93',
    tabIconSelected: tintColorDark,
    ...DesignTokens,
  },
};
