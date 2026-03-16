import { BlurView } from 'expo-blur';
import { ReactNode } from 'react';
import { Platform, StyleSheet, View, ViewStyle } from 'react-native';

import { FuturisticTheme } from '@/constants/Colors';

type GlassCardProps = {
  children: ReactNode;
  style?: ViewStyle;
};

export function GlassCard({ children, style }: GlassCardProps) {
  if (Platform.OS === 'ios') {
    return (
      <View style={[styles.wrapper, style]}>
        <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
        <View style={styles.border}>
          <View style={styles.inner}>{children}</View>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.wrapper, styles.androidGlass, style]}>
      <View style={styles.border}>
        <View style={styles.inner}>{children}</View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: FuturisticTheme.glassBorder,
  },
  androidGlass: {
    backgroundColor: FuturisticTheme.bgCard,
  },
  border: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: FuturisticTheme.glassBorder,
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  inner: {
    padding: 20,
  },
});
