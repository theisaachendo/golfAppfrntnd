import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';

import { FuturisticTheme } from '@/constants/Colors';

type GradientBackgroundProps = {
  children: React.ReactNode;
};

export function GradientBackground({ children }: GradientBackgroundProps) {
  return (
    <View style={StyleSheet.absoluteFill}>
      <LinearGradient
        colors={[...FuturisticTheme.gradientHero]}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFill}
      />
      {children}
    </View>
  );
}
