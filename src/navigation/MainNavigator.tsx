import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { MainTabParamList } from './types';
import { useGetUnreadCountQuery } from '../api/notificationsApi';
import HomeNavigator from './HomeNavigator';
import TicketsNavigator from './TicketsNavigator';
import NewsNavigator from './NewsNavigator';
import EventsNavigator from './EventsNavigator';
import ProfileNavigator from './ProfileNavigator';
import { useTheme } from 'react-native-paper';

const Tab = createBottomTabNavigator<MainTabParamList>();

export default function MainNavigator() {
  const theme = useTheme();
  const { data: unreadData } = useGetUnreadCountQuery();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.outlineVariant,
          elevation: 8,
        },
        tabBarIcon: ({ color, size }) => {
          const icons: Record<string, string> = {
            HomeTab: 'home',
            TicketsTab: 'ticket-outline',
            NewsTab: 'newspaper',
            EventsTab: 'calendar-month',
            ProfileTab: 'account-circle-outline',
          };
          return <Icon name={icons[route.name] ?? 'circle'} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="HomeTab" component={HomeNavigator} options={{ title: 'Home', tabBarBadge: unreadData?.count ? unreadData.count : undefined }} />
      <Tab.Screen name="TicketsTab" component={TicketsNavigator} options={{ title: 'Tickets' }} />
      <Tab.Screen name="NewsTab" component={NewsNavigator} options={{ title: 'News' }} />
      <Tab.Screen name="EventsTab" component={EventsNavigator} options={{ title: 'Events' }} />
      <Tab.Screen name="ProfileTab" component={ProfileNavigator} options={{ title: 'Profile' }} />
    </Tab.Navigator>
  );
}
