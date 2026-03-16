import { useRouter, useLocalSearchParams } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { FuturisticTheme } from '@/constants/Colors';

import { FuturisticScreen } from '@/components/FuturisticScreen';
import { GlassCard } from '@/components/GlassCard';

const MOCK_HOLES = Array.from({ length: 9 }, (_, i) => ({ hole: i + 1, par: 4, winner: i % 3 === 0 ? 'You' : null }));
const MOCK_LEADERBOARD = [
  { name: 'You', skins: 3, total: 15 },
  { name: 'Alex', skins: 2, total: 12 },
  { name: 'Jordan', skins: 1, total: 9 },
];

export default function ActiveMatchScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const handleEndGame = () => {
    router.replace(`/result/${id || '1'}`);
  };

  return (
    <FuturisticScreen title="Active match" showBack scroll>
      <Animated.View entering={FadeInDown.delay(100).springify().damping(18)}>
        <Text style={styles.label}>HOLE 5 OF 9</Text>
        <Text style={styles.hint}>Tap a hole to record scores.</Text>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(180).springify().damping(18)}>
        <GlassCard style={styles.section}>
          <Text style={styles.sectionTitle}>Leaderboard</Text>
          {MOCK_LEADERBOARD.map((row, i) => (
            <View key={row.name} style={styles.leaderRow}>
              <Text style={styles.leaderPos}>{i + 1}</Text>
              <Text style={styles.leaderName}>{row.name}</Text>
              <Text style={styles.leaderSkins}>{row.skins} skins</Text>
              <Text style={styles.leaderTotal}>${row.total}</Text>
            </View>
          ))}
        </GlassCard>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(260).springify().damping(18)}>
        <Text style={styles.sectionTitle}>Holes</Text>
        {MOCK_HOLES.map((h) => (
          <GlassCard key={h.hole} style={styles.holeCard}>
            <View style={styles.holeLeft}>
              <Text style={styles.holeNumber}>Hole {h.hole}</Text>
              <Text style={styles.holePar}>Par {h.par}</Text>
            </View>
            <Text style={styles.holeWinner}>{h.winner || '—'}</Text>
          </GlassCard>
        ))}
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(340).springify().damping(18)} style={styles.actions}>
        <Pressable
          onPress={handleEndGame}
          style={({ pressed }) => [styles.endButton, pressed && styles.primaryButtonPressed]}
        >
          <Text style={styles.endButtonText}>End game & see results</Text>
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
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: FuturisticTheme.textMuted,
    marginBottom: 14,
  },
  leaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: FuturisticTheme.glassBorder,
  },
  leaderPos: {
    width: 24,
    fontSize: 15,
    fontWeight: '800',
    color: FuturisticTheme.accent,
  },
  leaderName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: FuturisticTheme.textPrimary,
  },
  leaderSkins: {
    fontSize: 14,
    color: FuturisticTheme.textSecondary,
    marginRight: 12,
  },
  leaderTotal: {
    fontSize: 16,
    fontWeight: '700',
    color: FuturisticTheme.accent,
  },
  holeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  holeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  holeNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: FuturisticTheme.textPrimary,
  },
  holePar: {
    fontSize: 14,
    color: FuturisticTheme.textMuted,
  },
  holeWinner: {
    fontSize: 15,
    fontWeight: '600',
    color: FuturisticTheme.accent,
  },
  actions: {
    marginTop: 24,
  },
  endButton: {
    backgroundColor: FuturisticTheme.accentTeal,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  endButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: FuturisticTheme.bgDeep,
  },
  primaryButtonPressed: {
    opacity: 0.9,
  },
});
