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
import { ApiError } from '@/lib/api';
import { withdraw as withdrawApi } from '@/lib/users-api';

import { FuturisticScreen } from '@/components/FuturisticScreen';
import { GlassCard } from '@/components/GlassCard';

export default function WithdrawScreen() {
  const router = useRouter();
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleWithdraw = async () => {
    const num = parseFloat(amount.replace(/[^0-9.]/g, ''));
    if (Number.isNaN(num) || num <= 0) {
      setError('Enter a valid amount');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await withdrawApi(num);
      router.back();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Withdrawal failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <FuturisticScreen title="Withdraw" showBack>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboard}
      >
        <Animated.View entering={FadeInDown.delay(40).duration(200)}>
          <Text style={styles.label}>AMOUNT</Text>
          <Text style={styles.hint}>Enter the amount to withdraw.</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(70).duration(200)}>
          <GlassCard style={styles.card}>
            <Text style={styles.fieldLabel}>Amount ($)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 25"
              placeholderTextColor={FuturisticTheme.textMuted}
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
            />
          </GlassCard>
        </Animated.View>

        {error ? (
          <Animated.View entering={FadeInDown.delay(40)}>
            <Text style={styles.errorText}>{error}</Text>
          </Animated.View>
        ) : null}

        <Animated.View entering={FadeInDown.delay(110).duration(200)}>
          <Pressable
            onPress={handleWithdraw}
            disabled={loading}
            style={({ pressed }) => [
              styles.primaryButton,
              pressed && styles.primaryButtonPressed,
              loading && styles.primaryButtonDisabled,
            ]}
          >
            <Text style={styles.primaryButtonText}>
              {loading ? 'Requesting…' : 'Request withdrawal'}
            </Text>
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
  errorText: {
    fontSize: 15,
    color: '#FF5252',
    marginBottom: 12,
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
    opacity: 0.6,
  },
});
