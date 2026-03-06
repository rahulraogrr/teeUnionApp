import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { EventsStackParamList } from './types';
import EventsListScreen from '../features/events/screens/EventsListScreen';
import EventDetailScreen from '../features/events/screens/EventDetailScreen';

const Stack = createNativeStackNavigator<EventsStackParamList>();

export default function EventsNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="EventsList" component={EventsListScreen} options={{ title: 'Events' }} />
      <Stack.Screen name="EventDetail" component={EventDetailScreen} options={{ title: 'Event Details' }} />
    </Stack.Navigator>
  );
}
