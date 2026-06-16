import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { FuturisticTheme } from '@/constants/Colors';
import { ApiError } from '@/lib/api';
import { createGame } from '@/lib/games-api';

import { FuturisticScreen } from '@/components/FuturisticScreen';
import { GlassCard } from '@/components/GlassCard';

export default function CreateScreen() {
  const router = useRouter();
  const [gameName, setGameName] = useState('');
  const [stakePerHole, setStakePerHole] = useState('');
  const [numHoles, setNumHoles] = useState<9 | 18>(18);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async () => {
    const stake = parseFloat(stakePerHole.replace(/[^0-9.]/g, ''));
    if (!gameName.trim()) {
      setError('Enter a game name');
      return;
    }
    if (Number.isNaN(stake) || stake <= 0) {
      setError('Enter a valid stake per hole');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const game = await createGame({ name: gameName.trim(), stakePerHole: stake, numHoles });
      router.replace(`/lobby?gameId=${game.id}`);
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) {
        router.replace('/login');
        return;
      }
      const message =
        e instanceof ApiError
          ? `${e.message}${e.status ? ` (${e.status})` : ''}`
          : 'Failed to create game';
      setError(message);
      if (__DEV__ && e instanceof Error) console.error('[Create game]', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <FuturisticScreen title="New game" showBack>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboard}
      >
        <Animated.View entering={FadeInDown.delay(40).duration(200)}>
          <Text style={styles.label}>GAME DETAILS</Text>
          <Text style={styles.hint}>Set a name and skin value per hole.</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(70).duration(200)}>
          <GlassCard style={styles.card}>
            <Text style={styles.fieldLabel}>Game name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Saturday skins"
              placeholderTextColor={FuturisticTheme.textMuted}
              value={gameName}
              onChangeText={setGameName}
            />
          </GlassCard>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(110).duration(200)}>
          <GlassCard style={styles.card}>
            <Text style={styles.fieldLabel}>Stake per hole ($)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 5"
              placeholderTextColor={FuturisticTheme.textMuted}
              value={stakePerHole}
              onChangeText={setStakePerHole}
              keyboardType="decimal-pad"
            />
          </GlassCard>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(120).duration(200)}>
          <GlassCard style={styles.card}>
            <Text style={styles.fieldLabel}>Holes</Text>
            <View style={styles.segment}>
              {([9, 18] as const).map((n) => (
                <Pressable
                  key={n}
                  onPress={() => setNumHoles(n)}
                  style={[styles.segmentItem, numHoles === n && styles.segmentItemActive]}
                >
                  <Text style={[styles.segmentText, numHoles === n && styles.segmentTextActive]}>
                    {n} holes
                  </Text>
                </Pressable>
              ))}
            </View>
          </GlassCard>
        </Animated.View>

        {error ? (
          <Animated.View entering={FadeInDown.delay(40)}>
            <Text style={styles.errorText}>{error}</Text>
          </Animated.View>
        ) : null}

        <Animated.View entering={FadeInDown.delay(140).duration(200)}>
          <Pressable
            onPress={handleCreate}
            disabled={loading}
            style={({ pressed }) => [
              styles.primaryButton,
              pressed && styles.primaryButtonPressed,
              loading && styles.primaryButtonDisabled,
            ]}
          >
            {loading ? (
              <ActivityIndicator color={FuturisticTheme.bgDeep} />
            ) : (
              <Text style={styles.primaryButtonText}>Create & go to lobby</Text>
            )}
          </Pressable>
        </Animated.View>
      </KeyboardAvoidingView>
    </FuturisticScreen>
  );
}

const styles = StyleSheet.create({
  keyboard: {
    flex: 1,
  },
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
  card: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: FuturisticTheme.textMuted,
    marginBottom: 8,
  },
  input: {
    fontSize: 17,
    fontWeight: '500',
    color: FuturisticTheme.textPrimary,
    paddingVertical: 4,
  },
  segment: {
    flexDirection: 'row',
    backgroundColor: FuturisticTheme.bgDeep,
    borderRadius: 12,
    padding: 4,
    gap: 4,
  },
  segmentItem: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 9,
    alignItems: 'center',
  },
  segmentItemActive: {
    backgroundColor: FuturisticTheme.accent,
  },
  segmentText: {
    fontSize: 15,
    fontWeight: '700',
    color: FuturisticTheme.textSecondary,
  },
  segmentTextActive: {
    color: FuturisticTheme.bgDeep,
  },
  primaryButton: {
    backgroundColor: FuturisticTheme.accent,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 8,
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
    opacity: 0.7,
  },
  errorText: {
    fontSize: 15,
    color: '#FF5252',
    marginBottom: 12,
  },
});
