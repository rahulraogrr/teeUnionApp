import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Text, useTheme, ActivityIndicator, Divider } from 'react-native-paper';
import { RouteProp, useRoute } from '@react-navigation/native';
import { NewsStackParamList } from '../../../navigation/types';
import { useGetNewsByIdQuery } from '../../../api/newsApi';
import dayjs from 'dayjs';

type RouteP = RouteProp<NewsStackParamList, 'NewsDetail'>;

export default function NewsDetailScreen() {
  const theme = useTheme();
  const { params } = useRoute<RouteP>();
  const { data: article, isLoading } = useGetNewsByIdQuery(params.articleId);

  if (isLoading) return <ActivityIndicator style={{ flex: 1, marginTop: 48 }} />;
  if (!article) return null;

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
        <Text variant="bodySmall" style={{ color: 'rgba(255,255,255,0.8)' }}>
          Union News · {dayjs(article.createdAt).format('DD MMMM YYYY')}
        </Text>
        <Text variant="headlineSmall" style={styles.title}>{article.titleEn}</Text>
        {article.titleTe && (
          <Text variant="bodyMedium" style={{ color: 'rgba(255,255,255,0.85)', marginTop: 6 }}>
            {article.titleTe}
          </Text>
        )}
      </View>

      <View style={styles.body}>
        {/* English body */}
        <Text variant="titleSmall" style={{ fontWeight: '700', color: theme.colors.primary, marginBottom: 12 }}>
          English
        </Text>
        <Text variant="bodyMedium" style={[styles.bodyText, { color: theme.colors.onBackground }]}>
          {article.bodyEn}
        </Text>

        {/* Telugu body */}
        {article.bodyTe && (
          <>
            <Divider style={{ marginVertical: 24 }} />
            <Text variant="titleSmall" style={{ fontWeight: '700', color: theme.colors.primary, marginBottom: 12 }}>
              తెలుగు (Telugu)
            </Text>
            <Text variant="bodyMedium" style={[styles.bodyText, { color: theme.colors.onBackground }]}>
              {article.bodyTe}
            </Text>
          </>
        )}

        <View style={{ height: 40 }} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 20, paddingTop: 24, paddingBottom: 28 },
  title: { color: '#fff', fontWeight: '700', marginTop: 8, lineHeight: 30 },
  body: { padding: 20 },
  bodyText: { lineHeight: 26, fontSize: 15 },
});
