import { StatusBar } from 'expo-status-bar';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
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

import { GradientBackground } from '@/components/GradientBackground';
import { GlassCard } from '@/components/GlassCard';
import { FuturisticTheme } from '@/constants/Colors';
import { ApiError } from '@/lib/api';
import { resetPassword } from '@/lib/auth-api';

function coerceParam(v: string | string[] | undefined): string | null {
  if (!v) return null;
  return Array.isArray(v) ? v[0] ?? null : v;
}

export default function ResetPasswordScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ token?: string | string[] }>();
  const token = useMemo(() => coerceParam(params.token), [params.token]);

  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const validationError = useMemo(() => {
    if (!newPassword && !confirm) return null;
    if (newPassword.length > 0 && newPassword.length < 8) return 'Password must be at least 8 characters.';
    if (confirm.length > 0 && newPassword !== confirm) return 'Passwords do not match.';
    return null;
  }, [newPassword, confirm]);

  const handleReset = async () => {
    setError(null);
    if (!token) {
      setError('Missing reset token. Please use the link from your email.');
      return;
    }
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      await resetPassword(token, newPassword);
      setDone(true);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Reset password failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <GradientBackground />
      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
      >
        <Animated.View entering={FadeInDown.delay(40).duration(200)} style={styles.content}>
          <Text style={styles.label}>GOLF SKINS</Text>
          <Text style={styles.logo}>Reset password</Text>
          <Text style={styles.subtitle}>
            {token ? 'Choose a new password for your account.' : 'Open the reset link from your email.'}
          </Text>

          {!done ? (
            <>
              <Animated.View entering={FadeInDown.delay(70).duration(200)}>
                <GlassCard style={styles.inputCard}>
                  <TextInput
                    style={styles.input}
                    placeholder="New password"
                    placeholderTextColor={FuturisticTheme.textMuted}
                    value={newPassword}
                    onChangeText={setNewPassword}
                    secureTextEntry
                    autoComplete="new-password"
                    editable={!loading}
                  />
                </GlassCard>
              </Animated.View>

              <Animated.View entering={FadeInDown.delay(100).duration(200)}>
                <GlassCard style={styles.inputCard}>
                  <TextInput
                    style={styles.input}
                    placeholder="Confirm password"
                    placeholderTextColor={FuturisticTheme.textMuted}
                    value={confirm}
                    onChangeText={setConfirm}
                    secureTextEntry
                    autoComplete="new-password"
                    editable={!loading}
                  />
                </GlassCard>
              </Animated.View>

              {validationError ? (
                <Animated.View entering={FadeInDown.delay(110)}>
                  <Text style={styles.hintText}>{validationError}</Text>
                </Animated.View>
              ) : null}

              {error ? (
                <Animated.View entering={FadeInDown.delay(130)}>
                  <Text style={styles.errorText}>{error}</Text>
                </Animated.View>
              ) : null}

              <Animated.View entering={FadeInDown.delay(130).duration(200)}>
                <Pressable
                  onPress={handleReset}
                  disabled={loading || !token}
                  style={({ pressed }) => [
                    styles.button,
                    pressed && styles.buttonPressed,
                    (loading || !token) && styles.buttonDisabled,
                  ]}
                >
                  {loading ? (
                    <ActivityIndicator color={FuturisticTheme.bgDeep} />
                  ) : (
                    <Text style={styles.buttonText}>Reset password</Text>
                  )}
                </Pressable>
              </Animated.View>

              <Animated.View entering={FadeInDown.delay(150).duration(200)}>
                <Pressable
                  onPress={() => router.replace('/login')}
                  style={({ pressed }) => [styles.linkWrap, pressed && styles.linkPressed]}
                >
                  <Text style={styles.linkText}>Back to sign in</Text>
                </Pressable>
              </Animated.View>
            </>
          ) : (
            <>
              <Animated.View entering={FadeInDown.delay(70)}>
                <Text style={styles.messageText}>Password updated. You can sign in now.</Text>
              </Animated.View>

              <Animated.View entering={FadeInDown.delay(100).duration(200)}>
                <Pressable
                  onPress={() => router.replace('/login')}
                  style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
                >
                  <Text style={styles.buttonText}>Go to sign in</Text>
                </Pressable>
              </Animated.View>
            </>
          )}
        </Animated.View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboard: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 100,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 2.4,
    color: FuturisticTheme.accent,
    marginBottom: 8,
  },
  logo: {
    fontSize: 32,
    fontWeight: '800',
    color: FuturisticTheme.textPrimary,
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 16,
    color: FuturisticTheme.textSecondary,
    marginBottom: 28,
  },
  inputCard: {
    marginBottom: 12,
  },
  input: {
    fontSize: 17,
    color: FuturisticTheme.textPrimary,
    paddingVertical: 4,
  },
  hintText: {
    fontSize: 14,
    color: FuturisticTheme.textMuted,
    marginBottom: 10,
  },
  button: {
    height: 52,
    borderRadius: 14,
    backgroundColor: FuturisticTheme.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  buttonPressed: {
    opacity: 0.9,
  },
  buttonText: {
    color: FuturisticTheme.bgDeep,
    fontSize: 17,
    fontWeight: '700',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  errorText: {
    fontSize: 15,
    color: '#FF5252',
    marginBottom: 12,
  },
  messageText: {
    fontSize: 15,
    color: FuturisticTheme.textSecondary,
    marginBottom: 12,
  },
  linkWrap: {
    marginTop: 18,
    alignItems: 'center',
  },
  linkText: {
    fontSize: 15,
    fontWeight: '600',
    color: FuturisticTheme.textSecondary,
  },
  linkPressed: {
    opacity: 0.7,
  },
});

