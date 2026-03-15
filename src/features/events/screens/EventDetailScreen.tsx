import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Text, useTheme, ActivityIndicator, Divider, Card } from 'react-native-paper';
import { RouteProp, useRoute } from '@react-navigation/native';
import { EventsStackParamList } from '../../../navigation/types';
import { useGetEventByIdQuery } from '../../../api/eventsApi';
import dayjs from 'dayjs';

type RouteP = RouteProp<EventsStackParamList, 'EventDetail'>;

export default function EventDetailScreen() {
  const theme = useTheme();
  const { params } = useRoute<RouteP>();
  const { data: event, isLoading } = useGetEventByIdQuery(params.eventId);

  if (isLoading) return <ActivityIndicator style={{ flex: 1, marginTop: 48 }} />;
  if (!event) return null;

  const isPast = dayjs(event.eventDate).isBefore(dayjs());

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { backgroundColor: isPast ? theme.colors.surfaceVariant : theme.colors.primary }]}>
        <View style={styles.dateBanner}>
          <Text style={[styles.bigDay, { color: isPast ? theme.colors.onSurfaceVariant : '#fff' }]}>
            {dayjs(event.eventDate).format('DD')}
          </Text>
          <View>
            <Text style={{ color: isPast ? theme.colors.onSurfaceVariant : 'rgba(255,255,255,0.9)', fontWeight: '700', fontSize: 16 }}>
              {dayjs(event.eventDate).format('MMMM YYYY')}
            </Text>
            <Text style={{ color: isPast ? theme.colors.onSurfaceVariant : 'rgba(255,255,255,0.75)', fontSize: 13 }}>
              {dayjs(event.eventDate).format('dddd, hh:mm A')}
            </Text>
          </View>
        </View>
        {isPast && (
          <View style={styles.pastPill}>
            <Text style={{ fontSize: 11, fontWeight: '700', color: '#fff' }}>PAST EVENT</Text>
          </View>
        )}
        <Text variant="headlineSmall" style={[styles.titleText, { color: isPast ? theme.colors.onSurface : '#fff' }]}>
          {event.titleEn}
        </Text>
      </View>

      <View style={styles.body}>
        {/* Info Cards */}
        {event.location && (
          <Card style={styles.infoCard} mode="elevated">
            <Card.Content style={styles.infoRow}>
              <Text style={{ fontSize: 20 }}>📍</Text>
              <View>
                <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>Venue</Text>
                <Text variant="bodyLarge" style={{ fontWeight: '600' }}>{event.location}</Text>
              </View>
            </Card.Content>
          </Card>
        )}

        {/* Description */}
        {event.descriptionEn && (
          <>
            <Divider style={{ marginVertical: 16 }} />
            <Text variant="titleSmall" style={{ fontWeight: '700', color: theme.colors.primary, marginBottom: 12 }}>
              About this event
            </Text>
            <Text variant="bodyMedium" style={{ lineHeight: 24, color: theme.colors.onBackground }}>
              {event.descriptionEn}
            </Text>
          </>
        )}

        {/* Telugu Title */}
        {event.titleTe && (
          <>
            <Divider style={{ marginVertical: 16 }} />
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginBottom: 6 }}>
              తెలుగు శీర్షిక
            </Text>
            <Text variant="titleMedium" style={{ fontWeight: '700' }}>{event.titleTe}</Text>
          </>
        )}
        <View style={{ height: 40 }} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 20, paddingTop: 24, paddingBottom: 32 },
  dateBanner: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 16 },
  bigDay: { fontSize: 56, fontWeight: '900', lineHeight: 60 },
  pastPill: { alignSelf: 'flex-start', backgroundColor: 'rgba(0,0,0,0.25)', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, marginBottom: 10 },
  titleText: { fontWeight: '700', lineHeight: 30 },
  body: { padding: 16 },
  infoCard: { borderRadius: 12, marginBottom: 8 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
});
