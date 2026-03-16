import { useRouter, useLocalSearchParams } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import { FuturisticTheme } from '@/constants/Colors';

import { FuturisticScreen } from '@/components/FuturisticScreen';
import { GlassCard } from '@/components/GlassCard';

const MOCK_PLAYERS = ['You', 'Alex', 'Jordan'];

export default function LobbyScreen() {
  const router = useRouter();
  const { gameId } = useLocalSearchParams<{ gameId?: string }>();

  const handleStartGame = () => {
    router.replace(`/match/${gameId || '1'}`);
  };

  return (
    <FuturisticScreen title="Lobby" showBack>
      <Animated.View entering={FadeInDown.delay(100).springify().damping(18)}>
        <Text style={styles.label}>WAITING FOR PLAYERS</Text>
        <Text style={styles.hint}>Share the game code so others can join.</Text>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(180).springify().damping(18)}>
        <GlassCard style={styles.codeCard}>
          <Text style={styles.codeLabel}>Game code</Text>
          <Text style={styles.codeValue}>{gameId === 'new' ? 'ABC-1234' : gameId || '—'}</Text>
        </GlassCard>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(260).springify().damping(18)}>
        <Text style={styles.sectionTitle}>Players ({MOCK_PLAYERS.length})</Text>
        {MOCK_PLAYERS.map((name, i) => (
          <Animated.View key={name} entering={FadeIn.delay(320 + i * 60)}>
            <GlassCard style={styles.playerCard}>
              <SymbolView
                name={{ ios: 'person.circle.fill', android: 'person', web: 'person' }}
                size={28}
                tintColor={FuturisticTheme.accent}
              />
              <Text style={styles.playerName}>{name}</Text>
            </GlassCard>
          </Animated.View>
        ))}
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(520).springify().damping(18)} style={styles.actions}>
        <Pressable
          onPress={handleStartGame}
          style={({ pressed }) => [styles.primaryButton, pressed && styles.primaryButtonPressed]}
        >
          <Text style={styles.primaryButtonText}>Start game</Text>
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
  codeValue: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: 4,
    color: FuturisticTheme.textPrimary,
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
});
