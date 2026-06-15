import { useRouter, useFocusEffect } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { FuturisticTheme } from '@/constants/Colors';
import { MONEY_ENABLED } from '@/constants/api';
import { ApiError } from '@/lib/api';
import { clearToken } from '@/lib/auth-store';
import { getMe, updateDisplayName } from '@/lib/users-api';

import { FuturisticScreen } from '@/components/FuturisticScreen';
import { GlassCard } from '@/components/GlassCard';

export default function ProfileScreen() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState<string | undefined>(undefined);
  const [isGuest, setIsGuest] = useState(false);
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const [editing, setEditing] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const loadProfile = useCallback(async () => {
    try {
      const user = await getMe();
      setDisplayName(user.displayName || (user.isGuest ? 'Guest' : 'Player'));
      setEmail(user.email);
      setIsGuest(!!user.isGuest);
      setBalance(user.balance);
    } catch {
      setBalance(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [loadProfile])
  );

  const openEdit = () => {
    setNameInput(displayName);
    setEditError(null);
    setEditing(true);
  };

  const saveName = async () => {
    const next = nameInput.trim();
    if (!next) return;
    setSaving(true);
    setEditError(null);
    try {
      const user = await updateDisplayName(next);
      setDisplayName(user.displayName);
      setEditing(false);
    } catch (e) {
      setEditError(e instanceof ApiError ? e.message : 'Could not update name');
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    await clearToken();
    router.replace('/login');
  };

  return (
    <FuturisticScreen title="Profile">
      {/* Identity */}
      <Animated.View entering={FadeInDown.delay(80).springify().damping(18)}>
        <GlassCard style={styles.identityCard}>
          <View style={styles.avatar}>
            <SymbolView
              name={{ ios: 'person.fill', android: 'person', web: 'person' }}
              size={26}
              tintColor={FuturisticTheme.accent}
            />
          </View>
          <View style={styles.identityText}>
            <Text style={styles.identityName} numberOfLines={1}>
              {loading ? '—' : displayName}
            </Text>
            <Text style={styles.identitySub} numberOfLines={1}>
              {isGuest ? 'Playing as guest' : email || 'Signed in'}
            </Text>
          </View>
          <Pressable onPress={openEdit} hitSlop={10} style={({ pressed }) => [styles.editBtn, pressed && styles.pressed]}>
            <SymbolView
              name={{ ios: 'pencil', android: 'edit', web: 'edit' }}
              size={18}
              tintColor={FuturisticTheme.textSecondary}
            />
          </Pressable>
        </GlassCard>
      </Animated.View>

      {/* Standings */}
      <Animated.View entering={FadeInDown.delay(140).springify().damping(18)}>
        <Text style={styles.sectionTitle}>STANDINGS</Text>
        <GlassCard style={styles.balanceCard}>
          <SymbolView
            name={{ ios: 'chart.line.uptrend.xyaxis', android: 'trending_up', web: 'trending_up' }}
            size={32}
            tintColor={FuturisticTheme.accent}
          />
          <View style={styles.balanceText}>
            <Text style={styles.balanceLabel}>Net across all games</Text>
            <Text style={[styles.balanceValue, !loading && (balance ?? 0) < 0 && styles.balanceNegative]}>
              {loading ? '—' : `${(balance ?? 0) >= 0 ? '+' : '−'}$${Math.abs(balance ?? 0).toFixed(2)}`}
            </Text>
          </View>
        </GlassCard>
      </Animated.View>

      {MONEY_ENABLED ? (
        <Animated.View entering={FadeInDown.delay(200).springify().damping(18)}>
          <GlassCard style={styles.infoCard}>
            <Pressable
              onPress={() => router.push('/withdraw' as import('expo-router').Href)}
              style={({ pressed }) => [styles.optionRow, pressed && styles.pressed]}
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
      ) : (
        <Animated.View entering={FadeInDown.delay(200).springify().damping(18)}>
          <GlassCard style={styles.infoCard}>
            <View style={styles.optionRow}>
              <SymbolView
                name={{ ios: 'person.2.fill', android: 'group', web: 'group' }}
                size={24}
                tintColor={FuturisticTheme.accent}
              />
              <View style={styles.optionText}>
                <Text style={styles.optionLabel}>Settle up with friends</Text>
                <Text style={styles.optionDesc}>
                  After each game, open the results to see who owes whom. Pay each other directly.
                </Text>
              </View>
            </View>
          </GlassCard>
        </Animated.View>
      )}

      {/* History (signed-up) or upsell (guest) */}
      <Animated.View entering={FadeInDown.delay(260).springify().damping(18)}>
        <Text style={styles.sectionTitle}>HISTORY</Text>
        {isGuest ? (
          <Pressable onPress={() => router.push('/register')} style={({ pressed }) => [pressed && styles.pressed]}>
            <GlassCard style={styles.upsellCard}>
              <SymbolView
                name={{ ios: 'sparkles', android: 'star', web: 'star' }}
                size={24}
                tintColor={FuturisticTheme.accent}
              />
              <View style={styles.optionText}>
                <Text style={styles.optionLabel}>Create an account to save your history</Text>
                <Text style={styles.optionDesc}>
                  Guests can play and see the current game, but match history is saved only when you sign up.
                </Text>
              </View>
              <SymbolView
                name={{ ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' }}
                size={18}
                tintColor={FuturisticTheme.textMuted}
              />
            </GlassCard>
          </Pressable>
        ) : (
          <Pressable onPress={() => router.push('/match-history')} style={({ pressed }) => [pressed && styles.pressed]}>
            <GlassCard style={styles.infoCard}>
              <View style={styles.optionRow}>
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
                  size={18}
                  tintColor={FuturisticTheme.textMuted}
                />
              </View>
            </GlassCard>
          </Pressable>
        )}
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(340).springify().damping(18)} style={styles.signOutSection}>
        <Pressable onPress={handleSignOut} style={({ pressed }) => [styles.signOutButton, pressed && styles.pressed]}>
          <Text style={styles.signOutText}>Sign out</Text>
        </Pressable>
      </Animated.View>

      {/* Edit name modal */}
      <Modal visible={editing} transparent animationType="fade" onRequestClose={() => setEditing(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setEditing(false)}>
          <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.modalTitle}>Edit name</Text>
            <Text style={styles.modalSubtitle}>This is how you appear in games.</Text>
            <TextInput
              style={styles.modalInput}
              value={nameInput}
              onChangeText={setNameInput}
              placeholder="Your name"
              placeholderTextColor={FuturisticTheme.textMuted}
              autoCapitalize="words"
              autoFocus
              maxLength={40}
              returnKeyType="done"
              onSubmitEditing={saveName}
            />
            {editError ? <Text style={styles.errorText}>{editError}</Text> : null}
            <Pressable
              onPress={saveName}
              disabled={saving || !nameInput.trim()}
              style={({ pressed }) => [styles.saveBtn, pressed && styles.pressed, (saving || !nameInput.trim()) && styles.disabled]}
            >
              {saving ? <ActivityIndicator color={FuturisticTheme.bgDeep} /> : <Text style={styles.saveBtnText}>Save</Text>}
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </FuturisticScreen>
  );
}

const styles = StyleSheet.create({
  identityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: FuturisticTheme.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  identityText: { flex: 1 },
  identityName: {
    fontSize: 20,
    fontWeight: '800',
    color: FuturisticTheme.textPrimary,
    letterSpacing: -0.3,
  },
  identitySub: {
    fontSize: 14,
    color: FuturisticTheme.textSecondary,
    marginTop: 2,
  },
  editBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: FuturisticTheme.bgDeep,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.5,
    color: FuturisticTheme.textMuted,
    marginBottom: 10,
  },
  balanceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  balanceText: { marginLeft: 16 },
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
    letterSpacing: -0.5,
  },
  balanceNegative: { color: '#FF5252' },
  infoCard: { marginBottom: 24 },
  upsellCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    borderColor: FuturisticTheme.accentSoft,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionText: { marginLeft: 14, flex: 1 },
  optionLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: FuturisticTheme.textPrimary,
  },
  optionDesc: {
    fontSize: 14,
    lineHeight: 19,
    color: FuturisticTheme.textSecondary,
    marginTop: 2,
  },
  pressed: { opacity: 0.7 },
  signOutSection: {
    marginTop: 16,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: FuturisticTheme.divider,
  },
  signOutButton: { paddingVertical: 14, alignItems: 'center' },
  signOutText: {
    fontSize: 16,
    fontWeight: '600',
    color: FuturisticTheme.textMuted,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: FuturisticTheme.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: FuturisticTheme.border,
    padding: 22,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: FuturisticTheme.textPrimary,
    letterSpacing: -0.4,
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    color: FuturisticTheme.textSecondary,
    marginBottom: 16,
  },
  modalInput: {
    fontSize: 17,
    color: FuturisticTheme.textPrimary,
    backgroundColor: FuturisticTheme.bgDeep,
    borderWidth: 1,
    borderColor: FuturisticTheme.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  saveBtn: {
    height: 50,
    borderRadius: 14,
    backgroundColor: FuturisticTheme.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  saveBtnText: {
    color: FuturisticTheme.bgDeep,
    fontSize: 17,
    fontWeight: '700',
  },
  disabled: { opacity: 0.5 },
  errorText: {
    fontSize: 14,
    color: '#FF5252',
    marginTop: 10,
  },
});
