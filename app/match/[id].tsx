import { useRouter, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { FuturisticTheme } from '@/constants/Colors';
import { ApiError } from '@/lib/api';
import { endGame, getGame, recordHoleWinner, type Game } from '@/lib/games-api';

import { FuturisticScreen } from '@/components/FuturisticScreen';
import { GlassCard } from '@/components/GlassCard';

export default function ActiveMatchScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);
  const [ending, setEnding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pickerHole, setPickerHole] = useState<number | null>(null);

  const loadGame = useCallback(async () => {
    if (!id) return;
    try {
      const g = await getGame(id);
      setGame(g);
      setError(null);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Failed to load match');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadGame();
  }, [loadGame]);

  const handleRecordWinner = async (holeNumber: number, winnerId: string) => {
    if (!id) return;
    setPickerHole(null);
    try {
      const updated = await recordHoleWinner(id, holeNumber, winnerId);
      setGame((prev) =>
        prev
          ? {
              ...prev,
              holes: updated.holes,
              currentHole: updated.currentHole,
              leaderboard: updated.leaderboard ?? prev.leaderboard,
            }
          : null
      );
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Failed to record winner');
    }
  };

  const handleEndGame = async () => {
    if (!id) return;
    setEnding(true);
    try {
      await endGame(id);
      router.replace(`/result/${id}`);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Failed to end game');
    } finally {
      setEnding(false);
    }
  };

  if (loading) {
    return (
      <FuturisticScreen title="Active match" showBack>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={FuturisticTheme.accent} />
          <Text style={styles.loadingText}>Loading match…</Text>
        </View>
      </FuturisticScreen>
    );
  }

  if (error && !game) {
    return (
      <FuturisticScreen title="Active match" showBack>
        <Text style={styles.errorText}>{error}</Text>
      </FuturisticScreen>
    );
  }

  const holes = game?.holes ?? [];
  const leaderboard = game?.leaderboard ?? [];
  const players = game?.players ?? [];
  const currentHole = game?.currentHole ?? 1;
  const holeCount = holes.length || 9;

  const winnerName = (winnerId: string) =>
    leaderboard.find((r) => r.playerId === winnerId)?.name ??
    players.find((p) => p.id === winnerId)?.displayName ??
    winnerId;

  return (
    <FuturisticScreen title="Active match" showBack scroll>
      <Animated.View entering={FadeInDown.delay(100).springify().damping(18)}>
        <Text style={styles.label}>HOLE {currentHole} OF {holeCount}</Text>
        <Text style={styles.hint}>Tap a hole to set the skin winner.</Text>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(180).springify().damping(18)}>
        <GlassCard style={styles.section}>
          <Text style={styles.sectionTitle}>Leaderboard</Text>
          {leaderboard.length === 0 ? (
            <Text style={styles.emptyText}>No results yet.</Text>
          ) : (
            leaderboard.map((row, i) => (
              <View key={row.playerId} style={styles.leaderRow}>
                <Text style={styles.leaderPos}>{i + 1}</Text>
                <Text style={styles.leaderName}>{row.name}</Text>
                <Text style={styles.leaderSkins}>{row.skinsWon} skins</Text>
                <Text style={styles.leaderTotal}>${row.totalEarnings}</Text>
              </View>
            ))
          )}
        </GlassCard>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(260).springify().damping(18)}>
        <Text style={styles.sectionTitle}>Holes</Text>
        {holes.length === 0 ? (
          <Text style={styles.emptyText}>Holes will appear when the game starts.</Text>
        ) : (
          holes.map((h) => (
            <Pressable
              key={h.holeNumber}
              onPress={() => setPickerHole(h.holeNumber)}
              style={({ pressed }) => [pressed && styles.holeCardPressed]}
            >
              <GlassCard style={styles.holeCard}>
                <View style={styles.holeLeft}>
                  <Text style={styles.holeNumber}>Hole {h.holeNumber}</Text>
                  <Text style={styles.holePar}>Par {h.par ?? '—'}</Text>
                </View>
                <Text style={styles.holeWinner}>
                  {h.winnerId ? winnerName(h.winnerId) : 'Tap to set winner'}
                </Text>
              </GlassCard>
            </Pressable>
          ))
        )}
      </Animated.View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <Animated.View entering={FadeInDown.delay(340).springify().damping(18)} style={styles.actions}>
        <Pressable
          onPress={handleEndGame}
          disabled={ending}
          style={({ pressed }) => [styles.endButton, pressed && styles.primaryButtonPressed]}
        >
          {ending ? (
            <ActivityIndicator color={FuturisticTheme.bgDeep} />
          ) : (
            <Text style={styles.endButtonText}>End game & see results</Text>
          )}
        </Pressable>
      </Animated.View>

      <Modal
        visible={pickerHole != null}
        transparent
        animationType="fade"
        onRequestClose={() => setPickerHole(null)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setPickerHole(null)}>
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.modalTitle}>Hole {pickerHole} — Set winner</Text>
            {(players.length ? players : leaderboard.map((r) => ({ id: r.playerId, displayName: r.name }))).map(
              (p) => (
                <Pressable
                  key={p.id ?? p.displayName}
                  style={({ pressed }) => [styles.playerOption, pressed && styles.playerOptionPressed]}
                  onPress={() => pickerHole != null && handleRecordWinner(pickerHole, p.id ?? p.displayName)}
                >
                  <Text style={styles.playerOptionText}>{p.displayName}</Text>
                </Pressable>
              )
            )}
            <Pressable style={styles.modalCancel} onPress={() => setPickerHole(null)}>
              <Text style={styles.modalCancelText}>Cancel</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
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
  holeCardPressed: {
    opacity: 0.9,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: FuturisticTheme.bgCard,
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxWidth: 320,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: FuturisticTheme.textPrimary,
    marginBottom: 16,
  },
  playerOption: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: FuturisticTheme.glassBorder,
  },
  playerOptionPressed: {
    opacity: 0.8,
  },
  playerOptionText: {
    fontSize: 16,
    fontWeight: '600',
    color: FuturisticTheme.textPrimary,
  },
  modalCancel: {
    marginTop: 16,
    paddingVertical: 10,
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: FuturisticTheme.textMuted,
  },
});
