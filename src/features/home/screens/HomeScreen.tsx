import React from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Card, useTheme, Avatar, Badge, ActivityIndicator } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { HomeStackParamList } from '../../../navigation/types';
import { useAppSelector } from '../../../store';
import { useGetMyProfileQuery } from '../../../api/membersApi';
import { useGetTicketsQuery } from '../../../api/ticketsApi';
import { useGetUnreadCountQuery } from '../../../api/notificationsApi';
import { useGetNewsQuery } from '../../../api/newsApi';
import { useGetEventsQuery } from '../../../api/eventsApi';
import dayjs from 'dayjs';

type NavProp = NativeStackNavigationProp<HomeStackParamList, 'Home'>;

export default function HomeScreen() {
  const theme = useTheme();
  const navigation = useNavigation<NavProp>();
  const user = useAppSelector((s) => s.auth.user);

  const { data: profile } = useGetMyProfileQuery();
  const { data: tickets } = useGetTicketsQuery({ limit: 3, page: 1 });
  const { data: unread } = useGetUnreadCountQuery();
  const { data: news } = useGetNewsQuery({ limit: 2, page: 1 });
  const { data: events } = useGetEventsQuery({ limit: 2, page: 1 });

  const openTickets = tickets?.data.filter(t => t.status === 'OPEN' || t.status === 'IN_PROGRESS').length ?? 0;

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.content}>

      {/* Header — red top bar (logo red) + navy stats strip */}
      <View style={styles.headerBg}>
        {/* Red section */}
        <View style={[styles.headerTop, { backgroundColor: theme.colors.primary }]}>
          {/* Union badge strip */}
          <View style={styles.unionBadge}>
            <Text style={styles.unionBadgeText}>
              {profile?.union?.shortName ?? 'TEE 1104\' UNION'}
            </Text>
          </View>

          <View style={styles.headerRow}>
            <View style={{ flex: 1 }}>
              <Text variant="bodySmall" style={styles.greeting}>Good day,</Text>
              <Text variant="titleLarge" style={styles.userName}>
                {profile?.fullName ?? profile?.user?.employeeId ?? user?.employeeId ?? 'Member'}
              </Text>
              <Text variant="bodySmall" style={styles.designation}>
                {profile?.designation?.name ?? ''}{profile?.employer?.shortName ? ` · ${profile.employer.shortName}` : ''}
              </Text>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('Notifications')} style={styles.bellBtn}>
              <Icon name="bell-outline" size={26} color="#fff" />
              {(unread?.count ?? 0) > 0 && (
                <Badge style={styles.badge}>{unread!.count}</Badge>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Navy stats strip */}
        <View style={[styles.statsStrip, { backgroundColor: theme.colors.secondary }]}>
          <StatChip icon="ticket-outline" label="Open Tickets" value={String(openTickets)} theme={theme} />
          <View style={styles.statDivider} />
          <StatChip icon="bell-badge-outline" label="Unread" value={String(unread?.count ?? 0)} theme={theme} />
          <View style={styles.statDivider} />
          <StatChip icon="account-check" label="Member" value="Active" theme={theme} />
        </View>
      </View>

      {/* Quick Actions */}
      <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>
        Quick Actions
      </Text>
      <View style={styles.actionsGrid}>
        <QuickAction icon="ticket-outline" label="Raise Ticket" color="#C62828" onPress={() => {}} />
        <QuickAction icon="newspaper" label="Latest News" color="#1A237E" onPress={() => {}} />
        <QuickAction icon="calendar-month" label="Events" color="#C62828" onPress={() => {}} />
        <QuickAction icon="account-settings" label="My Profile" color="#1A237E" onPress={() => {}} />
      </View>

      {/* Recent Tickets */}
      {(tickets?.data.length ?? 0) > 0 && (
        <>
          <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>
            Recent Tickets
          </Text>
          {tickets!.data.slice(0, 3).map((ticket) => (
            <Card key={ticket.id} style={styles.card} mode="elevated">
              <Card.Content style={styles.ticketRow}>
                <View style={styles.ticketLeft}>
                  <StatusDot status={ticket.status} />
                  <View style={{ flex: 1 }}>
                    <Text variant="bodyMedium" numberOfLines={1} style={{ fontWeight: '600' }}>
                      {ticket.title}
                    </Text>
                    <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                      {ticket.status} · {dayjs(ticket.createdAt).format('DD MMM')}
                    </Text>
                  </View>
                </View>
                <PriorityChip priority={ticket.priority} />
              </Card.Content>
            </Card>
          ))}
        </>
      )}

      {/* Latest News */}
      {(news?.data.length ?? 0) > 0 && (
        <>
          <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>
            Latest News
          </Text>
          {news!.data.map((article) => (
            <Card key={article.id} style={styles.card} mode="elevated">
              <Card.Content>
                <Text variant="bodyMedium" numberOfLines={2} style={{ fontWeight: '600' }}>
                  {article.titleEn}
                </Text>
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}>
                  {dayjs(article.createdAt).format('DD MMM YYYY')}
                </Text>
              </Card.Content>
            </Card>
          ))}
        </>
      )}

      {/* Upcoming Events */}
      {(events?.data.length ?? 0) > 0 && (
        <>
          <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>
            Upcoming Events
          </Text>
          {events!.data.map((event) => (
            <Card key={event.id} style={[styles.card, { borderLeftWidth: 4, borderLeftColor: theme.colors.secondary }]} mode="elevated">
              <Card.Content style={styles.eventRow}>
                <View style={[styles.dateBadge, { backgroundColor: theme.colors.secondaryContainer }]}>
                  <Text style={{ fontSize: 18, fontWeight: '700', color: theme.colors.secondary }}>
                    {dayjs(event.eventDate).format('DD')}
                  </Text>
                  <Text style={{ fontSize: 10, color: theme.colors.secondary }}>
                    {dayjs(event.eventDate).format('MMM').toUpperCase()}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text variant="bodyMedium" numberOfLines={1} style={{ fontWeight: '600' }}>
                    {event.titleEn}
                  </Text>
                  {event.venue && (
                    <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                      📍 {event.venue}
                    </Text>
                  )}
                </View>
              </Card.Content>
            </Card>
          ))}
        </>
      )}

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function StatChip({ icon, label, value, theme }: any) {
  return (
    <View style={styles.statChip}>
      <Icon name={icon} size={20} color="rgba(255,255,255,0.9)" />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function QuickAction({ icon, label, color, onPress }: any) {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.quickAction, { borderColor: color + '30' }]}>
      <View style={[styles.qaIcon, { backgroundColor: color + '15' }]}>
        <Icon name={icon} size={28} color={color} />
      </View>
      <Text variant="bodySmall" style={{ fontWeight: '600', textAlign: 'center', marginTop: 6 }}>{label}</Text>
    </TouchableOpacity>
  );
}

