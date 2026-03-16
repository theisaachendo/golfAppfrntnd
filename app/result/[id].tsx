import { useRouter, useLocalSearchParams } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import { FuturisticTheme } from '@/constants/Colors';

import { FuturisticScreen } from '@/components/FuturisticScreen';
import { GlassCard } from '@/components/GlassCard';

const MOCK_RESULTS = [
  { name: 'You', skins: 5, payout: 25 },
  { name: 'Alex', skins: 2, payout: -10 },
  { name: 'Jordan', skins: 2, payout: -15 },
];

export default function PostMatchScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const handleDone = () => {
    router.replace('/(tabs)');
  };

  return (
    <FuturisticScreen title="Match results" showBack>
      <Animated.View entering={FadeInDown.delay(100).springify().damping(18)}>
        <Text style={styles.label}>GAME COMPLETE</Text>
        <Text style={styles.hint}>Skins and payouts below.</Text>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(180).springify().damping(18)}>
        <GlassCard style={styles.winnerCard}>
          <SymbolView
            name={{ ios: 'trophy.fill', android: 'emoji_events', web: 'emoji_events' }}
            size={40}
            tintColor={FuturisticTheme.accent}
          />
          <Text style={styles.winnerLabel}>Winner</Text>
          <Text style={styles.winnerName}>You</Text>
          <Text style={styles.winnerPayout}>+$25</Text>
        </GlassCard>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(260).springify().damping(18)}>
        <Text style={styles.sectionTitle}>Final standings</Text>
        {MOCK_RESULTS.map((row, i) => (
          <Animated.View key={row.name} entering={FadeIn.delay(320 + i * 80)}>
            <GlassCard style={styles.resultRow}>
              <View style={styles.resultLeft}>
                <Text style={styles.resultPos}>{i + 1}</Text>
                <Text style={styles.resultName}>{row.name}</Text>
              </View>
              <Text style={styles.resultSkins}>{row.skins} skins</Text>
              <Text style={[styles.resultPayout, row.payout >= 0 ? styles.payoutWin : styles.payoutLoss]}>
                {row.payout >= 0 ? '+' : ''}${row.payout}
              </Text>
            </GlassCard>
          </Animated.View>
        ))}
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(560).springify().damping(18)} style={styles.actions}>
        <Pressable
          onPress={handleDone}
          style={({ pressed }) => [styles.primaryButton, pressed && styles.primaryButtonPressed]}
        >
          <Text style={styles.primaryButtonText}>Back to home</Text>
        </Pressable>
      </Animated.View>
    </FuturisticScreen>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 2,
    color: FuturisticTheme.accent,
    marginBottom: 6,
  },
  hint: {
    fontSize: 16,
    color: FuturisticTheme.textSecondary,
    marginBottom: 20,
  },
  winnerCard: {
    alignItems: 'center',
    marginBottom: 28,
    paddingVertical: 28,
  },
  winnerLabel: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1.5,
    color: FuturisticTheme.textMuted,
    marginTop: 12,
  },
  winnerName: {
    fontSize: 24,
    fontWeight: '800',
    color: FuturisticTheme.textPrimary,
    marginTop: 4,
  },
  winnerPayout: {
    fontSize: 28,
    fontWeight: '800',
    color: FuturisticTheme.accent,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: FuturisticTheme.textMuted,
    marginBottom: 12,
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  resultLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  resultPos: {
    width: 24,
    fontSize: 15,
    fontWeight: '800',
    color: FuturisticTheme.accent,
  },
  resultName: {
    fontSize: 16,
    fontWeight: '600',
    color: FuturisticTheme.textPrimary,
  },
  resultSkins: {
    fontSize: 14,
    color: FuturisticTheme.textSecondary,
    marginRight: 12,
  },
  resultPayout: {
    fontSize: 16,
    fontWeight: '700',
  },
  payoutWin: {
    color: FuturisticTheme.accent,
  },
  payoutLoss: {
    color: '#FF5252',
  },
  actions: {
    marginTop: 24,
  },
  primaryButton: {
    backgroundColor: FuturisticTheme.accent,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: FuturisticTheme.bgDeep,
  },
  primaryButtonPressed: {
    opacity: 0.9,
  },
});
