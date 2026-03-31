import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { UpdatesStackParamList } from './types';
import UpdatesScreen from '../features/updates/screens/UpdatesScreen';
import NewsDetailScreen from '../features/news/screens/NewsDetailScreen';
import EventDetailScreen from '../features/events/screens/EventDetailScreen';

const Stack = createNativeStackNavigator<UpdatesStackParamList>();

export default function UpdatesNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="UpdatesFeed"
        component={UpdatesScreen}
        options={{ title: 'Updates' }}
      />
      <Stack.Screen
        name="NewsDetail"
        component={NewsDetailScreen}
        options={{ title: 'Article' }}
      />
      <Stack.Screen
        name="EventDetail"
        component={EventDetailScreen}
        options={{ title: 'Event Details' }}
      />
    </Stack.Navigator>
  );
}
