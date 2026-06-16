import { useRouter, useLocalSearchParams } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import { FuturisticTheme } from '@/constants/Colors';
import { ApiError } from '@/lib/api';
import {
  getGameResults,
  getGameSettlements,
  markSettlementSettled,
  type ResultRow,
  type Settlement,
} from '@/lib/games-api';

import { FuturisticScreen } from '@/components/FuturisticScreen';
import { GlassCard } from '@/components/GlassCard';

export default function PostMatchScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [results, setResults] = useState<ResultRow[]>([]);
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadResults = useCallback(async () => {
    if (!id) return;
    try {
      const [data, settle] = await Promise.all([getGameResults(id), getGameSettlements(id)]);
      setResults(data);
      setSettlements(settle);
      setError(null);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Failed to load results');
    } finally {
      setLoading(false);
    }
  }, [id]);

  const toggleSettled = useCallback(async (s: Settlement) => {
    // optimistic
    setSettlements((prev) =>
      prev.map((x) => (x.id === s.id ? { ...x, settled: !x.settled } : x))
    );
    try {
      await markSettlementSettled(s.id, !s.settled);
    } catch {
      setSettlements((prev) =>
        prev.map((x) => (x.id === s.id ? { ...x, settled: s.settled } : x))
      );
    }
  }, []);

  useEffect(() => {
    loadResults();
  }, [loadResults]);

  const handleDone = () => {
    router.replace('/(tabs)');
  };

  if (loading) {
    return (
      <FuturisticScreen title="Match results" showBack>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={FuturisticTheme.accent} />
          <Text style={styles.loadingText}>Loading results…</Text>
        </View>
      </FuturisticScreen>
    );
  }

  if (error && results.length === 0) {
    return (
      <FuturisticScreen title="Match results" showBack>
        <Text style={styles.errorText}>{error}</Text>
        <Pressable style={styles.primaryButton} onPress={handleDone}>
          <Text style={styles.primaryButtonText}>Back to home</Text>
        </Pressable>
      </FuturisticScreen>
    );
  }

  const winner = results.length > 0 ? results.reduce((a, b) => (a.payout >= b.payout ? a : b)) : null;

  return (
    <FuturisticScreen title="Match results" showBack>
      <Animated.View entering={FadeInDown.delay(40).duration(200)}>
        <Text style={styles.label}>GAME COMPLETE</Text>
        <Text style={styles.hint}>Skins, standings, and who owes whom below.</Text>
      </Animated.View>

      {winner && (
        <Animated.View entering={FadeInDown.delay(70).duration(200)}>
          <GlassCard style={styles.winnerCard}>
            <SymbolView
              name={{ ios: 'trophy.fill', android: 'emoji_events', web: 'emoji_events' }}
              size={40}
              tintColor={FuturisticTheme.accent}
            />
            <Text style={styles.winnerLabel}>Winner</Text>
            <Text style={styles.winnerName}>{winner.name}</Text>
            <Text style={styles.winnerPayout}>
              {winner.payout >= 0 ? '+' : ''}${winner.payout}
            </Text>
          </GlassCard>
        </Animated.View>
      )}

      <Animated.View entering={FadeInDown.delay(110).duration(200)}>
        <Text style={styles.sectionTitle}>Final standings</Text>
        {results.length === 0 ? (
          <Text style={styles.emptyText}>No results.</Text>
        ) : (
          results.map((row, i) => (
            <Animated.View key={row.playerId} entering={FadeIn.delay(320 + i * 80)}>
              <GlassCard style={styles.resultRow}>
                <View style={styles.resultLeft}>
                  <Text style={styles.resultPos}>{i + 1}</Text>
                  <Text style={styles.resultName}>{row.name}</Text>
                </View>
                <Text style={styles.resultSkins}>{row.skinsWon} skins</Text>
                <Text style={[styles.resultPayout, row.payout >= 0 ? styles.payoutWin : styles.payoutLoss]}>
                  {row.payout >= 0 ? '+' : ''}${row.payout}
                </Text>
              </GlassCard>
            </Animated.View>
          ))
        )}
      </Animated.View>

      {settlements.length > 0 && (
        <Animated.View entering={FadeInDown.delay(160).duration(200)}>
          <Text style={styles.sectionTitle}>Settle up</Text>
          <Text style={styles.settleHint}>
            Pay each other directly (Venmo, cash, etc.), then tap to mark it done.
          </Text>
          {settlements.map((s, i) => (
            <Animated.View key={s.id} entering={FadeIn.delay(460 + i * 80)}>
              <GlassCard style={styles.settleRow}>
                <View style={styles.settleLeft}>
                  <Text style={styles.settleText}>
                    <Text style={styles.settleName}>{s.fromName}</Text> owes{' '}
                    <Text style={styles.settleName}>{s.toName}</Text>
                  </Text>
                  <Text style={styles.settleAmount}>${s.amount}</Text>
                </View>
                <Pressable
                  onPress={() => toggleSettled(s)}
                  style={({ pressed }) => [
                    styles.settleButton,
                    s.settled && styles.settleButtonDone,
                    pressed && styles.primaryButtonPressed,
                  ]}
                >
                  <Text style={[styles.settleButtonText, s.settled && styles.settleButtonTextDone]}>
                    {s.settled ? 'Settled ✓' : 'Mark settled'}
                  </Text>
                </Pressable>
              </GlassCard>
            </Animated.View>
          ))}
        </Animated.View>
      )}

      <Animated.View entering={FadeInDown.delay(210).duration(200)} style={styles.actions}>
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
  settleHint: {
    fontSize: 14,
    color: FuturisticTheme.textSecondary,
    marginBottom: 12,
    marginTop: -4,
  },
  settleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  settleLeft: {
    flex: 1,
  },
  settleText: {
    fontSize: 15,
    color: FuturisticTheme.textSecondary,
  },
  settleName: {
    fontWeight: '700',
    color: FuturisticTheme.textPrimary,
  },
  settleAmount: {
    fontSize: 20,
    fontWeight: '800',
    color: FuturisticTheme.accent,
    marginTop: 2,
  },
  settleButton: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: FuturisticTheme.accent,
  },
  settleButtonDone: {
    borderColor: FuturisticTheme.accentTeal,
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
  settleButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: FuturisticTheme.accent,
  },
  settleButtonTextDone: {
    color: FuturisticTheme.accentTeal,
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
  centered: {
    flex: 1,
    justifyContent: 'center',
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
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 15,
    color: FuturisticTheme.textMuted,
  },
});
