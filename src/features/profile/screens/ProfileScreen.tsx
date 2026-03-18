import React, { useCallback } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Text, useTheme, Card, Button, ActivityIndicator, Avatar } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '../../../navigation/types';
import { membersApi, useGetMyProfileQuery, useGetTelegramStatusQuery, useUnlinkTelegramMutation, useGetTelegramLinkTokenQuery } from '../../../api/membersApi';
import { useAppDispatch } from '../../../store';
import { logout } from '../../../store/slices/authSlice';
import { authApi, useLogoutApiMutation } from '../../../api/authApi';
import { ticketsApi } from '../../../api/ticketsApi';
import { newsApi } from '../../../api/newsApi';
import { eventsApi } from '../../../api/eventsApi';
import { notificationsApi } from '../../../api/notificationsApi';
import { clearAllCredentials } from '../../../utils/storage';
import { useResponsive } from '../../../hooks/useResponsive';
import Toast from 'react-native-toast-message';

type NavProp = NativeStackNavigationProp<ProfileStackParamList, 'Profile'>;

export default function ProfileScreen() {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const navigation = useNavigation<NavProp>();
  const { data: profile, isLoading } = useGetMyProfileQuery();
  const { data: telegramStatus } = useGetTelegramStatusQuery();
  const { data: linkToken } = useGetTelegramLinkTokenQuery();
  const [unlinkTelegram, { isLoading: unlinking }] = useUnlinkTelegramMutation();
  const [logoutApi] = useLogoutApiMutation();
  const { isTablet, isLandscape, contentWidth, hPad } = useResponsive();

  const sideBySide = isTablet && isLandscape;

  const handleLogout = useCallback(async () => {
    // OWASP A07: revoke token server-side first (adds to Redis blacklist)
    try { await logoutApi().unwrap(); } catch { /* proceed even if server call fails */ }
    // OWASP M2: clear JWT from Keychain + session data from MMKV
    await clearAllCredentials();
    dispatch(membersApi.util.resetApiState());
    dispatch(authApi.util.resetApiState());
    dispatch(ticketsApi.util.resetApiState());
    dispatch(newsApi.util.resetApiState());
    dispatch(eventsApi.util.resetApiState());
    dispatch(notificationsApi.util.resetApiState());
    dispatch(logout());
  }, [dispatch, logoutApi]);

  const handleUnlinkTelegram = useCallback(async () => {
    try {
      await unlinkTelegram().unwrap();
      Toast.show({ type: 'success', text1: 'Telegram unlinked successfully' });
    } catch {
      Toast.show({ type: 'error', text1: 'Failed to unlink Telegram' });
    }
  }, [unlinkTelegram]);

  const handleEditProfile = useCallback(() => {
    navigation.navigate('EditProfile');
  }, [navigation]);

  if (isLoading) return <ActivityIndicator style={{ flex: 1, marginTop: 48 }} />;

  const initials = [profile?.firstName?.[0], profile?.lastName?.[0]].filter(Boolean).join('').toUpperCase() || 'M';

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Red header — full width with centred content */}
      <View style={[styles.headerBg, { backgroundColor: theme.colors.primary }]}>
        <Avatar.Text
          size={isTablet ? 88 : 72}
          label={initials}
          style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
        />
        <Text variant={isTablet ? 'headlineMedium' : 'headlineSmall'} style={styles.name}>
          {[profile?.firstName, profile?.middleName, profile?.lastName].filter(Boolean).join(' ') || '—'}
        </Text>
        <Text variant="bodyMedium" style={styles.empId}>
          Employee ID: {profile?.user?.employeeId}
        </Text>
        <View style={styles.roleChip}>
          <Text style={{ color: theme.colors.primary, fontWeight: '700', fontSize: 12 }}>
            {profile?.designation?.name ?? 'MEMBER'}
          </Text>
        </View>
      </View>

      {/* Centred content */}
      <View style={{ alignItems: 'center' }}>
        <View style={[styles.content, { width: contentWidth, paddingHorizontal: hPad }]}>

          {sideBySide ? (
            // ── Landscape tablet: two columns ──────────────────────────────
            <View style={styles.twoCol}>
              {/* Left: Personal details */}
              <View style={styles.twoColLeft}>
                <Card style={styles.card} mode="elevated">
                  <Card.Title
                    title="Personal Details"
                    titleVariant="titleSmall"
                    right={(p) => (
                      <Button {...p} compact onPress={handleEditProfile}>Edit</Button>
                    )}
                  />
                  <Card.Content>
                    <InfoRow icon="domain" label="Employer" value={profile?.employer?.name ?? '—'} theme={theme} />
                    <InfoRow icon="briefcase" label="Work Unit" value={profile?.workUnit?.name ?? '—'} theme={theme} />
                    <InfoRow icon="map-marker" label="District" value={profile?.district?.name ?? '—'} theme={theme} />
                    <InfoRow icon="phone" label="Mobile" value={profile?.mobileNo ?? '—'} theme={theme} />
                    <InfoRow icon="heart" label="Marital Status" value={profile?.maritalStatus ?? '—'} theme={theme} />
                  </Card.Content>
                </Card>
              </View>

              {/* Right: Telegram + Logout */}
              <View style={styles.twoColRight}>
                <TelegramCard
                  telegramStatus={telegramStatus}
                  linkToken={linkToken}
                  unlinking={unlinking}
                  onUnlink={handleUnlinkTelegram}
                  theme={theme}
                />
                <Button
                  mode="outlined"
                  onPress={handleLogout}
                  style={[styles.logoutBtn, { borderColor: theme.colors.error }]}
                  textColor={theme.colors.error}
                  icon="logout"
                >
                  Sign Out
                </Button>
              </View>
            </View>
          ) : (
            // ── Portrait: stacked ───────────────────────────────────────────
            <>
              <Card style={styles.card} mode="elevated">
                <Card.Title
                  title="Personal Details"
                  titleVariant="titleSmall"
                  right={(p) => (
                    <Button {...p} compact onPress={handleEditProfile}>Edit</Button>
                  )}
                />
                <Card.Content>
                  <InfoRow icon="domain" label="Employer" value={profile?.employer?.name ?? '—'} theme={theme} />
                  <InfoRow icon="briefcase" label="Work Unit" value={profile?.workUnit?.name ?? '—'} theme={theme} />
                  <InfoRow icon="map-marker" label="District" value={profile?.district?.name ?? '—'} theme={theme} />
                  <InfoRow icon="phone" label="Mobile" value={profile?.mobileNo ?? '—'} theme={theme} />
                  <InfoRow icon="heart" label="Marital Status" value={profile?.maritalStatus ?? '—'} theme={theme} />
                </Card.Content>
              </Card>

              <TelegramCard
                telegramStatus={telegramStatus}
                linkToken={linkToken}
                unlinking={unlinking}
                onUnlink={handleUnlinkTelegram}
                theme={theme}
              />

              <Button
                mode="outlined"
                onPress={handleLogout}
                style={[styles.logoutBtn, { borderColor: theme.colors.error }]}
                textColor={theme.colors.error}
                icon="logout"
              >
                Sign Out
              </Button>
            </>
          )}

          <View style={{ height: 40 }} />
        </View>
      </View>
    </ScrollView>
  );
}

