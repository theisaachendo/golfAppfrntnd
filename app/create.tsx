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

export default function CreateScreen() {
  const router = useRouter();
  const [gameName, setGameName] = useState('');
  const [stakePerHole, setStakePerHole] = useState('');

  const handleCreate = () => {
    // TODO: create game via API
    router.replace('/lobby?gameId=new');
  };

  return (
    <FuturisticScreen title="New game" showBack>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboard}
      >
        <Animated.View entering={FadeInDown.delay(100).springify().damping(18)}>
          <Text style={styles.label}>GAME DETAILS</Text>
          <Text style={styles.hint}>Set a name and skin value per hole.</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(180).springify().damping(18)}>
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

        <Animated.View entering={FadeInDown.delay(260).springify().damping(18)}>
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

        <Animated.View entering={FadeInDown.delay(340).springify().damping(18)}>
          <Pressable
            onPress={handleCreate}
            style={({ pressed }) => [styles.primaryButton, pressed && styles.primaryButtonPressed]}
          >
            <Text style={styles.primaryButtonText}>Create & go to lobby</Text>
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
});
