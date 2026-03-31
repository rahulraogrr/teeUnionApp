import React, { useCallback } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { MainTabParamList } from './types';
import { useGetUnreadCountQuery } from '../api/notificationsApi';
import HomeNavigator from './HomeNavigator';
import TicketsNavigator from './TicketsNavigator';
import UpdatesNavigator from './UpdatesNavigator';
import ProfileNavigator from './ProfileNavigator';
import { useTheme } from 'react-native-paper';

const Tab = createBottomTabNavigator<MainTabParamList>();

// Tab icon map kept outside component to avoid re-creation
const TAB_ICONS: Record<string, string> = {
  HomeTab:    'home',
  TicketsTab: 'ticket-outline',
  UpdatesTab: 'newspaper-variant-outline',
  ProfileTab: 'account-circle-outline',
};

export default function MainNavigator() {
  const theme = useTheme();

  // Poll unread count every 30 s; pause when app is backgrounded
  const { data: unreadData } = useGetUnreadCountQuery(undefined, {
    pollingInterval: 30_000,
    skipPollingIfUnfocused: true,
  });

  // Memoize screenOptions to avoid creating new objects on every render
  const screenOptions = useCallback(
    ({ route }: { route: { name: string } }) => ({
      headerShown: false,
      tabBarActiveTintColor: theme.colors.primary,
      tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
      tabBarStyle: {
        backgroundColor: theme.colors.surface,
        borderTopColor: theme.colors.outlineVariant,
        elevation: 8,
      },
      tabBarIcon: ({ color, size }: { color: string; size: number }) => (
        <Icon name={TAB_ICONS[route.name] ?? 'circle'} size={size} color={color} />
      ),
    }),
    [theme],
  );

  return (
    <Tab.Navigator screenOptions={screenOptions}>
      <Tab.Screen
        name="HomeTab"
        component={HomeNavigator}
        options={{ title: 'Home', tabBarBadge: unreadData?.count ? unreadData.count : undefined }}
      />
      <Tab.Screen name="TicketsTab"  component={TicketsNavigator}  options={{ title: 'Tickets' }} />
      <Tab.Screen name="UpdatesTab"  component={UpdatesNavigator}  options={{ title: 'Updates' }} />
      <Tab.Screen name="ProfileTab"  component={ProfileNavigator}  options={{ title: 'Profile' }} />
    </Tab.Navigator>
  );
}
