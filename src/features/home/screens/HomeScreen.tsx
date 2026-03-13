import React from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Card, useTheme, Badge } from 'react-native-paper';
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
import { useResponsive } from '../../../hooks/useResponsive';
import dayjs from 'dayjs';

type NavProp = NativeStackNavigationProp<HomeStackParamList, 'Home'>;

export default function HomeScreen() {
  const theme = useTheme();
  const navigation = useNavigation<NavProp>();
  const user = useAppSelector((s) => s.auth.user);
  const { isTablet, isLandscape, contentWidth, hPad, twoColCards } = useResponsive();

  const { data: profile } = useGetMyProfileQuery();
  // Fetch more tickets on tablet so the 2-col grid has content
  const { data: tickets } = useGetTicketsQuery({ limit: twoColCards ? 6 : 3, page: 1 });
  const { data: unread } = useGetUnreadCountQuery();
  const { data: news } = useGetNewsQuery({ limit: twoColCards ? 4 : 2, page: 1 });
  const { data: events } = useGetEventsQuery({ limit: twoColCards ? 4 : 2, page: 1 });

  const openTickets = tickets?.data.filter(t => t.status === 'open' || t.status === 'in_progress').length ?? 0;

  // Only use two-column layout when there's actually content for both columns
  const hasRightContent = (news?.data.length ?? 0) > 0 || (events?.data.length ?? 0) > 0;
  const twoCol = isTablet && isLandscape && hasRightContent;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.content}
    >
      {/* ── Full-width header (red + navy) ─────────────────────────────── */}
      <View style={styles.headerBg}>
        <View style={[styles.headerTop, { backgroundColor: theme.colors.primary }]}>
          {/* Centred content wrapper */}
          <View style={[styles.headerInner, { maxWidth: contentWidth, alignSelf: 'center', width: '100%', paddingHorizontal: hPad }]}>
            <View style={styles.unionBadge}>
              <Text style={styles.unionBadgeText}>
                {profile?.union?.shortName ?? 'TEE 1104\' UNION'}
              </Text>
            </View>
            <View style={styles.headerRow}>
              <View style={{ flex: 1 }}>
                <Text variant="bodySmall" style={styles.greeting}>Good day,</Text>
                <Text variant={isTablet ? 'headlineSmall' : 'titleLarge'} style={styles.userName}>
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
        </View>

        {/* Navy stats strip */}
        <View style={[styles.statsStrip, { backgroundColor: theme.colors.secondary }]}>
          <View style={[styles.statsInner, { maxWidth: contentWidth, alignSelf: 'center', width: '100%' }]}>
            <StatChip icon="ticket-outline" label="Open Tickets" value={String(openTickets)} />
            <View style={styles.statDivider} />
            <StatChip icon="bell-badge-outline" label="Unread" value={String(unread?.count ?? 0)} />
            <View style={styles.statDivider} />
            <StatChip icon="account-check" label="Member" value="Active" />
          </View>
        </View>
      </View>

      {/* ── Centred content area ───────────────────────────────────────── */}
      <View style={{ alignItems: 'center' }}>
        <View style={{ width: contentWidth, paddingHorizontal: hPad }}>

          {/* Raise Ticket CTA */}
          <TouchableOpacity
            style={[styles.raiseTicketBtn, { backgroundColor: theme.colors.primary }]}
            onPress={() => navigation.getParent()?.navigate('TicketsTab', { screen: 'CreateTicket' })}
            activeOpacity={0.85}
          >
            <Icon name="ticket-outline" size={22} color="#fff" style={{ marginRight: 10 }} />
            <Text style={styles.raiseTicketText}>Raise a Ticket</Text>
            <Icon name="chevron-right" size={20} color="rgba(255,255,255,0.7)" style={{ marginLeft: 'auto' }} />
          </TouchableOpacity>

          {/* ── Two-column layout on tablet landscape ──────────────────── */}
          <View style={twoCol ? styles.twoColRow : undefined}>

            {/* Recent Tickets */}
            {(tickets?.data.length ?? 0) > 0 && (
              <View style={twoCol ? styles.twoColLeft : undefined}>
                <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>
                  Recent Tickets
                </Text>
                {/* 2-col card grid on tablet */}
                <View style={twoColCards ? styles.cardGrid : undefined}>
                  {tickets!.data.map((ticket) => (
                    <Card key={ticket.id} style={[styles.card, twoColCards && styles.cardGridItem]} mode="elevated">
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
                </View>
              </View>
            )}

            {/* Latest News + Events column */}
            <View style={twoCol ? styles.twoColRight : undefined}>
              {(news?.data.length ?? 0) > 0 && (
                <>
                  <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>
                    Latest News
                  </Text>
                  <View style={twoColCards && !twoCol ? styles.cardGrid : undefined}>
                    {news!.data.map((article) => (
                      <Card key={article.id} style={[styles.card, twoColCards && !twoCol && styles.cardGridItem]} mode="elevated">
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
                  </View>
                </>
              )}

              {(events?.data.length ?? 0) > 0 && (
                <>
                  <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>
                    Upcoming Events
                  </Text>
                  <View style={twoColCards && !twoCol ? styles.cardGrid : undefined}>
                    {events!.data.map((event) => (
                      <Card key={event.id} style={[styles.card, { borderLeftWidth: 4, borderLeftColor: theme.colors.secondary }, twoColCards && !twoCol && styles.cardGridItem]} mode="elevated">
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
                  </View>
                </>
              )}
            </View>

          </View>{/* end twoColRow */}
        </View>
      </View>

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function StatChip({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={styles.statChip}>
      <Icon name={icon} size={20} color="rgba(255,255,255,0.9)" />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function StatusDot({ status }: { status: string }) {
  const colors: Record<string, string> = {
    open: '#1565C0', in_progress: '#FF6F00', escalated: '#6A1B9A',
    resolved: '#757575', closed: '#757575',
  };
  return <View style={[styles.dot, { backgroundColor: colors[status] ?? '#ccc' }]} />;
}

function PriorityChip({ priority }: { priority: string }) {
  const colors: Record<string, string> = {
    standard: '#4CAF50', urgent: '#FF9800', critical: '#B71C1C',
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
  // Two-tone header
  headerBg: { marginBottom: 20, borderBottomLeftRadius: 24, borderBottomRightRadius: 24, overflow: 'hidden', elevation: 4 },
  headerTop: { paddingTop: 48, paddingBottom: 20 },
  headerInner: {},
  unionBadge: { backgroundColor: 'rgba(0,0,0,0.15)', borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4, alignSelf: 'flex-start', marginBottom: 16 },
  unionBadgeText: { color: 'rgba(255,255,255,0.95)', fontSize: 9, fontWeight: '700', letterSpacing: 0.8 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  greeting: { color: 'rgba(255,255,255,0.8)' },
  userName: { color: '#fff', fontWeight: '700' },
  designation: { color: 'rgba(255,255,255,0.75)', marginTop: 2 },
  bellBtn: { position: 'relative', padding: 4, marginTop: 4 },
  badge: { position: 'absolute', top: -4, right: -4 },
  // Navy stats strip
  statsStrip: { paddingVertical: 12, paddingHorizontal: 8 },
  statsInner: { flexDirection: 'row' },
  statChip: { flex: 1, alignItems: 'center', padding: 8 },
  statDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.2)', marginVertical: 4 },
  statValue: { color: '#fff', fontWeight: '700', fontSize: 18, marginTop: 4 },
  statLabel: { color: 'rgba(255,255,255,0.75)', fontSize: 10, marginTop: 2, textAlign: 'center' },
  // Raise Ticket CTA
  raiseTicketBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 4,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 14,
    elevation: 3,
  },
  raiseTicketText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  sectionTitle: { fontWeight: '700', marginBottom: 12, marginTop: 8 },
  card: { marginBottom: 10, borderRadius: 12 },
  ticketRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  ticketLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  dot: { width: 10, height: 10, borderRadius: 5, marginRight: 10 },
  priorityChip: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  eventRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  dateBadge: { width: 48, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  // Two-column layout for tablet landscape
  twoColRow: { flexDirection: 'row', gap: 20 },
  twoColLeft: { flex: 1 },
  twoColRight: { flex: 1 },
  // 2-col card grid
  cardGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  cardGridItem: { width: '48.5%' },
});
