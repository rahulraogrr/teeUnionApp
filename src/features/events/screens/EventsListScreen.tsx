import React, { useState } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, useTheme, ActivityIndicator } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { EventsStackParamList } from '../../../navigation/types';
import { useGetEventsQuery } from '../../../api/eventsApi';
import { UnionEvent } from '../../../types';
import dayjs from 'dayjs';

type NavProp = NativeStackNavigationProp<EventsStackParamList, 'EventsList'>;

export default function EventsListScreen() {
  const theme = useTheme();
  const navigation = useNavigation<NavProp>();
  const [page, setPage] = useState(1);
  const { data, isLoading } = useGetEventsQuery({ page, limit: 20 });

  const renderEvent = ({ item }: { item: UnionEvent }) => {
    const isPast = dayjs(item.eventDate).isBefore(dayjs());
    return (
      <TouchableOpacity
        onPress={() => navigation.navigate('EventDetail', { eventId: item.id, title: item.titleEn })}
        activeOpacity={0.8}
      >
        <View style={[styles.card, {
          backgroundColor: theme.colors.surface,
          opacity: isPast ? 0.65 : 1,
        }]}>
          {/* Date Column */}
          <View style={[styles.dateCol, { backgroundColor: isPast ? theme.colors.surfaceVariant : theme.colors.primaryContainer }]}>
            <Text style={[styles.dateDay, { color: isPast ? theme.colors.onSurfaceVariant : theme.colors.primary }]}>
              {dayjs(item.eventDate).format('DD')}
            </Text>
            <Text style={[styles.dateMonth, { color: isPast ? theme.colors.onSurfaceVariant : theme.colors.primary }]}>
              {dayjs(item.eventDate).format('MMM').toUpperCase()}
            </Text>
            <Text style={[styles.dateYear, { color: theme.colors.onSurfaceVariant }]}>
              {dayjs(item.eventDate).format('YYYY')}
            </Text>
          </View>

          {/* Content */}
          <View style={styles.eventContent}>
            {isPast && (
              <View style={styles.pastBadge}>
                <Text style={{ fontSize: 10, color: theme.colors.onSurfaceVariant }}>PAST</Text>
              </View>
            )}
            <Text variant="bodyLarge" numberOfLines={2} style={{ fontWeight: '700', lineHeight: 22 }}>
              {item.titleEn}
            </Text>
            {item.titleTe && (
              <Text variant="bodySmall" numberOfLines={1} style={{ color: theme.colors.onSurfaceVariant, marginTop: 2 }}>
                {item.titleTe}
              </Text>
            )}
            {item.venue && (
              <Text variant="bodySmall" style={{ color: theme.colors.secondary, marginTop: 6, fontWeight: '500' }}>
                📍 {item.venue}
              </Text>
            )}
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}>
              🕐 {dayjs(item.eventDate).format('hh:mm A')}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (isLoading) return <ActivityIndicator style={{ flex: 1, marginTop: 48 }} />;

  return (
    <FlatList
      style={{ backgroundColor: theme.colors.background }}
      data={data?.data ?? []}
      keyExtractor={(e) => e.id}
      renderItem={renderEvent}
      contentContainerStyle={styles.list}
      ListEmptyComponent={
        <View style={styles.empty}>
          <Text variant="bodyLarge" style={{ color: theme.colors.onSurfaceVariant }}>No events scheduled</Text>
        </View>
      }
      onEndReached={() => {
        if (data && page * 20 < data.total) setPage(p => p + 1);
      }}
    />
  );
}

const styles = StyleSheet.create({
  list: { padding: 12, gap: 10 },
  card: { borderRadius: 14, flexDirection: 'row', overflow: 'hidden', elevation: 2 },
  dateCol: { width: 64, alignItems: 'center', justifyContent: 'center', padding: 12 },
  dateDay: { fontSize: 26, fontWeight: '800', lineHeight: 30 },
  dateMonth: { fontSize: 12, fontWeight: '700', marginTop: 2 },
  dateYear: { fontSize: 10, marginTop: 2 },
  eventContent: { flex: 1, padding: 14 },
  pastBadge: { alignSelf: 'flex-start', backgroundColor: '#eee', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2, marginBottom: 6 },
  empty: { alignItems: 'center', marginTop: 80 },
});
