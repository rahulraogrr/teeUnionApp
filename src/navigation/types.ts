import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';

// ─── Auth Stack ───────────────────────────────────────────────────────────────
export type AuthStackParamList = {
  Login: undefined;
  ChangePin: undefined;
};

// ─── Main Tab ─────────────────────────────────────────────────────────────────
export type MainTabParamList = {
  HomeTab: undefined;
  TicketsTab: undefined;
  UpdatesTab: undefined;
  ProfileTab: undefined;
};

// ─── Home Stack ──────────────────────────────────────────────────────────────
export type HomeStackParamList = {
  Home: undefined;
  Notifications: undefined;
};

// ─── Tickets Stack ───────────────────────────────────────────────────────────
export type TicketsStackParamList = {
  TicketsHome: undefined;
  TicketsList: { initialStatus?: string } | undefined;
  TicketDetail: { ticketId: string };
  CreateTicket: undefined;
};

// ─── News Stack ──────────────────────────────────────────────────────────────
export type NewsStackParamList = {
  NewsFeed: undefined;
  NewsDetail: { articleId: string; title: string };
};

// ─── Events Stack ────────────────────────────────────────────────────────────
export type EventsStackParamList = {
  EventsList: undefined;
  EventDetail: { eventId: string; title: string };
};

// ─── Updates Stack (News + Events combined) ───────────────────────────────────
export type UpdatesStackParamList = {
  UpdatesFeed: undefined;
  NewsDetail: { articleId: string; title: string };
  EventDetail: { eventId: string; title: string };
};

// ─── Profile Stack ───────────────────────────────────────────────────────────
export type ProfileStackParamList = {
  Profile: undefined;
  EditProfile: undefined;
};

// ─── Root ─────────────────────────────────────────────────────────────────────
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

// Navigation prop helpers
export type AuthNavProp = NativeStackNavigationProp<AuthStackParamList>;
export type MainTabNavProp = BottomTabNavigationProp<MainTabParamList>;
