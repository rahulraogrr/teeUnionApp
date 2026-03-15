import React, { useState, useCallback } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, useTheme, ActivityIndicator } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { NewsStackParamList } from '../../../navigation/types';
import { useGetNewsQuery } from '../../../api/newsApi';
import { NewsArticle } from '../../../types';
import dayjs from 'dayjs';

type NavProp = NativeStackNavigationProp<NewsStackParamList, 'NewsFeed'>;

export default function NewsFeedScreen() {
  const theme = useTheme();
  const navigation = useNavigation<NavProp>();
  const [page, setPage] = useState(1);
  const { data, isLoading } = useGetNewsQuery({ page, limit: 20 });

  const renderArticle = useCallback(({ item, index }: { item: NewsArticle; index: number }) => {
    const isFirst = index === 0;
    return (
      <TouchableOpacity
        onPress={() => navigation.navigate('NewsDetail', { articleId: item.id, title: item.titleEn })}
        activeOpacity={0.8}
      >
        <View style={[
          isFirst ? styles.featuredCard : styles.articleCard,
          { backgroundColor: theme.colors.surface }
        ]}>
          {isFirst && (
            <View style={[styles.featuredBanner, { backgroundColor: theme.colors.primary }]}>
              <Text style={styles.featuredLabel}>LATEST</Text>
            </View>
          )}
          <View style={isFirst ? styles.featuredContent : styles.articleContent}>
            <Text variant={isFirst ? 'titleLarge' : 'titleSmall'}
              numberOfLines={isFirst ? 3 : 2}
              style={{ fontWeight: '700', lineHeight: isFirst ? 28 : 20 }}>
              {item.titleEn}
            </Text>
            {item.titleTe && (
              <Text variant="bodySmall" numberOfLines={1}
                style={{ color: theme.colors.onSurfaceVariant, marginTop: 4 }}>
                {item.titleTe}
              </Text>
            )}
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 8 }}>
              📅 {dayjs(item.createdAt).format('DD MMMM YYYY')}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }, [theme, navigation]);

  const handleEndReached = useCallback(() => {
    if (data && page * 20 < data.total) setPage(p => p + 1);
  }, [data, page]);

  if (isLoading) return <ActivityIndicator style={{ flex: 1, marginTop: 48 }} />;

  return (
    <FlatList
      style={{ backgroundColor: theme.colors.background }}
      data={data?.data ?? []}
      keyExtractor={(a) => a.id}
      renderItem={renderArticle}
      contentContainerStyle={styles.list}
      initialNumToRender={10}
      maxToRenderPerBatch={8}
      windowSize={7}
      ListEmptyComponent={
        <View style={styles.empty}>
          <Text variant="bodyLarge" style={{ color: theme.colors.onSurfaceVariant }}>
            No news articles yet.
          </Text>
        </View>
      }
      onEndReached={handleEndReached}
      onEndReachedThreshold={0.5}
    />
  );
}

const styles = StyleSheet.create({
  list: { padding: 12, gap: 10 },
  featuredCard: { borderRadius: 16, overflow: 'hidden', elevation: 3, marginBottom: 4 },
  featuredBanner: { paddingHorizontal: 14, paddingVertical: 6 },
  featuredLabel: { color: '#fff', fontSize: 11, fontWeight: '700', letterSpacing: 1.5 },
  featuredContent: { padding: 16 },
  articleCard: { borderRadius: 12, overflow: 'hidden', elevation: 1 },
  articleContent: { padding: 14, flexDirection: 'row', alignItems: 'center' },
  empty: { alignItems: 'center', marginTop: 80 },
});
