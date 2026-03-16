import { useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { FuturisticTheme } from '@/constants/Colors';

import { FuturisticScreen } from '@/components/FuturisticScreen';
import { GlassCard } from '@/components/GlassCard';

const MOCK_BALANCE = 42.5;

export default function ProfileScreen() {
  const router = useRouter();
  const [withdrawRequested, setWithdrawRequested] = useState(false);

  return (
    <FuturisticScreen title="Profile">
      <Animated.View entering={FadeInDown.delay(100).springify().damping(18)}>
        <Text style={styles.label}>BALANCE</Text>
        <Text style={styles.hint}>Keep funds in app or request a withdrawal.</Text>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(180).springify().damping(18)}>
        <GlassCard style={styles.balanceCard}>
          <SymbolView
            name={{ ios: 'dollarsign.circle.fill', android: 'attach_money', web: 'attach_money' }}
            size={36}
            tintColor={FuturisticTheme.accent}
          />
          <View style={styles.balanceText}>
            <Text style={styles.balanceLabel}>Available balance</Text>
            <Text style={styles.balanceValue}>${MOCK_BALANCE.toFixed(2)}</Text>
          </View>
        </GlassCard>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(260).springify().damping(18)}>
        <Text style={styles.sectionTitle}>Funds</Text>
        <GlassCard style={styles.optionsCard}>
          <Pressable
            style={({ pressed }) => [styles.optionRow, pressed && styles.optionRowPressed]}
          >
            <SymbolView
              name={{ ios: 'checkmark.circle.fill', android: 'check_circle', web: 'check_circle' }}
              size={24}
              tintColor={FuturisticTheme.accent}
            />
            <View style={styles.optionText}>
              <Text style={styles.optionLabel}>Keep in app</Text>
              <Text style={styles.optionDesc}>Use balance for future games</Text>
            </View>
          </Pressable>
          <View style={styles.optionDivider} />
          <Pressable
            onPress={() => setWithdrawRequested(true)}
            style={({ pressed }) => [styles.optionRow, pressed && styles.optionRowPressed]}
          >
            <SymbolView
              name={{ ios: 'arrow.down.circle.fill', android: 'arrow_downward', web: 'arrow_downward' }}
              size={24}
              tintColor={FuturisticTheme.accentTeal}
            />
            <View style={styles.optionText}>
              <Text style={styles.optionLabel}>Request withdrawal</Text>
              <Text style={styles.optionDesc}>Send to your linked account</Text>
            </View>
          </Pressable>
        </GlassCard>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(340).springify().damping(18)}>
        <Text style={styles.sectionTitle}>History</Text>
        <Pressable
          onPress={() => router.push('/match-history')}
          style={({ pressed }) => [pressed && styles.optionRowPressed]}
        >
          <GlassCard style={styles.matchHistoryCard}>
            <View style={styles.matchHistoryRow}>
              <SymbolView
                name={{ ios: 'clock.arrow.circlepath', android: 'history', web: 'history' }}
                size={24}
                tintColor={FuturisticTheme.accent}
              />
              <View style={styles.optionText}>
                <Text style={styles.optionLabel}>Match history</Text>
                <Text style={styles.optionDesc}>View past games and results</Text>
              </View>
              <SymbolView
                name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }}
                size={20}
                tintColor={FuturisticTheme.textMuted}
              />
            </View>
          </GlassCard>
        </Pressable>
      </Animated.View>

      {withdrawRequested && (
        <Animated.View entering={FadeInDown.delay(100)} style={styles.toast}>
          <GlassCard style={styles.toastCard}>
            <Text style={styles.toastText}>Withdrawal requested. You’ll be notified when it’s processed.</Text>
            <Pressable onPress={() => setWithdrawRequested(false)}>
              <Text style={styles.toastDismiss}>Dismiss</Text>
            </Pressable>
          </GlassCard>
        </Animated.View>
      )}

      <Animated.View entering={FadeInDown.delay(480).springify().damping(18)} style={styles.signOutSection}>
        <Pressable
          onPress={() => router.replace('/login')}
          style={({ pressed }) => [styles.signOutButton, pressed && styles.optionRowPressed]}
        >
          <Text style={styles.signOutText}>Sign out</Text>
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
  balanceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 28,
  },
  balanceText: {
    marginLeft: 16,
  },
  balanceLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: FuturisticTheme.textMuted,
  },
  balanceValue: {
    fontSize: 28,
    fontWeight: '800',
    color: FuturisticTheme.textPrimary,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: FuturisticTheme.textMuted,
    marginBottom: 12,
  },
  optionsCard: {
    paddingVertical: 4,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
  },
  optionRowPressed: {
    opacity: 0.8,
  },
  optionLabel: {
    fontSize: 17,
    fontWeight: '600',
    color: FuturisticTheme.textPrimary,
  },
  optionDesc: {
    fontSize: 14,
    color: FuturisticTheme.textSecondary,
    marginTop: 2,
  },
  optionText: {
    marginLeft: 14,
    flex: 1,
  },
  optionDivider: {
    height: 1,
    backgroundColor: FuturisticTheme.glassBorder,
  },
  matchHistoryCard: {
    marginBottom: 0,
  },
  matchHistoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toast: {
    marginTop: 24,
  },
  toastCard: {
    borderColor: FuturisticTheme.accent,
  },
  toastText: {
    fontSize: 15,
    color: FuturisticTheme.textPrimary,
    marginBottom: 10,
  },
  toastDismiss: {
    fontSize: 15,
    fontWeight: '600',
    color: FuturisticTheme.accent,
  },
  signOutSection: {
    marginTop: 32,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: FuturisticTheme.glassBorder,
  },
  signOutButton: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '600',
    color: FuturisticTheme.textMuted,
  },
});
