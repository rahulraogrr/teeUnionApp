import React, { useState, useCallback } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import { Text, useTheme, ActivityIndicator } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { UpdatesStackParamList } from '../../../navigation/types';
import { useGetNewsQuery } from '../../../api/newsApi';
import { useGetEventsQuery } from '../../../api/eventsApi';
import { NewsArticle, UnionEvent } from '../../../types';
import dayjs from 'dayjs';

type NavProp = NativeStackNavigationProp<UpdatesStackParamList, 'UpdatesFeed'>;

type Tab = 'news' | 'events';

export default function UpdatesScreen() {
  const theme = useTheme();
  const navigation = useNavigation<NavProp>();
  const [activeTab, setActiveTab] = useState<Tab>('news');
  const [page, setPage] = useState(1);

  const { data: newsData, isLoading: newsLoading } = useGetNewsQuery(
    { page, limit: 20 },
    { skip: activeTab !== 'news' },
  );
  const { data: eventsData, isLoading: eventsLoading } = useGetEventsQuery(
    { page, limit: 20 },
    { skip: activeTab !== 'events' },
  );

  const handleTabChange = useCallback((tab: Tab) => {
    setActiveTab(tab);
    setPage(1);
  }, []);

  // ── News renderer ────────────────────────────────────────────────────────────
  const renderArticle = useCallback(
    ({ item, index }: { item: NewsArticle; index: number }) => {
      const isFirst = index === 0;
      return (
        <TouchableOpacity
          onPress={() =>
            navigation.navigate('NewsDetail', {
              articleId: item.id,
              title: item.titleEn,
            })
          }
          activeOpacity={0.8}
        >
          <View
            style={[
              isFirst ? styles.featuredCard : styles.articleCard,
              { backgroundColor: theme.colors.surface },
            ]}
          >
            {isFirst && (
              <View
                style={[
                  styles.featuredBanner,
                  { backgroundColor: theme.colors.primary },
                ]}
              >
                <Text style={styles.featuredLabel}>LATEST</Text>
              </View>
            )}
            <View style={isFirst ? styles.featuredContent : styles.articleContent}>
              <Text
                variant={isFirst ? 'titleLarge' : 'titleSmall'}
                numberOfLines={isFirst ? 3 : 2}
                style={{ fontWeight: '700', lineHeight: isFirst ? 28 : 20 }}
              >
                {item.titleEn}
              </Text>
              {item.titleTe && (
                <Text
                  variant="bodySmall"
                  numberOfLines={1}
                  style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}
                >
                  {item.titleTe}
                </Text>
              )}
              <Text
                variant="bodySmall"
                style={{ color: theme.colors.onSurfaceVariant, marginTop: 8 }}
              >
                📅 {dayjs(item.createdAt).format('DD MMMM YYYY')}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      );
    },
    [theme, navigation],
  );

  // ── Event renderer ───────────────────────────────────────────────────────────
  const renderEvent = useCallback(
    ({ item }: { item: UnionEvent }) => {
      const isPast = dayjs(item.eventDate).isBefore(dayjs());
      return (
        <TouchableOpacity
          onPress={() =>
            navigation.navigate('EventDetail', {
              eventId: item.id,
              title: item.titleEn,
            })
          }
          activeOpacity={0.8}
        >
          <View
            style={[
              styles.eventCard,
              {
                backgroundColor: theme.colors.surface,
                opacity: isPast ? 0.65 : 1,
              },
            ]}
          >
            <View
              style={[
                styles.dateCol,
                {
                  backgroundColor: isPast
                    ? theme.colors.surfaceVariant
                    : theme.colors.primaryContainer,
                },
              ]}
            >
              <Text
                style={[
                  styles.dateDay,
                  {
                    color: isPast
                      ? theme.colors.onSurfaceVariant
                      : theme.colors.primary,
                  },
                ]}
              >
                {dayjs(item.eventDate).format('DD')}
              </Text>
              <Text
                style={[
                  styles.dateMonth,
                  {
                    color: isPast
                      ? theme.colors.onSurfaceVariant
                      : theme.colors.primary,
                  },
                ]}
              >
                {dayjs(item.eventDate).format('MMM').toUpperCase()}
              </Text>
              <Text
                style={[styles.dateYear, { color: theme.colors.onSurfaceVariant }]}
              >
                {dayjs(item.eventDate).format('YYYY')}
              </Text>
            </View>
            <View style={styles.eventContent}>
              {isPast && (
                <View style={styles.pastBadge}>
                  <Text style={{ fontSize: 10, color: theme.colors.onSurfaceVariant }}>
                    PAST
                  </Text>
                </View>
              )}
              <Text
                variant="bodyLarge"
                numberOfLines={2}
                style={{ fontWeight: '700', lineHeight: 22 }}
              >
                {item.titleEn}
              </Text>
              {item.titleTe && (
                <Text
                  variant="bodySmall"
                  numberOfLines={1}
                  style={{ color: theme.colors.onSurfaceVariant, marginTop: 2 }}
                >
                  {item.titleTe}
                </Text>
              )}
              {item.location && (
                <Text
                  variant="bodySmall"
                  style={{
                    color: theme.colors.secondary,
                    marginTop: 6,
                    fontWeight: '500',
                  }}
                >
                  📍 {item.location}
                </Text>
              )}
              <Text
                variant="bodySmall"
                style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}
              >
                🕐 {dayjs(item.eventDate).format('hh:mm A')}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      );
    },
    [theme, navigation],
  );

  const handleEndReached = useCallback(() => {
    const total =
      activeTab === 'news' ? newsData?.total : eventsData?.total;
    if (total && page * 20 < total) setPage(p => p + 1);
  }, [activeTab, newsData, eventsData, page]);

  const isLoading = activeTab === 'news' ? newsLoading : eventsLoading;
  const listData =
    activeTab === 'news'
      ? (newsData?.data ?? [])
      : (eventsData?.data ?? []);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Toggle */}
      <View style={[styles.toggleBar, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.outlineVariant }]}>
        {(['news', 'events'] as Tab[]).map(tab => (
          <Pressable
            key={tab}
            style={[
              styles.toggleBtn,
              activeTab === tab && [
                styles.toggleBtnActive,
                { borderBottomColor: theme.colors.primary },
              ],
            ]}
            onPress={() => handleTabChange(tab)}
          >
            <Text
              style={[
                styles.toggleLabel,
                {
                  color:
                    activeTab === tab
                      ? theme.colors.primary
                      : theme.colors.onSurfaceVariant,
                  fontWeight: activeTab === tab ? '700' : '400',
                },
              ]}
            >
              {tab === 'news' ? '📰 News' : '📅 Events'}
            </Text>
          </Pressable>
        ))}
      </View>

      {isLoading ? (
        <ActivityIndicator style={{ flex: 1, marginTop: 48 }} />
      ) : (
        <FlatList
          key={activeTab}
          data={listData as any[]}
          keyExtractor={(item: any) => item.id}
          renderItem={
            activeTab === 'news'
              ? (renderArticle as any)
              : (renderEvent as any)
          }
          contentContainerStyle={styles.list}
          initialNumToRender={10}
          maxToRenderPerBatch={8}
          windowSize={7}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.5}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text
                variant="bodyLarge"
                style={{ color: theme.colors.onSurfaceVariant }}
              >
                {activeTab === 'news'
                  ? 'No news articles yet.'
                  : 'No events scheduled.'}
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  toggleBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  toggleBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  toggleBtnActive: {},
  toggleLabel: { fontSize: 14 },
  list: { padding: 12, gap: 10 },
  // News styles
  featuredCard: { borderRadius: 16, overflow: 'hidden', elevation: 3, marginBottom: 4 },
  featuredBanner: { paddingHorizontal: 14, paddingVertical: 6 },
  featuredLabel: { color: '#fff', fontSize: 11, fontWeight: '700', letterSpacing: 1.5 },
  featuredContent: { padding: 16 },
  articleCard: { borderRadius: 12, overflow: 'hidden', elevation: 1 },
  articleContent: { padding: 14, flexDirection: 'row', alignItems: 'center' },
  // Event styles
  eventCard: { borderRadius: 14, flexDirection: 'row', overflow: 'hidden', elevation: 2 },
  dateCol: { width: 64, alignItems: 'center', justifyContent: 'center', padding: 12 },
  dateDay: { fontSize: 26, fontWeight: '800', lineHeight: 30 },
  dateMonth: { fontSize: 12, fontWeight: '700', marginTop: 2 },
  dateYear: { fontSize: 10, marginTop: 2 },
  eventContent: { flex: 1, padding: 14 },
  pastBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#eee',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginBottom: 6,
  },
  empty: { alignItems: 'center', marginTop: 80 },
});
