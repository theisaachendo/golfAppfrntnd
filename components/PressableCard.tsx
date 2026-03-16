import * as Haptics from 'expo-haptics';
import { ReactNode } from 'react';
import { Platform, Pressable, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useColorScheme } from '@/components/useColorScheme';

import Colors, { DesignTokens } from '@/constants/Colors';

import { Text } from './Themed';

const springConfig = { damping: 15, stiffness: 400 };

type PressableCardProps = {
  title: string;
  description: string;
  icon?: ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
};

export function PressableCard({
  title,
  description,
  icon,
  onPress,
  style,
}: PressableCardProps) {
  const scale = useSharedValue(1);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

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
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress?.();
  };

  const cardBg = isDark ? Colors.dark.cardDark : Colors.light.cardLight;
  const borderColor = isDark ? Colors.dark.cardBorderDark : Colors.light.cardBorderLight;
  const shadowStyle = Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? DesignTokens.shadowOpacityDark : DesignTokens.shadowOpacity,
      shadowRadius: 12,
    },
    default: {
      elevation: 3,
    },
  });

  return (
    <Animated.View
      style={[
        styles.card,
        animatedStyle,
        { backgroundColor: cardBg, borderColor },
        shadowStyle,
        style,
      ]}
    >
      <Pressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={styles.pressable}
        accessibilityRole="button"
        accessibilityLabel={`${title}. ${description}`}
      >
        {icon != null ? <Animated.View style={styles.icon}>{icon}</Animated.View> : null}
        <Animated.View style={styles.textBlock}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.description} lightColor={Colors.light.textSecondary} darkColor={Colors.dark.textSecondaryDark}>
            {description}
          </Text>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: DesignTokens.radiusCard,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: DesignTokens.spacingCard,
  },
  pressable: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: DesignTokens.minTouchTarget + DesignTokens.spacingCard * 2,
    paddingVertical: DesignTokens.spacingCard,
    paddingHorizontal: DesignTokens.spacingSection,
  },
  icon: {
    marginRight: DesignTokens.spacingCard,
  },
  textBlock: {
    flex: 1,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 2,
  },
  description: {
    fontSize: 15,
  },
});

