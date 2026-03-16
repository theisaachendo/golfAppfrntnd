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

import { FuturisticTheme } from '@/constants/Colors';
import { ApiError } from '@/lib/api';
import { guest, login } from '@/lib/auth-api';

import { GradientBackground } from '@/components/GradientBackground';
import { GlassCard } from '@/components/GlassCard';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      await login(email.trim(), password);
      router.replace('/(tabs)');
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Sign in failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGuest = async () => {
    setError(null);
    setLoading(true);
    try {
      await guest();
      router.replace('/(tabs)');
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Guest sign-in failed');
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
        <Animated.View entering={FadeInDown.delay(100).springify().damping(18)} style={styles.content}>
          <Text style={styles.label}>GOLF SKINS</Text>
          <Text style={styles.logo}>Sign in</Text>
          <Text style={styles.subtitle}>Manage your games and track every skin.</Text>

          <Animated.View entering={FadeInDown.delay(180).springify().damping(18)}>
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
              />
            </GlassCard>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(240).springify().damping(18)}>
            <GlassCard style={styles.inputCard}>
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor={FuturisticTheme.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoComplete="password"
              />
            </GlassCard>
          </Animated.View>

          {error ? (
            <Animated.View entering={FadeInDown.delay(100)}>
              <Text style={styles.errorText}>{error}</Text>
            </Animated.View>
          ) : null}

          <Animated.View entering={FadeInDown.delay(320).springify().damping(18)}>
            <Pressable
              onPress={handleLogin}
              disabled={loading}
              style={({ pressed }) => [styles.button, pressed && styles.buttonPressed, loading && styles.buttonDisabled]}
            >
              {loading ? (
                <ActivityIndicator color={FuturisticTheme.bgDeep} />
              ) : (
                <Text style={styles.buttonText}>Sign in</Text>
              )}
            </Pressable>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(400).springify().damping(18)}>
            <Pressable
              onPress={handleGuest}
              disabled={loading}
              style={({ pressed }) => [styles.guestWrap, pressed && styles.linkPressed]}
            >
              <Text style={styles.guestText}>Continue as guest</Text>
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
    marginTop: 20,
  },
  buttonPressed: {
    opacity: 0.9,
  },
  buttonText: {
    color: FuturisticTheme.bgDeep,
    fontSize: 17,
    fontWeight: '700',
  },
  guestWrap: {
    marginTop: 20,
    alignItems: 'center',
  },
  guestText: {
    fontSize: 15,
    fontWeight: '600',
    color: FuturisticTheme.textSecondary,
  },
  linkPressed: {
    opacity: 0.7,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  errorText: {
    fontSize: 15,
    color: '#FF5252',
    marginBottom: 12,
  },
});
