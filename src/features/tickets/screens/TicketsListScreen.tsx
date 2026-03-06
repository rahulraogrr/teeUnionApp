import React, { useState } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, useTheme, Chip, FAB, ActivityIndicator, Searchbar } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { TicketsStackParamList } from '../../../navigation/types';
import { useGetTicketsQuery } from '../../../api/ticketsApi';
import { Ticket } from '../../../types';
import dayjs from 'dayjs';

type NavProp = NativeStackNavigationProp<TicketsStackParamList, 'TicketsList'>;

const STATUS_FILTERS = ['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];

export default function TicketsListScreen() {
  const theme = useTheme();
  const navigation = useNavigation<NavProp>();
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [page, setPage] = useState(1);

  const { data, isLoading, isFetching } = useGetTicketsQuery({
    page, limit: 20,
    status: selectedStatus === 'ALL' ? undefined : selectedStatus,
  });

  const statusColors: Record<string, string> = {
    OPEN: '#1565C0', IN_PROGRESS: '#FF6F00', RESOLVED: '#2E7D32', CLOSED: '#757575',
  };
  const priorityColors: Record<string, string> = {
    LOW: '#4CAF50', MEDIUM: '#FF9800', HIGH: '#F44336', CRITICAL: '#B71C1C',
  };

  const renderTicket = ({ item }: { item: Ticket }) => (
    <TouchableOpacity onPress={() => navigation.navigate('TicketDetail', { ticketId: item.id })}>
      <View style={[styles.ticketCard, { backgroundColor: theme.colors.surface }]}>
        <View style={[styles.statusBar, { backgroundColor: statusColors[item.status] ?? '#ccc' }]} />
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
            <View style={[styles.statusChip, { backgroundColor: (statusColors[item.status] ?? '#ccc') + '15' }]}>
              <Text style={{ fontSize: 11, fontWeight: '600', color: statusColors[item.status] ?? '#ccc' }}>
                {item.status.replace('_', ' ')}
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

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Status Filter */}
      <View>
        <FlatList
          horizontal showsHorizontalScrollIndicator={false}
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
      </View>

      {isLoading ? (
        <ActivityIndicator style={{ marginTop: 48 }} />
      ) : (
        <FlatList
          data={data?.data ?? []}
          keyExtractor={(t) => t.id}
          renderItem={renderTicket}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text variant="bodyLarge" style={{ color: theme.colors.onSurfaceVariant }}>No tickets found</Text>
            </View>
          }
          onEndReached={() => {
            if (data && page * 20 < data.total) setPage(p => p + 1);
          }}
          onEndReachedThreshold={0.5}
        />
      )}

      <FAB icon="plus" style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        color="#fff" onPress={() => navigation.navigate('CreateTicket')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  filterList: { paddingHorizontal: 12, paddingVertical: 10, gap: 8 },
  filterChip: { marginRight: 4 },
  list: { padding: 12, gap: 10 },
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
