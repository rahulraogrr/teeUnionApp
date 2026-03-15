import React, { useCallback } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { Text, useTheme, ActivityIndicator, Button } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useGetNotificationsQuery, useMarkAllReadMutation } from '../../../api/notificationsApi';
import { AppNotification } from '../../../types';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import Toast from 'react-native-toast-message';

dayjs.extend(relativeTime);

export default function NotificationsScreen() {
  const theme = useTheme();
  const { data, isLoading } = useGetNotificationsQuery({ limit: 50 });
  const [markAllRead, { isLoading: marking }] = useMarkAllReadMutation();

  const handleMarkAll = useCallback(async () => {
    try {
      await markAllRead().unwrap();
      Toast.show({ type: 'success', text1: 'All notifications marked as read' });
    } catch {
      Toast.show({ type: 'error', text1: 'Failed to update notifications' });
    }
  }, [markAllRead]);

  const renderItem = useCallback(({ item }: { item: AppNotification }) => (
    <View style={[
      styles.notifCard,
      {
        backgroundColor: item.read ? theme.colors.surface : theme.colors.primaryContainer,
        borderLeftColor: item.read ? theme.colors.outlineVariant : theme.colors.primary,
      }
    ]}>
      <View style={[styles.iconWrap, { backgroundColor: item.read ? theme.colors.surfaceVariant : theme.colors.primary + '20' }]}>
        <Icon name={item.read ? 'bell-check-outline' : 'bell-ring-outline'} size={20}
          color={item.read ? theme.colors.onSurfaceVariant : theme.colors.primary} />
      </View>
      <View style={styles.notifBody}>
        <Text variant="bodyMedium" style={{ fontWeight: item.read ? '400' : '700' }}>
          {item.title}
        </Text>
        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 2, lineHeight: 18 }}>
          {item.body}
        </Text>
        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 6 }}>
          {dayjs(item.createdAt).fromNow()}
        </Text>
      </View>
      {!item.read && <View style={[styles.unreadDot, { backgroundColor: theme.colors.primary }]} />}
    </View>
  ), [theme]);

  if (isLoading) return <ActivityIndicator style={{ flex: 1, marginTop: 48 }} />;

  const unreadCount = data?.data.filter(n => !n.read).length ?? 0;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header bar */}
      {unreadCount > 0 && (
        <View style={[styles.topBar, { backgroundColor: theme.colors.surface }]}>
          <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
            {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
          </Text>
          <Button compact onPress={handleMarkAll} loading={marking} disabled={marking}>
            Mark all read
          </Button>
        </View>
      )}

      <FlatList
        data={data?.data ?? []}
        keyExtractor={(n) => n.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        initialNumToRender={15}
        maxToRenderPerBatch={10}
        windowSize={7}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Icon name="bell-sleep-outline" size={56} color={theme.colors.onSurfaceVariant} />
            <Text variant="bodyLarge" style={{ color: theme.colors.onSurfaceVariant, marginTop: 12 }}>
              All caught up!
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 6, elevation: 1 },
  list: { padding: 12, gap: 8 },
  notifCard: { flexDirection: 'row', borderRadius: 12, borderLeftWidth: 4, padding: 12, alignItems: 'flex-start', gap: 10 },
  iconWrap: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  notifBody: { flex: 1 },
  unreadDot: { width: 8, height: 8, borderRadius: 4, marginTop: 6 },
  empty: { alignItems: 'center', marginTop: 100 },
});
