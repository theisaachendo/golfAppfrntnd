import { useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import { FuturisticTheme } from '@/constants/Colors';

import { FuturisticScreen } from '@/components/FuturisticScreen';
import { GlassCard } from '@/components/GlassCard';

const MOCK_MATCHES = [
  { id: '1', date: 'Mar 14, 2025', result: 'Won', payout: '+$25', players: 3 },
  { id: '2', date: 'Mar 10, 2025', result: 'Lost', payout: '-$10', players: 4 },
  { id: '3', date: 'Mar 5, 2025', result: 'Won', payout: '+$15', players: 3 },
];

export default function MatchHistoryScreen() {
  const router = useRouter();

  return (
    <FuturisticScreen title="Match history" showBack>
      <Animated.View entering={FadeInDown.delay(100).springify().damping(18)}>
        <Text style={styles.label}>PAST GAMES</Text>
        <Text style={styles.hint}>Tap a match to view full results.</Text>
      </Animated.View>

      {MOCK_MATCHES.map((match, i) => (
        <Animated.View key={match.id} entering={FadeIn.delay(180 + i * 80)}>
          <Pressable
            onPress={() => router.push(`/result/${match.id}`)}
            style={({ pressed }) => [pressed && styles.rowPressed]}
          >
            <GlassCard style={styles.matchCard}>
              <View style={styles.matchRow}>
                <View style={styles.matchLeft}>
                  <Text style={styles.matchDate}>{match.date}</Text>
                  <Text style={styles.matchPlayers}>{match.players} players</Text>
                </View>
                <View style={styles.matchRight}>
                  <Text style={[styles.matchPayout, match.payout.startsWith('+') ? styles.payoutWin : styles.payoutLoss]}>
                    {match.payout}
                  </Text>
                  <Text style={styles.matchResult}>{match.result}</Text>
                </View>
                <SymbolView
                  name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }}
                  size={18}
                  tintColor={FuturisticTheme.textMuted}
                />
              </View>
            </GlassCard>
          </Pressable>
        </Animated.View>
      ))}
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
  matchCard: {
    marginBottom: 10,
  },
  matchRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  matchLeft: {
    flex: 1,
  },
  matchDate: {
    fontSize: 16,
    fontWeight: '600',
    color: FuturisticTheme.textPrimary,
  },
  matchPlayers: {
    fontSize: 14,
    color: FuturisticTheme.textMuted,
    marginTop: 2,
  },
  matchRight: {
    alignItems: 'flex-end',
    marginRight: 8,
  },
  matchPayout: {
    fontSize: 17,
    fontWeight: '700',
  },
  payoutWin: {
    color: FuturisticTheme.accent,
  },
  payoutLoss: {
    color: '#FF5252',
  },
  matchResult: {
    fontSize: 13,
    color: FuturisticTheme.textMuted,
    marginTop: 2,
  },
  rowPressed: {
    opacity: 0.8,
  },
});
