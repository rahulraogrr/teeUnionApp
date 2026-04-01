import React, { useState, useCallback } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, useTheme, Chip, FAB, ActivityIndicator } from 'react-native-paper';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { TicketsStackParamList } from '../../../navigation/types';
import { useGetTicketsQuery } from '../../../api/ticketsApi';
import { useResponsive } from '../../../hooks/useResponsive';
import { useAppSelector } from '../../../store';
import { Ticket, hasRole } from '../../../types';
import dayjs from 'dayjs';

type NavProp     = NativeStackNavigationProp<TicketsStackParamList, 'TicketsList'>;
type RouteParams = RouteProp<TicketsStackParamList, 'TicketsList'>;

const STATUS_FILTERS = ['ALL', 'OPEN', 'IN_PROGRESS', 'ESCALATED', 'CLOSED'];

const STATUS_DISPLAY: Record<string, string> = {
  open: 'Open', in_progress: 'In Progress', escalated: 'Escalated',
  resolved: 'Closed', closed: 'Closed',
};

const STATUS_COLORS: Record<string, string> = {
  open: '#1565C0', in_progress: '#E65100', escalated: '#6A1B9A',
  resolved: '#757575', closed: '#757575',
};

// Keep outside component — stable reference, avoids re-creation on every render
const PRIORITY_COLORS: Record<string, string> = {
  standard: '#4CAF50', urgent: '#FF9800', critical: '#B71C1C',
};

// Estimated row height for getItemLayout (single-col)
const ITEM_HEIGHT = 96;

export default function TicketsListScreen() {
  const theme = useTheme();
  const navigation = useNavigation<NavProp>();
  const route = useRoute<RouteParams>();
  const { isTablet, twoColCards, contentWidth, hPad } = useResponsive();
  const user = useAppSelector((s) => s.auth.user);
  const isMember = !hasRole(user, 'rep', 'zonal_officer', 'admin', 'super_admin');

  const [selectedStatus, setSelectedStatus] = useState(route.params?.initialStatus ?? 'ALL');
  const [page, setPage] = useState(1);

  const apiStatus = selectedStatus === 'ALL' ? undefined : selectedStatus;
  const { data, isLoading } = useGetTicketsQuery({ page, limit: 20, status: apiStatus });

  const { data: resolvedData } = useGetTicketsQuery(
    { page, limit: 20, status: 'RESOLVED' },
    { skip: selectedStatus !== 'CLOSED' },
  );

  const tickets = selectedStatus === 'CLOSED'
    ? [...(data?.data ?? []), ...(resolvedData?.data ?? [])]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    : (data?.data ?? []);

  const cols = twoColCards ? 2 : 1;

  const handleEndReached = useCallback(() => {
    if (data && page * 20 < data.total) setPage(p => p + 1);
  }, [data, page]);

  const renderTicket = useCallback(({ item, index }: { item: Ticket; index: number }) => {
    const statusColor = STATUS_COLORS[item.status] ?? '#ccc';
    return (
      <TouchableOpacity
        style={twoColCards ? styles.gridItemWrapper : styles.listItemWrapper}
        onPress={() => navigation.navigate('TicketDetail', { ticketId: item.id })}
      >
        <View style={[styles.ticketCard, { backgroundColor: theme.colors.surface }]}>
          <View style={[styles.statusBar, { backgroundColor: statusColor }]} />
          <View style={styles.ticketBody}>
            <View style={styles.ticketHeader}>
              <Text variant="bodyLarge" numberOfLines={1} style={{ flex: 1, fontWeight: '600' }}>
                {item.title}
              </Text>
              <View style={[styles.priorityBadge, { backgroundColor: (PRIORITY_COLORS[item.priority] ?? '#ccc') + '20' }]}>
                <Text style={{ fontSize: 10, fontWeight: '700', color: PRIORITY_COLORS[item.priority] ?? '#ccc' }}>
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
  }, [theme, navigation, twoColCards]);

  const getItemLayout = useCallback((_: any, index: number) => ({
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index,
  }), []);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Filter chips — centred on tablet */}
      <View style={[styles.filterRow, isTablet && styles.filterRowTablet]}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={STATUS_FILTERS}
          keyExtractor={(s) => s}
          contentContainerStyle={[
            styles.filterList,
            isTablet && { paddingHorizontal: (contentWidth * 0.04) },
          ]}
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
          key={cols}            // force remount when column count changes
          data={tickets}
          keyExtractor={(t) => t.id}
          numColumns={cols}
          renderItem={renderTicket}
          getItemLayout={twoColCards ? undefined : getItemLayout}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={7}
          contentContainerStyle={[
            styles.list,
            isTablet && { paddingHorizontal: ((contentWidth * 0.04) / 2) + hPad },
          ]}
          columnWrapperStyle={twoColCards ? styles.columnWrapper : undefined}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text variant="bodyLarge" style={{ color: theme.colors.onSurfaceVariant }}>
                No tickets found
              </Text>
            </View>
          }
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.5}
        />
      )}

      {isMember && (
        <FAB
          icon="plus"
          style={[styles.fab, { backgroundColor: theme.colors.primary }]}
          color="#fff"
          onPress={() => navigation.navigate('CreateTicket')}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  filterRow: { height: 56 },
  filterRowTablet: { height: 64 },
  filterList: { paddingHorizontal: 12, paddingVertical: 10, gap: 8, alignItems: 'center' },
  filterChip: { marginRight: 4 },
  list: { padding: 12, paddingBottom: 80 },
  columnWrapper: { gap: 10, marginBottom: 10 },
  listItemWrapper: { marginBottom: 10 },
  gridItemWrapper: { flex: 1 },
  ticketCard: { borderRadius: 12, flexDirection: 'row', overflow: 'hidden', elevation: 1 },
  statusBar: { width: 5 },
  ticketBody: { flex: 1, padding: 12 },
  ticketHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  priorityBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  ticketFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 },
  statusChip: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  empty: { alignItems: 'center', marginTop: 80 },
  fab: { position: 'absolute', right: 24, bottom: 24 },
});