// ─── Telegram card (memoized) ─────────────────────────────────────────────────
const TelegramCard = React.memo(function TelegramCard({ telegramStatus, linkToken, unlinking, onUnlink, theme }: any) {
  return (
    <Card style={styles.card} mode="elevated">
      <Card.Title title="Telegram Notifications" titleVariant="titleSmall" />
      <Card.Content>
        {telegramStatus?.linked ? (
          <View>
            <View style={styles.telegramLinked}>
              <Icon name="check-circle" size={20} color="#2E7D32" />
              <Text variant="bodyMedium" style={{ color: '#2E7D32', fontWeight: '600' }}>
                Linked as @{telegramStatus.username}
              </Text>
            </View>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginBottom: 12 }}>
              You'll receive push notifications via Telegram.
            </Text>
            <Button
              mode="outlined"
              onPress={onUnlink}
              loading={unlinking}
              textColor={theme.colors.error}
              style={{ borderColor: theme.colors.error }}
            >
              Unlink Telegram
            </Button>
          </View>
        ) : (
          <View>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginBottom: 12 }}>
              Link your Telegram account to receive notifications directly on Telegram.
            </Text>
            {linkToken?.token && (
              <View style={[styles.tokenBox, { backgroundColor: theme.colors.surfaceVariant }]}>
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                  Send this token to our Telegram bot:
                </Text>
                <Text variant="bodyMedium" style={{ fontWeight: '700', fontSize: 16, marginTop: 6, letterSpacing: 2 }}>
                  {linkToken.token}
                </Text>
              </View>
            )}
            <Button mode="contained" icon="send" onPress={() => {}} style={{ marginTop: 8 }}>
              Open Telegram Bot
            </Button>
          </View>
        )}
      </Card.Content>
    </Card>
  );
});

// ─── InfoRow (memoized) ───────────────────────────────────────────────────────
const InfoRow = React.memo(function InfoRow({ icon, label, value, theme }: any) {
  return (
    <View style={styles.infoRow}>
      <Icon name={icon} size={18} color={theme.colors.onSurfaceVariant} style={{ width: 24 }} />
      <View style={styles.infoText}>
        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>{label}</Text>
        <Text variant="bodyMedium" style={{ fontWeight: '500' }}>{value}</Text>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerBg: { alignItems: 'center', paddingTop: 32, paddingBottom: 32, paddingHorizontal: 20 },
  name: { color: '#fff', fontWeight: '700', marginTop: 12 },
  empId: { color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  roleChip: { marginTop: 10, backgroundColor: 'rgba(255,255,255,0.9)', paddingHorizontal: 16, paddingVertical: 5, borderRadius: 20 },
  content: { paddingVertical: 20 },
  card: { borderRadius: 12, marginBottom: 12 },
  infoRow: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 8, gap: 10 },
  infoText: { flex: 1 },
  telegramLinked: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  tokenBox: { borderRadius: 10, padding: 14, marginBottom: 8 },
  logoutBtn: { borderRadius: 8, marginTop: 8 },
  // Two-column layout (landscape tablet)
  twoCol: { flexDirection: 'row', gap: 16, alignItems: 'flex-start' },
  twoColLeft: { flex: 1 },
  twoColRight: { flex: 1 },
});
