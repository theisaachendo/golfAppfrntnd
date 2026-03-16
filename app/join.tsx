import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
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

import { FuturisticScreen } from '@/components/FuturisticScreen';
import { GlassCard } from '@/components/GlassCard';

export default function JoinScreen() {
  const router = useRouter();
  const [code, setCode] = useState('');

  const handleJoin = () => {
    // TODO: validate code and join game
    router.replace('/lobby?gameId=demo');
  };

  return (
    <FuturisticScreen title="Join game" showBack>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboard}
      >
        <Animated.View entering={FadeInDown.delay(100).springify().damping(18)}>
          <Text style={styles.label}>GAME CODE</Text>
          <Text style={styles.hint}>Enter the code from your host to join.</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(180).springify().damping(18)}>
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

        <Animated.View entering={FadeInDown.delay(260).springify().damping(18)}>
          <View style={styles.actions}>
            <Pressable
              onPress={handleJoin}
              disabled={!code.trim()}
              style={({ pressed }) => [
                styles.primaryButton,
                !code.trim() && styles.primaryButtonDisabled,
                pressed && styles.primaryButtonPressed,
              ]}
            >
              <Text style={styles.primaryButtonText}>Join game</Text>
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
});
