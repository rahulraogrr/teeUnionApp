import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NewsStackParamList } from './types';
import NewsFeedScreen from '../features/news/screens/NewsFeedScreen';
import NewsDetailScreen from '../features/news/screens/NewsDetailScreen';

const Stack = createNativeStackNavigator<NewsStackParamList>();

export default function NewsNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="NewsFeed" component={NewsFeedScreen} options={{ title: 'News' }} />
      <Stack.Screen name="NewsDetail" component={NewsDetailScreen} options={{ title: 'Article' }} />
    </Stack.Navigator>
  );
}
