import { ReactNode } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';

import { FuturisticTheme, Radius, Shadow } from '@/constants/Colors';

type GlassCardProps = {
  children: ReactNode;
  style?: ViewStyle;
};

/**
 * Premium elevated surface card — solid charcoal with a hairline border and
 * a soft shadow for real depth (sportsbook/fintech look).
 */
export function GlassCard({ children, style }: GlassCardProps) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: FuturisticTheme.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: FuturisticTheme.border,
    padding: 18,
    ...Shadow.card,
  },
});
