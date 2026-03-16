import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { ReactNode } from 'react';
import { Platform, Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { FuturisticTheme } from '@/constants/Colors';

const springConfig = { damping: 18, stiffness: 400 };

type GradientActionCardProps = {
  title: string;
  subtitle: string;
  icon: ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
};

export function GradientActionCard({
  title,
  subtitle,
  icon,
  onPress,
  style,
}: GradientActionCardProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.97, springConfig);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, springConfig);
  };

  const handlePress = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    onPress?.();
  };

  return (
    <Animated.View style={[styles.outer, animatedStyle, style]}>
      <Pressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={styles.pressable}
        accessibilityRole="button"
        accessibilityLabel={`${title}. ${subtitle}`}
      >
        <LinearGradient
          colors={[...FuturisticTheme.gradientCta]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientBorder}
        >
          <LinearGradient
            colors={[FuturisticTheme.bgMid, FuturisticTheme.bgDeep]}
            style={styles.inner}
          >
            <Animated.View style={styles.iconWrap}>{icon}</Animated.View>
            <Animated.View style={styles.textBlock}>
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.subtitle}>{subtitle}</Text>
            </Animated.View>
          </LinearGradient>
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  outer: {
    borderRadius: 24,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: FuturisticTheme.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  pressable: {
    minHeight: 88,
  },
  gradientBorder: {
    padding: 2,
    borderRadius: 24,
  },
  inner: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderRadius: 22,
  },
  iconWrap: {
    marginRight: 20,
  },
  textBlock: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: FuturisticTheme.textPrimary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    color: FuturisticTheme.textSecondary,
  },
});