function StatusDot({ status }: { status: string }) {
  const colors: Record<string, string> = {
    OPEN: '#1565C0', IN_PROGRESS: '#FF6F00', RESOLVED: '#2E7D32', CLOSED: '#757575',
  };
  return <View style={[styles.dot, { backgroundColor: colors[status] ?? '#ccc' }]} />;
}

function PriorityChip({ priority }: { priority: string }) {
  const colors: Record<string, string> = {
    LOW: '#4CAF50', MEDIUM: '#FF9800', HIGH: '#F44336', CRITICAL: '#B71C1C',
  };
  return (
    <View style={[styles.priorityChip, { backgroundColor: (colors[priority] ?? '#ccc') + '20' }]}>
      <Text style={{ fontSize: 10, fontWeight: '700', color: colors[priority] ?? '#ccc' }}>
        {priority}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingBottom: 24 },
  // Two-tone header: red top + navy stats strip
  headerBg: { marginBottom: 20, borderBottomLeftRadius: 24, borderBottomRightRadius: 24, overflow: 'hidden', elevation: 4 },
  headerTop: { paddingTop: 48, paddingHorizontal: 20, paddingBottom: 20 },
  unionBadge: { backgroundColor: 'rgba(0,0,0,0.15)', borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4, alignSelf: 'flex-start', marginBottom: 16 },
  unionBadgeText: { color: 'rgba(255,255,255,0.95)', fontSize: 9, fontWeight: '700', letterSpacing: 0.8 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  greeting: { color: 'rgba(255,255,255,0.8)' },
  userName: { color: '#fff', fontWeight: '700' },
  designation: { color: 'rgba(255,255,255,0.75)', marginTop: 2 },
  bellBtn: { position: 'relative', padding: 4, marginTop: 4 },
  badge: { position: 'absolute', top: -4, right: -4 },
  // Navy stats strip
  statsStrip: { flexDirection: 'row', paddingVertical: 12, paddingHorizontal: 8 },
  statChip: { flex: 1, alignItems: 'center', padding: 8 },
  statDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.2)', marginVertical: 4 },
  statValue: { color: '#fff', fontWeight: '700', fontSize: 18, marginTop: 4 },
  statLabel: { color: 'rgba(255,255,255,0.75)', fontSize: 10, marginTop: 2, textAlign: 'center' },
  sectionTitle: { fontWeight: '700', marginHorizontal: 16, marginTop: 8, marginBottom: 12 },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12, gap: 8, marginBottom: 8 },
  quickAction: { width: '47%', borderRadius: 12, padding: 16, alignItems: 'center', borderWidth: 1, backgroundColor: '#fff', elevation: 1 },
  qaIcon: { width: 52, height: 52, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  card: { marginHorizontal: 16, marginBottom: 10, borderRadius: 12 },
  ticketRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  ticketLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  dot: { width: 10, height: 10, borderRadius: 5, marginRight: 10 },
  priorityChip: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  eventRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  dateBadge: { width: 48, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
});
