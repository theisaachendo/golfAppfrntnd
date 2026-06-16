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
import { joinGame } from '@/lib/games-api';

import { FuturisticScreen } from '@/components/FuturisticScreen';
import { GlassCard } from '@/components/GlassCard';

export default function JoinScreen() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleJoin = async () => {
    if (!code.trim()) return;
    setError(null);
    setLoading(true);
    try {
      const res = await joinGame({ code: code.trim() });
      router.replace(`/lobby?gameId=${res.gameId}`);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Failed to join game');
    } finally {
      setLoading(false);
    }
  };

  return (
    <FuturisticScreen title="Join game" showBack>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboard}
      >
        <Animated.View entering={FadeInDown.delay(40).duration(200)}>
          <Text style={styles.label}>GAME CODE</Text>
          <Text style={styles.hint}>Enter the code from your host to join.</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(70).duration(200)}>
          <GlassCard style={styles.card}>
            <TextInput
              style={styles.input}
              placeholder="e.g. ABC-1234"
              placeholderTextColor={FuturisticTheme.textMuted}
              value={code}
              onChangeText={setCode}
              autoCapitalize="characters"
              autoCorrect={false}
            />
          </GlassCard>
        </Animated.View>

        {error ? (
          <Animated.View entering={FadeInDown.delay(40)}>
            <Text style={styles.errorText}>{error}</Text>
          </Animated.View>
        ) : null}

        <Animated.View entering={FadeInDown.delay(110).duration(200)}>
          <View style={styles.actions}>
            <Pressable
              onPress={handleJoin}
              disabled={!code.trim() || loading}
              style={({ pressed }) => [
                styles.primaryButton,
                (!code.trim() || loading) && styles.primaryButtonDisabled,
                pressed && styles.primaryButtonPressed,
              ]}
            >
              {loading ? (
                <ActivityIndicator color={FuturisticTheme.bgDeep} />
              ) : (
                <Text style={styles.primaryButtonText}>Join game</Text>
              )}
            </Pressable>
          </View>
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
    marginBottom: 24,
  },
  input: {
    fontSize: 20,
    fontWeight: '600',
    color: FuturisticTheme.textPrimary,
    paddingVertical: 4,
  },
  actions: {
    marginTop: 8,
  },
  primaryButton: {
    backgroundColor: FuturisticTheme.accent,
    paddingVertical: 16,
    borderRadius: 14,
    overflow: 'hidden',
    alignItems: 'center',
  },
  primaryButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: FuturisticTheme.bgDeep,
  },
  primaryButtonDisabled: {
    opacity: 0.5,
  },
  primaryButtonPressed: {
    opacity: 0.9,
  },
  errorText: {
    fontSize: 15,
    color: '#FF5252',
    marginBottom: 12,
  },
});
