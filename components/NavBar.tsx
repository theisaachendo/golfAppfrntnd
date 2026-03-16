import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Colors from '@/constants/Colors';
import { FuturisticTheme } from '@/constants/Colors';
import { useColorScheme } from './useColorScheme';
import { Text } from './Themed';

const NAV_HEIGHT = 56;

type NavBarProps = {
  title: string;
  showBack?: boolean;
  rightContent?: React.ReactNode;
  /** Use light text and futuristic dark bar (for dark backgrounds) */
  lightStyle?: boolean;
};

export function NavBar({ title, showBack, rightContent, lightStyle }: NavBarProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = lightStyle || colorScheme === 'dark';
  const borderColor = isDark ? FuturisticTheme.glassBorder : 'rgba(0,0,0,0.06)';

  // Futuristic dark bar: solid dark background so it matches and stays visible
  if (lightStyle) {
    return (
      <View
        style={[
          styles.bar,
          styles.futuristicBar,
          { paddingTop: insets.top, borderBottomColor: borderColor },
        ]}
      >
        <View style={styles.side}>
          {showBack ? (
            <Pressable
              onPress={() => router.back()}
              style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}
              hitSlop={12}
            >
              <Text style={[styles.backLabel, styles.textLight]}>← Back</Text>
            </Pressable>
          ) : null}
        </View>
        <Text style={[styles.title, styles.textLight]} numberOfLines={1}>
          {title}
        </Text>
        <View style={styles.side}>{rightContent ?? null}</View>
      </View>
    );
  }

  const BarWrapper = Platform.OS === 'ios' ? BlurView : View;
  const wrapperProps = Platform.OS === 'ios'
    ? { intensity: 60, tint: isDark ? 'dark' : ('light' as const) }
    : {};

  return (
    <BarWrapper
      style={[styles.bar, { paddingTop: insets.top, borderBottomColor: borderColor }]}
      {...wrapperProps}
    >
      <View style={styles.side}>
        {showBack ? (
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [styles.backBtn, pressed && styles.pressed]}
            hitSlop={12}
          >
            <Text style={styles.backLabel}>← Back</Text>
          </Pressable>
        ) : null}
      </View>
      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>
      <View style={styles.side}>{rightContent ?? null}</View>
    </BarWrapper>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: NAV_HEIGHT,
    paddingHorizontal: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
  },
  futuristicBar: {
    backgroundColor: FuturisticTheme.bgMid,
    borderBottomWidth: 1,
  },
  side: {
    minWidth: 72,
    alignItems: 'flex-start',
  },
  backBtn: {
    paddingVertical: 8,
    paddingRight: 8,
  },
  pressed: {
    opacity: 0.6,
  },
  backLabel: {
    fontSize: 16,
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  textLight: {
    color: '#FFFFFF',
  },
});
