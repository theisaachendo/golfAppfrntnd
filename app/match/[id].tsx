import { useRouter, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { FuturisticTheme } from '@/constants/Colors';
import { ApiError } from '@/lib/api';
import {
  acceptHoleChange,
  endGame,
  getGame,
  rejectHoleChange,
  setHoleResult,
  type Game,
  type Hole,
} from '@/lib/games-api';
import { getMe } from '@/lib/users-api';
import { usePolling } from '@/lib/use-poll';

import { FuturisticScreen } from '@/components/FuturisticScreen';
import { GlassCard } from '@/components/GlassCard';

// Walk holes in order to compute carryover: each tie adds 1 to the carry, and
// the next outright winner's hole is worth (1 + carry) skins.
type HoleMeta = { value?: number; tied?: boolean; carryIn?: number; undecided?: boolean };
function annotateHoles(holes: Hole[]): Record<number, HoleMeta> {
  const out: Record<number, HoleMeta> = {};
  let carry = 0;
  for (const h of [...holes].sort((a, b) => a.holeNumber - b.holeNumber)) {
    if (h.tied) {
      carry += 1;
      out[h.holeNumber] = { tied: true };
    } else if (h.winnerId) {
      out[h.holeNumber] = { value: 1 + carry };
      carry = 0;
    } else {
      out[h.holeNumber] = { undecided: true, carryIn: carry };
    }
  }
  return out;
}

export default function ActiveMatchScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [game, setGame] = useState<Game | null>(null);
  const [myId, setMyId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [ending, setEnding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [pickerHole, setPickerHole] = useState<number | null>(null);

  const loadGame = useCallback(
    async (isPoll = false) => {
      if (!id) return;
      try {
        const g = await getGame(id);
        setGame(g);
        setError(null);
        if (g.status === 'completed') router.replace(`/result/${id}`);
      } catch (e) {
        if (!isPoll) setError(e instanceof ApiError ? e.message : 'Failed to load match');
      } finally {
        if (!isPoll) setLoading(false);
      }
    },
    [id, router]
  );

  useEffect(() => {
    loadGame();
    getMe().then((u) => setMyId(u.id)).catch(() => {});
  }, [loadGame]);

  usePolling(() => loadGame(true), 2500);

  const applyResp = (resp: { holes: Game['holes']; currentHole: number; leaderboard: Game['leaderboard'] }) => {
    setGame((prev) =>
      prev ? { ...prev, holes: resp.holes, currentHole: resp.currentHole, leaderboard: resp.leaderboard ?? prev.leaderboard } : null
    );
  };

  const setResult = async (holeNumber: number, result: { winnerId: string } | { tied: true }) => {
    if (!id) return;
    setPickerHole(null);
    setError(null);
    try {
      const resp = await setHoleResult(id, holeNumber, result);
      applyResp(resp);
      setNotice(resp.status === 'pending' ? `Change to hole ${holeNumber} sent — waiting for another player to accept.` : null);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Could not set the result. Tap the hole to retry.');
    }
  };

  const respondToChange = async (holeNumber: number, accept: boolean) => {
    if (!id) return;
    setError(null);
    try {
      const resp = accept ? await acceptHoleChange(id, holeNumber) : await rejectHoleChange(id, holeNumber);
      applyResp(resp);
      setNotice(null);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Could not update the change.');
    }
  };

  const handleEndGame = async () => {
    if (!id) return;
    setEnding(true);
    setError(null);
    try {
      await endGame(id);
      router.replace(`/result/${id}`);
    } catch (e) {
      try {
        const g = await getGame(id);
        if (g.status === 'completed') {
          router.replace(`/result/${id}`);
          return;
        }
      } catch {
        /* ignore */
      }
      setError(e instanceof ApiError ? e.message : 'Failed to end game. Tap to try again.');
    } finally {
      setEnding(false);
    }
  };

  const holes = game?.holes ?? [];
  const leaderboard = game?.leaderboard ?? [];
  const players = game?.players ?? [];
  const currentHole = game?.currentHole ?? 1;
  const holeCount = holes.length || 18;
  const meta = useMemo(() => annotateHoles(holes), [holes]);

  const nameOf = (uid?: string | null) =>
    (uid && (leaderboard.find((r) => r.playerId === uid)?.name ?? players.find((p) => p.id === uid)?.displayName)) || 'Player';

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

  return (
    <FuturisticScreen title="Active match" showBack scroll>
      <Animated.View entering={FadeInDown.delay(80).springify().damping(18)}>
        <Text style={styles.label}>HOLE {Math.min(currentHole, holeCount)} OF {holeCount}</Text>
        <Text style={styles.hint}>Tap a hole to set the winner, or mark it a tie to carry the skin over.</Text>
      </Animated.View>

      {notice ? (
        <Animated.View entering={FadeInDown.springify().damping(18)}>
          <GlassCard style={styles.noticeCard}>
            <Text style={styles.noticeText}>{notice}</Text>
          </GlassCard>
        </Animated.View>
      ) : null}

      <Animated.View entering={FadeInDown.delay(140).springify().damping(18)}>
        <GlassCard style={styles.section}>
          <Text style={styles.sectionTitle}>Leaderboard</Text>
          {leaderboard.length === 0 ? (
            <Text style={styles.emptyText}>No results yet.</Text>
          ) : (
            [...leaderboard]
              .sort((a, b) => b.totalEarnings - a.totalEarnings)
              .map((row, i) => (
                <View key={row.playerId} style={styles.leaderRow}>
                  <Text style={styles.leaderPos}>{i + 1}</Text>
                  <Text style={styles.leaderName} numberOfLines={1}>{row.name}</Text>
                  <Text style={styles.leaderSkins}>{row.skinsWon} skins</Text>
                  <Text style={[styles.leaderTotal, row.totalEarnings < 0 && styles.negative]}>
                    {row.totalEarnings >= 0 ? '+' : '−'}${Math.abs(row.totalEarnings)}
                  </Text>
                </View>
              ))
          )}
        </GlassCard>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(200).springify().damping(18)}>
        <Text style={styles.sectionTitle}>HOLES</Text>
        {holes.map((h) => {
          const m = meta[h.holeNumber] || {};
          const pending = h.pending;
          const pendingByMe = pending && pending.byId === myId;
          return (
            <GlassCard key={h.holeNumber} style={styles.holeCard}>
              <Pressable onPress={() => setPickerHole(h.holeNumber)} style={styles.holeMain}>
                <View style={styles.holeLeft}>
                  <Text style={styles.holeNumber}>Hole {h.holeNumber}</Text>
                  <Text style={styles.holePar}>Par {h.par ?? '—'}</Text>
                  {m.undecided && (m.carryIn ?? 0) > 0 ? (
                    <View style={styles.potChip}>
                      <Text style={styles.potChipText}>Worth {1 + (m.carryIn ?? 0)} skins</Text>
                    </View>
                  ) : null}
                </View>
                <View style={styles.holeRight}>
                  {h.tied ? (
                    <Text style={styles.tiedText}>Tie · carries over</Text>
                  ) : h.winnerId ? (
                    <Text style={styles.holeWinner}>
                      {nameOf(h.winnerId)}
                      {m.value && m.value > 1 ? `  ·  ${m.value} skins` : ''}
                    </Text>
                  ) : (
                    <Text style={styles.holeUnset}>Tap to set</Text>
                  )}
                </View>
              </Pressable>

              {pending ? (
                <View style={styles.pendingBox}>
                  <Text style={styles.pendingText}>
                    Proposed change: {pending.tied ? 'Tie (carry over)' : `${nameOf(pending.winnerId)} wins`}
                  </Text>
                  {pendingByMe ? (
                    <View style={styles.pendingActions}>
                      <Text style={styles.pendingWaiting}>Waiting for another player…</Text>
                      <Pressable onPress={() => respondToChange(h.holeNumber, false)} style={styles.cancelBtn}>
                        <Text style={styles.cancelBtnText}>Cancel</Text>
                      </Pressable>
                    </View>
                  ) : (
                    <View style={styles.pendingActions}>
                      <Pressable onPress={() => respondToChange(h.holeNumber, true)} style={styles.acceptBtn}>
                        <Text style={styles.acceptBtnText}>Accept</Text>
                      </Pressable>
                      <Pressable onPress={() => respondToChange(h.holeNumber, false)} style={styles.rejectBtn}>
                        <Text style={styles.rejectBtnText}>Reject</Text>
                      </Pressable>
                    </View>
                  )}
                </View>
              ) : null}
            </GlassCard>
          );
        })}
      </Animated.View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <Animated.View entering={FadeInDown.delay(260).springify().damping(18)} style={styles.actions}>
        <Pressable
          onPress={handleEndGame}
          disabled={ending}
          style={({ pressed }) => [styles.endButton, pressed && styles.pressed]}
        >
          {ending ? <ActivityIndicator color={FuturisticTheme.bgDeep} /> : <Text style={styles.endButtonText}>End game & see results</Text>}
        </Pressable>
      </Animated.View>

      {/* Result picker */}
      <Modal visible={pickerHole != null} transparent animationType="fade" onRequestClose={() => setPickerHole(null)}>
        <Pressable style={styles.modalOverlay} onPress={() => setPickerHole(null)}>
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.modalTitle}>Hole {pickerHole} — who won?</Text>
            {(players.length ? players : leaderboard.map((r) => ({ id: r.playerId, displayName: r.name }))).map((p) => (
              <Pressable
                key={p.id ?? p.displayName}
                style={({ pressed }) => [styles.playerOption, pressed && styles.pressed]}
                onPress={() => pickerHole != null && p.id && setResult(pickerHole, { winnerId: p.id })}
              >
                <Text style={styles.playerOptionText}>{p.displayName}</Text>
              </Pressable>
            ))}
            <Pressable
              style={({ pressed }) => [styles.tieOption, pressed && styles.pressed]}
              onPress={() => pickerHole != null && setResult(pickerHole, { tied: true })}
            >
              <Text style={styles.tieOptionText}>Tie — carry the skin over</Text>
            </Pressable>
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
  label: { fontSize: 12, fontWeight: '700', letterSpacing: 1.8, color: FuturisticTheme.accent, marginBottom: 6 },
  hint: { fontSize: 15, lineHeight: 20, color: FuturisticTheme.textSecondary, marginBottom: 18 },
  noticeCard: { marginBottom: 16, borderColor: FuturisticTheme.accentSoft },
  noticeText: { fontSize: 14, color: FuturisticTheme.textPrimary },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 12, fontWeight: '700', letterSpacing: 1.5, color: FuturisticTheme.textMuted, marginBottom: 12 },
  leaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: FuturisticTheme.divider,
  },
  leaderPos: { width: 22, fontSize: 15, fontWeight: '800', color: FuturisticTheme.accent },
  leaderName: { flex: 1, fontSize: 16, fontWeight: '600', color: FuturisticTheme.textPrimary },
  leaderSkins: { fontSize: 14, color: FuturisticTheme.textSecondary, marginRight: 12 },
  leaderTotal: { fontSize: 16, fontWeight: '700', color: FuturisticTheme.accent, minWidth: 56, textAlign: 'right' },
  negative: { color: '#FF5C5C' },
  holeCard: { marginBottom: 10, padding: 14 },
  holeMain: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  holeLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flexShrink: 1 },
  holeRight: { flexShrink: 0, marginLeft: 12 },
  holeNumber: { fontSize: 16, fontWeight: '700', color: FuturisticTheme.textPrimary },
  holePar: { fontSize: 13, color: FuturisticTheme.textMuted },
  potChip: { backgroundColor: FuturisticTheme.accentSoft, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  potChipText: { fontSize: 11, fontWeight: '700', color: FuturisticTheme.accent },
  holeWinner: { fontSize: 14, fontWeight: '700', color: FuturisticTheme.accent },
  tiedText: { fontSize: 14, fontWeight: '700', color: FuturisticTheme.accentTeal },
  holeUnset: { fontSize: 14, fontWeight: '600', color: FuturisticTheme.textMuted },
  pendingBox: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: FuturisticTheme.divider,
  },
  pendingText: { fontSize: 14, fontWeight: '600', color: FuturisticTheme.textPrimary, marginBottom: 10 },
  pendingActions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  pendingWaiting: { flex: 1, fontSize: 13, color: FuturisticTheme.textMuted },
  acceptBtn: { flex: 1, backgroundColor: FuturisticTheme.accent, borderRadius: 10, paddingVertical: 10, alignItems: 'center' },
  acceptBtnText: { fontSize: 14, fontWeight: '700', color: FuturisticTheme.bgDeep },
  rejectBtn: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: FuturisticTheme.borderStrong,
  },
  rejectBtnText: { fontSize: 14, fontWeight: '700', color: FuturisticTheme.textSecondary },
  cancelBtn: { paddingHorizontal: 14, paddingVertical: 8 },
  cancelBtnText: { fontSize: 14, fontWeight: '700', color: FuturisticTheme.textSecondary },
  actions: { marginTop: 20 },
  endButton: { backgroundColor: FuturisticTheme.accent, paddingVertical: 16, borderRadius: 14, alignItems: 'center' },
  endButtonText: { fontSize: 17, fontWeight: '700', color: FuturisticTheme.bgDeep },
  pressed: { opacity: 0.85 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, fontSize: 16, color: FuturisticTheme.textSecondary },
  errorText: { fontSize: 15, color: '#FF5C5C', marginBottom: 12 },
  emptyText: { fontSize: 15, color: FuturisticTheme.textMuted },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  modalContent: {
    backgroundColor: FuturisticTheme.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: FuturisticTheme.border,
    padding: 20,
    width: '100%',
    maxWidth: 340,
  },
  modalTitle: { fontSize: 18, fontWeight: '800', color: FuturisticTheme.textPrimary, marginBottom: 14, letterSpacing: -0.3 },
  playerOption: { paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: FuturisticTheme.divider },
  playerOptionText: { fontSize: 16, fontWeight: '600', color: FuturisticTheme.textPrimary },
  tieOption: { paddingVertical: 14, marginTop: 4 },
  tieOptionText: { fontSize: 16, fontWeight: '700', color: FuturisticTheme.accentTeal },
  modalCancel: { marginTop: 8, paddingVertical: 10, alignItems: 'center' },
  modalCancelText: { fontSize: 16, fontWeight: '600', color: FuturisticTheme.textMuted },
});
