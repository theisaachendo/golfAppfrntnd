import { useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import { FuturisticTheme } from '@/constants/Colors';
import { ApiError } from '@/lib/api';
import { getMyGames, type MatchHistoryItem } from '@/lib/users-api';

import { FuturisticScreen } from '@/components/FuturisticScreen';
import { GlassCard } from '@/components/GlassCard';

function formatDate(dateStr: string) {
  try {
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? dateStr : d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

function formatPayout(payout: number) {
  const sign = payout >= 0 ? '+' : '';
  return `${sign}$${payout}`;
}

export default function MatchHistoryScreen() {
  const router = useRouter();
  const [matches, setMatches] = useState<MatchHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadHistory = useCallback(async () => {
    try {
      const data = await getMyGames();
      setMatches(data);
      setError(null);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Failed to load history');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  return (
    <FuturisticScreen title="Match history" showBack>
      <Animated.View entering={FadeInDown.delay(40).duration(200)}>
        <Text style={styles.label}>PAST GAMES</Text>
        <Text style={styles.hint}>Tap a match to view full results.</Text>
      </Animated.View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={FuturisticTheme.accent} />
          <Text style={styles.loadingText}>Loading…</Text>
        </View>
      ) : error && matches.length === 0 ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : (
        matches.map((match, i) => (
          <Animated.View key={match.id} entering={FadeIn.delay(180 + i * 80)}>
            <Pressable
              onPress={() => router.push(`/result/${match.id}`)}
              style={({ pressed }) => [pressed && styles.rowPressed]}
            >
              <GlassCard style={styles.matchCard}>
                <View style={styles.matchRow}>
                  <View style={styles.matchLeft}>
                    <Text style={styles.matchDate}>
                      {formatDate(match.completedAt ?? match.date)}
                    </Text>
                    <Text style={styles.matchPlayers}>{match.playerCount} players</Text>
                  </View>
                  <View style={styles.matchRight}>
                    <Text
                      style={[
                        styles.matchPayout,
                        match.payout >= 0 ? styles.payoutWin : styles.payoutLoss,
                      ]}
                    >
                      {formatPayout(match.payout)}
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
        ))
      )}
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
  centered: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: FuturisticTheme.textSecondary,
  },
  errorText: {
    fontSize: 15,
    color: '#FF5252',
    marginTop: 12,
  },
});
