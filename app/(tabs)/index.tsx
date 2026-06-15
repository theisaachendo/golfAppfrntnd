import { useRouter, useFocusEffect } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
} from 'react-native-reanimated';

import { FuturisticTheme } from '@/constants/Colors';
import { getActiveGame } from '@/lib/users-api';

import { GradientActionCard } from '@/components/GradientActionCard';
import { GradientBackground } from '@/components/GradientBackground';
import { GlassCard } from '@/components/GlassCard';
import { NavBar } from '@/components/NavBar';

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const heroOpacity = useSharedValue(0);
  const heroTranslate = useSharedValue(20);
  const [activeGameId, setActiveGameId] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      getActiveGame()
        .then(({ game }) => setActiveGameId(game?.id ?? null))
        .catch(() => setActiveGameId(null));
    }, [])
  );

  useEffect(() => {
    heroOpacity.value = withDelay(100, withSpring(1, { damping: 20 }));
    heroTranslate.value = withDelay(100, withSpring(0, { damping: 20 }));
  }, []);

  const heroAnimatedStyle = useAnimatedStyle(() => ({
    opacity: heroOpacity.value,
    transform: [{ translateY: heroTranslate.value }],
  }));

  const hasActiveMatch = activeGameId != null;

  return (
    <Animated.View style={styles.container}>
      <StatusBar style="light" />
      <GradientBackground />
      <NavBar title="Golf Skins" lightStyle />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: 12, paddingBottom: insets.bottom + 32 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={[styles.hero, heroAnimatedStyle]}>
          <Text style={styles.heroLabel}>READY TO PLAY?</Text>
          <Text style={styles.heroTitle}>
            Skins,{'\n'}made simple.
          </Text>
          <Text style={styles.heroSubtitle}>
            {hasActiveMatch
              ? 'You have a game in progress. Resume to continue.'
              : 'Create or join a game in seconds. Track every hole and settle up after.'}
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).springify().damping(18)}>
          <GlassCard style={styles.strip}>
            <Animated.View style={styles.stripContent}>
              <SymbolView
                name={{ ios: 'flag.checkered', android: 'flag', web: 'flag' }}
                size={22}
                tintColor={FuturisticTheme.accent}
              />
              <Text style={styles.stripText}>Skins format — most holes won takes it</Text>
            </Animated.View>
          </GlassCard>
        </Animated.View>

        {hasActiveMatch ? (
          <Animated.View entering={FadeInDown.delay(320).springify().damping(18)}>
            <GradientActionCard
              primary
              title="Resume match"
              subtitle="Continue your game in progress."
              icon={
                <SymbolView
                  name={{ ios: 'play.fill', android: 'play_arrow', web: 'play_arrow' }}
                  size={24}
                  tintColor="#0A0C10"
                />
              }
              onPress={() => router.push(`/match/${activeGameId}`)}
            />
          </Animated.View>
        ) : (
          <>
            <Animated.View entering={FadeInDown.delay(320).springify().damping(18)}>
              <GradientActionCard
                primary
                title="New game"
                subtitle="Set stakes, invite players, start scoring."
                icon={
                  <SymbolView
                    name={{ ios: 'plus', android: 'add', web: 'add' }}
                    size={24}
                    tintColor="#0A0C10"
                  />
                }
                onPress={() => router.push('/create')}
              />
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(420).springify().damping(18)}>
              <GradientActionCard
                title="Join game"
                subtitle="Enter a code and get in the game."
                icon={
                  <SymbolView
                    name={{ ios: 'person.2.fill', android: 'group', web: 'group' }}
                    size={24}
                    tintColor={FuturisticTheme.accent}
                  />
                }
                onPress={() => router.push('/join')}
              />
            </Animated.View>
          </>
        )}

        <Animated.View entering={FadeIn.delay(520)} style={styles.howSection}>
          <Text style={styles.sectionTitle}>How it works</Text>
          <View style={styles.steps}>
            <Step number="1" label="Create or join a game" />
            <Step number="2" label="Set your skin value per hole" />
            <Step number="3" label="Win holes, win skins — live" />
          </View>
        </Animated.View>
      </ScrollView>
    </Animated.View>
  );
}

function Step({ number, label }: { number: string; label: string }) {
  return (
    <Animated.View style={styles.step} entering={FadeIn.delay(600)}>
      <View style={styles.stepBadge}>
        <Text style={styles.stepNumber}>{number}</Text>
      </View>
      <Text style={styles.stepLabel}>{label}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  hero: {
    marginBottom: 28,
    marginTop: 8,
  },
  heroLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2.4,
    color: FuturisticTheme.accent,
    marginBottom: 10,
  },
  heroTitle: {
    fontSize: 40,
    fontWeight: '800',
    lineHeight: 44,
    color: FuturisticTheme.textPrimary,
    letterSpacing: -1,
    marginBottom: 12,
  },
  heroSubtitle: {
    fontSize: 16,
    lineHeight: 22,
    color: FuturisticTheme.textSecondary,
  },
  strip: {
    marginBottom: 24,
  },
  stripContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stripText: {
    fontSize: 15,
    fontWeight: '600',
    color: FuturisticTheme.textPrimary,
    flex: 1,
  },
  howSection: {
    marginTop: 16,
    paddingTop: 28,
    borderTopWidth: 1,
    borderTopColor: FuturisticTheme.glassBorder,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.5,
    color: FuturisticTheme.textMuted,
    marginBottom: 16,
  },
  steps: {
    gap: 14,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: FuturisticTheme.accentDim,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  stepNumber: {
    fontSize: 13,
    fontWeight: '800',
    color: FuturisticTheme.accent,
  },
  stepLabel: {
    fontSize: 16,
    color: FuturisticTheme.textSecondary,
    flex: 1,
  },
});
