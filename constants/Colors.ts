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

// Modern futuristic golf theme (dark-first, premium HUD feel)
export const FuturisticTheme = {
  // Backgrounds
  bgDeep: '#0A0E14',
  bgMid: '#0F1419',
  bgCard: 'rgba(255, 255, 255, 0.06)',
  bgCardHover: 'rgba(255, 255, 255, 0.09)',
  // Accents (electric green / teal)
  accent: '#00E676',
  accentDim: 'rgba(0, 230, 118, 0.4)',
  accentTeal: '#00BFA5',
  accentBlue: '#00B8D4',
  // Gradients (for LinearGradient colors array)
  gradientStart: '#0D5C2E',
  gradientMid: '#00E676',
  gradientEnd: '#00BFA5',
  gradientHero: ['#0A0E14', '#0D1F17', '#0A0E14'] as const,
  gradientCta: ['#00E676', '#00BFA5'] as const,
  // Glass
  glassBorder: 'rgba(255, 255, 255, 0.12)',
  glassHighlight: 'rgba(255, 255, 255, 0.04)',
  // Text
  textPrimary: '#FFFFFF',
  textSecondary: 'rgba(255, 255, 255, 0.7)',
  textMuted: 'rgba(255, 255, 255, 0.5)',
} as const;

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
