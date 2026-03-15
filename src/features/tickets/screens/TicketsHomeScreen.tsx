import React, { useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Text, useTheme, ActivityIndicator } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { TicketsStackParamList } from '../../../navigation/types';
import { useGetTicketCountsQuery } from '../../../api/ticketsApi';
import { useAppSelector } from '../../../store';

type NavProp = NativeStackNavigationProp<TicketsStackParamList, 'TicketsHome'>;

// Member-facing statuses: RESOLVED is merged into CLOSED
const STATUS_TILES = [
  { key: 'OPEN',        label: 'Open',        icon: 'ticket-outline',   color: '#1565C0' },
  { key: 'IN_PROGRESS', label: 'In Progress',  icon: 'progress-clock',   color: '#E65100' },
  { key: 'ESCALATED',   label: 'Escalated',    icon: 'alert-circle',     color: '#6A1B9A' },
  { key: 'CLOSED',      label: 'Closed',       icon: 'archive-outline',  color: '#757575' },
] as const;

type TileKey = typeof STATUS_TILES[number]['key'];

export default function TicketsHomeScreen() {
  const theme = useTheme();
  const navigation = useNavigation<NavProp>();
  const userRole = useAppSelector((s) => s.auth.user?.role ?? 'member');
  const isMember = userRole === 'member';

  // Single API call instead of 5 separate calls
  const { data: countsData, isLoading } = useGetTicketCountsQuery();

  // CLOSED count = truly-closed + resolved (merged from member's perspective)
  const counts: Record<TileKey, number> = {
    OPEN:        countsData?.open        ?? 0,
    IN_PROGRESS: countsData?.in_progress ?? 0,
    ESCALATED:   countsData?.escalated   ?? 0,
    CLOSED:      (countsData?.closed ?? 0) + (countsData?.resolved ?? 0),
  };

  const handleTilePress = useCallback((key: TileKey) => {
    navigation.navigate('TicketsList', { initialStatus: key });
  }, [navigation]);

  const handleRaiseTicket = useCallback(() => {
    navigation.navigate('CreateTicket');
  }, [navigation]);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.content}
    >
      {/* Status tiles */}
      <View style={styles.tilesGrid}>
        {STATUS_TILES.map((tile) => (
          <TouchableOpacity
            key={tile.key}
            style={[styles.tile, { backgroundColor: theme.colors.surface, borderLeftColor: tile.color }]}
            onPress={() => handleTilePress(tile.key)}
            activeOpacity={0.75}
          >
            <View style={[styles.tileIconWrap, { backgroundColor: tile.color + '15' }]}>
              <Icon name={tile.icon} size={26} color={tile.color} />
            </View>
            <View style={styles.tileBody}>
              <Text style={[styles.tileCount, { color: tile.color }]}>
                {isLoading ? '—' : counts[tile.key]}
              </Text>
              <Text variant="bodySmall" style={[styles.tileLabel, { color: theme.colors.onSurfaceVariant }]}>
                {tile.label}
              </Text>
            </View>
            <Icon name="chevron-right" size={18} color={theme.colors.onSurfaceVariant} />
          </TouchableOpacity>
        ))}
      </View>

      {isLoading && <ActivityIndicator style={{ marginTop: 4 }} />}

      {/* Raise a Ticket CTA — members only */}
      {isMember && (
        <TouchableOpacity
          style={[styles.raiseBtn, { backgroundColor: theme.colors.primary }]}
          onPress={handleRaiseTicket}
          activeOpacity={0.85}
        >
          <Icon name="plus-circle-outline" size={22} color="#fff" style={{ marginRight: 10 }} />
          <Text style={styles.raiseBtnText}>Raise a Ticket</Text>
          <Icon name="chevron-right" size={20} color="rgba(255,255,255,0.7)" style={{ marginLeft: 'auto' }} />
        </TouchableOpacity>
      )}

      <Text variant="bodySmall" style={[styles.hint, { color: theme.colors.onSurfaceVariant }]}>
        {isMember ? 'Tap a status to view those tickets' : 'Tap a status to view assigned tickets'}
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingTop: 20 },
  tilesGrid: { gap: 12, marginBottom: 24 },
  tile: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    padding: 16,
    borderLeftWidth: 5,
    elevation: 1,
    gap: 14,
  },
  tileIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tileBody: { flex: 1 },
  tileCount: { fontSize: 28, fontWeight: '700', lineHeight: 32 },
  tileLabel: { marginTop: 2 },
  raiseBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 14,
    elevation: 3,
    marginBottom: 12,
  },
  raiseBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  hint: { textAlign: 'center', marginTop: 8 },
});
