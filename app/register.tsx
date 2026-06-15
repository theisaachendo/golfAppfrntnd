import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
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
import { register } from '@/lib/auth-api';

export default function RegisterScreen() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const passwordHint = useMemo(() => {
    if (!password) return null;
    if (password.length >= 8) return null;
    return 'Password must be at least 8 characters.';
  }, [password]);

  const handleRegister = async () => {
    setError(null);
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setLoading(true);
    try {
      await register(email.trim(), password, displayName.trim() || undefined);
      router.replace('/(tabs)');
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Sign up failed');
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
          <Text style={styles.logo}>Create account</Text>
          <Text style={styles.subtitle}>Sign up to start tracking skins.</Text>

          <Animated.View entering={FadeInDown.delay(180).springify().damping(18)}>
            <GlassCard style={styles.inputCard}>
              <TextInput
                style={styles.input}
                placeholder="Display name (optional)"
                placeholderTextColor={FuturisticTheme.textMuted}
                value={displayName}
                onChangeText={setDisplayName}
                autoCapitalize="words"
                autoComplete="name"
              />
            </GlassCard>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(240).springify().damping(18)}>
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

          <Animated.View entering={FadeInDown.delay(300).springify().damping(18)}>
            <GlassCard style={styles.inputCard}>
              <TextInput
                style={styles.input}
                placeholder="Password (min 8 chars)"
                placeholderTextColor={FuturisticTheme.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoComplete="new-password"
              />
            </GlassCard>
          </Animated.View>

          {passwordHint ? (
            <Animated.View entering={FadeInDown.delay(320)}>
              <Text style={styles.hintText}>{passwordHint}</Text>
            </Animated.View>
          ) : null}

          {error ? (
            <Animated.View entering={FadeInDown.delay(340)}>
              <Text style={styles.errorText}>{error}</Text>
            </Animated.View>
          ) : null}

          <Animated.View entering={FadeInDown.delay(380).springify().damping(18)}>
            <Pressable
              onPress={handleRegister}
              disabled={loading}
              style={({ pressed }) => [styles.button, pressed && styles.buttonPressed, loading && styles.buttonDisabled]}
            >
              {loading ? (
                <ActivityIndicator color={FuturisticTheme.bgDeep} />
              ) : (
                <Text style={styles.buttonText}>Sign up</Text>
              )}
            </Pressable>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(440).springify().damping(18)}>
            <Pressable onPress={() => router.replace('/login')} style={({ pressed }) => [styles.linkWrap, pressed && styles.linkPressed]}>
              <Text style={styles.linkText}>Already have an account? Sign in</Text>
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

