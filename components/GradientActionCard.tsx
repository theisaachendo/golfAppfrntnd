import * as Haptics from 'expo-haptics';
import { SymbolView } from 'expo-symbols';
import { ReactNode } from 'react';
import { Platform, Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { FuturisticTheme, Radius, Shadow } from '@/constants/Colors';

const springConfig = { damping: 18, stiffness: 400 };

type GradientActionCardProps = {
  title: string;
  subtitle: string;
  icon: ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  /** Primary call-to-action gets the filled accent treatment. */
  primary?: boolean;
};

export function GradientActionCard({
  title,
  subtitle,
  icon,
  onPress,
  style,
  primary,
}: GradientActionCardProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98, springConfig);
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
    <Animated.View style={[styles.outer, primary && Shadow.accent, animatedStyle, style]}>
      <Pressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[styles.card, primary ? styles.cardPrimary : styles.cardDefault]}
        accessibilityRole="button"
        accessibilityLabel={`${title}. ${subtitle}`}
      >
        <View style={[styles.iconTile, primary ? styles.iconTilePrimary : styles.iconTileDefault]}>
          {icon}
        </View>
        <View style={styles.textBlock}>
          <Text style={[styles.title, primary && styles.titlePrimary]}>{title}</Text>
          <Text style={[styles.subtitle, primary && styles.subtitlePrimary]}>{subtitle}</Text>
        </View>
        <SymbolView
          name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }}
          size={18}
          tintColor={primary ? 'rgba(10,12,16,0.55)' : FuturisticTheme.textMuted}
        />
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  outer: {
    borderRadius: Radius.lg,
    marginBottom: 14,
    ...Shadow.card,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 18,
    borderRadius: Radius.lg,
    borderWidth: 1,
  },
  cardDefault: {
    backgroundColor: FuturisticTheme.surface,
    borderColor: FuturisticTheme.border,
  },
  cardPrimary: {
    backgroundColor: FuturisticTheme.accent,
    borderColor: FuturisticTheme.accent,
  },
  iconTile: {
    width: 48,
    height: 48,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  iconTileDefault: {
    backgroundColor: FuturisticTheme.accentSoft,
  },
  iconTilePrimary: {
    backgroundColor: 'rgba(10,12,16,0.12)',
  },
  textBlock: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: FuturisticTheme.textPrimary,
    marginBottom: 3,
    letterSpacing: -0.2,
  },
  titlePrimary: {
    color: '#0A0C10',
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 19,
    color: FuturisticTheme.textSecondary,
  },
  subtitlePrimary: {
    color: 'rgba(10,12,16,0.65)',
  },
});
