import React, { useState } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, useTheme, Chip, FAB, ActivityIndicator } from 'react-native-paper';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { TicketsStackParamList } from '../../../navigation/types';
import { useGetTicketsQuery } from '../../../api/ticketsApi';
import { Ticket } from '../../../types';
import dayjs from 'dayjs';

type NavProp     = NativeStackNavigationProp<TicketsStackParamList, 'TicketsList'>;
type RouteParams = RouteProp<TicketsStackParamList, 'TicketsList'>;

// RESOLVED is not shown as a separate filter — it displays as "Closed"
const STATUS_FILTERS = ['ALL', 'OPEN', 'IN_PROGRESS', 'ESCALATED', 'CLOSED'];

// Map backend status → display label (RESOLVED shown as Closed to member)
const STATUS_DISPLAY: Record<string, string> = {
  OPEN: 'Open', IN_PROGRESS: 'In Progress', ESCALATED: 'Escalated',
  RESOLVED: 'Closed', CLOSED: 'Closed',
};

const STATUS_COLORS: Record<string, string> = {
  OPEN: '#1565C0', IN_PROGRESS: '#E65100', ESCALATED: '#6A1B9A',
  RESOLVED: '#757575', CLOSED: '#757575',
};

export default function TicketsListScreen() {
  const theme = useTheme();
  const navigation = useNavigation<NavProp>();
  const route = useRoute<RouteParams>();

  const [selectedStatus, setSelectedStatus] = useState(route.params?.initialStatus ?? 'ALL');
  const [page, setPage] = useState(1);

  // When member selects "CLOSED", also fetch RESOLVED tickets (same concept to them)
  const apiStatus = selectedStatus === 'ALL' ? undefined : selectedStatus;

  const { data, isLoading } = useGetTicketsQuery({ page, limit: 20, status: apiStatus });

  // Extra query for RESOLVED when CLOSED is selected — combined below
  const { data: resolvedData } = useGetTicketsQuery(
    { page, limit: 20, status: 'RESOLVED' },
    { skip: selectedStatus !== 'CLOSED' },
  );

  // Merge CLOSED + RESOLVED when CLOSED filter is active
  const tickets = selectedStatus === 'CLOSED'
    ? [...(data?.data ?? []), ...(resolvedData?.data ?? [])]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    : (data?.data ?? []);

  const priorityColors: Record<string, string> = {
    standard: '#4CAF50', urgent: '#FF9800', critical: '#B71C1C',
  };

  const renderTicket = ({ item }: { item: Ticket }) => {
    const statusColor = STATUS_COLORS[item.status] ?? '#ccc';
    return (
      <TouchableOpacity onPress={() => navigation.navigate('TicketDetail', { ticketId: item.id })}>
        <View style={[styles.ticketCard, { backgroundColor: theme.colors.surface }]}>
          <View style={[styles.statusBar, { backgroundColor: statusColor }]} />
          <View style={styles.ticketBody}>
            <View style={styles.ticketHeader}>
              <Text variant="bodyLarge" numberOfLines={1} style={{ flex: 1, fontWeight: '600' }}>
                {item.title}
              </Text>
              <View style={[styles.priorityBadge, { backgroundColor: (priorityColors[item.priority] ?? '#ccc') + '20' }]}>
                <Text style={{ fontSize: 10, fontWeight: '700', color: priorityColors[item.priority] ?? '#ccc' }}>
                  {item.priority}
                </Text>
              </View>
            </View>
            <Text variant="bodySmall" numberOfLines={2} style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}>
              {item.description}
            </Text>
            <View style={styles.ticketFooter}>
              <View style={[styles.statusChip, { backgroundColor: statusColor + '15' }]}>
                <Text style={{ fontSize: 11, fontWeight: '600', color: statusColor }}>
                  {STATUS_DISPLAY[item.status] ?? item.status}
                </Text>
              </View>
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                {dayjs(item.createdAt).format('DD MMM YYYY')}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Status filter chips */}
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={STATUS_FILTERS}
        keyExtractor={(s) => s}
        contentContainerStyle={styles.filterList}
        renderItem={({ item }) => (
          <Chip
            selected={selectedStatus === item}
            onPress={() => { setSelectedStatus(item); setPage(1); }}
            style={styles.filterChip}
            compact
          >
            {item === 'ALL' ? 'All' : item.replace('_', ' ')}
          </Chip>
        )}
      />

      {isLoading ? (
        <ActivityIndicator style={{ marginTop: 48 }} />
      ) : (
        <FlatList
          data={tickets}
          keyExtractor={(t) => t.id}
          renderItem={renderTicket}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text variant="bodyLarge" style={{ color: theme.colors.onSurfaceVariant }}>
                No tickets found
              </Text>
            </View>
          }
          onEndReached={() => {
            if (data && page * 20 < data.total) setPage(p => p + 1);
          }}
          onEndReachedThreshold={0.5}
        />
      )}

      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        color="#fff"
        onPress={() => navigation.navigate('CreateTicket')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  filterList: { paddingHorizontal: 12, paddingVertical: 10, gap: 8 },
  filterChip: { marginRight: 4 },
  list: { padding: 12, gap: 10, paddingBottom: 80 },
  ticketCard: { borderRadius: 12, flexDirection: 'row', overflow: 'hidden', elevation: 1 },
  statusBar: { width: 5 },
  ticketBody: { flex: 1, padding: 12 },
  ticketHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  priorityBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  ticketFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 },
  statusChip: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  empty: { alignItems: 'center', marginTop: 80 },
  fab: { position: 'absolute', right: 16, bottom: 24 },
});
