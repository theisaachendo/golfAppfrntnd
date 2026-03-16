import * as Clipboard from 'expo-clipboard';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import * as Haptics from 'expo-haptics';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import { FuturisticTheme } from '@/constants/Colors';
import { ApiError } from '@/lib/api';
import { getGame, startGame, type Game } from '@/lib/games-api';

import { FuturisticScreen } from '@/components/FuturisticScreen';
import { GlassCard } from '@/components/GlassCard';

export default function LobbyScreen() {
  const router = useRouter();
  const { gameId } = useLocalSearchParams<{ gameId?: string }>();
  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCopyCode = useCallback(async () => {
    const code = game?.code ?? '';
    if (!code) return;
    await Clipboard.setStringAsync(code);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [game?.code]);

  const loadGame = useCallback(async () => {
    if (!gameId) {
      setError('No game ID');
      setLoading(false);
      return;
    }
    try {
      const g = await getGame(gameId);
      setGame(g);
      setError(null);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Failed to load game');
    } finally {
      setLoading(false);
    }
  }, [gameId]);

  useEffect(() => {
    loadGame();
  }, [loadGame]);

  const handleStartGame = async () => {
    if (!gameId || !game) return;
    setStarting(true);
    try {
      await startGame(gameId);
      router.replace(`/match/${gameId}`);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Failed to start game');
    } finally {
      setStarting(false);
    }
  };

  if (loading) {
    return (
      <FuturisticScreen title="Lobby" showBack>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={FuturisticTheme.accent} />
          <Text style={styles.loadingText}>Loading lobby…</Text>
        </View>
      </FuturisticScreen>
    );
  }

  if (error && !game) {
    return (
      <FuturisticScreen title="Lobby" showBack>
        <Text style={styles.errorText}>{error}</Text>
      </FuturisticScreen>
    );
  }

  const players = game?.players ?? [];
  const canStart = players.length >= 1;

  return (
    <FuturisticScreen title="Lobby" showBack>
      <Animated.View entering={FadeInDown.delay(100).springify().damping(18)}>
        <Text style={styles.label}>WAITING FOR PLAYERS</Text>
        <Text style={styles.hint}>Share the game code so others can join.</Text>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(180).springify().damping(18)}>
        <GlassCard style={styles.codeCard}>
          <Text style={styles.codeLabel}>Game code</Text>
          <View style={styles.codeRow}>
            <Text style={styles.codeValue}>{game?.code ?? '—'}</Text>
            <Pressable
              onPress={handleCopyCode}
              disabled={!game?.code}
              style={({ pressed }) => [
                styles.copyButton,
                pressed && styles.copyButtonPressed,
                copied && styles.copyButtonCopied,
              ]}
              accessibilityLabel="Copy game code"
            >
              <View style={styles.copyButtonContent}>
                <SymbolView
                  name={{
                    ios: 'doc.on.clipboard',
                    android: 'content_copy',
                    web: 'content_copy',
                  }}
                  size={24}
                  tintColor={copied ? FuturisticTheme.accent : FuturisticTheme.textMuted}
                />
                {copied ? (
                  <Text style={styles.copiedText}>Copied!</Text>
                ) : null}
              </View>
            </Pressable>
          </View>
        </GlassCard>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(260).springify().damping(18)}>
        <Text style={styles.sectionTitle}>Players ({players.length})</Text>
        {players.length === 0 ? (
          <Text style={styles.emptyText}>No players yet.</Text>
        ) : (
          players.map((p, i) => (
            <Animated.View key={p.id ?? p.displayName} entering={FadeIn.delay(320 + i * 60)}>
              <GlassCard style={styles.playerCard}>
                <SymbolView
                  name={{ ios: 'person.circle.fill', android: 'person', web: 'person' }}
                  size={28}
                  tintColor={FuturisticTheme.accent}
                />
                <Text style={styles.playerName}>{p.displayName}</Text>
              </GlassCard>
            </Animated.View>
          ))
        )}
      </Animated.View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <Animated.View entering={FadeInDown.delay(520).springify().damping(18)} style={styles.actions}>
        <Pressable
          onPress={handleStartGame}
          disabled={!canStart || starting}
          style={({ pressed }) => [
            styles.primaryButton,
            pressed && styles.primaryButtonPressed,
            (!canStart || starting) && styles.primaryButtonDisabled,
          ]}
        >
          {starting ? (
            <ActivityIndicator color={FuturisticTheme.bgDeep} />
          ) : (
            <Text style={styles.primaryButtonText}>Start game</Text>
          )}
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
  codeCard: {
    marginBottom: 28,
    alignItems: 'center',
  },
  codeLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: FuturisticTheme.textMuted,
    marginBottom: 4,
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  codeValue: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: 4,
    color: FuturisticTheme.textPrimary,
  },
  copyButton: {
    padding: 8,
    borderRadius: 10,
  },
  copyButtonContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  copyButtonPressed: {
    opacity: 0.8,
  },
  copyButtonCopied: {
    opacity: 1,
  },
  copiedText: {
    fontSize: 11,
    fontWeight: '600',
    color: FuturisticTheme.accent,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: FuturisticTheme.textMuted,
    marginBottom: 12,
  },
  playerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  playerName: {
    fontSize: 17,
    fontWeight: '600',
    color: FuturisticTheme.textPrimary,
    marginLeft: 14,
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
  primaryButtonDisabled: {
    opacity: 0.5,
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
