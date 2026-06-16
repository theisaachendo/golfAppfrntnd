import { StatusBar } from 'expo-status-bar';
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

import { GradientBackground } from '@/components/GradientBackground';
import { GlassCard } from '@/components/GlassCard';
import { FuturisticTheme } from '@/constants/Colors';
import { ApiError } from '@/lib/api';
import { forgotPassword } from '@/lib/auth-api';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async () => {
    setError(null);
    setMessage(null);
    setLoading(true);
    try {
      const res = await forgotPassword(email.trim());
      setSent(true);
      setMessage(res?.message ?? 'If that email exists, a reset link has been sent.');
    } catch (e) {
      // Backend intentionally returns the same message to prevent enumeration.
      setSent(true);
      setMessage(
        e instanceof ApiError ? e.message : 'If that email exists, a reset link has been sent.'
      );
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
          <Text style={styles.logo}>Forgot password</Text>
          <Text style={styles.subtitle}>We’ll email you a reset link.</Text>

          <Animated.View entering={FadeInDown.delay(70).duration(200)}>
            <GlassCard style={styles.inputCard}>
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor={FuturisticTheme.textMuted}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
                editable={!loading && !sent}
              />
            </GlassCard>
          </Animated.View>

          {error ? (
            <Animated.View entering={FadeInDown.delay(220)}>
              <Text style={styles.errorText}>{error}</Text>
            </Animated.View>
          ) : null}

          {message ? (
            <Animated.View entering={FadeInDown.delay(100)}>
              <Text style={styles.messageText}>{message}</Text>
            </Animated.View>
          ) : null}

          {!sent ? (
            <Animated.View entering={FadeInDown.delay(120).duration(200)}>
              <Pressable
                onPress={handleSubmit}
                disabled={loading}
                style={({ pressed }) => [
                  styles.button,
                  pressed && styles.buttonPressed,
                  loading && styles.buttonDisabled,
                ]}
              >
                {loading ? (
                  <ActivityIndicator color={FuturisticTheme.bgDeep} />
                ) : (
                  <Text style={styles.buttonText}>Send reset link</Text>
                )}
              </Pressable>
            </Animated.View>
          ) : (
            <Animated.View entering={FadeInDown.delay(120).duration(200)}>
              <Pressable
                onPress={() => router.replace('/login')}
                style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
              >
                <Text style={styles.buttonText}>Back to sign in</Text>
              </Pressable>
            </Animated.View>
          )}

          <Animated.View entering={FadeInDown.delay(150).duration(200)}>
            <Pressable onPress={() => router.back()} style={({ pressed }) => [styles.linkWrap, pressed && styles.linkPressed]}>
              <Text style={styles.linkText}>Cancel</Text>
            </Pressable>
          </Animated.View>
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

